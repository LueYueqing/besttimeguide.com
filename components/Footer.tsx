import Link from 'next/link'
import { getBuildTimeFormatted } from '@/lib/build-info'

interface FooterProps {
  variant?: 'full' | 'simple'
}

export default function Footer({ variant = 'simple' }: FooterProps) {
  if (variant === 'full') {
    return (
      <footer className="bg-neutral-900 text-white section">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* 品牌信息 */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">
                BestTime<span className="text-gradient">Guide</span>
              </h3>
              <p className="text-neutral-400 text-lg mb-6 max-w-md">
                Find the best time for everything. Expert guides on travel, social media, health, shopping, and lifestyle.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="text-white font-semibold">99.9% Uptime</div>
                  <div className="text-neutral-400">Reliable Service</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-semibold">24/7 Support</div>
                  <div className="text-neutral-400">Always Here to Help</div>
                </div>
              </div>
            </div>

            {/* 分类链接 */}
            <div>
              <h4 className="font-bold mb-4">Categories</h4>
              <div className="space-y-3 text-neutral-400">
                <Link href="/travel" className="block hover:text-primary-400 transition-colors">Travel</Link>
                <Link href="/social-media" className="block hover:text-primary-400 transition-colors">Social Media</Link>
                <Link href="/health" className="block hover:text-primary-400 transition-colors">Health</Link>
                <Link href="/shopping" className="block hover:text-primary-400 transition-colors">Shopping</Link>
                <Link href="/lifestyle" className="block hover:text-primary-400 transition-colors">Lifestyle</Link>
              </div>
            </div>

            {/* 支持链接 */}
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <div className="space-y-3 text-neutral-400">
                <Link href="/help/faq" className="block hover:text-primary-400 transition-colors">FAQ</Link>
                <Link href="/help/contact" className="block hover:text-primary-400 transition-colors">Contact Us</Link>
                <Link href="/tutorials" className="block hover:text-primary-400 transition-colors">Tutorials</Link>
                <Link href="/cancel-subscription" className="block hover:text-primary-400 transition-colors">Cancel Subscription</Link>
              </div>
            </div>
          </div>

          {/* 热门指南快速链接 */}
          <div className="border-t border-neutral-800 pt-8 mb-8">
            <h4 className="font-bold mb-4 text-center">Popular Guides</h4>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-400">
              <Link href="/best-time-to-visit-japan" className="hover:text-primary-400 transition-colors">Best Time to Visit Japan</Link>
              <Link href="/best-time-to-post-on-instagram" className="hover:text-primary-400 transition-colors">Best Time to Post on Instagram</Link>
              <Link href="/best-time-to-post-on-tiktok" className="hover:text-primary-400 transition-colors">Best Time to Post on TikTok</Link>
              <Link href="/best-time-to-visit-hawaii" className="hover:text-primary-400 transition-colors">Best Time to Visit Hawaii</Link>
              <Link href="/best-time-to-take-creatine" className="hover:text-primary-400 transition-colors">Best Time to Take Creatine</Link>
              <Link href="/best-time-to-buy-a-car" className="hover:text-primary-400 transition-colors">Best Time to Buy a Car</Link>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 pt-8 text-center">
            <div className="flex flex-wrap items-center justify-center gap-8 mb-4 text-sm text-neutral-400">
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-primary-400 transition-colors">Cookie Policy</Link>
              <Link href="/about" className="hover:text-primary-400 transition-colors">About Us</Link>
              <Link href="/tutorials" className="hover:text-primary-400 transition-colors">Tutorials</Link>
            </div>
            <p className="text-neutral-500">
              © 2025 BestTimeGuide.com. Find the Best Time for Everything
            </p>
            <p className="text-neutral-600 text-xs mt-2 opacity-50">
              Build: {getBuildTimeFormatted()}
            </p>
          </div>
        </div>
      </footer>
    )
  }

  // Simple footer for most pages
  return (
    <footer className="bg-neutral-900 text-white section">
      <div className="container">
        <div className="text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">
              BestTime<span className="text-gradient">Guide</span>
            </h3>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Find the best time for everything. Expert guides with data-driven insights.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8 text-neutral-300">
            <Link href="/" className="hover:text-primary-400 transition-colors">Home</Link>
            <Link href="/travel" className="hover:text-primary-400 transition-colors">Travel</Link>
            <Link href="/social-media" className="hover:text-primary-400 transition-colors">Social Media</Link>
            <Link href="/health" className="hover:text-primary-400 transition-colors">Health</Link>
            <Link href="/help/faq" className="hover:text-primary-400 transition-colors">FAQ</Link>
            <Link href="/help/contact" className="hover:text-primary-400 transition-colors">Contact</Link>
            <Link href="/about" className="hover:text-primary-400 transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary-400 transition-colors">Terms</Link>
          </div>
          
          <div className="border-t border-neutral-800 pt-8">
            <p className="text-neutral-500">
              © 2025 CustomQR.pro. All rights reserved.
            </p>
            <p className="text-neutral-600 text-xs mt-2 opacity-50">
              Build: {getBuildTimeFormatted()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
