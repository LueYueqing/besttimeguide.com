import type { Metadata } from 'next'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

export const metadata: Metadata = {
  title: 'About Us | besttimeguide.com',
  description: 'Learn about besttimeguide.com - the most trusted timing guide site on the internet. We help you find the best time for everything with data-driven insights.',
  keywords: 'about besttimeguide.com, best time guides, timing advice, when to do things',
  alternates: {
    canonical: 'https://besttimeguide.com/about',
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
            <span className="text-gradient">besttimeguide.com</span>
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            We're on a mission to help you find the best time for everything - from travel and social media 
            to health and shopping. Data-driven insights, expert advice, all in one place.
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
                At besttimeguide.com, we believe that everyone deserves access to reliable, data-driven timing advice. 
                Whether you're planning a trip, optimizing your social media posts, managing your health, or making 
                important purchases, timing matters. We're here to help you make the best decisions at the right time.
              </p>
              <p className="text-lg text-neutral-700 leading-relaxed">
                Our mission is to provide free, comprehensive guides that help you maximize results, minimize costs, 
                and optimize experiences through intelligent timing decisions.
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
                    <p className="text-neutral-700">Free guides accessible to everyone</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-600 text-white rounded-2xl flex items-center justify-center text-xl">
                    🚀
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Data-Driven</h3>
                    <p className="text-neutral-700">Insights based on real data and expert analysis</p>
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
            <h2 className="section-title">Trusted Timing Guides</h2>
            <p className="section-subtitle">
              Helping millions make better timing decisions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-primary-600 mb-3">500+</div>
              <p className="text-neutral-700 font-semibold">Timing Guides</p>
              <p className="text-sm text-neutral-600">Covering all aspects of life</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-primary-600 mb-3">5</div>
              <p className="text-neutral-700 font-semibold">Core Categories</p>
              <p className="text-sm text-neutral-600">Travel, Social Media, Health, Shopping, Lifestyle</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-primary-600 mb-3">100%</div>
              <p className="text-neutral-700 font-semibold">Free Access</p>
              <p className="text-sm text-neutral-600">All guides available to everyone</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-primary-600 mb-3">2025</div>
              <p className="text-neutral-700 font-semibold">Founded</p>
              <p className="text-sm text-neutral-600">Building the future of timing advice</p>
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
                How besttimeguide.com became the most trusted timing guide site on the internet
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
                      We noticed that people constantly search for "best time to..." questions - when to visit a place, 
                      when to post on social media, when to take supplements, when to buy products. But finding reliable, 
                      data-driven answers was scattered across the internet. We wanted to create one trusted source 
                      for all timing decisions.
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
                      We set out to build a comprehensive timing guide platform that combines search data, 
                      price trends, seasonal analysis, and expert advice. Using modern technology and data-driven 
                      insights, we created guides that help people make better timing decisions across all aspects of life.
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
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Serving Millions</h3>
                    <p className="text-neutral-700 leading-relaxed">
                      Today, besttimeguide.com provides free, comprehensive timing guides covering travel, social media, 
                      health, shopping, and lifestyle. Our goal is to help millions of people make better timing decisions 
                      by providing data-driven insights and expert advice, all completely free and accessible to everyone.
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
              <h3 className="text-xl font-bold text-neutral-900 mb-4">User First</h3>
              <p className="text-neutral-700">
                Every guide we create, every piece of advice we provide, starts with asking: 
                "How does this help our users make better timing decisions?"
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🔍
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Transparency</h3>
              <p className="text-neutral-700">
                All our guides are free, all our data sources are transparent, and all our advice is based on 
                real research and analysis. No hidden agendas, just honest timing advice.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-success-100 text-success-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🚀
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Continuous Improvement</h3>
              <p className="text-neutral-700">
                We're constantly expanding our guide library, updating data, and refining our advice 
                to ensure you always have the most current and accurate timing information.
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
              <h2 className="section-title">Our Content Approach</h2>
              <p className="section-subtitle">
                How we create reliable, data-driven timing guides
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Data-Driven Insights</h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-center gap-3">
                    <span className="text-primary-600">▶</span>
                    <span><strong>Search Volume Analysis:</strong> Based on real user queries</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary-600">▶</span>
                    <span><strong>Price Trends:</strong> Historical data analysis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary-600">▶</span>
                    <span><strong>Seasonal Patterns:</strong> Weather, events, and timing</span>
                  </li>
                </ul>
              </div>

              <div className="card p-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Expert Guidance</h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">▶</span>
                    <span><strong>Comprehensive Research:</strong> Multiple sources verified</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">▶</span>
                    <span><strong>Practical Advice:</strong> Actionable recommendations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-accent-600">▶</span>
                    <span><strong>Regular Updates:</strong> Keeping content current</span>
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
              Ready to Make Better Timing Decisions?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Explore our comprehensive guides and discover the best time for everything. 
              All guides are free, data-driven, and designed to help you optimize your decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/" className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg font-bold">
                <span>🔍</span>
                Browse Guides
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
