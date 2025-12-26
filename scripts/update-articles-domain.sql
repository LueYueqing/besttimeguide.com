-- 更新 articles 表中的域名
-- 将 "0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com" 替换为 "cdn.besttimeguide.com"

-- 方式1: 只更新包含旧域名的记录（推荐，更安全）
UPDATE articles 
SET 
  content = REPLACE(content, '0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com', 'cdn.besttimeguide.com'),
  sourceContent = REPLACE(sourceContent, '0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com', 'cdn.besttimeguide.com')
WHERE 
  content LIKE '%0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com%' 
  OR sourceContent LIKE '%0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com%';

-- 方式2: 更新所有记录（如果确定所有记录都需要检查，可以使用这个）
-- UPDATE articles 
-- SET 
--   content = REPLACE(content, '0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com', 'cdn.besttimeguide.com'),
--   sourceContent = REPLACE(sourceContent, '0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com', 'cdn.besttimeguide.com');

-- 执行前可以先查看有多少条记录需要更新
-- SELECT COUNT(*) 
-- FROM articles 
-- WHERE 
--   content LIKE '%0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com%' 
--   OR sourceContent LIKE '%0d2674a3b67e505e563ba14537001ed2.r2.cloudflarestorage.com%';

