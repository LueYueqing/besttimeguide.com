-- CreateTable
CREATE TABLE "article_feedbacks" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_feedbacks_articleId_idx" ON "article_feedbacks"("articleId");

-- CreateIndex
CREATE INDEX "article_feedbacks_helpful_idx" ON "article_feedbacks"("helpful");

-- CreateIndex
CREATE INDEX "article_feedbacks_createdAt_idx" ON "article_feedbacks"("createdAt");

-- AddForeignKey
ALTER TABLE "article_feedbacks" ADD CONSTRAINT "article_feedbacks_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

