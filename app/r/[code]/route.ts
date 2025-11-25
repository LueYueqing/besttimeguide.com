import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { parseUserAgent, formatDeviceInfo } from '@/lib/user-agent'

const prisma = new PrismaClient()

interface ScheduleConfig {
  timeRanges?: {
    day: string
    start: string
    end: string
    enabled: boolean
  }[]
  timezone?: string
  startDate?: string | null
  endDate?: string | null
  scanLimit?: number | null
}

function checkScheduleRestrictions(qrCode: any): { allowed: boolean; errorType?: string; message?: string } {
  const config = qrCode.scheduleConfig as ScheduleConfig | null

  if (!config) {
    return { allowed: true }
  }

  const now = new Date()

  // 检查日期调度
  if (config.startDate || config.endDate) {
    const startDate = config.startDate ? new Date(config.startDate) : null
    const endDate = config.endDate ? new Date(config.endDate) : null

    if (startDate && now < startDate) {
      return {
        allowed: false,
        errorType: 'time_restricted',
        message: `This QR code will be available starting ${startDate.toLocaleDateString()}`,
      }
    }

    if (endDate && now > endDate) {
      return {
        allowed: false,
        errorType: 'expired',
        message: `This QR code expired on ${endDate.toLocaleDateString()}`,
      }
    }
  }

  // 检查时间调度
  if (config.timeRanges && config.timeRanges.length > 0) {
    const enabledRanges = config.timeRanges.filter((r) => r.enabled)
    if (enabledRanges.length > 0) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const currentDay = dayNames[now.getDay()]
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

      const todayRange = enabledRanges.find((r) => r.day === currentDay)
      if (!todayRange) {
        return {
          allowed: false,
          errorType: 'time_restricted',
          message: 'This QR code is not available on this day of the week.',
        }
      }

      if (currentTime < todayRange.start || currentTime > todayRange.end) {
        return {
          allowed: false,
          errorType: 'time_restricted',
          message: `This QR code is only available between ${todayRange.start} and ${todayRange.end} on ${currentDay}.`,
        }
      }
    }
  }

  // 检查扫描限制
  if (config.scanLimit !== null && config.scanLimit !== undefined) {
    if (qrCode.scanCount >= config.scanLimit) {
      return {
        allowed: false,
        errorType: 'limit_reached',
        message: `This QR code has reached its scan limit of ${config.scanLimit}.`,
      }
    }
  }

  return { allowed: true }
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return request.ip ?? undefined
}

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const shortCode = params.code

  if (!shortCode) {
    return NextResponse.json({ success: false, error: 'Short code is required.' }, { status: 400 })
  }

  const qrCode = await prisma.qRCode.findUnique({
    where: { shortCode },
  })

  if (!qrCode || !qrCode.isDynamic || !qrCode.isActive || !qrCode.targetUrl) {
    // 返回友好的 HTML 错误页面，而不是 JSON
    const errorPage = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>QR Code Not Found | CustomQR.pro</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1rem;
            }
            .container {
              max-width: 28rem;
              width: 100%;
              background: white;
              border-radius: 1rem;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              padding: 2rem;
              text-align: center;
            }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { font-size: 1.5rem; font-weight: bold; color: #111827; margin-bottom: 0.75rem; }
            p { color: #4b5563; margin-bottom: 1.5rem; }
            a {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 0.5rem;
              background: #2563eb;
              color: white;
              padding: 0.75rem 1.5rem;
              font-weight: 500;
              text-decoration: none;
              transition: background 0.2s;
            }
            a:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🔍</div>
            <h1>QR Code Not Found</h1>
            <p>This QR code doesn't exist or is no longer active. Please check the URL and try again.</p>
            <a href="/">Go to Homepage</a>
          </div>
        </body>
      </html>
    `
    return new NextResponse(errorPage, {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // 检查调度和限制
  const restrictionCheck = checkScheduleRestrictions(qrCode)
  if (!restrictionCheck.allowed) {
    // 返回错误页面 HTML
    const errorPage = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${restrictionCheck.errorType === 'expired' ? 'QR Code Expired' : restrictionCheck.errorType === 'limit_reached' ? 'Scan Limit Reached' : 'Access Restricted'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1rem;
            }
            .container {
              max-width: 28rem;
              width: 100%;
              background: white;
              border-radius: 1rem;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              padding: 2rem;
              text-align: center;
            }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { font-size: 1.5rem; font-weight: bold; color: #111827; margin-bottom: 0.75rem; }
            p { color: #4b5563; margin-bottom: 1.5rem; }
            a {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 0.5rem;
              background: #2563eb;
              color: white;
              padding: 0.75rem 1.5rem;
              font-weight: 500;
              text-decoration: none;
              transition: background 0.2s;
            }
            a:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">${restrictionCheck.errorType === 'expired' ? '⏰' : restrictionCheck.errorType === 'limit_reached' ? '🚫' : '🕐'}</div>
            <h1>${restrictionCheck.errorType === 'expired' ? 'QR Code Expired' : restrictionCheck.errorType === 'limit_reached' ? 'Scan Limit Reached' : 'Not Available Now'}</h1>
            <p>${restrictionCheck.message || 'This QR code is not currently accessible.'}</p>
            <a href="/">Go to Homepage</a>
          </div>
        </body>
      </html>
    `
    return new NextResponse(errorPage, {
      status: 403,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const userAgent = request.headers.get('user-agent') || ''
  const ipAddress = getClientIp(request)
  
  // 解析设备信息
  const deviceInfo = parseUserAgent(userAgent)
  const deviceString = formatDeviceInfo(deviceInfo)
  
  // 提取主要信息用于统计
  const os = deviceInfo.os || null
  const browser = deviceInfo.browser || null
  const deviceType = deviceInfo.deviceType || null

  // Update scan count and log analytics (best-effort, should not block redirect)
  // 注意：在检查限制之后才增加扫描次数
  prisma.qRCode
    .update({
      where: { id: qrCode.id },
      data: {
        scanCount: { increment: 1 },
        lastScanAt: new Date(),
        analytics: {
          create: {
            userAgent,
            ipAddress,
            device: deviceString, // 存储完整格式化的设备信息
            // 注意：如果需要单独存储 os 和 browser，需要先更新 schema
          },
        },
      },
    })
    .catch((error) => {
      console.error('Failed to log QR scan:', error)
    })

  return NextResponse.redirect(qrCode.targetUrl, { status: 302 })
}

