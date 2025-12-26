import { PrismaClient } from '@prisma/client'
import { unstable_cache } from 'next/cache'

const prisma = new PrismaClient()

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  tags: string[]
  content: string
  readingTime: number
  featured?: boolean
}

// 计算阅读时间（基于平均阅读速度200字/分钟）
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// 解析tags（从JSON字符串或数组）
function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // 如果不是JSON，尝试按逗号分割
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
  }
}

// 获取所有已发布的文章
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // 使用 unstable_cache 包装查询，添加 cache tag 便于精确清除缓存
    const getCachedAllPosts = unstable_cache(
      async () => {
        const articles = await prisma.article.findMany({
          where: {
            published: true,
          },
          include: {
            category: true,
            author: true,
          },
          orderBy: {
            publishedAt: 'desc',
          },
        })

        return articles.map((article) => ({
          slug: article.slug,
          title: article.title,
          description: article.description || '',
          date: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
          author: article.author.name || article.author.email || 'besttimeguide.com Team',
          category: article.category.name,
          tags: parseTags(article.tags),
          content: article.content,
          readingTime: article.readingTime || calculateReadingTime(article.content),
          featured: article.featured,
        }))
      },
      ['all-posts'],
      {
        tags: ['all-posts'],
        revalidate: false, // 禁用自动刷新，只使用 on-demand revalidation
      }
    )
    return await getCachedAllPosts()
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

// 根据slug获取单篇文章
// 返回值：BlogPost | null | { error: 'DATABASE_ERROR' }
export async function getPostBySlug(slug: string): Promise<BlogPost | null | { error: 'DATABASE_ERROR' }> {
  try {
    // 使用 unstable_cache 包装查询，添加 cache tag 便于精确清除缓存
    const getCachedArticle = unstable_cache(
      async () => {
        return await prisma.article.findUnique({
          where: { slug },
          include: {
            category: true,
            author: true,
          },
        })
      },
      [`article-${slug}`],
      {
        tags: [`article-${slug}`],
        // 不设置 revalidate，完全依赖 on-demand revalidation
        // 这样只有在主动调用 revalidateTag 时才会重新生成
      }
    )

    const article = await getCachedArticle()

    if (!article || !article.published) {
      return null
    }

    return {
      slug: article.slug,
      title: article.title,
      description: article.description || '',
      date: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
      author: article.author.name || article.author.email || 'besttimeguide.com Team',
      category: article.category.name,
      tags: parseTags(article.tags),
      content: article.content,
      readingTime: article.readingTime || calculateReadingTime(article.content),
      featured: article.featured,
    }
  } catch (error: any) {
    // 检查是否是数据库连接错误
    const isDatabaseError = error?.code && ['P1001', 'P1002', 'P1003'].includes(error.code)
    
    if (isDatabaseError) {
      console.warn(`[Blog] Database connection error for ${slug}`)
      // 返回特殊标记，让页面组件知道这是数据库错误
      // Next.js ISR 会在后台使用缓存的静态页面（如果存在）
      return { error: 'DATABASE_ERROR' as const }
    }
    
    // 其他错误记录并返回 null
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

// 根据分类获取文章
export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    })

    if (!category) {
      return []
    }

    const articles = await prisma.article.findMany({
      where: {
        categoryId: category.id,
        published: true,
      },
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    })

    return articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      description: article.description || '',
      date: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
      author: article.author.name || article.author.email || 'besttimeguide.com Team',
      category: article.category.name,
      tags: parseTags(article.tags),
      content: article.content,
      readingTime: article.readingTime || calculateReadingTime(article.content),
      featured: article.featured,
    }))
  } catch (error) {
    console.error(`Error fetching posts by category ${categorySlug}:`, error)
    return []
  }
}

// 根据标签获取文章
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  try {
    const articles = await prisma.article.findMany({
      where: {
        published: true,
        tags: {
          contains: tag,
        },
      },
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    })

    // 过滤出真正包含该标签的文章
    return articles
      .filter((article) => parseTags(article.tags).includes(tag))
      .map((article) => ({
        slug: article.slug,
        title: article.title,
        description: article.description || '',
        date: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
        author: article.author.name || article.author.email || 'besttimeguide.com Team',
        category: article.category.name,
        tags: parseTags(article.tags),
        content: article.content,
        readingTime: article.readingTime || calculateReadingTime(article.content),
        featured: article.featured,
      }))
  } catch (error) {
    console.error(`Error fetching posts by tag ${tag}:`, error)
    return []
  }
}

// 获取所有分类
export async function getAllCategories(): Promise<string[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        articles: {
          some: {
            published: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    return categories.map((cat) => cat.name)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// 获取所有标签
export async function getAllTags(): Promise<string[]> {
  try {
    const articles = await prisma.article.findMany({
      where: {
        published: true,
        tags: {
          not: null,
        },
      },
      select: {
        tags: true,
      },
    })

    const allTags = new Set<string>()
    articles.forEach((article) => {
      parseTags(article.tags).forEach((tag) => allTags.add(tag))
    })

    return Array.from(allTags).sort()
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}
