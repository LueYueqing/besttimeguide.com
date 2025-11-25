import type { Metadata } from 'next'
import Navigation from '../../../components/Navigation'
import Footer from '../../../components/Footer'

export const metadata: Metadata = {
  title: 'Cookies Policy | CustomQR.pro',
  description: 'Learn about how CustomQR.pro uses cookies and similar technologies to enhance your experience and protect your privacy.',
  keywords: 'cookies policy, cookies, tracking, privacy, CustomQR.pro',
  alternates: {
    canonical: 'https://customqr.pro/cookies',
  },
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Cookies<br />
            <span className="text-gradient">Policy</span>
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Learn about how we use cookies and similar technologies to enhance your experience.
          </p>
          
          <div className="fade-in-up mt-6">
            <p className="text-neutral-600 font-medium">
              Last updated: October 29, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">What Are Cookies?</h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  Cookies are small data files that are placed on your computer or mobile device when you visit our website. 
                  They are widely used to make websites work more efficiently and provide a better user experience.
                </p>
                <p>
                  At CustomQR.pro, we use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                  and improve our services while respecting your privacy choices.
                </p>
              </div>
            </div>

            {/* Types of Cookies */}
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-primary-500 pl-6">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">📝 Essential Cookies</h3>
                  <p className="text-neutral-700 mb-3">
                    These cookies are strictly necessary for the website to function properly. 
                    They enable core functionality such as security, network management, and accessibility.
                  </p>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-sm text-neutral-600">
                      <strong>Examples:</strong> Session management, user authentication, QR code generation preferences
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-accent-500 pl-6">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">📊 Analytics Cookies</h3>
                  <p className="text-neutral-700 mb-3">
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously.
                  </p>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-sm text-neutral-600">
                      <strong>Examples:</strong> Google Analytics, page view statistics, user behavior patterns
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-success-500 pl-6">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">🎯 Functional Cookies</h3>
                  <p className="text-neutral-700 mb-3">
                    These cookies enable enhanced functionality and personalization features. 
                    They remember your preferences and choices.
                  </p>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-sm text-neutral-600">
                      <strong>Examples:</strong> Language preferences, theme selection, QR code design settings
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-warning-500 pl-6">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">🎪 Marketing Cookies</h3>
                  <p className="text-neutral-700 mb-3">
                    These cookies are used to track visitors across websites and display relevant advertisements. 
                    They require your explicit consent.
                  </p>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-sm text-neutral-600">
                      <strong>Examples:</strong> Retargeting pixels, social media integrations, advertising analytics
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookie Details Table */}
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Detailed Cookie Information</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="border border-neutral-200 px-4 py-3 text-left font-semibold">Cookie Name</th>
                      <th className="border border-neutral-200 px-4 py-3 text-left font-semibold">Purpose</th>
                      <th className="border border-neutral-200 px-4 py-3 text-left font-semibold">Duration</th>
                      <th className="border border-neutral-200 px-4 py-3 text-left font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr>
                      <td className="border border-neutral-200 px-4 py-3 font-mono">session_id</td>
                      <td className="border border-neutral-200 px-4 py-3">Maintains user session state</td>
                      <td className="border border-neutral-200 px-4 py-3">Session</td>
                      <td className="border border-neutral-200 px-4 py-3"><span className="px-2 py-1 bg-primary-100 text-primary-800 rounded">Essential</span></td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-3 font-mono">csrf_token</td>
                      <td className="border border-neutral-200 px-4 py-3">Security protection against CSRF attacks</td>
                      <td className="border border-neutral-200 px-4 py-3">Session</td>
                      <td className="border border-neutral-200 px-4 py-3"><span className="px-2 py-1 bg-primary-100 text-primary-800 rounded">Essential</span></td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-3 font-mono">user_preferences</td>
                      <td className="border border-neutral-200 px-4 py-3">Stores QR code design preferences</td>
                      <td className="border border-neutral-200 px-4 py-3">30 days</td>
                      <td className="border border-neutral-200 px-4 py-3"><span className="px-2 py-1 bg-success-100 text-success-800 rounded">Functional</span></td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-3 font-mono">_ga</td>
                      <td className="border border-neutral-200 px-4 py-3">Google Analytics - distinguishes users</td>
                      <td className="border border-neutral-200 px-4 py-3">2 years</td>
                      <td className="border border-neutral-200 px-4 py-3"><span className="px-2 py-1 bg-accent-100 text-accent-800 rounded">Analytics</span></td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-200 px-4 py-3 font-mono">_gid</td>
                      <td className="border border-neutral-200 px-4 py-3">Google Analytics - distinguishes users</td>
                      <td className="border border-neutral-200 px-4 py-3">24 hours</td>
                      <td className="border border-neutral-200 px-4 py-3"><span className="px-2 py-1 bg-accent-100 text-accent-800 rounded">Analytics</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Third-Party Services */}
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Third-Party Services</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">📈 Google Analytics</h3>
                  <p className="text-neutral-700 mb-3">
                    We use Google Analytics to understand how users interact with our website. 
                    Google Analytics uses cookies to collect information about your usage patterns.
                  </p>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm text-primary-800">
                      <strong>Note:</strong> You can opt-out of Google Analytics by installing the 
                      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                        Google Analytics Opt-out Browser Add-on
                      </a>.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">💳 Stripe</h3>
                  <p className="text-neutral-700 mb-3">
                    For payment processing, we use Stripe, which may set cookies to ensure secure transactions 
                    and prevent fraud.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">☁️ Vercel</h3>
                  <p className="text-neutral-700 mb-3">
                    Our website is hosted on Vercel, which may use cookies for performance optimization 
                    and security purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Managing Cookies */}
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Managing Your Cookie Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">🎛️ Cookie Consent Manager</h3>
                  <p className="text-neutral-700 mb-4">
                    You can manage your cookie preferences at any time through our cookie consent banner 
                    or by using the button below.
                  </p>
                  <button className="btn btn-primary">
                    <span>🍪</span>
                    Manage Cookie Preferences
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">🌐 Browser Settings</h3>
                  <p className="text-neutral-700 mb-3">
                    Most web browsers allow you to control cookies through their settings. You can:
                  </p>
                  <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete cookies when you close your browser</li>
                    <li>View and delete individual cookies</li>
                  </ul>
                </div>

                <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg">
                  <p className="text-warning-800 font-medium mb-2">⚠️ Important Note</p>
                  <p className="text-warning-700 text-sm">
                    Blocking or deleting cookies may affect your experience on our website. 
                    Some features may not work properly without certain cookies.
                  </p>
                </div>
              </div>
            </div>

            {/* Browser-Specific Instructions */}
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Browser-Specific Cookie Management</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">🌐 Chrome</h3>
                  <p className="text-sm text-neutral-600 mb-2">Settings → Privacy and security → Cookies and other site data</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">🦊 Firefox</h3>
                  <p className="text-sm text-neutral-600 mb-2">Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">🧭 Safari</h3>
                  <p className="text-sm text-neutral-600 mb-2">Preferences → Privacy → Manage Website Data</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">🔷 Edge</h3>
                  <p className="text-sm text-neutral-600 mb-2">Settings → Site permissions → Cookies and site data</p>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Policy Updates</h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  We may update this Cookies Policy from time to time to reflect changes in our practices 
                  or for other operational, legal, or regulatory reasons.
                </p>
                <p>
                  When we make changes, we will notify you by updating the "Last updated" date at the top of this policy. 
                  Significant changes will be communicated through email notifications or prominent notices on our website.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Questions About Cookies?</h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  If you have any questions about our use of cookies or other tracking technologies, 
                  please don't hesitate to contact us.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <a href="/contact" className="btn btn-primary">
                    <span>📧</span>
                    Contact Us
                  </a>
                  <a href="/privacy" className="btn btn-secondary">
                    <span>🔒</span>
                    View Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="full" />
    </div>
  )
}
