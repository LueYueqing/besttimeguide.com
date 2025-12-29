import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

// GET - 获取图片列表（支持搜索和排序）
export async function GET(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get('keyword') || ''
    const articleId = searchParams.get('articleId') ? parseInt(searchParams.get('articleId')!) : null
    const sortBy = searchParams.get('sortBy') || 'createdAt' // createdAt, size, order, article
    const sortOrder = searchParams.get('sortOrder') || 'desc' // asc, desc
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 构建查询条件
    const where: any = {}
    
    if (keyword) {
      where.OR = [
        { slug: { contains: keyword, mode: 'insensitive' } },
        { name: { contains: keyword, mode: 'insensitive' } },
        { altText: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    if (articleId) {
      where.articleId = articleId
    }

    // 构建排序
    const orderBy: any = {}
    if (sortBy === 'article') {
      orderBy.article = { title: sortOrder }
    } else {
      orderBy[sortBy] = sortOrder
    }

    // 查询总数
    const total = await prisma.articleImage.count({ where })

    // 查询图片列表
    const images = await prisma.articleImage.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('[Article Images GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch images' },
      { status: 500 }
    )
  }
}
