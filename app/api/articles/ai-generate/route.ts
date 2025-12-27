import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { uploadBufferToR2, downloadImage, uploadImageToR2 } from '@/lib/r2'
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

// 计算阅读时间
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

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

// 从 Unsplash 搜索并下载图片
async function searchImageFromUnsplash(keywords: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    console.log('[AI Generate] Unsplash API key not configured, skipping image search')
    return null
  }

  try {
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&page=1&per_page=1&orientation=landscape`
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular // 或 full, raw
    }
  } catch (error) {
    console.error('[AI Generate] Unsplash search failed:', error)
  }

  return null
}

// 从 Pexels 搜索并下载图片
async function searchImageFromPexels(keywords: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    console.log('[AI Generate] Pexels API key not configured, skipping image search')
    return null
  }

  try {
    const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=1&orientation=landscape`
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': apiKey, // Pexels API 直接使用 API key，不需要 Bearer 前缀
      },
    })

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`)
    }

    const data = await response.json()
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large // 或 original, large2x
    }
  } catch (error) {
    console.error('[AI Generate] Pexels search failed:', error)
  }

  return null
}

// 清洗和精炼关键词
function refineKeywords(keywords: string): string {
  return keywords
    .replace(/!\[([^\]]*)\]/g, '$1') // 移除 Markdown 图片语法
    .replace(/[#*`_]/g, '') // 移除 Markdown 符号
    .replace(/[.,!?;:]/g, ' ') // 移除标点
    .replace(/\s+/g, ' ') // 压缩空格
    .trim()
}

// 搜索图片（带回退逻辑）
async function searchImage(keywords: string, altText: string, articleTitle: string): Promise<string | null> {
  const cleanAlt = refineKeywords(altText)
  const cleanTitle = refineKeywords(articleTitle)

  // 搜索尝试序列：
  // 1. altText + title (最精确)
  // 2. 仅 altText
  // 3. title + altText 的前几个词
  // 4. 仅 title
  const searchSequences = [
    `${cleanAlt} ${cleanTitle}`.substring(0, 80),
    cleanAlt.substring(0, 80),
    `${cleanTitle} ${cleanAlt.split(' ').slice(0, 3).join(' ')}`.substring(0, 80),
    cleanTitle.substring(0, 80)
  ]

  for (const query of searchSequences) {
    if (!query || query.length < 3) continue

    console.log(`[AI Processor] Trying image search with: "${query}"`)

    // 先尝试 Unsplash
    const unsplashUrl = await searchImageFromUnsplash(query)
    if (unsplashUrl) return unsplashUrl

    // 如果 Unsplash 失败，尝试 Pexels
    const pexelsUrl = await searchImageFromPexels(query)
    if (pexelsUrl) return pexelsUrl
  }

  return null
}

// POST - 生成文章
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

    const body = await request.json()
    const articleId = body.articleId ? parseInt(body.articleId, 10) : null
    const customPrompt = body.customPrompt || null

    if (!articleId) {
      return NextResponse.json({ success: false, error: 'articleId is required' }, { status: 400 })
    }

    // 获取文章
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        category: true,
      },
    })

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    // 检查文章模式
    if (article.articleMode !== 'ai-generate') {
      return NextResponse.json(
        { success: false, error: 'Article mode must be ai-generate' },
        { status: 400 }
      )
    }

    // 更新状态为 processing
    await prisma.article.update({
      where: { id: articleId },
      data: {
        aiRewriteStatus: 'processing',
      },
    })

    try {
      // 构建提示词
      const basePrompt = customPrompt || AI_GENERATE_PROMPT
      const prompt = basePrompt
        .replace('{title}', article.title)
        .replace('{categoryName}', article.category.name)

      console.log(`[AI Generate] Generating article for: ${article.title}`)

      // 调用 AI API 生成内容
      const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'
      const completion = await aiClient.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Generate a comprehensive article about: ${article.title}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })

      let generatedContent = completion.choices[0]?.message?.content || ''

      if (!generatedContent) {
        throw new Error('AI returned empty content')
      }

      console.log(`[AI Generate] Content generated, length: ${generatedContent.length}`)

      // 解析图片占位符
      const imagePlaceholderRegex = /IMAGE_PLACEHOLDER_(\d+)/g
      const placeholders: Array<{ index: number; altText: string; context: string }> = []
      let match

      // 提取所有占位符及其上下文
      while ((match = imagePlaceholderRegex.exec(generatedContent)) !== null) {
        const placeholderIndex = parseInt(match[1], 10)
        const beforeMatch = generatedContent.substring(Math.max(0, match.index - 100), match.index)
        const afterMatch = generatedContent.substring(match.index + match[0].length, Math.min(generatedContent.length, match.index + match[0].length + 100))

        // 尝试从 Markdown 图片语法中提取 alt text
        const imageSyntaxMatch = generatedContent.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50).match(/!\[([^\]]*)\]/)
        const altText = imageSyntaxMatch ? imageSyntaxMatch[1] : `Image ${placeholderIndex}`

        placeholders.push({
          index: placeholderIndex,
          altText: altText || `Image ${placeholderIndex}`,
          context: `${beforeMatch}...${afterMatch}`,
        })
      }

      console.log(`[AI Generate] Found ${placeholders.length} image placeholders`)

      // 为每个占位符搜索并下载图片
      const imageUrlMap = new Map<string, string>()
      for (const placeholder of placeholders) {
        try {
          // 构建搜索关键词（使用 alt text 和上下文）
          console.log(`[AI Generate] Searching image for placeholder ${placeholder.index}: ${placeholder.altText}`)

          const imageUrl = await searchImage('', placeholder.altText, article.title)

          if (imageUrl) {
            // 使用 uploadImageToR2 上传单个图片
            console.log(`[AI Generate] Uploading image to R2: ${imageUrl}`)

            const r2Url = await uploadImageToR2(
              imageUrl,
              placeholder.altText,
              placeholder.index - 1, // 索引从0开始
              article.slug
            )

            if (r2Url) {
              imageUrlMap.set(`IMAGE_PLACEHOLDER_${placeholder.index}`, r2Url)
              console.log(`[AI Generate] Image ${placeholder.index} uploaded to R2: ${r2Url}`)
            }
          } else {
            console.log(`[AI Generate] No image found for placeholder ${placeholder.index}`)
          }
        } catch (error) {
          console.error(`[AI Generate] Error processing image placeholder ${placeholder.index}:`, error)
          // 继续处理其他图片
        }
      }

      // 替换占位符为实际 URL
      for (const [placeholder, url] of imageUrlMap.entries()) {
        generatedContent = generatedContent.replace(placeholder, url)
      }

      // 移除未找到图片的占位符（保留 Markdown 语法但移除占位符）
      generatedContent = generatedContent.replace(/IMAGE_PLACEHOLDER_\d+/g, '')

      // 计算阅读时间
      const readingTime = calculateReadingTime(generatedContent)

      // 生成封面图（从第一张图片）
      let coverImageUrl = article.coverImage
      const firstImageMatch = generatedContent.match(/!\[([^\]]*)\]\(([^)]+)\)/)
      if (firstImageMatch && firstImageMatch[2]) {
        try {
          const firstImageUrl = firstImageMatch[2]
          console.log(`[AI Generate] Generating cover image from: ${firstImageUrl}`)

          const response = await fetch(firstImageUrl)
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer()
            const inputBuffer = Buffer.from(arrayBuffer)

            // 调整为 375x200
            const coverBuffer = await sharp(inputBuffer)
              .resize(375, 200, {
                fit: 'cover',
                position: 'center',
              })
              .jpeg({ quality: 85 })
              .toBuffer()

            const coverFileName = `${article.slug}-cover-375x200.jpg`
            coverImageUrl = await uploadBufferToR2(coverBuffer, coverFileName, 'image/jpeg')
            console.log(`[AI Generate] Cover image generated: ${coverImageUrl}`)
          }
        } catch (error) {
          console.error('[AI Generate] Failed to generate cover image:', error)
        }
      }

      // 更新文章
      const updatedArticle = await prisma.article.update({
        where: { id: articleId },
        data: {
          content: generatedContent,
          coverImage: coverImageUrl,
          readingTime,
          aiRewriteStatus: 'completed',
          aiRewriteAt: new Date(),
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

      console.log(`[AI Generate] Article generated successfully: ${article.title}`)

      return NextResponse.json({
        success: true,
        article: updatedArticle,
      })
    } catch (error: any) {
      console.error('[AI Generate] Error generating article:', error)

      // 更新状态为失败
      await prisma.article.update({
        where: { id: articleId },
        data: {
          aiRewriteStatus: 'failed',
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to generate article',
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[AI Generate] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

