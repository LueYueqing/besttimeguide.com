import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const prisma = new PrismaClient()

// 季节映射
const seasonMapping: Record<number, string> = {
  12: 'winter',
  1: 'winter',
  2: 'winter',
  3: 'spring',
  4: 'spring',
  5: 'spring',
  6: 'summer',
  7: 'summer',
  8: 'summer',
  9: 'autumn',
  10: 'autumn',
  11: 'autumn',
}

// 月份映射
const monthMapping: Record<number, string> = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

// 获取周数
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// 解析标签
function parseTags(tags: string | null): string[] {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
  }
}

// 标签转为字符串
function tagsToString(tags: string[]): string {
  return JSON.stringify(tags)
}

async function main() {
  console.log('Starting to add time tags to articles...')

  // 获取所有已发布的文章
  const articles = await prisma.article.findMany({
    where: {
      published: true,
    },
  })

  console.log(`Found ${articles.length} published articles`)

  let updatedCount = 0

  for (const article of articles) {
    const existingTags = parseTags(article.tags)
    const date = article.publishedAt || article.createdAt
    const month = date.getMonth()
    const year = date.getFullYear()
    
    const seasonTag = `season-${seasonMapping[month + 1]}`
    const monthTag = `month-${monthMapping[month]}`
    const weekTag = `week-${getWeekNumber(date)}`

    // 检查是否已有时间标签
    const hasSeasonTag = existingTags.some(tag => tag.startsWith('season-'))
    const hasMonthTag = existingTags.some(tag => tag.startsWith('month-'))
    const hasWeekTag = existingTags.some(tag => tag.startsWith('week-'))

    // 如果文章标题包含特定关键词，添加特定时间标签
    const titleLower = article.title.toLowerCase()
    let additionalTags: string[] = []

    // 根据标题内容智能添加标签
    if (titleLower.includes('japan') || titleLower.includes('tokyo') || titleLower.includes('kyoto')) {
      additionalTags.push('season-spring', 'season-autumn', 'month-march', 'month-april', 'month-november')
    }
    if (titleLower.includes('hawaii')) {
      additionalTags.push('season-winter', 'season-spring', 'month-december', 'month-january', 'month-february', 'month-march', 'month-april')
    }
    if (titleLower.includes('iceland')) {
      additionalTags.push('season-summer', 'season-winter', 'month-june', 'month-july', 'month-august', 'month-december', 'month-january', 'month-february')
    }
    if (titleLower.includes('thailand')) {
      additionalTags.push('season-winter', 'season-spring', 'month-november', 'month-december', 'month-january', 'month-february', 'month-march', 'month-april')
    }
    if (titleLower.includes('italy')) {
      additionalTags.push('season-spring', 'season-autumn', 'month-april', 'month-may', 'month-september', 'month-october')
    }
    if (titleLower.includes('christmas') || titleLower.includes('holiday')) {
      additionalTags.push('month-november', 'month-december', 'week-47', 'week-48', 'week-49', 'week-50', 'week-51', 'week-52')
    }
    if (titleLower.includes('black friday')) {
      additionalTags.push('month-november', 'week-47', 'week-48')
    }
    if (titleLower.includes('valentine')) {
      additionalTags.push('month-january', 'month-february', 'week-5', 'week-6', 'week-7')
    }
    if (titleLower.includes('summer') || titleLower.includes('beach') || titleLower.includes('vacation')) {
      additionalTags.push('season-summer', 'month-june', 'month-july', 'month-august')
    }
    if (titleLower.includes('winter') || titleLower.includes('snow') || titleLower.includes('ski')) {
      additionalTags.push('season-winter', 'month-december', 'month-january', 'month-february')
    }

    // 合并所有标签
    const newTags = [...existingTags]

    // 添加基础时间标签（基于发布时间）
    if (!hasSeasonTag) {
      newTags.push(seasonTag)
    }
    if (!hasMonthTag) {
      newTags.push(monthTag)
    }
    if (!hasWeekTag) {
      newTags.push(weekTag)
    }

    // 添加基于内容的额外标签
    for (const additionalTag of additionalTags) {
      if (!newTags.includes(additionalTag)) {
        newTags.push(additionalTag)
      }
    }

    // 如果标签有变化，更新文章
    if (newTags.length !== existingTags.length || 
        JSON.stringify(newTags.sort()) !== JSON.stringify(existingTags.sort())) {
      
      await prisma.article.update({
        where: { id: article.id },
        data: {
          tags: tagsToString(newTags),
        },
      })

      console.log(`✓ Updated article: "${article.title}"`)
      console.log(`  Added tags: [${seasonTag}, ${monthTag}, ${weekTag}, ...${additionalTags.length > 0 ? `, ${additionalTags.slice(0, 3).join(', ')}${additionalTags.length > 3 ? '...' : ''}` : ''}]`)
      updatedCount++
    } else {
      console.log(`- Skipped article: "${article.title}" (already has time tags)`)
    }
  }

  console.log(`\n✅ Completed! Updated ${updatedCount} articles with time tags.`)
  console.log(`\nTag format examples:`)
  console.log(`  - Season tags: season-spring, season-summer, season-autumn, season-winter`)
  console.log(`  - Month tags: month-january, month-february, ..., month-december`)
  console.log(`  - Week tags: week-1, week-2, ..., week-52`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
