/**
 * 检查文章的标题和内容
 * 使用方法: node scripts/check-article-content.js <slug>
 */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const slug = process.argv[2]

if (!slug) {
  console.error('请提供文章 slug')
  console.log('使用方法: node scripts/check-article-content.js <slug>')
  process.exit(1)
}

async function checkArticle() {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, title: true, content: true }
    })
    
    if (!article) {
      console.log('❌ 文章不存在')
      process.exit(1)
    }
    
    console.log('📄 文章标题:', article.title)
    console.log('\n📝 文章内容（前1000字符）:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(article.content.substring(0, 1000))
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // 检查内容中是否有 h1 标题
    const h1Match = article.content.match(/^#\s+(.+?)\s*$/m)
    if (h1Match) {
      console.log('\n🔍 内容中的第一个 h1 标题:')
      console.log('  ', h1Match[1].trim())
      console.log('  与页面标题相同?', h1Match[1].trim() === article.title ? '✅ 是' : '❌ 否')
    } else {
      console.log('\n🔍 内容中没有找到 h1 标题')
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ 错误:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkArticle()
