/**
 * 检查文章的 AI 处理状态
 * 使用方法: node scripts/check-article-ai-status.js <id>
 */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const articleId = parseInt(process.argv[2], 10)

if (!articleId || isNaN(articleId)) {
  console.error('请提供有效的文章 ID')
  console.log('使用方法: node scripts/check-article-ai-status.js <id>')
  process.exit(1)
}

async function checkArticle() {
  try {
    console.log(`\n🔍 正在检查文章 ID: ${articleId}\n`)

    const article = await prisma.article.findUnique({
      where: { id: articleId },
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
        publishedAt: true,
      },
    })

    if (!article) {
      console.log('❌ 文章不存在！')
      process.exit(1)
    }

    console.log('✅ 文章存在！')
    console.log(`\n📄 文章信息:`)
    console.log(`  ID: ${article.id}`)
    console.log(`  标题: ${article.title}`)
    console.log(`  已发布: ${article.published ? '✅ 是' : '❌ 否'}`)
    
    console.log(`\n🤖 AI 处理状态:`)
    console.log(`  状态: ${article.aiRewriteStatus || 'null'}`)
    console.log(`  最后处理时间: ${article.aiRewriteAt || 'null'}`)
    console.log(`  文章模式: ${article.articleMode || 'null'}`)
    console.log(`  封面图: ${article.coverImage ? '✅ 有' : '❌ 无'}`)
    
    // 计算冷却时间
    if (article.aiRewriteAt) {
      const lastProcessed = new Date(article.aiRewriteAt)
      const now = new Date()
      const hoursSinceLastProcess = (now.getTime() - lastProcessed.getTime()) / (1000 * 60 * 60)
      const isInCooldown = hoursSinceLastProcess < 24
      
      console.log(`  距离上次处理: ${hoursSinceLastProcess.toFixed(1)} 小时`)
      console.log(`  冷却中: ${isInCooldown ? '⏳ 是' : '✅ 否'}`)
    }

    console.log(`\n⏰ 时间信息:`)
    console.log(`  创建时间: ${article.createdAt}`)
    console.log(`  更新时间: ${article.updatedAt}`)
    console.log(`  发布时间: ${article.publishedAt || 'null'}`)

    console.log(`\n🔗 预期 URL: https://besttimeguide.com/${article.slug}`)

    // 诊断建议
    console.log(`\n💡 诊断建议:`)
    if (!article.aiRewriteStatus) {
      console.log('  - 文章没有 AI 处理状态，这是正常的')
    } else if (article.aiRewriteStatus === 'processing') {
      console.log('  ⚠️  文章处于"处理中"状态，可能 AI 处理卡住了')
      console.log('  - 建议在前端使用"强制重置"按钮清空并重新生成')
    } else if (article.aiRewriteStatus === 'failed') {
      console.log('  ⚠️  文章 AI 处理失败')
      if (article.aiRewriteAt) {
        const lastProcessed = new Date(article.aiRewriteAt)
        const now = new Date()
        const hoursSinceLastProcess = (now.getTime() - lastProcessed.getTime()) / (1000 * 60 * 60)
        if (hoursSinceLastProcess < 24) {
          console.log(`  - 距离上次失败仅 ${hoursSinceLastProcess.toFixed(1)} 小时，还在24小时冷却期内`)
          console.log('  - 可以点击重置按钮绕过冷却期重新生成')
        } else {
          console.log('  - 已过冷却期，可以重新生成')
        }
      }
    } else if (article.aiRewriteStatus === 'completed') {
      console.log('  ✅ 文章 AI 处理已完成')
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ 检查过程中出错:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkArticle()
