import { Metadata } from 'next'
import PhoneQRGenerator from './PhoneQRGenerator'

export const metadata: Metadata = {
  title: 'Phone Number QR Code Generator - Free Online Tool | CustomQR.pro',
  description: 'Generate QR codes for phone numbers instantly. Create a phone number QR code that opens the dialer with one tap. Free QR code generator for phone number - works with iPhone, Android, and all smartphones.',
  keywords: 'phone number qr code generator, qr code generator phone number, phone number qr code, qr code to phone number, qr code generator for phone number, qr code to call phone number, phone qr code generator',
  openGraph: {
    title: 'Phone Number QR Code Generator - CustomQR.pro',
    description: 'Generate QR codes for phone numbers. Create a QR code that opens the phone dialer instantly.',
    type: 'website',
  },
  alternates: {
    canonical: '/phone-number-qr-code-generator',
  },
}

export default function PhoneNumberQRCodeGeneratorPage() {
  return <PhoneQRGenerator />
}

