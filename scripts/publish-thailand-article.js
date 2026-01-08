const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function publishArticle() {
  try {
    const article = await prisma.article.update({
      where: { slug: 'best-time-to-visit-thailand' },
      data: {
        published: true,
        publishedAt: new Date(),
      }
    });
    
    console.log('Article published successfully!');
    console.log('Slug:', article.slug);
    console.log('Title:', article.title);
    console.log('Published:', article.published);
    console.log('PublishedAt:', article.publishedAt);
    
  } catch (error) {
    console.error('Error publishing article:', error);
  } finally {
    await prisma.$disconnect();
  }
}

publishArticle();
