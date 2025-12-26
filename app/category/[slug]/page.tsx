import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getPostsByCategory, getAllPosts, BlogPost } from '@/lib/blog'
import { PrismaClient } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import TagLink from './TagLink'

const prisma = new PrismaClient()

// 获取所有分类（用于相关分类展示）
async function getAllCategories() {
  try {
    const getCachedCategories = unstable_cache(
      async () => {
        return await prisma.category.findMany({
          where: {},
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        })
      },
      ['all-categories-list'],
      {
        tags: ['all-categories-list'],
        revalidate: false,
      }
    )
    return await getCachedCategories()
  } catch (error: any) {
    console.error('Error fetching all categories:', error)
    return []
  }
}

// 其他分类组件
async function OtherCategories({ currentSlug }: { currentSlug: string }) {
  const categories = await getAllCategories()
  const otherCategories = categories.filter((cat) => cat.slug !== currentSlug).slice(0, 8)

  if (otherCategories.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {otherCategories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="px-4 py-3 bg-neutral-50 rounded-lg text-center hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  )
}

export const revalidate = false // 禁用自动刷新，只使用 on-demand revalidation

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

// 获取分类信息
async function getCategoryBySlug(slug: string) {
  try {
    const getCachedCategory = unstable_cache(
      async () => {
        return await prisma.category.findUnique({
          where: { slug },
        })
      },
      [`category-${slug}`],
      {
        tags: [`category-${slug}`],
        revalidate: false,
      }
    )
    return await getCachedCategory()
  } catch (error: any) {
    console.error(`Error fetching category ${slug}:`, error)
    const isDatabaseError = error?.code && ['P1001', 'P1002', 'P1003'].includes(error.code)
    if (isDatabaseError) {
      return null
    }
    throw error
  }
}

export async function generateStaticParams() {
  try {
    const getCachedCategories = unstable_cache(
      async () => {
        return await prisma.category.findMany({
          where: {},
          select: { slug: true },
        })
      },
      ['all-categories'],
      {
        tags: ['all-categories'],
        revalidate: false,
      }
    )
    const categories = await getCachedCategories()
    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for categories:', error)
    return []
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    return {
      title: 'Category Not Found | besttimeguide.com',
    }
  }
  
  return {
    title: `${category.name} Guides & Articles | besttimeguide.com`,
    description: category.description || `Discover the best time guides and articles in ${category.name} category. Expert tips and data-driven insights.`,
    keywords: category.name,
    alternates: {
      canonical: `https://besttimeguide.com/category/${slug}`,
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    notFound()
  }
  
  let posts: BlogPost[] = []
  let featuredPosts: BlogPost[] = []
  let recentPosts: BlogPost[] = []
  
  try {
    posts = await getPostsByCategory(slug)
    
    // 热门文章：精选文章优先，然后按发布时间排序
    featuredPosts = posts
      .filter((post) => post.featured)
      .slice(0, 6)
    
    // 如果精选文章不足6篇，补充最新文章
    if (featuredPosts.length < 6) {
      const remaining = posts
        .filter((post) => !post.featured)
        .slice(0, 6 - featuredPosts.length)
      featuredPosts = [...featuredPosts, ...remaining]
    }
    
    // 最新文章：按发布时间排序，取前12篇
    recentPosts = posts.slice(0, 12)
  } catch (error: any) {
    console.error(`Error fetching posts for category ${slug}:`, error)
    const isDatabaseError = error?.code && ['P1001', 'P1002', 'P1003'].includes(error.code)
    if (isDatabaseError) {
      console.warn(`[CategoryPage] Database connection error for category ${slug}, ISR will use cached page if available`)
      notFound()
    }
  }

  if (posts.length === 0) {
    notFound()
  }

  // 获取该分类下的所有标签（用于标签云）
  const categoryTags = new Set<string>()
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      categoryTags.add(tag)
    })
  })
  const sortedTags = Array.from(categoryTags).sort()

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
            <span className="text-neutral-900">{category.name}</span>
          </nav>

          {/* 分类头部 */}
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-neutral-600 mb-4">
                {category.description}
              </p>
            )}
            <p className="text-neutral-600">
              {posts.length} article{posts.length !== 1 ? 's' : ''} in this category
            </p>
          </div>

          {/* 热门文章区域 */}
          {featuredPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Popular {category.name} Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${post.slug}`}
                    className="group bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md hover:border-primary-300 transition-all"
                  >
                    {post.featured && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded font-semibold">
                          Featured
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-neutral-500 text-xs">
                        {post.readingTime} min read
                      </span>
                      <span className="text-neutral-500 text-xs">•</span>
                      <span className="text-neutral-500 text-xs">
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="text-neutral-700 mb-4 line-clamp-2">
                        {post.description}
                      </p>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded"
                          >
                            {tag}
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
            </section>
          )}

          {/* 所有文章列表 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">All {category.name} Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
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
                    <span className="text-neutral-500 text-xs">•</span>
                    <span className="text-neutral-500 text-xs">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-neutral-700 mb-4 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.tags.slice(0, 3).map((tag) => (
                        <TagLink key={tag} tag={tag} />
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-neutral-500">+{post.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>

          {/* 标签云（可选，用于扩展） */}
          {sortedTags.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Popular Tags in {category.name}</h2>
              <div className="flex flex-wrap gap-2">
                {sortedTags.slice(0, 20).map((tag) => {
                  const tagCount = posts.filter((post) => post.tags.includes(tag)).length
                  return (
                    <Link
                      key={tag}
                      href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors"
                    >
                      {tag} ({tagCount})
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* 相关分类（可选，用于扩展） */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Browse Other Categories</h2>
            <OtherCategories currentSlug={slug} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

