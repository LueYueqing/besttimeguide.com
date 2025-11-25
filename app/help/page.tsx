import type { Metadata } from 'next'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Help Center - QR Code Generator Help & Support | CustomQR.pro',
  description: 'Get help with CustomQR.pro QR code generator. Find answers to common questions, tutorials, troubleshooting guides, and contact our support team.',
  keywords: 'QR code help, QR generator support, QR code FAQ, QR code troubleshooting, customer support',
  alternates: {
    canonical: 'https://customqr.pro/help',
  },
}

export default function HelpPage() {
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        { title: 'How to generate your first QR code', href: '/url-qr-code-generator' },
        { title: 'Understanding QR code types', href: '/features' },
        { title: 'Creating your account', href: '/pricing' },
        { title: 'Downloading QR codes', href: '/url-qr-code-generator' },
      ]
    },
    {
      title: 'QR Code Customization',
      icon: '🎨',
      articles: [
        { title: 'Adding your logo to QR codes', href: '/url-qr-code-generator' },
        { title: 'Changing QR code colors', href: '/url-qr-code-generator' },
        { title: 'Using frames and text', href: '/url-qr-code-generator' },
        { title: 'QR code style options', href: '/features' },
      ]
    },
    {
      title: 'Dynamic QR Codes',
      icon: '🔄',
      articles: [
        { title: 'What are dynamic QR codes?', href: '/features' },
        { title: 'Editing QR code content', href: '/features' },
        { title: 'Viewing scan analytics', href: '/features' },
        { title: 'Setting up landing pages', href: '/features' },
      ]
    },
    {
      title: 'API & Integration',
      icon: '💻',
      articles: [
        { title: 'Getting your API key', href: '/api-docs' },
        { title: 'Generating QR codes via API', href: '/api-docs#generate' },
        { title: 'Batch generation', href: '/api-docs#batch' },
        { title: 'API rate limits', href: '/api-docs#rate-limits' },
      ]
    },
    {
      title: 'Troubleshooting',
      icon: '🔧',
      articles: [
        { title: 'QR code not scanning', href: '/faq' },
        { title: 'Download issues', href: '/faq' },
        { title: 'API errors', href: '/api-docs' },
        { title: 'Account access problems', href: '/contact' },
      ]
    },
    {
      title: 'Billing & Account',
      icon: '💳',
      articles: [
        { title: 'Upgrading to Professional', href: '/pricing' },
        { title: 'Canceling subscription', href: '/faq' },
        { title: 'Payment issues', href: '/contact' },
        { title: 'Account settings', href: '/contact' },
      ]
    }
  ]

  const popularQuestions = [
    {
      question: 'How do I generate a QR code?',
      answer: 'Go to any QR code generator page (e.g., URL, WiFi, Text), enter your content, customize the design if desired, and click "Generate QR Code". Then download in your preferred format (PNG, SVG, or JPG).',
      href: '/url-qr-code-generator'
    },
    {
      question: 'Can I edit a QR code after generating it?',
      answer: 'Static QR codes cannot be edited once generated. However, with a Professional plan ($4.99/month), you can create dynamic QR codes that can be edited anytime without reprinting.',
      href: '/features'
    },
    {
      question: 'What file formats are available?',
      answer: 'Free users can download PNG and SVG formats. Professional users also get access to JPG format. All formats support high resolution for print and web use.',
      href: '/features#formats'
    },
    {
      question: 'Is there an API available?',
      answer: 'Yes! Professional and Enterprise plans include full RESTful API access. Generate QR codes programmatically, access analytics, and automate workflows. See our API documentation for details.',
      href: '/api-docs'
    },
    {
      question: 'How much does it cost?',
      answer: 'Static QR code generation is completely free forever. Dynamic QR codes, analytics, batch generation, and API access are available with our Professional plan for just $4.99/month.',
      href: '/pricing'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Help Center - We're Here to Help
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Find answers to common questions, learn how to use our platform, 
            or contact our support team for personalized assistance.
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="section bg-white -mt-20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🔍</span>
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 text-lg"
                />
                <button className="btn bg-primary-600 text-white hover:bg-primary-700 px-6">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Questions */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">Popular Questions</h2>
              <p className="section-subtitle">
                Quick answers to the most common questions
              </p>
            </div>

            <div className="space-y-4">
              {popularQuestions.map((item, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{item.question}</h3>
                  <p className="text-neutral-700 mb-4">{item.answer}</p>
                  <Link 
                    href={item.href}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm inline-flex items-center gap-2"
                  >
                    Learn more →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse Help Articles</h2>
            <p className="section-subtitle">
              Find step-by-step guides organized by topic
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {helpCategories.map((category, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.articles.map((article, i) => (
                    <li key={i}>
                      <Link 
                        href={article.href}
                        className="text-neutral-700 hover:text-primary-600 text-sm flex items-center gap-2"
                      >
                        <span className="text-primary-400">→</span>
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/faq" className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">FAQ</h3>
                <p className="text-neutral-700 text-sm">
                  Comprehensive answers to frequently asked questions
                </p>
              </Link>

              <Link href="/tutorials" className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Tutorials</h3>
                <p className="text-neutral-700 text-sm">
                  Step-by-step guides and video tutorials
                </p>
              </Link>

              <Link href="/contact" className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Contact Support</h3>
                <p className="text-neutral-700 text-sm">
                  Get personalized help from our support team
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Our support team is available 24/7 to assist you. Get in touch and we'll help you resolve any issues.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/contact" className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg font-bold">
                <span>📞</span>
                Contact Support
              </a>
              <a href="/faq" className="btn btn-ghost text-white border-white/30 hover:bg-white/10 btn-lg">
                <span>❓</span>
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="full" />
    </div>
  )
}

