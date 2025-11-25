import type { Metadata } from 'next'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

interface QRGenerateLayoutProps {
  children: React.ReactNode
}

export default function QRGenerateLayout({ children }: QRGenerateLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />
      
      {/* 主要内容区域 */}
      <main>
        {children}
      </main>
      
      <Footer variant="full" />
    </div>
  )
}
