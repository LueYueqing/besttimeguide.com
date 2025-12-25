'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SidebarNavigation from './components/SidebarNavigation'
import StatsCards from './components/StatsCards'
// import QRCodeList from './components/QRCodeList' // TODO: Create this component
import DowngradeWarning from './components/DowngradeWarning'

type QRCodeStatus = 'all' | 'active' | 'paused' | 'archived'

interface QRCode {
  id: number
  title?: string | null
  description?: string | null
  type: string
  content: any
  design: any
  targetUrl?: string | null
  shortCode?: string | null
  lastScanAt?: string | null
  isDynamic: boolean
  isActive: boolean
  isArchived: boolean
  scanCount: number
  createdAt: string
  updatedAt: string
  analyticsCount: number
}

interface DashboardStats {
  total: number
  active: number
  paused: number
  archived: number
  dynamic: number
  totalScans: number
}

export default function DashboardClient() {
  const { user, loading: userLoading, signOut } = useUser()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // 从 URL 参数读取初始状态
  const initialStatus = (searchParams.get('status') as QRCodeStatus) || 'all'
  const [status, setStatus] = useState<QRCodeStatus>(initialStatus)
  const [search, setSearch] = useState('')
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    paused: 0,
    archived: 0,
    dynamic: 0,
    totalScans: 0,
  })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const { refreshUser } = useUser()

  // 检测支付成功参数
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true') {
      setShowSuccessModal(true)
      // 刷新用户信息以获取最新的订阅状态
      refreshUser()
      // 清除 URL 参数（延迟执行，避免立即触发其他 useEffect）
      setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('success')
        const newUrl = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard'
        router.replace(newUrl)
      }, 100)
    }
  }, [searchParams, router, refreshUser])

  // 当 URL 参数变化时，更新状态
  useEffect(() => {
    const urlStatus = (searchParams.get('status') as QRCodeStatus) || 'all'
    if (urlStatus !== status) {
      setStatus(urlStatus)
    }
  }, [searchParams, status])

  // 处理状态改变：更新 state 并同步更新 URL
  const handleStatusChange = (newStatus: QRCodeStatus) => {
    setStatus(newStatus)
    // 更新 URL 参数，但不刷新页面
    const params = new URLSearchParams(searchParams.toString())
    if (newStatus === 'all') {
      params.delete('status')
    } else {
      params.set('status', newStatus)
    }
    const newUrl = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard'
    router.replace(newUrl)
  }

  // 获取QR码列表
  const fetchQRCodes = async () => {
    if (!user) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        status,
        search,
        page: page.toString(),
        limit: '20',
      })

      const response = await fetch(`/api/qrcodes?${params}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()

      if (data.success) {
        setQrCodes(data.data.qrCodes || [])
        setStats(data.data.stats || {
          total: 0,
          active: 0,
          paused: 0,
          archived: 0,
          dynamic: 0,
          totalScans: 0,
        })
        setTotalPages(data.data.pagination?.totalPages || 1)
      } else {
        console.error('API returned error:', data.error || 'Unknown error')
        // 即使 API 返回错误，也显示空列表而不是空白页
        setQrCodes([])
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error)
      // 发生错误时显示空列表，而不是空白页
      setQrCodes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 如果模态框正在显示，不刷新数据，避免表格闪动
    if (showSuccessModal) return
    
    if (!userLoading && user) {
      fetchQRCodes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, status, search, page, showSuccessModal])

  // 如果用户未登录，显示加载状态（会被重定向）
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // 会被重定向到登录页
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 顶部头部栏 */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 text-xl lg:text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
                <Image
                  src="/logo.png"
                  alt="CustomQR.pro"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span>CustomQR<span className="text-gradient">.pro</span></span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {/* 邀请统计和 Pro 试用信息 */}
              {(user?.referralStats || (user?.proTrialDaysLeft && user.proTrialDaysLeft > 0)) && (
                <div className="flex items-center gap-3 text-sm">
                  {user.referralStats && user.referralStats.successfulReferrals > 0 && (
                    <div className="text-neutral-600">
                      <span className="font-medium">{user.referralStats.successfulReferrals}</span> invites
                    </div>
                  )}
                  {user.proTrialDaysLeft && user.proTrialDaysLeft > 0 && (
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      Pro Trial: {user.proTrialDaysLeft} days left
                    </div>
                  )}
                </div>
              )}
              
              <div className="relative group">
                <button
                  onClick={async () => {
                    if (!user?.id) return
                    
                    // 生成邀请链接
                    const inviteLink = `${window.location.origin}/?ref=${user.id}`
                    
                    try {
                      // 复制到剪贴板
                      await navigator.clipboard.writeText(inviteLink)
                      setInviteMessage('Invite link copied to clipboard!')
                      setTimeout(() => setInviteMessage(null), 3000)
                    } catch (err) {
                      // 如果复制失败，使用备用方法
                      const textArea = document.createElement('textarea')
                      textArea.value = inviteLink
                      textArea.style.position = 'fixed'
                      textArea.style.opacity = '0'
                      document.body.appendChild(textArea)
                      textArea.select()
                      try {
                        document.execCommand('copy')
                        setInviteMessage('Invite link copied to clipboard!')
                        setTimeout(() => setInviteMessage(null), 3000)
                      } catch (e) {
                        setInviteMessage('Failed to copy link. Please copy manually: ' + inviteLink)
                        setTimeout(() => setInviteMessage(null), 5000)
                      }
                      document.body.removeChild(textArea)
                    }
                  }}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Invite user
                </button>
                {/* 邀请奖励政策提示 */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 p-3 bg-white border border-neutral-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-neutral-200 rotate-45"></div>
                  <div className="text-xs font-semibold text-neutral-900 mb-2">🎁 Referral Rewards</div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Invite a friend to register and get <strong className="text-blue-600">3 days of Pro access</strong> for free! 
                    Rewards stack - invite more friends to extend your trial.
                  </p>
                </div>
                {inviteMessage && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-[101]">
                    <div className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      {inviteMessage}
                      {/* 小箭头指向按钮 */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-600 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-600">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <svg
                    className={`w-4 h-4 text-neutral-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* 用户菜单下拉 */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Account Settings</span>
                        </div>
                      </Link>
                      <button
                        onClick={async () => {
                          setShowUserMenu(false)
                          await signOut()
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 支付成功庆祝模态框 */}
      {showSuccessModal && (() => {
        // 获取用户的实际计划
        const userPlan = user?.plan?.toLowerCase() || user?.subscription?.plan?.toLowerCase() || 'pro'
        const isEnterprise = userPlan === 'enterprise'
        const planName = isEnterprise ? 'Enterprise' : 'Pro'
        const planFeatures = isEnterprise ? [
          'Up to 500 Dynamic QR Codes',
          'Advanced Analytics & Reports',
          'Real-time Scan Monitoring',
          'White-label Solution',
          'Team Collaboration',
          'Advanced Security (SSO, 2FA)',
          'Dedicated Support & SLA',
        ] : [
          'Up to 50 Dynamic QR Codes',
          'Advanced Analytics & Tracking',
          'Logo Upload & Custom Design',
          'Multiple Download Formats (PNG, SVG, PDF)',
          'Bulk QR Code Generation',
          'Full API Access',
          'Priority Support',
        ]

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in duration-300">
            {/* 关闭按钮 */}
            <button
              onClick={() => {
                setShowSuccessModal(false)
                // 关闭模态框后刷新数据
                setTimeout(() => {
                  refreshUser()
                  fetchQRCodes()
                }, 100)
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

              {/* 庆祝动画 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                  🎉 Payment Successful!
                </h2>
                <p className="text-lg text-neutral-600 mb-1">
                  Welcome to {planName}!
                </p>
                <p className="text-sm text-neutral-500">
                  Your subscription is now active. Enjoy all {planName} features!
                </p>
              </div>

              {/* 功能列表 */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-blue-900 mb-3">You now have access to:</p>
                <ul className="space-y-2 text-sm text-blue-700">
                  {planFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  // 关闭模态框后刷新数据
                  setTimeout(() => {
                    refreshUser()
                    fetchQRCodes()
                  }, 100)
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
              <Link
                href="/dashboard/analytics"
                onClick={() => {
                  setShowSuccessModal(false)
                  // 关闭模态框后刷新数据
                  setTimeout(() => {
                    refreshUser()
                    fetchQRCodes()
                  }, 100)
                }}
                className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors text-center"
              >
                View Analytics
              </Link>
              </div>
            </div>
          </div>
        )
      })()}

      <div className="flex">
        {/* 左侧导航栏 */}
        <SidebarNavigation
          status={status}
          onStatusChange={handleStatusChange}
          stats={stats}
          user={user}
        />

        {/* 主内容区 */}
        <main className="flex-1 w-0 lg:ml-64">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* 页面标题 */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-neutral-900">
                {status === 'all' && 'All QR Codes'}
                {status === 'active' && 'Active QR Codes'}
                {status === 'paused' && 'Paused QR Codes'}
                {status === 'archived' && 'Archived QR Codes'}
                <span className="ml-2 text-neutral-500 font-normal">
                  ({status === 'all' ? stats.total : status === 'active' ? stats.active : status === 'paused' ? stats.paused : stats.archived})
                </span>
              </h1>
            </div>

            {/* 统计卡片 */}
            <StatsCards stats={stats} />

            {/* 降级警告提示 */}
            {(() => {
              const userPlan = (user?.plan?.toLowerCase() || user?.subscription?.plan?.toLowerCase() || 'free') as 'free' | 'pro' | 'enterprise'
              const PLAN_LIMITS: Record<'free' | 'pro' | 'enterprise', number> = {
                free: 3,
                pro: 50,
                enterprise: 500,
              }
              const planLimit = PLAN_LIMITS[userPlan] || 3
              const dynamicCount = stats.dynamic
              const subscriptionStatus = user?.subscription?.status
              const hasProTrial = user?.proTrialExpiresAt && new Date(user.proTrialExpiresAt) > new Date()

              return (
                <DowngradeWarning
                  userPlan={userPlan}
                  dynamicCount={dynamicCount}
                  planLimit={planLimit}
                  subscriptionStatus={subscriptionStatus}
                  hasProTrial={hasProTrial}
                />
              )
            })()}

            {/* 操作栏 */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-3">
                <Link
                  href="/dashboard/create/bulk"
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create multiple codes
                </Link>
              </div>
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* QR码列表 */}
            {loading ? (
              <div className="mt-6 text-center text-neutral-600">Loading QR codes...</div>
            ) : qrCodes.length === 0 ? (
              <div className="mt-6 text-center text-neutral-600">No QR codes found.</div>
            ) : (
              <div className="mt-6 grid gap-4">
                {qrCodes.map((qr) => (
                  <div key={qr.id} className="bg-white p-4 rounded-lg border border-neutral-200">
                    <div className="font-medium">{qr.title || 'Untitled QR Code'}</div>
                    <div className="text-sm text-neutral-600">{qr.shortCode || 'No short code'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

