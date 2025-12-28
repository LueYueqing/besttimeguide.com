/**
 * 通过API重置文章状态（绕过冷却期）
 * 使用方法: node scripts/reset-article.js <id>
 * 例如: node scripts/reset-article.js 78
 */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const articleId = parseInt(process.argv[2], 10)

if (!articleId || isNaN(articleId)) {
  console.error('请提供有效的文章 ID')
  console.log('使用方法: node scripts/reset-article.js <id>')
  console.log('例如: node scripts/reset-article.js 78')
  process.exit(1)
}

async function resetArticle() {
  try {
    console.log(`\n🔄 正在重置文章 ID: ${articleId}\n`)

    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        aiRewriteStatus: true,
        aiRewriteAt: true,
        content: true,
        coverImage: true,
      },
    })

    if (!article) {
      console.log('❌ 文章不存在！')
      process.exit(1)
    }

    console.log('📄 文章信息:')
    console.log(`  ID: ${article.id}`)
    console.log(`  标题: ${article.title}`)
    console.log(`  已发布: ${article.published ? '✅ 是' : '❌ 否'}`)
    console.log(`  当前状态: ${article.aiRewriteStatus || 'null'}`)
    console.log(`  有内容: ${article.content ? '✅ 是 (' + article.content.length + ' 字符)' : '❌ 否'}`)
    console.log(`  有封面图: ${article.coverImage ? '✅ 是' : '❌ 否'}`)

    // 询问确认
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    await new Promise((resolve) => {
      rl.question(`\n⚠️  确定要重置这篇文章吗？\n这将：\n  - 将状态设置为 'pending'\n  - 清空内容\n  - 清空封面图\n  - 将文章设置为草稿状态\n  - 绕过冷却期\n\n输入 'yes' 继续: `, (answer) => {
        if (answer.toLowerCase() === 'yes') {
          resolve(true)
        } else {
          console.log('❌ 已取消操作')
          rl.close()
          process.exit(0)
        }
        rl.close()
      })
    })

    console.log('\n🔄 正在重置...')

    // 将 aiRewriteAt 设置为 24 小时前，绕过冷却期
    const cooldownHours = 24
    const resetTime = new Date()
    resetTime.setHours(resetTime.getHours() - cooldownHours - 1)

    // 重置文章
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        aiRewriteAt: resetTime,
        aiRewriteStatus: 'pending',
        content: '',
        coverImage: null,
        published: false,
      },
    })

    console.log('\n✅ 文章重置成功！')
    console.log('\n📊 新状态:')
    console.log(`  ID: ${updatedArticle.id}`)
    console.log(`  状态: ${updatedArticle.aiRewriteStatus}`)
    console.log(`  已发布: ${updatedArticle.published ? '✅ 是' : '❌ 否'}`)
    console.log(`  有内容: ${updatedArticle.content ? '✅ 是' : '❌ 否'}`)
    console.log(`  有封面图: ${updatedArticle.coverImage ? '✅ 是' : '❌ 否'}`)
    console.log('\n💡 文章现在处于待处理队列，AI 将在下次处理时重新生成内容。')

    await prisma.$disconnect()
  } catch (error) {
    console.error('\n❌ 重置过程中出错:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

resetArticle()
