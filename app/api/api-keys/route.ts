import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// 生成 API key
function generateApiKey(): { fullKey: string; hash: string; prefix: string } {
  // 生成随机密钥：cqr_sk_live_ + 32位随机字符
  const randomBytes = crypto.randomBytes(24).toString('base64url')
  const fullKey = `cqr_sk_live_${randomBytes}`
  
  // 使用 SHA-256 哈希存储（安全）
  const hash = crypto.createHash('sha256').update(fullKey).digest('hex')
  
  // 前缀用于显示（只显示前 20 个字符）
  const prefix = fullKey.substring(0, 20) + '...'
  
  return { fullKey, hash, prefix }
}

// GET - 获取用户的 API keys 列表
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: apiKeys,
    })
  } catch (error: any) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - 创建新的 API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, expiresAt } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'API key name is required' },
        { status: 400 }
      )
    }

    // 检查用户是否已有太多 API keys（限制为 10 个）
    const existingKeys = await prisma.apiKey.count({
      where: { userId },
    })

    if (existingKeys >= 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum number of API keys reached (10)' },
        { status: 400 }
      )
    }

    // 生成新的 API key
    const { fullKey, hash, prefix } = generateApiKey()

    // 解析过期时间（如果提供）
    let expiresAtDate: Date | null = null
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt)
      if (isNaN(expiresAtDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid expiration date' },
          { status: 400 }
        )
      }
    }

    // 保存到数据库（只保存哈希和前缀，不保存完整密钥）
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name: name.trim(),
        keyHash: hash,
        keyPrefix: prefix,
        expiresAt: expiresAtDate,
      },
    })

    // 返回完整密钥（只在创建时返回一次）
    return NextResponse.json({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: fullKey, // 完整密钥，只返回这一次
        keyPrefix: prefix,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

