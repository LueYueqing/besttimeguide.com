import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

// 用于触发页面重新生成的 API
// 使用方法: POST /api/revalidate?path=/best-time-to-water-grass
// 或者: POST /api/revalidate?tag=articles
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const tag = searchParams.get('tag')
    const secret = searchParams.get('secret')

    // 验证密钥（可选，但推荐）
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    if (path) {
      // 重新验证特定路径
      revalidatePath(path, 'page')
      // 同时清除该路径的布局缓存
      revalidatePath(path, 'layout')
      console.log(`[Revalidate] Revalidated path: ${path}`)
      return NextResponse.json({
        revalidated: true,
        path,
        now: Date.now(),
      })
    }

    if (tag) {
      // 重新验证特定标签（用于精确清除缓存）
      revalidateTag(tag)
      console.log(`[Revalidate] Revalidated tag: ${tag}`)
      return NextResponse.json({
        revalidated: true,
        tag,
        now: Date.now(),
      })
    }

    return NextResponse.json(
      { error: 'Missing path or tag parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Revalidate] Error:', error)
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    )
  }
}

