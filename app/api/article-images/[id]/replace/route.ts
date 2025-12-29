import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { uploadBufferToR2 } from '@/lib/r2'

const prisma = new PrismaClient()

// 检查是否为管理员
async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) return null
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })
  return user?.isAdmin ? userId : null
}

// POST - 替换图片（保持原R2路径）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const imageId = parseInt(params.id)
    if (isNaN(imageId)) {
      return NextResponse.json({ success: false, error: 'Invalid image ID' }, { status: 400 })
    }

    // 获取现有图片信息
    const existingImage = await prisma.articleImage.findUnique({
      where: { id: imageId },
      include: { article: true },
    })

    if (!existingImage) {
      return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 })
    }

    // 解析表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      // 上传到R2，使用原路径（直接覆盖原文件）
      const result = await uploadBufferToR2(buffer, existingImage.name, file.type)

      // 更新数据库（只更新大小、尺寸等信息，保持路径不变）
      const updatedImage = await prisma.articleImage.update({
        where: { id: imageId },
        data: {
          size: result.size,
          width: result.width,
          height: result.height,
          updatedAt: new Date(),
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      })

      console.log(`[图片替换] 已替换图片内容（路径不变）: ${existingImage.r2Path}`)

      return NextResponse.json({
        success: true,
        data: updatedImage,
        message: 'Image replaced successfully, content updated without changing URL',
      })
    } catch (uploadError: any) {
      console.error('[图片替换] 上传到R2失败:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload image to R2: ' + uploadError.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[图片替换] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to replace image' },
      { status: 500 }
    )
  }
}
