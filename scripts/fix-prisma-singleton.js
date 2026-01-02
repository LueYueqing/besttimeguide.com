const fs = require('fs');
const path = require('path');

// 需要更新的文件列表
const filesToUpdate = [
  'app/api/articles/[slug]/route.ts',
  'app/api/articles/[slug]/view/route.ts',
  'app/api/articles/[slug]/pdf/route.ts',
  'app/api/articles/[slug]/feedback/route.ts',
  'app/api/articles/[slug]/ai-rewrite/route.ts',
  'app/api/articles/stats/route.ts',
  'app/api/articles/batch/route.ts',
  'app/api/articles/ai-rewrite/route.ts',
  'app/api/articles/ai-generate/route.ts',
  'app/api/articles/check-similarity/route.ts',
  'app/api/user/profile/route.ts',
  'app/api/upload/route.ts',
  'app/api/subscription/cancel/route.ts',
  'app/api/stripe/webhook/route.ts',
  'app/api/search/route.ts',
  'app/api/referral/associate/route.ts',
  'app/api/newsletter/subscribe/route.ts',
  'app/api/checkout/route.ts',
  'app/api/categories/route.ts',
  'app/api/billing/portal/route.ts',
  'app/api/api-keys/[id]/route.ts',
  'app/api/article-images/route.ts',
  'app/api/api-keys/route.ts',
  'app/api/article-images/[id]/replace/route.ts',
  'app/api/analytics/route.ts',
];

console.log('开始批量更新 Prisma 客户端引用...\n');

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  跳过（文件不存在）: ${filePath}`);
      skipCount++;
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');

    // 检查是否已经使用了单例
    if (content.includes("from '@/lib/prisma'") || content.includes("from './prisma'") || content.includes("from '../lib/prisma'")) {
      console.log(`✅ 已使用单例: ${filePath}`);
      skipCount++;
      return;
    }

    // 检查是否包含 PrismaClient 的创建
    if (!content.includes('new PrismaClient()')) {
      console.log(`⚠️  跳过（未找到 PrismaClient）: ${filePath}`);
      skipCount++;
      return;
    }

    // 替换导入
    const importRegex = /import\s+{?\s*PrismaClient\s*}?\s+from\s+['"]@prisma\/client['"]/;
    
    if (!importRegex.test(content)) {
      console.log(`⚠️  跳过（导入格式不匹配）: ${filePath}`);
      skipCount++;
      return;
    }

    // 执行替换
    let newContent = content.replace(
      importRegex,
      "import { prisma } from '@/lib/prisma'"
    );

    // 移除 prisma 实例的创建
    const prismaInstanceRegex = /const\s+prisma\s*=\s*new\s+PrismaClient\(\)\s*;?\s*\n?/g;
    newContent = newContent.replace(prismaInstanceRegex, '');

    // 写入文件
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    console.log(`✅ 更新成功: ${filePath}`);
    successCount++;

  } catch (error) {
    console.error(`❌ 更新失败: ${filePath}`);
    console.error(`   错误: ${error.message}`);
    errorCount++;
  }
});

console.log(`\n========== 更新完成 ==========`);
console.log(`成功: ${successCount}`);
console.log(`跳过: ${skipCount}`);
console.log(`失败: ${errorCount}`);
console.log(`总计: ${filesToUpdate.length}`);
console.log(`===============================\n`);

if (successCount > 0) {
  console.log('✨ 已将所有文件更新为使用 Prisma 单例模式！');
  console.log('这将大大减少数据库连接数量，降低计算资源使用。');
}
