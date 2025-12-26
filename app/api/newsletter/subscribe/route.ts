import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

// 生成验证令牌
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

// POST - 订阅 Newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'homepage' } = body

    // 验证邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // 检查是否已存在
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      // 如果已存在且是活跃状态，返回成功（避免重复订阅）
      if (existing.status === 'ACTIVE') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!',
          alreadySubscribed: true,
        })
      }

      // 如果之前取消过，重新激活
      if (existing.status === 'UNSUBSCRIBED') {
        const verificationToken = generateVerificationToken()
        await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase().trim() },
          data: {
            status: 'ACTIVE',
            source,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            verificationToken,
            verified: false,
          },
        })

        // TODO: 发送验证邮件
        // await sendVerificationEmail(email, verificationToken)

        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed! Please check your email to verify your subscription.',
        })
      }
    }

    // 创建新订阅
    const verificationToken = generateVerificationToken()
    await prisma.newsletterSubscription.create({
      data: {
        email: email.toLowerCase().trim(),
        source,
        verificationToken,
        status: 'ACTIVE',
        verified: false,
      },
    })

    // TODO: 发送验证邮件
    // await sendVerificationEmail(email, verificationToken)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Please check your email to verify your subscription.',
    })
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email already subscribed' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

