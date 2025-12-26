import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import DashboardClient from './dashboard-client'

export const metadata: Metadata = {
  title: 'Dashboard | besttimeguide.com',
  description: 'Manage your account and content.',
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  return <DashboardClient />
}

