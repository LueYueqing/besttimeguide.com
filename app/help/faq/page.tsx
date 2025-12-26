import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Section, Container } from '@/components/Layout'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | besttimeguide.com',
  description: 'Get answers to common questions about besttimeguide.com timing guides, how to use our guides, and find the best time for everything.',
  keywords: 'FAQ, questions, timing guides, best time help, support, besttimeguide.com help',
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
            Find answers to common questions about our timing guides and how to use besttimeguide.com. 
            Can't find what you're looking for? Contact our team.
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
                  <h3 className="font-bold text-lg mb-3">What is besttimeguide.com?</h3>
                  <p className="text-neutral-600">
                    besttimeguide.com is the most trusted timing guide site on the internet. We provide free, comprehensive guides 
                    that help you find the best time for everything - from travel and social media to health and shopping. 
                    Our guides are data-driven, combining search trends, price analysis, seasonal patterns, and expert advice.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What topics do you cover?</h3>
                  <div className="text-neutral-600">
                    <p className="mb-3">We cover 5 main categories:</p>
                    <ul className="list-disc pl-6 mb-4">
                      <li><strong>Travel:</strong> Best time to visit countries, cities, and attractions</li>
                      <li><strong>Social Media:</strong> Best time to post on Instagram, TikTok, Facebook, etc.</li>
                      <li><strong>Health:</strong> Best time to take supplements, medications, and health tests</li>
                      <li><strong>Shopping:</strong> Best time to buy cars, houses, plane tickets, and more</li>
                      <li><strong>Lifestyle:</strong> Best time for exercise, gardening, diet, and daily activities</li>
                    </ul>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Do I need to register to use besttimeguide.com?</h3>
                  <p className="text-neutral-600">
                    No! All our guides are completely free and accessible without registration. 
                    You can browse, read, and use all our timing guides without creating an account.
                  </p>
                </div>
              </div>
            </div>

            {/* Using Our Guides */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Using Our Guides</h2>
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Are your guides really free?</h3>
                  <p className="text-neutral-600">
                    Yes! All our timing guides are completely free. No registration required, no credit card needed, 
                    no hidden fees. We believe timing advice should be accessible to everyone.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">How do you determine the "best time"?</h3>
                  <p className="text-neutral-600 mb-3">
                    Our recommendations are based on multiple data sources:
                  </p>
                  <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                    <li>Search volume trends and user behavior data</li>
                    <li>Historical price analysis and seasonal patterns</li>
                    <li>Weather data and climate information</li>
                    <li>Expert research and industry best practices</li>
                    <li>User feedback and real-world experiences</li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">How often are guides updated?</h3>
                  <p className="text-neutral-600">
                    We regularly update our guides to reflect current trends, price changes, and new information. 
                    Major updates are typically done annually, with minor updates as needed throughout the year.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Can I suggest a new guide topic?</h3>
                  <p className="text-neutral-600">
                    Absolutely! We welcome suggestions for new timing guides. Use our contact form to suggest topics, 
                    and we'll consider them for future content. Popular suggestions are prioritized.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Can I share or cite your guides?</h3>
                  <p className="text-neutral-600">
                    Yes! You're welcome to share our guides and cite them in your own content. 
                    We just ask that you provide proper attribution and link back to the original guide.
                  </p>
                </div>
              </div>
            </div>

            {/* Guide Content */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Guide Content</h2>
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What information is included in each guide?</h3>
                  <p className="text-neutral-600 mb-3">
                    Each guide typically includes:
                  </p>
                  <ul className="list-disc pl-6 text-neutral-600 space-y-1">
                    <li>Specific best time recommendations (month, season, or time of day)</li>
                    <li>Data-driven analysis and reasoning</li>
                    <li>Price trends and cost considerations (where applicable)</li>
                    <li>Weather and seasonal factors</li>
                    <li>Practical tips and considerations</li>
                    <li>FAQ section addressing common questions</li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Are your recommendations guaranteed to work?</h3>
                  <p className="text-neutral-600">
                    While we base our recommendations on extensive data and research, results can vary based on individual 
                    circumstances, location, and other factors. Our guides provide general guidance, but you should always 
                    consider your specific situation and consult with professionals when making important decisions.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Do you cover international destinations and topics?</h3>
                  <p className="text-neutral-600">
                    Yes! We cover destinations and topics from around the world. Our travel guides include countries and cities 
                    globally, and our other guides consider international perspectives where relevant.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">How do I search for a specific guide?</h3>
                  <p className="text-neutral-600">
                    You can search using our search bar at the top of the page, browse by category, or use the URL format: 
                    besttimeguide.com/best-time-to-[topic]. For example: besttimeguide.com/best-time-to-visit-japan
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

            {/* Why Choose Us */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Why Choose besttimeguide.com?</h2>
              <div className="space-y-6">
                <div className="card p-6 border-2 border-primary-200">
                  <h3 className="font-bold text-lg mb-3">What makes besttimeguide.com special?</h3>
                  <div className="text-neutral-600">
                    <p className="mb-3">We focus on delivering comprehensive, reliable timing advice:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-primary-600 mb-2">📊 Data-Driven</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Based on real search trends and data</li>
                          <li>Price analysis and seasonal patterns</li>
                          <li>Expert research and verification</li>
                          <li>Regularly updated information</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-success-600 mb-2">🆓 Completely Free</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>No registration required</li>
                          <li>No hidden fees or subscriptions</li>
                          <li>All guides accessible to everyone</li>
                          <li>No credit card needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6 border-2 border-accent-200">
                  <h3 className="font-bold text-lg mb-3">How do we ensure quality and reliability?</h3>
                  <div className="text-neutral-600">
                    <p className="mb-3">Our guides are created with thorough research and best practices:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-accent-600 mb-2">🔍 Comprehensive Research</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Multiple data sources verified</li>
                          <li>Expert analysis and insights</li>
                          <li>Real-world testing and validation</li>
                          <li>Regular content updates</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-info-600 mb-2">📚 Wide Coverage</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>500+ timing guides</li>
                          <li>5 core categories</li>
                          <li>International coverage</li>
                          <li>Diverse topics and scenarios</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">What makes besttimeguide.com unique?</h3>
                  <div className="text-neutral-600">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">📊</div>
                        <h4 className="font-semibold mb-2">Data-Driven</h4>
                        <p className="text-sm">Real data, not just opinions</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">🆓</div>
                        <h4 className="font-semibold mb-2">100% Free</h4>
                        <p className="text-sm">All guides accessible to everyone</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-success-100 text-success-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">🌍</div>
                        <h4 className="font-semibold mb-2">Comprehensive</h4>
                        <p className="text-sm">500+ guides covering all aspects</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Support</h2>
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">How can I contact you?</h3>
                  <p className="text-neutral-600">
                    You can reach us through our contact form, email, or by browsing our FAQ. 
                    We aim to respond to all inquiries within 24 hours.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-3">Can I report an error or outdated information?</h3>
                  <p className="text-neutral-600">
                    Absolutely! If you find any errors or outdated information in our guides, please contact us. 
                    We appreciate feedback and regularly update our content based on user input and new data.
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
                  Our team is here to help. Get in touch and we'll respond within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="/help/contact" className="btn btn-primary">
                    <span>📧</span>
                    Contact Us
                  </a>
                  <a href="/" className="btn btn-secondary">
                    <span>🔍</span>
                    Browse Guides
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
