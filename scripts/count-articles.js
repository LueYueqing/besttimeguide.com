require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.article.count({
    where: {
      published: true
    }
  });
  
  console.log(`Total published articles: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
