import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /{key}.txt
 * IndexNow验证文件
 * 当搜索引擎访问 https://yourdomain.com/{key}.txt 时返回密钥
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const { key } = params
  const indexNowKey = process.env.INDEXNOW_KEY

  // 如果未配置密钥，返回404
  if (!indexNowKey) {
    return NextResponse.json(
      { error: 'IndexNow key not configured' },
      { status: 404 }
    )
  }

  // 验证请求的密钥是否匹配
  if (key !== indexNowKey) {
    return NextResponse.json(
      { error: 'Key not found' },
      { status: 404 }
    )
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
