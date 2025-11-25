import type { Metadata } from 'next'
import URLQRGenerator from './URLQRGenerator'

// 基于真实关键词数据: "url qr code generator" - 1,900搜索量, $2.4 CPC

// 基于真实关键词数据: "url qr code generator" - 1,900搜索量, $2.4 CPC
export const metadata: Metadata = {
  title: 'URL QR Code Generator - Create QR Codes for Any Website | CustomQR.pro',
  description: 'Generate QR codes for URLs instantly. Perfect for business cards, marketing materials, and sharing website links. Free URL QR code generator with custom design options.',
  keywords: 'url qr code generator, website qr code, link qr code, qr code for url, create url qr code',
  openGraph: {
    title: 'URL QR Code Generator - Free & Instant',
    description: 'Create QR codes for any website URL. High-quality, customizable, and perfect for business use.',
    type: 'website',
  }
}

export default function URLQRGeneratorPage() {
  return <URLQRGenerator />
}
