-- ======================================================================================
-- 数据库图片链接替换脚本
-- 用于将旧的 Cloudflare R2 原始链接替换为新的 CDN 链接
-- ======================================================================================

-- ⚠️ 执行前请注意：
-- 1. 请先备份数据库！
-- 2. 请将下方的 placeholder 替换为你实际的配置：
--    YOUR_ACCOUNT_ID -> 你的 Cloudflare Account ID (例如: 0d2674a3b67e505e563ba14537001ed2)
--    YOUR_CDN_URL    -> 你的 CDN 基础 URL (例如: https://cdn.besttimeguide.com)

-- 替换 content 字段中的 R2 链接
UPDATE "Article"
SET "content" = REPLACE(
    "content", 
    'https://0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com', 
    'https://cdn.besttimeguide.com'
)
WHERE "content" LIKE '%https://0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com%';

-- 替换 sourceContent 字段中的 R2 链接
UPDATE "Article"
SET "sourceContent" = REPLACE(
    "sourceContent", 
    'https://0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com', 
    'https://cdn.besttimeguide.com'
)
WHERE "sourceContent" LIKE '%https://0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com%';

-- 如果你之前使用的是 r2.dev 的公共链接，也可以取消注释并运行以下语句：
/*
UPDATE "Article"
SET "content" = REPLACE("content", 'https://pub-YOUR_HASH.r2.dev', 'YOUR_CDN_URL'),
    "sourceContent" = REPLACE("sourceContent", 'https://pub-YOUR_HASH.r2.dev', 'YOUR_CDN_URL')
WHERE "content" LIKE '%r2.dev%' OR "sourceContent" LIKE '%r2.dev%';
*/

-- 验证替换结果
SELECT id, title, content
FROM "Article"
WHERE "content" LIKE '%https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com%'
LIMIT 5;
