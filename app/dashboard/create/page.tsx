import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CreateDynamicQRClient from './create-client'

export const metadata = {
  title: 'Create Dynamic QR Code | CustomQR.pro',
  description: 'Create editable, trackable dynamic URL QR codes from your dashboard.',
}

export default async function CreateDynamicQRPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/create')
  }

  return <CreateDynamicQRClient />
}

