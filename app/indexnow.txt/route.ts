import { NextResponse } from 'next/server'

/**
 * GET /indexnow.txt
 * IndexNow 验证文件 - 固定文件名版本
 * 当搜索引擎访问 https://yourdomain.com/indexnow.txt 时返回密钥
 */
export async function GET() {
  const indexNowKey = process.env.INDEXNOW_KEY

  // 如果未配置密钥，返回404
  if (!indexNowKey) {
    return new NextResponse('IndexNow key not configured', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  // 返回纯文本格式的密钥
  return new NextResponse(indexNowKey, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // 缓存1小时
    },
  })
}
