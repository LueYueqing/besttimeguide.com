'use client'

import Link from 'next/link'

interface DowngradeWarningProps {
  userPlan: 'free' | 'pro' | 'enterprise'
  dynamicCount: number
  planLimit: number
  subscriptionStatus?: string | null
  hasProTrial?: boolean
}

const PLAN_LIMITS: Record<'free' | 'pro' | 'enterprise', number> = {
  free: 3,
  pro: 50,
  enterprise: 500,
}

const PLAN_NAMES: Record<'free' | 'pro' | 'enterprise', string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

const UPGRADE_PLANS: Record<'free' | 'pro', 'pro' | 'enterprise'> = {
  free: 'pro',
  pro: 'enterprise',
}

export default function DowngradeWarning({
  userPlan,
  dynamicCount,
  planLimit,
  subscriptionStatus,
  hasProTrial = false,
}: DowngradeWarningProps) {
  // 如果用户有 Pro 试用，不显示警告
  if (hasProTrial) {
    return null
  }

  // 只显示警告如果：
  // 1. 用户有超过当前计划限制的动态码
  // 2. 订阅已过期或已取消（或者没有活跃订阅）
  const isOverLimit = dynamicCount > planLimit
  const isExpiredOrCanceled =
    subscriptionStatus === 'EXPIRED' ||
    subscriptionStatus === 'CANCELED' ||
    !subscriptionStatus

  if (!isOverLimit || !isExpiredOrCanceled) {
    return null
  }

  const upgradePlan = UPGRADE_PLANS[userPlan as 'free' | 'pro']
  const upgradePlanName = upgradePlan ? PLAN_NAMES[upgradePlan] : 'Pro'

  return (
    <div className="mb-6 rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">
            Subscription Downgrade Notice
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            Your subscription has expired or been canceled. You currently have{' '}
            <strong className="font-semibold">{dynamicCount} dynamic QR codes</strong>, but your{' '}
            <strong className="font-semibold">{PLAN_NAMES[userPlan]}</strong> plan only allows{' '}
            <strong className="font-semibold">{planLimit} dynamic QR codes</strong>.
          </p>
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-3">
            <p className="text-xs text-yellow-900 font-medium mb-1">What this means:</p>
            <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
              <li>Your existing {dynamicCount} dynamic QR codes will continue to work normally</li>
              <li>You can still view, edit, and manage all your existing codes</li>
              <li>You cannot create new dynamic QR codes until you upgrade</li>
            </ul>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Upgrade to {upgradePlanName}
            </Link>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center px-4 py-2 border border-yellow-600 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-100 transition-colors"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

