/**
 * 查询并批量重置所有卡在"处理中"状态的文章（包括已发布和未发布的）
 * 使用方法: node scripts/reset-all-processing-articles.js
 */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findAndResetAllProcessingArticles() {
  try {
    console.log('\n🔍 正在查询所有卡在"处理中"状态的文章...\n')

    // 查询所有处于处理中状态的文章（无论是否已发布）
    const processingArticles = await prisma.article.findMany({
      where: {
        aiRewriteStatus: 'processing',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        aiRewriteAt: true,
        content: true,
        coverImage: true,
        updatedAt: true,
      },
      orderBy: {
        aiRewriteAt: 'desc',
      },
    })

    if (processingArticles.length === 0) {
      console.log('✅ 没有发现卡在"处理中"状态的文章！')
      await prisma.$disconnect()
      process.exit(0)
    }

    console.log(`\n📋 发现 ${processingArticles.length} 篇卡在"处理中"状态的文章:\n`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const now = new Date()
    
    for (let i = 0; i < processingArticles.length; i++) {
      const article = processingArticles[i]
      const hoursStuck = article.aiRewriteAt 
        ? ((now.getTime() - new Date(article.aiRewriteAt).getTime()) / (1000 * 60 * 60)).toFixed(1)
        : 'N/A'
      
      console.log(`\n${i + 1}. ID: ${article.id}`)
      console.log(`   标题: ${article.title}`)
      console.log(`   状态: ${article.published ? '✅ 已发布' : '❌ 草稿'}`)
      console.log(`   卡住时间: ${hoursStuck} 小时前`)
      console.log(`   有内容: ${article.content ? '✅ 是 (' + article.content.length + ' 字符)' : '❌ 否'}`)
      console.log(`   有封面图: ${article.coverImage ? '✅ 是' : '❌ 否'}`)
      console.log(`   最后更新: ${article.updatedAt.toLocaleString('zh-CN')}`)
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // 询问确认
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise((resolve) => {
      rl.question(`\n⚠️  确定要重置这 ${processingArticles.length} 篇文章吗？\n\n这将：\n  - 将状态设置为 'pending'\n  - 清空内容\n  - 清空封面图\n  - 将文章设置为草稿状态\n  - 绕过冷却期\n\n输入 'yes' 继续: `, (ans) => {
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
    let hadContentCount = 0
    let hadCoverCount = 0

    for (const article of processingArticles) {
      try {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            aiRewriteAt: resetTime,
            aiRewriteStatus: 'pending',
            content: '',
            coverImage: null,
            published: false,
          },
        })
        
        if (article.content && article.content.length > 0) hadContentCount++
        if (article.coverImage) hadCoverCount++
        
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
    console.log(`   📄 清空内容的文章: ${hadContentCount} 篇`)
    console.log(`   🖼️  清空封面图的文章: ${hadCoverCount} 篇`)
    console.log('\n💡 所有重置成功的文章现在处于待处理队列，AI 将在下次处理时重新生成内容。')

    await prisma.$disconnect()
  } catch (error) {
    console.error('\n❌ 执行过程中出错:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

findAndResetAllProcessingArticles()
