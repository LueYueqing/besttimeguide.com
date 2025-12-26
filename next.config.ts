/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // 允许的图片域名，根据实际需要配置
    domains: [
      'lh3.googleusercontent.com', // Google OAuth 头像
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      // 添加你的 CDN 或图片服务域名
      // process.env.NEXT_PUBLIC_IMAGE_DOMAIN?.split(',') || []
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // experimental: {
  //   optimizeCss: true,
  // },
  output: 'standalone',
  async rewrites() {
    return [
      // Rewrite category pages to use clean URLs
      // /health -> /category/health
      {
        source: '/health',
        destination: '/category/health',
      },
      {
        source: '/travel',
        destination: '/category/travel',
      },
      {
        source: '/shopping',
        destination: '/category/shopping',
      },
      {
        source: '/lifestyle',
        destination: '/category/lifestyle',
      },
      {
        source: '/social-media',
        destination: '/category/social-media',
      },
    ]
  },
}

module.exports = nextConfig
