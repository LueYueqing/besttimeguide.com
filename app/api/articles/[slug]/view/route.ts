import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        // 使用原始 SQL 更新浏览量，避免触发 Prisma 的 @updatedAt 自动更新
        // 这样 updatedAt 只会在文章内容真正被修改时（如编辑、AI 改写）才更新
        const result = await prisma.$executeRaw`
            UPDATE articles
            SET "viewCount" = "viewCount" + 1
            WHERE slug = ${slug}::text
        `

        // 获取更新后的浏览量
        const article = await prisma.article.findUnique({
            where: { slug },
            select: { viewCount: true },
        })

        return NextResponse.json({
            success: true,
            views: article?.viewCount || 0,
        })
    } catch (error) {
        console.error('Error incrementing view count:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update view count' },
            { status: 500 }
        )
    }
}
