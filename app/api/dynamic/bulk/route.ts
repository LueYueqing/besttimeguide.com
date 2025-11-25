import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient, Plan } from '@prisma/client'
import { generateShortCode } from '@/lib/short-code'

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
    const { data } = body

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Data array is required' }, { status: 400 })
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
    }

    // 检查开发用户
    const isDevUser = user.email === 'dev@customqr.pro' && process.env.NODE_ENV === 'development'

    // 检查 Pro 试用权限
    const hasProTrial = user.proTrialExpiresAt && user.proTrialExpiresAt > new Date()

    // 检查计划限制
    if (!isDevUser && !hasProTrial) {
      const plan = user.plan ?? Plan.FREE
      const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE
      const currentDynamicCount = await prisma.qRCode.count({
        where: { userId: user.id, isDynamic: true },
      })

      const requestedCount = data.length
      if (currentDynamicCount + requestedCount > limit) {
        return NextResponse.json(
          {
            success: false,
            error: `You can only create ${limit} dynamic QR codes. You currently have ${currentDynamicCount}, and you're trying to create ${requestedCount} more.`,
          },
          { status: 403 }
        )
      }
    }

    const baseUrl = getBaseUrl(request)
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
      created: [] as Array<{
        id: number
        title: string
        shortUrl: string
        shortCode: string
      }>,
    }

    // 批量创建
    for (const row of data) {
      const rowIndex = row._rowIndex || 0
      try {
        // 提取字段（不区分大小写）
        const title = row.title || row.Title || row.TITLE || ''
        const targetUrl = row.targeturl || row.targetUrl || row.TARGETURL || row.url || row.Url || row.URL || ''
        const description = row.description || row.Description || row.DESCRIPTION || ''

        // 验证必填字段
        if (!title || !targetUrl) {
          results.failed++
          results.errors.push({
            row: rowIndex,
            error: 'Missing required fields: title and targeturl are required',
          })
          continue
        }

        // 验证URL格式
        if (!validateUrl(targetUrl)) {
          results.failed++
          results.errors.push({
            row: rowIndex,
            error: 'Invalid URL format. Must start with http:// or https://',
          })
          continue
        }

        // 生成短码
        const shortCode = await generateUniqueShortCode()
        const shortUrl = `${baseUrl}/r/${shortCode}`

        // 创建QR码
        const qrCode = await prisma.qRCode.create({
          data: {
            userId: user.id,
            title: title.trim(),
            description: description?.trim() || null,
            type: 'URL',
            targetUrl: targetUrl.trim(),
            shortCode,
            isDynamic: true,
            isActive: true,
            content: {
              url: targetUrl.trim(),
              shortUrl,
            },
          },
        })

        results.success++
        results.created.push({
          id: qrCode.id,
          title: qrCode.title || '',
          shortUrl,
          shortCode,
        })
      } catch (error: any) {
        results.failed++
        results.errors.push({
          row: rowIndex,
          error: error?.message || 'Unknown error occurred',
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('Error creating bulk QR codes:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

