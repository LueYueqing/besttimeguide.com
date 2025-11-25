'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import WhatsAppForm from '../components/WhatsAppForm'

export default function WhatsAppQRGenerator() {
  // 将表单数据转换为WhatsApp链接格式
  // 格式: https://wa.me/phone_number?text=message
  const generateQRData = (formData: { phone: string; message: string }) => {
    if (!formData.phone?.trim()) return ''

    // 清理电话号码（只保留数字）
    const cleanPhone = formData.phone.trim().replace(/\D/g, '')
    
    if (!cleanPhone || cleanPhone.length < 7) return ''
    
    // WhatsApp链接格式
    let whatsappLink = `https://wa.me/${cleanPhone}`
    
    // 如果有消息，添加text参数
    if (formData.message?.trim()) {
      const encodedMessage = encodeURIComponent(formData.message.trim())
      whatsappLink += `?text=${encodedMessage}`
    }
    
    return whatsappLink
  }

  const handleDataChange = (data: string) => {
    console.log('Generated WhatsApp QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="whatsapp"
        title="WhatsApp QR Code Generator"
        description="Create QR codes for WhatsApp instantly. Generate a WhatsApp QR code that opens a chat with pre-filled number and message. Free WhatsApp QR code generator for business, marketing, and personal use."
        placeholder="+1-555-123-4567"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
      >
        <WhatsAppForm onChange={() => {}} placeholder="+1-555-123-4567" />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for WhatsApp Communication
              </h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                WhatsApp QR codes enable instant messaging. Generate a QR code for WhatsApp and let customers start chatting with one scan. Our WhatsApp QR code generator makes it easy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '💬',
                  title: 'Customer Support',
                  description: 'Create WhatsApp QR codes for customer service. Display QR codes for WhatsApp on your website or storefront for instant support access.'
                },
                {
                  icon: '📱',
                  title: 'Marketing Campaigns',
                  description: 'Add WhatsApp QR codes to flyers, posters, and ads. Use our QR code generator for WhatsApp to enable direct messaging engagement.'
                },
                {
                  icon: '🤝',
                  title: 'Business Networking',
                  description: 'Share your WhatsApp number easily. Generate WhatsApp QR codes for business cards, email signatures, and social media profiles.'
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
                💡 Why Use a WhatsApp QR Code Generator?
              </h3>
              <ul className="space-y-4 text-primary-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Instant WhatsApp Access:</strong> Generate a QR code for WhatsApp and enable customers to start chatting instantly. A WhatsApp QR code eliminates the need to manually save contacts and type numbers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Universal Compatibility:</strong> Our WhatsApp QR code generator works with all smartphones. Whether users have WhatsApp web QR code or mobile app, they can scan and connect instantly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Pre-filled Messages:</strong> Create WhatsApp QR codes with pre-filled messages for faster communication. Perfect for support requests, inquiries, or group invitations using WhatsApp group QR code features.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Easy Sharing:</strong> Use our free WhatsApp QR code generator to create codes you can share via email, text, social media, or print materials. Works seamlessly with WhatsApp web and mobile.</span>
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
                💡 Pro Tips for WhatsApp QR Codes
              </h3>
              <ul className="space-y-4 text-neutral-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Include country code:</strong> Always use international format (+1 for USA, +44 for UK) when generating WhatsApp QR codes. This ensures your QR code for WhatsApp works worldwide.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Pre-fill helpful messages:</strong> Add context like "Support Request" or "Order Inquiry" to make it easier for customers to start conversations with your WhatsApp QR code.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Test before sharing:</strong> Always test your WhatsApp QR code generator output with your smartphone camera. Ensure it opens WhatsApp correctly before printing or sharing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>High-quality printing:</strong> Use high-resolution output from our WhatsApp QR code generator. Clear, sharp QR codes scan more reliably, especially for WhatsApp web QR code scanning.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

