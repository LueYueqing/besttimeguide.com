import { MetadataRoute } from 'next'
// import { prisma } from '@/lib/db' // 如果使用 Prisma，取消注释并配置数据库连接

/**
 * 动态生成 sitemap.xml
 * Next.js 15 App Router 会自动处理此文件，生成 /sitemap.xml
 * 
 * 参考文档: docs/12-动态Sitemap最佳实践.md
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const currentDate = new Date()

  // 静态页面配置
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tutorials`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs/api`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // 动态页面：从数据库获取博客文章
  let blogPages: MetadataRoute.Sitemap = []
  try {
    // 如果使用 Prisma，可以从数据库获取博客文章
    // const posts = await prisma.post.findMany({
    //   where: { published: true },
    //   select: { slug: true, updatedAt: true },
    // })
    // blogPages = posts.map((post) => ({
    //   url: `${baseUrl}/blog/${post.slug}`,
    //   lastModified: post.updatedAt,
    //   changeFrequency: 'weekly',
    //   priority: 0.7,
    // }))
  } catch (error) {
    // 如果数据库未配置或查询失败，静默处理
    console.warn('Failed to fetch blog posts for sitemap:', error)
  }

  // 合并所有页面
  return [...staticPages, ...blogPages]
}

