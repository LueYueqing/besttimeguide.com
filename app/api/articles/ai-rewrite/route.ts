import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { uploadImagesToR2 } from '@/lib/r2'

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

## 语言要求
- 不论原文是中文还是英文，改写后的文章都使用英文而且要符合美国当地英语的语法和表达方式，不要使用中文。

请直接输出最终改写后的文章内容（Markdown 格式）。`

// 计算阅读时间
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// 图片信息接口
interface ImageInfo {
  markdown: string // 完整的 Markdown 图片语法
  alt: string // alt 文本
  url: string // 图片 URL
  placeholder: string // 占位符，如 [IMAGE_1]
}

// 提取所有图片并记录信息
function extractImages(content: string): { images: ImageInfo[]; processedContent: string } {
  // Markdown 图片语法：![alt text](url) 或 ![alt text](url "title")
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"[^"]*")?\)/g
  const images: ImageInfo[] = []
  let match
  let imageIndex = 0

  // 找到所有图片
  const matches: Array<{ match: string; index: number; alt: string; url: string }> = []
  while ((match = imageRegex.exec(content)) !== null) {
    matches.push({
      match: match[0],
      index: match.index,
      alt: match[1] || '',
      url: match[2] || '',
    })
  }

  // 按位置排序（从后往前替换，避免索引偏移）
  matches.sort((a, b) => b.index - a.index)

  // 创建处理后的内容
  let processedContent = content

  // 从后往前替换，避免索引偏移问题
  for (const { match, alt, url } of matches) {
    imageIndex++
    const placeholder = `[IMAGE_${imageIndex}]`
    
    images.unshift({
      // unshift 保持顺序（因为我们是倒序处理的）
      markdown: match,
      alt,
      url,
      placeholder,
    })

    // 替换图片为占位符
    processedContent = processedContent.substring(0, processedContent.lastIndexOf(match)) +
      placeholder +
      processedContent.substring(processedContent.lastIndexOf(match) + match.length)
  }

  return { images, processedContent }
}

// 在改写后的内容中插入图片
function insertImages(rewrittenContent: string, images: ImageInfo[]): string {
  if (images.length === 0) {
    return rewrittenContent
  }

  let result = rewrittenContent

  // 策略1：查找占位符并替换
  for (const image of images) {
    if (result.includes(image.placeholder)) {
      // 如果占位符还在，直接替换
      result = result.replace(image.placeholder, image.markdown)
    }
  }

  // 策略2：如果还有未插入的图片，尝试智能插入
  const remainingImages = images.filter((img) => !result.includes(img.markdown))
  
  if (remainingImages.length > 0) {
    // 按段落结构插入图片
    const lines = result.split('\n')
    const newLines: string[] = []
    let imageIndex = 0

    for (let i = 0; i < lines.length; i++) {
      newLines.push(lines[i])

      // 在 H2 或 H3 标题后插入图片（如果还有未插入的图片）
      if (
        imageIndex < remainingImages.length &&
        (lines[i].startsWith('## ') || lines[i].startsWith('### ')) &&
        i + 1 < lines.length &&
        !lines[i + 1].trim().startsWith('![') // 确保下一行不是图片
      ) {
        // 在标题后插入一个空行和图片
        newLines.push('')
        newLines.push(remainingImages[imageIndex].markdown)
        newLines.push('')
        imageIndex++
      }
    }

    // 如果还有未插入的图片，在文章末尾添加
    if (imageIndex < remainingImages.length) {
      newLines.push('')
      newLines.push('---')
      newLines.push('')
      for (let i = imageIndex; i < remainingImages.length; i++) {
        newLines.push(remainingImages[i].markdown)
        newLines.push('')
      }
    }

    result = newLines.join('\n')
  }

  return result
}

// GET - 直接执行 AI 改写（处理所有待改写文章）
export async function GET(request: NextRequest) {
  try {
    // 暂时不需要认证（可通过环境变量控制）
    // const adminId = await checkAdmin()
    // if (!adminId) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    // }

    // 检查 AI API Key
    if (!process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI API key not configured (DEEPSEEK_API_KEY or OPENAI_API_KEY)' },
        { status: 500 }
      )
    }

    // 获取请求参数（可选：指定文章 ID）
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId') ? parseInt(searchParams.get('articleId')!, 10) : null
    // 如果指定了 articleId，表示是手动触发，应该跳过冷却期检查
    const isManualRequest = articleId !== null

    // 配置：最大内容长度和重试限制
    const MAX_CONTENT_LENGTH = 50000 // 最大内容长度（字符数），超过此长度直接跳过
    const MAX_RETRY_HOURS = 24 // 失败后24小时内不再自动重试（仅适用于批量处理）

    // 查询待改写的文章
    // 排除最近失败的文章（避免反复尝试失败的文章）
    // 注意：如果是手动指定文章ID，不应用冷却期限制
    const excludeRecentFailures = new Date()
    excludeRecentFailures.setHours(excludeRecentFailures.getHours() - MAX_RETRY_HOURS)

    const where: any = {
      aiRewriteStatus: 'pending',
      sourceContent: {
        not: null,
      },
      // 排除最近失败的文章：如果 aiRewriteAt 在最近24小时内，说明可能刚失败过
      // 但这里我们只查询 pending 状态，所以不会包含 failed 状态
      // 这个逻辑主要用于防止用户重新标记为 pending 后立即重试
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
      const sourceContent = article.sourceContent || ''
      
      try {
        // 检查内容长度，如果太长则直接跳过（避免处理失败）
        if (sourceContent.length > MAX_CONTENT_LENGTH) {
          console.warn(`[AI Rewrite] Article ${article.id} "${article.title}" content too long (${sourceContent.length} chars, max ${MAX_CONTENT_LENGTH}), skipping to avoid failure`)
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
            status: 'skipped',
            error: `Content too long (${sourceContent.length} chars, max ${MAX_CONTENT_LENGTH}). Please split the content or reduce its length.`,
          })
          continue
        }

        // 检查是否最近失败过（如果 aiRewriteAt 在最近24小时内，可能是刚失败过）
        // 注意：如果是手动指定文章ID，跳过冷却期检查，允许立即处理
        if (!isManualRequest && article.aiRewriteAt && article.aiRewriteAt > excludeRecentFailures) {
          console.warn(`[AI Rewrite] Article ${article.id} "${article.title}" was recently processed (${article.aiRewriteAt.toISOString()}), skipping to avoid repeated failures`)
          results.push({
            id: article.id,
            title: article.title,
            status: 'skipped',
            error: `Recently processed. Please wait ${MAX_RETRY_HOURS} hours before retrying, or specify articleId to force processing.`,
          })
          continue
        }

        // 更新状态为处理中，并设置处理时间
        await prisma.article.update({
          where: { id: article.id },
          data: {
            aiRewriteStatus: 'processing',
            aiRewriteAt: new Date(), // 开始处理时设置时间
          },
        })

        // 预处理：提取图片
        const { images, processedContent } = extractImages(sourceContent)

        // 上传图片到 R2（如果有图片）
        // 注意：会自动跳过已经是 R2 URL 的图片，避免重复上传
        const imageUrlMap = new Map<string, string>()
        if (images.length > 0) {
          try {
            console.log(`[AI Rewrite] Processing ${images.length} images to R2...`)
            
            const uploadResults = await uploadImagesToR2(
              images.map((img) => ({ url: img.url, alt: img.alt }))
            )
            uploadResults.forEach((newUrl, oldUrl) => {
              imageUrlMap.set(oldUrl, newUrl)
            })
            
            console.log(`[AI Rewrite] Successfully processed ${imageUrlMap.size} images (duplicates automatically skipped)`)
          } catch (error) {
            console.error('[AI Rewrite] Error uploading images to R2:', error)
            // 如果上传失败，继续使用原 URL
          }
        }

        // 更新图片 URL（如果已上传到 R2）
        const updatedImages = images.map((img) => {
          const newUrl = imageUrlMap.get(img.url) || img.url
          return {
            ...img,
            url: newUrl,
            markdown: `![${img.alt}](${newUrl})`,
          }
        })

        // 在提示词中添加图片占位符说明（如果有图片）
        let enhancedPrompt = AI_REWRITE_PROMPT
        if (updatedImages.length > 0) {
          enhancedPrompt += `\n\n## 图片处理说明\n原文中包含 ${updatedImages.length} 张图片，已用占位符 [IMAGE_1], [IMAGE_2] 等标记。请在改写时保留这些占位符，它们将在后处理阶段被替换为实际图片。`
        }

        // 调用 AI API 进行改写
        const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'
        const completion = await aiClient.chat.completions.create({
          model, // DeepSeek 使用 'deepseek-chat'，OpenAI 使用 'gpt-4o-mini'
          messages: [
            {
              role: 'system',
              content: enhancedPrompt,
            },
            {
              role: 'user',
              content: processedContent, // 使用处理后的内容（图片已替换为占位符）
            },
          ],
          temperature: 0.7,
          max_tokens: 4000, // 根据需求调整
        })

        let rewrittenContent = completion.choices[0]?.message?.content || ''

        if (!rewrittenContent) {
          throw new Error('AI returned empty content')
        }

        // 后处理：插入图片（使用更新后的 URL）
        if (updatedImages.length > 0) {
          rewrittenContent = insertImages(rewrittenContent, updatedImages)
        }

        // 计算阅读时间
        const readingTime = calculateReadingTime(rewrittenContent)

        // 更新 sourceContent 中的图片 URL 为 R2 URL（避免下次改写时重复上传）
        let updatedSourceContent = sourceContent
        if (imageUrlMap.size > 0) {
          for (const [oldUrl, newUrl] of imageUrlMap.entries()) {
            // 替换 sourceContent 中的第三方图片 URL 为 R2 URL
            updatedSourceContent = updatedSourceContent.replace(oldUrl, newUrl)
          }
          console.log(`[AI Rewrite] Updated sourceContent with R2 image URLs to avoid duplicate uploads`)
        }

        // 更新文章：保存改写后的内容，更新 sourceContent（图片 URL 已替换为 R2），更新状态，设置为已发布
        const updatedArticle = await prisma.article.update({
          where: { id: article.id },
          data: {
            content: rewrittenContent,
            sourceContent: updatedSourceContent, // 更新 sourceContent，将图片 URL 替换为 R2 URL
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

        // 触发页面重新生成（主动清除缓存）
        try {
          // 方法1: 通过路径重新验证
          const revalidateUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate?path=/${article.slug}&secret=${process.env.REVALIDATE_SECRET || ''}`
          await fetch(revalidateUrl, { method: 'POST' })
          
          // 方法2: 通过 cache tag 重新验证（更精确）
          const tagUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate?tag=article-${article.slug}&secret=${process.env.REVALIDATE_SECRET || ''}`
          await fetch(tagUrl, { method: 'POST' })
          
          console.log(`[AI Rewrite] Revalidated page: /${article.slug}`)
        } catch (revalidateError) {
          console.error('[AI Rewrite] Error revalidating page:', revalidateError)
          // 不阻止流程，即使 revalidate 失败
        }

        results.push({
          id: article.id,
          title: article.title,
          status: 'success',
          contentLength: rewrittenContent.length,
        })
      } catch (error: any) {
        console.error(`Error processing article ${article.id}:`, error)

        const errorMessage = error.message || 'Unknown error'
        
        // 检查是否是内容相关错误（内容太长、格式问题等）
        const isContentError = 
          errorMessage.includes('too long') ||
          errorMessage.includes('token') ||
          errorMessage.includes('length') ||
          errorMessage.includes('empty') ||
          sourceContent.length > 30000 // 如果内容超过30000字符，很可能是内容问题

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
          error: errorMessage,
          skipped: isContentError, // 标记为因内容问题跳过，避免重复尝试
        })
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length
    const failedCount = results.filter((r) => r.status === 'failed').length
    const skippedCount = results.filter((r) => r.status === 'skipped').length

    return NextResponse.json({
      success: true,
      message: `Processed ${articles.length} article(s)`,
      processed: articles.length,
      success: successCount,
      failed: failedCount,
      skipped: skippedCount,
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

// POST - 处理 AI 改写
export async function POST(request: NextRequest) {
  try {
    // 暂时不需要认证（可通过环境变量控制）
    // const adminId = await checkAdmin()
    // if (!adminId) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    // }

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
    // 如果指定了 articleId，表示是手动触发，应该跳过冷却期检查
    const isManualRequest = articleId !== null

    // 配置：最大内容长度和重试限制
    const MAX_CONTENT_LENGTH = 50000 // 最大内容长度（字符数），超过此长度直接跳过
    const MAX_RETRY_HOURS = 24 // 失败后24小时内不再自动重试（仅适用于批量处理）

    // 查询待改写的文章
    // 排除最近失败的文章（避免反复尝试失败的文章）
    // 注意：如果是手动指定文章ID，不应用冷却期限制
    const excludeRecentFailures = new Date()
    excludeRecentFailures.setHours(excludeRecentFailures.getHours() - MAX_RETRY_HOURS)

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
      const sourceContent = article.sourceContent || ''
      
      try {
        // 检查内容长度，如果太长则直接跳过（避免处理失败）
        if (sourceContent.length > MAX_CONTENT_LENGTH) {
          console.warn(`[AI Rewrite] Article ${article.id} "${article.title}" content too long (${sourceContent.length} chars, max ${MAX_CONTENT_LENGTH}), skipping to avoid failure`)
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
            status: 'skipped',
            error: `Content too long (${sourceContent.length} chars, max ${MAX_CONTENT_LENGTH}). Please split the content or reduce its length.`,
          })
          continue
        }

        // 检查是否最近失败过（如果 aiRewriteAt 在最近24小时内，可能是刚失败过）
        // 注意：如果是手动指定文章ID，跳过冷却期检查，允许立即处理
        if (!isManualRequest && article.aiRewriteAt && article.aiRewriteAt > excludeRecentFailures) {
          console.warn(`[AI Rewrite] Article ${article.id} "${article.title}" was recently processed (${article.aiRewriteAt.toISOString()}), skipping to avoid repeated failures`)
          results.push({
            id: article.id,
            title: article.title,
            status: 'skipped',
            error: `Recently processed. Please wait ${MAX_RETRY_HOURS} hours before retrying, or specify articleId to force processing.`,
          })
          continue
        }

        // 更新状态为处理中，并设置处理时间
        await prisma.article.update({
          where: { id: article.id },
          data: {
            aiRewriteStatus: 'processing',
            aiRewriteAt: new Date(), // 开始处理时设置时间
          },
        })

        // 预处理：提取图片
        const { images, processedContent } = extractImages(sourceContent)

        // 上传图片到 R2（如果有图片）
        // 注意：会自动跳过已经是 R2 URL 的图片，避免重复上传
        const imageUrlMap = new Map<string, string>()
        if (images.length > 0) {
          try {
            console.log(`[AI Rewrite] Processing ${images.length} images to R2...`)
            
            const uploadResults = await uploadImagesToR2(
              images.map((img) => ({ url: img.url, alt: img.alt }))
            )
            uploadResults.forEach((newUrl, oldUrl) => {
              imageUrlMap.set(oldUrl, newUrl)
            })
            
            console.log(`[AI Rewrite] Successfully processed ${imageUrlMap.size} images (duplicates automatically skipped)`)
          } catch (error) {
            console.error('[AI Rewrite] Error uploading images to R2:', error)
            // 如果上传失败，继续使用原 URL
          }
        }

        // 更新图片 URL（如果已上传到 R2）
        const updatedImages = images.map((img) => {
          const newUrl = imageUrlMap.get(img.url) || img.url
          return {
            ...img,
            url: newUrl,
            markdown: `![${img.alt}](${newUrl})`,
          }
        })

        // 在提示词中添加图片占位符说明（如果有图片）
        let enhancedPrompt = AI_REWRITE_PROMPT
        if (updatedImages.length > 0) {
          enhancedPrompt += `\n\n## 图片处理说明\n原文中包含 ${updatedImages.length} 张图片，已用占位符 [IMAGE_1], [IMAGE_2] 等标记。请在改写时保留这些占位符，它们将在后处理阶段被替换为实际图片。`
        }

        // 调用 AI API 进行改写
        const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'
        const completion = await aiClient.chat.completions.create({
          model, // DeepSeek 使用 'deepseek-chat'，OpenAI 使用 'gpt-4o-mini'
          messages: [
            {
              role: 'system',
              content: enhancedPrompt,
            },
            {
              role: 'user',
              content: processedContent, // 使用处理后的内容（图片已替换为占位符）
            },
          ],
          temperature: 0.7,
          max_tokens: 4000, // 根据需求调整
        })

        let rewrittenContent = completion.choices[0]?.message?.content || ''

        if (!rewrittenContent) {
          throw new Error('AI returned empty content')
        }

        // 后处理：插入图片（使用更新后的 URL）
        if (updatedImages.length > 0) {
          rewrittenContent = insertImages(rewrittenContent, updatedImages)
        }

        // 计算阅读时间
        const readingTime = calculateReadingTime(rewrittenContent)

        // 更新 sourceContent 中的图片 URL 为 R2 URL（避免下次改写时重复上传）
        let updatedSourceContent = sourceContent
        if (imageUrlMap.size > 0) {
          for (const [oldUrl, newUrl] of imageUrlMap.entries()) {
            // 替换 sourceContent 中的第三方图片 URL 为 R2 URL
            updatedSourceContent = updatedSourceContent.replace(oldUrl, newUrl)
          }
          console.log(`[AI Rewrite] Updated sourceContent with R2 image URLs to avoid duplicate uploads`)
        }

        // 更新文章：保存改写后的内容，更新 sourceContent（图片 URL 已替换为 R2），更新状态，设置为已发布
        const updatedArticle = await prisma.article.update({
          where: { id: article.id },
          data: {
            content: rewrittenContent,
            sourceContent: updatedSourceContent, // 更新 sourceContent，将图片 URL 替换为 R2 URL
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

        // 触发页面重新生成（主动清除缓存）
        try {
          // 方法1: 通过路径重新验证
          const revalidateUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate?path=/${article.slug}&secret=${process.env.REVALIDATE_SECRET || ''}`
          await fetch(revalidateUrl, { method: 'POST' })
          
          // 方法2: 通过 cache tag 重新验证（更精确）
          const tagUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate?tag=article-${article.slug}&secret=${process.env.REVALIDATE_SECRET || ''}`
          await fetch(tagUrl, { method: 'POST' })
          
          console.log(`[AI Rewrite] Revalidated page: /${article.slug}`)
        } catch (revalidateError) {
          console.error('[AI Rewrite] Error revalidating page:', revalidateError)
          // 不阻止流程，即使 revalidate 失败
        }

        results.push({
          id: article.id,
          title: article.title,
          status: 'success',
          contentLength: rewrittenContent.length,
        })
      } catch (error: any) {
        console.error(`Error processing article ${article.id}:`, error)

        const errorMessage = error.message || 'Unknown error'
        
        // 检查是否是内容相关错误（内容太长、格式问题等）
        const isContentError = 
          errorMessage.includes('too long') ||
          errorMessage.includes('token') ||
          errorMessage.includes('length') ||
          errorMessage.includes('empty') ||
          sourceContent.length > 30000 // 如果内容超过30000字符，很可能是内容问题

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
          error: errorMessage,
          skipped: isContentError, // 标记为因内容问题跳过，避免重复尝试
        })
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length
    const failedCount = results.filter((r) => r.status === 'failed').length
    const skippedCount = results.filter((r) => r.status === 'skipped').length

    return NextResponse.json({
      success: true,
      message: `Processed ${articles.length} article(s)`,
      processed: articles.length,
      success: successCount,
      failed: failedCount,
      skipped: skippedCount,
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

