# Next.js 15 项目模板

基于实战经验的最佳实践 Next.js 15 项目模板，包含完整的用户认证、支付系统、订阅管理等企业级功能。

## ✨ 内置功能

### 🔐 用户认证系统
- ✅ Google OAuth 登录（NextAuth.js）
- ✅ 开发模式登录（本地调试）
- ✅ 用户会话管理
- ✅ 用户上下文（UserContext）

### 💳 Stripe 支付系统
- ✅ 订阅创建（月付/年付）
- ✅ 订阅升级/降级
- ✅ 订阅取消
- ✅ Webhook 处理
- ✅ 订阅管理门户
- ✅ 定价页面

### 🎁 邀请推荐系统
- ✅ 邀请链接生成
- ✅ 邀请关系关联
- ✅ 邀请奖励发放
- ✅ 邀请统计

### 🔑 API 密钥管理
- ✅ API 密钥生成
- ✅ API 密钥验证
- ✅ 使用统计
- ✅ 密钥管理（激活/停用/删除）

### 📊 用户仪表板
- ✅ 订阅信息显示
- ✅ 计划升级/降级 UI
- ✅ 用户统计展示
- ✅ 导航菜单

### 👤 用户资料管理
- ✅ 用户信息编辑
- ✅ 订阅管理入口
- ✅ 账户设置

### 🚫 订阅取消
- ✅ 订阅取消确认
- ✅ 取消原因收集
- ✅ 挽留逻辑

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env.local` 并填写配置：

```bash
cp env.example .env.local
```

**重要配置项：**
- `DATABASE_URL` - MySQL 数据库连接字符串
- `NEXTAUTH_SECRET` - NextAuth 密钥（运行 `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` 生成）
- `NEXTAUTH_URL` - 应用 URL
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth 凭证
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Stripe 支付配置
- `STRIPE_PRICE_*` - Stripe 价格 ID（需要在 Stripe Dashboard 创建）

### 3. 配置数据库

编辑 `.env.local` 中的 `DATABASE_URL`，然后初始化数据库：

```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库 schema（开发环境）
npm run db:push

# 或使用迁移（生产环境推荐）
npm run db:migrate
```

### 4. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
project-root/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API 路由
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── globals.css        # 全局样式
│   ├── sitemap.ts         # 站点地图
│   └── robots.ts          # 爬虫配置
├── components/            # React 组件
│   ├── ui/               # UI 基础组件
│   ├── Header.tsx        # 页头
│   └── Footer.tsx        # 页脚
├── lib/                   # 工具函数和配置
│   ├── db.ts             # 数据库连接
│   ├── config.ts         # 配置管理
│   └── utils.ts          # 通用工具函数
├── prisma/               # Prisma ORM
│   ├── schema.prisma     # 数据库模型
│   └── seed.ts           # 数据填充
├── types/                 # TypeScript 类型定义
└── public/               # 静态资源
```

## 🛠️ 技术栈

- **框架**: Next.js 15 (React 19)
- **样式**: Tailwind CSS 3.4+
- **数据库**: MySQL + Prisma ORM
- **语言**: TypeScript
- **图标**: Heroicons / Lucide React
- **认证**: NextAuth.js v5 (Google OAuth)
- **支付**: Stripe
- **状态管理**: React Context API

## 📝 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint
- `npm run db:generate` - 生成 Prisma Client
- `npm run db:push` - 推送数据库 schema
- `npm run db:migrate` - 运行数据库迁移
- `npm run db:studio` - 打开 Prisma Studio
- `npm run db:seed` - 填充初始数据

## 🎨 颜色体系

项目使用语义化的颜色命名，便于维护和主题切换：

- `brand` - 品牌色
- `text` - 文字颜色（primary, secondary, tertiary, muted）
- `background` - 背景颜色（page, content, card）
- `border` - 边框颜色（light, medium, dark）
- `status` - 状态颜色（success, warning, error, info）

## 🔧 功能配置指南

### Google OAuth 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 创建 OAuth 2.0 客户端 ID
3. 添加授权重定向 URI: `http://localhost:3000/api/auth/callback/google`（开发环境）
4. 复制 Client ID 和 Client Secret 到 `.env.local`

### Stripe 支付配置

1. 注册 [Stripe 账号](https://stripe.com)
2. 获取 API 密钥: [Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
3. 创建产品和价格: [Dashboard > Products](https://dashboard.stripe.com/products)
4. 配置 Webhook: [Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - 端点 URL: `https://yourdomain.com/api/stripe/webhook`
   - 监听事件: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
5. 复制 Webhook Secret 到 `.env.local`

### 开发模式登录

在 `.env.local` 中设置 `ENABLE_DEV_LOGIN=true`，然后使用以下账号登录：
- 邮箱: `dev@example.com`
- 密码: `dev123`

⚠️ **警告**: 仅在开发环境使用，生产环境会自动禁用。

## 📚 相关文档

更多详细文档请参考项目根目录的 `docs/` 文件夹：

- [01-项目规划与启动](./docs/01-项目规划与启动.md)
- [02-技术架构与代码规范](./docs/02-技术架构与代码规范.md)
- [03-SEO优化完整指南](./docs/03-SEO优化完整指南.md)
- [11-颜色体系最佳实践](./docs/11-颜色体系最佳实践.md)
- [12-动态Sitemap最佳实践](./docs/12-动态Sitemap最佳实践.md)

## 🔧 配置说明

### Next.js 配置

编辑 `next.config.ts` 配置图片域名、环境变量等。

### Tailwind 配置

编辑 `tailwind.config.js` 自定义颜色体系、动画等。

### Prisma 配置

编辑 `prisma/schema.prisma` 定义数据库模型。

## 🚀 部署

### Vercel 部署（推荐开发环境）

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### 阿里云 ECS 部署（推荐生产环境）

1. 构建项目：`npm run build`
2. 使用 Docker 或 PM2 部署
3. 配置 Nginx 反向代理

## 📄 License

MIT

