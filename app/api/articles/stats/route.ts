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

// GET - 获取文章统计（管理员）
export async function GET(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 获取文章统计
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      featuredArticles,
      totalCategories,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { published: true } }),
      prisma.article.count({ where: { published: false } }),
      prisma.article.count({ where: { featured: true, published: true } }),
      prisma.category.count(),
    ])

    // 获取最近发布的文章
    const recentArticles = await prisma.article.findMany({
      where: { published: true },
      take: 5,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      stats: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
        featured: featuredArticles,
        categories: totalCategories,
      },
      recentArticles,
    })
  } catch (error) {
    console.error('Error fetching article stats:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

