'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SidebarNavigation from '../components/SidebarNavigation'

const formatDate = (input?: string | Date | null) => {
  if (!input) return '—'
  const date = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

const getPlanLabel = (plan?: string | null) => {
  if (!plan) return 'Free'
  const normalized = plan.toLowerCase()
  switch (normalized) {
    case 'pro':
      return 'Pro'
    case 'enterprise':
      return 'Enterprise'
    default:
      return 'Free'
  }
}

const planDescriptions: Record<string, string> = {
  free: 'Perfect for generating static QR codes and exploring essential features.',
  pro: 'Unlock brand styling controls, bulk exports, and dynamic QR capabilities.',
  enterprise: 'Enterprise-grade collaboration, governance, and advanced analytics.',
}

interface ApiKey {
  id: number
  name: string
  keyPrefix: string
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

function ApiKeysSection() {
  const { user } = useUser()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyExpiresAt, setNewKeyExpiresAt] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 获取 API keys 列表
  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/api-keys')
      const data = await response.json()
      if (data.success) {
        setApiKeys(data.data)
      } else {
        setError(data.error || 'Failed to fetch API keys')
      }
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setError('Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchApiKeys()
    }
  }, [user])

  // 创建新的 API key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) {
      setError('API key name is required')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
          expiresAt: newKeyExpiresAt || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewKey(data.data.key)
        setNewKeyName('')
        setNewKeyExpiresAt('')
        setShowCreateForm(false)
        await fetchApiKeys()
      } else {
        setError(data.error || 'Failed to create API key')
      }
    } catch (err) {
      console.error('Error creating API key:', err)
      setError('Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  // 删除 API key
  const handleDeleteKey = async (id: number) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await fetchApiKeys()
      } else {
        setError(data.error || 'Failed to delete API key')
      }
    } catch (err) {
      console.error('Error deleting API key:', err)
      setError('Failed to delete API key')
    }
  }

  // 切换 API key 状态
  const handleToggleKey = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchApiKeys()
      } else {
        setError(data.error || 'Failed to update API key')
      }
    } catch (err) {
      console.error('Error updating API key:', err)
      setError('Failed to update API key')
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('API key copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">API Keys</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Manage your API keys for programmatic access to CustomQR.pro
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm)
            setError(null)
            setNewKey(null)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {showCreateForm ? 'Cancel' : '+ Create API Key'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {newKey && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 mb-2">
                API Key Created Successfully
              </h3>
              <p className="text-xs text-green-700 mb-3">
                ⚠️ Make sure to copy your API key now. You won't be able to see it again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-green-200 rounded px-3 py-2 text-sm font-mono text-green-900 break-all">
                  {newKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newKey)}
                  className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="ml-4 text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateKey} className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="space-y-4">
            <div>
              <label htmlFor="keyName" className="block text-sm font-medium text-neutral-700 mb-1">
                API Key Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API, Development Key"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="keyExpiresAt" className="block text-sm font-medium text-neutral-700 mb-1">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                id="keyExpiresAt"
                value={newKeyExpiresAt}
                onChange={(e) => setNewKeyExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Create API Key'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewKeyName('')
                  setNewKeyExpiresAt('')
                  setError(null)
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-neutral-600">Loading API keys...</div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-8 text-neutral-600">
          <p>No API keys yet. Create your first API key to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-neutral-900">{key.name}</h3>
                  {key.isActive ? (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-800 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <code className="text-xs text-neutral-600 font-mono">{key.keyPrefix}</code>
                <div className="mt-1 text-xs text-neutral-500">
                  Created: {formatDate(key.createdAt)}
                  {key.lastUsedAt && ` • Last used: ${formatDate(key.lastUsedAt)}`}
                  {key.expiresAt && (
                    <span className={new Date(key.expiresAt) < new Date() ? 'text-red-600' : ''}>
                      {' • Expires: '}
                      {formatDate(key.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleKey(key.id, key.isActive)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded hover:bg-neutral-200 transition-colors"
                >
                  {key.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

interface DashboardStats {
  total: number
  active: number
  paused: number
  archived: number
  dynamic: number
  totalScans: number
}

export default function ProfileClient() {
  const { user, loading: userLoading, refreshUser, signOut } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState<'all' | 'active' | 'paused' | 'archived'>('all')
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    paused: 0,
    archived: 0,
    dynamic: 0,
    totalScans: 0,
  })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !user) {
      refreshUser()
    }
  }, [userLoading, user, refreshUser])

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/qrcodes?status=all&limit=1')
        const data = await response.json()
        if (data.success) {
          setStats(data.data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    if (user) {
      fetchStats()
    }
  }, [user])

  // 处理状态改变
  const handleStatusChange = (newStatus: 'all' | 'active' | 'paused' | 'archived') => {
    router.replace(`/dashboard?status=${newStatus}`)
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-neutral-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // 会被重定向到登录页
  }

  const plan = getPlanLabel(user.plan)
  const planKey = plan.toLowerCase()
  const subscription = user.subscription

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
                    
                    const inviteLink = `${window.location.origin}/?ref=${user.id}`
                    
                    try {
                      await navigator.clipboard.writeText(inviteLink)
                      setInviteMessage('Invite link copied to clipboard!')
                      setTimeout(() => setInviteMessage(null), 3000)
                    } catch (err) {
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
                {inviteMessage && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-[101]">
                    <div className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      {inviteMessage}
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

      <div className="flex">
        {/* 左侧导航栏 */}
        <SidebarNavigation status={status} onStatusChange={handleStatusChange} stats={stats} user={user} />

        {/* 主内容区 */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 页面标题 */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-neutral-900">Account Settings</h1>
            </div>

            <div className="space-y-8">
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8 px-8 py-10">
                  <div className="flex items-center gap-6">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name ?? 'User avatar'}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full border-4 border-white/40 shadow-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-2xl font-semibold">
                        {user.name?.charAt(0) ?? 'U'}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium uppercase tracking-wide">
                        Current plan · {plan}
                      </div>
                      <h1 className="text-3xl font-semibold">{user.name ?? 'Unnamed user'}</h1>
                      <p className="text-white/80">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    <p className="max-w-sm text-sm text-white/80">
                      {planDescriptions[planKey] ??
                        'Welcome to CustomQR.pro — manage your QR codes and subscription here.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/pricing"
                        className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/20 transition-colors"
                      >
                        View plans
                      </Link>
                      {subscription && (
                        <Link
                          href="/cancel-subscription"
                          className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/20 transition-colors"
                        >
                          Cancel Subscription
                        </Link>
                      )}
                      <button
                        onClick={() => refreshUser()}
                        className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-50 transition-colors"
                      >
                        Refresh profile
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
                    Login activity
                  </h2>
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-3xl font-semibold text-neutral-900">{user.loginCount ?? 0}</p>
                      <p className="text-sm text-neutral-500">Total sign-ins</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Last sign-in</p>
                      <p className="text-sm text-neutral-500">{formatDate(user.lastLoginAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
                    Subscription
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-neutral-600">
                    {subscription ? (
                      <>
                        <p className="text-lg font-semibold text-neutral-900">
                          {subscription.plan ?? plan}
                        </p>
                        <p>Status: {subscription.status ?? 'ACTIVE'}</p>
                        {subscription.expiresAt && (
                          <p>Renews on: {formatDate(subscription.expiresAt)}</p>
                        )}
                        {subscription.stripeSubscriptionId && (
                          <p className="truncate">
                            Subscription ID: {subscription.stripeSubscriptionId}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-neutral-500">
                        You are on the Free tier. Upgrade to Pro or Enterprise for dynamic codes and analytics.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
                    Quick actions
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-neutral-600">
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 font-medium text-neutral-700 hover:border-blue-200 hover:text-blue-600 transition-all"
                    >
                      <span>Go to Dashboard</span>
                      <span>→</span>
                    </Link>
                    <Link
                      href="/dashboard/create"
                      className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 font-medium text-neutral-700 hover:border-blue-200 hover:text-blue-600 transition-all"
                    >
                      <span>Create a new QR code</span>
                      <span>→</span>
                    </Link>
                    <Link
                      href="/pricing"
                      className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 font-medium text-neutral-700 hover:border-blue-200 hover:text-blue-600 transition-all"
                    >
                      <span>Upgrade plan</span>
                      <span>→</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full rounded-xl border border-red-200 px-4 py-3 font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out securely
                    </button>
                  </div>
                </div>
              </section>

              <ApiKeysSection />

              <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900">Account security tips</h2>
                <div className="mt-4 space-y-3 text-sm text-neutral-600">
                  <p>• Your Google credentials are only used for authentication and are never stored on our servers.</p>
                  <p>• Avatar and display name are synced from Google—update them there and hit "Refresh profile" to pull changes.</p>
                  <p>• Need help or want to close your account? Reach us anytime at javajia@gmail.com.</p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

