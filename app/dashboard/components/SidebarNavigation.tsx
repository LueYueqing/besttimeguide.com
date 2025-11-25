'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

type QRCodeStatus = 'all' | 'active' | 'paused' | 'archived'

interface Subscription {
  plan?: string | null
  status?: string | null
  expiresAt?: string | Date | null
  cancelAtPeriodEnd?: boolean | null
}

interface SidebarNavigationProps {
  status: QRCodeStatus
  onStatusChange: (status: QRCodeStatus) => void
  stats: {
    total: number
    active: number
    paused: number
    archived: number
    dynamic: number
    totalScans: number
  }
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
  }
  isOpen?: boolean
  onClose?: () => void
}

export default function SidebarNavigation({
  status,
  onStatusChange,
  stats,
  user,
  isOpen = true,
  onClose,
}: SidebarNavigationProps) {
  const pathname = usePathname()
  const plan = user.plan?.toLowerCase() || 'free'
  const isFree = plan === 'free'
  
  // 开发测试用户不受限制（仅在开发环境）
  const isDevUser = typeof window !== 'undefined' && user.email === 'dev@example.com'

  // 检查 Pro 试用权限
  const proTrialExpiresAt = user.proTrialExpiresAt
    ? new Date(user.proTrialExpiresAt)
    : null
  const hasProTrial = proTrialExpiresAt && proTrialExpiresAt > new Date()
  const proTrialDaysLeft = hasProTrial
    ? Math.ceil((proTrialExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // 计算动态QR码数量（免费版限制为3个，Pro试用和开发用户不受限制）
  const dynamicLimit = isDevUser || hasProTrial ? Infinity : isFree ? 3 : Infinity
  const dynamicCount = stats.dynamic

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
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-neutral-200 overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >


      <div className="p-4">
        {/* 主要操作按钮：Create QR Code */}
        <Link
          href="/dashboard/create"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-6 rounded-lg border-2 border-green-500 bg-white text-green-600 font-medium hover:bg-green-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create QR Code</span>
        </Link>

        {/* 导航菜单 */}
        <nav className="space-y-1">
          {/* My QR Codes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="text-sm font-medium text-neutral-700 uppercase tracking-wide">
                  QR Codes
                </span>
              </div>
              {(() => {
                const subscription = user.subscription
                const subscriptionStatus = subscription?.status
                if (subscriptionStatus === 'CANCELED' || subscriptionStatus === 'EXPIRED') {
                  return (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      DEACTIVATED
                    </span>
                  )
                }
                return null
              })()}
            </div>
            <div className="space-y-1">
              {pathname === '/dashboard' ? (
                // 在 dashboard 页面，使用 button 切换状态
                <>
                  <button
                    onClick={() => onStatusChange('all')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'all'
                        ? 'bg-green-50 text-green-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="flex-1 text-left">All</span>
                    <span className="text-xs text-neutral-500">({stats.total})</span>
                  </button>
                  <button
                    onClick={() => onStatusChange('active')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="flex-1 text-left">Active</span>
                    <span className="text-xs text-neutral-500">({stats.active})</span>
                  </button>
                  <button
                    onClick={() => onStatusChange('paused')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'paused'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1 text-left">Paused</span>
                    <span className="text-xs text-neutral-500">({stats.paused})</span>
                  </button>
                  <button
                    onClick={() => onStatusChange('archived')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'archived'
                        ? 'bg-neutral-100 text-neutral-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="flex-1 text-left">Archived</span>
                    <span className="text-xs text-neutral-500">({stats.archived})</span>
                  </button>
                </>
              ) : (
                // 在其他页面（create, analytics, 单个 QR 码页面等），使用 Link 直接跳转到 dashboard
                <>
                  <Link
                    href="/dashboard?status=all"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'all'
                        ? 'bg-green-50 text-green-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="flex-1 text-left">All</span>
                    <span className="text-xs text-neutral-500">({stats.total})</span>
                  </Link>
                  <Link
                    href="/dashboard?status=active"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="flex-1 text-left">Active</span>
                    <span className="text-xs text-neutral-500">({stats.active})</span>
                  </Link>
                  <Link
                    href="/dashboard?status=paused"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'paused'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1 text-left">Paused</span>
                    <span className="text-xs text-neutral-500">({stats.paused})</span>
                  </Link>
                  <Link
                    href="/dashboard?status=archived"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'archived'
                        ? 'bg-neutral-100 text-neutral-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="flex-1 text-left">Archived</span>
                    <span className="text-xs text-neutral-500">({stats.archived})</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="pt-4">
            {isFree && !hasProTrial ? (
              <Link
                href="/pricing?feature=analytics"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard/analytics'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="flex-1 text-left">Stats</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  PRO
                </span>
              </Link>
            ) : (
              <Link
                href="/dashboard/analytics"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard/analytics'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="flex-1 text-left">Stats</span>
              </Link>
            )}
          </div>

          {/* Account & Support */}
          <div className="pt-4 border-t border-neutral-200 mt-4">
            <Link
              href="/dashboard/profile"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/dashboard/profile'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Account</span>
            </Link>
            <Link
              href="/help/contact"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/help/contact'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Contact</span>
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
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            }

            // Pro 试用显示
            if (hasProTrial && proTrialDaysLeft > 0) {
              return (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-900 mb-2">Pro Trial Active</div>
                  <p className="text-xs text-blue-700 mb-2">
                    {proTrialDaysLeft} {proTrialDaysLeft === 1 ? 'day' : 'days'} remaining
                  </p>
                  <p className="text-xs text-blue-600 mb-2">
                    Invite more friends to extend your trial!
                  </p>
                  <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded mt-2">
                    <strong>💡 How it works:</strong> Each successful referral gives you <strong>3 days</strong> of Pro access. Rewards stack!
                  </div>
                </div>
              )
            }

            if (planLabel === 'Free' && !subscription) {
              return (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-900 mb-2">Current Plan: Free</div>
                  <p className="text-xs text-blue-700 mb-3">
                    Upgrade to unlock dynamic QR codes and advanced features.
                  </p>
                  {user.referralStats && user.referralStats.totalReferrals > 0 && (
                    <div className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
                      <p className="mb-1">
                        Invited: <span className="font-medium">{user.referralStats.successfulReferrals}</span> {user.referralStats.successfulReferrals === 1 ? 'user' : 'users'}
                      </p>
                      <p className="text-blue-500">
                        <strong>Reward:</strong> 3 days Pro access per referral
                      </p>
                    </div>
                  )}
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
                {subscription?.cancelAtPeriodEnd && (
                  <p className="text-xs text-yellow-600 font-medium mb-2">
                    Will be canceled at period end
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

        {/* 动态码限制提示（开发用户和Pro试用用户不显示） */}
        {isFree && !isDevUser && !hasProTrial && (
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="text-sm text-neutral-700 mb-2">
              <span className="font-medium">Dynamic Codes:</span>{' '}
              <span className="text-neutral-600">
                {dynamicCount}/{dynamicLimit}
              </span>
            </div>
          </div>
        )}

        {/* 底部升级按钮 */}
        {isFree && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <Link
              href="/pricing"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-blue-500 bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Upgrade Now</span>
            </Link>
          </div>
        )}

        {/* 语言选择器 */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>English</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}

