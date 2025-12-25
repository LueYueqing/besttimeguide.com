import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import { getAllPosts, getAllCategories } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog - QR Code Tips, Guides & Industry News | besttimeguide.com',
  description: 'Learn about QR codes, best practices, tutorials, case studies, and industry news. Expert guides to help you create effective QR codes for your business.',
  keywords: 'QR code blog, QR code tips, QR code guides, QR code tutorials, QR code case studies, QR code news',
  alternates: {
    canonical: 'https://besttimeguide.com/blog',
  },
}

// Helper function to format date safely
function formatDate(dateString: string): string {
  if (!dateString) return 'Date not available'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Date not available'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  const categories = await getAllCategories()
  const featuredPosts = posts.filter((post) => post.featured).slice(0, 3)
  const recentPosts = posts.slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Blog & Resources<br />
            <span className="text-gradient">Learn & Grow</span>
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Expert guides, tutorials, case studies, and industry insights to help you 
            create effective QR codes for your business.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Articles</h2>
              <p className="section-subtitle">
                Start with these popular guides
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="card p-6 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-primary-100 text-primary-600 px-2 py-1 rounded text-xs font-semibold">
                      {post.readingTime} min read
                    </span>
                    <span className="bg-accent-100 text-accent-700 px-2 py-1 rounded text-xs font-semibold">
                      {post.category}
                    </span>
                    <span className="text-neutral-500 text-xs">Featured</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{post.title}</h3>
                  <p className="text-neutral-700 text-sm mb-4">{post.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 text-xs">{formatDate(post.date)}</span>
                    <span className="text-primary-600 font-semibold text-sm inline-flex items-center gap-2">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="section-header">
                <h2 className="section-title">All Articles</h2>
                <p className="section-subtitle">
                  Browse all our blog posts and guides
                </p>
              </div>

              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="card p-8 text-center">
                    <p className="text-neutral-600">No blog posts yet. Check back soon!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="card p-6 hover:shadow-lg transition-all block"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            post.category === 'Tutorial' ? 'bg-success-100 text-success-700' :
                            post.category === 'Guide' ? 'bg-primary-100 text-primary-700' :
                            post.category === 'Case Study' ? 'bg-accent-100 text-accent-700' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {post.category}
                          </span>
                          <span className="text-neutral-500 text-xs">{post.readingTime} min read</span>
                    <span className="text-neutral-500 text-xs">
                      {formatDate(post.date)}
                    </span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-neutral-900 mb-2">{post.title}</h3>
                      <p className="text-neutral-700 mb-4">{post.description}</p>
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                {categories.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => {
                        const count = posts.filter((p) => p.category === category).length
                        return (
                          <Link
                            key={category}
                            href={`/blog?category=${encodeURIComponent(category)}`}
                            className="flex items-center justify-between text-neutral-700 hover:text-primary-600 transition-colors"
                          >
                            <span>{category}</span>
                            <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{count}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="card p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                  <h3 className="text-lg font-bold mb-2">Start Creating QR Codes</h3>
                  <p className="text-primary-100 text-sm mb-4">
                    Put what you've learned into practice. Generate your first QR code in minutes.
                  </p>
                  <Link
                    href="/"
                    className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-sm font-semibold inline-block"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="full" />
    </div>
  )
}

