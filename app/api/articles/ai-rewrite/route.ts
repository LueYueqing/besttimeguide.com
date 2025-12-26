import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const prisma = new PrismaClient()

// 初始化 AI 客户端（支持 DeepSeek 和 OpenAI）
const getAIClient = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || ''
  const baseURL = process.env.DEEPSEEK_API_KEY
    ? 'https://api.deepseek.com' // DeepSeek API 端点
    : undefined // OpenAI 使用默认端点

  return new OpenAI({
    apiKey,
    baseURL,
  })
}

const aiClient = getAIClient()

// 检查是否为管理员
async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  return user?.isAdmin ? userId : null
}

// AI 改写 Prompt（固定）
const AI_REWRITE_PROMPT = `你是一位专业的内容编辑和 SEO 专家。
请将以下参考内容改写为一篇高质量、SEO 友好的文章，
严格遵循 Google 的 E-E-A-T 原则，并以搜索意图为核心进行结构优化。

在开始写作前，请隐式识别该主题的主要搜索意图
（Informational / Commercial / Transactional），
并围绕该意图组织全文内容。

## E-E-A-T 原则要求

### Experience（经验）
- 融入真实、可泛化的实践经验
- 使用"基于实际使用经验""根据常见行业实践"等安全表达
- 不得虚构具体人物、机构、研究或个人经历

### Expertise（专业性）
- 使用准确术语和行业通用概念
- 提供深入但通俗的专业解释
- 结合最佳实践和成熟方法论

### Authoritativeness（权威性）
- 体现对行业现状和趋势的理解
- 如引用观点，请使用"行业普遍认为""多数研究表明"等稳健表述
- 保持专业、自信、克制的语气

### Trustworthiness（可信度）
- 信息需逻辑自洽、可验证
- 避免绝对化、夸张表述
- 必要时说明适用范围或局限性

## SEO 与结构要求
1. H1 必须自然包含主关键词
2. 开头 120 字内直接回答搜索者的核心问题
3. 使用清晰的 H2 / H3 结构覆盖主要子问题
4. 合理自然融入相关关键词和同义词，避免堆砌
5. 内容需明显优于原文，而非简单改写

## 写作要求
- 使用 Markdown 格式
- 语言清晰、流畅、易读
- 在保持原文核心观点的前提下补充实用信息
- 可加入常见问题、注意事项或操作建议
- 不输出任何解释或写作说明

如果原文为中文，请用中文输出；
如果原文为英文，请用英文输出。

请直接输出最终改写后的文章内容（Markdown 格式）。`

// 计算阅读时间
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// GET - 获取待改写的文章列表
export async function GET(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 查询所有待改写的文章
    const articles = await prisma.article.findMany({
      where: {
        aiRewriteStatus: 'pending',
        sourceContent: {
          not: null,
        },
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        aiRewriteAt: 'asc', // 按改写时间排序，最早的最先处理
      },
    })

    return NextResponse.json({
      success: true,
      count: articles.length,
      articles: articles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category.name,
        sourceContentLength: article.sourceContent?.length || 0,
        aiRewriteAt: article.aiRewriteAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching articles for AI rewrite:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 处理 AI 改写
export async function POST(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 检查 AI API Key
    if (!process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI API key not configured (DEEPSEEK_API_KEY or OPENAI_API_KEY)' },
        { status: 500 }
      )
    }

    // 获取请求参数（可选：指定文章 ID，如果不指定则处理所有待改写文章）
    const body = await request.json().catch(() => ({}))
    const articleId = body.articleId ? parseInt(body.articleId, 10) : null

    // 查询待改写的文章
    const where: any = {
      aiRewriteStatus: 'pending',
      sourceContent: {
        not: null,
      },
    }

    if (articleId) {
      where.id = articleId
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        aiRewriteAt: 'asc',
      },
      take: articleId ? 1 : 10, // 如果指定了 ID，只处理一篇；否则最多处理 10 篇
    })

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No articles pending AI rewrite',
        processed: 0,
      })
    }

    const results = []

    // 处理每篇文章
    for (const article of articles) {
      try {
        // 更新状态为处理中
        await prisma.article.update({
          where: { id: article.id },
          data: {
            aiRewriteStatus: 'processing',
          },
        })

        // 调用 AI API 进行改写
        const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'
        const completion = await aiClient.chat.completions.create({
          model, // DeepSeek 使用 'deepseek-chat'，OpenAI 使用 'gpt-4o-mini'
          messages: [
            {
              role: 'system',
              content: AI_REWRITE_PROMPT,
            },
            {
              role: 'user',
              content: article.sourceContent || '',
            },
          ],
          temperature: 0.7,
          max_tokens: 4000, // 根据需求调整
        })

        const rewrittenContent = completion.choices[0]?.message?.content || ''

        if (!rewrittenContent) {
          throw new Error('AI returned empty content')
        }

        // 计算阅读时间
        const readingTime = calculateReadingTime(rewrittenContent)

        // 更新文章：保存改写后的内容，更新状态，设置为已发布
        const updatedArticle = await prisma.article.update({
          where: { id: article.id },
          data: {
            content: rewrittenContent,
            aiRewriteStatus: 'completed',
            aiRewriteAt: new Date(),
            readingTime,
            published: true, // 设置为已发布
            publishedAt: new Date(), // 设置发布时间
          },
          include: {
            category: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })

        results.push({
          id: article.id,
          title: article.title,
          status: 'success',
          contentLength: rewrittenContent.length,
        })
      } catch (error: any) {
        console.error(`Error processing article ${article.id}:`, error)

        // 更新状态为失败
        await prisma.article.update({
          where: { id: article.id },
          data: {
            aiRewriteStatus: 'failed',
            aiRewriteAt: new Date(),
          },
        })

        results.push({
          id: article.id,
          title: article.title,
          status: 'failed',
          error: error.message || 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length
    const failedCount = results.filter((r) => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Processed ${articles.length} article(s)`,
      processed: articles.length,
      success: successCount,
      failed: failedCount,
      results,
    })
  } catch (error: any) {
    console.error('Error processing AI rewrite:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

