import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

/**
 * 关联邀请人（从 cookie 中读取 ref 参数并关联到当前用户）
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 从 cookie 中读取邀请人 ID
    const cookieStore = await cookies()
    const referralRef = cookieStore.get('referral_ref')?.value

    if (!referralRef) {
      // 没有 referral cookie 是正常情况（用户可能不是通过邀请链接访问的）
      // 返回 200 而不是 400，避免在控制台显示错误
      return NextResponse.json({
        success: true,
        message: 'No referral code found in cookie (this is normal if user did not come from referral link)',
        hasReferral: false,
      })
    }

    // 检查用户是否已经有邀请人
    // session.user.id 可能是字符串，需要转换为数字
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 如果已经有邀请人，不再更新
    if (user.referredBy) {
      return NextResponse.json({
        success: true,
        message: 'User already has a referrer',
        referredBy: user.referredBy,
      })
    }

    // 验证邀请人是否存在且不是自己
    const referralRefId = parseInt(referralRef, 10)
    if (isNaN(referralRefId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 400 }
      )
    }
    if (referralRefId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot refer yourself' },
        { status: 400 }
      )
    }

    const referrer = await prisma.user.findUnique({
      where: { id: referralRefId },
    })

    if (!referrer) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 400 }
      )
    }

    // 关联邀请人
    await prisma.user.update({
      where: { id: user.id },
      data: {
        referredBy: referralRefId,
      },
    })

    // 创建邀请记录
    await prisma.referral.create({
      data: {
        referrerId: referralRefId,
        referredUserId: user.id,
        rewardGranted: false,
      },
    })

    // 如果是首次登录，立即发放奖励
    if (user.loginCount === 0) {
      const { processReferralReward } = await import('@/lib/referral')
      await processReferralReward(user.id)
    }

    // 清除 cookie
    cookieStore.delete('referral_ref')

    return NextResponse.json({
      success: true,
      message: 'Referral associated successfully',
      referredBy: referralRefId,
    })
  } catch (error: any) {
    console.error('Error associating referral:', error)
    
    // 检查是否是数据库连接错误
    const isDatabaseError = error?.message?.includes('Can\'t reach database server') ||
                           error?.message?.includes('database server') ||
                           error?.code === 'P1001' || // Prisma connection error
                           error?.code === 'P1002' || // Prisma timeout error
                           error?.code === 'P1003'    // Prisma database not found
    
    // 对于数据库连接错误，返回通用错误信息，不暴露详细错误
    if (isDatabaseError) {
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 } // Service Unavailable
      )
    }
    
    // 其他错误返回通用错误信息
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
