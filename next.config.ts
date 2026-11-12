/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Legacy / alternate slugs → primary keyword URLs
      {
        source: '/best-time-to-go-to-thailand',
        destination: '/best-time-to-visit-thailand',
        permanent: true,
      },
      {
        source: '/best-times-to-post-on-tiktok',
        destination: '/best-time-to-post-on-tiktok',
        permanent: true,
      },
      // Template leftover from QR-code product
      {
        source: '/url-qr-code-generator',
        destination: '/help',
        permanent: true,
      },
    ]
  },
  // 优化 SWC 编译器配置，减少不必要的 polyfill
  swcMinify: true,
  compiler: {
    // 移除 console.log（生产环境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
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
}

module.exports = nextConfig
