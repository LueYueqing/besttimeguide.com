const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArticle() {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: 'best-time-to-visit-thailand' },
      include: { category: true, author: true }
    });
    
    console.log('Article found:', !!article);
    if (article) {
      console.log('Published:', article.published);
      console.log('PublishedAt:', article.publishedAt);
      console.log('Title:', article.title);
      console.log('Category:', article.category?.name);
      console.log('Author:', article.author?.name || article.author?.email);
    } else {
      console.log('Article not found in database');
    }
    
    // Check for similar slugs
    const similar = await prisma.article.findMany({
      where: {
        slug: { contains: 'thailand' }
      },
      select: { slug: true, title: true }
    });
    console.log('\nArticles with "thailand" in slug:');
    similar.forEach(a => console.log(`  - ${a.slug}: ${a.title}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticle();
