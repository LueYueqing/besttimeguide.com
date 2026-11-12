const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const links = [
  {
    from: 'best-time-to-post-on-instagram',
    to: [
      'best-time-to-post-in-instagram-on-sunday',
      'best-time-to-post-on-instagram-on-a-saturday',
      'best-time-to-post-on-wednesday-instagram',
      'best-time-to-upload-on-instagram-on-sunday',
      'best-time-to-upload-on-instagram-on-saturday',
      'best-time-to-post-on-instagram-on-saturday',
      'when-is-the-best-time-to-post-on-facebook',
    ],
  },
  {
    from: 'china-best-time-to-visit',
    to: [
      'best-time-to-travel-to-hong-kong-china',
      'best-time-to-visit-shanghai-china',
      'what-is-the-best-time-to-visit-china',
    ],
  },
  {
    from: 'best-time-to-visit-iceland',
    to: ['best-time-to-see-northern-lights-in-norway', 'best-time-to-visit-amsterdam-netherlands'],
  },
  {
    from: 'best-time-to-water-grass',
    to: ['when-is-the-best-time-to-transplant-echinacea', 'best-time-to-transplant-echinacea'],
  },
]

async function ensureRelation(fromSlug, toSlug) {
  const from = await prisma.article.findUnique({ where: { slug: fromSlug }, select: { id: true } })
  const to = await prisma.article.findUnique({
    where: { slug: toSlug },
    select: { id: true, published: true },
  })
  if (!from || !to || !to.published) {
    console.log(`[skip] ${fromSlug} -> ${toSlug}`)
    return
  }

  const existing = await prisma.articleRelation.findFirst({
    where: { articleId: from.id, relatedArticleId: to.id },
  })
  if (existing) {
    await prisma.articleRelation.update({
      where: { id: existing.id },
      data: { weight: Math.max(existing.weight || 0, 110) },
    })
    console.log(`[update] ${fromSlug} -> ${toSlug}`)
    return
  }

  await prisma.articleRelation.create({
    data: {
      articleId: from.id,
      relatedArticleId: to.id,
      type: 'TAG',
      weight: 110,
      matchedTags: null,
    },
  })
  console.log(`[create] ${fromSlug} -> ${toSlug}`)
}

async function main() {
  for (const group of links) {
    for (const to of group.to) {
      await ensureRelation(group.from, to)
    }
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
