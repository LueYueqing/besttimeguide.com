import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import URLQRGenerator from './(generate)/url-qr-code-generator/URLQRGenerator'

// 首页使用URL生成器，但SEO metadata更通用
export const metadata: Metadata = {
  title: 'Free QR Code Generator - Create QR Codes Instantly | CustomQR.pro',
  description: 'Create unlimited QR codes for URLs, text, WiFi, and more - completely free with no registration required. Professional QR code generator with custom designs, frames, and multiple formats.',
  keywords: 'qr code generator, free qr code, qr code maker, create qr code, qr code creator, url qr code, text qr code, wifi qr code',
  openGraph: {
    title: 'Free QR Code Generator - CustomQR.pro',
    description: 'Create unlimited QR codes instantly. Free, no registration required. Professional designs with custom frames and colors.',
    type: 'website',
    url: 'https://customqr.pro',
  },
  alternates: {
    canonical: 'https://customqr.pro',
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />
      <URLQRGenerator showTrustSection={true} showSEOContent={false} />
    </div>
  )
}
