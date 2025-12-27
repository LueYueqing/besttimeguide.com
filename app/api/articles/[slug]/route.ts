import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import { downloadImage, uploadBufferToR2 } from '@/lib/r2'
import { submitToIndexNow } from '@/lib/indexnow'
import { generateAutoTimeTags } from '@/lib/auto-time-tags'

const prisma = new PrismaClient()

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

// GET - 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const articleId = parseInt(slug, 10)

    if (isNaN(articleId)) {
      return NextResponse.json({ success: false, error: 'Invalid article ID' }, { status: 400 })
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
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

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    // 解析tags
    let tags: string[] = []
    if (article.tags) {
      try {
        tags = JSON.parse(article.tags)
      } catch {
        // 如果不是JSON，尝试按逗号分割
        tags = article.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      }
    }

    return NextResponse.json({
      success: true,
      article: {
        ...article,
        tags,
      },
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { slug: paramSlug } = await params
    const articleId = parseInt(paramSlug, 10)

    if (isNaN(articleId)) {
      return NextResponse.json({ success: false, error: 'Invalid article ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      description,
      content,
      categoryId,
      metaTitle,
      metaDescription,
      keywords,
      tags,
      featured,
      published,
      publishedAt,
      sourceContent,
      articleMode,
    } = body

    // 检查文章是否存在
    const existing = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    // 如果提供了slug且与现有不同，检查是否冲突
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.article.findUnique({
        where: { slug },
      })

      if (slugExists) {
        return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
      }
    }

    // 如果提供了categoryId，验证分类是否存在
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId, 10) },
      })

      if (!category) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 400 })
      }
    }

    // 计算阅读时间（如果内容更新）
    const readingTime = content ? calculateReadingTime(content) : existing.readingTime

    // 自动生成时间标签（如果标题、内容或分类发生变化）
    let tagsJson = existing.tags
    if (tags !== undefined || title !== undefined || content !== undefined || categoryId !== undefined) {
      const currentTitle = title || existing.title
      const currentContent = content || existing.content || ''
      const currentCategoryId = categoryId !== undefined ? parseInt(categoryId, 10) : existing.categoryId
      
      // 获取分类名称
      const currentCategory = await prisma.category.findUnique({
        where: { id: currentCategoryId },
        select: { name: true }
      })
      
      // 解析现有标签
      let existingTags: string[] = []
      if (existing.tags) {
        try {
          const parsed = JSON.parse(existing.tags)
          existingTags = Array.isArray(parsed) ? parsed : []
        } catch {
          existingTags = existing.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
        }
      }
      
      // 使用用户提供的标签或现有标签
      const userTags = tags !== undefined && Array.isArray(tags) ? tags : existingTags
      
      // 自动生成时间标签
      const autoTags = generateAutoTimeTags(
        currentTitle,
        currentContent,
        currentCategory?.name || '',
        userTags
      )
      
      tagsJson = JSON.stringify(autoTags)
    }

    // 如果没有封面图，尝试从内容中提取第一张图片并生成缩略图
    let coverImageUrl = existing.coverImage
    if (!coverImageUrl && content) {
      try {
        // 从 Markdown 内容中提取第一张图片 URL
        const imageRegex = /!\[.*?\]\((.*?)\)/g
        const matches = Array.from(content.matchAll(imageRegex))

        if (matches.length > 0) {
          const firstImageUrl = matches[0][1]

          // 检查是否是有效的 URL
          if (firstImageUrl && (firstImageUrl.startsWith('http://') || firstImageUrl.startsWith('https://'))) {
            try {
              console.log(`[Article Update] Generating cover image from: ${firstImageUrl}`)

              // 下载图片
              const imageBuffer = await downloadImage(firstImageUrl)

              // 使用 sharp 调整为 375x200
              const resizedBuffer = await sharp(imageBuffer)
                .resize(375, 200, {
                  fit: 'cover',
                  position: 'center',
                })
                .jpeg({ quality: 85 })
                .toBuffer()

              // 生成文件名
              const articleSlug = slug || existing.slug
              const fileName = `${articleSlug}-cover-375x200.jpg`

              // 上传到 R2
              coverImageUrl = await uploadBufferToR2(resizedBuffer, fileName, 'image/jpeg')

              console.log(`[Article Update] Cover image uploaded: ${coverImageUrl}`)
            } catch (error) {
              console.error('[Article Update] Error generating cover image:', error)
              // 如果生成失败，继续使用原有的 coverImage（null）
            }
          }
        }
      } catch (error) {
        console.error('[Article Update] Error extracting image from content:', error)
        // 如果提取失败，继续使用原有的 coverImage
      }
    }

    // 更新文章
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description || null
    if (content !== undefined) {
      updateData.content = content
      updateData.readingTime = readingTime
    }
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId, 10)
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle || null
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription || null
    if (keywords !== undefined) updateData.keywords = keywords || null
    if (tags !== undefined) updateData.tags = tagsJson
    if (featured !== undefined) updateData.featured = featured
    if (sourceContent !== undefined) updateData.sourceContent = sourceContent || null
    if (articleMode !== undefined) updateData.articleMode = articleMode
    // 如果生成了新的封面图，更新它
    if (coverImageUrl && coverImageUrl !== existing.coverImage) {
      updateData.coverImage = coverImageUrl
    }
    if (published !== undefined) {
      updateData.published = published
      // 如果从未发布变为发布，设置发布时间
      if (published && !existing.published && !publishedAt) {
        updateData.publishedAt = new Date()
      } else if (publishedAt) {
        updateData.publishedAt = new Date(publishedAt)
      }
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
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

    // 解析tags
    let parsedTags: string[] = []
    if (article.tags) {
      try {
        const parsed = JSON.parse(article.tags) as unknown
        parsedTags = Array.isArray(parsed) ? (parsed as string[]) : []
      } catch {
        parsedTags = article.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      }
    }

    // 触发页面重新生成（如果文章已发布）
    if (article.published) {
      try {
        // 如果 slug 改变了，需要清除旧 slug 的缓存
        if (slug && slug !== existing.slug) {
          console.log(`[Article Update] Slug changed from ${existing.slug} to ${slug}, clearing old cache`)

          // 直接调用 revalidateTag 清除旧 slug 的缓存（更可靠）
          try {
            revalidateTag(`article-${existing.slug}` as string)
            revalidatePath(`/${existing.slug}`, 'page')
            console.log(`[Article Update] Cleared old slug cache: ${existing.slug}`)
          } catch (error) {
            console.warn(`[Article Update] Error clearing old slug cache:`, error)
          }
        }

        // 直接调用 revalidateTag 清除缓存（比 HTTP 调用更可靠、更快）
        revalidateTag(`article-${article.slug}` as string)
        revalidatePath(`/${article.slug}`, 'page')
        revalidatePath(`/${article.slug}`, 'layout')

        // 清除所有文章列表缓存（确保 generateStaticParams 能获取最新列表）
        revalidateTag('all-posts')

        // 同时通过 HTTP 调用作为备用（确保 CDN 等也能刷新）
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const secret = process.env.REVALIDATE_SECRET || ''

        // 异步调用 HTTP revalidate（不等待，作为备用）
        Promise.all([
          fetch(`${baseUrl}/api/revalidate?path=/${article.slug}&secret=${secret}`, { method: 'POST' }).catch(() => { }),
          fetch(`${baseUrl}/api/revalidate?tag=article-${article.slug}&secret=${secret}`, { method: 'POST' }).catch(() => { }),
          fetch(`${baseUrl}/api/revalidate?tag=all-posts&secret=${secret}`, { method: 'POST' }).catch(() => { }),
        ]).catch(() => { })

        console.log(`[Article Update] Revalidated page: /${article.slug}`)

        // 如果文章从未发布变为发布，自动提交到 IndexNow
        if (!existing.published && article.published) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
          const articleUrl = `${siteUrl}/${article.slug}`
          
          console.log(`[Article Update] Submitting newly published article to IndexNow: ${articleUrl}`)
          
          // 异步提交，不阻塞响应
          submitToIndexNow(articleUrl).then((result) => {
            if (result.success) {
              console.log(`[Article Update] Successfully submitted to IndexNow: ${articleUrl}`)
            } else {
              console.warn(`[Article Update] Failed to submit to IndexNow: ${result.error}`)
            }
          }).catch((error) => {
            console.warn(`[Article Update] Error submitting to IndexNow:`, error)
          })
        }
      } catch (revalidateError) {
        console.error('[Article Update] Error revalidating page:', revalidateError)
        // 不阻止更新，即使 revalidate 失败
      }
    }

    return NextResponse.json({
      success: true,
      article: {
        ...article,
        tags: parsedTags,
      },
    })
  } catch (error: any) {
    console.error('Error updating article:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - 重置 AI 改写冷却时间（将 aiRewriteAt 设置为 24 小时前）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const articleId = parseInt(slug, 10)

    if (isNaN(articleId)) {
      return NextResponse.json({ success: false, error: 'Invalid article ID' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const { action } = body

    // 只处理 resetCooldown 操作
    if (action !== 'resetCooldown') {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    // 检查文章是否存在
    const existing = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    // 将 aiRewriteAt 设置为 24 小时前，绕过冷却期
    // 同时将 aiRewriteStatus 设置为 'pending'，使文章进入待处理队列
    const cooldownHours = 24
    const resetTime = new Date()
    resetTime.setHours(resetTime.getHours() - cooldownHours - 1) // 设置为 25 小时前，确保绕过 24 小时限制

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        aiRewriteAt: resetTime,
        aiRewriteStatus: 'pending',
        content: '',
        coverImage: null,
        published: false,
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
      const revalidateUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate?path=/${article.slug}&secret=${process.env.REVALIDATE_SECRET || ''}`
      await fetch(revalidateUrl, { method: 'POST' })

      const tagUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate?tag=article-${article.slug}&secret=${process.env.REVALIDATE_SECRET || ''}`
      await fetch(tagUrl, { method: 'POST' })

      console.log(`[Article Cooldown Reset] Revalidated page: /${article.slug}`)
    } catch (revalidateError) {
      console.error('[Article Cooldown Reset] Error revalidating page:', revalidateError)
    }

    return NextResponse.json({
      success: true,
      article,
      message: 'AI rewrite cooldown reset and status set to pending successfully',
    })
  } catch (error: any) {
    console.error('Error resetting cooldown:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const articleId = parseInt(slug, 10)

    if (isNaN(articleId)) {
      return NextResponse.json({ success: false, error: 'Invalid article ID' }, { status: 400 })
    }

    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    // 删除文章
    await prisma.article.delete({
      where: { id: articleId },
    })

    return NextResponse.json({ success: true, message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
