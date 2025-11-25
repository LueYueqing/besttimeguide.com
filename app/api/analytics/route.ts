import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { hasAnalyticsAccess } from '@/lib/subscription'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 转换 userId 为数字
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 })
    }

    // 检查用户是否有权限访问 Analytics
    const hasAccess = await hasAnalyticsAccess(userId)
    if (!hasAccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Analytics is a premium feature. Please upgrade to Pro or Enterprise plan.',
          requiresUpgrade: true 
        },
        { status: 403 }
      )
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d' // 7d, 30d, 90d

    // 计算时间范围
    const now = new Date()
    let startDate: Date
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // 1. 总体概览统计
    const totalScans = await prisma.qRAnalytics.count({
      where: {
        qrCode: {
          userId: user.id,
          isDynamic: true,
        },
      },
    })

    const activeQRCodes = await prisma.qRCode.count({
      where: {
        userId: user.id,
        isDynamic: true,
        isActive: true,
      },
    })

    // 今日扫描（从今天00:00开始）
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const todayScans = await prisma.qRAnalytics.count({
      where: {
        qrCode: {
          userId: user.id,
          isDynamic: true,
        },
        scannedAt: {
          gte: todayStart,
        },
      },
    })

    // 昨日扫描（用于计算增长率）
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayEnd = new Date(todayStart.getTime() - 1)
    const yesterdayScans = await prisma.qRAnalytics.count({
      where: {
        qrCode: {
          userId: user.id,
          isDynamic: true,
        },
        scannedAt: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
      },
    })

    const growthRate =
      yesterdayScans > 0 ? ((todayScans - yesterdayScans) / yesterdayScans) * 100 : 0

    // 2. 时间趋势数据（按天统计）
    const timeSeries: Array<{ date: string; scans: number }> = []
    // 设置开始日期为当天的 00:00:00
    const startDateNormalized = new Date(startDate)
    startDateNormalized.setHours(0, 0, 0, 0)
    
    // 确保包含今天，设置结束日期为今天的 23:59:59
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)
    
    const currentDate = new Date(startDateNormalized)
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const count = await prisma.qRAnalytics.count({
        where: {
          qrCode: {
            userId: user.id,
            isDynamic: true,
          },
          scannedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      })

      timeSeries.push({
        date: dayStart.toISOString().split('T')[0],
        scans: count,
      })

      // 移动到下一天
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 3. Top QR码排行榜
    // 最受欢迎的QR码（总扫描数）
    const topByScans = await prisma.qRCode.findMany({
      where: {
        userId: user.id,
        isDynamic: true,
      },
      select: {
        id: true,
        title: true,
        scanCount: true,
        lastScanAt: true,
        createdAt: true,
        _count: {
          select: {
            analytics: {
              where: {
                scannedAt: {
                  gte: startDate,
                },
              },
            },
          },
        },
      },
      orderBy: {
        scanCount: 'desc',
      },
      take: 10,
    })

    // 最近活跃的QR码
    const topByRecent = await prisma.qRCode.findMany({
      where: {
        userId: user.id,
        isDynamic: true,
        lastScanAt: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        scanCount: true,
        lastScanAt: true,
        createdAt: true,
        _count: {
          select: {
            analytics: {
              where: {
                scannedAt: {
                  gte: startDate,
                },
              },
            },
          },
        },
      },
      orderBy: {
        lastScanAt: 'desc',
      },
      take: 10,
    })

    // 增长最快的QR码（基于时间范围内的扫描数）
    const allQRCodes = await prisma.qRCode.findMany({
      where: {
        userId: user.id,
        isDynamic: true,
      },
      include: {
        _count: {
          select: {
            analytics: {
              where: {
                scannedAt: {
                  gte: startDate,
                },
              },
            },
          },
        },
      },
    })

    const topByGrowth = allQRCodes
      .map((qr) => ({
        id: qr.id,
        title: qr.title,
        scanCount: qr.scanCount,
        lastScanAt: qr.lastScanAt,
        createdAt: qr.createdAt,
        recentScans: qr._count.analytics,
      }))
      .sort((a, b) => b.recentScans - a.recentScans)
      .slice(0, 10)

    // 4. 设备类型分析（按操作系统分组）
    const deviceAnalytics = await prisma.qRAnalytics.findMany({
      where: {
        qrCode: {
          userId: user.id,
          isDynamic: true,
        },
        scannedAt: {
          gte: startDate,
        },
        device: {
          not: null,
        },
      },
      select: {
        device: true,
      },
    })

    // 解析设备信息并按操作系统分组
    const osStats: Record<string, number> = {}
    const browserStats: Record<string, number> = {}
    const deviceTypeStats: Record<string, number> = {}

    deviceAnalytics.forEach((item) => {
      if (!item.device) return
      
      // 从格式化的设备信息中提取 OS
      const osMatch = item.device.match(/OS:\s*([^|]+)/i)
      if (osMatch) {
        const os = osMatch[1].trim()
        osStats[os] = (osStats[os] || 0) + 1
      }
      
      // 提取浏览器
      const browserMatch = item.device.match(/Browser:\s*([^|]+)/i)
      if (browserMatch) {
        const browser = browserMatch[1].trim()
        browserStats[browser] = (browserStats[browser] || 0) + 1
      }
      
      // 提取设备类型（从 userAgent 或 device 字段推断）
      // 如果 device 包含 mobile/tablet/desktop，使用它
      const deviceTypeMatch = item.device.match(/(mobile|tablet|desktop)/i)
      if (deviceTypeMatch) {
        const type = deviceTypeMatch[1].toLowerCase()
        deviceTypeStats[type] = (deviceTypeStats[type] || 0) + 1
      }
    })

    // 转换为数组格式并按数量排序
    const osDistribution = Object.entries(osStats)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const browserDistribution = Object.entries(browserStats)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const deviceTypeDistribution = Object.entries(deviceTypeStats)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    // 5. 地理位置分析（Top 10 国家/城市）
    const geoAnalytics = await prisma.qRAnalytics.groupBy({
      by: ['country', 'city'],
      where: {
        qrCode: {
          userId: user.id,
          isDynamic: true,
        },
        scannedAt: {
          gte: startDate,
        },
        country: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 20,
    })

    // 按国家分组统计
    const countryStats: Record<string, number> = {}
    const cityStats: Array<{ country: string; city: string; count: number }> = []

    geoAnalytics.forEach((item) => {
      if (item.country) {
        countryStats[item.country] = (countryStats[item.country] || 0) + item._count.id
        if (item.city) {
          cityStats.push({
            country: item.country,
            city: item.city,
            count: item._count.id,
          })
        }
      }
    })

    const topCountries = Object.entries(countryStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const topCities = cityStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalScans,
          activeQRCodes,
          todayScans,
          growthRate: Math.round(growthRate * 100) / 100,
        },
        timeSeries,
        topQRCodes: {
          byScans: topByScans.map((qr) => ({
            id: qr.id,
            title: qr.title || 'Untitled',
            scanCount: qr.scanCount,
            recentScans: qr._count.analytics,
            lastScanAt: qr.lastScanAt,
            createdAt: qr.createdAt,
          })),
          byRecent: topByRecent.map((qr) => ({
            id: qr.id,
            title: qr.title || 'Untitled',
            scanCount: qr.scanCount,
            recentScans: qr._count.analytics,
            lastScanAt: qr.lastScanAt,
            createdAt: qr.createdAt,
          })),
          byGrowth: topByGrowth.map((qr) => ({
            id: qr.id,
            title: qr.title || 'Untitled',
            scanCount: qr.scanCount,
            recentScans: qr.recentScans,
            lastScanAt: qr.lastScanAt,
            createdAt: qr.createdAt,
          })),
        },
        deviceAnalysis: {
          osDistribution,
          browserDistribution,
          deviceTypeDistribution,
        },
        geoAnalysis: {
          topCountries,
          topCities,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}


