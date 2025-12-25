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
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            stripeSubscriptionId: { not: null },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      )
    }

    const subscription = user.subscriptions[0]

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found for this email address' },
        { status: 404 }
      )
    }

    // 通过 Stripe API 取消订阅（在周期结束时取消）
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)

      if (stripeSubscription.status === 'canceled') {
        // 订阅已经取消，更新数据库
        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
            status: 'CANCELED',
            canceledAt: new Date(),
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Your subscription has already been canceled.',
        })
      }

      // 取消订阅（在周期结束时取消，而不是立即取消）
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })

      // 更新数据库
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
        },
      })

      // 计算到期日期
      const expiresAt = stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null

      return NextResponse.json({
        success: true,
        message: `Your subscription has been canceled. You will continue to have access until ${expiresAt ? expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'the end of your billing period'}.`,
      })
    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError)
      return NextResponse.json(
        { success: false, error: `Failed to cancel subscription: ${stripeError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

