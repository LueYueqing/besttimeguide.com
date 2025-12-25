import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import ProfileClient from './profile-client'

export const metadata: Metadata = {
  title: 'Profile | besttimeguide.com',
  description: 'Review and manage your besttimeguide.com account details, subscription status, and security settings.',
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/profile')
  }

  return <ProfileClient />
}

