'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface Subscription {
  plan?: string | null
  status?: string | null
  expiresAt?: string | Date | null
  cancelAtPeriodEnd?: boolean | null
}

interface SidebarNavigationProps {
  user: {
    plan?: string | null
    email?: string | null
    subscription?: Subscription | null
    proTrialExpiresAt?: string | Date | null
    proTrialDaysLeft?: number
    referralStats?: {
      totalReferrals: number
      successfulReferrals: number
    }
    isAdmin?: boolean
  }
  isOpen?: boolean
  onClose?: () => void
}

export default function SidebarNavigation({
  user,
  isOpen = true,
  onClose,
}: SidebarNavigationProps) {
  const pathname = usePathname()
  const plan = user.plan?.toLowerCase() || 'free'
  const isFree = plan === 'free'
  const isAdmin = user.isAdmin || false

  // 检查 Pro 试用权限
  const proTrialExpiresAt = user.proTrialExpiresAt
    ? new Date(user.proTrialExpiresAt)
    : null
  const hasProTrial = proTrialExpiresAt && proTrialExpiresAt > new Date()
  const proTrialDaysLeft = hasProTrial
    ? Math.ceil((proTrialExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <>
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-neutral-200 overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="p-4">
          {/* 导航菜单 */}
          <nav className="space-y-1">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            {/* Admin Section */}
            {isAdmin && (
              <div className="pt-4 border-t border-neutral-200 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-700 uppercase tracking-wide">
                    管理
                  </span>
                </div>
                <Link
                  href="/dashboard/articles"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith('/dashboard/articles')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>文章管理</span>
                </Link>
              </div>
            )}

            {/* Account & Support */}
            <div className="pt-4 border-t border-neutral-200 mt-4">
              <Link
                href="/dashboard/profile"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard/profile'
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Account Settings</span>
              </Link>
              <Link
                href="/help/contact"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/help/contact'
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Contact Support</span>
              </Link>
            </div>
          </nav>

          {/* 订阅信息 */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            {(() => {
              const plan = user.plan?.toUpperCase() || user.subscription?.plan?.toUpperCase() || 'FREE'
              const planLabel = plan === 'PRO' ? 'Pro' : plan === 'ENTERPRISE' ? 'Enterprise' : 'Free'
              const subscription = user.subscription
              const status = subscription?.status || 'ACTIVE'
              const statusLabel = status === 'ACTIVE' ? 'Active' :
                status === 'CANCELED' ? 'Canceled' :
                  status === 'EXPIRED' ? 'Expired' :
                    status === 'PAST_DUE' ? 'Past Due' :
                      status === 'TRIALING' ? 'Trialing' : status
              const statusColor = status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                status === 'CANCELED' ? 'bg-gray-100 text-gray-800' :
                  status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                    status === 'PAST_DUE' ? 'bg-yellow-100 text-yellow-800' :
                      status === 'TRIALING' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'

              const formatDate = (input?: string | Date | null) => {
                if (!input) return '—'
                const date = typeof input === 'string' ? new Date(input) : input
                if (Number.isNaN(date.getTime())) return '—'
                return date.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }

              // Pro 试用显示
              if (hasProTrial && proTrialDaysLeft > 0) {
                return (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-semibold text-blue-900 mb-2">Pro Trial</div>
                    <p className="text-xs text-blue-700 mb-2">
                      {proTrialDaysLeft} {proTrialDaysLeft === 1 ? 'day' : 'days'} remaining
                    </p>
                  </div>
                )
              }

              if (planLabel === 'Free' && !subscription) {
                return (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-semibold text-blue-900 mb-2">Current Plan: Free</div>
                    <p className="text-xs text-blue-700 mb-3">
                      Upgrade to unlock more features.
                    </p>
                  </div>
                )
              }

              return (
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-sm font-semibold text-neutral-900">Current Plan: {planLabel}</div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  {subscription?.expiresAt && (
                    <p className="text-xs text-neutral-600 mb-2">
                      {subscription.cancelAtPeriodEnd
                        ? `Expires on: ${formatDate(subscription.expiresAt)}`
                        : `Renews on: ${formatDate(subscription.expiresAt)}`}
                    </p>
                  )}
                  <Link
                    href="/dashboard/profile"
                    className="block w-full text-center px-3 py-2 border border-neutral-300 bg-white text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Manage Subscription
                  </Link>
                </div>
              )
            })()}
          </div>
        </div>
      </aside>
    </>
  )
}
