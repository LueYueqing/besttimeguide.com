'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import Image from 'next/image'

export default function AuthButton() {
  const { data: session, status } = useSession()
  const { user, signOut } = useUser()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="inline-flex items-center justify-center text-sm font-bold text-black bg-wikihow-yellow-400 border-none rounded-wikihow-button hover:bg-wikihow-yellow-500 transition-all duration-200 cursor-pointer px-4 py-2"
        style={{ lineHeight: '21px' }}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
        Sign In
      </Link>
    )
  }

  const avatarUrl = user?.avatar_url || user?.image || session?.user?.image

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-2 transition-colors"
      >
        {avatarUrl ? (
          <Image
            className="w-8 h-8 rounded-full"
            src={avatarUrl}
            alt={user?.name || session?.user?.name || 'User'}
            width={32}
            height={32}
          />
        ) : (
          <div className="w-8 h-8 bg-primary-300 rounded-full flex items-center justify-center">
            <span className="text-primary-800 font-medium text-sm">
              {user?.name?.charAt(0) || session?.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        <span className="hidden md:block">
          {user?.name || session?.user?.name || 'User'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-neutral-200">
            <div className="px-4 py-2 border-b border-neutral-100">
              <p className="text-sm font-medium text-neutral-900">
                {user?.name || session?.user?.name}
              </p>
              <p className="text-sm text-neutral-500">
                {user?.email || session?.user?.email}
              </p>
              {user?.plan && (
                <p className="text-xs text-primary-600 mt-1">
                  Plan: {user.plan}
                </p>
              )}
            </div>
            
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              onClick={() => setIsDropdownOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              onClick={() => setIsDropdownOpen(false)}
            >
              Profile
            </Link>
            
            <div className="border-t border-neutral-100">
              <button
                onClick={() => {
                  signOut()
                  setIsDropdownOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
