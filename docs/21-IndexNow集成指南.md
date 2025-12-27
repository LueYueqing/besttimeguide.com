# IndexNow 集成指南

## 📖 什么是 IndexNow？

IndexNow 是一个由微软（Bing）、Google、Yandex 等主要搜索引擎共同支持的简单协议。它允许网站实时通知搜索引擎有新内容或内容已更新，从而加快索引速度。

### 主要优势：
- ✅ **实时通知**：新内容发布后立即通知搜索引擎
- ✅ **支持多引擎**：一次提交，Bing、Google、Yandex 等多个搜索引擎都能收到
- ✅ **简单易用**：无需注册 API Key，无需复杂的认证流程
- ✅ **提高索引速度**：相比被动等待爬取，主动提交可以快数小时甚至数天

## 🚀 快速开始

### 1. 配置环境变量

在 `.env.local` 文件中添加以下配置：

```env
# IndexNow 配置（搜索引擎索引通知）
# 生成命令: node -e "console.log(Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join(''))"
INDEXNOW_KEY=your-32-char-hex-key-here
```

### 2. 生成 IndexNow 密钥

运行以下命令生成一个32位的十六进制密钥：

```bash
node -e "console.log(Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join(''))"
```

将生成的密钥添加到 `.env.local` 文件的 `INDEXNOW_KEY` 中。

### 3. 验证配置

验证密钥文件是否可访问：

```bash
# 替换 {your-key} 为实际密钥
curl https://yourdomain.com/{your-key}.txt
```

应该看到返回的是你的密钥内容。

## 📤 提交内容到 IndexNow

### 方式一：提交整个 Sitemap（推荐）

提交 sitemap.xml 中的所有 URL：

```bash
npm run submit-sitemap
```

这个脚本会：
1. 获取 `/sitemap.xml` 的所有 URL
2. 批量提交到 IndexNow
3. 显示提交结果统计

**使用场景：**
- 首次设置 IndexNow
- 定期批量更新（如每周）
- 大量内容更新后

### 方式二：提交单篇文章

只提交一篇新文章：

```bash
npm run submit-article your-article-slug
```

**示例：**
```bash
npm run submit-article how-to-create-qr-code
npm run submit-article dynamic-qr-codes-guide
```

**使用场景：**
- 发布新文章后立即提交
- 更新现有文章后提交
- 精确控制提交内容

### 方式三：通过 API 提交

#### 提交单个 URL

```bash
curl -X POST http://localhost:3000/api/indexnow/submit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/article/slug"}'
```

#### 批量提交多个 URL

```bash
curl -X POST http://localhost:3000/api/indexnow/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://yourdomain.com/article/slug1",
      "https://yourdomain.com/article/slug2"
    ]
  }'
```

## 🔍 验证索引状态

提交后，你可以通过以下方式验证搜索引擎是否收到通知：

### Google Search Console
1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 选择你的网站
3. 查看覆盖率报告
4. 使用"网址检查"工具检查特定 URL

### Bing Webmaster Tools
1. 访问 [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. 选择你的网站
3. 查看"URL 检查"工具

### 直接搜索
提交几小时后，在搜索引擎中搜索：
```
site:yourdomain.com your-article-title
```

## 📅 建议的提交策略

### 日常发布
- **新文章发布后**：立即提交该文章
- **批量发布**：使用 `submit-sitemap` 一次性提交

### 定期维护
- **每周一次**：运行 `npm run submit-sitemap` 确保所有更新都被通知
- **内容更新**：更新重要文章后重新提交

### 最佳实践
1. ✅ 发布后立即提交，不要等待
2. ✅ 重要内容更新后重新提交
3. ✅ 定期（如每周）提交完整 sitemap
4. ❌ 不要过度频繁提交同一 URL（避免被标记为垃圾）
5. ✅ 保持 `INDEXNOW_KEY` 安全，不要泄露

## 🛠️ 技术实现

### 文件结构

```
├── lib/
│   └── indexnow.ts              # IndexNow 核心库
├── app/
│   ├── api/
│   │   └── indexnow/
│   │       ├── submit/route.ts  # 单个 URL 提交 API
│   │       └── batch/route.ts   # 批量提交 API
│   └── [key].txt/route.ts       # 密钥验证文件路由
└── scripts/
    ├── submit-sitemap-to-indexnow.js   # 提交 sitemap 脚本
    └── submit-article-to-indexnow.js   # 提交单篇文章脚本
```

### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/indexnow/submit` | POST | 提交单个 URL |
| `/api/indexnow/batch` | POST | 批量提交多个 URL |
| `/{key}.txt` | GET | IndexNow 密钥验证 |

## 🔧 故障排除

### 问题：提交失败，提示 INDEXNOW_KEY not configured

**解决方案：**
1. 检查 `.env.local` 文件是否存在
2. 确保 `INDEXNOW_KEY` 已正确配置
3. 重启开发服务器

### 问题：验证文件返回 404

**解决方案：**
1. 确保 `INDEXNOW_KEY` 已配置
2. 检查 URL 格式是否正确（`https://yourdomain.com/{key}.txt`）
3. 确保开发服务器正在运行

### 问题：提交成功但搜索引擎未收录

**可能原因：**
1. 搜索引擎需要时间处理（通常几小时到几天）
2. URL 被搜索引擎的算法过滤（内容质量问题）
3. 网站在搜索引擎的信誉度较低

**解决方案：**
1. 耐心等待，通常 24-48 小时内会有结果
2. 检查内容质量和 SEO 优化
3. 定期提交，建立网站信誉

### 问题：如何知道 IndexNow 是否正常工作？

**验证方法：**
1. 查看终端输出，确认提交成功
2. 在搜索引擎搜索框输入 `site:yourdomain.com` 查看收录情况
3. 使用 Google Search Console 或 Bing Webmaster Tools 查看索引状态

## 📚 相关资源

- [IndexNow 官方网站](https://www.indexnow.org/)
- [IndexNow 文档](https://www.indexnow.org/documentation)
- [Google 关于 IndexNow 的说明](https://developers.google.com/search/docs/crawling-indexing/indexnow)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

## 🎯 总结

IndexNow 是一个强大而简单的 SEO 工具，可以显著加快搜索引擎索引速度。通过本项目提供的工具，你可以轻松地将新内容通知给各大搜索引擎。

**关键步骤：**
1. ✅ 配置 `INDEXNOW_KEY` 环境变量
2. ✅ 发布新内容后立即提交
3. ✅ 定期提交完整 sitemap
4. ✅ 监控搜索引擎收录情况

祝你的网站 SEO 效果越来越好！🚀
