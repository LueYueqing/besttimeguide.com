import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'CustomQR.pro - Professional Custom QR Code Generator',
  description: 'Create professional custom QR codes with advanced design options. Generate branded QR codes with logos, colors, and analytics. Free QR generator with enterprise features.',
  keywords: 'custom qr code generator, qr code with logo, professional qr codes, free qr generator, dynamic qr codes, qr code analytics, branded qr codes',
  authors: [{ name: 'CustomQR.pro Team' }],
  creator: 'CustomQR.pro',
  publisher: 'CustomQR.pro',
  metadataBase: new URL('https://customqr.pro'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://customqr.pro',
    siteName: 'CustomQR.pro',
    title: 'CustomQR.pro - Professional Custom QR Code Generator',
    description: 'Create professional custom QR codes with advanced design options. Generate branded QR codes with logos, colors, and analytics.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CustomQR.pro - Professional QR Code Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CustomQR.pro - Professional Custom QR Code Generator',
    description: 'Create professional custom QR codes with advanced design options.',
    images: ['/og-image.png'],
    creator: '@customqrpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Font Awesome for icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        
        {/* Favicon and PWA icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme and app configuration */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CustomQR.pro" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="CustomQR.pro" />
      </head>
      <body className="font-sans antialiased bg-neutral-50 text-neutral-700">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
