import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Your App Name - Your app description',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  openGraph: {
    title: 'Your App Name',
    description: 'Your app description',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  alternates: {
    canonical: '/',
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            欢迎使用 Next.js 项目模板
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            这是一个基于实战经验的最佳实践模板
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-background-card border border-border-light rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                🚀 快速开始
              </h2>
              <p className="text-text-secondary">
                基于 Next.js 15 和 React 19，开箱即用
              </p>
            </div>
            <div className="bg-background-card border border-border-light rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                🎨 现代化 UI
              </h2>
              <p className="text-text-secondary">
                集成 Tailwind CSS，快速构建美观界面
              </p>
            </div>
            <div className="bg-background-card border border-border-light rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                🔧 完整配置
              </h2>
              <p className="text-text-secondary">
                包含 Prisma、TypeScript 等完整工具链
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
