'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import TextForm from '../components/TextForm'

export default function TextQRGenerator() {
  const generateQRData = (formData: { text: string }) => {
    return formData.text || ''
  }

  const handleDataChange = (data: string) => {
    // 可以在这里处理数据变化，比如分析、日志等
    console.log('Generated QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="text"
        title="Text QR Code Generator"
        description="Transform any text message into a scannable QR code. Share contact info, notes, or any text content instantly."
        placeholder="Enter your text message"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
      >
        <TextForm onChange={() => {}} placeholder="Enter your text message" />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for Every Use Case
              </h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Text QR codes are versatile and easy to use. Here's how you can leverage them:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '📝',
                  title: 'Share Messages',
                  description: 'Create QR codes for any text message. Perfect for sharing contact information, important notes, or instructions.'
                },
                {
                  icon: '💼',
                  title: 'Business Cards',
                  description: 'Embed contact details in QR codes for easy sharing. Include name, phone, email, and other information.'
                },
                {
                  icon: '📋',
                  title: 'Instructions',
                  description: 'Share step-by-step instructions, WiFi passwords, or any text-based content that needs to be quickly accessible.'
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
                💡 Pro Tips
              </h3>
              <ul className="space-y-4 text-primary-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span>Keep text concise - most phones can scan codes up to 300 characters easily</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span>Use structured text like "Name: John Doe\nEmail: john@example.com" for better readability</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span>Combine with our vCard generator for professional contact sharing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

