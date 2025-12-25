# 🔧 环境变量配置快速指南

## 快速开始

### 1. 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件，并复制以下内容：

```env
# ============================================
# 数据库配置 (PostgreSQL - Neon)
# ============================================
DATABASE_URL="postgresql://neondb_owner:npg_F26QfAiLDYJS@ep-rough-unit-a40frcro-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# ============================================
# NextAuth 配置
# ============================================
# 生成命令: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# ============================================
# Google OAuth 配置（可选）
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ============================================
# 开发模式登录配置（可选，用于本地调试）
# ============================================
ENABLE_DEV_LOGIN=true

# ============================================
# 应用配置
# ============================================
NEXT_PUBLIC_APP_NAME=BestTimeGuide
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DESCRIPTION=Find the best time for everything
```

### 2. 安装依赖（如果需要）

```bash
npm install
```

### 3. 生成 Prisma Client

```bash
npx prisma generate
```

### 4. 运行数据库迁移

```bash
npx prisma migrate deploy
```

### 5. 填充测试数据

```bash
npm run seed-articles
```

## ✅ 验证配置

运行以下命令验证数据库连接：

```bash
# 测试连接
npx prisma db pull

# 打开 Prisma Studio 查看数据
npx prisma studio
```

## 📝 重要说明

1. **`.env.local` 文件不会被提交到 Git**（已在 `.gitignore` 中）
2. **数据库连接串**：使用你提供的 Neon PostgreSQL 连接字符串
3. **NextAuth Secret**：运行生成命令创建新的密钥
4. **所有脚本**（包括 `seed-articles.ts`）会自动从 `.env.local` 读取配置

## 🔍 详细文档

更多详细信息请查看：[环境变量配置指南](./docs/19-环境变量配置指南.md)

