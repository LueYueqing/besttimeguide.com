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

// 生成slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
    .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
}

// 确保slug唯一
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug },
    })

    if (!existing) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

// POST - 批量创建文章
export async function POST(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { titles, categoryId } = body

    // 验证必填字段
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Titles array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId, 10) },
    })

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 400 })
    }

    const results = []
    const errors = []

    // 批量创建文章
    for (let i = 0; i < titles.length; i++) {
      const title = titles[i].trim()
      
      if (!title || title.length === 0) {
        errors.push({ index: i, title, error: 'Title is empty' })
        continue
      }

      try {
        // 生成唯一的slug
        const baseSlug = generateSlug(title)
        const slug = await ensureUniqueSlug(baseSlug)

        // 创建文章（作为草稿）
        const article = await prisma.article.create({
          data: {
            title,
            slug,
            description: null,
            content: `# ${title}\n\n<!-- 请在此处填写文章内容 -->`,
            categoryId: parseInt(categoryId, 10),
            authorId: adminId,
            metaTitle: null,
            metaDescription: null,
            keywords: null,
            tags: null,
            featured: false,
            published: false, // 默认作为草稿
            publishedAt: null,
            readingTime: null,
            sourceContent: null,
            aiRewriteStatus: null,
            aiRewriteAt: null,
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
          slug: article.slug,
        })
      } catch (error: any) {
        console.error(`Error creating article "${title}":`, error)
        errors.push({
          index: i,
          title,
          error: error.message || 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      created: results.length,
      failed: errors.length,
      total: titles.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully created ${results.length} article(s)${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
    })
  } catch (error: any) {
    console.error('Error batch creating articles:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

