'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import PhoneForm from '../components/PhoneForm'

export default function PhoneQRGenerator() {
  // 将表单数据转换为tel链接格式
  const generateQRData = (formData: { phone: string; name?: string }) => {
    if (!formData.phone?.trim()) return ''

    // 清理电话号码（只保留数字和+号）
    const cleanPhone = formData.phone.trim().replace(/\s/g, '')
    
    // tel: 协议格式
    return `tel:${cleanPhone}`
  }

  const handleDataChange = (data: string) => {
    console.log('Generated Phone QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="phone"
        title="Phone Number QR Code Generator"
        description="Create QR codes for phone numbers. Generate a phone number QR code that opens the dialer instantly. Perfect for business cards, flyers, and contact sharing."
        placeholder="+1-555-123-4567"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
      >
        <PhoneForm onChange={() => {}} placeholder="+1-555-123-4567" />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for Instant Calling
              </h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Phone number QR codes make it easy for customers to call you. Generate a QR code to phone number and enable one-tap calling from any smartphone.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '📞',
                  title: 'Business Cards & Flyers',
                  description: 'Add phone number QR codes to business cards, flyers, and marketing materials. Customers can call you instantly with a single scan.'
                },
                {
                  icon: '🏢',
                  title: 'Customer Support',
                  description: 'Display phone QR codes on your website, storefront, or support pages. Make it easy for customers to reach your support team.'
                },
                {
                  icon: '📱',
                  title: 'One-Tap Calling',
                  description: 'QR code to phone number allows direct calling without typing. Works with iPhone, Android, and all smartphone cameras.'
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

      {/* SEO关键词优化区域 - 自然地融入相关关键词 */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-3">
                💡 Why Use a Phone Number QR Code Generator?
              </h3>
              <ul className="space-y-4 text-primary-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Instant Connection:</strong> Generate a QR code for phone number and enable customers to call you directly without manual dialing. A phone number QR code eliminates typing errors and saves time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Universal Compatibility:</strong> Our QR code generator for phone number works with all smartphones. The QR code to phone number format (tel:) is supported by iOS, Android, and all modern devices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Professional Image:</strong> Using a phone number QR code shows you\'re modern and tech-savvy. Perfect for business cards, flyers, restaurant menus, and store displays.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Easy Sharing:</strong> Create a QR code to call phone number and share via email, text, or print. No apps required - standard smartphone cameras can scan instantly.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Tips Section */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-neutral-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                💡 Pro Tips for Phone Number QR Codes
              </h3>
              <ul className="space-y-4 text-neutral-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Include country code:</strong> Use international format (+1 for USA, +44 for UK) to ensure the QR code to phone number works worldwide.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Test before printing:</strong> Always test your phone number QR code generator output with your smartphone camera before printing business cards or flyers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>High contrast:</strong> Ensure good contrast between the QR code and background for reliable scanning in various lighting conditions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Print quality:</strong> Use high-resolution printing for your phone number QR code. Blurry codes may fail to scan properly.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

