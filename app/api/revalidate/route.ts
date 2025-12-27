import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

// 用于触发页面重新生成的 API
// 使用方法: 
//   POST /api/revalidate?path=/best-time-to-water-grass&secret=xxx
//   GET /api/revalidate?path=/best-time-to-water-grass&secret=xxx (浏览器访问)
// 或者: 
//   POST /api/revalidate?tag=articles&secret=xxx
//   GET /api/revalidate?tag=articles&secret=xxx (浏览器访问)
export async function POST(request: NextRequest) {
  return handleRevalidate(request)
}

// 支持 GET 方法，方便在浏览器中直接访问
export async function GET(request: NextRequest) {
  return handleRevalidate(request)
}

async function handleRevalidate(request: NextRequest) {
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
      // 注意：对于动态路由 [slug]，revalidatePath 可能不会立即生效
      // 如果设置了 revalidate = false，建议优先使用 revalidateTag
      try {
        revalidatePath(path, 'page')
        // 同时清除该路径的布局缓存
        revalidatePath(path, 'layout')
        console.log(`[Revalidate] Revalidated path: ${path}`)
      } catch (error) {
        console.warn(`[Revalidate] Path revalidation may not work for dynamic routes: ${path}`, error)
      }
      
      // 对于动态路由，尝试通过 tag 重新验证（更可靠）
      // 从路径中提取 slug（例如：/best-time-to-go-to-japan -> best-time-to-go-to-japan）
      const slug = path.replace(/^\//, '').replace(/\/$/, '')
      if (slug && !slug.includes('/')) {
        try {
          revalidateTag(`article-${slug}`)
          console.log(`[Revalidate] Also revalidated tag: article-${slug}`)
        } catch (error) {
          console.warn(`[Revalidate] Tag revalidation failed for: article-${slug}`, error)
        }
      }
      
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

