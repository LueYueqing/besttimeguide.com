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
    // 获取所有文章，然后过滤出包含该标签的文章
    const allPosts = await getAllPosts()
    posts = allPosts.filter((post) => {
      const postTagSlugs = post.tags.map((t) => t.toLowerCase().replace(/\s+/g, '-'))
      return postTagSlugs.includes(tag)
    })
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
                className="group bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md hover:border-primary-300 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                    {post.category}
                  </span>
                  <span className="text-neutral-500 text-xs">
                    {post.readingTime} min read
                  </span>
                  <span className="text-neutral-500 text-xs">
                    {formatDate(post.date)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="text-neutral-700 mb-4 line-clamp-2">
                    {post.description}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.tags.slice(0, 3).map((postTag) => (
                      <span
                        key={postTag}
                        className={`text-xs px-2 py-1 rounded ${
                          postTag.toLowerCase().replace(/\s+/g, '-') === tag
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {postTag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs text-neutral-500">+{post.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

