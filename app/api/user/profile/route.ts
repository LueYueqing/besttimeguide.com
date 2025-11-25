import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      console.error('[API][UserProfile] No session or email found', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasEmail: !!session?.user?.email,
      })
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[API][UserProfile] Fetching user profile', {
      email: session.user.email,
    })

    // 从数据库获取用户完整信息
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          subscriptions: {
            where: {
              status: 'ACTIVE',
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
    } catch (dbError: any) {
      console.error('[API][UserProfile] Database query error', {
        email: session.user.email,
        error: dbError?.message || String(dbError),
        code: dbError?.code,
      })
      throw dbError
    }

    if (!user) {
      // 用户不存在可能是因为数据库重置或用户被删除
      // 返回 401 而不是 404，提示用户重新登录
      return NextResponse.json(
        { success: false, error: 'User not found. Please sign in again.' },
        { status: 401 }
      )
    }

    // 获取邀请统计
    let totalReferrals = 0
    let successfulReferrals = 0
    try {
      // 确保 user.id 是数字类型
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
      
      if (!isNaN(userId)) {
        [totalReferrals, successfulReferrals] = await Promise.all([
          prisma.user.count({
            where: { referredBy: userId },
          }),
          prisma.referral.count({
            where: {
              referrerId: userId,
              rewardGranted: true,
            },
          }),
        ])
      } else {
        console.warn('[API][UserProfile] Invalid user ID type', {
          userId: user.id,
          type: typeof user.id,
        })
      }
    } catch (referralError: any) {
      console.error('[API][UserProfile] Error fetching referral stats', {
        userId: user.id,
        error: referralError?.message || String(referralError),
        code: referralError?.code,
      })
      // 继续执行，使用默认值 0
    }

    // 计算 Pro 试用剩余天数
    const proTrialExpiresAt = user.proTrialExpiresAt ? new Date(user.proTrialExpiresAt) : null
    const proTrialDaysLeft = proTrialExpiresAt && proTrialExpiresAt > new Date()
      ? Math.ceil((proTrialExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // 确保返回的 user.id 是数字类型
    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
    
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        image: user.image,
        avatar_url: user.image || user.avatar,
        plan: user.plan,
        isAdmin: user.isAdmin,
        subscription: user.subscriptions[0] || null,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        proTrialExpiresAt: user.proTrialExpiresAt,
        referralStats: {
          totalReferrals,
          successfulReferrals,
        },
        proTrialDaysLeft,
      }
    })
  } catch (error: any) {
    console.error('[API][UserProfile] Error fetching user profile:', {
      error: error?.message || String(error),
      code: error?.code,
      stack: error?.stack,
      name: error?.name,
    })
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorCode = error?.code
    
    // 在开发环境返回详细错误信息
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // 检查是否是数据库连接错误
    if (errorCode && ['P1001', 'P1002', 'P1003'].includes(errorCode)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection error. Please try again later.',
          ...(isDevelopment ? { details: errorMessage, code: errorCode } : {})
        },
        { status: 503 } // Service Unavailable
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: isDevelopment ? `Internal server error: ${errorMessage}` : 'Internal server error',
        ...(isDevelopment && errorStack ? { stack: errorStack } : {}),
        ...(isDevelopment && errorCode ? { code: errorCode } : {})
      },
      { status: 500 }
    )
  }
}

