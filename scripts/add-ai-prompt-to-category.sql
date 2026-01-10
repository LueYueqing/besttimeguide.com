-- 添加 aiPrompt 字段到 Category 表
-- 用途：存储 AI 文章生成提示词模板，支持 {title}, {categoryName}, {sourceContent} 变量
-- 执行方式：在 Neon SQL Editor 或 psql 命令行执行

ALTER TABLE "categories" ADD COLUMN "aiPrompt" TEXT;

-- 查询验证字段已添加
SELECT 
    id,
    name,
    slug,
    aiPrompt
FROM "categories"
LIMIT 5;
