import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'BestTimeGuide - Find the Best Time for Everything',
  description: 'Discover the best time to visit places, post on social media, take supplements, buy products, and more. Expert guides with data-driven insights.',
  keywords: [
    'best time to visit',
    'best time to post on instagram',
    'best time to post on tiktok',
    'best time to travel',
    'when is the best time',
    'travel guide',
    'social media timing',
    'health supplements timing'
  ],
  openGraph: {
    title: 'BestTimeGuide - Find the Best Time for Everything',
    description: 'Expert guides on the best time to visit places, post on social media, take supplements, and more.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BestTimeGuide - Find the Best Time for Everything',
      },
    ],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Trending guides (most popular)
const trendingGuides = [
  { title: 'Best Time to Visit Japan', href: '/best-time-to-visit-japan', category: 'Travel', searchVolume: '90.5K' },
  { title: 'Best Time to Post on Instagram', href: '/best-time-to-post-on-instagram', category: 'Social Media', searchVolume: '60.5K' },
  { title: 'Best Time to Post on TikTok', href: '/best-time-to-post-on-tiktok', category: 'Social Media', searchVolume: '60.5K' },
  { title: 'Best Time to Visit Hawaii', href: '/best-time-to-visit-hawaii', category: 'Travel', searchVolume: '22.2K' },
  { title: 'Best Time to Take Creatine', href: '/best-time-to-take-creatine', category: 'Health', searchVolume: '12.1K' },
  { title: 'Best Time to Buy a Car', href: '/best-time-to-buy-a-car', category: 'Shopping', searchVolume: '12.1K' },
  { title: 'Best Time to Visit Iceland', href: '/best-time-to-visit-iceland', category: 'Travel', searchVolume: '14.8K' },
  { title: 'Best Time to Visit Thailand', href: '/best-time-to-visit-thailand', category: 'Travel', searchVolume: '12.1K' },
  { title: 'Best Time to Exercise', href: '/best-time-to-exercise', category: 'Lifestyle', searchVolume: '4.4K' },
  { title: 'Best Time to Buy Plane Tickets', href: '/best-time-to-buy-plane-tickets', category: 'Shopping', searchVolume: '9.9K' },
  { title: 'Best Time to Visit Italy', href: '/best-time-to-visit-italy', category: 'Travel', searchVolume: '9.9K' },
  { title: 'Best Time to Take Vitamin D', href: '/best-time-to-take-vitamin-d', category: 'Health', searchVolume: '8.1K' },
]

// Categories for Browse By Category section
const browseCategories = [
  { name: 'Travel', href: '/category/travel', count: '200+' },
  { name: 'Social Media', href: '/category/social-media', count: '80+' },
  { name: 'Health', href: '/category/health', count: '100+' },
  { name: 'Shopping', href: '/category/shopping', count: '50+' },
  { name: 'Lifestyle', href: '/category/lifestyle', count: '70+' },
]

// Featured guides by category
const featuredByCategory = {
  travel: [
    { title: 'Best Time to Visit Japan', href: '/best-time-to-visit-japan' },
    { title: 'Best Time to Visit Hawaii', href: '/best-time-to-visit-hawaii' },
    { title: 'Best Time to Visit Iceland', href: '/best-time-to-visit-iceland' },
    { title: 'Best Time to Visit Thailand', href: '/best-time-to-visit-thailand' },
  ],
  socialMedia: [
    { title: 'Best Time to Post on Instagram', href: '/best-time-to-post-on-instagram' },
    { title: 'Best Time to Post on TikTok', href: '/best-time-to-post-on-tiktok' },
    { title: 'Best Time to Post on Facebook', href: '/best-time-to-post-on-facebook' },
    { title: 'Best Time to Post on LinkedIn', href: '/best-time-to-post-on-linkedin' },
  ],
  health: [
    { title: 'Best Time to Take Creatine', href: '/best-time-to-take-creatine' },
    { title: 'Best Time to Take Vitamin D', href: '/best-time-to-take-vitamin-d' },
    { title: 'Best Time to Take Magnesium', href: '/best-time-to-take-magnesium' },
    { title: 'Best Time to Take Probiotics', href: '/best-time-to-take-probiotics' },
  ],
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Main Content - wikiHow style */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section - wikiHow style */}
        <section className="text-center mb-12 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Welcome to BestTimeGuide, the most trusted timing guide site on the internet.
          </h1>
          <p className="wikihow-text-standard text-lg mb-8 max-w-3xl mx-auto">
            Discover the best time to visit places, post on social media, take supplements, buy products, and more. Expert guides with data-driven insights.
          </p>

          {/* Quick Stats */}
          <div className="wikihow-stats">
            <div className="wikihow-stat-item">
              <div className="wikihow-stat-number">500+</div>
              <div className="wikihow-stat-label">Expert Guides</div>
            </div>
            <div className="wikihow-stat-item">
              <div className="wikihow-stat-number">1.5M+</div>
              <div className="wikihow-stat-label">Monthly Searches</div>
            </div>
            <div className="wikihow-stat-item">
              <div className="wikihow-stat-number">100%</div>
              <div className="wikihow-stat-label">Data-Driven</div>
            </div>
          </div>

          {/* Search Box - wikiHow style */}
          <div className="wikihow-search-box">
            <input
              type="search"
              placeholder="Search for best time to..."
              className="wikihow-search-input"
            />
            <svg
              className="wikihow-search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </section>

        {/* Trending Now Section - wikiHow style */}
        <section className="mb-12">
          <div className="wikihow-heading-group">
            <h2 className="wikihow-heading wikihow-heading-h2">Trending Now</h2>
            <Link href="/trending" className="wikihow-link-standard wikihow-text-small">
              See more trending <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingGuides.slice(0, 6).map((guide, index) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group wikihow-list-item"
              >
                <div className="wikihow-list-item-number">{index + 1}</div>
                <div className="wikihow-list-item-content">
                  <h3 className="wikihow-list-item-title">
                    {guide.title}
                  </h3>
                  <div className="wikihow-list-item-meta">
                    <span className="wikihow-badge">{guide.category}</span>
                    <span className="ml-2">{guide.searchVolume}/mo</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Two Column Layout - wikiHow style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Browse By Category Section */}
            <section>
              <h2 className="wikihow-heading wikihow-heading-h2 mb-6">Browse By Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {browseCategories.map((category) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    className="group wikihow-card text-center hover:border-wikihow-green-400 transition-all border-2 border-wikihow-green-400"
                  >
                    <h3 className="wikihow-heading wikihow-heading-h3 mb-1 wikihow-link-standard group-hover:text-wikihow-linkHover transition-colors">
                      {category.name}
                    </h3>
                    <p className="wikihow-text-small">{category.count} guides</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured Travel Guides */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="wikihow-heading wikihow-heading-h2">Travel Guides</h2>
                <Link href="/category/travel" className="wikihow-link-standard font-semibold wikihow-text-small">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredByCategory.travel.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="group wikihow-card hover:border-wikihow-green-400 transition-all"
                  >
                    <h3 className="wikihow-heading wikihow-heading-h3 mb-2 wikihow-link-standard group-hover:text-wikihow-linkHover transition-colors">
                      {guide.title}
                    </h3>
                    <p className="wikihow-text wikihow-text-small">
                      Discover the best months, weather, prices, and crowds for your perfect trip.
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured Social Media Guides */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="wikihow-heading wikihow-heading-h2">Social Media Guides</h2>
                <Link href="/category/social-media" className="wikihow-link-standard font-semibold wikihow-text-small">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredByCategory.socialMedia.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="group wikihow-card hover:border-wikihow-green-400 transition-all"
                  >
                    <h3 className="wikihow-heading wikihow-heading-h3 mb-2 wikihow-link-standard group-hover:text-wikihow-linkHover transition-colors">
                      {guide.title}
                    </h3>
                    <p className="wikihow-text wikihow-text-small">
                      Learn the optimal posting times for maximum engagement and reach.
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured Health Guides */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="wikihow-heading wikihow-heading-h2">Health Guides</h2>
                <Link href="/category/health" className="wikihow-link-standard font-semibold wikihow-text-small">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredByCategory.health.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="group wikihow-card hover:border-wikihow-green-400 transition-all"
                  >
                    <h3 className="wikihow-heading wikihow-heading-h3 mb-2 wikihow-link-standard group-hover:text-wikihow-linkHover transition-colors">
                      {guide.title}
                    </h3>
                    <p className="wikihow-text wikihow-text-small">
                      Find the best time to take supplements for optimal effectiveness.
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - wikiHow style */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Trust Section - wikiHow style */}
            <div className="wikihow-sidebar-box">
              <h3 className="wikihow-sidebar-title">
                BestTimeGuide is an award-winning website where trusted research and expert knowledge come together.
              </h3>
              <p className="wikihow-text-standard mb-4">
                Since 2025, BestTimeGuide has helped millions of people find the best time for everything. We work with credentialed experts and data-driven research to create the most reliable timing guides on the Internet.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 wikihow-text-standard">
                  <span className="text-wikihow-linkHover font-bold">✓</span>
                  <span><strong>Authoritative</strong> - 500+ data-driven guides</span>
                </div>
                <div className="flex items-center gap-2 wikihow-text-standard">
                  <span className="text-wikihow-linkHover font-bold">✓</span>
                  <span><strong>Trustworthy</strong> - Expert-reviewed content</span>
                </div>
                <div className="flex items-center gap-2 wikihow-text-standard">
                  <span className="text-wikihow-linkHover font-bold">✓</span>
                  <span><strong>Comprehensive</strong> - Covering all timing needs</span>
                </div>
              </div>
            </div>

            {/* Quick Links - wikiHow style */}
            <div className="wikihow-sidebar-box">
              <h3 className="wikihow-sidebar-title">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/category/travel" className="wikihow-link-standard">
                    Travel Guides
                  </Link>
                </li>
                <li>
                  <Link href="/category/social-media" className="wikihow-link-standard">
                    Social Media Timing
                  </Link>
                </li>
                <li>
                  <Link href="/category/health" className="wikihow-link-standard">
                    Health & Supplements
                  </Link>
                </li>
                <li>
                  <Link href="/category/shopping" className="wikihow-link-standard">
                    Shopping Deals
                  </Link>
                </li>
                <li>
                  <Link href="/category/lifestyle" className="wikihow-link-standard">
                    Lifestyle Tips
                  </Link>
                </li>
              </ul>
            </div>

            {/* Popular Searches - wikiHow style */}
            <div className="wikihow-sidebar-box">
              <h3 className="wikihow-sidebar-title">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {trendingGuides.slice(0, 8).map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="px-3 py-1 bg-white border border-wikihow-green-200 rounded wikihow-text-small hover:border-wikihow-green-400 wikihow-link-standard transition-colors"
                  >
                    {guide.title.replace('Best Time to ', '')}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer variant="full" />
    </div>
  )
}
