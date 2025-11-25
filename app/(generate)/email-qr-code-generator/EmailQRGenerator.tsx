'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import EmailForm from '../components/EmailForm'

export default function EmailQRGenerator() {
  // 将表单数据转换为mailto链接格式
  const generateQRData = (formData: { email: string; subject: string; body: string }) => {
    if (!formData.email?.trim()) return ''

    let mailtoLink = `mailto:${formData.email.trim()}`
    const params: string[] = []

    if (formData.subject) {
      params.push(`subject=${encodeURIComponent(formData.subject)}`)
    }

    if (formData.body) {
      params.push(`body=${encodeURIComponent(formData.body)}`)
    }

    if (params.length > 0) {
      mailtoLink += '?' + params.join('&')
    }

    return mailtoLink
  }

  const handleDataChange = (data: string) => {
    console.log('Generated Email QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="email"
        title="Email QR Code Generator"
        description="Create QR codes that open email composition with pre-filled address, subject, and message. Perfect for customer support, feedback collection, and business inquiries."
        placeholder="email@example.com"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
      >
        <EmailForm onChange={() => {}} placeholder="email@example.com" />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for Customer Communication
              </h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Email QR codes make it easy for customers to contact you. Here's how businesses use them:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '📧',
                  title: 'Customer Support',
                  description: 'Add QR codes to product packaging, receipts, or websites for instant customer support access.'
                },
                {
                  icon: '💬',
                  title: 'Feedback Collection',
                  description: 'Pre-fill subject lines like "Product Feedback" to streamline customer feedback collection.'
                },
                {
                  icon: '📋',
                  title: 'Event Registrations',
                  description: 'Use email QR codes at events or in marketing materials to simplify contact and registration processes.'
                }
              ].map((item, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-primary-100 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pro Tips Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-3">
                💡 Pro Tips for Email QR Codes
              </h3>
              <ul className="space-y-4 text-primary-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Use descriptive subjects:</strong> Pre-fill subject lines like "Support Request" or "Order Inquiry" to help organize incoming emails.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Keep messages concise:</strong> Short, clear pre-filled messages work best. Recipients can always edit before sending.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Test on multiple devices:</strong> Email QR codes work with any email app installed on the device, so test across different platforms.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Monitor your inbox:</strong> Be prepared for increased email volume when using email QR codes in marketing materials.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

