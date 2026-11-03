import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact the BestTimeGuide team for support, feedback, partnerships, or questions about our timing guides.',
  alternates: {
    canonical: '/help/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
