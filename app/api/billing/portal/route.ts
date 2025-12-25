import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

// 只在有 Stripe key 时初始化，避免构建时错误
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      // 使用默认 API 版本
    })
  : null

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to continue' },
        { status: 401 }
      )
    }

    // 转换 userId 为数字
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 })
    }

    // 获取用户的订阅信息
    const userSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        stripeCustomerId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!userSubscription?.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    // 获取基础 URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || request.nextUrl.origin

    // 创建 Customer Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: `${baseUrl}/profile`,
    })

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    })
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}

