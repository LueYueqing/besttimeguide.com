import { Metadata } from 'next'
import TextQRGenerator from './TextQRGenerator'

export const metadata: Metadata = {
  title: 'Text QR Code Generator - CustomQR.pro',
  description: 'Generate QR codes for any text content. Share messages, contact info, and notes instantly with our free text QR code generator.',
  keywords: 'text qr code generator, text qr code maker, text to qr code, free text qr code generator',
  openGraph: {
    title: 'Text QR Code Generator - CustomQR.pro',
    description: 'Generate QR codes for any text content instantly',
    type: 'website',
  },
}

export default function TextQRCodeGeneratorPage() {
  return <TextQRGenerator />
}

