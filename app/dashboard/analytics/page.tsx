import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { hasAnalyticsAccess } from '@/lib/subscription'
import AnalyticsClient from './analytics-client'

export const metadata: Metadata = {
  title: 'Analytics Dashboard | CustomQR.pro',
  description: 'View detailed analytics and statistics for your QR codes',
}

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/analytics')
  }

  // 转换 userId 为数字
  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) {
    redirect('/auth/signin?callbackUrl=/dashboard/analytics')
  }

  // 检查用户是否有权限访问 Analytics
  const hasAccess = await hasAnalyticsAccess(userId)
  if (!hasAccess) {
    redirect('/pricing?feature=analytics')
  }

  return <AnalyticsClient />
}


