'use client'

import Link from 'next/link'

interface Subscription {
  plan?: string | null
  status?: string | null
  expiresAt?: string | Date | null
  cancelAtPeriodEnd?: boolean | null
}

interface User {
  plan?: string | null
  subscription?: Subscription | null
}

interface SubscriptionInfoProps {
  user: User | null
}

const formatDate = (input?: string | Date | null) => {
  if (!input) return '—'
  const date = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getPlanLabel = (plan?: string | null) => {
  if (!plan) return 'Free'
  const normalized = plan.toUpperCase()
  switch (normalized) {
    case 'PRO':
      return 'Pro'
    case 'ENTERPRISE':
      return 'Enterprise'
    default:
      return 'Free'
  }
}

const getStatusLabel = (status?: string | null) => {
  if (!status) return 'Active'
  const normalized = status.toUpperCase()
  switch (normalized) {
    case 'ACTIVE':
      return 'Active'
    case 'CANCELED':
      return 'Canceled'
    case 'EXPIRED':
      return 'Expired'
    case 'PAST_DUE':
      return 'Past Due'
    case 'TRIALING':
      return 'Trialing'
    default:
      return status
  }
}

const getStatusColor = (status?: string | null) => {
  if (!status) return 'bg-green-100 text-green-800'
  const normalized = status.toUpperCase()
  switch (normalized) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'CANCELED':
      return 'bg-gray-100 text-gray-800'
    case 'EXPIRED':
      return 'bg-red-100 text-red-800'
    case 'PAST_DUE':
      return 'bg-yellow-100 text-yellow-800'
    case 'TRIALING':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function SubscriptionInfo({ user }: SubscriptionInfoProps) {
  if (!user) return null

  const plan = getPlanLabel(user.plan || user.subscription?.plan)
  const subscription = user.subscription
  const status = subscription?.status || 'ACTIVE'
  const statusLabel = getStatusLabel(status)
  const statusColor = getStatusColor(status)

  // 如果是 Free 计划且没有订阅，显示升级提示
  if (plan === 'Free' && !subscription) {
    return (
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Current Plan: Free</h3>
            <p className="mt-1 text-sm text-blue-700">
              Upgrade to Pro or Enterprise to unlock dynamic QR codes and advanced features.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 如果有订阅，显示订阅详情
  return (
    <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-neutral-900">Current Plan: {plan}</h3>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          {subscription && (
            <div className="mt-2 space-y-1 text-sm text-neutral-600">
              {subscription.expiresAt && (
                <p>
                  {subscription.cancelAtPeriodEnd
                    ? `Expires on: ${formatDate(subscription.expiresAt)}`
                    : `Renews on: ${formatDate(subscription.expiresAt)}`}
                </p>
              )}
              {subscription.cancelAtPeriodEnd && (
                <p className="text-yellow-600 font-medium">
                  Your subscription will be canceled at the end of the current billing period.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  )
}

