import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ScanQRWrapper from './scan-wrapper'

export const metadata: Metadata = {
  title: 'How to Scan QR Code - Free Online QR Code Scanner | CustomQR.pro',
  description: 'Scan QR codes instantly with your device camera, or upload/paste an image. Free online QR code scanner that works in your browser - no app download required. Step-by-step guide to scanning any QR code.',
  keywords: 'how to scan qr code, scan qr code, qr code scanner, online qr scanner, free qr scanner, qr code reader, how to read qr code',
  openGraph: {
    title: 'How to Scan QR Code - Free Online Scanner',
    description: 'Learn how to scan any QR code instantly with your device camera. No app download required.',
    type: 'website',
  },
}

export default function ScanQRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />
      <ScanQRWrapper />
      <Footer variant="full" />
    </div>
  )
}

