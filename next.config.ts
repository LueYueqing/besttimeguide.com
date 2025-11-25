/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['customqr.pro', 'lh3.googleusercontent.com', 'lh4.googleusercontent.com', 'lh5.googleusercontent.com', 'lh6.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // experimental: {
  //   optimizeCss: true,
  // },
  output: 'standalone',
}

module.exports = nextConfig
