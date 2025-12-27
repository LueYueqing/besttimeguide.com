import { PrismaClient } from '@prisma/client'
import { unstable_cache } from 'next/cache'

const prisma = new PrismaClient()

export interface TimeBasedPost {
  id: number
  slug: string
  title: string
  description: string
  category: string
  coverImage?: string | null
  viewCount: number
}

// 获取当前季节（北半球）
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1
  
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

// 获取当前月份
function getCurrentMonth(): string {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]
  return months[new Date().getMonth()]
}

// 获取当前周数
function getCurrentWeekNumber(): number {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
  return weekNumber
}

// 解析tags
function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
  }
}

// 获取本季最佳文章
export async function getBestPostsForCurrentSeason(limit: number = 4): Promise<TimeBasedPost[]> {
  try {
    const season = getCurrentSeason()
    const seasonTag = `season-${season}`
    
    const getCachedSeasonPosts = unstable_cache(
      async () => {
        const articles = await prisma.article.findMany({
          where: {
            published: true,
            publishedAt: { lte: new Date() },
            tags: {
              contains: seasonTag,
            },
          },
          include: {
            category: true,
          },
          orderBy: [
            { viewCount: 'desc' },
            { publishedAt: 'desc' },
          ],
          take: limit,
        })
        
        return articles
          .filter((article: any) => parseTags(article.tags).includes(seasonTag))
          .map((article: any) => ({
            id: article.id,
            slug: article.slug,
            title: article.title,
            description: article.description || '',
            category: article.category.name,
            coverImage: article.coverImage,
            viewCount: article.viewCount,
          }))
      },
      [`season-posts-${season}`],
      {
        tags: [`season-posts`, `season-posts-${season}`],
        revalidate: 3600, // 缓存1小时
      }
    )
    
    return await getCachedSeasonPosts()
  } catch (error) {
    console.error('Error fetching season posts:', error)
    return []
  }
}

// 获取本月最佳文章
export async function getBestPostsForCurrentMonth(limit: number = 4): Promise<TimeBasedPost[]> {
  try {
    const month = getCurrentMonth()
    const monthTag = `month-${month}`
    
    const getCachedMonthPosts = unstable_cache(
      async () => {
        const articles = await prisma.article.findMany({
          where: {
            published: true,
            publishedAt: { lte: new Date() },
            tags: {
              contains: monthTag,
            },
          },
          include: {
            category: true,
          },
          orderBy: [
            { viewCount: 'desc' },
            { publishedAt: 'desc' },
          ],
          take: limit,
        })
        
        return articles
          .filter((article: any) => parseTags(article.tags).includes(monthTag))
          .map((article: any) => ({
            id: article.id,
            slug: article.slug,
            title: article.title,
            description: article.description || '',
            category: article.category.name,
            coverImage: article.coverImage,
            viewCount: article.viewCount,
          }))
      },
      [`month-posts-${month}`],
      {
        tags: [`month-posts`, `month-posts-${month}`],
        revalidate: 3600, // 缓存1小时
      }
    )
    
    return await getCachedMonthPosts()
  } catch (error) {
    console.error('Error fetching month posts:', error)
    return []
  }
}

// 获取本周最佳文章
export async function getBestPostsForCurrentWeek(limit: number = 4): Promise<TimeBasedPost[]> {
  try {
    const weekNumber = getCurrentWeekNumber()
    const weekTag = `week-${weekNumber}`
    
    const getCachedWeekPosts = unstable_cache(
      async () => {
        const articles = await prisma.article.findMany({
          where: {
            published: true,
            publishedAt: { lte: new Date() },
            tags: {
              contains: weekTag,
            },
          },
          include: {
            category: true,
          },
          orderBy: [
            { viewCount: 'desc' },
            { publishedAt: 'desc' },
          ],
          take: limit,
        })
        
        return articles
          .filter((article: any) => parseTags(article.tags).includes(weekTag))
          .map((article: any) => ({
            id: article.id,
            slug: article.slug,
            title: article.title,
            description: article.description || '',
            category: article.category.name,
            coverImage: article.coverImage,
            viewCount: article.viewCount,
          }))
      },
      [`week-posts-${weekNumber}`],
      {
        tags: [`week-posts`, `week-posts-${weekNumber}`],
        revalidate: 3600, // 缓存1小时
      }
    )
    
    return await getCachedWeekPosts()
  } catch (error) {
    console.error('Error fetching week posts:', error)
    return []
  }
}

// 获取当前时间信息（用于显示）
export function getCurrentTimeInfo() {
  const season = getCurrentSeason()
  const month = getCurrentMonth()
  const weekNumber = getCurrentWeekNumber()
  
  const seasonNames: Record<string, string> = {
    spring: '春季',
    summer: '夏季',
    autumn: '秋季',
    winter: '冬季',
  }
  
  const monthNames: Record<string, string> = {
    january: '一月',
    february: '二月',
    march: '三月',
    april: '四月',
    may: '五月',
    june: '六月',
    july: '七月',
    august: '八月',
    september: '九月',
    october: '十月',
    november: '十一月',
    december: '十二月',
  }
  
  return {
    season: season,
    seasonName: seasonNames[season],
    month: month,
    monthName: monthNames[month],
    weekNumber: weekNumber,
  }
}
