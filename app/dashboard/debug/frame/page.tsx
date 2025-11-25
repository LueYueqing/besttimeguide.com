import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import FrameDebugClient from './frame-debug-client'

export default async function FrameDebugPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/debug/frame')
  }

  // 只在开发环境中允许访问
  if (process.env.NODE_ENV === 'production') {
    redirect('/dashboard')
  }

  return <FrameDebugClient />
}

