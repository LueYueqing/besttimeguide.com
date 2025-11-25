'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { useEffect } from 'react'

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

export default function ProfileClient() {
  const { user, loading, refreshUser, signOut } = useUser()

  useEffect(() => {
    if (!loading && !user) {
      refreshUser()
    }
  }, [loading, user, refreshUser])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-24 rounded-3xl bg-neutral-100" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-40 rounded-2xl bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
        <h1 className="text-3xl font-semibold text-neutral-900">We couldn’t load your profile</h1>
        <p className="text-neutral-600">
          Refresh the page or sign in again to retrieve the latest account details.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => refreshUser()}
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition-colors"
          >
            Reload profile
          </button>
          <button
            onClick={() => signOut()}
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  const plan = getPlanLabel(user.plan)
  const planKey = plan.toLowerCase()
  const subscription = user.subscription

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
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

      <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">Account security tips</h2>
        <div className="mt-4 space-y-3 text-sm text-neutral-600">
          <p>• Your Google credentials are only used for authentication and are never stored on our servers.</p>
          <p>• Avatar and display name are synced from Google—update them there and hit “Refresh profile” to pull changes.</p>
          <p>• Need help or want to close your account? Reach us anytime at javajia@gmail.com.</p>
        </div>
      </section>
    </div>
  )
}

