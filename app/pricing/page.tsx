'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState<'pro' | 'enterprise' | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  const handleGetStarted = () => {
    router.push('/')
  }

  const handleStartTrial = async (plan: 'pro' | 'enterprise') => {
    // 如果正在加载，等待
    if (status === 'loading' || loadingPlan !== null) {
      return
    }

    // 如果未登录，先跳转到登录页面
    if (status === 'unauthenticated' || !session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/pricing')}`)
      return
    }

    try {
      setLoadingPlan(plan)
      
      // 调用 API 创建 Checkout Session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          billing: isAnnual ? 'annual' : 'monthly',
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        // 跳转到 Stripe Checkout
        window.location.href = data.url
      } else {
        console.error('Failed to create checkout session:', data.error)
        
        // 如果用户已有活跃订阅，提供更友好的提示
        if (data.hasActiveSubscription) {
          if (confirm(data.error + '\n\nWould you like to manage your subscription?')) {
            router.push('/profile')
          }
        } else {
          alert(data.error || 'Failed to start checkout. Please try again.')
        }
        setLoadingPlan(null)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('An error occurred. Please try again.')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero区域 */}
      <section className="hero hero-bg bg-pattern">
        <div className="hero-container text-center">
          <div className="hero-badge fade-in-up">
            <span>💎</span>
            <span>Simple, Transparent Pricing</span>
          </div>
          
          <h1 className="hero-title fade-in-up">
            Choose the Perfect Plan<br />
            <span className="text-gradient">For Your Needs</span>
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Start free, upgrade when you need advanced features. No hidden fees, 
            no surprises. Cancel anytime with 30-day money-back guarantee.
          </p>

          {/* 年度/月度切换 */}
          <div className="flex items-center justify-center gap-4 mb-4 fade-in-up">
            <span className={`font-medium ${!isAnnual ? 'text-primary-600' : 'text-neutral-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                isAnnual ? 'bg-primary-600' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                  isAnnual ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium ${isAnnual ? 'text-primary-600' : 'text-neutral-600'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                Save up to 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 定价计划对比 */}
      <section className="section bg-white -mt-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* 免费版 */}
            <div className="card p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Free Forever</h3>
                <div className="text-4xl font-black text-neutral-900 mb-1">$0</div>
                <p className="text-neutral-600">Perfect for personal use</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Unlimited Static QR Codes</span>
                    <p className="text-sm text-neutral-500">Generate as many static QR codes as you need</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Basic Customization</span>
                    <p className="text-sm text-neutral-500">Choose colors and basic styling options</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">PNG Downloads</span>
                    <p className="text-sm text-neutral-500">Download in standard PNG format</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Personal Use License</span>
                    <p className="text-sm text-neutral-500">Free for personal projects</p>
                  </div>
                </div>

                <hr className="border-neutral-200 my-6" />

                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-warning-500 mt-0.5"></i>
                  <div>
                    <span className="text-neutral-500">Dynamic QR Codes</span>
                    <p className="text-xs text-neutral-400 mt-0.5">Limited to 3 dynamic codes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-times-circle text-error-500 mt-0.5"></i>
                  <span className="text-neutral-500">Analytics & Tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-times-circle text-error-500 mt-0.5"></i>
                  <span className="text-neutral-500">Logo Upload</span>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-times-circle text-error-500 mt-0.5"></i>
                  <span className="text-neutral-500">API Access</span>
                </div>
              </div>
              
              <button 
                onClick={handleGetStarted}
                className="btn btn-secondary w-full btn-lg"
              >
                <span>🎯</span>
                Get Started Free
              </button>
            </div>

            {/* 专业版 - Most Popular */}
            <div className="relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-accent-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  🔥 Most Popular
                </span>
              </div>
              <div className="card p-8 border-2 border-primary-500 pt-12">
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary-600 mb-2">Professional</h3>
                <div className="text-4xl font-black text-primary-600 mb-1">
                  ${isAnnual ? '4.99' : '5.99'}
                  <span className="text-base font-medium text-neutral-600">/month</span>
                </div>
                <p className="text-neutral-600">
                  {isAnnual ? 'Billed annually ($59.88/year)' : 'Billed monthly'}
                </p>
                {isAnnual && (
                  <p className="text-success-600 font-semibold text-sm mt-1">
                    Save $12 per year!
                  </p>
                )}
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Everything in Free</span>
                    <p className="text-sm text-neutral-500">All free features included</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Up to 50 Dynamic QR Codes</span>
                    <p className="text-sm text-neutral-500">Edit destination URLs anytime</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Advanced Analytics</span>
                    <p className="text-sm text-neutral-500">Detailed scan statistics and insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Logo Upload & Custom Design</span>
                    <p className="text-sm text-neutral-500">Brand your QR codes with logos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Multiple Download Formats</span>
                    <p className="text-sm text-neutral-500">PNG, SVG, PDF + all resolutions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Bulk QR Code Generation</span>
                    <p className="text-sm text-neutral-500">Generate hundreds at once</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Full API Access</span>
                    <p className="text-sm text-neutral-500">Integrate with your applications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Priority Support</span>
                    <p className="text-sm text-neutral-500">Email support within 24 hours</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleStartTrial('pro')}
                disabled={loadingPlan === 'pro' || status === 'loading'}
                className="btn btn-primary w-full btn-lg pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🚀</span>
                {loadingPlan === 'pro' ? 'Loading...' : 'Subscribe Now'}
              </button>
              
              <p className="text-center text-neutral-500 text-sm mt-4">
                Cancel anytime • No commitment
              </p>
              </div>
            </div>

            {/* 企业版 */}
            <div className="card p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-black text-neutral-900 mb-1">
                  ${isAnnual ? '19.99' : '24.99'}
                  <span className="text-base font-medium text-neutral-600">/month</span>
                </div>
                <p className="text-neutral-600">
                  {isAnnual ? 'Billed annually ($239.88/year)' : 'Billed monthly'}
                </p>
                {isAnnual && (
                  <p className="text-success-600 font-semibold text-sm mt-1">
                    Save $60 per year!
                  </p>
                )}
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Everything in Professional</span>
                    <p className="text-sm text-neutral-500">All Pro features included</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Up to 500 Dynamic QR Codes</span>
                    <p className="text-sm text-neutral-500">Scale for large organizations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Advanced Analytics & Reports</span>
                    <p className="text-sm text-neutral-500">Device analysis, geo tracking, data export (CSV/PDF)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Real-time Scan Monitoring</span>
                    <p className="text-sm text-neutral-500">Live tracking and notifications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">White-label Solution</span>
                    <p className="text-sm text-neutral-500">Completely branded experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Team Collaboration</span>
                    <p className="text-sm text-neutral-500">Multi-user accounts and permissions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Advanced Security</span>
                    <p className="text-sm text-neutral-500">SSO, 2FA, audit logs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">Priority Support</span>
                    <p className="text-sm text-neutral-500">Dedicated account manager & 24/7 support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-600 mt-0.5"></i>
                  <div>
                    <span className="font-semibold">SLA Guarantee</span>
                    <p className="text-sm text-neutral-500">99.9% uptime commitment</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleStartTrial('enterprise')}
                disabled={loadingPlan === 'enterprise' || status === 'loading'}
                className="btn btn-accent w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🚀</span>
                {loadingPlan === 'enterprise' ? 'Loading...' : 'Subscribe Now'}
              </button>
              
              <p className="text-center text-neutral-500 text-sm mt-4">
                Cancel anytime • No commitment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 邀请奖励提示 - 移到付费计划下方 */}
      <section className="section bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">🎁</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    Invite Friends, Get Free Pro Access!
                  </h3>
                  <p className="text-sm text-neutral-700 mb-3">
                    Share your invite link and get <strong className="text-blue-600">3 days of Pro features</strong> for each friend who registers and logs in. 
                    Rewards stack - invite more friends to extend your trial period!
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-xs mb-3">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <i className="fas fa-check-circle text-success-600"></i>
                      <span>3 days Pro access per referral</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <i className="fas fa-check-circle text-success-600"></i>
                      <span>Rewards accumulate</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <i className="fas fa-check-circle text-success-600"></i>
                      <span>No limit on referrals</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <i className="fas fa-check-circle text-success-600"></i>
                      <span>Instant activation</span>
                    </div>
                  </div>
                  {session?.user ? (
                    <div className="pt-3 border-t border-blue-200">
                      <a
                        href="/dashboard"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                      >
                        Get your invite link →
                      </a>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-blue-200">
                      <a
                        href="/auth/signin"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                      >
                        Sign in to get your invite link →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 价值主张 */}
      <section className="section bg-gradient-primary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose CustomQR.pro?</h2>
            <p className="section-subtitle">
              The smart choice for professional QR code generation
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 最佳性价比 */}
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-success-100 text-success-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                💰
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Best Value</h3>
              <p className="text-neutral-700 mb-6">
                Professional features at just <strong>$4.99/month</strong>. 
                Get unlimited dynamic QR codes without breaking the bank.
              </p>
              <div className="bg-success-50 p-4 rounded-xl">
                <p className="text-success-700 font-semibold">
                  Save up to 85% compared to premium alternatives
                </p>
              </div>
            </div>

            {/* 无需注册 */}
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                🚀
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Instant Access</h3>
              <p className="text-neutral-700 mb-6">
                Start creating QR codes immediately. No registration required for basic features. 
                Get started in seconds, not minutes.
              </p>
              <div className="bg-primary-50 p-4 rounded-xl">
                <p className="text-primary-700 font-semibold">
                  Zero friction, maximum productivity
                </p>
              </div>
            </div>

            {/* 现代技术 */}
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Modern Technology</h3>
              <p className="text-neutral-700 mb-6">
                Built with Next.js 15 and React 19. Lightning-fast performance, 
                mobile-optimized, and always up-to-date.
              </p>
              <div className="bg-accent-50 p-4 rounded-xl">
                <p className="text-accent-700 font-semibold">
                  Future-proof technology stack
                </p>
              </div>
            </div>
          </div>

          {/* 核心优势列表 */}
          <div className="mt-16 bg-primary-800/90 backdrop-blur-sm rounded-2xl p-8 border border-primary-600/30">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              What Makes Us Different
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-success-900 text-xs"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Unlimited Dynamic QR Codes</h4>
                  <p className="text-primary-200">Create as many trackable QR codes as you need</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-success-900 text-xs"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Multiple Download Formats</h4>
                  <p className="text-primary-200">PNG, SVG, and PDF formats for any use case</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-success-900 text-xs"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Advanced Analytics</h4>
                  <p className="text-primary-200">Detailed scan statistics and user insights</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-success-900 text-xs"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Full API Access</h4>
                  <p className="text-primary-200">Integrate QR generation into your applications</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-success-900 text-xs"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Custom Branding</h4>
                  <p className="text-primary-200">Add your logo and customize colors</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-success-900 text-xs"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Bulk Generation</h4>
                  <p className="text-primary-200">Create hundreds of QR codes at once</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-3">Can I cancel my subscription anytime?</h3>
              <p className="text-neutral-600">
                Yes, you can cancel your subscription at any time. Your account will remain active 
                until the end of your current billing period, and you won't be charged again.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-3">Do you offer refunds?</h3>
              <p className="text-neutral-600">
                We offer a 30-day money-back guarantee. If you're not satisfied with CustomQR.pro 
                within the first 30 days, we'll refund your payment in full.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-3">What happens to my QR codes if I downgrade?</h3>
              <p className="text-neutral-600">
                Static QR codes will continue to work forever. Dynamic QR codes will remain active, 
                but you won't be able to edit them or view analytics until you upgrade again.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-3">Is there a setup fee?</h3>
              <p className="text-neutral-600">
                No setup fees, no hidden costs. You only pay the monthly or annual subscription price.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-3">Can I upgrade or downgrade my plan?</h3>
              <p className="text-neutral-600">
                Yes, you can change your plan at any time. Upgrades take effect immediately, 
                and we'll prorate the difference in cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 最终CTA */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-black mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl lg:text-2xl text-primary-100 mb-8">
              Join 2,500+ professionals who trust CustomQR.pro. 
              Start your subscription today!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <span className="font-semibold">Instant Access</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <span className="font-semibold">No Setup Fee</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <span className="font-semibold">Cancel Anytime</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button 
                onClick={() => handleStartTrial('pro')}
                disabled={loadingPlan === 'pro' || status === 'loading'}
                className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg font-bold pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🎯</span>
                {loadingPlan === 'pro' ? 'Loading...' : 'Get Started Now'}
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="btn btn-ghost text-white border-white/30 hover:bg-white/10 btn-lg"
              >
                <span>📞</span>
                Contact Support
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-primary-200 text-sm">
              <span><i className="fas fa-check-circle mr-1"></i>30-day money-back guarantee</span>
              <span><i className="fas fa-check-circle mr-1"></i>99.9% uptime SLA</span>
              <span><i className="fas fa-check-circle mr-1"></i>24/7 premium support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="full" />
    </div>
  )
}
