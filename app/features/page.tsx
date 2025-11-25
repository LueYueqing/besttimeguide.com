import type { Metadata } from 'next'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Why Choose CustomQR.pro? - Professional QR Code Features | CustomQR.pro',
  description: 'Discover why thousands choose CustomQR.pro: custom design, lightning-fast generation, multiple formats, privacy-first, analytics-ready, and enterprise-grade features. Professional QR code generation made simple.',
  keywords: 'why choose customqr.pro, QR code features, professional QR generator, custom QR codes, QR code analytics, enterprise QR codes, QR code generator features',
  alternates: {
    canonical: 'https://customqr.pro/features',
  },
  openGraph: {
    title: 'Why Choose CustomQR.pro? - Professional QR Code Features',
    description: 'Professional-grade QR code generation with enterprise-level features. Custom design, analytics, and more.',
    type: 'website',
  },
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg bg-pattern">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Why Choose CustomQR.pro?
          </h1>
          <p className="hero-subtitle fade-in-up">
            Professional-grade QR code generation with enterprise-level features
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="section bg-gradient-primary">
        <div className="container">
          <div className="feature-grid">
            <div className="card-feature fade-in-up group">
              <div className="feature-icon">🎨</div>
              <h3 className="feature-title">Custom Design</h3>
              <p className="feature-description">
                Create branded QR codes with custom colors, logos, and professional designs that perfectly match your brand identity.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Generate QR codes instantly with our optimized engine. No waiting, no delays - just immediate results every time.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Multiple Formats</h3>
              <p className="feature-description">
                Download in PNG, SVG, or PDF formats with various resolutions perfect for both digital and print applications.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Privacy First</h3>
              <p className="feature-description">
                Your data never leaves your browser. All QR codes are generated locally ensuring complete privacy and security.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Analytics Ready</h3>
              <p className="feature-description">
                Upgrade to Pro for dynamic QR codes with detailed scan analytics, geographic data, and performance insights.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Enterprise Grade</h3>
              <p className="feature-description">
                Built for professionals with batch generation, API access, white-label solutions, and priority support.
              </p>
            </div>

            <Link href="/scan-qr-code" className="card-feature fade-in-up group">
              <div className="feature-icon">📷</div>
              <h3 className="feature-title">Free QR Scanner</h3>
              <p className="feature-description">
                Scan any QR code instantly with your device camera. No app download required - works directly in your browser.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* QR Code Types */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">10+ QR Code Types</h2>
            <p className="section-subtitle">
              Generate QR codes for any purpose with our comprehensive type library
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: '🔗', title: 'URL QR Codes', desc: 'Share websites, landing pages, and online content instantly' },
              { icon: '📝', title: 'Text QR Codes', desc: 'Encode plain text messages and information' },
              { icon: '📶', title: 'WiFi QR Codes', desc: 'Automatically connect devices to wireless networks' },
              { icon: '👤', title: 'Business Card QR', desc: 'vCard format for instant contact sharing' },
              { icon: '📧', title: 'Email QR Codes', desc: 'Open email client with pre-filled recipient and subject' },
              { icon: '💬', title: 'SMS QR Codes', desc: 'Send text messages with pre-filled phone number' },
              { icon: '📞', title: 'Phone QR Codes', desc: 'Make calls instantly by scanning the code' },
              { icon: '💚', title: 'WhatsApp QR Codes', desc: 'Open WhatsApp chat directly with phone number' },
              { icon: '📍', title: 'Location QR Codes', desc: 'Share GPS coordinates and Google Maps links' },
              { icon: '📅', title: 'Event QR Codes', desc: 'Add calendar events to iPhone Calendar and Google Calendar' },
            ].map((item, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-neutral-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Customization */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title text-white">Complete Design Control</h2>
            <p className="section-subtitle text-white/90">
              Customize every aspect of your QR code to match your brand
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: '🎨',
                title: 'Custom Colors',
                desc: 'Choose any foreground and background color. Support for gradients and transparent backgrounds.',
                features: ['16M+ color options', 'Transparent background', 'Gradient support']
              },
              {
                icon: '🖼️',
                title: 'Add Your Logo',
                desc: 'Upload your brand logo to the center of QR codes. Control size, shape, and padding.',
                features: ['Custom logo upload', 'Size control', 'Circle/square/rounded shapes']
              },
              {
                icon: '📐',
                title: 'Frame & Text',
                desc: 'Add "SCAN ME" text frames with customizable fonts, sizes, and colors.',
                features: ['4 frame layouts', 'Custom fonts', 'Adjustable text size']
              },
              {
                icon: '✨',
                title: 'QR Styles',
                desc: 'Choose from square, rounded, dots, and extra-rounded QR code patterns.',
                features: ['Multiple styles', 'Rounded corners', 'Dots pattern']
              }
            ].map((item, index) => (
              <div key={index} className="card p-6 bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/80 mb-4 text-sm">{item.desc}</p>
                <ul className="space-y-2">
                  {item.features.map((feature, i) => (
                    <li key={i} className="text-white/90 text-sm flex items-center gap-2">
                      <span className="text-white">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic QR Codes */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">Dynamic QR Codes</h2>
              <p className="section-subtitle">
                Edit, track, and manage your QR codes without reprinting
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-8">
                <div className="text-5xl mb-6">🔄</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Edit Anytime</h3>
                <p className="text-neutral-700 mb-6 leading-relaxed">
                  Change the destination URL or content of your QR code without generating a new one. 
                  Perfect for marketing campaigns and printed materials.
                </p>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-center gap-3">
                    <span className="text-primary-600">✓</span>
                    <span>No reprinting needed</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary-600">✓</span>
                    <span>Unlimited edits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary-600">✓</span>
                    <span>Instant updates</span>
                  </li>
                </ul>
              </div>

              <div className="card p-8">
                <div className="text-5xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Advanced Analytics</h3>
                <p className="text-neutral-700 mb-6 leading-relaxed">
                  Track every scan with detailed statistics. Know when, where, and how your QR codes are being used.
                </p>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">✓</span>
                    <span>Scan count & history</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">✓</span>
                    <span>Geographic data</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">✓</span>
                    <span>Device & browser info</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">✓</span>
                    <span>Real-time dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Generation */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">Batch QR Code Generation</h2>
              <p className="section-subtitle">
                Generate hundreds of QR codes at once for large-scale projects
              </p>
            </div>

            <div className="card p-8 bg-white">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-5xl mb-4">📦</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">CSV Import</h3>
                  <p className="text-neutral-700 text-sm">
                    Upload a CSV file with multiple URLs or data entries. Generate hundreds of QR codes in seconds.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Bulk Download</h3>
                  <p className="text-neutral-700 text-sm">
                    Download all generated QR codes as a ZIP file. Organized and ready for use in your projects.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-4">🔗</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">API Integration</h3>
                  <p className="text-neutral-700 text-sm">
                    Automate QR code generation with our RESTful API. Perfect for developers and enterprise workflows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Output Formats */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Multiple Output Formats</h2>
            <p className="section-subtitle">
              Download your QR codes in the format that works best for your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                format: 'PNG',
                desc: 'High-quality raster images. Perfect for web use and digital displays.',
                features: ['High resolution', 'Transparent background', 'Web optimized']
              },
              {
                format: 'SVG',
                desc: 'Scalable vector graphics. Never lose quality, even at massive sizes.',
                features: ['Infinite scalability', 'Small file size', 'Print quality']
              },
              {
                format: 'JPG',
                desc: 'Standard image format. Compatible with all platforms and devices.',
                features: ['Universal compatibility', 'Smaller file size', 'Wide support']
              }
            ].map((item, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="text-3xl font-black text-primary-600 mb-4">{item.format}</div>
                <p className="text-neutral-700 mb-4 text-sm">{item.desc}</p>
                <ul className="space-y-2">
                  {item.features.map((feature, i) => (
                    <li key={i} className="text-neutral-600 text-sm">✓ {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title text-white">Security & Privacy First</h2>
              <p className="section-subtitle text-primary-100">
                Your data is protected with enterprise-grade security
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: '🔒',
                  title: 'Local Generation',
                  desc: 'Static QR codes are generated entirely in your browser. Your data never leaves your device.'
                },
                {
                  icon: '🛡️',
                  title: 'Data Encryption',
                  desc: 'All dynamic QR code data is encrypted in transit and at rest using industry-standard protocols.'
                },
                {
                  icon: '🚫',
                  title: 'No Tracking',
                  desc: 'Free static QR codes have zero tracking. Your privacy is our priority.'
                },
                {
                  icon: '✅',
                  title: 'GDPR Compliant',
                  desc: 'Full compliance with GDPR, CCPA, and other international privacy regulations.'
                }
              ].map((item, index) => (
                <div key={index} className="card p-6 bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-primary-100 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">Free vs Professional</h2>
              <p className="section-subtitle">
                Choose the plan that fits your needs. Upgrade anytime.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                    <th className="text-left p-4 font-bold">Feature</th>
                    <th className="text-center p-4 font-bold">Free</th>
                    <th className="text-center p-4 font-bold bg-primary-800">Professional</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Static QR Codes', free: '✓ Unlimited', pro: '✓ Unlimited' },
                    { feature: 'Dynamic QR Codes', free: '✗', pro: '✓ Unlimited' },
                    { feature: 'QR Code Types', free: '✓ All 10 types', pro: '✓ All 10 types' },
                    { feature: 'Custom Colors', free: '✓', pro: '✓' },
                    { feature: 'Logo Upload', free: '✓', pro: '✓' },
                    { feature: 'Frame & Text', free: '✓', pro: '✓' },
                    { feature: 'Export Formats', free: 'PNG, SVG', pro: 'PNG, SVG, JPG' },
                    { feature: 'Scan Analytics', free: '✗', pro: '✓ Full Analytics' },
                    { feature: 'Edit QR Codes', free: '✗', pro: '✓ Unlimited Edits' },
                    { feature: 'Batch Generation', free: '✗', pro: '✓ CSV Import' },
                    { feature: 'API Access', free: '✗', pro: '✓ RESTful API' },
                    { feature: 'Priority Support', free: '✗', pro: '✓ Email & Chat' },
                    { feature: 'Custom Landing Pages', free: '✗', pro: '✓' },
                  ].map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}>
                      <td className="p-4 font-semibold text-neutral-900">{row.feature}</td>
                      <td className="p-4 text-center text-neutral-700">{row.free}</td>
                      <td className="p-4 text-center text-primary-600 font-semibold bg-primary-50">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <a href="/pricing" className="btn bg-primary-600 text-white hover:bg-primary-700 btn-lg font-bold">
                <span>💰</span>
                View Pricing Plans
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              Ready to Create Your First QR Code?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Start free forever. Upgrade to Professional for just $4.99/month and unlock 
              dynamic QR codes, analytics, batch generation, and API access.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/url-qr-code-generator" className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg font-bold">
                <span>🚀</span>
                Start Generating Free
              </a>
              <a href="/pricing" className="btn btn-ghost text-white border-white/30 hover:bg-white/10 btn-lg">
                <span>💎</span>
                See Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="full" />
    </div>
  )
}

