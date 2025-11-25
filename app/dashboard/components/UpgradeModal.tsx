'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getRecommendedPlan, getPlanPricing, type PricingPlan } from '@/lib/pricing'
import Link from 'next/link'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string // 可选：触发升级的功能名称，如 "Analytics"
}

export default function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isAnnual, setIsAnnual] = useState(true)
  const [loading, setLoading] = useState(false)
  const plan = getRecommendedPlan()
  const pricing = getPlanPricing(plan.id, isAnnual)

  if (!isOpen) return null

  const handleUpgrade = async () => {
    // 如果未登录，先跳转到登录页面
    if (status === 'unauthenticated' || !session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/pricing')}`)
      return
    }

    try {
      setLoading(true)

      // 调用 API 创建 Checkout Session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan.id,
          billing: isAnnual ? 'annual' : 'monthly',
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        // 跳转到 Stripe Checkout
        window.location.href = data.url
      } else {
        console.error('Failed to create checkout session:', data.error)
        alert(data.error || 'Failed to start checkout. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">
            {feature ? `Unlock ${feature}` : 'Upgrade to Pro'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {feature && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">{feature}</span> is a premium feature. Upgrade to
                access advanced analytics, detailed insights, and more.
              </p>
            </div>
          )}

          {/* 计划信息 */}
          <div className="text-center mb-6">
            <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
              {plan.highlight}
            </div>
            <h3 className="text-2xl font-bold text-primary-600 mb-2">{plan.name}</h3>
            <p className="text-neutral-600 mb-4">{plan.description}</p>

            {/* 价格切换 */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-primary-600' : 'text-neutral-600'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isAnnual ? 'bg-primary-600' : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                    isAnnual ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-primary-600' : 'text-neutral-600'}`}>
                Annual
              </span>
              {isAnnual && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                  Save 20%
                </span>
              )}
            </div>

            {/* 价格显示 */}
            <div className="mb-4">
              <div className="text-4xl font-black text-primary-600 mb-1">
                {pricing?.displayPrice}
                <span className="text-base font-medium text-neutral-600">/month</span>
              </div>
              <p className="text-sm text-neutral-600">{pricing?.billing}</p>
              {isAnnual && pricing?.savings && (
                <p className="text-sm text-green-600 font-semibold mt-1">{pricing.savings}</p>
              )}
            </div>
          </div>

          {/* 主要功能列表 */}
          <div className="space-y-3 mb-6">
            {plan.features.included.slice(0, 5).map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-green-600 mt-0.5">✅</span>
                <span className="text-sm text-neutral-700">{feature}</span>
              </div>
            ))}
            {plan.features.included.length > 5 && (
              <p className="text-xs text-neutral-500 text-center">
                + {plan.features.included.length - 5} more features
              </p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={loading || status === 'loading'}
              className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Subscribe Now'}
            </button>
            <Link
              href="/pricing"
              onClick={onClose}
              className="block w-full text-center text-primary-600 font-medium py-2 hover:text-primary-700 transition-colors"
            >
              View All Plans →
            </Link>
          </div>

          <p className="text-center text-xs text-neutral-500 mt-4">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}

