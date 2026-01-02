import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 中间件 - 处理特殊路由
 * 主要是为了支持 IndexNow 验证文件（/{key}.txt）
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否是 .txt 文件请求（用于 IndexNow 验证）
  if (pathname.endsWith('.txt')) {
    const key = pathname.slice(1, -4) // 移除开头的 / 和末尾的 .txt
    const indexNowKey = process.env.INDEXNOW_KEY

    if (indexNowKey && key === indexNowKey) {
      // 返回纯文本密钥
      return new NextResponse(indexNowKey, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }
  }

  // 其他请求继续正常处理
  return NextResponse.next()
}

/**
 * 配置中间件匹配的路径
 * 匹配所有路径，但我们只对 .txt 文件特殊处理
 */
export const config = {
  matcher: [
    // 匹配所有路径（除了 API 路由、静态文件等）
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
