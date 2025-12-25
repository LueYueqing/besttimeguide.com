import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient, Plan, SubscriptionStatus } from '@prisma/client'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

// 验证密钥格式
if (!stripeSecretKey) {
  console.error('[Stripe] STRIPE_SECRET_KEY is not set')
}

if (stripeSecretKey && !stripeSecretKey.startsWith('sk_')) {
  console.error('[Stripe] Invalid STRIPE_SECRET_KEY format. It should start with "sk_test_" or "sk_live_"')
  console.error('[Stripe] Make sure you are using the SECRET key, not the PUBLISHABLE key (pk_...)')
}

// 只在有 Stripe key 时初始化，避免构建时错误
const stripe = stripeSecretKey && stripeSecretKey.startsWith('sk_')
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    })
  : null

const prisma = new PrismaClient()

const PRICE_TO_PLAN_MAP: Record<string, Plan> = {}

function registerPrice(plan: Plan, priceId?: string | null) {
  if (!priceId) return
  PRICE_TO_PLAN_MAP[priceId] = plan
}

registerPrice(Plan.PRO, process.env.STRIPE_PRICE_PRO_MONTHLY)
registerPrice(Plan.PRO, process.env.STRIPE_PRICE_PRO_ANNUAL)
registerPrice(Plan.ENTERPRISE, process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY)
registerPrice(Plan.ENTERPRISE, process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL)

function normalizePlan(value?: string | null) {
  if (!value) return null
  const upper = value.toUpperCase()
  if (upper === 'PRO') return Plan.PRO
  if (upper === 'ENTERPRISE') return Plan.ENTERPRISE
  if (upper === 'FREE') return Plan.FREE
  return null
}

function mapStatus(status?: Stripe.Subscription.Status | null): SubscriptionStatus {
  switch (status) {
    case 'trialing':
      return SubscriptionStatus.TRIALING
    case 'active':
      return SubscriptionStatus.ACTIVE
    case 'canceled':
      return SubscriptionStatus.CANCELED
    case 'incomplete':
    case 'past_due':
    case 'unpaid':
      return SubscriptionStatus.PAST_DUE
    case 'incomplete_expired':
      return SubscriptionStatus.EXPIRED
    default:
      return SubscriptionStatus.ACTIVE
  }
}

function shouldKeepPaidPlan(status: SubscriptionStatus) {
  return (
    status === SubscriptionStatus.ACTIVE ||
    status === SubscriptionStatus.TRIALING ||
    status === SubscriptionStatus.PAST_DUE
  )
}

async function persistSubscription({
  userId,
  plan,
  stripeCustomerId,
  stripeSubscriptionId,
  stripePriceId,
  amount,
  currency,
  expiresAt,
  cancelAtPeriodEnd,
  status,
}: {
  userId: string | number
  plan: Plan
  stripeCustomerId?: string | null
  stripeSubscriptionId: string
  stripePriceId?: string | null
  amount?: string
  currency?: string | null
  expiresAt?: Date | null
  cancelAtPeriodEnd?: boolean
  status: SubscriptionStatus
}) {
  // 转换 userId 为数字
  const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId
  if (isNaN(userIdNum)) {
    throw new Error(`Invalid userId: ${userId}`)
  }

  // 检查用户是否已有其他活跃订阅
  const existingActiveSubscriptions = await prisma.userSubscription.findMany({
    where: {
      userId: userIdNum,
      stripeSubscriptionId: { not: stripeSubscriptionId }, // 排除当前订阅
      status: {
        in: ['ACTIVE', 'TRIALING'],
      },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  })

  // 如果有其他活跃订阅，取消它们（因为新订阅会替代旧订阅）
  if (existingActiveSubscriptions.length > 0) {
    console.log(`[StripeWebhook] Found ${existingActiveSubscriptions.length} existing active subscriptions for user ${userId}, canceling them`)
    
    // 更新旧订阅状态为已取消
    await prisma.userSubscription.updateMany({
      where: {
        userId: userIdNum,
        stripeSubscriptionId: { not: stripeSubscriptionId },
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    })

    // 如果旧订阅在 Stripe 中仍然活跃，尝试取消它们
    if (stripe) {
      for (const oldSub of existingActiveSubscriptions) {
        if (oldSub.stripeSubscriptionId) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(oldSub.stripeSubscriptionId)
            if (stripeSub.status === 'active' || stripeSub.status === 'trialing') {
              await stripe.subscriptions.cancel(oldSub.stripeSubscriptionId)
              console.log(`[StripeWebhook] Canceled Stripe subscription ${oldSub.stripeSubscriptionId}`)
            }
          } catch (error) {
            console.error(`[StripeWebhook] Failed to cancel Stripe subscription ${oldSub.stripeSubscriptionId}:`, error)
          }
        }
      }
    }
  }

  const upsertData = {
    plan,
    status,
    stripeCustomerId: stripeCustomerId ?? null,
    stripeSubscriptionId,
    stripePriceId: stripePriceId ?? null,
    cancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
    expiresAt: expiresAt ?? null,
  } as const

  await prisma.userSubscription.upsert({
    where: { stripeSubscriptionId },
    update: {
      ...upsertData,
      ...(amount ? { amount } : {}),
      ...(currency ? { currency: currency.toUpperCase() } : {}),
    },
    create: {
      userId: userIdNum,
      startDate: new Date(),
      ...upsertData,
      amount,
      currency: currency?.toUpperCase() ?? 'USD',
    },
  })

  await prisma.user.update({
    where: { id: userIdNum },
    data: {
      plan: shouldKeepPaidPlan(status) ? plan : Plan.FREE,
    },
  })
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userIdRaw = session.metadata?.userId
  if (!userIdRaw) {
    console.warn('[StripeWebhook] Missing userId in session metadata', session.id)
    return
  }
  // 转换为数字
  const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw
  if (isNaN(userId)) {
    console.warn('[StripeWebhook] Invalid userId in session metadata', session.id, userIdRaw)
    return
  }

  const plan =
    normalizePlan(session.metadata?.plan) ??
    (session.metadata?.priceId ? PRICE_TO_PLAN_MAP[session.metadata.priceId] : null)

  if (!plan) {
    console.warn('[StripeWebhook] Unable to determine plan', session.id)
    return
  }

  const stripeSubscriptionId =
    (typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id) ?? null

  if (!stripeSubscriptionId) {
    console.warn('[StripeWebhook] Missing subscription id', session.id)
    return
  }

  const stripeCustomerId =
    (typeof session.customer === 'string' ? session.customer : session.customer?.id) ?? null

  let subscription: Stripe.Subscription | null = null
  if (stripe) {
    try {
      subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    } catch (error) {
      console.error('[StripeWebhook] Failed to retrieve subscription', error)
    }
  }

  const priceId = session.metadata?.priceId || subscription?.items?.data?.[0]?.price?.id || null
  const status = mapStatus(subscription?.status)
  const expiresAt = subscription?.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end ?? false

  const amount =
    session.amount_total != null
      ? (session.amount_total / 100).toFixed(2)
      : subscription?.items?.data?.[0]?.price?.unit_amount != null
      ? ((subscription.items.data[0].price.unit_amount ?? 0) / 100).toFixed(2)
      : undefined

  const currency =
    session.currency ?? subscription?.currency ?? subscription?.items?.data?.[0]?.price?.currency

  await persistSubscription({
    userId,
    plan,
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId: priceId,
    amount,
    currency,
    expiresAt,
    cancelAtPeriodEnd,
    status,
  })
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const userIdRaw = subscription.metadata?.userId
  if (!userIdRaw) {
    console.warn('[StripeWebhook] Missing userId in subscription metadata', subscription.id)
    return
  }
  // 转换为数字
  const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw
  if (isNaN(userId)) {
    console.warn('[StripeWebhook] Invalid userId in subscription metadata', subscription.id, userIdRaw)
    return
  }

  const priceId = subscription.items.data[0]?.price?.id
  const plan = normalizePlan(subscription.metadata?.plan) ?? (priceId ? PRICE_TO_PLAN_MAP[priceId] : null)

  if (!plan) {
    console.warn('[StripeWebhook] Unable to map plan for subscription', subscription.id)
    return
  }

  const amount =
    subscription.items.data[0]?.price?.unit_amount != null
      ? ((subscription.items.data[0].price.unit_amount ?? 0) / 100).toFixed(2)
      : undefined

  await persistSubscription({
    userId,
    plan,
    stripeCustomerId:
      (typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id) ?? null,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId ?? null,
    amount,
    currency: subscription.currency,
    expiresAt: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    status: mapStatus(subscription.status),
  })
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[StripeWebhook] Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ success: false, error: 'Webhook secret not configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ success: false, error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const body = await request.arrayBuffer()
  const rawBody = Buffer.from(body)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: any) {
    console.error('[StripeWebhook] Signature verification failed', err.message)
    return NextResponse.json({ success: false, error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
        // 订阅创建（可能由 checkout.session.completed 触发，但为了完整性也处理）
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        // 发票支付成功（试用期结束后的首次扣款，或续费）
        console.log(`[StripeWebhook] Invoice payment succeeded: ${(event.data.object as Stripe.Invoice).id}`)
        // 可以在这里添加邮件通知等逻辑
        break
      case 'invoice.payment_failed':
        // 发票支付失败
        console.log(`[StripeWebhook] Invoice payment failed: ${(event.data.object as Stripe.Invoice).id}`)
        // 可以在这里添加支付失败通知逻辑
        break
      case 'invoice.upcoming':
        // 试用期即将结束，发票即将生成（提前 7 天通知）
        console.log(`[StripeWebhook] Invoice upcoming: ${(event.data.object as Stripe.Invoice).id}`)
        // 可以在这里添加提醒用户试用期即将结束的逻辑
        break
      case 'charge.refunded':
        // 退款已处理（用户申请退款或降级时的按比例退款）
        const refund = event.data.object as Stripe.Charge
        console.log(`[StripeWebhook] Charge refunded: ${refund.id}, Amount: ${refund.amount_refunded / 100} ${refund.currency?.toUpperCase()}`)
        // 可以在这里添加退款通知逻辑（发送邮件给管理员等）
        // TODO: 如果需要，可以添加邮件通知功能
        break
      default:
        console.log(`[StripeWebhook] Unhandled event type ${event.type}`)
    }
  } catch (error) {
    console.error('[StripeWebhook] Error handling event', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export const runtime = 'nodejs'

