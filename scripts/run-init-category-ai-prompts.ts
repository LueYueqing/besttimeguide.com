import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { config } from 'dotenv';

// 加载 .env.local 文件
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function executeSQL() {
  try {
    const sqlContent = fs.readFileSync('scripts/init-category-ai-prompts.sql', 'utf-8');
    
    // 分割 SQL 语句（按分号分隔）
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`准备执行 ${statements.length} 条 SQL 语句...`);
    
    for (let i = 0; i < statements.length; i++) {
      try {
        const result = await prisma.$executeRawUnsafe(statements[i]);
        console.log(`✓ 语句 ${i + 1}/${statements.length} 执行成功`);
      } catch (err: any) {
        console.log(`✗ 语句 ${i + 1}/${statements.length} 执行失败:`, err.message);
      }
    }
    
    // 验证更新结果
    const categories = await prisma.$queryRaw`
      SELECT "id", "name", "slug", 
             CASE WHEN "aiPrompt" IS NOT NULL THEN '✓ 已设置' ELSE '✗ 未设置' END as status,
             LEFT("aiPrompt", 100) as preview
      FROM "categories"
      WHERE "slug" IN ('travel', 'social-media', 'health', 'shopping', 'lifestyle')
    `;
    
    console.log('\n=== 验证结果 ===');
    console.log(categories);
    
  } catch (error) {
    console.error('SQL 执行失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

executeSQL();
