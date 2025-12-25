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

// 五大核心分类数据
const categories = [
  {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    description: 'Best time to visit destinations worldwide',
    color: 'from-blue-500 to-blue-600',
    href: '/travel',
    count: '200+',
    popular: [
      { name: 'Japan', href: '/best-time-to-visit-japan', searchVolume: '90.5K' },
      { name: 'Hawaii', href: '/best-time-to-visit-hawaii', searchVolume: '22.2K' },
      { name: 'Iceland', href: '/best-time-to-visit-iceland', searchVolume: '14.8K' },
      { name: 'Thailand', href: '/best-time-to-visit-thailand', searchVolume: '12.1K' },
    ],
  },
  {
    id: 'social-media',
    name: 'Social Media',
    icon: '📱',
    description: 'Optimal posting times for maximum engagement',
    color: 'from-purple-500 to-purple-600',
    href: '/social-media',
    count: '80+',
    popular: [
      { name: 'Instagram', href: '/best-time-to-post-on-instagram', searchVolume: '60.5K' },
      { name: 'TikTok', href: '/best-time-to-post-on-tiktok', searchVolume: '60.5K' },
      { name: 'Facebook', href: '/best-time-to-post-on-facebook', searchVolume: '6.6K' },
      { name: 'LinkedIn', href: '/best-time-to-post-on-linkedin', searchVolume: '4.4K' },
    ],
  },
  {
    id: 'health',
    name: 'Health',
    icon: '💊',
    description: 'Best time to take supplements and medications',
    color: 'from-green-500 to-green-600',
    href: '/health',
    count: '100+',
    popular: [
      { name: 'Creatine', href: '/best-time-to-take-creatine', searchVolume: '12.1K' },
      { name: 'Vitamin D', href: '/best-time-to-take-vitamin-d', searchVolume: '8.1K' },
      { name: 'Magnesium', href: '/best-time-to-take-magnesium', searchVolume: '8.1K' },
      { name: 'Probiotics', href: '/best-time-to-take-probiotics', searchVolume: '6.6K' },
    ],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛒',
    description: 'Best time to buy products and save money',
    color: 'from-orange-500 to-orange-600',
    href: '/shopping',
    count: '50+',
    popular: [
      { name: 'Buy a Car', href: '/best-time-to-buy-a-car', searchVolume: '12.1K' },
      { name: 'Buy Plane Tickets', href: '/best-time-to-buy-plane-tickets', searchVolume: '9.9K' },
      { name: 'Buy a Mattress', href: '/best-time-to-buy-a-mattress', searchVolume: '4.4K' },
      { name: 'Buy a House', href: '/best-time-to-buy-a-house', searchVolume: '2.4K' },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: '🌱',
    description: 'Best time for daily activities and routines',
    color: 'from-teal-500 to-teal-600',
    href: '/lifestyle',
    count: '70+',
    popular: [
      { name: 'Exercise', href: '/best-time-to-exercise', searchVolume: '4.4K' },
      { name: 'Water Grass', href: '/best-time-to-water-grass', searchVolume: '6.6K' },
      { name: 'Get Flu Shot', href: '/best-time-to-get-flu-shot', searchVolume: '3.6K' },
      { name: 'Plant Grass Seed', href: '/best-time-to-plant-grass-seed', searchVolume: '4.4K' },
    ],
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Find the Best Time for
              <span className="block text-accent-400">Everything</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Expert guides on when to visit places, post on social media, take supplements, buy products, and more. Data-driven insights to help you make better decisions.
            </p>
            
            {/* Search Box */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search for best time to..."
                  className="w-full px-6 py-4 pl-14 text-neutral-900 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-accent-400 shadow-lg"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm md:text-base">
              <div>
                <div className="text-2xl md:text-3xl font-bold">500+</div>
                <div className="text-primary-200">Expert Guides</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">1.5M+</div>
                <div className="text-primary-200">Monthly Searches</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">100%</div>
                <div className="text-primary-200">Data-Driven</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Find expert guides organized by topic. Everything you need to know about timing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="group relative bg-white border-2 border-neutral-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary-600">
                    {category.count} Guides
                  </span>
                  <svg
                    className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Popular Guides
            </h2>
            <p className="text-lg text-neutral-600">
              Most searched guides based on real search data
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {categories.map((category) => (
              <div key={category.id} className="mb-12 last:mb-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-xl`}>
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">{category.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.popular.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group bg-white border border-neutral-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-lg transition-all"
                    >
                      <div className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {item.searchVolume} searches/month
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              Why Trust BestTimeGuide?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Data-Driven</h3>
                <p className="text-neutral-600 text-sm">
                  All recommendations based on real search data, weather patterns, and expert analysis
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Expert Guides</h3>
                <p className="text-neutral-600 text-sm">
                  Comprehensive guides written by travel and lifestyle experts
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Always Updated</h3>
                <p className="text-neutral-600 text-sm">
                  Content regularly updated to reflect latest trends and data
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="full" />
    </div>
  )
}
