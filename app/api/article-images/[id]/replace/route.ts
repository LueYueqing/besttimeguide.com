import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { uploadBufferToR2, purgeCDNCache } from '@/lib/r2'
import sharp from 'sharp'

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
    const shouldResize = formData.get('shouldResize') === 'true' // 是否需要缩放

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
    let arrayBuffer = await file.arrayBuffer()
    let buffer = Buffer.from(arrayBuffer)

    // 检查是否需要缩放（文件超过1MB且用户选择了缩放）
    const ONE_MB = 1 * 1024 * 1024
    let resizeInfo = ''

    if (shouldResize && file.size > ONE_MB) {
      console.log(`[图片缩放] 原始大小: ${(file.size / 1024 / 1024).toFixed(2)}MB，开始缩放...`)

      try {
        // 使用sharp进行图片缩放
        const resizedBuffer = await sharp(buffer)
          .resize(800, 600, {
            fit: 'inside', // 保持宽高比，不超过指定尺寸
            withoutEnlargement: true, // 如果图片比目标尺寸小，不放大
          })
          .toBuffer() as Buffer

        const originalSize = buffer.length
        const newSize = resizedBuffer.length
        const savedPercentage = ((originalSize - newSize) / originalSize * 100).toFixed(1)

        buffer = Buffer.from(resizedBuffer)
        resizeInfo = `图片已从 ${(originalSize / 1024 / 1024).toFixed(2)}MB 缩小到 ${(newSize / 1024 / 1024).toFixed(2)}MB，节省了 ${savedPercentage}% 的空间`

        console.log(`[图片缩放] ${resizeInfo}`)
      } catch (resizeError: any) {
        console.error('[图片缩放] 缩放失败，使用原图:', resizeError)
        resizeInfo = '缩放失败，使用原图'
      }
    }

    try {
      // 提取原文件名（用于上传时指定文件名）
      const fileName = existingImage.name
      
      // 如果 r2Path 为 NULL 或空，从 r2Url 中提取路径
      let r2Path = existingImage.r2Path
      if (!r2Path && existingImage.r2Url) {
        try {
          const url = new URL(existingImage.r2Url)
          // 移除开头的 / 和可能的域名
          r2Path = url.pathname.replace(/^\//, '')
          console.log(`[图片替换] 从 URL 提取 r2Path: ${r2Path}`)
        } catch (error) {
          console.error('[图片替换] 从 URL 提取 r2Path 失败:', error)
        }
      }
      
      // 上传到R2，使用原路径（直接覆盖原文件）
      const result = await uploadBufferToR2(
        buffer,
        fileName,
        file.type,
        undefined,
        r2Path, // 使用原R2路径（如果 r2Path 为空，则从 r2Url 提取）
        true // 标记为替换操作
      )

      console.log(`[图片替换] 已覆盖R2文件: ${existingImage.r2Path}`)

      // 清除CDN缓存
      const purgeSuccess = await purgeCDNCache([existingImage.r2Url])
      if (purgeSuccess) {
        console.log(`[图片替换] 已清除CDN缓存: ${existingImage.r2Url}`)
      } else {
        console.log(`[图片替换] 清除CDN缓存失败或未配置，使用短缓存策略`)
      }

      // 更新数据库（只更新大小、尺寸，不改变URL）
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

      console.log(`[图片替换] 已更新数据库记录，URL保持不变`)

      return NextResponse.json({
        success: true,
        data: updatedImage,
        message: resizeInfo || 'Image replaced successfully',
        resizeInfo: resizeInfo || null,
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
