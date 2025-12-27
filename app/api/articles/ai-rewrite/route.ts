import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { uploadImagesToR2, uploadBufferToR2, uploadImageToR2 } from '@/lib/r2'
import sharp from 'sharp'

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

// AI 生成提示词模板
const AI_GENERATE_PROMPT = `You are a professional content writer and SEO expert.
Generate a comprehensive, high-quality article based on the following title and category.

## Article Information
- Title: {title}
- Category: {categoryName}
- Target Audience: English-speaking users in the United States

## Requirements

### Content Quality
1. Write in fluent, natural American English
2. Follow Google's E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness)
3. Provide practical, actionable information
4. Use clear, engaging writing style

### SEO Optimization
1. The H1 heading must naturally include the main keyword from the title
2. Answer the core question within the first 120 words
3. Use clear H2/H3 structure to cover subtopics
4. Naturally incorporate related keywords and synonyms
5. Ensure content is comprehensive and valuable

### Structure Requirements
1. Start with an engaging introduction (2-3 paragraphs)
2. Use H2 headings for main sections
3. Use H3 headings for subsections
4. Include practical tips, examples, or recommendations
5. End with a concise conclusion

### Image Requirements
- Include 3-5 relevant images throughout the article
- Use descriptive alt text for each image
- Images should be relevant to the content section
- Format: Use Markdown image syntax: ![alt text](IMAGE_PLACEHOLDER_1), ![alt text](IMAGE_PLACEHOLDER_2), etc.
- Place images at appropriate points in the content (after relevant paragraphs)

### Output Format
- Use Markdown format
- Output ONLY the article content (no explanations or meta-commentary)
- Include image placeholders in the format: IMAGE_PLACEHOLDER_1, IMAGE_PLACEHOLDER_2, etc.
- Each image placeholder should have descriptive alt text

## Example Image Placeholder Usage
\`\`\`markdown
![Beautiful sunset over mountains](IMAGE_PLACEHOLDER_1)

The best time to visit depends on several factors...

![Travel guide map](IMAGE_PLACEHOLDER_2)
\`\`\`

Now generate the article based on the title: "{title}"`

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

// 插入图片到 Markdown 内容中
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

// 从 Unsplash 搜索图片
async function searchImageFromUnsplash(keywords: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) return null

  try {
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&page=1&per_page=1&orientation=landscape`
    const response = await fetch(searchUrl, {
      headers: { 'Authorization': `Client-ID ${accessKey}` },
    })
    if (!response.ok) return null
    const data = await response.json()
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular
    }
  } catch (error) {
    console.error('[AI Processor] Unsplash search failed:', error)
  }
  return null
}

// 从 Pexels 搜索图片
async function searchImageFromPexels(keywords: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return null

  try {
    const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=1&orientation=landscape`
    const response = await fetch(searchUrl, {
      headers: { 'Authorization': apiKey },
    })
    if (!response.ok) return null
    const data = await response.json()
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large
    }
  } catch (error) {
    console.error('[AI Processor] Pexels search failed:', error)
  }
  return null
}

// 清洗和精炼关键词
function refineKeywords(keywords: string): string {
  return keywords
    .replace(/!\[([^\]]*)\]/g, '$1')
    .replace(/[#*`_]/g, '')
    .replace(/[.,!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// 搜索图片（带回退逻辑）
async function searchImage(keywords: string, altText: string, articleTitle: string): Promise<string | null> {
  const cleanAlt = refineKeywords(altText)
  const cleanTitle = refineKeywords(articleTitle)

  const searchSequences = [
    `${cleanAlt} ${cleanTitle}`.substring(0, 80),
    cleanAlt.substring(0, 80),
    `${cleanTitle} ${cleanAlt.split(' ').slice(0, 3).join(' ')}`.substring(0, 80),
    cleanTitle.substring(0, 80)
  ]

  for (const query of searchSequences) {
    if (!query || query.length < 3) continue

    const unsplashUrl = await searchImageFromUnsplash(query)
    if (unsplashUrl) return unsplashUrl

    const pexelsUrl = await searchImageFromPexels(query)
    if (pexelsUrl) return pexelsUrl
  }

  return null
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
      OR: [
        {
          articleMode: 'ai-rewrite',
          sourceContent: { not: null },
        },
        {
          articleMode: 'ai-generate',
        },
      ],
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

        let rewrittenContent = ''
        let updatedSourceContent = sourceContent
        let imageUrlMap = new Map<string, string>()

        if (article.articleMode === 'ai-generate') {
          // ==========================================
          // 模式 A: 从标题生成 (AI Generate)
          // ==========================================
          console.log(`[AI Processor] Generating article from title: ${article.title}`)

          const prompt = AI_GENERATE_PROMPT
            .replace('{title}', article.title)
            .replace('{categoryName}', article.category.name)

          const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'
          const completion = await aiClient.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: `Generate a comprehensive article about: ${article.title}` }
            ],
            temperature: 0.7,
            max_tokens: 4000,
          })

          let generatedContent = completion.choices[0]?.message?.content || ''
          if (!generatedContent) throw new Error('AI returned empty content')

          // 处理图片占位符
          const imagePlaceholderRegex = /IMAGE_PLACEHOLDER_(\d+)/g
          let match
          const placeholders: Array<{ index: number; altText: string }> = []

          while ((match = imagePlaceholderRegex.exec(generatedContent)) !== null) {
            const placeholderIndex = parseInt(match[1], 10)
            const imageSyntaxMatch = generatedContent.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50).match(/!\[([^\]]*)\]/)
            placeholders.push({
              index: placeholderIndex,
              altText: imageSyntaxMatch ? imageSyntaxMatch[1] : `Image ${placeholderIndex}`
            })
          }

          // 搜索并上传图片
          for (const placeholder of placeholders) {
            try {
              console.log(`[AI Processor] Searching image for: ${placeholder.altText}`)
              const imageUrl = await searchImage('', placeholder.altText, article.title)

              if (imageUrl) {
                const r2Url = await uploadImageToR2(imageUrl, placeholder.altText, placeholder.index - 1, article.slug)
                if (r2Url) {
                  generatedContent = generatedContent.replace(`IMAGE_PLACEHOLDER_${placeholder.index}`, r2Url)
                  imageUrlMap.set(`IMAGE_PLACEHOLDER_${placeholder.index}`, r2Url)
                }
              }
            } catch (err) {
              console.error(`[AI Processor] Image placeholder ${placeholder.index} error:`, err)
            }
          }
          // 移除剩余占位符
          rewrittenContent = generatedContent.replace(/IMAGE_PLACEHOLDER_\d+/g, '')
        } else {
          // ==========================================
          // 模式 B: 从原文改写 (AI Rewrite)
          // ==========================================
          const { images, processedContent } = extractImages(sourceContent)
          let sourceImageUrlMap = new Map<string, string>()

          if (images.length > 0) {
            console.log(`[AI Processor] Processing ${images.length} images from source content to R2...`)
            sourceImageUrlMap = await uploadImagesToR2(
              images.map((img) => ({ url: img.url, alt: img.alt })),
              article.slug
            )
            updatedSourceContent = insertImages(sourceContent, images.map(img => ({
              ...img,
              markdown: `![${img.alt}](${sourceImageUrlMap.get(img.url) || img.url})`
            })))
          }

          // 更新占位符信息用于 AI
          const updatedImages = images.map((img) => {
            const newUrl = sourceImageUrlMap.get(img.url) || img.url
            return {
              ...img,
              url: newUrl,
              markdown: `![${img.alt}](${newUrl})`,
            }
          })

          let enhancedPrompt = AI_REWRITE_PROMPT
          if (updatedImages.length > 0) {
            enhancedPrompt += `\n\n## 图片处理说明\n原文中包含 ${updatedImages.length} 张图片，已用占位符 [IMAGE_1], [IMAGE_2] 等标记。请在改写时保留这些占位符。`
          }

          const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'
          const completion = await aiClient.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: enhancedPrompt },
              { role: 'user', content: processedContent },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          })

          rewrittenContent = completion.choices[0]?.message?.content || ''
          if (!rewrittenContent) throw new Error('AI returned empty content')

          if (updatedImages.length > 0) {
            rewrittenContent = insertImages(rewrittenContent, updatedImages)
          }
        }

        // 计算阅读时间
        const readingTime = calculateReadingTime(rewrittenContent)

        // -- Start Thumbnail Logic --
        let coverImageUrl = (article as any).coverImage
        const firstImageMatch = rewrittenContent.match(/!\[([^\]]*)\]\(([^)]+)(?:\s+"[^"]*")?\)/)

        if (firstImageMatch && firstImageMatch[2]) {
          const firstImageUrl = firstImageMatch[2]
          try {
            console.log(`[AI Processor] Generating thumbnail from: ${firstImageUrl}`)
            const response = await fetch(firstImageUrl)
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer()
              const inputBuffer = Buffer.from(arrayBuffer)
              const coverBuffer = await sharp(inputBuffer)
                .resize(375, 250, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 80 })
                .toBuffer()
              const coverFileName = `thumbnail-${article.slug}-${Date.now()}.jpg`
              coverImageUrl = await uploadBufferToR2(coverBuffer, coverFileName, 'image/jpeg')
            }
          } catch (err) {
            console.error('[AI Processor] Failed to generate thumbnail:', err)
          }
        }

        const updateData: any = {
          content: rewrittenContent,
          sourceContent: updatedSourceContent,
          aiRewriteStatus: 'completed',
          aiRewriteAt: new Date(),
          readingTime,
          published: true,
          coverImage: coverImageUrl,
        }
        if (!article.published && !article.publishedAt) {
          updateData.publishedAt = new Date()
        }

        await prisma.article.update({
          where: { id: article.id },
          data: updateData,
        })

        // 触发页面重新生成
        try {
          const revalidateUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate?path=/${article.slug}&secret=${process.env.REVALIDATE_SECRET || ''}`
          await fetch(revalidateUrl, { method: 'POST' })
          console.log(`[AI Processor] Revalidated page: /${article.slug}`)
        } catch (revalidateError) {
          console.error('[AI Processor] Error revalidating page:', revalidateError)
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
      successCount,
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
      OR: [
        {
          articleMode: 'ai-rewrite',
          sourceContent: { not: null },
        },
        {
          articleMode: 'ai-generate',
        },
      ],
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

        let rewrittenContent = ''
        let updatedSourceContent = sourceContent
        let imageUrlMap = new Map<string, string>()

        if (article.articleMode === 'ai-generate') {
          // ==========================================
          // 模式 A: 从标题生成 (AI Generate)
          // ==========================================
          console.log(`[AI Processor] Generating article from title: ${article.title}`)

          const prompt = AI_GENERATE_PROMPT
            .replace('{title}', article.title)
            .replace('{categoryName}', article.category.name)

          const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'
          const completion = await aiClient.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: `Generate a comprehensive article about: ${article.title}` }
            ],
            temperature: 0.7,
            max_tokens: 4000,
          })

          let generatedContent = completion.choices[0]?.message?.content || ''
          if (!generatedContent) throw new Error('AI returned empty content')

          // 处理图片占位符
          const imagePlaceholderRegex = /IMAGE_PLACEHOLDER_(\d+)/g
          let match
          const placeholders: Array<{ index: number; altText: string }> = []

          while ((match = imagePlaceholderRegex.exec(generatedContent)) !== null) {
            const placeholderIndex = parseInt(match[1], 10)
            const imageSyntaxMatch = generatedContent.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50).match(/!\[([^\]]*)\]/)
            placeholders.push({
              index: placeholderIndex,
              altText: imageSyntaxMatch ? imageSyntaxMatch[1] : `Image ${placeholderIndex}`
            })
          }

          // 搜索并上传图片
          for (const placeholder of placeholders) {
            try {
              console.log(`[AI Processor] Searching image for: ${placeholder.altText}`)
              const imageUrl = await searchImage('', placeholder.altText, article.title)

              if (imageUrl) {
                const r2Url = await uploadImageToR2(imageUrl, placeholder.altText, placeholder.index - 1, article.slug)
                if (r2Url) {
                  generatedContent = generatedContent.replace(`IMAGE_PLACEHOLDER_${placeholder.index}`, r2Url)
                  imageUrlMap.set(`IMAGE_PLACEHOLDER_${placeholder.index}`, r2Url)
                }
              }
            } catch (err) {
              console.error(`[AI Processor] Image placeholder ${placeholder.index} error:`, err)
            }
          }
          // 移除剩余占位符
          rewrittenContent = generatedContent.replace(/IMAGE_PLACEHOLDER_\d+/g, '')
        } else {
          // ==========================================
          // 模式 B: 从原文改写 (AI Rewrite)
          // ==========================================
          const { images, processedContent } = extractImages(sourceContent)
          let sourceImageUrlMap = new Map<string, string>()

          if (images.length > 0) {
            console.log(`[AI Processor] Processing ${images.length} images from source content to R2...`)
            sourceImageUrlMap = await uploadImagesToR2(
              images.map((img) => ({ url: img.url, alt: img.alt })),
              article.slug
            )
            updatedSourceContent = insertImages(sourceContent, images.map(img => ({
              ...img,
              markdown: `![${img.alt}](${sourceImageUrlMap.get(img.url) || img.url})`
            })))
          }

          const updatedImages = images.map((img) => {
            const newUrl = sourceImageUrlMap.get(img.url) || img.url
            return {
              ...img,
              url: newUrl,
              markdown: `![${img.alt}](${newUrl})`,
            }
          })

          let enhancedPrompt = AI_REWRITE_PROMPT
          if (updatedImages.length > 0) {
            enhancedPrompt += `\n\n## 图片处理说明\n原文中包含 ${updatedImages.length} 张图片，已用占位符 [IMAGE_1], [IMAGE_2] 等标记。请在改写时保留这些占位符。`
          }

          const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'
          const completion = await aiClient.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: enhancedPrompt },
              { role: 'user', content: processedContent },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          })

          rewrittenContent = completion.choices[0]?.message?.content || ''
          if (!rewrittenContent) throw new Error('AI returned empty content')

          if (updatedImages.length > 0) {
            rewrittenContent = insertImages(rewrittenContent, updatedImages)
          }
        }

        // 计算阅读时间
        const readingTime = calculateReadingTime(rewrittenContent)

        // -- Start Thumbnail Logic --
        let coverImageUrl = (article as any).coverImage
        const firstImageMatch = rewrittenContent.match(/!\[([^\]]*)\]\(([^)]+)(?:\s+"[^"]*")?\)/)

        if (firstImageMatch && firstImageMatch[2]) {
          const firstImageUrl = firstImageMatch[2]
          try {
            console.log(`[AI Processor] Generating thumbnail from: ${firstImageUrl}`)
            const response = await fetch(firstImageUrl)
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer()
              const inputBuffer = Buffer.from(arrayBuffer)
              const coverBuffer = await sharp(inputBuffer)
                .resize(375, 250, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 80 })
                .toBuffer()
              const coverFileName = `thumbnail-${article.slug}-${Date.now()}.jpg`
              coverImageUrl = await uploadBufferToR2(coverBuffer, coverFileName, 'image/jpeg')
            }
          } catch (err) {
            console.error('[AI Processor] Failed to generate thumbnail:', err)
          }
        }

        const updateData: any = {
          content: rewrittenContent,
          sourceContent: updatedSourceContent,
          aiRewriteStatus: 'completed',
          aiRewriteAt: new Date(),
          readingTime,
          published: true,
          coverImage: coverImageUrl,
        }
        if (!article.published && !article.publishedAt) {
          updateData.publishedAt = new Date()
        }

        await prisma.article.update({
          where: { id: article.id },
          data: updateData,
        })

        // 触发页面重新生成
        try {
          const revalidateUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate?path=/${article.slug}&secret=${process.env.REVALIDATE_SECRET || ''}`
          await fetch(revalidateUrl, { method: 'POST' })
          console.log(`[AI Processor] Revalidated page: /${article.slug}`)
        } catch (revalidateError) {
          console.error('[AI Processor] Error revalidating page:', revalidateError)
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
      successCount,
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

