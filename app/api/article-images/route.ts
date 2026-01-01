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
    const getAll = searchParams.get('all') === 'true' // 获取所有图片（用于分组）
    
    // 文件大小筛选
    const minSizeStr = searchParams.get('minSize') || ''
    const maxSizeStr = searchParams.get('maxSize') || ''
    
    // 解析文件大小（支持B/KB/MB单位）
    function parseSize(sizeStr: string): number | null {
      if (!sizeStr) return null
      const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB)?$/i)
      if (!match) return null
      
      const value = parseFloat(match[1])
      const unit = (match[2] || 'B').toUpperCase()
      
      switch (unit) {
        case 'B': return value
        case 'KB': return value * 1024
        case 'MB': return value * 1024 * 1024
        default: return value
      }
    }
    
    const minSize = parseSize(minSizeStr)
    const maxSize = parseSize(maxSizeStr)

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

    // 添加文件大小筛选
    if (minSize !== null || maxSize !== null) {
      where.size = {}
      if (minSize !== null) {
        where.size.gte = minSize
      }
      if (maxSize !== null) {
        where.size.lte = maxSize
      }
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
      skip: getAll ? undefined : (page - 1) * limit,
      take: getAll ? undefined : limit,
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

    // 如果获取所有图片，按文件大小分组
    if (getAll) {
      const groups = images.reduce((acc: Record<number, typeof images>, img) => {
        if (!acc[img.size]) {
          acc[img.size] = []
        }
        acc[img.size].push(img)
        return acc
      }, {})

      // 过滤出重复的组（超过1张图片的组）
      // 并排除同一文章内的重复（只有不同文章中的相同图片才显示）
      const duplicateGroups = Object.entries(groups)
        .filter(([_, imgs]) => {
          // 必须有超过1张图片
          if (imgs.length <= 1) return false
          
          // 检查是否来自不同文章
          const uniqueArticles = new Set(imgs.map(img => img.articleId))
          return uniqueArticles.size > 1
        })
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // 按文件大小降序

      return NextResponse.json({
        success: true,
        data: duplicateGroups,
        pagination: {
          page: 1,
          limit: images.length,
          total: images.length,
          totalPages: 1,
        },
      })
    }

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
