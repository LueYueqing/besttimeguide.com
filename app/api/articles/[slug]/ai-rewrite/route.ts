import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 检查是否为管理员
async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  return user?.isAdmin ? userId : null
}

// POST - 标记文章为 AI 改写状态
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const articleId = parseInt(slug, 10)

    if (isNaN(articleId)) {
      return NextResponse.json({ success: false, error: 'Invalid article ID' }, { status: 400 })
    }

    const body = await request.json()
    const { sourceContent } = body

    // 检查文章是否存在
    const existing = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    // 更新文章的 AI 改写状态
    // 注意：标记为待处理时，不设置 aiRewriteAt，因为还没有开始处理
    // aiRewriteAt 只在实际开始处理（processing）或完成/失败时才设置
    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        sourceContent: sourceContent || existing.sourceContent,
        aiRewriteStatus: 'pending', // 标记为待处理状态
        // 不设置 aiRewriteAt，保持为 null，直到实际开始处理
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      article,
      message: 'Article marked for AI rewrite',
    })
  } catch (error: any) {
    console.error('Error marking AI rewrite:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
