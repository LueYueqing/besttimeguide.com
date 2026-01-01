import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const prisma = new PrismaClient()

// GET - 返回文章数据供前端生成PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 获取文章
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
      },
    })

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    // 返回文章数据
    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        description: article.description,
        content: article.content,
        category: article.category?.name || 'General',
        author: article.author?.name || 'Unknown',
        publishedAt: article.publishedAt,
        readingTime: article.readingTime || 0,
        coverImage: article.coverImage,
        featured: article.featured,
        tags: article.tags || [],
      }
    })
  } catch (error) {
    console.error('Error fetching article for PDF:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
