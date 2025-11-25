import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient, Plan } from '@prisma/client'
import { generateShortCode } from '@/lib/short-code'
import { generateQRPreview } from '@/lib/qr-preview-generator'

const prisma = new PrismaClient()

const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 3,
  PRO: 50,
  ENTERPRISE: 500,
}

function getBaseUrl(request: NextRequest) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
  if (envUrl) {
    try {
      return new URL(envUrl).origin
    } catch {
      return envUrl
    }
  }
  return request.nextUrl.origin
}

async function generateUniqueShortCode() {
  const maxAttempts = 5
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateShortCode(8)
    const existing = await prisma.qRCode.findUnique({
      where: { shortCode: candidate },
      select: { id: true },
    })
    if (!existing) {
      return candidate
    }
  }
  throw new Error('Unable to generate unique short code')
}

function validateUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, targetUrl, scheduleConfig, frameTemplateId } = body || {}

    if (!targetUrl || typeof targetUrl !== 'string') {
      return NextResponse.json({ success: false, error: 'Destination URL is required.' }, { status: 400 })
    }

    if (!validateUrl(targetUrl)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid URL that starts with http:// or https://.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
    }

    // 开发测试用户不受限制
    const isDevUser = user.email === 'dev@customqr.pro' && process.env.NODE_ENV === 'development'
    
    // 检查 Pro 试用权限
    const hasProTrial = user.proTrialExpiresAt && user.proTrialExpiresAt > new Date()
    
    if (!isDevUser && !hasProTrial) {
      const plan = user.plan ?? Plan.FREE
      const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE
      const dynamicCount = await prisma.qRCode.count({
        where: { userId: user.id, isDynamic: true },
      })

      if (dynamicCount >= limit) {
        return NextResponse.json(
          {
            success: false,
            error: `You have reached the limit of ${limit} dynamic QR codes for your plan.`,
          },
          { status: 403 }
        )
      }
    }

    const shortCode = await generateUniqueShortCode()
    const baseUrl = getBaseUrl(request)
    const shortUrl = `${baseUrl}/r/${shortCode}`

    // 尝试创建动态QR码
    let qrCode
    try {
      qrCode = await prisma.qRCode.create({
        data: {
          userId: user.id,
          title: title?.trim() || 'Dynamic QR Code',
          description: description?.trim() || null,
          type: 'URL',
          targetUrl,
          shortCode,
          isDynamic: true,
          content: {
            url: targetUrl,
            shortUrl,
            frameTemplateId: frameTemplateId || null,
          },
          scheduleConfig: scheduleConfig && Object.keys(scheduleConfig).length > 0 ? scheduleConfig : null,
        },
      })
    } catch (dbError: any) {
      // 检查是否是数据库字段缺失错误
      if (dbError?.code === 'P2002' || dbError?.message?.includes('column') || dbError?.message?.includes('does not exist')) {
        console.error('Database schema error - migration may not be applied:', dbError)
        throw new Error('Database migration required. Please run: npx prisma migrate deploy')
      }
      throw dbError
    }

    // 生成预览图（异步，不阻塞响应）
    generateQRPreview(qrCode.id, shortUrl, frameTemplateId || null).catch((error) => {
      console.error(`Failed to generate preview for QR ${qrCode.id}:`, error)
      // 预览图生成失败不影响创建流程
    })

    return NextResponse.json({
      success: true,
      data: {
        id: qrCode.id,
        title: qrCode.title,
        targetUrl,
        shortUrl,
        shortCode,
      },
    })
  } catch (error) {
    console.error('Error creating dynamic QR code:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // 在生产环境只返回通用错误，开发环境返回详细错误
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      {
        success: false,
        error: isDevelopment ? `Internal server error: ${errorMessage}` : 'Internal server error.',
        ...(isDevelopment && errorStack ? { stack: errorStack } : {}),
      },
      { status: 500 }
    )
  }
}

