import { Metadata } from 'next'
import WiFiQRGenerator from './WiFiQRGenerator'

export const metadata: Metadata = {
  title: 'WiFi QR Code Generator - Share WiFi Password Instantly | CustomQR.pro',
  description: 'Create WiFi QR codes to share your wireless network password instantly. No typing required - guests scan and connect automatically. Free WiFi QR generator.',
  keywords: 'wifi qr code generator, wifi password qr code, wireless qr code, share wifi password, wifi qr code maker, connect wifi qr code',
  openGraph: {
    title: 'WiFi QR Code Generator - Share WiFi Password Instantly',
    description: 'Create WiFi QR codes to share your wireless network password instantly. No typing required - guests scan and connect automatically.',
    type: 'website',
    url: 'https://customqr.pro/wifi-qr-code-generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WiFi QR Code Generator - Share WiFi Password Instantly',
    description: 'Create WiFi QR codes to share your wireless network password instantly. No typing required - guests scan and connect automatically.',
  },
  alternates: {
    canonical: 'https://customqr.pro/wifi-qr-code-generator',
  },
}

export default function WiFiQRCodeGeneratorPage() {
  return <WiFiQRGenerator />
}
