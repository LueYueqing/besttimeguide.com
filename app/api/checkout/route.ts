import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

// 验证密钥格式
if (!stripeSecretKey) {
  console.error('[Stripe] STRIPE_SECRET_KEY is not set')
}

if (stripeSecretKey && !stripeSecretKey.startsWith('sk_')) {
  console.error('[Stripe] Invalid STRIPE_SECRET_KEY format. It should start with "sk_test_" or "sk_live_"')
  console.error('[Stripe] Make sure you are using the SECRET key, not the PUBLISHABLE key (pk_...)')
}

const stripe = new Stripe(stripeSecretKey, {
  // 使用默认 API 版本，避免版本不匹配问题
})

// 价格配置（需要先在 Stripe Dashboard 创建这些 Price ID）
const PRICE_IDS = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_enterprise_annual',
  },
} as const

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to continue' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan, billing } = body

    if (!plan || !['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      )
    }

    if (!billing || !['monthly', 'annual'].includes(billing)) {
      return NextResponse.json(
        { success: false, error: 'Invalid billing period' },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS][billing as 'monthly' | 'annual']

    // 转换 userId 为数字
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 })
    }

    // 检查用户是否已有活跃订阅
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    // 如果已有活跃订阅，检查是否是升级/降级/切换计费周期
    if (existingSubscription) {
      const currentPlan = existingSubscription.plan?.toLowerCase()
      const targetPlan = plan.toLowerCase()
      
      // 判断是否是相同计划
      const isSamePlan = currentPlan === targetPlan
      
      // 判断是否是升级（Pro -> Enterprise）
      const isUpgrade = currentPlan === 'pro' && targetPlan === 'enterprise'
      
      // 判断是否是降级（Enterprise -> Pro）
      const isDowngrade = currentPlan === 'enterprise' && targetPlan === 'pro'
      
      // 判断是否切换计费周期（月付 <-> 年付）
      // 这里需要从现有订阅中获取计费周期信息
      // 由于我们存储的是 priceId，需要检查 priceId 是否包含 monthly/annual
      const currentPriceId = existingSubscription.stripePriceId || ''
      const isCurrentMonthly = currentPriceId.includes('monthly') || currentPriceId.includes('MONTHLY')
      const isCurrentAnnual = currentPriceId.includes('annual') || currentPriceId.includes('ANNUAL')
      const isSwitchingBilling = 
        (isCurrentMonthly && billing === 'annual') || 
        (isCurrentAnnual && billing === 'monthly')
      
      // 如果是相同计划且相同计费周期，阻止并提示使用订阅管理页面
      if (isSamePlan && !isSwitchingBilling) {
        return NextResponse.json(
          {
            success: false,
            error: 'You already have an active subscription for this plan. Please manage your subscription from your account settings.',
            hasActiveSubscription: true,
            currentPlan: currentPlan,
          },
          { status: 400 }
        )
      }
      
      // 如果是升级、降级或切换计费周期，允许创建新订阅
      // Webhook 会自动取消旧订阅并激活新订阅
      // 注意：Stripe 会根据订阅周期自动处理按比例退款/补款
      console.log(`[Checkout] User ${userId} is ${isUpgrade ? 'upgrading' : isDowngrade ? 'downgrading' : 'switching billing'} from ${currentPlan} to ${targetPlan}`)
      
      // 记录升级/降级信息到 metadata，方便后续追踪
      // 这个信息会在 webhook 中处理
    }

    // 获取基础 URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || request.nextUrl.origin

    // 检查用户是否已有 Stripe Customer ID（用于关联到同一个 Stripe Customer）
    let customerId: string | undefined = undefined
    const existingCustomer = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        stripeCustomerId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      select: { stripeCustomerId: true },
    })

    if (existingCustomer?.stripeCustomerId) {
      customerId = existingCustomer.stripeCustomerId
    }

    // 创建 Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(customerId ? { customer: customerId } : { customer_email: session.user.email || undefined }),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        plan: plan.toUpperCase(),
        billing,
        priceId,
        ...(existingSubscription ? {
          previousPlan: existingSubscription.plan || 'UNKNOWN',
          isUpgrade: existingSubscription.plan?.toLowerCase() === 'pro' && plan.toLowerCase() === 'enterprise' ? 'true' : 'false',
          isDowngrade: existingSubscription.plan?.toLowerCase() === 'enterprise' && plan.toLowerCase() === 'pro' ? 'true' : 'false',
        } : {}),
      },
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan: plan.toUpperCase(),
          billing,
          priceId,
          ...(existingSubscription ? {
            previousPlan: existingSubscription.plan || 'UNKNOWN',
            isUpgrade: existingSubscription.plan?.toLowerCase() === 'pro' && plan.toLowerCase() === 'enterprise' ? 'true' : 'false',
            isDowngrade: existingSubscription.plan?.toLowerCase() === 'enterprise' && plan.toLowerCase() === 'pro' ? 'true' : 'false',
          } : {}),
        },
        // 不设置 trial_period_days，表示没有试用期，立即开始计费
      },
    })

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

