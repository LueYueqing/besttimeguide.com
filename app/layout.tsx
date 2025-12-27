import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'
import { getAppUrl } from '@/lib/app-url'

const appUrl = getAppUrl()

export const metadata: Metadata = {
  title: {
    default: 'BestTimeGuide - Find the Best Time for Everything',
    template: '%s | BestTimeGuide',
  },
  description: 'Discover the best time to visit places, post on social media, take supplements, buy products, and more. Expert guides with data-driven insights.',
  keywords: [
    'best time to visit',
    'best time to post on instagram',
    'best time to post on tiktok',
    'best time to travel',
    'when is the best time',
    'travel guide',
    'social media timing',
    'health supplements timing'
  ],
  authors: [{ name: 'BestTimeGuide Team' }],
  creator: 'BestTimeGuide',
  publisher: 'BestTimeGuide',
  metadataBase: new URL(appUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: 'BestTimeGuide',
    title: 'BestTimeGuide - Find the Best Time for Everything',
    description: 'Expert guides on the best time to visit places, post on social media, take supplements, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BestTimeGuide - Find the Best Time for Everything',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BestTimeGuide - Find the Best Time for Everything',
    description: 'Expert guides on the best time to visit places, post on social media, take supplements, and more.',
    images: ['/og-image.png'],
    creator: '@BestTimeGuide',
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
        <meta name="apple-mobile-web-app-title" content="BestTimeGuide" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="BestTimeGuide" />
      </head>
      <body className="font-sans antialiased bg-neutral-50 text-neutral-700">
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SDYSFRPPR2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SDYSFRPPR2');
          `}
        </Script>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
