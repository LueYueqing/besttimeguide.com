-- 更新文章标签：去掉 season- 和 month- 前缀
-- season-spring → spring
-- season-winter → winter
-- month-april → april
-- month-may → may

UPDATE "Article"
SET "tags" = (
  SELECT jsonb_agg(
    CASE
      WHEN tag LIKE 'season-%' THEN substring(tag from 8)
      WHEN tag LIKE 'month-%' THEN substring(tag from 7)
      ELSE tag
    END
  )
  FROM jsonb_array_elements("tags") AS tag
)
WHERE "tags" @> '%"season-%' OR "tags" @> '%"month-%';
