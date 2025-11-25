import type { Metadata } from 'next'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import { Section, Container } from '../../components/Layout'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | CustomQR.pro',
  description: 'Get answers to common questions about CustomQR.pro QR code generator, pricing, features, and technical support.',
  keywords: 'FAQ, questions, QR code help, support, CustomQR.pro help',
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Frequently Asked Questions
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Find answers to common questions about CustomQR.pro. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <Section variant="white">
        <Container size="lg">
            
            {/* General Questions */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">General Questions</h2>
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What is CustomQR.pro?</h3>
                  <p className="text-neutral-600">
                    CustomQR.pro is a professional QR code generator that allows you to create, customize, and track QR codes. 
                    We offer both static and dynamic QR codes with advanced analytics, custom branding, and API access.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What's the difference between static and dynamic QR codes?</h3>
                  <div className="text-neutral-600">
                    <p className="mb-3"><strong>Static QR codes:</strong></p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Content is permanently encoded in the QR code</li>
                      <li>Cannot be edited after creation</li>
                      <li>No tracking or analytics</li>
                      <li>Work forever, even if our service goes down</li>
                    </ul>
                    <p className="mb-3"><strong>Dynamic QR codes:</strong></p>
                    <ul className="list-disc pl-6">
                      <li>Content can be changed anytime without reprinting</li>
                      <li>Detailed analytics and tracking</li>
                      <li>Require an active subscription</li>
                      <li>Perfect for marketing campaigns</li>
                    </ul>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Do I need to register to use CustomQR.pro?</h3>
                  <p className="text-neutral-600">
                    No! You can create and download static QR codes without any registration. 
                    However, to access dynamic QR codes, analytics, and other premium features, you'll need to create an account.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing & Plans */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Pricing & Plans</h2>
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Is there a free plan?</h3>
                  <p className="text-neutral-600">
                    Yes! Our free plan includes unlimited static QR codes, basic customization, and PNG downloads. 
                    No credit card required, no time limits.
                  </p>
                </div>

                <div className="card p-6 border-2 border-blue-200 bg-blue-50">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span>🎁</span>
                    How does the referral program work?
                  </h3>
                  <div className="text-neutral-700">
                    <p className="mb-3">
                      Our referral program rewards you with <strong className="text-blue-600">3 days of Pro access</strong> for each friend you invite who successfully registers and logs in.
                    </p>
                    <div className="bg-white p-4 rounded-lg mt-3">
                      <p className="font-semibold mb-2 text-sm">How it works:</p>
                      <ol className="list-decimal pl-5 space-y-1 text-sm">
                        <li>Share your unique invite link from your dashboard</li>
                        <li>Your friend clicks the link and registers</li>
                        <li>When they log in for the first time, you automatically get 3 days of Pro access</li>
                        <li>Rewards stack - invite more friends to extend your trial!</li>
                      </ol>
                    </div>
                    <p className="mt-3 text-sm">
                      <strong>Benefits:</strong> Unlimited dynamic QR codes, advanced analytics, logo upload, and all Pro features during your trial period.
                    </p>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Can I cancel my subscription anytime?</h3>
                  <p className="text-neutral-600">
                    Absolutely! You can cancel your subscription at any time from your account settings. 
                    Your account will remain active until the end of your current billing period.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Do you offer refunds?</h3>
                  <p className="text-neutral-600">
                    We offer a 30-day money-back guarantee. If you're not satisfied with CustomQR.pro 
                    within the first 30 days, contact us for a full refund.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What happens if I downgrade my plan?</h3>
                  <p className="text-neutral-600">
                    Your existing QR codes will continue to work. However, you may lose access to certain features like 
                    analytics, editing dynamic QR codes, or creating new dynamic codes until you upgrade again.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">How many times can I edit my dynamic QR codes?</h3>
                  <p className="text-neutral-600">
                    With a Professional or Enterprise plan, you can edit your dynamic QR codes as many times as you need. 
                    There are no limits on the number of edits - change the destination URL, update the design, or modify 
                    any settings whenever you want, without any restrictions.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">When can I start using premium features after subscribing?</h3>
                  <p className="text-neutral-600">
                    Your premium features are activated immediately after your payment is processed. This typically happens 
                    within seconds, and you'll have instant access to all Pro features including dynamic QR codes, analytics, 
                    logo upload, and API access. No waiting period required.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What currency do you charge in?</h3>
                  <p className="text-neutral-600">
                    All subscriptions are billed in US Dollars (USD), regardless of where your business is located. 
                    Your bank or credit card company will handle the currency conversion if needed, and you'll see the 
                    converted amount on your statement.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What payment methods do you accept?</h3>
                  <p className="text-neutral-600">
                    We accept all major credit cards and debit cards (Visa, Mastercard, American Express, Discover). 
                    All payments are securely processed through Stripe, one of the world's most trusted payment processors. 
                    Your payment information is encrypted and never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Features & Technical */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Features & Technical</h2>
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What file formats can I download?</h3>
                  <div className="text-neutral-600">
                    <p className="mb-3"><strong>Free users:</strong> PNG format</p>
                    <p><strong>Pro users:</strong> PNG, SVG, and PDF formats in multiple resolutions</p>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Can I add my logo to QR codes?</h3>
                  <p className="text-neutral-600">
                    Yes! Pro users can upload custom logos, adjust colors, change shapes, and add frames to create 
                    branded QR codes that match their company identity.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Do you provide an API?</h3>
                  <p className="text-neutral-600">
                    Yes, we offer a comprehensive REST API for Pro users. You can programmatically create, 
                    manage, and track QR codes. Full documentation is available in our developer portal.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">How accurate is the analytics data?</h3>
                  <p className="text-neutral-600">
                    Our analytics track every scan in real-time, including location (city/country), 
                    device type, operating system, and timestamp. Data is updated within minutes of each scan.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What information do I need to create a QR code?</h3>
                  <p className="text-neutral-600">
                    Creating a QR code is simple! For static QR codes, you just need the content (URL, text, WiFi credentials, etc.). 
                    For dynamic QR codes with custom design, you'll specify:
                  </p>
                  <ul className="list-disc pl-6 mt-3 text-neutral-600 space-y-1">
                    <li>The QR code type (URL, text, WiFi, business card, etc.)</li>
                    <li>Your content or destination URL</li>
                    <li>Design preferences (colors, shape style, logo if desired)</li>
                    <li>Frame and text options (optional)</li>
                  </ul>
                  <p className="text-neutral-600 mt-3">
                    Our intuitive interface guides you through each step, making it easy to create professional QR codes in minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* Security & Privacy */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Security & Privacy</h2>
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Is my data secure?</h3>
                  <p className="text-neutral-600">
                    Absolutely. We use industry-standard encryption, secure data centers, and follow GDPR compliance. 
                    Your QR codes and analytics data are protected with bank-level security.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Do you store my QR code content?</h3>
                  <p className="text-neutral-600">
                    For static QR codes, content is processed locally and not stored on our servers. 
                    For dynamic QR codes, we securely store the destination URL to enable editing and tracking features.
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison with Competitors */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Why Choose CustomQR.pro?</h2>
              <div className="space-y-6">
                <div className="card p-6 border-2 border-primary-200">
                  <h3 className="font-bold text-lg mb-3">What makes CustomQR.pro special?</h3>
                  <div className="text-neutral-600">
                    <p className="mb-3">We focus on delivering exceptional value and user experience:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-primary-600 mb-2">💰 Best Value</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Professional features at $4.99/month</li>
                          <li>Unlimited dynamic QR codes</li>
                          <li>No hidden fees or limits</li>
                          <li>Transparent pricing</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-success-600 mb-2">🚀 User Experience</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>No registration for free features</li>
                          <li>Instant QR code generation</li>
                          <li>Mobile-optimized interface</li>
                          <li>Lightning-fast performance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6 border-2 border-accent-200">
                  <h3 className="font-bold text-lg mb-3">How do we ensure quality and reliability?</h3>
                  <div className="text-neutral-600">
                    <p className="mb-3">Built with modern technology and best practices:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-accent-600 mb-2">⚡ Modern Technology</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Next.js 15 + React 19</li>
                          <li>Enterprise-grade infrastructure</li>
                          <li>99.9% uptime guarantee</li>
                          <li>Global CDN delivery</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-info-600 mb-2">🔒 Security & Privacy</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>GDPR compliant</li>
                          <li>SSL encryption</li>
                          <li>No data selling</li>
                          <li>Regular security audits</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What makes CustomQR.pro unique?</h3>
                  <div className="text-neutral-600">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">💰</div>
                        <h4 className="font-semibold mb-2">Best Value</h4>
                        <p className="text-sm">7x cheaper than QR.io with same features</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">🚀</div>
                        <h4 className="font-semibold mb-2">Modern Tech</h4>
                        <p className="text-sm">Next.js 15 + React 19 for lightning speed</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-success-100 text-success-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">∞</div>
                        <h4 className="font-semibold mb-2">Unlimited</h4>
                        <p className="text-sm">No limits on dynamic QR codes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Can I migrate from other QR code services?</h3>
                  <p className="text-neutral-600">
                    Yes! We offer free migration assistance for Pro users. Our team can help you transfer your 
                    QR codes and data from QR.io, TQRCG, QRFY, or any other service. Contact support to get started.
                  </p>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Support</h2>
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">How can I contact support?</h3>
                  <p className="text-neutral-600">
                    Free users can access our help center and community forum. Pro users get priority email support 
                    with response within 24 hours. Enterprise customers have access to phone support and dedicated account managers.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Do you offer training or onboarding?</h3>
                  <p className="text-neutral-600">
                    We provide comprehensive tutorials, video guides, and documentation. Enterprise customers 
                    receive personalized onboarding and training sessions.
                  </p>
                </div>
              </div>
            </div>

            {/* Still have questions CTA */}
            <div className="text-center">
              <div className="card p-8 bg-gradient-to-br from-primary-50 to-primary-100">
                <h2 className="text-2xl font-bold text-primary-900 mb-4">
                  Still have questions?
                </h2>
                <p className="text-primary-700 mb-6">
                  Our support team is here to help. Get in touch and we'll respond within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="/help/contact" className="btn btn-primary">
                    <span>📧</span>
                    Contact Support
                  </a>
                  <a href="/" className="btn btn-secondary">
                    <span>🎯</span>
                    Try QR Generator
                  </a>
                </div>
              </div>
            </div>
        </Container>
      </Section>

      {/* Footer */}
      <Footer variant="full" />
    </div>
  )
}
