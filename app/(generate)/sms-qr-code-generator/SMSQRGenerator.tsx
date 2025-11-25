'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import SMSForm from '../components/SMSForm'

export default function SMSQRGenerator() {
  // 将表单数据转换为SMS链接格式
  // 使用 SMSTO: 格式，兼容性更好
  const generateQRData = (formData: { phone: string; message: string }) => {
    if (!formData.phone?.trim()) return ''

    // 清理电话号码（只保留数字和+号）
    const cleanPhone = formData.phone.trim().replace(/\s/g, '')
    
    // 如果有消息，使用 SMSTO: 格式；否则使用 sms: 格式
    if (formData.message?.trim()) {
      return `SMSTO:${cleanPhone}:${formData.message.trim()}`
    } else {
      return `sms:${cleanPhone}`
    }
  }

  const handleDataChange = (data: string) => {
    console.log('Generated SMS QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="sms"
        title="SMS QR Code Generator"
        description="Create QR codes that open messaging apps with pre-filled phone number and message. Perfect for quick communication, marketing campaigns, and customer contact."
        placeholder="+1-555-123-4567"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
      >
        <SMSForm onChange={() => {}} placeholder="+1-555-123-4567" />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for Instant Communication
              </h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                SMS QR codes enable instant texting with one scan. Here's how businesses and individuals use them:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '📱',
                  title: 'Marketing Campaigns',
                  description: 'Add SMS QR codes to flyers, posters, or business cards to enable instant customer contact and engagement.'
                },
                {
                  icon: '💬',
                  title: 'Customer Support',
                  description: 'Provide quick support access through SMS. Pre-fill messages like "I need help with my order" for faster responses.'
                },
                {
                  icon: '🎯',
                  title: 'Event Check-ins',
                  description: 'Use SMS QR codes at events for quick registration, feedback, or contact collection without app downloads.'
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
                💡 Pro Tips for SMS QR Codes
              </h3>
              <ul className="space-y-4 text-primary-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Include country code:</strong> Use international format (+1 for USA, +44 for UK) to ensure compatibility across devices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Pre-fill helpful messages:</strong> Add context like "Support Request" or "Order Inquiry" to streamline communication.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Test on different devices:</strong> SMS QR codes work with any messaging app (iMessage, WhatsApp, SMS) depending on the device.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Keep messages short:</strong> SMS has a 160-character limit per message. Keep pre-filled messages concise.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

