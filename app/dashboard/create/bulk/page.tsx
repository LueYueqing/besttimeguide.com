import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import BulkCreateClient from './bulk-client'

export const metadata: Metadata = {
  title: 'Bulk Create QR Codes | CustomQR.pro',
  description: 'Create multiple dynamic QR codes at once from CSV file',
}

export default async function BulkCreatePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/create/bulk')
  }

  return <BulkCreateClient />
}

