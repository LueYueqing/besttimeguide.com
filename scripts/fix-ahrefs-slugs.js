const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function renameSlug(from, to, extra = {}) {
  const existing = await prisma.article.findUnique({ where: { slug: from } })
  if (!existing) {
    console.log(`[skip] ${from} not found`)
    return null
  }
  const conflict = await prisma.article.findUnique({ where: { slug: to } })
  if (conflict) {
    console.log(`[skip] target ${to} already exists (id=${conflict.id})`)
    return null
  }
  const updated = await prisma.article.update({
    where: { slug: from },
    data: { slug: to, ...extra },
  })
  console.log(`[ok] ${from} -> ${to} (id=${updated.id}, published=${updated.published})`)
  return updated
}

async function main() {
  // Prefer primary keyword slug used on homepage / Ahrefs
  await renameSlug('best-time-to-go-to-thailand', 'best-time-to-visit-thailand', {
    title: 'Best Time to Visit Thailand',
  })

  // Publish + rename TikTok guide to the 40.5K keyword slug
  await renameSlug('best-times-to-post-on-tiktok', 'best-time-to-post-on-tiktok', {
    published: true,
    publishedAt: new Date(),
    title: 'Best Time to Post on TikTok',
  })

  // Homepage links to this unpublished Italy guide
  const italy = await prisma.article.findUnique({ where: { slug: 'best-time-to-visit-italy' } })
  if (italy && !italy.published) {
    await prisma.article.update({
      where: { slug: 'best-time-to-visit-italy' },
      data: { published: true, publishedAt: italy.publishedAt || new Date() },
    })
    console.log('[ok] published best-time-to-visit-italy')
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
