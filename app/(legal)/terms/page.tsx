import type { Metadata } from 'next'
import Navigation from '../../../components/Navigation'
import Footer from '../../../components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service | CustomQR.pro',
  description: 'Read the terms of service and user agreement for CustomQR.pro QR code generator. Understand your rights and responsibilities when using our service.',
  keywords: 'terms of service, user agreement, terms and conditions, CustomQR.pro',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Terms of<br />
            <span className="text-gradient">Service</span>
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Please read these terms carefully before using CustomQR.pro services.
          </p>
          
          <div className="fade-in-up mt-6">
            <p className="text-neutral-600 font-medium">
              Last updated: October 29, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Agreement to Terms</h2>
              <p className="text-neutral-600 leading-relaxed">
                By accessing or using CustomQR.pro ("we," "our," or "us"), you agree to be bound by these Terms of Service 
                ("Terms"). If you disagree with any part of these terms, you may not access or use our services.
              </p>
            </div>

            <div className="space-y-8">
              
              {/* Description of Service */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Description of Service</h2>
                <p className="text-neutral-600 mb-4">
                  CustomQR.pro provides QR code generation services, including:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>Static and dynamic QR code creation</li>
                  <li>QR code customization with logos, colors, and designs</li>
                  <li>Analytics and tracking for dynamic QR codes</li>
                  <li>API access for developers</li>
                  <li>Bulk QR code generation</li>
                  <li>Multiple download formats (PNG, SVG, PDF)</li>
                </ul>
              </div>

              {/* User Accounts */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">User Accounts</h2>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Account Registration</h3>
                <p className="text-neutral-600 mb-4">
                  To access certain features, you may need to create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 mb-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Account Termination</h3>
                <p className="text-neutral-600">
                  We reserve the right to suspend or terminate your account at any time for violations of these Terms 
                  or for any other reason we deem necessary.
                </p>
              </div>

              {/* Acceptable Use */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Acceptable Use Policy</h2>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Prohibited Uses</h3>
                <p className="text-neutral-600 mb-4">
                  You may not use our services for:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 mb-6 space-y-2">
                  <li>Illegal activities or content</li>
                  <li>Spam, phishing, or malicious content</li>
                  <li>Copyright or trademark infringement</li>
                  <li>Adult or inappropriate content</li>
                  <li>Malware, viruses, or harmful code</li>
                  <li>Harassment, hate speech, or discrimination</li>
                  <li>Unauthorized access to computer systems</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Content Responsibility</h3>
                <p className="text-neutral-600">
                  You are solely responsible for the content you encode in QR codes and any consequences 
                  resulting from that content. We do not monitor or control user-generated content.
                </p>
              </div>

              {/* Subscription and Payment */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Subscription and Payment Terms</h2>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Subscription Plans</h3>
                <ul className="list-disc pl-6 text-neutral-600 mb-6 space-y-2">
                  <li><strong>Free Plan:</strong> Limited features with no payment required</li>
                  <li><strong>Professional Plan:</strong> $4.99/month with advanced features</li>
                  <li><strong>Enterprise Plan:</strong> Custom pricing for organizations</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Billing and Payments</h3>
                <ul className="list-disc pl-6 text-neutral-600 mb-6 space-y-2">
                  <li>Payments are processed securely through Stripe</li>
                  <li>Subscriptions renew automatically unless cancelled</li>
                  <li>Prices may change with 30 days notice</li>
                  <li>No refunds except as stated in our refund policy</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Refund Policy</h3>
                <p className="text-neutral-600">
                  We offer a 30-day money-back guarantee for new subscriptions. Contact us within 30 days 
                  of your first payment for a full refund.
                </p>
              </div>

              {/* Intellectual Property */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Intellectual Property Rights</h2>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Our Rights</h3>
                <p className="text-neutral-600 mb-6">
                  CustomQR.pro and all related trademarks, logos, and content are owned by us or our licensors. 
                  You may not use our intellectual property without written permission.
                </p>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Your Rights</h3>
                <p className="text-neutral-600 mb-6">
                  You retain ownership of any content you create or upload. You grant us a license to use 
                  your content solely for providing our services.
                </p>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">QR Code Ownership</h3>
                <p className="text-neutral-600">
                  You own the QR codes you generate. However, QR codes themselves are not subject to copyright 
                  as they are functional rather than creative works.
                </p>
              </div>

              {/* Privacy and Data */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Privacy and Data Protection</h2>
                <p className="text-neutral-600 mb-4">
                  Your privacy is important to us. Our data collection and use practices are governed by our{' '}
                  <a href="/privacy" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Privacy Policy
                  </a>, which is incorporated into these Terms by reference.
                </p>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Data Security</h3>
                <p className="text-neutral-600">
                  We implement appropriate security measures to protect your data, but we cannot guarantee 
                  absolute security. You use our services at your own risk.
                </p>
              </div>

              {/* Service Availability */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Service Availability and Modifications</h2>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Service Availability</h3>
                <p className="text-neutral-600 mb-6">
                  We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. We may 
                  perform maintenance or experience outages that temporarily affect service availability.
                </p>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Service Modifications</h3>
                <p className="text-neutral-600">
                  We reserve the right to modify, suspend, or discontinue any part of our services at any time 
                  with reasonable notice to users.
                </p>
              </div>

              {/* Limitation of Liability */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Limitation of Liability</h2>
                <p className="text-neutral-600 mb-4">
                  <strong>DISCLAIMER:</strong> Our services are provided "as is" without warranties of any kind, 
                  either express or implied.
                </p>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Liability Limits</h3>
                <p className="text-neutral-600 mb-4">
                  To the maximum extent permitted by law, we shall not be liable for:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages exceeding the amount paid to us in the past 12 months</li>
                  <li>Issues caused by third-party services or user error</li>
                </ul>
              </div>

              {/* Indemnification */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Indemnification</h2>
                <p className="text-neutral-600">
                  You agree to indemnify and hold us harmless from any claims, damages, or expenses 
                  (including legal fees) arising from your use of our services, violation of these Terms, 
                  or infringement of any third-party rights.
                </p>
              </div>

              {/* Dispute Resolution */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Dispute Resolution</h2>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Governing Law</h3>
                <p className="text-neutral-600 mb-6">
                  These Terms are governed by the laws of the United States, without regard to conflict of law principles. 
                  If you are located outside the United States, your local laws may apply to certain aspects of your relationship with us.
                </p>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Dispute Process</h3>
                <ol className="list-decimal pl-6 text-neutral-600 space-y-2">
                  <li><strong>Informal Resolution:</strong> Contact us first to resolve disputes informally</li>
                  <li><strong>Mediation:</strong> If informal resolution fails, disputes will be resolved through mediation</li>
                  <li><strong>Arbitration:</strong> Binding arbitration for disputes not resolved through mediation</li>
                </ol>
              </div>

              {/* Changes to Terms */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Changes to Terms</h2>
                <p className="text-neutral-600">
                  We may update these Terms from time to time. We will notify users of material changes 
                  via email or website notice. Continued use of our services after changes constitutes 
                  acceptance of the updated Terms.
                </p>
              </div>

              {/* Contact Information */}
              <div className="card p-8 bg-gradient-to-br from-primary-50 to-primary-100">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Questions About These Terms</h2>
                <p className="text-primary-700 mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-primary-700">
                  <p><strong>Email:</strong> javajia@gmail.com</p>
                  <p><strong>Support:</strong> javajia@gmail.com</p>
                  <p><strong>Mailing Address:</strong> CustomQR.pro, Legal Department, P.O. Box 1234, San Francisco, CA 94102, United States</p>
                </div>
                <div className="mt-6">
                  <a href="/contact" className="btn btn-primary">
                    <span>📧</span>
                    Contact Legal Team
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
