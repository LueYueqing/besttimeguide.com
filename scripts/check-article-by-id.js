/**
 * 通过文章ID检查文章状态和 slug
 * 使用方法: node scripts/check-article-by-id.js <id>
 * 例如: node scripts/check-article-by-id.js 20
 */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const articleId = parseInt(process.argv[2], 10)

if (!articleId || isNaN(articleId)) {
  console.error('请提供有效的文章 ID')
  console.log('使用方法: node scripts/check-article-by-id.js <id>')
  console.log('例如: node scripts/check-article-by-id.js 20')
  process.exit(1)
}

async function checkArticle() {
  try {
    console.log(`\n🔍 正在检查文章 ID: ${articleId}\n`)

    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    console.log(`  Slug: ${article.slug}`)
    console.log(`  已发布: ${article.published ? '✅ 是' : '❌ 否'}`)
    console.log(`  分类: ${article.category.name}`)
    console.log(`  作者: ${article.author.name || article.author.email}`)
    console.log(`  创建时间: ${article.createdAt}`)
    console.log(`  更新时间: ${article.updatedAt}`)
    if (article.publishedAt) {
      console.log(`  发布时间: ${article.publishedAt}`)
    }
    console.log(`  内容长度: ${article.content?.length || 0} 字符`)

    console.log(`\n🔗 预期 URL: https://besttimeguide.com/${article.slug}`)

    if (!article.published) {
      console.log('\n⚠️  警告: 文章未发布！这是导致 404 的原因。')
      console.log('   请在后台将文章设置为"已发布"状态。')
    } else {
      console.log('\n✅ 文章已发布，应该可以正常访问。')
      
      // 测试是否能通过 getPostBySlug 获取
      console.log(`\n🧪 测试通过 slug 查询...`)
      const articleBySlug = await prisma.article.findUnique({
        where: { slug: article.slug },
      })
      
      if (articleBySlug && articleBySlug.published) {
        console.log('✅ 通过 slug 查询成功，文章已发布')
      } else if (articleBySlug && !articleBySlug.published) {
        console.log('⚠️  通过 slug 查询成功，但文章未发布')
      } else {
        console.log('❌ 通过 slug 查询失败')
      }
    }

    // 检查是否有内容
    if (!article.content || article.content.trim().length === 0) {
      console.log('\n⚠️  警告: 文章内容为空！')
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ 检查过程中出错:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkArticle()

