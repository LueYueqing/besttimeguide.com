/**
 * 查找并重置已发布但没有图片的文章
 * 使用方法: node scripts/fix-articles-without-images.js
 */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findAndFixArticlesWithoutImages() {
  try {
    console.log('\n🔍 正在查找已发布但没有图片的文章...\n')

    // 查询所有已发布的文章
    const publishedArticles = await prisma.article.findMany({
      where: {
        published: true,
        aiRewriteStatus: 'completed',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        coverImage: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    })

    console.log(`📊 共找到 ${publishedArticles.length} 篇已发布的文章`)

    // 筛选出没有图片的文章
    const articlesWithoutImages = []

    for (const article of publishedArticles) {
      const content = article.content || ''
      
      // 检查是否有图片（markdown格式或占位符）
      const hasImageMarkdown = /!\[([^\]]*)\]\(([^)]+)\)/.test(content)
      const hasPlaceholder = content.includes('IMAGE_PLACEHOLDER_')
      const hasCoverImage = !!article.coverImage

      // 如果没有图片markdown，没有占位符，且没有封面图，则认为是没有图片的文章
      if (!hasImageMarkdown && !hasPlaceholder && !hasCoverImage) {
        articlesWithoutImages.push({
          ...article,
          contentLength: content.length,
          hasImageMarkdown,
          hasPlaceholder,
          hasCoverImage,
        })
      }
    }

    if (articlesWithoutImages.length === 0) {
      console.log('\n✅ 没有发现已发布但没有图片的文章！')
      await prisma.$disconnect()
      process.exit(0)
    }

    console.log(`\n📋 发现 ${articlesWithoutImages.length} 篇已发布但没有图片的文章:\n`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    articlesWithoutImages.forEach((article, index) => {
      console.log(`\n${index + 1}. ID: ${article.id}`)
      console.log(`   标题: ${article.title}`)
      console.log(`   Slug: ${article.slug}`)
      console.log(`   内容长度: ${article.contentLength} 字符`)
      console.log(`   有图片Markdown: ${article.hasImageMarkdown ? '✅' : '❌'}`)
      console.log(`   有占位符: ${article.hasPlaceholder ? '✅' : '❌'}`)
      console.log(`   有封面图: ${article.hasCoverImage ? '✅' : '❌'}`)
      console.log(`   最后更新: ${article.updatedAt}`)
    })

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // 询问确认
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise((resolve) => {
      rl.question(`\n⚠️  确定要重置这 ${articlesWithoutImages.length} 篇文章吗？\n\n这将：\n  - 将状态设置为 'pending'\n  - 清空内容\n  - 清空封面图\n  - 将文章设置为草稿状态\n  - 绕过冷却期\n\nAI 将在下次处理时重新生成内容（包含图片占位符）。\n\n输入 'yes' 继续: `, (ans) => {
        rl.close()
        resolve(ans)
      })
    })

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ 已取消操作')
      await prisma.$disconnect()
      process.exit(0)
    }

    console.log('\n🔄 正在批量重置文章...\n')

    // 将 aiRewriteAt 设置为 24 小时前，绕过冷却期
    const cooldownHours = 24
    const resetTime = new Date()
    resetTime.setHours(resetTime.getHours() - cooldownHours - 1)

    let successCount = 0
    let failCount = 0

    for (const article of articlesWithoutImages) {
      try {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            aiRewriteAt: resetTime,
            aiRewriteStatus: 'pending',
            content: '',
            coverImage: null,
            published: false,
            publishedAt: null,
          },
        })
        console.log(`✅ 已重置文章 #${article.id}: ${article.title}`)
        successCount++
      } catch (error) {
        console.error(`❌ 重置文章 #${article.id} 失败:`, error.message)
        failCount++
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📊 批量重置完成:')
    console.log(`   ✅ 成功: ${successCount} 篇`)
    if (failCount > 0) {
      console.log(`   ❌ 失败: ${failCount} 篇`)
    }
    console.log('\n💡 所有重置成功的文章现在处于待处理队列，AI 将在下次处理时重新生成内容（包含图片占位符）。')

    await prisma.$disconnect()
  } catch (error) {
    console.error('\n❌ 执行过程中出错:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

findAndFixArticlesWithoutImages()
