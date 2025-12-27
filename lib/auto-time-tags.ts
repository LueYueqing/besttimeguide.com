/**
 * 自动时间标签生成系统
 * 基于文章标题、分类和内容智能生成时间标签
 */

// 时间关键词映射
const TIME_KEYWORDS = {
  // 季节关键词
  spring: ['spring', 'cherry blossom', 'sakura', 'easter', 'bloom', 'floral', 'march', 'april', 'may'],
  summer: ['summer', 'vacation', 'beach', 'holiday', 'hot', 'sun', 'swimming', 'june', 'july', 'august'],
  autumn: ['autumn', 'fall', 'harvest', 'halloween', 'thanksgiving', 'leaf', 'foliage', 'september', 'october', 'november'],
  winter: ['winter', 'snow', 'christmas', 'new year', 'ski', 'cold', 'ice', 'december', 'january', 'february'],
  
  // 月份关键词
  january: ['january', 'new year', 'resolution', 'winter', 'cold'],
  february: ['february', 'valentine', 'romantic', 'winter'],
  march: ['march', 'spring', 'easter', 'cherry blossom'],
  april: ['april', 'spring', 'easter', 'rain'],
  may: ['may', 'spring', 'mother\'s day', 'memorial'],
  june: ['june', 'summer', 'father\'s day', 'wedding'],
  july: ['july', 'summer', 'independence', 'vacation'],
  august: ['august', 'summer', 'hot', 'vacation'],
  september: ['september', 'autumn', 'back to school', 'labor day'],
  october: ['october', 'autumn', 'halloween', 'fall'],
  november: ['november', 'autumn', 'thanksgiving', 'black friday'],
  december: ['december', 'winter', 'christmas', 'holiday'],
  
  // 特定周数关键词（基于常见事件）
  week_47: ['thanksgiving', 'black friday'], // 11月下旬
  week_48: ['black friday', 'cyber monday'],
  week_51: ['christmas', 'holiday'],
  week_52: ['new year', 'christmas'],
}

// 分类到时间标签的默认映射
const CATEGORY_TIME_TAGS: { [key: string]: string[] } = {
  travel: ['season-spring', 'season-summer', 'season-autumn'], // 旅游适合春秋夏季
  shopping: ['season-winter', 'month-november', 'month-december'], // 购物适合冬季和年末
  health: ['season-spring', 'month-january'], // 健康适合春季和新年开始
  'social-media': ['season-summer', 'season-winter'], // 社交媒体适合夏季和冬季
  lifestyle: ['season-spring', 'season-autumn'], // 生活方式适合春秋
}

/**
 * 从文本中提取时间标签
 */
function extractTimeTagsFromText(text: string): string[] {
  const tags: Set<string> = new Set()
  const lowerText = text.toLowerCase()

  // 提取季节标签
  for (const [season, keywords] of Object.entries(TIME_KEYWORDS)) {
    // 跳过非季节键
    if (['spring', 'summer', 'autumn', 'winter'].includes(season)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        tags.add(`season-${season}`)
      }
    }
  }

  // 提取月份标签
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                  'july', 'august', 'september', 'october', 'november', 'december']
  for (const month of months) {
    const keywords = (TIME_KEYWORDS as any)[month]
    if (keywords && keywords.some((keyword: string) => lowerText.includes(keyword))) {
      tags.add(`month-${month}`)
    }
  }

  // 提取特定周数标签
  if (TIME_KEYWORDS.week_47.some(keyword => lowerText.includes(keyword))) {
    tags.add('week-47')
    tags.add('week-48')
  }
  if (TIME_KEYWORDS.week_51.some(keyword => lowerText.includes(keyword))) {
    tags.add('week-51')
  }
  if (TIME_KEYWORDS.week_52.some(keyword => lowerText.includes(keyword))) {
    tags.add('week-52')
  }

  return Array.from(tags)
}

/**
 * 根据分类获取默认时间标签
 */
function getTimeTagsByCategory(categoryName: string): string[] {
  const normalizedCategory = categoryName.toLowerCase()
  
  for (const [category, tags] of Object.entries(CATEGORY_TIME_TAGS)) {
    if (normalizedCategory.includes(category)) {
      return tags
    }
  }
  
  return []
}

/**
 * 获取当前时间的时间标签
 */
function getCurrentTimeTags(): string[] {
  const now = new Date()
  const month = now.getMonth() + 1
  const week = Math.ceil(now.getDate() / 7) + Math.floor(month * 4.33)
  const weekOfYear = Math.min(week, 52)
  
  const tags: string[] = []
  
  // 季节
  if (month >= 3 && month <= 5) tags.push('season-spring')
  else if (month >= 6 && month <= 8) tags.push('season-summer')
  else if (month >= 9 && month <= 11) tags.push('season-autumn')
  else tags.push('season-winter')
  
  // 月份
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
                  'july', 'august', 'september', 'october', 'november', 'december']
  tags.push(`month-${months[month - 1]}`)
  
  // 周数
  tags.push(`week-${weekOfYear}`)
  
  return tags
}

/**
 * 智能生成时间标签
 * @param title 文章标题
 * @param content 文章内容
 * @param categoryName 分类名称
 * @param existingTags 已有标签（可选）
 * @returns 生成的标签数组
 */
export function generateAutoTimeTags(
  title: string,
  content: string = '',
  categoryName: string = '',
  existingTags: string[] = []
): string[] {
  const allText = `${title} ${content}`.toLowerCase()
  
  // 收集所有可能的时间标签
  const tagCandidates: Set<string> = new Set()
  
  // 1. 从标题和内容中提取
  const textTags = extractTimeTagsFromText(allText)
  textTags.forEach(tag => tagCandidates.add(tag))
  
  // 2. 根据分类获取默认标签
  if (categoryName) {
    const categoryTags = getTimeTagsByCategory(categoryName)
    categoryTags.forEach(tag => tagCandidates.add(tag))
  }
  
  // 3. 如果没有找到任何时间标签，添加当前时间标签
  if (tagCandidates.size === 0) {
    const currentTimeTags = getCurrentTimeTags()
    currentTimeTags.forEach(tag => tagCandidates.add(tag))
  }
  
  // 4. 合并现有标签（移除旧的时间标签，保留新的）
  const nonTimeTags = existingTags.filter(tag => 
    !tag.startsWith('season-') && 
    !tag.startsWith('month-') && 
    !tag.startsWith('week-')
  )
  
  const finalTags = [...nonTimeTags, ...Array.from(tagCandidates)]
  
  // 去重
  return Array.from(new Set(finalTags))
}

/**
 * 增量更新时间标签
 * 在现有标签基础上添加新的时间标签
 */
export function updateTimeTags(
  existingTags: string[],
  title: string,
  content: string = '',
  categoryName: string = ''
): string[] {
  // 保留所有非时间标签
  const nonTimeTags = existingTags.filter(tag => 
    !tag.startsWith('season-') && 
    !tag.startsWith('month-') && 
    !tag.startsWith('week-')
  )
  
  // 生成新的时间标签
  const newTimeTags = generateAutoTimeTags(title, content, categoryName, nonTimeTags)
  
  return newTimeTags
}

/**
 * 验证标签格式
 */
export function validateTimeTags(tags: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const tag of tags) {
    if (tag.startsWith('season-')) {
      const season = tag.replace('season-', '')
      if (!['spring', 'summer', 'autumn', 'winter'].includes(season)) {
        errors.push(`Invalid season tag: ${tag}`)
      }
    } else if (tag.startsWith('month-')) {
      const month = tag.replace('month-', '')
      const validMonths = ['january', 'february', 'march', 'april', 'may', 'june',
                          'july', 'august', 'september', 'october', 'november', 'december']
      if (!validMonths.includes(month)) {
        errors.push(`Invalid month tag: ${tag}`)
      }
    } else if (tag.startsWith('week-')) {
      const week = parseInt(tag.replace('week-', ''), 10)
      if (isNaN(week) || week < 1 || week > 52) {
        errors.push(`Invalid week tag: ${tag}`)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 获取时间标签的描述
 */
export function getTimeTagDescription(tag: string): string {
  const descriptions: { [key: string]: string } = {
    'season-spring': 'Best time in Spring (March-May)',
    'season-summer': 'Best time in Summer (June-August)',
    'season-autumn': 'Best time in Autumn (September-November)',
    'season-winter': 'Best time in Winter (December-February)',
    'month-january': 'Best time in January',
    'month-february': 'Best time in February',
    'month-march': 'Best time in March',
    'month-april': 'Best time in April',
    'month-may': 'Best time in May',
    'month-june': 'Best time in June',
    'month-july': 'Best time in July',
    'month-august': 'Best time in August',
    'month-september': 'Best time in September',
    'month-october': 'Best time in October',
    'month-november': 'Best time in November',
    'month-december': 'Best time in December',
  }
  
  if (tag.startsWith('week-')) {
    const week = tag.replace('week-', '')
    return `Best time in Week ${week}`
  }
  
  return descriptions[tag] || tag
}
