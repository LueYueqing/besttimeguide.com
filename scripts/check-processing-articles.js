/**
 * 检查所有处于"处理中"状态的文章
 * 使用方法: node scripts/check-processing-articles.js
 */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkProcessingArticles() {
  try {
    console.log('\n🔍 正在查找所有处于"处理中"状态的文章...\n')

    const processingArticles = await prisma.article.findMany({
      where: {
        aiRewriteStatus: 'processing'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        aiRewriteStatus: true,
        aiRewriteAt: true,
        articleMode: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        aiRewriteAt: 'desc'
      }
    })

    if (processingArticles.length === 0) {
      console.log('✅ 没有处于"处理中"状态的文章')
      await prisma.$disconnect()
      return
    }

    console.log(`📊 找到 ${processingArticles.length} 篇处于"处理中"状态的文章:\n`)

    const now = new Date()
    
    for (const article of processingArticles) {
      console.log('━'.repeat(80))
      console.log(`📄 文章 ID: ${article.id}`)
      console.log(`  标题: ${article.title}`)
      console.log(`  已发布: ${article.published ? '✅ 是' : '❌ 否'}`)
      console.log(`  文章模式: ${article.articleMode || 'null'}`)
      console.log(`  封面图: ${article.coverImage ? '✅ 有' : '❌ 无'}`)
      
      if (article.aiRewriteAt) {
        const processingSince = new Date(article.aiRewriteAt)
        const minutesSince = (now.getTime() - processingSince.getTime()) / (1000 * 60)
        const hoursSince = minutesSince / 60
        
        console.log(`  开始处理时间: ${processingSince.toLocaleString('zh-CN')}`)
        console.log(`  已处理时长: ${hoursSince.toFixed(1)} 小时 (${minutesSince.toFixed(0)} 分钟)`)
        
        if (hoursSince > 1) {
          console.log(`  ⚠️  警告：文章处理时间超过 1 小时，可能已卡住`)
        }
      } else {
        console.log(`  开始处理时间: null`)
      }
      
      console.log(`  创建时间: ${article.createdAt.toLocaleString('zh-CN')}`)
      console.log(`  更新时间: ${article.updatedAt.toLocaleString('zh-CN')}`)
      console.log()
    }

    console.log('━'.repeat(80))
    console.log(`\n💡 建议:\n`)
    console.log('1. 如果文章处理时间超过 1 小时，可能需要强制重置')
    console.log('2. 在前端管理界面中，可以点击重置按钮（橙色图标）清空内容并重新生成')
    console.log('3. 或者使用 reset-stuck-articles.js 脚本批量重置\n')

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ 检查过程中出错:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkProcessingArticles()
