import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { hasAnalyticsAccess } from '@/lib/subscription'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Next.js 15: params 需要先 await
    const { id } = await params
    const qrCodeId = parseInt(id, 10)

    if (isNaN(qrCodeId)) {
      return NextResponse.json({ success: false, error: 'Invalid QR code ID' }, { status: 400 })
    }

    // 验证 QR 码所有权
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: qrCodeId,
        userId: user.id,
      },
    })

    if (!qrCode) {
      return NextResponse.json({ success: false, error: 'QR code not found' }, { status: 404 })
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
        qrCodeId: qrCodeId,
      },
    })

    const timeRangeScans = await prisma.qRAnalytics.count({
      where: {
        qrCodeId: qrCodeId,
        scannedAt: {
          gte: startDate,
        },
      },
    })

    // 今日扫描（从今天00:00开始）
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const todayScans = await prisma.qRAnalytics.count({
      where: {
        qrCodeId: qrCodeId,
        scannedAt: {
          gte: todayStart,
        },
      },
    })

    // 2. 时间序列数据（按天统计）
    const timeSeries: Array<{ date: string; count: number }> = []
    const currentDate = new Date(startDate)
    while (currentDate <= now) {
      const dayStart = new Date(currentDate.setHours(0, 0, 0, 0))
      const dayEnd = new Date(currentDate.setHours(23, 59, 59, 999))

      const count = await prisma.qRAnalytics.count({
        where: {
          qrCodeId: qrCodeId,
          scannedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      })

      timeSeries.push({
        date: dayStart.toISOString().split('T')[0],
        count,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 3. 设备分析
    const allAnalytics = await prisma.qRAnalytics.findMany({
      where: {
        qrCodeId: qrCodeId,
        scannedAt: {
          gte: startDate,
        },
      },
      select: {
        device: true,
        userAgent: true,
      },
    })

    // 解析设备信息
    const deviceTypeMap = new Map<string, number>()
    const osMap = new Map<string, number>()
    const browserMap = new Map<string, number>()

    allAnalytics.forEach((analytics) => {
      // 设备类型
      if (analytics.device) {
        const deviceType = analytics.device.includes('Mobile') ? 'Mobile' : 
                         analytics.device.includes('Tablet') ? 'Tablet' : 'Desktop'
        deviceTypeMap.set(deviceType, (deviceTypeMap.get(deviceType) || 0) + 1)
      }

      // 操作系统（从 userAgent 解析）
      if (analytics.userAgent) {
        const ua = analytics.userAgent.toLowerCase()
        if (ua.includes('windows')) osMap.set('Windows', (osMap.get('Windows') || 0) + 1)
        else if (ua.includes('mac')) osMap.set('macOS', (osMap.get('macOS') || 0) + 1)
        else if (ua.includes('linux')) osMap.set('Linux', (osMap.get('Linux') || 0) + 1)
        else if (ua.includes('android')) osMap.set('Android', (osMap.get('Android') || 0) + 1)
        else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) osMap.set('iOS', (osMap.get('iOS') || 0) + 1)

        // 浏览器
        if (ua.includes('chrome') && !ua.includes('edg')) browserMap.set('Chrome', (browserMap.get('Chrome') || 0) + 1)
        else if (ua.includes('firefox')) browserMap.set('Firefox', (browserMap.get('Firefox') || 0) + 1)
        else if (ua.includes('safari') && !ua.includes('chrome')) browserMap.set('Safari', (browserMap.get('Safari') || 0) + 1)
        else if (ua.includes('edg')) browserMap.set('Edge', (browserMap.get('Edge') || 0) + 1)
      }
    })

    const deviceTypeDistribution = Array.from(deviceTypeMap.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)

    const osDistribution = Array.from(osMap.entries())
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count)

    const browserDistribution = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)

    // 4. 地理位置分析
    const geoData = await prisma.qRAnalytics.findMany({
      where: {
        qrCodeId: qrCodeId,
        scannedAt: {
          gte: startDate,
        },
      },
      select: {
        country: true,
        city: true,
      },
    })

    const countryMap = new Map<string, number>()
    const cityMap = new Map<string, number>()

    geoData.forEach((geo) => {
      if (geo.country) {
        countryMap.set(geo.country, (countryMap.get(geo.country) || 0) + 1)
      }
      if (geo.city) {
        const key = `${geo.city}, ${geo.country || 'Unknown'}`
        cityMap.set(key, (cityMap.get(key) || 0) + 1)
      }
    })

    const topCountries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const topCities = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 5. 计算增长率
    const firstHalf = timeSeries.slice(0, Math.floor(timeSeries.length / 2))
    const secondHalf = timeSeries.slice(Math.floor(timeSeries.length / 2))
    const firstHalfTotal = firstHalf.reduce((sum, item) => sum + item.count, 0)
    const secondHalfTotal = secondHalf.reduce((sum, item) => sum + item.count, 0)
    const growthRate = firstHalfTotal > 0 
      ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalScans,
          timeRangeScans,
          todayScans,
          growthRate,
        },
        timeSeries,
        deviceAnalysis: {
          deviceTypeDistribution,
          osDistribution,
          browserDistribution,
        },
        geoAnalysis: {
          topCountries,
          topCities,
        },
        qrCode: {
          id: qrCode.id,
          title: qrCode.title,
          shortCode: qrCode.shortCode,
          scanCount: qrCode.scanCount,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching QR code analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

