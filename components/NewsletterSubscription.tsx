'use client'

import { useState } from 'react'

interface NewsletterSubscriptionProps {
  source?: string
}

export default function NewsletterSubscription({ source = 'homepage' }: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address',
      })
      return
    }

    setLoading(true)
    setStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus({
          type: 'success',
          message: data.message || 'Successfully subscribed!',
        })
        setEmail('')
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to subscribe. Please try again.',
        })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again later.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h4 className="font-bold text-white">BestTimeGuide Newsletter</h4>
      </div>
      <p className="text-white/90 mb-4 text-sm">
        Helpful guides delivered to your inbox every week!
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg text-neutral-900 bg-white border-none focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="wikihow-btn-large w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Subscribing...' : 'Sign me up!'}
        </button>
        {status.type && (
          <p className={`text-xs mt-2 ${
            status.type === 'success' ? 'text-green-300' : 'text-red-300'
          }`}>
            {status.message}
          </p>
        )}
        <p className="text-white/70 text-xs mt-2">
          By signing up you are agreeing to receive emails according to our privacy policy.
        </p>
      </form>
    </div>
  )
}

