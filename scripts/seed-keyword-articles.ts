import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

// 生成 slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 生成占位内容
function generatePlaceholderContent(title: string): string {
  return `# ${title}

## Introduction

This is a placeholder article for "${title}". Content will be added later.

## Quick Answer

[Content to be added]

## Detailed Guide

[Content to be added]

## Tips

[Content to be added]

## FAQ

[Content to be added]
`
}

async function main() {
  console.log('开始创建关键词占位文章...')

  // 获取管理员用户
  let adminUser = await prisma.user.findFirst({
    where: { isAdmin: true },
  })

  if (!adminUser) {
    adminUser = await prisma.user.findFirst({
      where: { email: 'admin@besttimeguide.com' },
    })
  }

  if (!adminUser) {
    console.error('未找到管理员用户，请先创建管理员用户')
    process.exit(1)
  }

  // 获取所有分类
  const categories = await prisma.category.findMany()
  const categoryMap = new Map(
    categories.map((cat) => [cat.name.toLowerCase(), cat])
  )

  // 关键词分类映射
  const keywords = [
    // Travel
    { keyword: 'best time to visit japan', category: 'Travel' },
    { keyword: 'best time to visit hawaii', category: 'Travel' },
    { keyword: 'best time to visit iceland', category: 'Travel' },
    { keyword: 'best time to visit costa rica', category: 'Travel' },
    { keyword: 'best time to visit ireland', category: 'Travel' },
    { keyword: 'best time to visit alaska', category: 'Travel' },
    { keyword: 'best time to visit thailand', category: 'Travel' },
    { keyword: 'best time to visit italy', category: 'Travel' },
    { keyword: 'best time to go to costa rica', category: 'Travel' },
    { keyword: 'best time to visit puerto rico', category: 'Travel' },
    { keyword: 'best time to visit greece', category: 'Travel' },
    { keyword: 'best time to visit yellowstone', category: 'Travel' },
    { keyword: 'best time to visit switzerland', category: 'Travel' },
    { keyword: 'best time to visit portugal', category: 'Travel' },
    { keyword: 'best time to visit cancun', category: 'Travel' },
    { keyword: 'best time to visit bali', category: 'Travel' },
    { keyword: 'best time to go to thailand', category: 'Travel' },
    { keyword: 'best time to go to japan', category: 'Travel' },
    { keyword: 'best time to visit new zealand', category: 'Travel' },
    { keyword: 'best time to visit banff', category: 'Travel' },
    { keyword: 'best time to visit aruba', category: 'Travel' },
    { keyword: 'best time to go to ireland', category: 'Travel' },
    { keyword: 'best time to go to alaska', category: 'Travel' },
    { keyword: 'best time of year to visit japan', category: 'Travel' },
    { keyword: 'best time of year to visit ireland', category: 'Travel' },
    { keyword: 'best time of year to visit iceland', category: 'Travel' },
    { keyword: 'best time to visit yellowstone national park', category: 'Travel' },

    // Social Media
    { keyword: 'best time to post on instagram', category: 'Social Media' },
    { keyword: 'best time to post on tiktok', category: 'Social Media' },
    { keyword: 'best times to post on tiktok', category: 'Social Media' },
    { keyword: 'best time for uploading instagram', category: 'Social Media' },
    { keyword: 'best times to post on instagram', category: 'Social Media' },
    { keyword: 'best time to post on tiktok today', category: 'Social Media' },
    { keyword: 'when is the best time to post on instagram', category: 'Social Media' },
    { keyword: 'best time to post on tiktok saturday', category: 'Social Media' },
    { keyword: 'best time to post on instagram on monday', category: 'Social Media' },
    { keyword: 'best time to post on facebook', category: 'Social Media' },
    { keyword: 'best time to post on instagram today', category: 'Social Media' },

    // Health
    { keyword: 'best time to take lexapro for anxiety', category: 'Health' },
    { keyword: 'best time to take creatine', category: 'Health' },
    { keyword: 'when is the best time to take creatine', category: 'Health' },
    { keyword: 'best time to take vitamin d', category: 'Health' },
    { keyword: 'best time to take magnesium', category: 'Health' },
    { keyword: 'best time to take probiotics', category: 'Health' },
    { keyword: 'best time to take metformin 500 mg once a day', category: 'Health' },
    { keyword: 'best time to take blood pressure', category: 'Health' },
    { keyword: 'best time to take ashwagandha', category: 'Health' },
    { keyword: 'when is the best time to take magnesium', category: 'Health' },
    { keyword: 'best time to take a pregnancy test', category: 'Health' },
    { keyword: 'when is the best time to take a pregnancy test', category: 'Health' },

    // Shopping
    { keyword: 'best time to buy a car', category: 'Shopping' },
    { keyword: 'when is the best time to buy a car', category: 'Shopping' },
    { keyword: 'best time to buy plane tickets', category: 'Shopping' },
    { keyword: 'best time to buy airline tickets', category: 'Shopping' },
    { keyword: 'when is the best time to book a flight', category: 'Shopping' },
    { keyword: 'best time to book a flight', category: 'Shopping' },

    // Lifestyle
    { keyword: 'best time to water grass', category: 'Lifestyle' },
  ]

  let created = 0
  let skipped = 0
  let errors = 0

  for (const { keyword, category } of keywords) {
    try {
      // 获取分类
      const categoryObj = categoryMap.get(category.toLowerCase())
      if (!categoryObj) {
        console.error(`分类 "${category}" 不存在，跳过: ${keyword}`)
        errors++
        continue
      }

      // 生成标题（首字母大写，处理特殊格式）
      const title = keyword
        .split(' ')
        .map((word, index) => {
          // 保持某些词小写
          const lowerWords = ['to', 'on', 'for', 'a', 'an', 'the', 'of', 'is']
          if (index > 0 && lowerWords.includes(word.toLowerCase())) {
            return word.toLowerCase()
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        })
        .join(' ')

      // 生成 slug
      const slug = generateSlug(keyword)

      // 检查是否已存在
      const existing = await prisma.article.findUnique({
        where: { slug },
      })

      if (existing) {
        console.log(`已存在，跳过: ${title} (${slug})`)
        skipped++
        continue
      }

      // 生成描述
      const description = `Discover the best time for ${keyword.replace(/^best time to /i, '').replace(/^when is the best time to /i, '')}. Complete guide with expert tips and data-driven insights.`

      // 生成内容
      const content = generatePlaceholderContent(title)

      // 创建文章
      await prisma.article.create({
        data: {
          title,
          slug,
          description,
          content,
          categoryId: categoryObj.id,
          authorId: adminUser.id,
          published: false, // 占位文章，先不发布
          featured: false,
          tags: JSON.stringify([category.toLowerCase().replace(/\s+/g, '-'), 'guide', 'best-time']),
          readingTime: 5, // 占位值
        },
      })

      console.log(`✓ 创建: ${title}`)
      created++
    } catch (error: any) {
      console.error(`✗ 错误 (${keyword}):`, error.message)
      errors++
    }
  }

  console.log('\n完成！')
  console.log(`创建: ${created} 篇`)
  console.log(`跳过: ${skipped} 篇`)
  console.log(`错误: ${errors} 篇`)
}

main()
  .catch((e) => {
    console.error('错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

