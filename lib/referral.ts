import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 给邀请人发放奖励（3天 Pro 权限）
 * @param referrerId 邀请人用户 ID
 */
export async function grantReferralReward(referrerId: string) {
  try {
    // 获取邀请人信息
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
    })

    if (!referrer) {
      console.error(`Referrer not found: ${referrerId}`)
      return false
    }

    // 计算新的 Pro 试用到期时间
    const now = new Date()
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000 // 3天的毫秒数

    let newExpiresAt: Date

    if (referrer.proTrialExpiresAt && referrer.proTrialExpiresAt > now) {
      // 如果已有未过期的 Pro 试用，在现有基础上增加 3 天
      newExpiresAt = new Date(referrer.proTrialExpiresAt.getTime() + threeDaysInMs)
    } else {
      // 如果没有或已过期，从今天开始计算 3 天
      newExpiresAt = new Date(now.getTime() + threeDaysInMs)
    }

    // 更新邀请人的 Pro 试用到期时间
    await prisma.user.update({
      where: { id: referrerId },
      data: {
        proTrialExpiresAt: newExpiresAt,
      },
    })

    console.log(`Granted 3 days Pro trial to referrer ${referrerId}, expires at ${newExpiresAt}`)
    return true
  } catch (error) {
    console.error('Error granting referral reward:', error)
    return false
  }
}

/**
 * 处理被邀请人首次登录，发放邀请奖励
 * @param referredUserId 被邀请人用户 ID
 */
export async function processReferralReward(referredUserId: string) {
  try {
    // 获取被邀请人信息
    const referredUser = await prisma.user.findUnique({
      where: { id: referredUserId },
    })

    if (!referredUser || !referredUser.referredBy) {
      return false
    }

    // 检查是否已经有邀请记录
    const existingReferral = await prisma.referral.findUnique({
      where: { referredUserId: referredUserId },
    })

    if (existingReferral) {
      // 如果记录已存在但奖励未发放，发放奖励
      if (!existingReferral.rewardGranted) {
        const success = await grantReferralReward(existingReferral.referrerId)
        if (success) {
          await prisma.referral.update({
            where: { id: existingReferral.id },
            data: {
              rewardGranted: true,
              rewardGrantedAt: new Date(),
            },
          })
        }
        return success
      }
      return false // 奖励已发放
    }

    // 创建新的邀请记录
    const referral = await prisma.referral.create({
      data: {
        referrerId: referredUser.referredBy,
        referredUserId: referredUserId,
        rewardGranted: false,
      },
    })

    // 发放奖励
    const success = await grantReferralReward(referral.referrerId)
    if (success) {
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          rewardGranted: true,
          rewardGrantedAt: new Date(),
        },
      })
    }

    return success
  } catch (error) {
    console.error('Error processing referral reward:', error)
    return false
  }
}

/**
 * 获取用户的邀请统计
 */
export async function getReferralStats(userId: string) {
  try {
    const [totalReferrals, rewardedReferrals] = await Promise.all([
      prisma.referral.count({
        where: { referrerId: userId },
      }),
      prisma.referral.count({
        where: {
          referrerId: userId,
          rewardGranted: true,
        },
      }),
    ])

    return {
      totalReferrals,
      rewardedReferrals,
    }
  } catch (error) {
    console.error('Error getting referral stats:', error)
    return {
      totalReferrals: 0,
      rewardedReferrals: 0,
    }
  }
}
