'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import BusinessCardForm from '../components/BusinessCardForm'

export default function BusinessCardQRGenerator() {
  // 将表单数据转换为vCard格式
  const generateQRData = (formData: any) => {
    if (!formData.name?.trim()) return ''

    // vCard 3.0 格式
    let vcard = 'BEGIN:VCARD\n'
    vcard += 'VERSION:3.0\n'
    
    // 姓名 (必须字段)
    vcard += `FN:${formData.name || ''}\n`
    
    // 组织
    if (formData.organization) {
      vcard += `ORG:${formData.organization}\n`
    }
    
    // 职位
    if (formData.title) {
      vcard += `TITLE:${formData.title}\n`
    }
    
    // 电话
    if (formData.phone) {
      vcard += `TEL:${formData.phone}\n`
    }
    
    // 邮箱
    if (formData.email) {
      vcard += `EMAIL:${formData.email}\n`
    }
    
    // 网址
    if (formData.website) {
      let website = formData.website.trim()
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        website = `https://${website}`
      }
      vcard += `URL:${website}\n`
    }
    
    // 地址 (ADR格式: ;;Street;City;State;ZIP;Country)
    if (formData.address || formData.city || formData.state || formData.zip || formData.country) {
      const addressParts = [
        '', // Post Office Box
        '', // Extended Address
        formData.address || '', // Street Address
        formData.city || '', // City
        formData.state || '', // State
        formData.zip || '', // ZIP
        formData.country || '' // Country
      ]
      vcard += `ADR:${addressParts.join(';')}\n`
    }
    
    vcard += 'END:VCARD'
    
    return vcard
  }

  const handleDataChange = (data: string) => {
    // 可以在这里处理数据变化，比如分析、日志等
    console.log('Generated vCard QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="vcard"
        title="Business Card QR Code Generator"
        description="Create professional QR codes for business cards. Share your contact information instantly. Compatible with all smartphone cameras."
        placeholder="Enter your business card information"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
      >
        <BusinessCardForm onChange={() => {}} />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for Business Networking
              </h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Business card QR codes make sharing contact information effortless. Here's how professionals use them:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '💼',
                  title: 'Networking Events',
                  description: 'Share your contact details instantly at conferences, trade shows, and business meetings. No need to manually exchange cards.'
                },
                {
                  icon: '📱',
                  title: 'One-Click Save',
                  description: 'Recipients can save your contact information directly to their phone with a single scan. Compatible with iPhone and Android cameras.'
                },
                {
                  icon: '🎯',
                  title: 'Professional Image',
                  description: 'Show you\'re tech-savvy and modern. Business card QR codes are increasingly expected in professional settings.'
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
                💡 Pro Tips for Business Cards
              </h3>
              <ul className="space-y-4 text-primary-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Test before printing:</strong> Always test your QR code with your smartphone camera to ensure it works correctly before printing your business cards.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Keep it simple:</strong> Essential information (name, phone, email) is enough. Too much detail can make the QR code harder to scan.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>High contrast:</strong> Use dark QR codes on light backgrounds (or vice versa) for best scanning results, even in various lighting conditions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Print quality:</strong> Ensure your printer produces sharp, clear QR codes. Blurry codes may not scan properly.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

