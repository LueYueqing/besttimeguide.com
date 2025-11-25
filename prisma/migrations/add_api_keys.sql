-- 创建 API keys 表
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL UNIQUE,
  "keyPrefix" TEXT NOT NULL,
  "lastUsedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "api_keys_userId_idx" ON "api_keys"("userId");
CREATE INDEX IF NOT EXISTS "api_keys_keyHash_idx" ON "api_keys"("keyHash");

