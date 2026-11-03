import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Compare BestTimeGuide plans and choose the right access level for timing guides, research tools, and premium insights.',
  alternates: {
    canonical: '/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
