import Footer from '../../components/Footer'

export default function TrustSection() {
  return (
    <>
      {/* Features Preview Section */}
      <section id="features" className="section bg-gradient-primary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose CustomQR.pro?</h2>
            <p className="section-subtitle">
              Professional-grade QR code generation with enterprise-level features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
            <div className="card-feature fade-in-up group">
              <div className="feature-icon">🎨</div>
              <h3 className="feature-title">Custom Design</h3>
              <p className="feature-description">
                Create branded QR codes with custom colors, logos, and professional designs.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Generate QR codes instantly with our optimized engine.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Multiple Formats</h3>
              <p className="feature-description">
                Download in PNG, SVG, or PDF formats for any use case.
              </p>
            </div>

            <div className="card-feature fade-in-up group">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Privacy First</h3>
              <p className="feature-description">
                Your data never leaves your browser. Complete privacy and security.
              </p>
            </div>
          </div>

          <div className="text-center">
            <a href="/features" className="btn btn-ghost text-white border-white/30 hover:bg-white/10 btn-lg">
              <span>✨</span>
              View All Features
            </a>
          </div>
        </div>
      </section>

      {/* 用户评价与社会证明 */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trusted by Professionals Worldwide</h2>
            <p className="section-subtitle">
              Join thousands of businesses and professionals who choose CustomQR.pro
            </p>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-black text-primary-600 mb-2">10,000+</div>
              <p className="text-neutral-600 font-medium">QR Codes Generated</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary-600 mb-2">2,500+</div>
              <p className="text-neutral-600 font-medium">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary-600 mb-2">99.9%</div>
              <p className="text-neutral-600 font-medium">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary-600 mb-2">4.9/5</div>
              <p className="text-neutral-600 font-medium">User Rating</p>
            </div>
          </div>

          {/* 用户评价 */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
              </div>
              <blockquote className="text-neutral-700 mb-4">
                "CustomQR.pro saved us hours of work. The bulk generation feature is incredible, 
                and the analytics help us track our marketing campaigns effectively."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">SM</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Mitchell</div>
                  <div className="text-sm text-neutral-600">Marketing Director, TechCorp</div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
              </div>
              <blockquote className="text-neutral-700 mb-4">
                "The API integration was seamless. Great documentation and the customer 
                support team is responsive. Definitely recommend for any business!"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                  <span className="text-accent-600 font-bold">MJ</span>
                </div>
                <div>
                  <div className="font-semibold">Mike Johnson</div>
                  <div className="text-sm text-neutral-600">CTO, StartupXYZ</div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
                <span className="text-warning-500">⭐</span>
              </div>
              <blockquote className="text-neutral-700 mb-4">
                "Much more affordable than QR.io with the same features. The custom designs 
                look professional and our clients love the branded QR codes."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                  <span className="text-success-600 font-bold">AL</span>
                </div>
                <div>
                  <div className="font-semibold">Anna Lewis</div>
                  <div className="text-sm text-neutral-600">Freelance Designer</div>
                </div>
              </div>
            </div>
          </div>

          {/* 品牌信任 */}
          <div className="mt-16 text-center">
            <p className="text-neutral-600 mb-8 font-medium">Trusted by teams at</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              {/* 占位符 - 后续替换为真实logo */}
              <div className="bg-neutral-200 h-12 w-24 rounded flex items-center justify-center text-neutral-500 text-sm font-medium">
                TechCorp
              </div>
              <div className="bg-neutral-200 h-12 w-24 rounded flex items-center justify-center text-neutral-500 text-sm font-medium">
                StartupXYZ
              </div>
              <div className="bg-neutral-200 h-12 w-24 rounded flex items-center justify-center text-neutral-500 text-sm font-medium">
                DesignCo
              </div>
              <div className="bg-neutral-200 h-12 w-24 rounded flex items-center justify-center text-neutral-500 text-sm font-medium">
                MarketPro
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 最终升级CTA区域 */}
      <section id="final-cta" className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-black mb-6">
              Ready to Create Professional QR Codes?
            </h2>
            <p className="text-xl lg:text-2xl text-primary-100 mb-8">
              Join 2,500+ professionals who trust CustomQR.pro for their QR code needs. 
              Start your subscription today!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <span className="font-semibold">Instant Access</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <span className="font-semibold">No Setup Fee</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <span className="font-semibold">Cancel Anytime</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href="/pricing" className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg font-bold pulse-glow">
                <span>🎯</span>
                Get Started Now
              </a>
              <a href="/contact" className="btn btn-ghost text-white border-white/30 hover:bg-white/10 btn-lg">
                <span>📞</span>
                Talk to Sales
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-primary-200 text-sm">
              <span>✅ 30-day money-back guarantee</span>
              <span>✅ 99.9% uptime SLA</span>
              <span>✅ 24/7 premium support</span>
            </div>
          </div>
        </div>
      </section>

      {/* 统一Footer */}
      <Footer variant="full" />
    </>
  )
}

