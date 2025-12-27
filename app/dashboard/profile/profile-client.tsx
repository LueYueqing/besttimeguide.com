'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../components/DashboardLayout'

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
            Manage your API keys for programmatic access to besttimeguide.com
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

export default function ProfileClient() {
  const { user, loading: userLoading, refreshUser } = useUser()
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !user) {
      refreshUser()
    }
  }, [userLoading, user, refreshUser])

  if (userLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-neutral-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const plan = getPlanLabel(user.plan)
  const planKey = plan.toLowerCase()
  const subscription = user.subscription

  return (
    <DashboardLayout title="账户设置">
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
                  'Welcome to besttimeguide.com — manage your account and subscription here.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    if (!user?.id) return
                    const inviteLink = `${window.location.origin}/?ref=${user.id}`
                    try {
                      await navigator.clipboard.writeText(inviteLink)
                      setInviteMessage('Copied!')
                      setTimeout(() => setInviteMessage(null), 3000)
                    } catch (err) {
                      setInviteMessage('Failed to copy')
                      setTimeout(() => setInviteMessage(null), 3000)
                    }
                  }}
                  className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/20 transition-colors"
                >
                  {inviteMessage || 'Invite user'}
                </button>
                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/20 transition-colors"
                >
                  View plans
                </Link>
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
                </>
              ) : (
                <p className="text-neutral-500">
                  You are on the Free tier. Upgrade to Pro for advanced features.
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
                href="/blog"
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 font-medium text-neutral-700 hover:border-blue-200 hover:text-blue-600 transition-all"
              >
                <span>Browse Articles</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <ApiKeysSection />

        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Account security tips</h2>
          <div className="mt-4 space-y-3 text-sm text-neutral-600">
            <p>• Your Google credentials are used only for authentication.</p>
            <p>• Avatar and display name are synced from Google.</p>
            <p>• Need help? Reach us anytime at support@besttimeguide.com.</p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
