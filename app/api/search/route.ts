import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - 公开搜索API（只搜索已发布的文章）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || searchParams.get('query') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: any = {
      published: true, // 只搜索已发布的文章
      publishedAt: { lte: new Date() }, // 只搜索已到发布时间的文章
    }

    // 搜索功能：搜索标题、描述、内容
    if (query && query.trim()) {
      const searchTerm = query.trim()
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
      ]
    }

    // 获取总数
    const total = await prisma.article.count({ where })

    // 获取分页数据
    const articles = await prisma.article.findMany({
      where,
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
      orderBy: {
        publishedAt: 'desc',
      },
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(total / limit)

    // 格式化返回数据
    const formattedArticles = articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      description: article.description || '',
      category: article.category.name,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
      viewCount: article.viewCount,
    }))

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error searching articles:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
