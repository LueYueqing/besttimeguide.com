import { PrismaClient } from '@prisma/client'
import { prisma } from '../lib/prisma'

// 解析tags（从JSON字符串或数组）
function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // 如果不是JSON，尝试按逗号分割
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
  }
}

/**
 * 为单篇文章生成关联关系
 * 策略：优先查询同分类文章，不足则补充同标签文章
 */
export async function generateRelationsForArticle(articleId: number) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      category: true,
    },
  })

  if (!article) {
    console.log(`[Skip] Article ${articleId} not found`)
    return
  }

  // 检查是否已有关联
  const existingCount = await prisma.articleRelation.count({
    where: { articleId },
  })

  if (existingCount >= 6) {
    console.log(`[Skip] Article ${articleId} already has ${existingCount} relations`)
    return
  }

  console.log(`[Generate] Starting relations generation for article ${articleId}: ${article.title}`)

  // 1. 优先查询同分类的文章（权重100，最高）
  const categoryPosts = await prisma.article.findMany({
    where: {
      id: { not: articleId },
      categoryId: article.categoryId,
      published: true,
      publishedAt: { lte: new Date() },
    },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  })

  const categoryRelations = categoryPosts.map(related => ({
    articleId,
    relatedArticleId: related.id,
    type: 'CATEGORY' as const,
    weight: 100,
    matchedTags: null,
  }))

  // 2. 如果同分类文章不足6篇，查询同标签的文章补充
  const articleTags = parseTags(article.tags)
  const tagRelations: any[] = []

  if (articleTags.length > 0 && categoryPosts.length < 6) {
    const neededCount = 6 - categoryPosts.length
    
    // 查询有相同标签的文章（排除已关联的）
    const tagPosts = await prisma.article.findMany({
      where: {
        id: {
          notIn: [articleId, ...categoryPosts.map(p => p.id)],
        },
        published: true,
        publishedAt: { lte: new Date() },
      },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 20, // 候选20篇
    })

    // 在应用层计算标签匹配度
    const tagMatches = tagPosts.map(post => {
      const postTags = parseTags(post.tags)
      const matched = articleTags.filter(tag => postTags.includes(tag))
      return {
        post,
        matchedCount: matched.length,
        matchedTags: matched,
      }
    })
    .filter(item => item.matchedCount > 0)
    .sort((a, b) => b.matchedCount - a.matchedCount)
    .slice(0, neededCount) // 只取需要的数量

    tagMatches.forEach(match => {
      tagRelations.push({
        articleId,
        relatedArticleId: match.post.id,
        type: 'TAG' as const,
        weight: match.matchedCount * 10, // 根据匹配标签数计算权重
        matchedTags: JSON.stringify(match.matchedTags),
      })
    })
  }

  // 3. 删除旧关联并创建新关联
  await prisma.$transaction(async (tx) => {
    // 删除旧关联
    await tx.articleRelation.deleteMany({
      where: { articleId },
    })

    // 创建新关联
    const allRelations = [...categoryRelations, ...tagRelations]
    
    if (allRelations.length > 0) {
      await tx.articleRelation.createMany({
        data: allRelations,
        skipDuplicates: true, // 跳过重复记录
      })
    }
  })

  console.log(`[Done] Generated ${allRelations.length} relations for article ${articleId}`)
  return allRelations.length
}

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2)
  const articleId = args[0] ? parseInt(args[0], 10) : null

  if (articleId) {
    // 生成单篇文章的关联
    generateRelationsForArticle(articleId)
      .catch(error => {
        console.error(`[Error] Failed to generate relations for article ${articleId}:`, error)
        process.exit(1)
      })
      .finally(() => {
        prisma.$disconnect()
      })
  } else {
    console.error('Usage: npm run generate-article-relations <articleId>')
    console.error('Example: npm run generate-article-relations 123')
    process.exit(1)
  }
}
