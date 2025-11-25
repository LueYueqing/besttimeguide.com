import { Metadata } from 'next'
import BusinessCardQRGenerator from './BusinessCardQRGenerator'

export const metadata: Metadata = {
  title: 'Business Card QR Code Generator - Free Online Tool | CustomQR.pro',
  description: 'Create professional business card QR codes instantly. Share your contact information with one scan. Free, fast, and compatible with all smartphone cameras. Generate vCard QR codes for networking events and meetings.',
  keywords: 'business card qr code generator, vcard qr code, contact qr code generator, business card qr maker, digital business card, qr code for business cards',
  openGraph: {
    title: 'Business Card QR Code Generator - CustomQR.pro',
    description: 'Create professional business card QR codes instantly. Share contact information with one scan.',
    type: 'website',
  },
  alternates: {
    canonical: '/business-card-qr-code-generator',
  },
}

export default function BusinessCardQRCodeGeneratorPage() {
  return <BusinessCardQRGenerator />
}

