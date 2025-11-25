'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import WiFiForm from '../components/WiFiForm'
import Image from 'next/image'

export default function WiFiQRGenerator() {
  const generateQRData = (formData: { ssid: string; password: string; security: string; hidden: boolean }) => {
    if (!formData.ssid) return ''
    
    // WiFi QR码格式: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
    const security = formData.security === 'nopass' ? 'nopass' : formData.security
    const hidden = formData.hidden ? 'true' : 'false'
    
    return `WIFI:T:${security};S:${formData.ssid};P:${formData.password};H:${hidden};;`
  }

  const handleDataChange = (data: string) => {
    console.log('Generated WiFi QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="wifi"
        title="WiFi QR Code Generator"
        description="Create a QR code for your WiFi network. Guests can scan and connect automatically without typing passwords."
        placeholder="MyWiFiNetwork"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
        previewFooter={
          <div className="card p-0 overflow-hidden rounded-2xl">
            <div className="relative w-full h-[180px] lg:h-[200px]">
              <Image
                src="/images/generators/wifi-qr-generator-hero.jpg"
                alt="WiFi QR Code Generator"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
            </div>
          </div>
        }
      >
        <WiFiForm onChange={(data) => handleDataChange(generateQRData(data))} placeholder="MyWiFiNetwork" />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for Every WiFi Sharing Need
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                WiFi QR codes eliminate the hassle of sharing complex passwords. Here's how you can use them:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '🏠',
                  title: 'Home Networks',
                  description: 'Share your home WiFi with guests, friends, and family members instantly.'
                },
                {
                  icon: '🏢',
                  title: 'Office & Coworking',
                  description: 'Provide secure WiFi access to employees, clients, and visitors.'
                },
                {
                  icon: '☕',
                  title: 'Cafes & Restaurants',
                  description: 'Display WiFi QR codes on tables, menus, or walls for customer convenience.'
                },
                {
                  icon: '🏨',
                  title: 'Hotels & Airbnb',
                  description: 'Simplify guest check-in with instant WiFi access via QR code.'
                },
                {
                  icon: '🎉',
                  title: 'Events & Parties',
                  description: 'Let event attendees connect to WiFi without interrupting the host.'
                },
                {
                  icon: '🏥',
                  title: 'Waiting Rooms',
                  description: 'Provide WiFi access in medical offices, salons, and service centers.'
                }
              ].map((useCase, index) => (
                <div key={index} className="card p-6 bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{useCase.title}</h3>
                  <p className="text-primary-200">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO内容区域 */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
              How to Create WiFi QR Codes: Complete Guide
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Why Use WiFi QR Codes?</h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>No Password Typing:</strong> Eliminate spelling errors and frustration
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>Instant Connection:</strong> Guests connect in seconds, not minutes
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>Universal Compatibility:</strong> Works on all modern smartphones
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>Enhanced Security:</strong> No need to verbally share passwords
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-500 mt-1">•</span>
                    <div>
                      <strong>Professional Image:</strong> Modern, tech-savvy approach to hospitality
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Security Best Practices</h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Use WPA2/WPA3 encryption for maximum security</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Create strong, unique passwords (12+ characters)</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Regularly update your WiFi password</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Only share QR codes with trusted individuals</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-success-500 mt-1">✓</span>
                    <div>Consider guest networks for temporary access</div>
                  </li>
                </ul>
              </div>
            </div>

            {/* 步骤指南 */}
            <div className="card p-8 mb-12">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
                4 Simple Steps to Create Your WiFi QR Code
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: '1',
                    title: 'Enter Details',
                    description: 'Input your WiFi network name (SSID) and password'
                  },
                  {
                    step: '2', 
                    title: 'Select Security',
                    description: 'Choose your network security type (WPA, WEP, or Open)'
                  },
                  {
                    step: '3',
                    title: 'Generate Code',
                    description: 'Click generate to create your WiFi QR code instantly'
                  },
                  {
                    step: '4',
                    title: 'Share & Print',
                    description: 'Download and display for guests to scan and connect'
                  }
                ].map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    <h4 className="font-bold text-neutral-900 mb-2">{step.title}</h4>
                    <p className="text-neutral-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 兼容性信息 */}
            <div className="card p-8 mb-12 bg-gradient-to-br from-success-50 to-success-100">
              <h3 className="text-2xl font-bold text-success-900 mb-6 text-center">
                📱 Device Compatibility
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    platform: 'iOS',
                    version: 'iOS 11+',
                    support: 'Native camera app support',
                    icon: '📱'
                  },
                  {
                    platform: 'Android',
                    version: 'Android 10+',
                    support: 'Built-in QR scanner',
                    icon: '🤖'
                  },
                  {
                    platform: 'Samsung',
                    version: 'One UI 2.0+',
                    support: 'Samsung Camera app',
                    icon: '📲'
                  },
                  {
                    platform: 'Google Pixel',
                    version: 'All versions',
                    support: 'Google Camera app',
                    icon: '📸'
                  }
                ].map((device, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-3">{device.icon}</div>
                    <h4 className="font-bold text-success-900 mb-1">{device.platform}</h4>
                    <p className="text-sm text-success-800 mb-1">{device.version}</p>
                    <p className="text-xs text-success-700">{device.support}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ部分 */}
            <div className="card p-8 mb-12">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                {[
                  {
                    question: 'Do WiFi QR codes work on all devices?',
                    answer: 'Yes! WiFi QR codes work on all modern smartphones (iOS 11+, Android 10+). Users simply open their camera app and point it at the QR code to connect automatically.'
                  },
                  {
                    question: 'Is it safe to share my WiFi password via QR code?',
                    answer: 'WiFi QR codes are as secure as sharing your password verbally. Only share with trusted individuals and consider using a guest network for temporary access.'
                  },
                  {
                    question: 'What if my WiFi network is hidden?',
                    answer: 'No problem! Our generator supports hidden networks. Just check the "Hidden Network" option when creating your QR code.'
                  },
                  {
                    question: 'Can I create QR codes for guest networks?',
                    answer: 'Absolutely! Guest networks are perfect for WiFi QR codes. They provide temporary access without compromising your main network security.'
                  },
                  {
                    question: 'What security types are supported?',
                    answer: 'We support all common security types: WPA/WPA2 (most common), WEP (legacy), and Open networks (not recommended for security reasons).'
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-neutral-200 pb-4 last:border-b-0">
                    <h4 className="font-semibold text-neutral-900 mb-2">{faq.question}</h4>
                    <p className="text-neutral-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA区域 */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-primary-900 mb-4">
                📶 Ready to Share Your WiFi?
              </h3>
              <p className="text-primary-800 mb-6 max-w-2xl mx-auto">
                Create your WiFi QR code now and make connecting to your network effortless for guests. 
                Our generator supports all security types and creates high-quality codes suitable for 
                printing or digital display.
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <span>📶</span>
                Create WiFi QR Code Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
