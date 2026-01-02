import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findSimilarSlugs } from '@/lib/slug-similarity'

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

// 生成slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET - 检查slug相似度
export async function GET(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title')
    const slug = searchParams.get('slug')
    const excludeId = searchParams.get('excludeId') // 排除当前编辑的文章ID

    if (!title && !slug) {
      return NextResponse.json({ success: false, error: 'Title or slug is required' }, { status: 400 })
    }

    // 生成或使用提供的slug
    const articleSlug = slug || generateSlug(title || '')

    if (!articleSlug) {
      return NextResponse.json({ success: false, error: 'Invalid slug' }, { status: 400 })
    }

    // 获取所有文章
    const where: any = {}
    if (excludeId) {
      where.id = { not: parseInt(excludeId, 10) }
    }

    const allArticles = await prisma.article.findMany({
      where,
      select: { slug: true, title: true },
    })

    // 检查完全相同的slug
    const exactMatch = allArticles.find(a => a.slug.toLowerCase() === articleSlug.toLowerCase())
    if (exactMatch) {
      return NextResponse.json({
        success: true,
        hasExactMatch: true,
        exactMatch: {
          slug: exactMatch.slug,
          title: exactMatch.title,
        },
        similarArticles: [],
      })
    }

    // 检查相似度
    const similarSlugs = findSimilarSlugs(articleSlug, allArticles, 0.8)

    const similarArticles = similarSlugs.map(s => {
      const article = allArticles.find(a => a.slug === s.slug)
      return {
        slug: s.slug,
        title: article?.title || s.slug,
        similarity: Math.round(s.similarity * 100),
      }
    })

    return NextResponse.json({
      success: true,
      hasExactMatch: false,
      similarArticles,
    })
  } catch (error) {
    console.error('Error checking similarity:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
