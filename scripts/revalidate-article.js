/**
 * 手动触发文章页面的重新验证
 * 使用方法: node scripts/revalidate-article.js <slug>
 * 例如: node scripts/revalidate-article.js best-time-to-visit-new-zealand
 */

const slug = process.argv[2]

if (!slug) {
  console.error('请提供文章 slug')
  console.log('使用方法: node scripts/revalidate-article.js <slug>')
  console.log('例如: node scripts/revalidate-article.js best-time-to-visit-new-zealand')
  process.exit(1)
}

const baseUrl = process.env.NEXTAUTH_URL || 'https://besttimeguide.com'
const secret = process.env.REVALIDATE_SECRET || ''

async function revalidateArticle() {
  try {
    // 方法1: 通过路径重新验证
    const pathUrl = `${baseUrl}/api/revalidate?path=/${slug}&secret=${secret}`
    console.log(`[Revalidate] 正在重新验证路径: /${slug}`)
    
    const pathResponse = await fetch(pathUrl, { method: 'POST' })
    const pathData = await pathResponse.json()
    
    if (pathResponse.ok) {
      console.log('✅ 路径重新验证成功:', pathData)
    } else {
      console.error('❌ 路径重新验证失败:', pathData)
    }

    // 方法2: 通过 cache tag 重新验证
    const tagUrl = `${baseUrl}/api/revalidate?tag=article-${slug}&secret=${secret}`
    console.log(`[Revalidate] 正在重新验证标签: article-${slug}`)
    
    const tagResponse = await fetch(tagUrl, { method: 'POST' })
    const tagData = await tagResponse.json()
    
    if (tagResponse.ok) {
      console.log('✅ 标签重新验证成功:', tagData)
    } else {
      console.error('❌ 标签重新验证失败:', tagData)
    }

    // 方法3: 重新验证所有文章列表
    const allPostsUrl = `${baseUrl}/api/revalidate?tag=all-posts&secret=${secret}`
    console.log(`[Revalidate] 正在重新验证所有文章列表`)
    
    const allPostsResponse = await fetch(allPostsUrl, { method: 'POST' })
    const allPostsData = await allPostsResponse.json()
    
    if (allPostsResponse.ok) {
      console.log('✅ 所有文章列表重新验证成功:', allPostsData)
    } else {
      console.error('❌ 所有文章列表重新验证失败:', allPostsData)
    }

    console.log('\n✨ 重新验证完成！请稍等几秒钟后刷新页面。')
  } catch (error) {
    console.error('❌ 重新验证过程中出错:', error)
    process.exit(1)
  }
}

revalidateArticle()

