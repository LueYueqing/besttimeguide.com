import { Metadata } from 'next'
import CancelSubscriptionClient from './cancel-subscription-client'

export const metadata: Metadata = {
  title: 'Cancel Subscription | CustomQR.pro',
  description: 'Cancel your CustomQR.pro subscription',
}

export default function CancelSubscriptionPage() {
  return <CancelSubscriptionClient />
}

