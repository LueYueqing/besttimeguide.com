import { Metadata } from 'next'
import EmailQRGenerator from './EmailQRGenerator'

export const metadata: Metadata = {
  title: 'Email QR Code Generator - Free Online Tool | CustomQR.pro',
  description: 'Create QR codes that open email composition instantly. Pre-fill recipient, subject, and message. Free email QR code generator for customer support and business communication.',
  keywords: 'email qr code generator, mailto qr code, email qr code maker, contact qr code, email qr generator free',
  openGraph: {
    title: 'Email QR Code Generator - CustomQR.pro',
    description: 'Create QR codes that open email composition with pre-filled information.',
    type: 'website',
  },
  alternates: {
    canonical: '/email-qr-code-generator',
  },
}

export default function EmailQRCodeGeneratorPage() {
  return <EmailQRGenerator />
}

