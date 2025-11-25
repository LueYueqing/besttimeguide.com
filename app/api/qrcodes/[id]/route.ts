import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { generateQRPreview, deleteQRPreview } from '@/lib/qr-preview-generator'

const prisma = new PrismaClient()

// GET - 获取单个QR码详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const qrCodeId = parseInt(id, 10)

    if (isNaN(qrCodeId)) {
      return NextResponse.json({ success: false, error: 'Invalid QR code ID' }, { status: 400 })
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // 获取QR码（确保是用户自己的）
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: qrCodeId,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            analytics: true,
          },
        },
      },
    })

    if (!qrCode) {
      return NextResponse.json({ success: false, error: 'QR code not found' }, { status: 404 })
    }

    // 构建短链接URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://customqr.pro'
    const shortUrl = qrCode.shortCode ? `${baseUrl}/r/${qrCode.shortCode}` : null

    // 从 content JSON 中提取 frameTemplateId
    const content = qrCode.content as any
    const frameTemplateId = content?.frameTemplateId || null

    return NextResponse.json({
      success: true,
      data: {
        id: qrCode.id,
        title: qrCode.title,
        description: qrCode.description,
        type: qrCode.type,
        content: qrCode.content,
        design: qrCode.design,
        targetUrl: qrCode.targetUrl,
        shortCode: qrCode.shortCode,
        shortUrl,
        lastScanAt: qrCode.lastScanAt,
        isDynamic: qrCode.isDynamic,
        isActive: qrCode.isActive,
        scanCount: qrCode.scanCount,
        createdAt: qrCode.createdAt,
        updatedAt: qrCode.updatedAt,
        analyticsCount: qrCode._count.analytics,
        frameTemplateId,
      },
    })
  } catch (error) {
    console.error('Error fetching QR code:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - 更新QR码
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const qrCodeId = parseInt(id, 10)

    if (isNaN(qrCodeId)) {
      return NextResponse.json({ success: false, error: 'Invalid QR code ID' }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, targetUrl, isActive, frameTemplateId } = body

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // 检查QR码是否存在且属于该用户
    const existingQR = await prisma.qRCode.findFirst({
      where: {
        id: qrCodeId,
        userId: user.id,
      },
    })

    if (!existingQR) {
      return NextResponse.json({ success: false, error: 'QR code not found' }, { status: 404 })
    }

    // 如果是动态QR码，验证targetUrl
    if (existingQR.isDynamic && targetUrl) {
      try {
        const parsed = new URL(targetUrl)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return NextResponse.json(
            { success: false, error: 'Please enter a valid URL that starts with http:// or https://.' },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid URL that starts with http:// or https://.' },
          { status: 400 }
        )
      }
    }

    // 更新QR码
    const updateData: any = {}
    if (title !== undefined) updateData.title = title?.trim() || null
    if (description !== undefined) updateData.description = description?.trim() || null
    if (isActive !== undefined) updateData.isActive = isActive

    // 如果是动态QR码，更新targetUrl和content
    if (existingQR.isDynamic && targetUrl !== undefined) {
      updateData.targetUrl = targetUrl
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://customqr.pro'
      const shortUrl = existingQR.shortCode ? `${baseUrl}/r/${existingQR.shortCode}` : null
      // 更新 frameTemplateId（如果提供了）
      const existingContent = existingQR.content as any
      updateData.content = {
        url: targetUrl,
        shortUrl,
        frameTemplateId: frameTemplateId !== undefined ? (frameTemplateId || null) : (existingContent?.frameTemplateId || null),
      }
    } else if (frameTemplateId !== undefined) {
      // 即使不是动态QR码，也允许更新框架（如果提供了）
      const existingContent = existingQR.content as any
      updateData.content = {
        ...existingContent,
        frameTemplateId: frameTemplateId || null,
      }
    }

    const qrCode = await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: updateData,
    })

    // 构建返回数据
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://customqr.pro'
    const shortUrl = qrCode.shortCode ? `${baseUrl}/r/${qrCode.shortCode}` : null

    // 如果 targetUrl 或 frameTemplateId 改变了，重新生成预览图
    const needsPreviewUpdate = 
      (existingQR.isDynamic && targetUrl !== undefined) || 
      frameTemplateId !== undefined

    if (needsPreviewUpdate && shortUrl) {
      const content = qrCode.content as any
      const currentFrameTemplateId = content?.frameTemplateId || null
      
      // 生成预览图（异步，不阻塞响应）
      generateQRPreview(qrCode.id, shortUrl, currentFrameTemplateId).catch((error) => {
        console.error(`Failed to generate preview for QR ${qrCode.id}:`, error)
        // 预览图生成失败不影响更新流程
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: qrCode.id,
        title: qrCode.title,
        description: qrCode.description,
        targetUrl: qrCode.targetUrl,
        shortUrl,
        shortCode: qrCode.shortCode,
        isActive: qrCode.isActive,
        updatedAt: qrCode.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error updating QR code:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - 删除QR码
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const qrCodeId = parseInt(id, 10)

    if (isNaN(qrCodeId)) {
      return NextResponse.json({ success: false, error: 'Invalid QR code ID' }, { status: 400 })
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // 检查QR码是否存在且属于该用户
    const existingQR = await prisma.qRCode.findFirst({
      where: {
        id: qrCodeId,
        userId: user.id,
      },
    })

    if (!existingQR) {
      return NextResponse.json({ success: false, error: 'QR code not found' }, { status: 404 })
    }

    // 删除QR码（会级联删除analytics）
    await prisma.qRCode.delete({
      where: { id: qrCodeId },
    })

    // 删除预览图（异步，不阻塞响应）
    deleteQRPreview(qrCodeId).catch((error) => {
      console.error(`Failed to delete preview for QR ${qrCodeId}:`, error)
      // 预览图删除失败不影响删除流程
    })

    return NextResponse.json({ success: true, message: 'QR code deleted successfully' })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

