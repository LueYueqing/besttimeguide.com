import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'Sorry, the page you are looking for could not be found. Return to homepage or explore our help center.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* 404 Content */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* 大号404 */}
            <div className="mb-8">
              <div className="text-8xl lg:text-9xl font-black text-gradient mb-4 leading-none">
                404
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
                <div className="text-4xl">🔍</div>
                <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
              </div>
            </div>

            {/* 错误信息 */}
            <div className="mb-12">
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                Oops! Page Not Found
              </h1>
              <p className="text-lg lg:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed">
                The page you're looking for seems to have vanished into the digital ether.
                Don't worry though – let's get you back on track to finding the best time for everything!
              </p>
            </div>

            {/* 快速操作 */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
              <div className="card p-8 text-center card-hover">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  🏠
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Go Home</h3>
                <p className="text-neutral-700 mb-6">
                  Return to our homepage and discover the best time for everything
                </p>
                <Link href="/" className="btn btn-primary w-full">
                  <span>🚀</span>
                  Back to Home
                </Link>
              </div>

              <div className="card p-8 text-center card-hover">
                <div className="w-16 h-16 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  🔍
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Browse Guides</h3>
                <p className="text-neutral-700 mb-6">
                  Explore our expert guides on travel, social media, health, and more
                </p>
                <Link href="/category/travel" className="btn btn-accent w-full">
                  <span>⚡</span>
                  Browse Guides
                </Link>
              </div>
            </div>

            {/* 热门页面链接 */}
            <div className="card p-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Popular Pages</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/pricing" className="p-4 rounded-xl bg-neutral-50 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 font-medium">
                  💎 Pricing Plans
                </Link>
                <Link href="/help/faq" className="p-4 rounded-xl bg-neutral-50 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 font-medium">
                  ❓ FAQ
                </Link>
                <Link href="/help/contact" className="p-4 rounded-xl bg-neutral-50 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 font-medium">
                  📞 Contact Us
                </Link>
                <Link href="/about" className="p-4 rounded-xl bg-neutral-50 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 font-medium">
                  🌟 About Us
                </Link>
              </div>
            </div>

            {/* 搜索建议 */}
            <div className="mt-12 p-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl max-w-2xl mx-auto">
              <h4 className="font-bold text-lg text-neutral-900 mb-3">
                Looking for something specific?
              </h4>
              <p className="text-neutral-700 mb-4">
                Here are some things you might want to try:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <Link href="/category/travel" className="px-3 py-1 bg-white rounded-full text-neutral-700 hover:text-wikihow-linkHover transition-colors">Travel Guides</Link>
                <Link href="/category/social-media" className="px-3 py-1 bg-white rounded-full text-neutral-700 hover:text-wikihow-linkHover transition-colors">Social Media</Link>
                <Link href="/category/health" className="px-3 py-1 bg-white rounded-full text-neutral-700 hover:text-wikihow-linkHover transition-colors">Health</Link>
                <Link href="/category/shopping" className="px-3 py-1 bg-white rounded-full text-neutral-700 hover:text-wikihow-linkHover transition-colors">Shopping</Link>
                <Link href="/category/lifestyle" className="px-3 py-1 bg-white rounded-full text-neutral-700 hover:text-wikihow-linkHover transition-colors">Lifestyle</Link>
              </div>
            </div>

            {/* 幽默元素 */}
            <div className="mt-12 text-center">
              <p className="text-neutral-600 italic">
                "Even our 404 page knows the best time to show up!" 😄
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 紧急联系 */}
      <section className="section bg-gradient-primary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Still Can't Find What You Need?
            </h3>
            <p className="text-lg text-neutral-700 mb-8">
              Our support team is here to help! Reach out to us and we'll get you sorted in no time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/help/contact" className="btn btn-primary btn-lg">
                <span>💬</span>
                Contact Support
              </Link>
              <Link href="/help/faq" className="btn btn-secondary btn-lg">
                <span>📚</span>
                Browse FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - 与首页一致 */}
      <Footer variant="full" />
    </div>
  )
}
