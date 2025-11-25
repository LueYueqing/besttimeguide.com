import { Metadata } from 'next'
import LocationQRGenerator from './LocationQRGenerator'

export const metadata: Metadata = {
  title: 'Location QR Code Generator - Free GPS Location QR Code | CustomQR.pro',
  description: 'Generate QR codes for GPS locations instantly. Create a location QR code that opens Google Maps with one scan. Free location QR code generator for addresses, coordinates, and map locations.',
  keywords: 'location qr code generator, qr code generator for location, location qr code, qr code for location, qr code for google map location, location qr code generator free, qr code generator for gps location, google map location qr code generator, qr code generator location',
  openGraph: {
    title: 'Location QR Code Generator - CustomQR.pro',
    description: 'Generate QR codes for GPS locations. Create QR codes that open Google Maps instantly.',
    type: 'website',
  },
  alternates: {
    canonical: '/location-qr-code-generator',
  },
}

export default function LocationQRCodeGeneratorPage() {
  return <LocationQRGenerator />
}

