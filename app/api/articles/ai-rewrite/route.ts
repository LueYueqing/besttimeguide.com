import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { uploadBufferToR2, uploadImageToR2 } from '@/lib/r2'
import sharp from 'sharp'

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
- For each image, provide 3 closely related search keywords (nouns) to help find the best image
- Format: Use Markdown image syntax: ![alt text](IMAGE_PLACEHOLDER_1(keyword1, keyword2, keyword3)), ![alt text](IMAGE_PLACEHOLDER_2(keyword4, keyword5, keyword6)), etc.
- Place images at appropriate points in the content (after relevant paragraphs)

### Output Format
- Use Markdown format
- Output ONLY the article content (no explanations or meta-commentary)
- Include image placeholders in the format: IMAGE_PLACEHOLDER_1(keyword1, keyword2, keyword3), etc.
- Each image placeholder MUST include 3 nouns as keywords in the parentheses

## Example Image Placeholder Usage
\`\`\`markdown
![Beautiful sunset over mountains](IMAGE_PLACEHOLDER_1(sunset, mountains, nature))

The best time to visit depends on several factors...

![Travel guide map](IMAGE_PLACEHOLDER_2(map, travel, guide))
\`\`\`
`

/**
 * 提取文章中的图片，并移除相关标签
 */
function extractImages(content: string) {
  const images: Array<{ alt: string; url: string }> = []
  const processedContent = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    images.push({ alt, url })
    return ''
  })
  return { images, processedContent }
}

/**
 * 在文章中插入图片
 */
function insertImages(content: string, images: Array<{ alt: string; url: string }>) {
  if (images.length === 0) return content
  const paragraphs = content.split('\n\n')
  const interval = Math.max(1, Math.floor(paragraphs.length / (images.length + 1)))

  let insertedCount = 0
  for (let i = 1; i <= images.length; i++) {
    const index = i * interval + insertedCount
    if (index < paragraphs.length) {
      const img = images[i - 1]
      paragraphs.splice(index, 0, `![${img.alt}](${img.url})`)
      insertedCount++
    }
  }
  return paragraphs.join('\n\n')
}

// 从 Pixabay 搜索 (第一顺位)
async function searchImageFromPixabay(keywords: string): Promise<string | null> {
  const apiKey = process.env.PIXABAY_API_KEY
  if (!apiKey) {
    console.warn('[图片搜索] 跳过 Pixabay: 未设置 PIXABAY_API_KEY')
    return null
  }
  try {
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(keywords)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=3`
    console.log(`[Pixabay 请求] URL: ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`[Pixabay 错误] 状态码: ${response.status}`)
      return null
    }
    const data = await response.json()
    return data.hits?.[0]?.largeImageURL || null
  } catch (error) {
    console.error('[Pixabay 搜索异常]:', error)
  }
  return null
}

// 从 Pexels 搜索
async function searchImageFromPexels(keywords: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    console.warn('[图片搜索] 跳过 Pexels: 未设置 PEXELS_API_KEY')
    return null
  }
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=1&orientation=landscape`
    console.log(`[Pexels 请求] URL: ${url}`)
    const response = await fetch(url, { headers: { 'Authorization': apiKey } })
    if (!response.ok) {
      console.warn(`[Pexels 错误] 状态码: ${response.status}`)
      return null
    }
    const data = await response.json()
    return data.photos?.[0]?.src?.large || null
  } catch (error) {
    console.error('[Pexels 搜索异常]:', error)
  }
  return null
}

// 从 Unsplash 搜索
async function searchImageFromUnsplash(keywords: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    console.warn('[图片搜索] 跳过 Unsplash: 未设置 UNSPLASH_ACCESS_KEY')
    return null
  }
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&page=1&per_page=1&orientation=landscape`
    console.log(`[Unsplash 请求] URL: ${url}`)
    const response = await fetch(url, { headers: { 'Authorization': `Client-ID ${accessKey}` } })
    if (!response.ok) {
      console.warn(`[Unsplash 错误] 状态码: ${response.status}`)
      return null
    }
    const data = await response.json()
    return data.results?.[0]?.urls?.regular || null
  } catch (error) {
    console.error('[Unsplash 搜索异常]:', error)
  }
  return null
}

function refineKeywords(keywords: string): string {
  const stopWords = /\b(best time to|visit|how to|guide|updated|everything|tips|things to do in|travel|the|a|an)\b/gi;
  return keywords
    .replace(/!\[([^\]]*)\]/g, '$1')
    .replace(/[#*`_]/g, '')
    .replace(/[.,!?;:]/g, ' ')
    .replace(stopWords, '')
    .replace(/\s+/g, ' ')
    .trim()
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
    console.log(`[图片搜索] 尝试关键词: "${trimmed}"`)

    // 按顺序尝试: Pixabay -> Pexels -> Unsplash
    const pixUrl = await searchImageFromPixabay(trimmed)
    if (pixUrl) return pixUrl
    const pexUrl = await searchImageFromPexels(trimmed)
    if (pexUrl) return pexUrl
    const unsUrl = await searchImageFromUnsplash(trimmed)
    if (unsUrl) return unsUrl
  }
  return null
}

async function processArticles() {
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { aiRewriteStatus: 'pending' },
        { aiRewriteStatus: 'failed' }
      ]
    },
    include: { category: true },
    take: 1
  })

  for (const article of articles) {
    try {
      console.log(`[AI 处理] 模式: 自动改写, 模型: ${process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'}, 标题: ${article.title}`)

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

      let generatedContent = completion.choices[0]?.message?.content || ''
      if (!generatedContent) throw new Error('AI 生成内容为空')

      const imagePlaceholderRegex = /IMAGE_PLACEHOLDER_(\d+)(?:\(([^)]+)\))?/g
      let match
      const placeholders: Array<{ index: number; altText: string; keywords: string; fullMatch: string }> = []

      while ((match = imagePlaceholderRegex.exec(generatedContent)) !== null) {
        const placeholderIndex = parseInt(match[1], 10)
        const keywords = match[2] || ''
        const textBefore = generatedContent.substring(Math.max(0, match.index - 100), match.index)
        const altMatch = textBefore.match(/!\[([^\]]*)\]\s*$/)
        placeholders.push({
          index: placeholderIndex,
          altText: altMatch ? altMatch[1] : `Image ${placeholderIndex}`,
          keywords,
          fullMatch: match[0]
        })
      }

      console.log(`[内容解析] 发现图片占位孔数: ${placeholders.length}`)
      let successCount = 0
      for (const placeholder of placeholders) {
        const imageUrl = await searchImage(placeholder.keywords, placeholder.altText, article.title)
        if (imageUrl) {
          const r2Url = await uploadImageToR2(imageUrl, placeholder.altText, placeholder.index - 1, article.slug)
          if (r2Url) {
            console.log(`[图片处理] 占位符 ${placeholder.index} 已替换为 R2 URL: ${r2Url}`)
            generatedContent = generatedContent.replace(placeholder.fullMatch, r2Url)
            successCount++
          }
        }
      }

      if (placeholders.length > 0 && successCount === 0) throw new Error('未能匹配到任何相关图片')

      generatedContent = generatedContent.replace(/IMAGE_PLACEHOLDER_\d+(?:\([^)]*\))?/g, '')

      let coverImageUrl = article.coverImage
      const firstImageMatch = generatedContent.match(/!\[([^\]]*)\]\(([^)]+)\)/)
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
          content: generatedContent,
          coverImage: coverImageUrl,
          aiRewriteStatus: 'completed',
          aiRewriteAt: new Date(),
          published: successCount > 0,
          publishedAt: successCount > 0 ? new Date() : undefined
        }
      })
    } catch (error: any) {
      console.error(`[AI 处理失败] 标题: ${article.title}, 错误:`, error.message)
      await prisma.article.update({
        where: { id: article.id },
        data: { aiRewriteStatus: 'failed' }
      })
    }
  }
}

export async function GET() {
  try {
    const adminId = await checkAdmin()
    if (!adminId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    processArticles()
    return NextResponse.json({ success: true, message: 'Processing started' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
