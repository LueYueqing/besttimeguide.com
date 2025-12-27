# IndexNow 快速开始指南

## ✅ 已完成的集成

IndexNow 已成功集成到您的项目中，现在可以自动将新发布的文章提交到搜索引擎。

## 🎯 核心功能

### 1. 自动提交（已启用）
当您发布新文章时（从草稿状态改为发布状态），系统会**自动**提交该文章到 IndexNow，无需手动操作。

**工作流程：**
```
创建文章（草稿）→ 编辑内容 → 点击"发布" → 自动提交到 IndexNow ✅
```

### 2. 手动提交工具

#### 提交整个 Sitemap
```bash
npm run submit-sitemap
```
- 提交 `/sitemap.xml` 中的所有 URL
- 适合首次配置或批量更新

#### 提交单篇文章
```bash
npm run submit-article your-article-slug
```
- 提交指定文章
- 示例：`npm run submit-article how-to-create-qr-code`

#### 通过 API 提交
```bash
# 提交单个 URL
curl -X POST http://localhost:3000/api/indexnow/submit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/article/slug"}'

# 批量提交
curl -X POST http://localhost:3000/api/indexnow/batch \
  -H "Content-Type: application/json" \
  -d '{"urls": ["url1", "url2"]}'
```

## 🔐 配置信息

IndexNow 密钥已自动生成并配置：
- **密钥**：`53c38b0a8ade4f453d8e2ece181c3fe0`
- **配置文件**：`.env.local` 中的 `INDEXNOW_KEY`
- **验证文件**：`https://besttimeguide.com/53c38b0a8ade4f453d8e2ece181c3fe0.txt`

## 📝 日常使用场景

### 场景 1：发布新文章
1. 在管理后台创建文章
2. 编辑内容并完善 SEO 信息
3. 点击"发布"按钮
4. 系统自动提交到 IndexNow ✅
5. 在终端查看提交日志

### 场景 2：批量发布多篇文章
```bash
# 方式一：发布后手动提交整个 sitemap
npm run submit-sitemap

# 方式二：逐篇提交
npm run submit-article article-slug-1
npm run submit-article article-slug-2
npm run submit-article article-slug-3
```

### 场景 3：更新已发布的文章
- 更新文章内容不会自动提交（避免重复）
- 如需重新提交，使用：
```bash
npm run submit-article your-article-slug
```

## 🔍 验证提交

### 查看服务器日志
发布文章后，在终端会看到：
```
[Article Update] Submitting newly published article to IndexNow: https://besttimeguide.com/article-slug
[Article Update] Successfully submitted to IndexNow: https://besttimeguide.com/article-slug
```

### 检查搜索引擎收录
发布 24-48 小时后，在搜索引擎搜索：
```
site:besttimeguide.com your-article-title
```

### 使用站长工具
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

## ⚙️ 环境变量

确保 `.env.local` 包含以下配置：
```env
# 网站基础 URL（用于生成文章 URL）
NEXT_PUBLIC_SITE_URL=https://besttimeguide.com

# IndexNow 密钥
INDEXNOW_KEY=53c38b0a8ade4f453d8e2ece181c3fe0
```

## 📚 相关文件

- `lib/indexnow.ts` - IndexNow 核心库
- `app/api/indexnow/submit/route.ts` - 单个 URL 提交 API
- `app/api/indexnow/batch/route.ts` - 批量提交 API
- `app/[key].txt/route.ts` - 密钥验证文件路由
- `app/api/articles/[slug]/route.ts` - 文章更新 API（包含自动提交逻辑）
- `scripts/submit-sitemap-to-indexnow.js` - 提交 sitemap 脚本
- `scripts/submit-article-to-indexnow.js` - 提交单篇文章脚本

## 🎉 总结

**最重要的一点：** 您现在只需要正常发布文章，系统会自动处理 IndexNow 提交！

不需要额外的操作，系统会在后台自动完成所有工作。只需关注内容创作即可。

---

详细文档请查看：[IndexNow 集成指南](./21-IndexNow集成指南.md)
