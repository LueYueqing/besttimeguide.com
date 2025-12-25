import { MetadataRoute } from 'next'
import { getAppUrl } from '@/lib/app-url'

/**
 * 生成 robots.txt
 * Next.js 15 App Router 会自动处理此文件，生成 /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/auth/',
          '/profile/',
          '/cancel-subscription/',
          '/admin/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

