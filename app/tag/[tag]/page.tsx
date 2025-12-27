import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getPostsByTag, getAllPosts, BlogPost } from '@/lib/blog'

export const revalidate = false // 禁用自动刷新，只使用 on-demand revalidation

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  // 获取所有文章，提取所有标签
  try {
    const posts = await getAllPosts()
    const allTags = new Set<string>()
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        const tagSlug = tag.toLowerCase().replace(/\s+/g, '-')
        allTags.add(tagSlug)
      })
    })
    return Array.from(allTags).map((tag) => ({
      tag,
    }))
  } catch (error) {
    console.error('Error generating static params for tags:', error)
    return []
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params
  const tagName = tag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  
  return {
    title: `${tagName} Articles | besttimeguide.com`,
    description: `Discover the best time guides and articles tagged with ${tagName}.`,
    keywords: tagName,
    alternates: {
      canonical: `https://besttimeguide.com/tag/${tag}`,
    },
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const tagName = tag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  
  let posts: BlogPost[] = []
  try {
    // 使用 getPostsByTag 函数，它已经实现了正确的标签匹配逻辑
    // 首先尝试使用原始标签名（可能包含空格）
    posts = await getPostsByTag(tagName)
    
    // 如果没找到，尝试使用 slug 格式的标签
    if (posts.length === 0) {
      // 获取所有文章，然后过滤出包含该标签的文章
      const allPosts = await getAllPosts()
      posts = allPosts.filter((post) => {
        const postTagSlugs = post.tags.map((t) => t.toLowerCase().replace(/\s+/g, '-'))
        return postTagSlugs.includes(tag)
      })
    }
  } catch (error: any) {
    console.error(`Error fetching posts for tag ${tag}:`, error)
    const isDatabaseError = error?.code && ['P1001', 'P1002', 'P1003'].includes(error.code)
    if (isDatabaseError) {
      console.warn(`[TagPage] Database connection error for tag ${tag}, ISR will use cached page if available`)
      notFound()
    }
  }

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="pt-16 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* 面包屑导航 */}
          <nav className="mb-6 text-sm text-neutral-600">
            <Link href="/" className="hover:text-primary-600">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span className="text-neutral-900">Tag: {tagName}</span>
          </nav>

          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              {tagName} Articles
            </h1>
            <p className="text-lg text-neutral-600">
              Found {posts.length} article{posts.length !== 1 ? 's' : ''} tagged with "{tagName}"
            </p>
          </div>

          {/* 文章列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${post.slug}`}
                className="group bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md hover:border-primary-300 transition-all"
              >
                <div className="relative w-full h-48 bg-neutral-100">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                      <div className="text-neutral-400 text-center px-4">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">Cover image coming soon</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                      {post.category}
                    </span>
                    <span className="text-neutral-500 text-xs">
                      {post.readingTime} min read
                    </span>
                    <span className="text-neutral-500 text-xs">•</span>
                    <span className="text-neutral-500 text-xs">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-neutral-700 mb-3 line-clamp-2 text-sm">
                      {post.description}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.tags.slice(0, 3).map((postTag) => (
                        <Link
                          key={postTag}
                          href={`/tag/${postTag.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`text-xs px-2 py-1 rounded hover:underline ${
                            postTag.toLowerCase().replace(/\s+/g, '-') === tag
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-primary-50'
                          }`}
                        >
                          {postTag}
                        </Link>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-neutral-500">+{post.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
