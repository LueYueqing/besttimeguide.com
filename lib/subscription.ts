import { PrismaClient, Plan } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 检查用户是否有权限访问 Analytics
 * @param userId 用户 ID (可以是 string 或 number)
 * @returns 是否有权限
 */
export async function hasAnalyticsAccess(userId: string | number): Promise<boolean> {
  try {
    // 转换为数字（因为数据库中的 id 现在是 Int）
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId
    if (isNaN(userIdNum)) {
      return false
    }
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) return false

    // 开发测试用户（仅在开发环境）
    if (process.env.NODE_ENV === 'development' && user.email === 'dev@customqr.pro') {
      return true
    }

    // 检查 Pro 试用权限
    if (user.proTrialExpiresAt && user.proTrialExpiresAt > new Date()) {
      return true
    }

    // 检查用户计划
    const plan = user.plan?.toUpperCase() as Plan
    if (plan === 'PRO' || plan === 'ENTERPRISE') {
      return true
    }

    // 检查是否有活跃的付费订阅
    const activeSubscription = user.subscriptions[0]
    if (activeSubscription) {
      const subscriptionPlan = activeSubscription.plan?.toUpperCase() as Plan
      if (subscriptionPlan === 'PRO' || subscriptionPlan === 'ENTERPRISE') {
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Error checking analytics access:', error)
    return false
  }
}

/**
 * 获取用户的有效计划（优先使用订阅，否则使用用户计划）
 */
export async function getUserEffectivePlan(userId: string): Promise<Plan> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) return Plan.FREE

    // 优先使用订阅计划
    const activeSubscription = user.subscriptions[0]
    if (activeSubscription) {
      return activeSubscription.plan
    }

    // 否则使用用户计划
    return user.plan || Plan.FREE
  } catch (error) {
    console.error('Error getting user plan:', error)
    return Plan.FREE
  }
}

