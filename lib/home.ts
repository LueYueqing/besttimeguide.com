import { unstable_cache } from 'next/cache'
import { getPostsByCategory } from './blog'
import { 
  getBestPostsForCurrentSeason, 
  getBestPostsForCurrentMonth, 
  getBestPostsForCurrentWeek,
  TimeBasedPost 
} from './time-based-posts'
import { BlogPost } from './blog'

/**
 * 首页数据接口
 */
export interface HomePageData {
  travelPosts: BlogPost[]
  socialMediaPosts: BlogPost[]
  healthPosts: BlogPost[]
  seasonPosts: TimeBasedPost[]
  monthPosts: TimeBasedPost[]
  weekPosts: TimeBasedPost[]
}

/**
 * 获取首页数据（带缓存）
 * 
 * 该函数一次性获取首页所需的所有数据，并使用 unstable_cache 进行缓存
 * 缓存时间：1小时
 * 
 * @returns 首页数据对象
 */
export const getHomePageData = unstable_cache(
  async (): Promise<HomePageData> => {
    // 并发获取所有数据
    const [travelPosts, socialMediaPosts, healthPosts, seasonPosts, monthPosts, weekPosts] = 
      await Promise.all([
        getPostsByCategory('travel').then((posts) => posts.slice(0, 4)),
        getPostsByCategory('social-media').then((posts) => posts.slice(0, 4)),
        getPostsByCategory('health').then((posts) => posts.slice(0, 4)),
        getBestPostsForCurrentSeason(4),
        getBestPostsForCurrentMonth(4),
        getBestPostsForCurrentWeek(4),
      ])

    return {
      travelPosts,
      socialMediaPosts,
      healthPosts,
      seasonPosts,
      monthPosts,
      weekPosts,
    }
  },
  ['home-page-data'],
  {
    tags: ['home-page'],
    revalidate: 3600, // 缓存1小时
  }
)

/**
 * 清除首页缓存
 * 
 * 当有新文章发布时，可以调用此函数清除首页缓存
 */
export async function revalidateHomePage() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('home-page')
}
