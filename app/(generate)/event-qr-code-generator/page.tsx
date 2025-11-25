import { Metadata } from 'next'
import EventQRGenerator from './EventQRGenerator'

export const metadata: Metadata = {
  title: 'Event QR Code Generator - Free Calendar Event QR Code | CustomQR.pro',
  description: 'Generate QR codes for calendar events instantly. Create event QR codes that add to iPhone Calendar, Google Calendar, and Eventbrite. Free event QR code generator for meetings, conferences, and event registration.',
  keywords: 'event qr code generator, qr code event, qr code for event, event qr code, qr code for event registration, eventbrite qr code, calendar event qr code generator, event qr code check in, qr code generator for events, event registration qr code',
  openGraph: {
    title: 'Event QR Code Generator - CustomQR.pro',
    description: 'Generate QR codes for calendar events. Create event QR codes that add to calendars instantly.',
    type: 'website',
  },
  alternates: {
    canonical: '/event-qr-code-generator',
  },
}

export default function EventQRCodeGeneratorPage() {
  return <EventQRGenerator />
}

