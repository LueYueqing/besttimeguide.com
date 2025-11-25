import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE - 删除 API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
    const apiKeyId = parseInt(id, 10)
    
    if (isNaN(userId) || isNaN(apiKeyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      )
    }

    // 检查 API key 是否属于当前用户
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId: userId,
      },
    })

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      )
    }

    // 删除 API key
    await prisma.apiKey.delete({
      where: { id: apiKeyId },
    })

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - 更新 API key（激活/停用、更新名称）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
    const apiKeyId = parseInt(id, 10)
    
    if (isNaN(userId) || isNaN(apiKeyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, isActive } = body

    // 检查 API key 是否属于当前用户
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId: userId,
      },
    })

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      )
    }

    // 更新 API key
    const updateData: any = {}
    if (name !== undefined && typeof name === 'string' && name.trim().length > 0) {
      updateData.name = name.trim()
    }
    if (isActive !== undefined && typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedApiKey = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: updateData,
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedApiKey,
    })
  } catch (error: any) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

