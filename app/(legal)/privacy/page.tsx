import type { Metadata } from 'next'
import Navigation from '../../../components/Navigation'
import Footer from '../../../components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | CustomQR.pro',
  description: 'Learn how CustomQR.pro protects your privacy and handles your data. Read our comprehensive privacy policy for QR code generation services.',
  keywords: 'privacy policy, data protection, GDPR, privacy, CustomQR.pro',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Privacy<br />
            <span className="text-gradient">Policy</span>
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          
          <div className="fade-in-up mt-6">
            <p className="text-neutral-600 font-medium">
              Last updated: November 18, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Overview</h2>
              <p className="text-neutral-600 leading-relaxed">
                CustomQR.pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you visit our website 
                and use our QR code generation services. Please read this privacy policy carefully.
              </p>
            </div>

            <div className="space-y-8">
              
              {/* Information We Collect */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Personal Information</h3>
                <p className="text-neutral-600 mb-4">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 mb-6 space-y-2">
                  <li>Register for an account</li>
                  <li>Subscribe to our services</li>
                  <li>Contact us with inquiries</li>
                  <li>Participate in surveys or promotions</li>
                  <li>Use our API services</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Automatically Collected Information</h3>
                <p className="text-neutral-600 mb-4">
                  When you visit our website, we automatically collect certain information about your device:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 mb-6 space-y-2">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Referring website</li>
                  <li>Pages visited and time spent</li>
                  <li>Device identifiers</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">QR Code Data</h3>
                <p className="text-neutral-600">
                  For dynamic QR codes, we store the destination URLs and scan analytics. Static QR codes 
                  are processed locally in your browser and are not stored on our servers.
                </p>
              </div>

              {/* How We Use Your Information */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">How We Use Your Information</h2>
                <p className="text-neutral-600 mb-4">
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>Providing and maintaining our services</li>
                  <li>Processing your transactions and managing your account</li>
                  <li>Sending you technical notices and support messages</li>
                  <li>Responding to your comments and questions</li>
                  <li>Providing analytics and insights for your QR codes</li>
                  <li>Improving our services and developing new features</li>
                  <li>Detecting and preventing fraud or abuse</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </div>

              {/* Information Sharing */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Information Sharing and Disclosure</h2>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">We Do Not Sell Your Data</h3>
                <p className="text-neutral-600 mb-6">
                  We do not sell, trade, or rent your personal information to third parties.
                </p>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Service Providers</h3>
                <p className="text-neutral-600 mb-4">
                  We may share your information with trusted third-party service providers who assist us in:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 mb-6 space-y-2">
                  <li>Payment processing (Stripe)</li>
                  <li>Email communications (SendGrid)</li>
                  <li>Analytics and monitoring (Google Analytics)</li>
                  <li>Cloud hosting and storage (AWS)</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Legal Requirements</h3>
                <p className="text-neutral-600">
                  We may disclose your information if required by law or in response to valid legal process.
                </p>
              </div>

              {/* Data Security */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Data Security</h2>
                <p className="text-neutral-600 mb-4">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Encrypted storage of sensitive data</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls and authentication</li>
                  <li>Secure data centers with physical security</li>
                </ul>
              </div>

              {/* Your Rights */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Your Privacy Rights</h2>
                
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">GDPR Rights (EU Users)</h3>
                <p className="text-neutral-600 mb-4">
                  If you are located in the EU, you have the following rights:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 mb-6 space-y-2">
                  <li><strong>Right to access:</strong> Request copies of your personal data</li>
                  <li><strong>Right to rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Right to erasure:</strong> Request deletion of your data</li>
                  <li><strong>Right to restrict processing:</strong> Limit how we use your data</li>
                  <li><strong>Right to data portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Right to object:</strong> Object to certain types of processing</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-4">CCPA Rights (California Users)</h3>
                <p className="text-neutral-600 mb-4">
                  California residents have additional rights under the CCPA:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of the sale of personal information</li>
                  <li>Right to non-discrimination for exercising these rights</li>
                </ul>
              </div>

              {/* Cookies and Tracking */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Cookies and Tracking Technologies</h2>
                <p className="text-neutral-600 mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 mb-6 space-y-2">
                  <li><strong>Essential cookies:</strong> Required for basic website functionality</li>
                  <li><strong>Analytics cookies:</strong> Help us understand how you use our site</li>
                  <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
                <p className="text-neutral-600">
                  You can control cookies through your browser settings. See our{' '}
                  <a href="/cookies" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Cookie Policy
                  </a>{' '}
                  for more details.
                </p>
              </div>

              {/* Data Retention */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Data Retention</h2>
                <p className="text-neutral-600 mb-4">
                  We retain your information for as long as necessary to provide our services:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li><strong>Account data:</strong> Until you delete your account</li>
                  <li><strong>Transaction records:</strong> 7 years for tax and legal purposes</li>
                  <li><strong>Analytics data:</strong> 26 months (Google Analytics default)</li>
                  <li><strong>Support communications:</strong> 3 years</li>
                </ul>
              </div>

              {/* Children's Privacy */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Children's Privacy</h2>
                <p className="text-neutral-600 mb-4">
                  Our services are not directed to children under the age of 13. We do not knowingly 
                  collect personal information from children under 13. If you become aware that a child 
                  has provided us with personal information, please contact us immediately.
                </p>
                <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg">
                  <p className="text-warning-800 text-sm">
                    <strong>Important:</strong> If you are a parent or guardian and believe your child has 
                    provided us with personal information, please contact us at javajia@gmail.com to 
                    request deletion of that information.
                  </p>
                </div>
              </div>

              {/* International Data Transfers */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">International Data Transfers</h2>
                <p className="text-neutral-600 mb-4">
                  Your information may be transferred to and processed in countries other than your own. 
                  These countries may have different data protection laws than your country of residence.
                </p>
                <p className="text-neutral-600 mb-4">
                  We take appropriate safeguards to ensure your personal information receives an adequate 
                  level of protection:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>Using standard contractual clauses approved by the European Commission</li>
                  <li>Ensuring data is encrypted in transit and at rest</li>
                  <li>Limiting data processing to the minimum necessary</li>
                  <li>Complying with applicable data protection regulations</li>
                </ul>
              </div>

              {/* Third-Party Links */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Third-Party Links</h2>
                <p className="text-neutral-600">
                  Our service may contain links to third-party websites. We are not responsible for the 
                  privacy practices of these websites. We encourage you to review their privacy policies 
                  before providing any personal information.
                </p>
              </div>

              {/* Data Breach Notification */}
              <div className="card p-8 bg-error-50 border border-error-200">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Data Breach Notification</h2>
                <p className="text-neutral-600 mb-4">
                  In the unlikely event of a data breach that compromises your personal information, we will:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 mb-4 space-y-2">
                  <li><strong>Notify you immediately</strong> via email if we have your contact information</li>
                  <li><strong>Report to authorities</strong> within 72 hours as required by GDPR</li>
                  <li><strong>Provide details</strong> about what information was affected</li>
                  <li><strong>Offer guidance</strong> on steps you can take to protect yourself</li>
                  <li><strong>Post a public notice</strong> on our website for transparency</li>
                </ul>
                <p className="text-neutral-700 font-semibold">
                  We take data security seriously and have never experienced a significant data breach. 
                  However, we are prepared to respond quickly and responsibly if one were to occur.
                </p>
              </div>

              {/* Changes to Privacy Policy */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Changes to This Privacy Policy</h2>
                <p className="text-neutral-600 mb-4">
                  We may update this privacy policy from time to time to reflect changes in our practices, 
                  technology, legal requirements, or other factors. We will notify you of any material changes 
                  by:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 mb-4 space-y-2">
                  <li>Posting the new policy on this page with an updated "Last updated" date</li>
                  <li>Sending an email notification to registered users for significant changes</li>
                  <li>Displaying a prominent notice on our website for major policy updates</li>
                </ul>
                <p className="text-neutral-600">
                  Your continued use of our services after changes are posted constitutes acceptance of the 
                  updated policy. If you do not agree with the changes, you may close your account or 
                  discontinue use of our services.
                </p>
              </div>

              {/* Data Processing Legal Basis */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Legal Basis for Processing (GDPR)</h2>
                <p className="text-neutral-600 mb-4">
                  Under GDPR, we process your personal data based on the following legal grounds:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li><strong>Consent:</strong> When you provide explicit consent for specific processing activities</li>
                  <li><strong>Contract:</strong> To fulfill our contractual obligations to provide services</li>
                  <li><strong>Legal obligation:</strong> To comply with applicable laws and regulations</li>
                  <li><strong>Legitimate interests:</strong> For business operations, security, and service improvement (balanced against your rights)</li>
                </ul>
                <p className="text-neutral-600 mt-4">
                  You have the right to withdraw consent at any time, though this will not affect the 
                  lawfulness of processing before withdrawal.
                </p>
              </div>

              {/* Data Controller Information */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Data Controller</h2>
                <p className="text-neutral-600 mb-4">
                  CustomQR.pro is the data controller responsible for your personal information. Our 
                  contact details are:
                </p>
                <div className="bg-neutral-50 p-4 rounded-lg space-y-2 text-neutral-700">
                  <p><strong>Company:</strong> CustomQR.pro</p>
                  <p><strong>Address:</strong> P.O. Box 1234, San Francisco, CA 94102, United States</p>
                  <p><strong>Email:</strong> javajia@gmail.com</p>
                  <p><strong>Data Protection Officer:</strong> javajia@gmail.com</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card p-8 bg-gradient-to-br from-primary-50 to-primary-100">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Contact Us About Privacy</h2>
                <p className="text-primary-700 mb-4">
                  If you have questions about this privacy policy or want to exercise your rights, contact us:
                </p>
                <div className="space-y-2 text-primary-700">
                  <p><strong>Email:</strong> javajia@gmail.com</p>
                  <p><strong>Data Protection Officer:</strong> javajia@gmail.com</p>
                  <p><strong>Mailing Address:</strong> CustomQR.pro Privacy Team, P.O. Box 1234, San Francisco, CA 94102, United States</p>
                </div>
                <div className="mt-6">
                  <a href="/contact" className="btn btn-primary">
                    <span>📧</span>
                    Contact Privacy Team
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
