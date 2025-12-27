/**
 * 手动重新验证文章页面（清除缓存）
 * 使用方法: node scripts/revalidate-article-by-slug.js <slug>
 * 例如: node scripts/revalidate-article-by-slug.js best-time-to-go-to-japan
 */

require('dotenv').config()

const slug = process.argv[2]

if (!slug) {
  console.error('请提供文章 slug')
  console.log('使用方法: node scripts/revalidate-article-by-slug.js <slug>')
  console.log('例如: node scripts/revalidate-article-by-slug.js best-time-to-go-to-japan')
  process.exit(1)
}

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || ''

async function revalidateArticle() {
  try {
    console.log(`\n🔄 正在重新验证文章: ${slug}\n`)

    // 方法1: 通过 cache tag 重新验证（最可靠，优先使用）
    const tagUrl = `${NEXTAUTH_URL}/api/revalidate?tag=article-${slug}&secret=${REVALIDATE_SECRET}`
    console.log(`📡 请求 URL: ${tagUrl.replace(REVALIDATE_SECRET, '***')}`)
    
    const tagResponse = await fetch(tagUrl, { method: 'POST' })
    const tagResult = await tagResponse.json()
    
    if (tagResponse.ok) {
      console.log('✅ 标签重新验证成功:', tagResult)
    } else {
      console.log('⚠️  标签重新验证失败:', tagResult)
    }

    // 方法2: 通过路径重新验证（作为备用，可能对动态路由不立即生效）
    const revalidateUrl = `${NEXTAUTH_URL}/api/revalidate?path=/${slug}&secret=${REVALIDATE_SECRET}`
    console.log(`\n📡 请求 URL: ${revalidateUrl.replace(REVALIDATE_SECRET, '***')}`)
    
    const pathResponse = await fetch(revalidateUrl, { method: 'POST' })
    const pathResult = await pathResponse.json()
    
    if (pathResponse.ok) {
      console.log('✅ 路径重新验证成功:', pathResult)
    } else {
      console.log('⚠️  路径重新验证失败（对动态路由可能不立即生效）:', pathResult)
    }

    // 方法3: 清除所有文章列表缓存（确保 generateStaticParams 能获取最新列表）
    const allPostsUrl = `${NEXTAUTH_URL}/api/revalidate?tag=all-posts&secret=${REVALIDATE_SECRET}`
    console.log(`\n📡 请求 URL: ${allPostsUrl.replace(REVALIDATE_SECRET, '***')}`)
    
    const allPostsResponse = await fetch(allPostsUrl, { method: 'POST' })
    const allPostsResult = await allPostsResponse.json()
    
    if (allPostsResponse.ok) {
      console.log('✅ 所有文章列表缓存清除成功:', allPostsResult)
    } else {
      console.log('⚠️  所有文章列表缓存清除失败:', allPostsResult)
    }

    console.log(`\n✅ 重新验证完成！`)
    console.log(`\n🔗 请访问: ${NEXTAUTH_URL}/${slug}`)
    console.log(`\n💡 提示: 标签重新验证（tag）比路径重新验证（path）更可靠，特别是对于动态路由。`)
    
  } catch (error) {
    console.error('❌ 重新验证过程中出错:', error)
    process.exit(1)
  }
}

revalidateArticle()

