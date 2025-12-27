'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface User {
  id: number
  name?: string | null
  email?: string | null
  image?: string | null
  avatar_url?: string | null
  plan?: string
  isAdmin?: boolean
  subscription?: any
  proTrialExpiresAt?: string | Date | null
  proTrialDaysLeft?: number
  referralStats?: {
    totalReferrals: number
    successfulReferrals: number
  }
  loginCount?: number
  lastLoginAt?: string | Date | null
}

interface UserContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    if (session?.user) {
      try {
        // Add 10s timeout to prevent infinite loading
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch('/api/user/profile', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        if (response.ok) {
          const userData = await response.json()
          if (userData.success && userData.user) {
            setUser(userData.user)
          } else {
            console.error('Invalid user data structure:', userData)
            setUser(null)
          }
        } else {
          // 尝试获取错误详情
          let errorDetails = null
          try {
            const errorData = await response.json()
            errorDetails = errorData.error || errorData.message
          } catch {
            // 如果无法解析 JSON，使用状态码
            errorDetails = `HTTP ${response.status}`
          }

          // 401 或 404 表示用户未授权或不存在，可能是数据库重置后需要重新登录
          if (response.status === 401 || response.status === 404) {
            console.warn('User profile not found or unauthorized. User may need to sign in again.', {
              status: response.status,
              error: errorDetails,
            })
            // 清除 session，让用户重新登录
            setUser(null)
            // 可选：自动登出
            // await signOut({ redirect: false })
          } else if (response.status === 503) {
            // 503 Service Unavailable - 数据库连接问题
            console.error('Database service unavailable. Please try again later.', {
              status: response.status,
              error: errorDetails,
            })
            setUser(null)
          } else {
            // 其他错误（500 等）
            console.error('Failed to fetch user profile:', {
              status: response.status,
              error: errorDetails,
            })
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
    } else if (status === 'authenticated' && session?.user) {
      refreshUser()

      // 处理邀请关联（首次登录时）
      // 只在确实有 referral cookie 时才调用 API
      const associateReferral = async () => {
        try {
          // 检查是否有 referral cookie
          const hasReferralCookie = document.cookie
            .split(';')
            .some(cookie => cookie.trim().startsWith('referral_ref='))

          if (!hasReferralCookie) {
            // 没有 cookie，不需要调用 API
            return
          }

          const response = await fetch('/api/referral/associate', {
            method: 'POST',
          })

          const data = await response.json()

          // 只在真正的系统错误时才记录（忽略预期的业务逻辑错误）
          // 预期的业务逻辑错误（400 状态码）不应该记录
          // 数据库连接错误（503）也应该静默处理，这是临时性问题
          if (!response.ok && response.status >= 500 && response.status !== 503) {
            // 只有非临时的服务器错误（500, 502, 504等）才记录
            // 503 Service Unavailable（包括数据库连接错误）静默处理
            if (data.error) {
              console.error('Error associating referral:', data.error)
            }
          }
          // 其他情况（包括业务逻辑错误、数据库连接错误等）静默处理
        } catch (error) {
          // 网络错误等才记录
          console.error('Error associating referral:', error)
        }
      }

      // 延迟执行，确保用户信息已加载
      setTimeout(associateReferral, 1000)
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [session, status])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    setUser(null)
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        signOut: handleSignOut,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

