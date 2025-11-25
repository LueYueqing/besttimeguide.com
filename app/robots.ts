import { MetadataRoute } from 'next'

/**
 * 生成 robots.txt
 * Next.js 15 App Router 会自动处理此文件，生成 /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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

