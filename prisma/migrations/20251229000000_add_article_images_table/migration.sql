-- Create article_images table
CREATE TABLE "article_images" (
    "id" SERIAL PRIMARY KEY,
    "articleId" INTEGER NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "r2Path" VARCHAR(500) NOT NULL,
    "r2Url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "sourceUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "article_images_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "article_images_articleId_idx" ON "article_images"("articleId");
CREATE INDEX "article_images_slug_idx" ON "article_images"("slug");
CREATE INDEX "article_images_size_idx" ON "article_images"("size");
CREATE INDEX "article_images_order_idx" ON "article_images"("order");
