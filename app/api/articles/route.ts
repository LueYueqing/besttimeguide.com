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

// 生成slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
    .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
}

// GET - 获取所有文章（管理员）
export async function GET(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const categoryId = searchParams.get('categoryId')

    const where: any = {}
    if (published !== null) {
      where.published = published === 'true'
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10)
    }

    const articles = await prisma.article.findMany({
      where,
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
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 创建文章
export async function POST(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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

    // 验证必填字段
    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    // 生成或使用提供的slug
    const articleSlug = slug || generateSlug(title)

    // 检查slug是否已存在
    const existing = await prisma.article.findUnique({
      where: { slug: articleSlug },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    }

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId, 10) },
    })

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 400 })
    }

    // 计算阅读时间
    const readingTime = calculateReadingTime(content)

    // 处理tags（转换为JSON字符串）
    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null

    // 创建文章
    const article = await prisma.article.create({
      data: {
        title,
        slug: articleSlug,
        description: description || null,
        content,
        categoryId: parseInt(categoryId, 10),
        authorId: adminId,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
        tags: tagsJson,
        featured: featured || false,
        published: published || false,
        publishedAt: published && publishedAt ? new Date(publishedAt) : published ? new Date() : null,
        readingTime,
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

    return NextResponse.json({ success: true, article }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating article:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

