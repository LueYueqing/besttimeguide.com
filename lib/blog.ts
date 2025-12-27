import { PrismaClient } from '@prisma/client'
import { unstable_cache } from 'next/cache'

const prisma = new PrismaClient()

export interface BlogPost {
  id: number
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
  coverImage?: string | null
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

// 获取所有已发布的文章（限制最近100条，用于sitemap）
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // 使用 unstable_cache 包装查询，添加 cache tag 便于精确清除缓存
    const getCachedAllPosts = unstable_cache(
      async () => {
        const articles = await prisma.article.findMany({
          where: {
            published: true,
            publishedAt: { lte: new Date() },
          },
          include: {
            category: true,
            author: true,
          },
          orderBy: {
            publishedAt: 'desc',
          },
          take: 100, // 只获取最近100条，用于sitemap优化
        })

        return articles.map((article) => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          description: article.description || '',
          date: article.publishedAt instanceof Date
            ? article.publishedAt.toISOString()
            : article.publishedAt || article.createdAt.toISOString(),
          author: article.author.name || article.author.email || 'besttimeguide.com Team',
          category: article.category.name,
          tags: parseTags(article.tags),
          content: article.content,
          readingTime: article.readingTime || calculateReadingTime(article.content),
          featured: article.featured,
          coverImage: article.coverImage,
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
export async function getPostBySlug(slug: string): Promise<BlogPost | null | { error: 'DATABASE_ERROR' }> {
  try {
    console.log(`[getPostBySlug] Fetching article: ${slug}`)

    const getCachedArticle = unstable_cache(
      async () => {
        console.log(`[getPostBySlug] Cache MISS for: ${slug}`)
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
      }
    )

    const article = await getCachedArticle()

    console.log(`[getPostBySlug] Article found: ${!!article}, published: ${article?.published}`)

    if (!article || !article.published) {
      console.log(`[getPostBySlug] Article not accessible: ${slug}`)
      return null
    }

    // 只在文章未发布时检查发布时间是否在未来（用于定时发布）
    // 已发布的文章不应该因为 publishedAt 在未来而被隐藏
    if (article.publishedAt && new Date(article.publishedAt) > new Date()) {
      console.log(`[getPostBySlug] Article published but publishedAt is in the future: ${slug}, this should not happen`)
      // 注意：这里不返回 null，允许访问
    }

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      description: article.description || '',
      date: article.publishedAt instanceof Date
        ? article.publishedAt.toISOString()
        : article.publishedAt || article.createdAt.toISOString(),
      author: article.author.name || article.author.email || 'besttimeguide.com Team',
      category: article.category.name,
      tags: parseTags(article.tags),
      content: article.content,
      readingTime: article.readingTime || calculateReadingTime(article.content),
      featured: article.featured,
      coverImage: article.coverImage,
    }
  } catch (error: any) {
    const isDatabaseError = error?.code && ['P1001', 'P1002', 'P1003'].includes(error.code)
    if (isDatabaseError) {
      console.warn(`[Blog] Database connection error for ${slug}`)
      return { error: 'DATABASE_ERROR' as const }
    }
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
        publishedAt: { lte: new Date() },
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
      id: article.id,
      slug: article.slug,
      title: article.title,
      description: article.description || '',
      date: article.publishedAt instanceof Date
        ? article.publishedAt.toISOString()
        : article.publishedAt || article.createdAt.toISOString(),
      author: article.author.name || article.author.email || 'besttimeguide.com Team',
      category: article.category.name,
      tags: parseTags(article.tags),
      content: article.content,
      readingTime: article.readingTime || calculateReadingTime(article.content),
      featured: article.featured,
      coverImage: article.coverImage,
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
        publishedAt: { lte: new Date() },
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

    return articles
      .filter((article) => parseTags(article.tags).includes(tag))
      .map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description || '',
        date: article.publishedAt instanceof Date
          ? article.publishedAt.toISOString()
          : article.publishedAt || article.createdAt.toISOString(),
        author: article.author.name || article.author.email || 'besttimeguide.com Team',
        category: article.category.name,
        tags: parseTags(article.tags),
        content: article.content,
        readingTime: article.readingTime || calculateReadingTime(article.content),
        featured: article.featured,
        coverImage: article.coverImage,
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
            publishedAt: { lte: new Date() },
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
        publishedAt: { lte: new Date() },
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
