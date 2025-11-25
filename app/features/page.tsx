import type { Metadata } from 'next'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Features - Your App Name',
  description: 'Discover the powerful features of our platform. Professional tools, enterprise-grade security, and more.',
  keywords: 'features, platform features, professional tools, enterprise features',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Features - Your App Name',
    description: 'Discover the powerful features of our platform.',
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
            Powerful Features
          </h1>
          <p className="hero-subtitle fade-in-up">
            Everything you need to build and grow your business
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="section bg-gradient-primary">
        <div className="container">
          <div className="feature-grid">
            <div className="card-feature fade-in-up group">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Fast & Reliable</h3>
              <p className="feature-description">
                Built for performance with modern technology stack and optimized infrastructure.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Enterprise-grade security with data encryption and privacy protection.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Analytics & Insights</h3>
              <p className="feature-description">
                Track performance with detailed analytics and actionable insights.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">🎨</div>
              <h3 className="feature-title">Customizable</h3>
              <p className="feature-description">
                Customize everything to match your brand and workflow requirements.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">🔌</div>
              <h3 className="feature-title">API Access</h3>
              <p className="feature-description">
                Integrate with your existing tools using our comprehensive API.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Team Collaboration</h3>
              <p className="feature-description">
                Work together with your team with role-based access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Start using our platform today and experience the difference.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/pricing"
              className="btn btn-primary"
            >
              View Pricing
            </Link>
            <Link
              href="/"
              className="btn btn-secondary"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
