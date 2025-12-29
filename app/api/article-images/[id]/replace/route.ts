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

    // 获取文件扩展名
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'

    // 生成新的文件名（使用原文件名，但保留原路径）
    const originalFileName = existingImage.name.split('.').slice(0, -1).join('.')
    const newFileName = `${originalFileName}.${extension}`

    // 上传到R2（使用原路径）
    const r2Path = existingImage.r2Path.substring(0, existingImage.r2Path.lastIndexOf('/')) + '/' + newFileName
    const r2Url = existingImage.r2Url.substring(0, existingImage.r2Url.lastIndexOf('/')) + '/' + newFileName

    try {
      const result = await uploadBufferToR2(buffer, r2Path.substring(r2Path.lastIndexOf('/') + 1), file.type)

      // 更新数据库
      const updatedImage = await prisma.articleImage.update({
        where: { id: imageId },
        data: {
          name: newFileName,
          r2Path: result.r2Path,
          r2Url: result.r2Url,
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
              content: true,
            },
          },
        },
      })

      // 更新文章内容中的图片URL
      const articleContent = updatedImage.article.content || ''
      const oldImagePattern = new RegExp(
        `!\\[([^\\]]*)\\]\\(${existingImage.r2Url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'g'
      )

      let updatedArticle = null
      if (oldImagePattern.test(articleContent)) {
        const newContent = articleContent.replace(
          oldImagePattern,
          `![${updatedImage.altText || 'image'}](${updatedImage.r2Url})`
        )

        updatedArticle = await prisma.article.update({
          where: { id: updatedImage.articleId },
          data: { content: newContent },
        })

        console.log(`[图片替换] 已更新文章内容中的图片URL: ${updatedImage.article.title}`)
      }

      return NextResponse.json({
        success: true,
        data: updatedImage,
        articleUpdated: updatedArticle !== null,
        message: 'Image replaced successfully',
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
