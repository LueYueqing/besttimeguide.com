'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import URLForm from '../components/URLForm'
import TrustSection from '../../components/TrustSection'

interface URLQRGeneratorProps {
  title?: string
  description?: string
  showTrustSection?: boolean
  showSEOContent?: boolean
}

export default function URLQRGenerator({ 
  title = "URL QR Code Generator",
  description = "Transform any website URL into a scannable QR code. Share your website, social media profiles, or any web page instantly.",
  showTrustSection = false,
  showSEOContent = true
}: URLQRGeneratorProps = {}) {
  const generateQRData = (formData: { url: string }) => {
    if (!formData.url) return ''
    
    // 确保URL格式正确
    let url = formData.url.trim()
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }
    
    return url
  }

  const handleDataChange = (data: string) => {
    // 可以在这里处理数据变化，比如分析、日志等
    console.log('Generated QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="url"
        title="URL QR Code Generator"
        description="Transform any website URL into a scannable QR code. Share your website, social media profiles, or any web page instantly."
        placeholder="https://www.example.com"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
      >
        <URLForm onChange={() => {}} placeholder="https://www.example.com" />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for Every Use Case
              </h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                URL QR codes are the most versatile type of QR code. Here's how you can use them:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '💼',
                  title: 'Business Cards',
                  description: 'Add your website QR code to business cards for instant digital connection.'
                },
                {
                  icon: '📱',
                  title: 'Social Media',
                  description: 'Share your social profiles, LinkedIn, or portfolio with a simple scan.'
                },
                {
                  icon: '🛍️',
                  title: 'E-commerce',
                  description: 'Link directly to product pages, online stores, or special offers.'
                },
                {
                  icon: '📄',
                  title: 'Marketing Materials',
                  description: 'Add to flyers, posters, and brochures to drive traffic to your website.'
                },
                {
                  icon: '🎫',
                  title: 'Event Promotion',
                  description: 'Link to event pages, registration forms, or ticket purchasing.'
                },
                {
                  icon: '📚',
                  title: 'Educational Content',
                  description: 'Share course materials, research papers, or educational resources.'
                }
              ].map((useCase, index) => (
                <div key={index} className="card p-6 bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{useCase.title}</h3>
                  <p className="text-primary-200">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO内容区域 - 仅在URL页面显示 */}
      {showSEOContent && (
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
              How to Create URL QR Codes: Complete Guide
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Why Use URL QR Codes?</h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>Instant Access:</strong> No need to type long URLs
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>Error-Free:</strong> Eliminates typing mistakes
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>Mobile-Friendly:</strong> Perfect for smartphone users
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>Trackable:</strong> Monitor scan analytics (Pro feature)
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>Professional:</strong> Modern way to share links
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Best Practices</h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Use HTTPS URLs for security</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Test the QR code before printing</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Ensure sufficient contrast and size</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Include a call-to-action near the QR code</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Consider using short URLs for complex links</div>
                  </li>
                </ul>
              </div>
            </div>

            {/* 步骤指南 */}
            <div className="card p-8 mb-12">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
                4 Simple Steps to Create Your URL QR Code
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: '1',
                    title: 'Enter URL',
                    description: 'Paste your website URL in the generator above'
                  },
                  {
                    step: '2', 
                    title: 'Customize',
                    description: 'Choose colors, size, and error correction level'
                  },
                  {
                    step: '3',
                    title: 'Generate',
                    description: 'Click generate to create your QR code instantly'
                  },
                  {
                    step: '4',
                    title: 'Download',
                    description: 'Save as PNG or SVG for print or digital use'
                  }
                ].map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    <h4 className="font-bold text-neutral-900 mb-2">{step.title}</h4>
                    <p className="text-neutral-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Where to place your QR Code */}
            <div className="card p-8 mb-12">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
                Where to place your URL QR Code to improve scans?
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: '📦',
                    title: 'Product Packaging',
                    description: 'Add QR codes to product boxes, labels, or inserts. Link to product manuals, warranty registration, or customer support pages.'
                  },
                  {
                    icon: '📄',
                    title: 'Business Cards',
                    description: 'Share your website, portfolio, or LinkedIn profile with a single scan. Perfect for networking events and professional meetings.'
                  },
                  {
                    icon: '🏪',
                    title: 'Storefronts & Signage',
                    description: 'Place QR codes on windows, entryways, or displays to drive traffic to your online store, menu, or special offers.'
                  },
                  {
                    icon: '📧',
                    title: 'Email Signatures',
                    description: 'Add a QR code to your email footer linking to your website, booking page, or latest blog post for easy mobile access.'
                  },
                  {
                    icon: '📱',
                    title: 'Social Media Posts',
                    description: 'Share QR codes in your social media content to drive followers to your website, landing pages, or promotional content.'
                  },
                  {
                    icon: '📋',
                    title: 'Print Materials',
                    description: 'Include QR codes on flyers, brochures, and catalogs to bridge offline marketing with online engagement.'
                  }
                ].map((placement, index) => (
                  <div key={index} className="text-center p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl">
                    <div className="text-4xl mb-4">{placement.icon}</div>
                    <h4 className="font-bold text-neutral-900 mb-3">{placement.title}</h4>
                    <p className="text-neutral-600 text-sm leading-relaxed">{placement.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Use Cases */}
            <div className="card p-8 mb-12 bg-gradient-to-br from-primary-50 to-primary-100">
              <h3 className="text-2xl font-bold text-primary-900 mb-6 text-center">
                How different industries use URL QR Codes
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: '🛒',
                    title: 'Retail',
                    description: 'Link to product pages, customer reviews, or online catalogs. Enable contactless shopping experiences.'
                  },
                  {
                    icon: '🏠',
                    title: 'Real Estate',
                    description: 'Share virtual tours, property details, or agent contact info directly from for-sale signs and brochures.'
                  },
                  {
                    icon: '🍽️',
                    title: 'Restaurants',
                    description: 'Link to digital menus, online ordering, or reservation systems. Perfect for contactless dining.'
                  },
                  {
                    icon: '🎓',
                    title: 'Education',
                    description: 'Share course materials, assignment portals, or educational resources with students and parents.'
                  },
                  {
                    icon: '🎪',
                    title: 'Events',
                    description: 'Link to event schedules, speaker bios, or registration pages. Great for conferences and festivals.'
                  },
                  {
                    icon: '🏥',
                    title: 'Healthcare',
                    description: 'Share patient portals, appointment booking, or health information resources in waiting rooms.'
                  }
                ].map((industry, index) => (
                  <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="text-4xl mb-4">{industry.icon}</div>
                    <h4 className="font-bold text-primary-900 mb-3">{industry.title}</h4>
                    <p className="text-primary-700 text-sm leading-relaxed">{industry.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ部分 */}
            <div className="card p-8 mb-12">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                {[
                  {
                    question: 'Are URL QR codes really free?',
                    answer: 'Yes! You can create unlimited static URL QR codes completely free with no registration required. Dynamic QR codes with tracking and editing capabilities are available with our Pro plan.'
                  },
                  {
                    question: 'What is the difference between a static QR Code and a dynamic QR Code?',
                    answer: 'Static QR codes contain the URL directly and cannot be changed once created. Dynamic QR codes use a redirect URL that can be updated anytime, and they provide scan analytics and tracking data.'
                  },
                  {
                    question: 'Do URL QR Codes expire?',
                    answer: 'Static URL QR codes never expire and will work forever as long as the destination URL is active. Dynamic QR codes remain active as long as your subscription is current.'
                  },
                  {
                    question: 'Can I create a QR Code for a long URL?',
                    answer: 'Yes! QR codes can handle very long URLs. However, longer URLs create more complex QR codes that may be harder to scan. Consider using URL shorteners for very long links.'
                  },
                  {
                    question: 'Why is my QR Code not working?',
                    answer: 'Common issues include: incorrect URL format, broken destination link, insufficient contrast, or QR code too small. Always test your QR code before printing or sharing.'
                  },
                  {
                    question: 'Do QR Codes work without the internet?',
                    answer: 'QR codes themselves can be scanned offline, but URL QR codes require an internet connection to access the linked website. The scanning device needs internet to load the destination page.'
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-neutral-200 pb-6 last:border-b-0">
                    <h4 className="font-semibold text-neutral-900 mb-3 text-lg">{faq.question}</h4>
                    <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA区域 */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-primary-900 mb-4">
                🚀 Ready to Get Started?
              </h3>
              <p className="text-primary-800 mb-6 max-w-2xl mx-auto">
                Create your URL QR code now and start sharing your website instantly. 
                Our generator supports all major URL formats and provides high-quality output 
                suitable for both digital and print use.
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <span>🔗</span>
                Create URL QR Code Now
              </button>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 信任和社会证明部分 - 仅在首页显示 */}
      {showTrustSection && <TrustSection />}
    </>
  )
}
