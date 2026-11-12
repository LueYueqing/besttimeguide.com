import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Trending Timing Guides',
  description:
    'See the most searched best-time guides on BestTimeGuide — travel, social media, health, and shopping.',
  alternates: {
    canonical: 'https://besttimeguide.com/trending',
  },
}

const trendingGuides = [
  { title: 'Best Time to Visit Japan', href: '/best-time-to-visit-japan', category: 'Travel', searchVolume: '90.5K' },
  { title: 'Best Time to Post on Instagram', href: '/best-time-to-post-on-instagram', category: 'Social Media', searchVolume: '60.5K' },
  { title: 'Best Time to Post on TikTok', href: '/best-time-to-post-on-tiktok', category: 'Social Media', searchVolume: '40.5K' },
  { title: 'Best Time to Visit Hawaii', href: '/best-time-to-visit-hawaii', category: 'Travel', searchVolume: '22.2K' },
  { title: 'Best Time to Take Creatine', href: '/best-time-to-take-creatine', category: 'Health', searchVolume: '12.1K' },
  { title: 'Best Time to Buy a Car', href: '/best-time-to-buy-a-car', category: 'Shopping', searchVolume: '12.1K' },
  { title: 'Best Time to Visit Iceland', href: '/best-time-to-visit-iceland', category: 'Travel', searchVolume: '14.8K' },
  { title: 'Best Time to Visit Thailand', href: '/best-time-to-visit-thailand', category: 'Travel', searchVolume: '9.9K' },
  { title: 'Best Time to Buy Plane Tickets', href: '/best-time-to-buy-plane-tickets', category: 'Shopping', searchVolume: '9.9K' },
  { title: 'Best Time to Visit Italy', href: '/best-time-to-visit-italy', category: 'Travel', searchVolume: '9.9K' },
  { title: 'Best Time to Take Vitamin D', href: '/best-time-to-take-vitamin-d', category: 'Health', searchVolume: '8.1K' },
  { title: 'Best Time to Water Grass', href: '/best-time-to-water-grass', category: 'Lifestyle', searchVolume: '4.4K' },
]

export default function TrendingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <nav className="mb-6 text-sm text-neutral-600">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-2">›</span>
          <span className="text-neutral-900">Trending</span>
        </nav>

        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Trending Timing Guides</h1>
        <p className="text-lg text-neutral-600 mb-10 max-w-3xl">
          High-interest guides based on search demand across travel, social media, health, shopping, and lifestyle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingGuides.map((guide, index) => (
            <Link key={guide.href} href={guide.href} className="group wikihow-list-item">
              <div className="wikihow-list-item-number">{index + 1}</div>
              <div className="wikihow-list-item-content">
                <h2 className="wikihow-list-item-title text-lg font-semibold group-hover:text-primary-600">
                  {guide.title}
                </h2>
                <div className="wikihow-list-item-meta">
                  <span className="wikihow-badge">{guide.category}</span>
                  <span className="ml-2 text-sm text-neutral-500">{guide.searchVolume}/mo</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/category/travel" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse Travel →
          </Link>
          <Link href="/category/social-media" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse Social Media →
          </Link>
          <Link href="/category/health" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse Health →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
