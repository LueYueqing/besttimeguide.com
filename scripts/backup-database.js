#!/usr/bin/env node

/**
 * 数据库备份脚本
 * 在构建前备份数据库（仅在本地环境且有 DATABASE_URL 时执行）
 */

// 在 Vercel 等 CI/CD 环境中，通常不需要备份数据库
// 此脚本会检查环境，只在有数据库连接时才执行备份

const hasDatabaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''

if (!hasDatabaseUrl) {
  console.log('⚠ Skipping database backup: DATABASE_URL not set (this is normal in CI/CD environments)')
  process.exit(0)
}

// 如果有数据库连接，可以在这里添加备份逻辑
// 目前只输出提示信息
console.log('ℹ Database backup skipped in build process (use "npm run backup-db" for manual backup)')
process.exit(0)

