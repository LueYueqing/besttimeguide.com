'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'Server configuration error, please try again later',
    AccessDenied: 'Access denied',
    Verification: 'Verification failed, please try again',
    Default: 'An error occurred during sign in, please try again',
  }

  const errorMessage = errorMessages[error || ''] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
            Sign In Error
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {errorMessage}
          </p>
        </div>
        
        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
              Sign In Error
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Loading...
            </p>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}

