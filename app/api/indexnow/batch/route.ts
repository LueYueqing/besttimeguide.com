import { NextRequest, NextResponse } from 'next/server'
import { submitBatchToIndexNow } from '@/lib/indexnow'

/**
 * POST /api/indexnow/batch
 * 批量提交多个URL到IndexNow
 * 
 * Body:
 * {
 *   "urls": [
 *     "https://yourdomain.com/article/slug1",
 *     "https://yourdomain.com/article/slug2"
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { success: false, error: 'URLs array is required' },
        { status: 400 }
      )
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URLs array cannot be empty' },
        { status: 400 }
      )
    }

    // 验证每个URL格式
    for (const url of urls) {
      try {
        new URL(url)
      } catch {
        return NextResponse.json(
          { success: false, error: `Invalid URL format: ${url}` },
          { status: 400 }
        )
      }
    }

    const result = await submitBatchToIndexNow(urls)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[IndexNow Batch API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
