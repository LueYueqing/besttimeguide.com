'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

export default function CancelSubscriptionClient() {
  const { data: session } = useSession()
  const [email, setEmail] = useState(session?.user?.email || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'Your subscription has been canceled successfully. You will continue to have access until the end of your current billing period.',
        })
        setEmail('')
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to cancel subscription. Please try again or contact support.',
        })
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again or contact support.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />

      {/* Hero区域 */}
      <section className="hero hero-bg bg-pattern" style={{ paddingTop: '7rem' }}>
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">Cancel subscription</h1>
        </div>
      </section>

      {/* 取消订阅表单 */}
      <section className="section bg-white">
        <div className="container">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="card p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                  <p className="text-neutral-600 mb-6">
                    You can easily cancel your subscription by entering the email you used to subscribe to CustomQR.pro and click on the &quot;Cancel Subscription&quot; button.
                  </p>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="email">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input pl-10"
                        placeholder="Email you used for registration"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-neutral-500 mb-6">
                    Note: If you don&apos;t remember the email you used, please{' '}
                    <a href="/contact" className="font-semibold text-primary-600 hover:text-primary-700">
                      contact us
                    </a>
                    .
                  </p>

                  {message && (
                    <div
                      className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="btn btn-secondary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Cancel Subscription'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 联系支持 */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold mb-3">Email us</h5>
              <p className="text-neutral-600 mb-4">
                Email us for general queries, including marketing and partnership opportunities.
              </p>
              <a className="font-semibold text-primary-600 hover:text-primary-700" href="mailto:javajia@gmail.com">
                javajia@gmail.com
              </a>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold mb-3">Support</h5>
              <p className="text-neutral-600 mb-4">
                You can also contact us in the live support 24/7 available.
              </p>
              <a className="btn btn-primary btn-sm" href="/contact">
                Support Center
                <span className="ml-2">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="full" />
    </div>
  )
}

