-- 修复 article_relations 表的结构
-- 这个脚本会删除现有的约束，然后让 Prisma 重新创建正确的结构

-- 先删除可能存在的外键约束
DO $$
DECLARE
    fk_constraint TEXT;
BEGIN
    FOR fk_constraint IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'article_relations'::regclass 
        AND contype = 'f'
    LOOP
        EXECUTE 'ALTER TABLE article_relations DROP CONSTRAINT IF EXISTS ' || fk_constraint;
    END LOOP;
END $$;

-- 删除现有的唯一约束
ALTER TABLE article_relations DROP CONSTRAINT IF EXISTS article_relations_article_id_related_article_id_type_key;

-- 删除现有的索引
DROP INDEX IF EXISTS article_relations_article_id_related_article_id_type_key;

-- 删除表（如果需要完全重建）
-- DROP TABLE IF EXISTS article_relations CASCADE;
