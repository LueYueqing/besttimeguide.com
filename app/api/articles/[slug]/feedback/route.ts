import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - 提交文章反馈
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { helpful } = body

    // 验证参数
    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'helpful parameter is required and must be boolean' },
        { status: 400 }
      )
    }

    // 查找文章
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // 获取客户端IP和User-Agent（用于防止重复提交，可选）
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      null
    const userAgent = request.headers.get('user-agent') || null

    // 创建反馈记录
    const feedback = await prisma.articleFeedback.create({
      data: {
        articleId: article.id,
        helpful,
        ipAddress,
        userAgent,
      },
    })

    // 获取统计信息
    const stats = await prisma.articleFeedback.groupBy({
      by: ['helpful'],
      where: { articleId: article.id },
      _count: true,
    })

    const yesCount = stats.find((s) => s.helpful === true)?._count || 0
    const noCount = stats.find((s) => s.helpful === false)?._count || 0

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        helpful: feedback.helpful,
        createdAt: feedback.createdAt,
      },
      stats: {
        yes: yesCount,
        no: noCount,
        total: yesCount + noCount,
      },
    })
  } catch (error: any) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - 获取文章反馈统计
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 查找文章
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // 获取统计信息
    const stats = await prisma.articleFeedback.groupBy({
      by: ['helpful'],
      where: { articleId: article.id },
      _count: true,
    })

    const yesCount = stats.find((s) => s.helpful === true)?._count || 0
    const noCount = stats.find((s) => s.helpful === false)?._count || 0

    return NextResponse.json({
      success: true,
      stats: {
        yes: yesCount,
        no: noCount,
        total: yesCount + noCount,
      },
    })
  } catch (error: any) {
    console.error('Error fetching feedback stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

