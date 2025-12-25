/**
 * 获取应用的基础URL
 * 优先级：
 * 1. NEXT_PUBLIC_APP_URL 环境变量
 * 2. VERCEL_URL（如果在 Vercel 上部署）
 * 3. 生产环境使用生产域名
 * 4. 开发环境使用 localhost
 */
export function getAppUrl(): string {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // 如果在 Vercel 上，使用 VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 生产环境使用生产域名
  if (process.env.NODE_ENV === 'production') {
    return 'https://besttimeguide.com'
  }

  // 开发环境使用 localhost
  return 'http://localhost:3000'
}

