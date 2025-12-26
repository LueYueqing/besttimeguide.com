/**
 * 检查文章状态和 slug
 * 使用方法: node scripts/check-article.js <slug>
 * 例如: node scripts/check-article.js best-time-to-visit-new-zealand
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const slug = process.argv[2]

if (!slug) {
  console.error('请提供文章 slug')
  console.log('使用方法: node scripts/check-article.js <slug>')
  console.log('例如: node scripts/check-article.js best-time-to-visit-new-zealand')
  process.exit(1)
}

async function checkArticle() {
  try {
    console.log(`\n🔍 正在检查文章: ${slug}\n`)

    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { slug },
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
      console.log(`\n查找相似的文章...`)
      
      // 查找相似的文章
      const similarArticles = await prisma.article.findMany({
        where: {
          slug: {
            contains: slug.split('-').slice(-2).join('-'), // 查找包含最后两个词的
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
        },
        take: 5,
      })

      if (similarArticles.length > 0) {
        console.log('\n找到相似的文章:')
        similarArticles.forEach((a) => {
          console.log(`  - ID: ${a.id}, Slug: ${a.slug}, Published: ${a.published}, Title: ${a.title}`)
        })
      }

      // 查找所有包含 "new-zealand" 的文章
      const nzArticles = await prisma.article.findMany({
        where: {
          OR: [
            { slug: { contains: 'new-zealand' } },
            { slug: { contains: 'newzealand' } },
            { title: { contains: 'New Zealand', mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
        },
        take: 10,
      })

      if (nzArticles.length > 0) {
        console.log('\n找到包含 "New Zealand" 的文章:')
        nzArticles.forEach((a) => {
          console.log(`  - ID: ${a.id}, Slug: ${a.slug}, Published: ${a.published}, Title: ${a.title}`)
        })
      }

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

    if (!article.published) {
      console.log('\n⚠️  警告: 文章未发布！这是导致 404 的原因。')
      console.log('   请在后台将文章设置为"已发布"状态。')
    } else {
      console.log('\n✅ 文章已发布，应该可以正常访问。')
      console.log(`\n🔗 预期 URL: https://besttimeguide.com/${article.slug}`)
      
      // 检查 slug 是否匹配
      if (article.slug !== slug) {
        console.log(`\n⚠️  警告: Slug 不匹配！`)
        console.log(`   数据库中的 slug: ${article.slug}`)
        console.log(`   查询的 slug: ${slug}`)
        console.log(`   正确的 URL 应该是: https://besttimeguide.com/${article.slug}`)
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

