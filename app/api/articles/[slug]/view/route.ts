import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        // 增加浏览量
        // 使用 increment 操作是原子的，并发安全
        const updatedArticle = await prisma.article.update({
            where: { slug },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
            select: {
                viewCount: true, // 只返回 viewCount
            },
        })

        return NextResponse.json({
            success: true,
            views: updatedArticle.viewCount,
        })
    } catch (error) {
        console.error('Error incrementing view count:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update view count' },
            { status: 500 }
        )
    }
}
