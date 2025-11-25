import { Metadata } from 'next'
import SMSQRGenerator from './SMSQRGenerator'

export const metadata: Metadata = {
  title: 'SMS QR Code Generator - Free Online Tool | CustomQR.pro',
  description: 'Create QR codes that open messaging apps instantly. Pre-fill phone number and message. Free SMS QR code generator for marketing, customer support, and instant communication.',
  keywords: 'sms qr code generator, text message qr code, sms qr code maker, messaging qr code, sms qr generator free',
  openGraph: {
    title: 'SMS QR Code Generator - CustomQR.pro',
    description: 'Create QR codes that open messaging apps with pre-filled phone number and message.',
    type: 'website',
  },
  alternates: {
    canonical: '/sms-qr-code-generator',
  },
}

export default function SMSQRCodeGeneratorPage() {
  return <SMSQRGenerator />
}

