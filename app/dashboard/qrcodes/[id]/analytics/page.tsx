import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { hasAnalyticsAccess } from '@/lib/subscription'
import QRAnalyticsClient from './analytics-client'

export const metadata: Metadata = {
  title: 'QR Code Analytics | CustomQR.pro',
  description: 'View detailed analytics and statistics for your QR code',
}

export default async function QRAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  // 转换 userId 为数字
  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  // 检查用户是否有权限访问 Analytics
  const hasAccess = await hasAnalyticsAccess(userId)
  if (!hasAccess) {
    redirect('/pricing?feature=analytics')
  }

  // Next.js 15: params 需要先 await
  const { id } = await params
  return <QRAnalyticsClient qrCodeId={id} />
}

