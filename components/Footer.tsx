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
                CustomQR<span className="text-gradient">.pro</span>
              </h3>
              <p className="text-neutral-400 text-lg mb-6 max-w-md">
                The professional choice for custom QR code generation. 
                Trusted by 2,500+ businesses worldwide.
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

            {/* 产品链接 */}
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <div className="space-y-3 text-neutral-400">
                <Link href="/features" className="block hover:text-primary-400 transition-colors">Features</Link>
                <Link href="/pricing" className="block hover:text-primary-400 transition-colors">Pricing</Link>
                <Link href="/docs/api" className="block hover:text-primary-400 transition-colors">API Docs</Link>
                <Link href="/help" className="block hover:text-primary-400 transition-colors">Help Center</Link>
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

          {/* QR码类型快速链接 */}
          <div className="border-t border-neutral-800 pt-8 mb-8">
            <h4 className="font-bold mb-4 text-center">Popular QR Code Generators</h4>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-400">
              <Link href="/wifi-qr-code-generator" className="hover:text-primary-400 transition-colors">WiFi QR Code</Link>
              <Link href="/business-card-qr-code-generator" className="hover:text-primary-400 transition-colors">Business Card QR</Link>
              <Link href="/whatsapp-qr-code-generator" className="hover:text-primary-400 transition-colors">WhatsApp QR</Link>
              <Link href="/url-qr-code-generator" className="hover:text-primary-400 transition-colors">URL QR Code</Link>
              <Link href="/url-qr-code-generator" className="hover:text-primary-400 transition-colors">QR Code with Logo</Link>
              <Link href="/pricing" className="hover:text-primary-400 transition-colors">Bulk QR Generator</Link>
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
              © 2025 CustomQR.pro. Professional QR Code Generator for Businesses
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
              CustomQR<span className="text-gradient">.pro</span>
            </h3>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              The professional choice for custom QR code generation.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8 text-neutral-300">
            <Link href="/" className="hover:text-primary-400 transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link>
            <Link href="/help/faq" className="hover:text-primary-400 transition-colors">FAQ</Link>
            <Link href="/help/contact" className="hover:text-primary-400 transition-colors">Contact</Link>
            <Link href="/about" className="hover:text-primary-400 transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary-400 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-primary-400 transition-colors">Cookies</Link>
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
