import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import EditQRCodeClient from './edit-client'

const prisma = new PrismaClient()

export const metadata: Metadata = {
  title: 'Edit QR Code | CustomQR.pro',
  description: 'Edit your dynamic QR code settings and destination URL',
}

export default async function EditQRCodePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  // 转换 userId 为数字
  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  // 解析二维码 ID
  const { id } = await params
  const qrCodeId = parseInt(id, 10)
  if (isNaN(qrCodeId)) {
    notFound()
  }

  // 获取用户
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  // 验证二维码是否属于当前用户
  const qrCode = await prisma.qRCode.findFirst({
    where: {
      id: qrCodeId,
      userId: user.id,
    },
  })

  if (!qrCode) {
    // 二维码不存在或不属于当前用户，返回 404
    notFound()
  }

  return <EditQRCodeClient qrCodeId={id} />
}

