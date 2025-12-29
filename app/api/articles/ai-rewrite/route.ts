import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { uploadBufferToR2, uploadImageToR2 } from '@/lib/r2'
import sharp from 'sharp'
import { revalidateTag } from 'next/cache'

// Vercel 运行时间设置：设置为 60 秒（Hobby 版最大值）
export const maxDuration = 60

const prisma = new PrismaClient()

// 初始化 AI 客户端
const getAIClient = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || ''
  const baseURL = process.env.DEEPSEEK_API_KEY
    ? 'https://api.deepseek.com'
    : undefined

  return new OpenAI({
    apiKey,
    baseURL,
  })
}

const aiClient = getAIClient()

// 检查是否为管理员
async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) return null
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })
  return user?.isAdmin ? userId : null
}

const AI_GENERATE_PROMPT = `You are a professional content writer and SEO expert.
Generate a comprehensive, high-quality article based on the following title and category.

## Article Information
- Title: {title}
- Category: {categoryName}
- Target Audience: English-speaking users in the United States

## CRITICAL REQUIREMENTS - MUST READ

### Image Placeholders (MANDATORY - DO NOT SKIP)
You MUST include image placeholders in your article. This is a hard requirement.

**EXACT FORMAT to use:**
\`\`\`
![Descriptive alt text](IMAGE_PLACEHOLDER_1(search keywords for the image))
\`\`\`

**Examples of correct image placeholders:**
- ![Beautiful cherry blossoms in spring](IMAGE_PLACEHOLDER_1(cherry blossoms spring japan))
- ![Traditional Japanese tea ceremony](IMAGE_PLACEHOLDER_2(japanese tea ceremony cultural))
- ![Modern Tokyo cityscape at night](IMAGE_PLACEHOLDER_3(tokyo cityscape night neon))

**Key rules:**
1. Use the format: \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\` where N starts at 1 and increments
2. Include EXACTLY 3-5 image placeholders throughout the article
3. Place the first image placeholder after the introduction
4. Place remaining placeholders at the start of major sections
5. Keywords should be 2-4 words describing the visual content
6. Alt text should be descriptive and accessible
7. DO NOT use actual image URLs - ONLY use the IMAGE_PLACEHOLDER format

**Example of article structure with image placeholders:**

\`\`\`
# Best Time to Visit Tokyo

Tokyo is a vibrant city... [introduction text]

![Scenic view of Tokyo skyline](IMAGE_PLACEHOLDER_1(tokyo skyline view))

## Best Seasons to Visit

Spring (March-May) is spectacular...

![Cherry blossoms in full bloom](IMAGE_PLACEHOLDER_2(cherry blossoms tokyo park))

Summer offers... [content]

## Top Attractions

Here are the must-visit places...

![Senso-ji temple in Asakusa](IMAGE_PLACEHOLDER_3(senso-ji temple asakusa historic))
\`\`\`

### Content Quality
1. Write in fluent, natural American English
2. Follow Google's E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness)
3. Maintain a professional yet engaging tone
4. Ensure factual accuracy (based on year 2024/2025 information)

### SEO Optimization
1. Use a clear heading structure (H1, H2, H3)
2. Include the title naturally in the first paragraph
3. Use bullet points and numbered lists for readability
4. Add a "Conclusion" section at the end

## Article Structure
1. Introduction (with an image placeholder at the end)
2. Section 1: Core information (with an image placeholder at the start)
3. Section 2: Deep dive or practical tips (with an image placeholder at the start)
4. Section 3: Additional context or related advice
5. FAQ (3-5 common questions)
6. Conclusion

**FINAL REMINDER:** Your article MUST include 3-5 image placeholders in the format \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\`. Articles without image placeholders will be rejected.

Respond only with the Markdown content of the article. Ensure it includes the image placeholders.`

function refineKeywords(keywords: string): string {
  if (!keywords) return ''
  return keywords
    .replace(/best time to visit/gi, '')
    .replace(/the /gi, '')
    .replace(/a /gi, '')
    .replace(/guide/gi, '')
    .replace(/visit/gi, '')
    .trim()
}

async function searchImageFromPixabay(keywords: string): Promise<string | null> {
  const apiKey = process.env.PIXABAY_API_KEY
  if (!apiKey) {
    console.warn('[图片搜索] 跳过 Pixabay: 未设置 PIXABAY_API_KEY')
    return null
  }
  try {
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(keywords)}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true`
    console.log(`[Pixabay 请求] URL: ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`[Pixabay 错误] 状态码: ${response.status}`)
      return null
    }
    const data = await response.json()
    // 改用 webformatURL (通常为 640px 宽度)，比 largeImageURL 小得多，下载飞快
    return data.hits?.[0]?.webformatURL || null
  } catch (error) {
    console.error('[Pixabay 搜索异常]:', error)
  }
  return null
}

async function searchImageFromPexels(keywords: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return null
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=1&orientation=landscape`
    const response = await fetch(url, { headers: { 'Authorization': apiKey } })
    if (response.ok) {
      const data = await response.json()
      return data.photos?.[0]?.src?.large || null
    }
  } catch (err) {
    console.error('[Pexels 搜索异常]:', err)
  }
  return null
}

async function searchImageFromUnsplash(keywords: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) return null
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=1&orientation=landscape`
    const response = await fetch(url, { headers: { 'Authorization': `Client-ID ${accessKey}` } })
    if (response.ok) {
      const data = await response.json()
      const rawUrl = data.results?.[0]?.urls?.regular || null
      // Unsplash 支持动态缩放，直接请求 800 宽度的图片
      return rawUrl ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}w=800&q=80` : null
    }
  } catch (err) {
    console.error('[Unsplash 搜索异常]:', err)
  }
  return null
}

async function getNextPublishedAt(): Promise<Date> {
  const latestArticle = await prisma.article.findFirst({
    where: {
      published: true,
      publishedAt: { not: null }
    },
    orderBy: {
      publishedAt: 'desc'
    },
    select: {
      publishedAt: true
    }
  })

  const now = new Date()
  let baseTime = now

  if (latestArticle && latestArticle.publishedAt) {
    baseTime = new Date(latestArticle.publishedAt)
  }

  // 递增1小时。如果要确保始终在未来，可以取 baseTime 和 now 的最大值
  const nextTime = new Date(Math.max(baseTime.getTime(), now.getTime()) + 60 * 60 * 1000)
  return nextTime
}

async function searchImage(keywords: string, altText: string, articleTitle: string): Promise<string | null> {
  const cleanKeywords = refineKeywords(keywords)
  const isGenericAlt = /^image\s?\d+$/i.test(altText.trim())
  const cleanAlt = isGenericAlt ? '' : refineKeywords(altText)
  const titleWords = refineKeywords(articleTitle).split(' ').slice(0, 4).join(' ')

  const searchSequences = [
    cleanKeywords,
    cleanAlt,
    `${cleanKeywords} ${titleWords}`.trim(),
    titleWords
  ]

  for (const query of searchSequences) {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 3) continue

    const pixUrl = await searchImageFromPixabay(trimmed)
    if (pixUrl) return pixUrl
    const pexUrl = await searchImageFromPexels(trimmed)
    if (pexUrl) return pexUrl
    const unsUrl = await searchImageFromUnsplash(trimmed)
    if (unsUrl) return unsUrl
  }
  return null
}

async function processArticles(): Promise<{ id: number; slug: string; title: string } | null> {
  // 1. 优先寻找已经出字但待补图的"半成品"（阶段 2）
  let topArticle: any = await prisma.article.findFirst({
    where: {
      aiRewriteStatus: { in: ['pending', 'failed'] },
      content: { not: '' }
    },
    include: { category: true },
    orderBy: { aiRewriteAt: 'desc' }
  })

  // 2. 如果没有半成品，再捡起从未处理过的新文章（阶段 1）
  if (!topArticle) {
    topArticle = await prisma.article.findFirst({
      where: {
        aiRewriteStatus: { in: ['pending', 'failed'] },
        content: ''
      },
      include: { category: true },
      orderBy: { createdAt: 'asc' }
    })
  }

  if (!topArticle) return null

  const articles = [topArticle]
  for (const item of articles) {
    const article = item as any
    try {
      const hasContent = (article.content && article.content.length > 50)
      const hasPlaceholders = (article.content && article.content.includes('IMAGE_PLACEHOLDER_'))

      if (!hasContent) {
        console.log(`[AI 流水线 - 阶段 1/2] 正在生成文本: ${article.title}`)
        await prisma.article.update({
          where: { id: article.id },
          data: { aiRewriteStatus: 'processing', aiRewriteAt: new Date() }
        })

        const prompt = AI_GENERATE_PROMPT.replace('{title}', article.title).replace('{categoryName}', article.category.name)
        const completion = await aiClient.chat.completions.create({
          model: process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Generate a comprehensive article about: ${article.title}` }
          ],
          temperature: 0.7,
        })

        const generatedContent = completion.choices[0]?.message?.content || ''
        if (!generatedContent) throw new Error('AI 生成内容为空')

        await prisma.article.update({
          where: { id: article.id },
          data: {
            content: generatedContent,
            aiRewriteStatus: 'pending',
            aiRewriteAt: new Date()
          }
        })
        console.log(`[AI 流水线] 文本阶段完成: ${article.title}`)
        continue
      }

      if (hasPlaceholders) {
        console.log(`[AI 流水线 - 阶段 2/2] 正在补全图片: ${article.title}`)
        await prisma.article.update({
          where: { id: article.id },
          data: { aiRewriteStatus: 'processing' }
        })

        let currentContent = article.content || ''
        const imagePlaceholderRegex = /!\[([^\]]*)\]\(IMAGE_PLACEHOLDER_(\d+)\(([^)]+)\)\)/g
        let match
        const placeholders: Array<{ index: number; altText: string; keywords: string; fullMatch: string }> = []

        while ((match = imagePlaceholderRegex.exec(currentContent)) !== null) {
          placeholders.push({
            altText: match[1],
            index: parseInt(match[2], 10),
            keywords: match[3],
            fullMatch: match[0]
          })
        }

        const imagePromises = placeholders.map(async (placeholder) => {
          try {
            const imageUrl = await searchImage(placeholder.keywords, placeholder.altText, article.title)
            if (imageUrl) {
              const r2Url = await uploadImageToR2(imageUrl, placeholder.altText, placeholder.index - 1, article.slug)
              if (r2Url) {
                return { success: true, fullMatch: placeholder.fullMatch, altText: placeholder.altText, r2Url }
              }
            }
          } catch (err: any) {
            console.error(`[图片处理错误] 占位符 ${placeholder.index}:`, err.message)
          }
          return { success: false }
        })

        const imageResults = await Promise.all(imagePromises)
        let successCount = 0

        for (const res of imageResults) {
          if (res.success && res.fullMatch && res.r2Url) {
            currentContent = currentContent.replace(res.fullMatch, `![${res.altText}](${res.r2Url})`)
            successCount++
          }
        }

        // 第三层防护：检查是否至少成功上传了一张图片
        if (placeholders.length > 0 && successCount === 0) {
          console.error(`[第三层防护失败] 文章 ${article.title} 未能匹配任何图片 (${placeholders.length} 个占位符，0 张成功)`)
          console.error(`[第三层防护] 保留占位符，清空内容，重置为 pending 状态，重新从第一步开始`)
          
          // 清空内容，保留占位符格式，让 AI 重新生成（可能需要不同的关键词）
          await prisma.article.update({
            where: { id: article.id },
            data: {
              content: '',  // 清空内容，强制 AI 重新生成
              aiRewriteStatus: 'pending',
              aiRewriteAt: new Date()
            }
          })
          console.log(`[AI 流水线] 文章 ${article.title} 已清空内容并重置为 pending 状态（需要重新生成）`)
          return { id: article.id, slug: article.slug, title: article.title }
        }

        console.log(`[第三层防护成功] 文章 ${article.title} 成功匹配 ${successCount}/${placeholders.length} 张图片，继续发布流程`)

        // 至少有一张图片成功上传，继续处理
        let coverImageUrl = article.coverImage
        const firstImageMatch = currentContent.match(/!\[([^\]]*)\]\(([^)]+)\)/)
        if (firstImageMatch && firstImageMatch[2]) {
          try {
            const response = await fetch(firstImageMatch[2])
            if (response.ok) {
              const buffer = Buffer.from(await response.arrayBuffer())
              const coverBuffer = await sharp(buffer)
                .resize(375, 200, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 85 })
                .toBuffer()
              coverImageUrl = await uploadBufferToR2(coverBuffer, `${article.slug}-cover.jpg`, 'image/jpeg')
            }
          } catch (err) {
            console.error('[AI 改写] 封面图处理失败:', err)
          }
        }

        await prisma.article.update({
          where: { id: article.id },
          data: {
            content: currentContent,
            coverImage: coverImageUrl,
            aiRewriteStatus: 'completed',
            aiRewriteAt: new Date(),
            published: true,
            publishedAt: await getNextPublishedAt()
          }
        })
        console.log(`[AI 流水线] 全阶段完成: ${article.title} (成功上传 ${successCount}/${placeholders.length} 张图片)`)

        // 清除缓存，使新文章立即可访问
        try {
          revalidateTag(`article-${article.slug}`)
          revalidateTag('all-posts')
          console.log(`[AI 流水线] 已清除缓存: ${article.slug}`)
        } catch (error) {
          console.warn(`[AI 流水线] 清除缓存失败:`, error)
        }
      } else {
        // 有内容但没有图片占位符 - 这意味着AI没有按预期生成占位符
        console.warn(`[AI 流水线] 文章 ${article.title} 有内容但无图片占位符，需要重新生成`)
        
        // 清空内容并重置为pending，让AI重新生成（带有图片占位符）
        await prisma.article.update({
          where: { id: article.id },
          data: {
            content: '',
            aiRewriteStatus: 'pending',
            aiRewriteAt: new Date()
          }
        })
        
        console.log(`[AI 流水线] 已重置文章 ${article.title} 以重新生成（包含图片占位符）`)
        return { id: article.id, slug: article.slug, title: article.title }
      }
    } catch (error: any) {
      console.error(`[AI 处理失败] 标题: ${article.title}, 错误:`, error.message)
      await prisma.article.update({
        where: { id: article.id },
        data: { aiRewriteStatus: 'failed' }
      })
      return { id: article.id, slug: article.slug, title: article.title }
    }
  }
  return null
}

export async function GET() {
  return handleRequest()
}

export async function POST() {
  return handleRequest()
}

async function handleRequest() {
  try {
    const adminId = await checkAdmin()
    if (!adminId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // 在 Vercel 环境下，必须 await 异步任务，否则函数响应后会被立即冻结
    const processedArticle = await processArticles()

    if (!processedArticle) {
      return NextResponse.json({
        success: true,
        message: 'No articles pending processing'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Processing completed',
      article: {
        id: processedArticle.id,
        slug: processedArticle.slug,
        title: processedArticle.title
      }
    })
  } catch (error: any) {
    console.error('[AI Rewrite API Error]:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
