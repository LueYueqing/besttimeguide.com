import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const articleId = parseInt(id, 10)

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const articleId = parseInt(id, 10)

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

    // 处理tags
    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : existing.tags

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
        parsedTags = JSON.parse(article.tags)
      } catch {
        parsedTags = article.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
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

// DELETE - 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const articleId = parseInt(id, 10)

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

