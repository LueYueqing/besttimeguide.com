/**
 * 文章标签工具函数
 * 用于生成和管理文章的时间标签（季节、月份、周）
 */

// 获取当前季节（北半球）
function getCurrentSeason(date: Date = new Date()): string {
  const month = date.getMonth() + 1
  
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

// 获取当前月份
function getCurrentMonth(date: Date = new Date()): string {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]
  return months[date.getMonth()]
}

// 获取当前周数
function getCurrentWeekNumber(date: Date = new Date()): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNumber = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
  return weekNumber
}

/**
 * 根据日期生成时间标签
 * @param date - 目标日期，默认为当前日期
 * @returns 包含季节、月份、周标签的数组
 */
export function generateTimeTags(date: Date = new Date()): string[] {
  const season = getCurrentSeason(date)
  const month = getCurrentMonth(date)
  const weekNumber = getCurrentWeekNumber(date)

  return [
    `season-${season}`,
    `month-${month}`,
    `week-${weekNumber}`,
  ]
}

/**
 * 解析标签字符串为标签数组
 * @param tags - 标签字符串（JSON数组或逗号分隔）
 * @returns 标签数组
 */
export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return []
  
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
  }
}

/**
 * 将标签数组转换为字符串（JSON格式）
 * @param tags - 标签数组
 * @returns JSON格式的标签字符串
 */
export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags)
}

/**
 * 合并现有标签和时间标签
 * 会自动去除重复的时间标签
 * @param existingTags - 现有的标签数组
 * @param date - 用于生成时间标签的日期
 * @param includeTimeTags - 是否包含时间标签，默认为 true
 * @returns 合并后的标签数组
 */
export function mergeWithTimeTags(
  existingTags: string[] = [],
  date: Date = new Date(),
  includeTimeTags: boolean = true
): string[] {
  // 时间标签模式
  const timeTagPatterns = [
    /^season-(spring|summer|autumn|winter)$/,
    /^month-(january|february|march|april|may|june|july|august|september|october|november|december)$/,
    /^week-\d+$/,
  ]

  // 过滤掉旧的时间标签
  const nonTimeTags = existingTags.filter(tag => 
    !timeTagPatterns.some(pattern => pattern.test(tag))
  )

  // 生成新的时间标签
  const newTimeTags = includeTimeTags ? generateTimeTags(date) : []

  // 合并标签
  return [...nonTimeTags, ...newTimeTags]
}

/**
 * 为文章生成完整的标签（包含时间标签）
 * @param existingTags - 现有的标签（可以是数组、JSON字符串或null）
 * @param date - 用于生成时间标签的日期
 * @param includeTimeTags - 是否包含时间标签，默认为 true
 * @returns JSON格式的标签字符串
 */
export function generateArticleTags(
  existingTags: string[] | string | null | undefined,
  date: Date = new Date(),
  includeTimeTags: boolean = true
): string {
  // 解析现有标签
  let parsedTags: string[] = []
  
  if (Array.isArray(existingTags)) {
    parsedTags = existingTags
  } else if (typeof existingTags === 'string') {
    parsedTags = parseTags(existingTags)
  }

  // 合并时间标签
  const mergedTags = mergeWithTimeTags(parsedTags, date, includeTimeTags)

  // 返回JSON字符串
  return stringifyTags(mergedTags)
}

/**
 * 根据发布日期和时间标签判断文章是否在当前时间段内
 * @param publishedDate - 文章发布日期
 * @param currentTags - 文章的当前标签
 * @returns 如果标签匹配当前时间段则返回true
 */
export function isTimeTagCurrent(publishedDate: Date, currentTags: string[]): boolean {
  const expectedTimeTags = generateTimeTags(new Date())
  
  return expectedTimeTags.some(tag => currentTags.includes(tag))
}
