-- 将 User 表的 id 从 String 改为自增 Int
-- ⚠️ 警告：此迁移会清空所有现有数据！
-- 如果数据库中有重要数据，请先备份！

-- 步骤 1: 删除所有外键约束
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_userId_fkey";
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_userId_fkey";
ALTER TABLE "user_subscriptions" DROP CONSTRAINT IF EXISTS "user_subscriptions_userId_fkey";
ALTER TABLE "qr_codes" DROP CONSTRAINT IF EXISTS "qr_codes_userId_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_referredBy_fkey";
ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "referrals_referrerId_fkey";
ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "referrals_referredUserId_fkey";

-- 步骤 2: 删除相关索引
DROP INDEX IF EXISTS "users_referredBy_idx";
DROP INDEX IF EXISTS "referrals_referrerId_idx";
DROP INDEX IF EXISTS "referrals_referredUserId_idx";
DROP INDEX IF EXISTS "user_subscriptions_userId_idx";
DROP INDEX IF EXISTS "qr_codes_userId_idx";

-- 步骤 3: 清空所有相关表（因为外键关系需要重建）
-- 如果不想清空数据，需要创建数据迁移脚本
TRUNCATE TABLE "referrals" CASCADE;
TRUNCATE TABLE "qr_analytics" CASCADE;
TRUNCATE TABLE "qr_codes" CASCADE;
TRUNCATE TABLE "user_subscriptions" CASCADE;
TRUNCATE TABLE "sessions" CASCADE;
TRUNCATE TABLE "accounts" CASCADE;
TRUNCATE TABLE "users" CASCADE;

-- 步骤 4: 删除主键约束
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_pkey";

-- 步骤 5: 删除旧的 id 列和外键列
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "user_subscriptions" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "qr_codes" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "referredBy";
ALTER TABLE "referrals" DROP COLUMN IF EXISTS "referrerId";
ALTER TABLE "referrals" DROP COLUMN IF EXISTS "referredUserId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "id";

-- 步骤 6: 创建新的自增 id 列
ALTER TABLE "users" ADD COLUMN "id" SERIAL PRIMARY KEY;

-- 步骤 7: 添加新的外键列
ALTER TABLE "accounts" ADD COLUMN "userId" INTEGER NOT NULL;
ALTER TABLE "sessions" ADD COLUMN "userId" INTEGER NOT NULL;
ALTER TABLE "user_subscriptions" ADD COLUMN "userId" INTEGER NOT NULL;
ALTER TABLE "qr_codes" ADD COLUMN "userId" INTEGER;
ALTER TABLE "users" ADD COLUMN "referredBy" INTEGER;
ALTER TABLE "referrals" ADD COLUMN "referrerId" INTEGER NOT NULL;
ALTER TABLE "referrals" ADD COLUMN "referredUserId" INTEGER NOT NULL;

-- 步骤 8: 重新创建索引
CREATE INDEX "users_referredBy_idx" ON "users"("referredBy");
CREATE INDEX "referrals_referrerId_idx" ON "referrals"("referrerId");
CREATE INDEX "referrals_referredUserId_idx" ON "referrals"("referredUserId");
CREATE INDEX "user_subscriptions_userId_idx" ON "user_subscriptions"("userId");
CREATE INDEX "qr_codes_userId_idx" ON "qr_codes"("userId");

-- 步骤 9: 重新创建外键约束
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
