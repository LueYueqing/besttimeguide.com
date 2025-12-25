import { Metadata } from 'next'
import CancelSubscriptionClient from './cancel-subscription-client'

export const metadata: Metadata = {
  title: 'Cancel Subscription | besttimeguide.com',
  description: 'Cancel your besttimeguide.com subscription',
}

export default function CancelSubscriptionPage() {
  return <CancelSubscriptionClient />
}

