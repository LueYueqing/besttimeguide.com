import { prisma } from './prisma'
import { unstable_cache } from 'next/cache'

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
      }
    )

    const article = await getCachedArticle()



    if (!article || !article.published) {

      return null
    }

    // 只在文章未发布时检查发布时间是否在未来（用于定时发布）
    // 已发布的文章不应该因为 publishedAt 在未来而被隐藏
    if (article.publishedAt && new Date(article.publishedAt) > new Date()) {

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

/**
 * 获取相关文章（使用关联表）
 * 按需生成：第一次访问时生成关联关系
 * 
 * @param articleId 文章ID
 * @param limit 返回数量，默认6篇
 * @returns 相关文章数组
 */
export async function getRelatedPosts(
  articleId: number,
  limit: number = 6
): Promise<BlogPost[]> {
  try {


    // 1. 先查询已有的关联关系
    const existingRelations = await prisma.articleRelation.findMany({
      where: {
        articleId,
        relatedArticle: {
          published: true,
          publishedAt: { lte: new Date() },
        },
      },
      include: {
        relatedArticle: {
          include: {
            category: true,
            author: true,
          },
        },
      },
      orderBy: {
        weight: 'desc', // 按权重排序
      },
      take: limit,
    })

    // 2. 如果关联数量足够，直接返回
    if (existingRelations.length >= limit) {

      return existingRelations.map(r => ({
        id: r.relatedArticle.id,
        slug: r.relatedArticle.slug,
        title: r.relatedArticle.title,
        description: r.relatedArticle.description || '',
        date: r.relatedArticle.publishedAt instanceof Date
          ? r.relatedArticle.publishedAt.toISOString()
          : r.relatedArticle.publishedAt || r.relatedArticle.createdAt.toISOString(),
        author: r.relatedArticle.author.name || r.relatedArticle.author.email || 'besttimeguide.com Team',
        category: r.relatedArticle.category.name,
        tags: parseTags(r.relatedArticle.tags),
        content: r.relatedArticle.content,
        readingTime: r.relatedArticle.readingTime || calculateReadingTime(r.relatedArticle.content),
        featured: r.relatedArticle.featured,
        coverImage: r.relatedArticle.coverImage,
      }))
    }

    // 3. 如果关联不足，生成新的关联关系


    // 同步生成关联关系（确保可靠性）
    await generateRelationsAsync(articleId)

    // 4. 重新查询关联关系
    const newRelations = await prisma.articleRelation.findMany({
      where: {
        articleId,
        relatedArticle: {
          published: true,
          publishedAt: { lte: new Date() },
        },
      },
      include: {
        relatedArticle: {
          include: {
            category: true,
            author: true,
          },
        },
      },
      orderBy: {
        weight: 'desc', // 按权重排序
      },
      take: limit,
    })


    return newRelations.map(r => ({
      id: r.relatedArticle.id,
      slug: r.relatedArticle.slug,
      title: r.relatedArticle.title,
      description: r.relatedArticle.description || '',
      date: r.relatedArticle.publishedAt instanceof Date
        ? r.relatedArticle.publishedAt.toISOString()
        : r.relatedArticle.publishedAt || r.relatedArticle.createdAt.toISOString(),
      author: r.relatedArticle.author.name || r.relatedArticle.author.email || 'besttimeguide.com Team',
      category: r.relatedArticle.category.name,
      tags: parseTags(r.relatedArticle.tags),
      content: r.relatedArticle.content,
      readingTime: r.relatedArticle.readingTime || calculateReadingTime(r.relatedArticle.content),
      featured: r.relatedArticle.featured,
      coverImage: r.relatedArticle.coverImage,
    }))
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

/**
 * 异步生成文章关联关系（不阻塞）
 * 调用 generate-article-relations.ts 脚本
 */
async function generateRelationsAsync(articleId: number) {


  try {
    // 动态导入生成函数
    const { generateRelationsForArticle } = await import('../scripts/generate-article-relations')
    await generateRelationsForArticle(articleId)

  } catch (error) {
    console.error(`[generateRelationsAsync] Error generating relations for article ${articleId}:`, error)
  }
}
