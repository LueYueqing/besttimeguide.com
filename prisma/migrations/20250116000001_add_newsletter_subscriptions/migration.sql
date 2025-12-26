-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBED', 'BOUNCED', 'INVALID');

-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "status" "NewsletterStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" VARCHAR(255),
    "userId" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" VARCHAR(255),
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_verificationToken_key" ON "newsletter_subscriptions"("verificationToken");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_email_idx" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_status_idx" ON "newsletter_subscriptions"("status");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_userId_idx" ON "newsletter_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_verified_idx" ON "newsletter_subscriptions"("verified");

-- AddForeignKey
ALTER TABLE "newsletter_subscriptions" ADD CONSTRAINT "newsletter_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

