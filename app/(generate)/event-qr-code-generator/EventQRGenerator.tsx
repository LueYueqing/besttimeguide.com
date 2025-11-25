'use client'

import QRGeneratorBase from '../components/QRGeneratorBase'
import EventForm from '../components/EventForm'

export default function EventQRGenerator() {
  // 将表单数据转换为iCalendar格式（.ics文件标准）
  // 或者生成Google Calendar链接
  const generateQRData = (formData: {
    title: string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    location: string
    description: string
  }) => {
    if (!formData.title?.trim() || !formData.startDate || !formData.startTime) return ''

    try {
      // 解析日期和时间
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = formData.endDate && formData.endTime 
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : new Date(startDateTime.getTime() + 3600000) // 默认1小时后

      // 格式化日期为UTC (iCalendar格式要求)
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }

      const startDateStr = formatDate(startDateTime)
      const endDateStr = formatDate(endDateTime)

      // 生成iCalendar格式 (RFC 5545标准)
      let ical = 'BEGIN:VCALENDAR\n'
      ical += 'VERSION:2.0\n'
      ical += 'PRODID:-//CustomQR.pro//Event QR Generator//EN\n'
      ical += 'BEGIN:VEVENT\n'
      ical += `DTSTART:${startDateStr}\n`
      ical += `DTEND:${endDateStr}\n`
      ical += `SUMMARY:${formData.title.replace(/[,\\;]/g, ' ')}\n`
      
      if (formData.location?.trim()) {
        ical += `LOCATION:${formData.location.replace(/[,\\;]/g, ' ')}\n`
      }
      
      if (formData.description?.trim()) {
        const desc = formData.description.replace(/[,\\;]/g, ' ').replace(/\n/g, ' ')
        ical += `DESCRIPTION:${desc}\n`
      }
      
      ical += 'END:VEVENT\n'
      ical += 'END:VCALENDAR'

      return ical
    } catch (error) {
      console.error('Event QR generation failed:', error)
      return ''
    }
  }

  const handleDataChange = (data: string) => {
    console.log('Generated Event QR data:', data)
  }

  return (
    <>
      {/* QR生成器主体 */}
      <QRGeneratorBase
        type="event"
        title="Event QR Code Generator"
        description="Create QR codes for calendar events instantly. Generate an event QR code that adds events directly to iPhone Calendar, Google Calendar, and all calendar apps. Free event QR code generator for meetings, birthdays, conferences, and any event."
        placeholder="Enter event details"
        onDataChange={handleDataChange}
        generateQRData={generateQRData}
      >
        <EventForm onChange={() => {}} />
      </QRGeneratorBase>

      {/* 使用场景和SEO内容 */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Perfect for Event Management
              </h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Event QR codes make it easy to share calendar events. Generate QR codes for events and enable one-tap event registration. Our event QR code generator works with Eventbrite, Google Calendar, and all calendar apps.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '📅',
                  title: 'Event Registration',
                  description: 'Create QR codes for event registration that add events directly to calendars. Perfect for conferences, workshops, and meetings. Generate event QR codes with our free event QR code generator.'
                },
                {
                  icon: '🎉',
                  title: 'Eventbrite Integration',
                  description: 'Generate event QR codes compatible with Eventbrite QR code system. Share your Eventbrite event QR code via email, social media, or print materials. Our event QR code generator ensures perfect compatibility.'
                },
                {
                  icon: '📱',
                  title: 'Calendar Sync',
                  description: 'Create calendar event QR codes that sync with iPhone Calendar, Google Calendar, and Outlook. Users can add events with one scan using our event QR code generator.'
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
                💡 Why Use an Event QR Code Generator?
              </h3>
              <ul className="space-y-4 text-primary-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Easy Event Sharing:</strong> Generate QR codes for events and enable attendees to add events to their calendars instantly. Our event QR code generator creates calendar event QR codes compatible with all major calendar apps.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Eventbrite Compatible:</strong> Create Eventbrite QR code compatible formats. Whether you need an Eventbrite QR code for event registration or event check-in, our event QR code generator supports all formats.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>One-Tap Event Registration:</strong> Generate QR codes for event registration that eliminate manual calendar entry. Perfect for event QR code check-in systems and event attendance tracking.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Universal Calendar Support:</strong> Our event QR code generator creates codes that work with iPhone Calendar, Google Calendar, Outlook, and all calendar applications. Generate calendar event QR codes with confidence.</span>
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
                💡 Pro Tips for Event QR Codes
              </h3>
              <ul className="space-y-4 text-neutral-800">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Include all details:</strong> When using our event QR code generator, fill in title, date, time, and location. Complete information helps attendees add events correctly to their calendars.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Test before sharing:</strong> Always test your event QR code with your smartphone calendar app. Ensure it adds the event correctly before printing or sharing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Print quality:</strong> Use high-resolution output from our event QR code generator. Clear codes scan more reliably for event QR code check-in and registration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 text-lg">✓</span>
                  <span><strong>Eventbrite integration:</strong> For Eventbrite events, ensure your event QR code matches Eventbrite QR code format. Our generator supports Eventbrite QR code standards.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

