import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface StatsResponse {
  total: number
  active: number
  paused: number
  archived: number
  dynamic: number
  totalScans: number
}

// GET - 获取用户的QR码列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'all' | 'active' | 'paused' | 'archived'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 构建查询条件
    const where: any = {
      userId: user.id,
    }

    // 状态筛选
    if (status && status !== 'all') {
      if (status === 'active') {
        where.isActive = true
        where.isArchived = false
      } else if (status === 'paused') {
        where.isActive = false
        where.isArchived = false
      } else if (status === 'archived') {
        where.isArchived = true
      }
    } else {
      // 默认不显示已归档的（除非明确要求）
      where.isArchived = false
    }

    // 搜索条件（搜索title，需要从content JSON中提取）
    // 注意：PostgreSQL的JSON查询比较复杂，这里先获取所有数据，然后在应用层过滤
    // 后续可以优化为数据库层查询

    // 获取QR码列表
    let qrCodes = await prisma.qRCode.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            analytics: true,
          },
        },
      },
    })

    // 应用层搜索过滤（如果提供了搜索词）
    if (search) {
      qrCodes = qrCodes.filter(qr => {
        const contentStr = JSON.stringify(qr.content).toLowerCase()
        return contentStr.includes(search.toLowerCase())
      })
    }

    // 分页
    const total = qrCodes.length
    const paginatedQRCodes = qrCodes.slice(skip, skip + limit)

    // 获取统计信息
    const allQRCodes = await prisma.qRCode.findMany({
      where: { userId: user.id },
      select: { isActive: true, isArchived: true },
    })

    const activeCount = allQRCodes.filter(qr => qr.isActive && !qr.isArchived).length
    const pausedCount = allQRCodes.filter(qr => !qr.isActive && !qr.isArchived).length
    const archivedCount = allQRCodes.filter(qr => qr.isArchived).length
    const totalCount = allQRCodes.length

    // 计算总扫描次数
    const totalScans = await prisma.qRCode.aggregate({
      where: { userId: user.id },
      _sum: {
        scanCount: true,
      },
    })

    const dynamicCount = await prisma.qRCode.count({
      where: { userId: user.id, isDynamic: true },
    })

    const statsPayload: StatsResponse = {
      total: totalCount,
      active: activeCount,
      paused: pausedCount,
      archived: archivedCount,
      dynamic: dynamicCount,
      totalScans: totalScans._sum.scanCount || 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        qrCodes: paginatedQRCodes.map(qr => ({
          id: qr.id,
          title: qr.title,
          description: qr.description,
          type: qr.type,
          content: qr.content,
          design: qr.design,
          targetUrl: qr.targetUrl,
          shortCode: qr.shortCode,
          lastScanAt: qr.lastScanAt,
          isDynamic: qr.isDynamic,
          isActive: qr.isActive,
          isArchived: qr.isArchived ?? false, // 确保 isArchived 有默认值
          scanCount: qr.scanCount,
          createdAt: qr.createdAt,
          updatedAt: qr.updatedAt,
          analyticsCount: qr._count.analytics,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: statsPayload,
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/qrcodes:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

