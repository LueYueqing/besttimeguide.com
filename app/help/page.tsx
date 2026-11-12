import type { Metadata } from 'next'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Get help with BestTimeGuide: FAQs, tutorials, troubleshooting tips, and ways to contact support about timing guides.',
  keywords: 'besttimeguide help, timing guide FAQ, support, troubleshooting',
  alternates: {
    canonical: 'https://besttimeguide.com/help',
  },
}

export default function HelpPage() {
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        { title: 'What is BestTimeGuide?', href: '/help/faq' },
        { title: 'Browse travel timing guides', href: '/category/travel' },
        { title: 'Browse social media timing guides', href: '/category/social-media' },
        { title: 'See trending guides', href: '/trending' },
      ],
    },
    {
      title: 'Finding Guides',
      icon: '🔍',
      articles: [
        { title: 'Search all timing guides', href: '/search' },
        { title: 'Health & supplements timing', href: '/category/health' },
        { title: 'Shopping & deals timing', href: '/category/shopping' },
        { title: 'Lifestyle timing guides', href: '/category/lifestyle' },
      ],
    },
    {
      title: 'Popular Guides',
      icon: '⭐',
      articles: [
        { title: 'Best time to visit Japan', href: '/best-time-to-visit-japan' },
        { title: 'Best time to post on Instagram', href: '/best-time-to-post-on-instagram' },
        { title: 'Best time to post on TikTok', href: '/best-time-to-post-on-tiktok' },
        { title: 'Best time to visit Thailand', href: '/best-time-to-visit-thailand' },
      ],
    },
    {
      title: 'Account & Plans',
      icon: '💳',
      articles: [
        { title: 'Pricing overview', href: '/pricing' },
        { title: 'Features', href: '/features' },
        { title: 'API documentation', href: '/docs/api' },
        { title: 'Contact support', href: '/help/contact' },
      ],
    },
    {
      title: 'Tutorials',
      icon: '📚',
      articles: [
        { title: 'How to use timing guides', href: '/tutorials' },
        { title: 'FAQ', href: '/help/faq' },
        { title: 'About BestTimeGuide', href: '/about' },
        { title: 'Contact us', href: '/help/contact' },
      ],
    },
    {
      title: 'Policies',
      icon: '📄',
      articles: [
        { title: 'Privacy policy', href: '/privacy' },
        { title: 'Terms of service', href: '/terms' },
        { title: 'Cookie policy', href: '/cookies' },
        { title: 'Contact support', href: '/help/contact' },
      ],
    },
  ]

  const popularQuestions = [
    {
      question: 'How do I find the best time for something?',
      answer:
        'Use search or browse by category (Travel, Social Media, Health, Shopping, Lifestyle). Each guide covers seasons, days, and practical tips backed by demand data.',
      href: '/search',
    },
    {
      question: 'Are the guides free to read?',
      answer:
        'Yes. Timing guides on BestTimeGuide are free to browse and read. Optional paid plans unlock advanced tools and API access.',
      href: '/pricing',
    },
    {
      question: 'How often are guides updated?',
      answer:
        'We refresh high-demand guides when seasons, platforms, or pricing patterns change. Check the publish date on each article for the latest revision.',
      href: '/trending',
    },
    {
      question: 'How can I contact support?',
      answer:
        'Use the contact form for account, billing, or content questions. We also keep an FAQ for common product questions.',
      href: '/help/contact',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />

      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">Help Center</h1>
          <p className="hero-subtitle fade-in-up">
            Find answers about timing guides, browsing categories, plans, and support.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">Popular Questions</h2>
              <p className="section-subtitle">Quick answers to common BestTimeGuide questions</p>
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

      <section className="section bg-neutral-50">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse Help Topics</h2>
            <p className="section-subtitle">Guides and links organized by topic</p>
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

      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/help/faq" className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">FAQ</h3>
                <p className="text-neutral-700 text-sm">Answers about guides, categories, and using the site</p>
              </Link>

              <Link href="/tutorials" className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Tutorials</h3>
                <p className="text-neutral-700 text-sm">Step-by-step tips for getting the most from timing guides</p>
              </Link>

              <Link href="/help/contact" className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Contact Support</h3>
                <p className="text-neutral-700 text-sm">Reach us for account, billing, or content questions</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="full" />
    </div>
  )
}
