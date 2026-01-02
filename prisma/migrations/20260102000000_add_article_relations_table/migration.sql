-- 创建RelationType枚举
CREATE TYPE "RelationType" AS ENUM ('CATEGORY', 'TAG');

-- 创建article_relations表
CREATE TABLE "article_relations" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "relatedArticleId" INTEGER NOT NULL,
    "type" "RelationType" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "matchedTags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_relations_pkey" PRIMARY KEY ("id")
);

-- 创建唯一约束
ALTER TABLE "article_relations" ADD CONSTRAINT "article_relations_articleId_relatedArticleId_type_key" UNIQUE ("articleId", "relatedArticleId", "type");

-- 创建外键约束（源文章）
ALTER TABLE "article_relations" ADD CONSTRAINT "article_relations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 创建外键约束（被关联文章）
ALTER TABLE "article_relations" ADD CONSTRAINT "article_relations_relatedArticleId_fkey" FOREIGN KEY ("relatedArticleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 创建索引
CREATE INDEX "article_relations_articleId_idx" ON "article_relations"("articleId");
CREATE INDEX "article_relations_relatedArticleId_idx" ON "article_relations"("relatedArticleId");
CREATE INDEX "article_relations_type_idx" ON "article_relations"("type");
CREATE INDEX "article_relations_weight_idx" ON "article_relations"("weight");
