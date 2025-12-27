import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { AiTriggerWrapper } from '@/components/AiTriggerWrapper'
import { getPostsByCategory } from '@/lib/blog'
import { 
  getBestPostsForCurrentSeason, 
  getBestPostsForCurrentMonth, 
  getBestPostsForCurrentWeek,
  getCurrentTimeInfo 
} from '@/lib/time-based-posts'

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

export default async function HomePage() {
  // 从数据库获取各分类的文章
  const [travelPosts, socialMediaPosts, healthPosts, seasonPosts, monthPosts, weekPosts] = await Promise.all([
    getPostsByCategory('travel').then((posts) => posts.slice(0, 4)),
    getPostsByCategory('social-media').then((posts) => posts.slice(0, 4)),
    getPostsByCategory('health').then((posts) => posts.slice(0, 4)),
    getBestPostsForCurrentSeason(4),
    getBestPostsForCurrentMonth(4),
    getBestPostsForCurrentWeek(4),
  ])
  
  // 获取当前时间信息
  const timeInfo = getCurrentTimeInfo()
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
          <form action="/search" method="get" className="wikihow-search-box">
            <input
              type="search"
              name="q"
              placeholder="Search for best time to..."
              className="wikihow-search-input"
              required
            />
            <button type="submit" className="wikihow-search-icon cursor-pointer">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
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

        {/* Time-Based Best Guides Section */}
        <section className="mb-12">
          <h2 className="wikihow-heading wikihow-heading-h2 mb-6">Best Time for Right Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Season Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="wikihow-heading wikihow-heading-h3 text-green-800">
                  Best for {timeInfo.seasonName}
                </h3>
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              {seasonPosts.length > 0 ? (
                <div className="space-y-3">
                  {seasonPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/${post.slug}`}
                      className="block bg-white rounded-lg p-3 hover:shadow-md hover:border-green-400 border border-transparent transition-all"
                    >
                      <h4 className="wikihow-link-standard font-semibold text-sm line-clamp-2 group-hover:text-green-700">
                        {post.title}
                      </h4>
                      <p className="wikihow-text-small text-neutral-600 mt-1 line-clamp-2">
                        {post.description}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="wikihow-text-small text-neutral-600 italic">
                  No {timeInfo.seasonName} recommendations yet
                </p>
              )}
            </div>

            {/* Month Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="wikihow-heading wikihow-heading-h3 text-blue-800">
                  Best for {timeInfo.monthName}
                </h3>
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {monthPosts.length > 0 ? (
                <div className="space-y-3">
                  {monthPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/${post.slug}`}
                      className="block bg-white rounded-lg p-3 hover:shadow-md hover:border-blue-400 border border-transparent transition-all"
                    >
                      <h4 className="wikihow-link-standard font-semibold text-sm line-clamp-2 group-hover:text-blue-700">
                        {post.title}
                      </h4>
                      <p className="wikihow-text-small text-neutral-600 mt-1 line-clamp-2">
                        {post.description}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="wikihow-text-small text-neutral-600 italic">
                  No {timeInfo.monthName} recommendations yet
                </p>
              )}
            </div>

            {/* Week Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="wikihow-heading wikihow-heading-h3 text-purple-800">
                  Best for This Week
                </h3>
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {weekPosts.length > 0 ? (
                <div className="space-y-3">
                  {weekPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/${post.slug}`}
                      className="block bg-white rounded-lg p-3 hover:shadow-md hover:border-purple-400 border border-transparent transition-all"
                    >
                      <h4 className="wikihow-link-standard font-semibold text-sm line-clamp-2 group-hover:text-purple-700">
                        {post.title}
                      </h4>
                      <p className="wikihow-text-small text-neutral-600 mt-1 line-clamp-2">
                        {post.description}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="wikihow-text-small text-neutral-600 italic">
                  No weekly recommendations yet
                </p>
              )}
            </div>
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
                {travelPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${post.slug}`}
                    className="group bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md hover:border-wikihow-green-400 transition-all"
                  >
                    <div className="w-full h-48 bg-neutral-100 overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                          <div className="text-neutral-400 text-center px-4">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs">Cover image coming soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="wikihow-heading wikihow-heading-h3 mb-2 wikihow-link-standard group-hover:text-wikihow-linkHover transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="wikihow-text wikihow-text-small line-clamp-2">
                          {post.description}
                        </p>
                      )}
                    </div>
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
                {socialMediaPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${post.slug}`}
                    className="group bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md hover:border-wikihow-green-400 transition-all"
                  >
                    <div className="w-full h-48 bg-neutral-100 overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                          <div className="text-neutral-400 text-center px-4">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs">Cover image coming soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="wikihow-heading wikihow-heading-h3 mb-2 wikihow-link-standard group-hover:text-wikihow-linkHover transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="wikihow-text wikihow-text-small line-clamp-2">
                          {post.description}
                        </p>
                      )}
                    </div>
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
                {healthPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${post.slug}`}
                    className="group bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md hover:border-wikihow-green-400 transition-all"
                  >
                    <div className="w-full h-48 bg-neutral-100 overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                          <div className="text-neutral-400 text-center px-4">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs">Cover image coming soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="wikihow-heading wikihow-heading-h3 mb-2 wikihow-link-standard group-hover:text-wikihow-linkHover transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="wikihow-text wikihow-text-small line-clamp-2">
                          {post.description}
                        </p>
                      )}
                    </div>
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

      {/* AI 改写触发器 - 只在2026年3月1日前管理员访问时触发 */}
      <AiTriggerWrapper />
      
      <Footer variant="full" />
    </div>
  )
}
