'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const isDevMode = process.env.NODE_ENV === 'development'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isDevLoading, setIsDevLoading] = useState(false)
  const [error, setError] = useState('')
  const [devEmail, setDevEmail] = useState('dev@example.com')
  const [devPassword, setDevPassword] = useState('dev123')
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    getSession().then((session) => {
      if (session) {
        router.push('/')
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Use redirect: true to let browser handle the OAuth flow directly
      // This avoids server-side fetch issues when VPN is required
      await signIn('google', {
        callbackUrl: '/',
        redirect: true
      })
    } catch (err) {
      setError('An error occurred during sign in. Please ensure your VPN is connected.')
      console.error('Sign in error:', err)
      setIsLoading(false)
    }
  }

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsDevLoading(true)
      setError('')
      
      console.log('[Dev Login] Attempting to sign in with:', { email: devEmail })
      
      const result = await signIn('dev-credentials', {
        email: devEmail,
        password: devPassword,
        redirect: false,
      })

      console.log('[Dev Login] Sign in result:', result)

      if (result?.error) {
        setError(`Login failed: ${result.error}. Use dev@example.com / dev123`)
        setIsDevLoading(false)
      } else if (result?.ok) {
        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        // Refresh session and redirect
        window.location.href = '/'
      } else {
        // If result is undefined or doesn't have ok/error, try to check session
        const session = await getSession()
        if (session) {
          window.location.href = '/'
        } else {
          setError('Login failed. Please check your credentials and ensure ENABLE_DEV_LOGIN=true is set.')
          setIsDevLoading(false)
        }
      }
    } catch (err) {
      setError('An error occurred during dev sign in.')
      console.error('Dev sign in error:', err)
      setIsDevLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
            Sign in to Your App
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Sign in with your Google account
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Development Login Form */}
          {isDevMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-3">Development Mode Login</h3>
              <form onSubmit={handleDevSignIn} className="space-y-3">
                <div>
                  <label htmlFor="dev-email" className="block text-xs font-medium text-yellow-700 mb-1">
                    Email
                  </label>
                  <input
                    id="dev-email"
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="dev@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dev-password" className="block text-xs font-medium text-yellow-700 mb-1">
                    Password
                  </label>
                  <input
                    id="dev-password"
                    type="password"
                    value={devPassword}
                    onChange={(e) => setDevPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="dev123"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isDevLoading}
                  className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-yellow-900 bg-yellow-200 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDevLoading ? 'Signing in...' : 'Dev Login'}
                </button>
              </form>
              <p className="mt-2 text-xs text-yellow-600">
                Set <code className="bg-yellow-100 px-1 rounded">ENABLE_DEV_LOGIN=true</code> in .env.local to enable
              </p>
            </div>
          )}
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-primary-50 to-primary-100 text-neutral-500">
                {isDevMode ? 'Or' : ''}
              </span>
            </div>
          </div>
          
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </div>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-neutral-600">
              By signing in, you agree to our{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

