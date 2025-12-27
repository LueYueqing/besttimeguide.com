/**
 * 测试时间标签功能
 * 验证新创建和更新的文章会自动添加正确的时间标签
 */

import { PrismaClient } from '@prisma/client'
import { generateTimeTags, parseTags, generateArticleTags, mergeWithTimeTags } from '../lib/article-tags'

const prisma = new PrismaClient()

async function testTimeTags() {
  console.log('🧪 开始测试时间标签功能...\n')

  // 测试1: 生成时间标签
  console.log('📌 测试1: 生成当前时间标签')
  const currentDate = new Date()
  console.log(`当前日期: ${currentDate.toISOString()}`)
  
  const timeTags = generateTimeTags(currentDate)
  console.log(`生成的时间标签: ${JSON.stringify(timeTags)}`)
  console.log(`✅ 预期包含: season-*, month-*, week-*\n`)

  // 测试2: 合并标签（去除旧时间标签）
  console.log('📌 测试2: 合并标签（去除旧时间标签）')
  const oldTags = ['season-spring', 'month-march', 'week-10', 'technology', 'tutorial']
  console.log(`旧标签: ${JSON.stringify(oldTags)}`)
  
  const mergedTags = mergeWithTimeTags(oldTags, currentDate, true)
  console.log(`合并后的标签: ${JSON.stringify(mergedTags)}`)
  console.log(`✅ 应该移除旧的时间标签并添加新的\n`)

  // 测试3: 生成完整文章标签
  console.log('📌 测试3: 生成完整文章标签')
  const existingTags = ['qr-code', 'generator', 'season-winter']
  console.log(`现有标签: ${JSON.stringify(existingTags)}`)
  
  const articleTags = generateArticleTags(existingTags, currentDate, true)
  const parsedTags = JSON.parse(articleTags)
  console.log(`生成的文章标签: ${JSON.stringify(parsedTags)}`)
  console.log(`✅ 应该包含现有标签（除时间标签外）和新时间标签\n`)

  // 测试4: 测试特定日期
  console.log('📌 测试4: 测试特定日期（2025年12月27日）')
  const testDate = new Date('2025-12-27')
  console.log(`测试日期: ${testDate.toISOString()}`)
  
  const testTimeTags = generateTimeTags(testDate)
  console.log(`生成的标签: ${JSON.stringify(testTimeTags)}`)
  console.log(`✅ 预期: season-winter, month-december, week-52\n`)

  // 测试5: 检查数据库中的文章标签
  console.log('📌 测试5: 检查数据库中的文章标签')
  try {
    const articles = await prisma.article.findMany({
      where: {
        published: true,
        tags: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        tags: true,
        publishedAt: true,
      },
      take: 5,
    })

    console.log(`找到 ${articles.length} 篇已发布的文章:\n`)

    articles.forEach(article => {
      if (article.tags) {
        const tags = parseTags(article.tags)
        const hasTimeTags = tags.some(tag => 
          tag.startsWith('season-') || 
          tag.startsWith('month-') || 
          tag.startsWith('week-')
        )
        
        console.log(`文章 ID: ${article.id}`)
        console.log(`标题: ${article.title}`)
        console.log(`发布时间: ${article.publishedAt?.toISOString()}`)
        console.log(`标签: ${JSON.stringify(tags)}`)
        console.log(`包含时间标签: ${hasTimeTags ? '✅ 是' : '❌ 否'}`)
        console.log('---')
      }
    })
  } catch (error) {
    console.error('❌ 数据库查询失败:', error)
  }

  console.log('\n✅ 测试完成!')
}

// 运行测试
testTimeTags()
  .catch((error) => {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
