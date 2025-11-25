import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { processReferralReward } from './referral'

const REQUIRED_ENV_VARS: Record<string, string | undefined> = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL,
}

const maskSecret = (value?: string | null) => {
  if (!value) return '<<missing>>'
  const trimmed = value.trim()
  if (trimmed.length <= 6) return `${trimmed[0] ?? ''}***${trimmed.slice(-1)}`
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-3)}`
}

const missingEnvVars = Object.entries(REQUIRED_ENV_VARS)
  .filter(([_, value]) => !value || value.trim().length === 0)
  .map(([key]) => key)

if (missingEnvVars.length > 0) {
  console.error('[Auth][Config] Missing environment variables:', missingEnvVars.join(', '))
} else {
  console.log(
    '[Auth][Config] Environment variables detected:',
    Object.entries(REQUIRED_ENV_VARS)
      .map(([key, value]) => `${key}=${maskSecret(value)}`)
      .join(' | ')
  )
}

if (process.env.NEXTAUTH_URL) {
  try {
    // Validate NEXTAUTH_URL format to surface misconfiguration early
    const url = new URL(process.env.NEXTAUTH_URL)
    console.log('[Auth][Config] NEXTAUTH_URL set to:', url.origin)
  } catch (error) {
    console.error('[Auth][Config] Invalid NEXTAUTH_URL value:', process.env.NEXTAUTH_URL, error)
  }
} else {
  console.warn('[Auth][Config] NEXTAUTH_URL is not set; callbacks may fail in production.')
}

const prisma = new PrismaClient()

const safeSerialize = (value: unknown): unknown => {
  if (!value) return value
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      cause: safeSerialize((value as any).cause),
    }
  }
  if (typeof value === 'object') {
    try {
      return JSON.parse(JSON.stringify(value, (_key, val) => {
        if (typeof val === 'bigint') {
          return val.toString()
        }
        if (val instanceof Error) {
          return {
            name: val.name,
            message: val.message,
            stack: val.stack,
            cause: safeSerialize((val as any).cause),
          }
        }
        return val
      }))
    } catch (error) {
      return { raw: String(value), error: (error as Error)?.message }
    }
  }
  return value
}

// Instrument Prisma adapter to surface detailed errors
const createInstrumentedAdapter = () => {
  const baseAdapter = PrismaAdapter(prisma) as any
  const methodsToInstrument = [
    'getUser',
    'getUserByEmail',
    'getUserByAccount',
    'createUser',
    'updateUser',
    'linkAccount',
    'createSession',
    'getSessionAndUser',
    'updateSession',
    'deleteSession',
  ] as const

  methodsToInstrument.forEach((methodName) => {
    const original = baseAdapter[methodName]
    if (typeof original === 'function') {
      baseAdapter[methodName] = async (...args: unknown[]) => {
        console.log(`[Auth][Adapter][${methodName}] start`, JSON.stringify(args, (_key, val) => (typeof val === 'bigint' ? val.toString() : val)))
        try {
          let result = await original(...args)
          
          // 如果是 createUser，检查是否有邀请人（从 cookie 中读取）
          if (methodName === 'createUser' && result?.id) {
            try {
              // 注意：这里无法直接访问 request，需要在 events.createUser 中处理
              // 但我们可以在这里记录，实际处理在 events.createUser 中
              console.log(`[Auth][Adapter][createUser] User created: ${result.id}`)
            } catch (error) {
              console.error(`[Auth][Adapter][createUser] Error processing referral:`, error)
            }
          }
          
          console.log(`[Auth][Adapter][${methodName}] success`, JSON.stringify(result, (_key, val) => (typeof val === 'bigint' ? val.toString() : val)))
          return result
        } catch (error) {
          console.error(`[Auth][Adapter][${methodName}] error`, JSON.stringify(safeSerialize(error), null, 2))
          throw error
        }
      }
    }
  })

  return baseAdapter
}

export const authOptions: any = {
  adapter: createInstrumentedAdapter(),
  logger: {
    error(code: string, metadata?: unknown) {
      console.error('[Auth][Logger][error]', code, JSON.stringify(safeSerialize(metadata), null, 2))
    },
    warn(code: string, metadata?: unknown) {
      console.warn('[Auth][Logger][warn]', code, JSON.stringify(safeSerialize(metadata), null, 2))
    },
    debug(code: string, metadata?: unknown) {
      console.debug('[Auth][Logger][debug]', code, JSON.stringify(safeSerialize(metadata), null, 2))
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      // Add authorization params for better compatibility
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
    }),
    // Development mode credentials provider (only enabled in development)
    ...(process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_LOGIN === 'true'
      ? [
          CredentialsProvider({
            id: 'dev-credentials',
            name: 'Development Login',
            credentials: {
              email: { label: 'Email', type: 'email', placeholder: 'dev@customqr.pro' },
              password: { label: 'Password', type: 'password', placeholder: 'dev123' },
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) {
                return null
              }

              // Only allow dev@customqr.pro with password 'dev123' in development
              const DEV_EMAIL = 'dev@customqr.pro'
              const DEV_PASSWORD = 'dev123'

              if (credentials.email !== DEV_EMAIL || credentials.password !== DEV_PASSWORD) {
                console.warn('[Auth][Dev] Invalid dev credentials attempt:', credentials.email)
                return null
              }

              try {
                // Find or create dev user
                let user = await prisma.user.findUnique({
                  where: { email: DEV_EMAIL },
                })

                if (!user) {
                  // Create dev user if doesn't exist
                  user = await prisma.user.create({
                    data: {
                      email: DEV_EMAIL,
                      name: 'Development User',
                      emailVerified: new Date(),
                      plan: 'FREE',
                    },
                  })
                  console.log('[Auth][Dev] Created dev user:', user.id)
                }

                // Update login info
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    lastLoginAt: new Date(),
                    loginCount: { increment: 1 },
                  },
                })

                console.log('[Auth][Dev] Dev user logged in:', user.id, 'type:', typeof user.id)

                // 确保返回的 id 是数字类型
                const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
                
                return {
                  id: userId,
                  email: user.email,
                  name: user.name,
                  image: user.image,
                }
              } catch (error) {
                console.error('[Auth][Dev] Error in dev login:', error)
                return null
              }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token?: any }) {
      if (session?.user && token) {
        console.log('[Auth][Callback][session] start', {
          hasUser: !!session.user,
          tokenSub: token.sub,
          tokenId: token.id,
        })
        // Get user ID from token
        const userIdRaw = token.sub || token.id
        // 转换为数字（因为数据库中的 id 现在是 Int）
        let userId: number | null = null
        if (userIdRaw) {
          if (typeof userIdRaw === 'string') {
            // 尝试解析为数字
            const parsed = parseInt(userIdRaw, 10)
            if (!isNaN(parsed)) {
              userId = parsed
            } else {
              // 如果是字符串但不是数字（可能是旧的 CUID），尝试通过 email 查找用户
              console.warn('[Auth][Callback][session] Token contains non-numeric ID, will lookup by email', {
                tokenId: userIdRaw,
                email: session.user?.email,
              })
            }
          } else if (typeof userIdRaw === 'number') {
            userId = userIdRaw
          }
        }
        
        if (userId && !isNaN(userId)) {
          (session.user as any).id = userId
        } else if (session.user?.email) {
          // 如果无法从 token 获取数字 ID，尝试通过 email 查找用户
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
              select: { id: true },
            })
            if (dbUser) {
              userId = typeof dbUser.id === 'string' ? parseInt(dbUser.id, 10) : dbUser.id
              if (!isNaN(userId)) {
                (session.user as any).id = userId
                console.log('[Auth][Callback][session] User ID resolved from email', {
                  email: session.user.email,
                  userId: userId,
                })
              }
            }
          } catch (error: any) {
            console.error('[Auth][Callback][session] Error looking up user by email', {
              email: session.user?.email,
              errorMessage: error?.message || String(error),
              errorCode: error?.code,
              errorName: error?.name,
            })
          }
        }
        
        // Fetch complete user information from database
        if (userId && !isNaN(userId) && userId > 0) {
          try {
            console.log('[Auth][Callback][session] Fetching user from database', {
              userId,
              userIdType: typeof userId,
              email: session.user?.email,
            })
            
            const dbUser = await prisma.user.findUnique({
              where: { id: userId },
              include: {
                subscriptions: {
                  where: {
                    status: 'ACTIVE',
                    OR: [
                      { expiresAt: null },
                      { expiresAt: { gt: new Date() } }
                    ]
                  },
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            })
            
            if (!dbUser) {
              console.warn('[Auth][Callback][session] User not found in database', {
                userId,
                email: session.user?.email,
              })
              // 如果用户不存在，尝试通过 email 查找
              if (session.user?.email) {
                try {
                  const userByEmail = await prisma.user.findUnique({
                    where: { email: session.user.email },
                    include: {
                      subscriptions: {
                        where: {
                          status: 'ACTIVE',
                          OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: new Date() } }
                          ]
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 1
                      }
                    }
                  })
                  if (userByEmail) {
                    // 更新 session 中的 userId
                    const correctUserId = typeof userByEmail.id === 'string' ? parseInt(userByEmail.id, 10) : userByEmail.id
                    if (!isNaN(correctUserId)) {
                      (session.user as any).id = correctUserId
                      // 使用找到的用户信息
                      const safePlan = (() => {
                        const rawPlan = (userByEmail as any).plan
                        if (!rawPlan) return 'FREE'
                        if (typeof rawPlan === 'string') return rawPlan
                        if (typeof rawPlan === 'object') {
                          if (typeof rawPlan.valueOf === 'function') {
                            const value = rawPlan.valueOf()
                            if (typeof value === 'string') return value
                          }
                          if (typeof rawPlan.toString === 'function') {
                            return rawPlan.toString()
                          }
                        }
                        try {
                          return JSON.stringify(rawPlan)
                        } catch {
                          return 'FREE'
                        }
                      })()
                      
                      const safeSubscription = Array.isArray(userByEmail.subscriptions)
                        ? userByEmail.subscriptions[0] ?? null
                        : null
                      
                      const safeImage = userByEmail.image || (userByEmail as any).avatar || session.user.image || session.user.picture || null
                      
                      ;(session.user as any).plan = safePlan
                      ;(session.user as any).isAdmin = Boolean(userByEmail.isAdmin)
                      ;(session.user as any).subscription = safeSubscription
                      ;(session.user as any).image = safeImage
                      
                      console.log('[Auth][Callback][session] User found by email and hydrated', {
                        originalUserId: userId,
                        correctUserId: correctUserId,
                        plan: safePlan,
                      })
                      return session
                    }
                  }
                } catch (emailLookupError: any) {
                  console.error('[Auth][Callback][session] Error looking up user by email as fallback', {
                    email: session.user?.email,
                    errorMessage: emailLookupError?.message || String(emailLookupError),
                    errorCode: emailLookupError?.code,
                  })
                }
              }
              // 如果找不到用户，继续执行，返回基本 session（不中断流程）
            } else {
              // 用户存在，继续处理
              const safePlan = (() => {
                const rawPlan = (dbUser as any).plan
                if (!rawPlan) return 'FREE'
                if (typeof rawPlan === 'string') return rawPlan
                if (typeof rawPlan === 'object') {
                  if (typeof rawPlan.valueOf === 'function') {
                    const value = rawPlan.valueOf()
                    if (typeof value === 'string') return value
                  }
                  if (typeof rawPlan.toString === 'function') {
                    return rawPlan.toString()
                  }
                }
                try {
                  return JSON.stringify(rawPlan)
                } catch {
                  return 'FREE'
                }
              })()

              const safeSubscription = Array.isArray(dbUser.subscriptions)
                ? dbUser.subscriptions[0] ?? null
                : null

              const safeImage = dbUser.image || (dbUser as any).avatar || session.user.image || session.user.picture || null

              ;(session.user as any).plan = safePlan
              ;(session.user as any).isAdmin = Boolean(dbUser.isAdmin)
              ;(session.user as any).subscription = safeSubscription
              ;(session.user as any).image = safeImage

              console.log('[Auth][Callback][session] user hydrated', {
                userId,
                plan: safePlan,
                hasActiveSubscription: !!safeSubscription,
                imageFromDb: Boolean(dbUser.image || (dbUser as any).avatar),
              })
            }
          } catch (error: any) {
            // 检查是否是数据库连接错误
            const isDbConnectionError = error?.code && ['P1001', 'P1002', 'P1003'].includes(error.code)
            
            if (isDbConnectionError) {
              console.warn('[Auth][Callback][session] Database connection error, returning basic session', {
                userId,
                errorCode: error.code,
                email: session.user?.email,
              })
            } else {
              console.error('[Auth][Callback][session] Error fetching user', {
                userId: userId ?? 'undefined',
                errorMessage: error?.message || String(error),
                errorCode: error?.code,
                errorName: error?.name,
                userIdType: typeof userId,
                hasEmail: !!session.user?.email,
                email: session.user?.email,
              })
            }
            // 即使查询失败，也继续返回 session，避免完全阻止用户访问
            // 设置默认值，确保 session 可用
            if (!(session.user as any).plan) {
              ;(session.user as any).plan = 'FREE'
            }
          }
        } else {
          // userId 无效或不存在，设置默认值
          console.warn('[Auth][Callback][session] Invalid or missing userId, using default values', {
            userId: userId ?? 'undefined',
            userIdType: typeof userId,
            email: session.user?.email,
          })
          if (!(session.user as any).plan) {
            ;(session.user as any).plan = 'FREE'
          }
        }
      }
      return session
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      console.log('[Auth][Callback][jwt] start', {
        hasUser: !!user,
        hasAccount: !!account,
        tokenSub: token.sub,
        tokenId: token.id,
      })
      // Add user ID to token on first login
      if (user) {
        // 确保 user.id 是数字类型（因为数据库中的 id 现在是 Int）
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
        if (!isNaN(userId)) {
          token.id = userId
          token.sub = userId
          console.log('[Auth][Callback][jwt] user assigned', {
            userId: userId,
            originalType: typeof user.id,
            originalValue: user.id,
          })
        } else {
          console.error('[Auth][Callback][jwt] Invalid user ID', {
            userId: user.id,
            type: typeof user.id,
          })
        }
      }
      return token
    },
    async signIn({ user, account, profile, isNewUser }: { user: any; account?: any; profile?: any; isNewUser?: boolean }) {
      console.log('[Auth][Callback][signIn] start', {
        provider: account?.provider,
        userId: user?.id,
        email: user?.email,
        isNewUser,
      })
      
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (dbUser) {
            const wasFirstLogin = dbUser.loginCount === 0
            
            // 如果是新用户且还没有关联邀请人，尝试从 cookie 中读取并关联
            // 注意：这里无法直接访问 request，需要在 API 路由中处理
            // 我们会在用户首次登录时通过 API 处理邀请关联
            
            // 更新登录信息
            await prisma.user.update({
              where: { email: user.email },
              data: {
                lastLoginAt: new Date(),
                loginCount: { increment: 1 }
              }
            })

            // 处理邀请奖励（被邀请人首次登录时发放奖励给邀请人）
            // loginCount === 0 表示这是首次登录（注册后的第一次登录）
            if (dbUser.referredBy && wasFirstLogin) {
              await processReferralReward(dbUser.id)
            }

            console.log('[Auth][Callback][signIn] login info updated', {
              email: user.email,
              hasReferrer: !!dbUser.referredBy,
            })
          }
        } catch (error) {
          console.error('[Auth][Callback][signIn] Error updating login info', {
            email: user.email,
            error,
          })
        }
      }
      // Note: Dev credentials login info is already updated in the authorize function
      return true
    },
  },
  events: {
    async error(message: any) {
      console.error('[Auth][Event][error]', message)
    },
    async signIn(message: any) {
      console.log('[Auth][Event][signIn]', message)
    },
    async session(message: any) {
      console.log('[Auth][Event][session]', message)
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const, // Use JWT for session storage (works with PrismaAdapter)
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Add debug option to see more details
  debug: process.env.NODE_ENV === 'development',
}

// Export compatible with NextAuth v5
const handler = NextAuth(authOptions)

console.log('[Auth][Init] NextAuth handler initialized successfully')

export const { handlers, auth, signIn, signOut } = handler
