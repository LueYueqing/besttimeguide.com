'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import LocationForm from '../components/LocationForm'

export default function LocationQRGenerator() {
  // 将表单数据转换为GPS位置链接格式
  // 使用Google Maps链接格式，兼容性最好
  const generateQRData = (formData: { latitude: string; longitude: string; name?: string }) => {
    if (!formData.latitude?.trim() || !formData.longitude?.trim()) return ''

    const lat = parseFloat(formData.latitude.trim())
    const lng = parseFloat(formData.longitude.trim())

    if (isNaN(lat) || isNaN(lng)) return ''
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return ''

    // Google Maps链接格式（最佳兼容性）
    let locationLink = `https://maps.google.com/?q=${lat},${lng}`
    
    // 如果有位置名称，添加到查询参数
    if (formData.name?.trim()) {
      locationLink += `&q=${encodeURIComponent(formData.name.trim())}`
    }
    
    return locationLink
  }

  const handleDataChange = (data: string) => {
    console.log('Generated Location QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="location"
        title="Location QR Code Generator"
        description="Generate QR codes for GPS locations. Create a location QR code that opens Google Maps instantly. Free location QR code generator for addresses, businesses, events, and any geographic coordinates."
        placeholder="Enter coordinates or use current location"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
      >
        <LocationForm onChange={() => {}} />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for Sharing Locations
              </h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Location QR codes make it easy to share GPS coordinates and addresses. Generate a QR code for location and enable one-tap navigation from any smartphone. Our location QR code generator works with Google Maps and all navigation apps.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '📍',
                  title: 'Business Addresses',
                  description: 'Create location QR codes for your business. Add QR codes for location to business cards, flyers, and marketing materials. Customers can get directions instantly with a location QR code generator.'
                },
                {
                  icon: '🎉',
                  title: 'Event Venues',
                  description: 'Share event locations easily. Generate QR codes for GPS location to help attendees find your venue. Use our location QR code generator free for events, weddings, and gatherings.'
                },
                {
                  icon: '🗺️',
                  title: 'Google Maps Integration',
                  description: 'Our QR code generator for Google Maps location ensures perfect compatibility. Generate a QR code for Google map location that opens directly in Google Maps on any device.'
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
                💡 Why Use a Location QR Code Generator?
              </h3>
              <ul className="space-y-4 text-primary-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Instant Navigation:</strong> Generate a QR code for location and enable customers to get directions instantly. A location QR code eliminates the need to manually type addresses or GPS coordinates.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Google Maps Compatible:</strong> Our QR code generator for location creates codes that open in Google Maps, Apple Maps, and all navigation apps. Perfect for creating QR codes for Google map location and GPS coordinates.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Easy Sharing:</strong> Create location QR codes for business addresses, event venues, or any GPS location. Use our location QR code generator free to share coordinates via email, print, or digital media.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>GPS Precision:</strong> Generate QR codes for GPS location with exact coordinates. Our location QR code generator ensures accurate navigation to your specified latitude and longitude.</span>
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
                💡 Pro Tips for Location QR Codes
              </h3>
              <ul className="space-y-4 text-neutral-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Use decimal degrees format:</strong> When creating a QR code for location, use decimal degrees (e.g., 40.7128, -74.0060) rather than degrees/minutes/seconds for best compatibility.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Add location name:</strong> Include a name when using our location QR code generator. This helps identify the location when the QR code for Google Maps location opens.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Test before sharing:</strong> Always test your location QR code with your smartphone. Ensure it opens Google Maps correctly with the right coordinates from our QR code generator for location.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>High precision:</strong> Use at least 4-6 decimal places for accurate GPS coordinates. Our location QR code generator supports precise coordinates for exact navigation.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

