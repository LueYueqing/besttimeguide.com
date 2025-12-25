import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 检查是否为管理员（用于写操作）
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
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET - 获取所有分类（公开接口，但管理员可以看到所有分类）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

    // 如果要求包含未发布的，需要管理员权限
    if (includeUnpublished) {
      const adminId = await checkAdmin()
      if (!adminId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
    }

    const where: any = {}
    if (!includeUnpublished) {
      // 只返回有已发布文章的分类
      where.articles = {
        some: {
          published: true,
        },
      }
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            articles: includeUnpublished
              ? {}
              : {
                  where: {
                    published: true,
                  },
                },
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 创建分类（仅管理员）
export async function POST(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, parentId, order } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    // 生成或使用提供的slug
    const categorySlug = slug || generateSlug(name)

    // 检查slug是否已存在
    const existing = await prisma.category.findUnique({
      where: { slug: categorySlug },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    }

    // 如果提供了parentId，验证父分类是否存在
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parseInt(parentId, 10) },
      })

      if (!parent) {
        return NextResponse.json({ success: false, error: 'Parent category not found' }, { status: 400 })
      }
    }

    // 创建分类
    const category = await prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        description: description || null,
        parentId: parentId ? parseInt(parentId, 10) : null,
        order: order || 0,
      },
    })

    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

