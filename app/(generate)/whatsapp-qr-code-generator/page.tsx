import { Metadata } from 'next'
import WhatsAppQRGenerator from './WhatsAppQRGenerator'

export const metadata: Metadata = {
  title: 'WhatsApp QR Code Generator - Free Online Tool | CustomQR.pro',
  description: 'Generate WhatsApp QR codes instantly. Create a QR code for WhatsApp that opens chat with pre-filled number and message. Free WhatsApp QR code generator - works with WhatsApp web and mobile app.',
  keywords: 'whatsapp qr code generator, whatsapp qr code, qr code for whatsapp, whatsapp web qr code, qr code generator for whatsapp, whatsapp group qr code, qr code to whatsapp, whatsapp number qr code, free whatsapp qr code generator',
  openGraph: {
    title: 'WhatsApp QR Code Generator - CustomQR.pro',
    description: 'Generate WhatsApp QR codes that open chat instantly. Free QR code generator for WhatsApp.',
    type: 'website',
  },
  alternates: {
    canonical: '/whatsapp-qr-code-generator',
  },
}

export default function WhatsAppQRCodeGeneratorPage() {
  return <WhatsAppQRGenerator />
}

