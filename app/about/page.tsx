import type { Metadata } from 'next'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

export const metadata: Metadata = {
  title: 'About Us | CustomQR.pro',
  description: 'Learn about CustomQR.pro - the professional QR code generator trusted by thousands of businesses worldwide. Our mission, team, and commitment to excellence.',
  keywords: 'about CustomQR.pro, QR code company, professional QR generator, team',
  alternates: {
    canonical: 'https://customqr.pro/about',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            About<br />
            <span className="text-gradient">CustomQR.pro</span>
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            We're on a mission to make professional QR code generation accessible, 
            affordable, and powerful for businesses of all sizes.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">Our Mission</h2>
              <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                At CustomQR.pro, we believe that powerful QR code generation shouldn't cost a fortune. 
                While competitors charge $35+ per month, we provide professional-grade features at just $4.99/month 
                because we think great tools should be accessible to everyone.
              </p>
              <p className="text-lg text-neutral-700 leading-relaxed">
                We're committed to delivering enterprise-level functionality with a user experience 
                that's intuitive enough for anyone to master in minutes, not hours.
              </p>
            </div>
            <div className="card p-8 bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-xl">
                    🎯
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Accessibility</h3>
                    <p className="text-neutral-700">Professional tools at affordable prices</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-600 text-white rounded-2xl flex items-center justify-center text-xl">
                    🚀
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Innovation</h3>
                    <p className="text-neutral-700">Cutting-edge features with modern technology</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success-600 text-white rounded-2xl flex items-center justify-center text-xl">
                    ⭐
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Excellence</h3>
                    <p className="text-neutral-700">Uncompromising quality in everything we do</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="section bg-gradient-primary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trusted by Professionals Worldwide</h2>
            <p className="section-subtitle">
              Numbers that speak to our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-primary-600 mb-3">2,500+</div>
              <p className="text-neutral-700 font-semibold">Happy Customers</p>
              <p className="text-sm text-neutral-600">Across 60+ countries</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-primary-600 mb-3">10,000+</div>
              <p className="text-neutral-700 font-semibold">QR Codes Generated</p>
              <p className="text-sm text-neutral-600">And growing daily</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-primary-600 mb-3">99.9%</div>
              <p className="text-neutral-700 font-semibold">Uptime Guarantee</p>
              <p className="text-sm text-neutral-600">Reliable service you can trust</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-primary-600 mb-3">4.9/5</div>
              <p className="text-neutral-700 font-semibold">Customer Rating</p>
              <p className="text-sm text-neutral-600">Based on 500+ reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">Our Story</h2>
              <p className="section-subtitle">
                How CustomQR.pro became the go-to choice for professional QR codes
              </p>
            </div>

            <div className="space-y-8">
              <div className="card p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    2023
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">The Problem We Saw</h3>
                    <p className="text-neutral-700 leading-relaxed">
                      As digital marketers ourselves, we were frustrated with expensive QR code services 
                      that charged enterprise prices for basic features. QR.io at $35/month, limited free tiers, 
                      and poor user experiences were holding back small businesses and entrepreneurs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    2025
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Building the Solution</h3>
                    <p className="text-neutral-700 leading-relaxed">
                      We set out to build what we wished existed: a professional QR code generator with 
                      enterprise features at a fair price. Using modern technology like Next.js and React, 
                      we created a platform that's both powerful and user-friendly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-success-100 text-success-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    Now
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Serving Thousands</h3>
                    <p className="text-neutral-700 leading-relaxed">
                      Today, CustomQR.pro serves over 2,500 customers worldwide, from solo entrepreneurs 
                      to Fortune 500 companies. We're proud to offer unlimited dynamic QR codes, 
                      comprehensive analytics, and full API access at just $4.99/month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-gradient-primary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🌟
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Customer First</h3>
              <p className="text-neutral-700">
                Every feature we build, every decision we make, starts with asking: 
                "How does this help our customers succeed?"
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🔍
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Transparency</h3>
              <p className="text-neutral-700">
                No hidden fees, no surprise charges, no confusing terms. 
                What you see is what you get, always.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-success-100 text-success-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🚀
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Continuous Innovation</h3>
              <p className="text-neutral-700">
                We're constantly improving our platform, adding new features, 
                and staying ahead of industry trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">Built with Modern Technology</h2>
              <p className="section-subtitle">
                We use cutting-edge tools to deliver the best possible experience
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Frontend Excellence</h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-center gap-3">
                    <span className="text-primary-600">▶</span>
                    <span><strong>Next.js 15 & React 19:</strong> Lightning-fast performance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary-600">▶</span>
                    <span><strong>Tailwind CSS:</strong> Beautiful, responsive design</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary-600">▶</span>
                    <span><strong>TypeScript:</strong> Rock-solid code reliability</span>
                  </li>
                </ul>
              </div>

              <div className="card p-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Backend & Infrastructure</h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">▶</span>
                    <span><strong>Cloud Infrastructure:</strong> 99.9% uptime guarantee</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">▶</span>
                    <span><strong>Advanced Analytics:</strong> Real-time scan tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">▶</span>
                    <span><strong>Secure APIs:</strong> Enterprise-grade security</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              Ready to Join Thousands of Satisfied Customers?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Experience the CustomQR.pro difference. Start your subscription today 
              and see why professionals choose us over expensive alternatives.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/pricing" className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg font-bold">
                <span>🚀</span>
                Get Started
              </a>
              <a href="/help/contact" className="btn btn-ghost text-white border-white/30 hover:bg-white/10 btn-lg">
                <span>📞</span>
                Contact Us
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
