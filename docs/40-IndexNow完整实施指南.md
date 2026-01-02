# IndexNow 完整实施指南

## 什么是 IndexNow？

IndexNow 是一个简单的协议，允许网站所有者即时通知搜索引擎其网站上的内容已更新、创建或删除。这个协议由 Bing 和 Microsoft 发起，现在已被 Google、Yandex、Seznam 等多个搜索引擎采用。

### 主要优势

- **即时通知**：无需等待搜索引擎爬虫发现新内容
- **提高索引速度**：新页面可以更快地被搜索引擎收录
- **覆盖多个搜索引擎**：一次提交即可通知所有支持的搜索引擎
- **简化操作**：无需为每个搜索引擎单独提交

## 实施步骤

### 1. 生成 IndexNow 密钥

IndexNow 需要一个 32 位十六进制密钥来验证网站所有权。

#### 方法一：使用 Node.js 生成

```bash
node -e "console.log(Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join(''))"
```

输出示例：
```
53c38b0a8ade4f453d8e2ece181c3fe0
```

#### 方法二：使用在线工具

访问 IndexNow 官方网站生成密钥：https://www.indexnow.org/

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```env
INDEXNOW_KEY=你的32位十六进制密钥
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**示例**：
```env
INDEXNOW_KEY=53c38b0a8ade4f453d8e2ece181c3fe0
NEXT_PUBLIC_SITE_URL=https://besttimeguide.com
```

### 3. 创建验证文件

验证文件用于证明网站所有权。有两种方式：

#### 方式一：静态文件（推荐）- 最简单

在 `public` 目录下创建 `indexnow.txt` 文件：

**文件路径**：`public/indexnow.txt`

**文件内容**：仅包含密钥
```
53c38b0a8ade4f453d8e2ece181c3fe0
```

**访问地址**：`https://yourdomain.com/indexnow.txt`

**优点**：
- 实现简单
- 不受动态路由影响
- 无需额外代码
- 性能最佳

#### 方式二：动态路由

创建 `app/indexnow.txt/route.ts`：

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  const indexNowKey = process.env.INDEXNOW_KEY

  if (!indexNowKey) {
    return new NextResponse('IndexNow key not configured', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  return new NextResponse(indexNowKey, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

**注意**：如果使用动态路由，需要确保不被其他动态路由（如 `app/[slug]/page.tsx`）捕获。

### 4. 验证配置

#### 本地测试

```bash
# 启动开发服务器
npm run dev

# 测试验证文件
curl http://localhost:3000/indexnow.txt
```

应该返回您的密钥：
```
53c38b0a8ade4f453d8e2ece181c3fe0
```

#### 生产环境测试

```bash
curl https://yourdomain.com/indexnow.txt
```

### 5. 提交 URL 到 IndexNow

#### 方法一：提交 Sitemap（推荐）

使用提供的脚本一次性提交 sitemap 中的所有 URL：

```bash
node scripts/submit-sitemap-to-indexnow.js
```

**脚本功能**：
- 自动获取 sitemap.xml
- 解析所有 URL
- 批量提交到 IndexNow
- 最多支持 10000 个 URL

**输出示例**：
```
🚀 Starting sitemap submission to IndexNow...

📄 Fetching sitemap from: https://besttimeguide.com/sitemap.xml
✅ Found 112 URLs in sitemap

📤 Submitting URLs to IndexNow...
[IndexNow] Successfully submitted 112 URLs

✅ Success! URLs submitted to IndexNow.
📊 Summary: 112 URLs submitted
🔍 Search engines notified: Bing, Google, Yandex, and others
```

#### 方法二：手动提交单个 URL

使用 cURL 或任何 HTTP 客户端：

```bash
curl -X POST https://www.bing.com/indexnow \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "host": "besttimeguide.com",
    "key": "53c38b0a8ade4f453d8e2ece181c3fe0",
    "urlList": ["https://besttimeguide.com/example-page"]
  }'
```

#### 方法三：批量提交（最多 10000 个 URL）

```bash
curl -X POST https://www.bing.com/indexnow \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "host": "besttimeguide.com",
    "key": "53c38b0a8ade4f453d8e2ece181c3fe0",
    "urlList": [
      "https://besttimeguide.com/page1",
      "https://besttimeguide.com/page2",
      "https://besttimeguide.com/page3"
    ]
  }'
```

### 6. 集成到内容发布流程

对于新的文章或内容，可以在发布时自动提交到 IndexNow：

#### 在文章创建时提交

在创建新文章的 API 路由中添加：

```typescript
import { submitToIndexNow } from '@/lib/indexnow'

async function createArticle(data) {
  // 创建文章
  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug: data.slug,
      // ... 其他字段
    }
  })

  // 提交到 IndexNow
  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${article.slug}`
  await submitToIndexNow(articleUrl)

  return article
}
```

#### 使用 Webhook

设置 GitHub Webhook 或其他 CI/CD 工具，在代码部署后自动提交：

```javascript
// scripts/submit-recent-articles.js
const { submitToIndexNow } = require('@/lib/indexnow')

async function submitRecentArticles() {
  // 获取最近 7 天发布的文章
  const recentArticles = await prisma.article.findMany({
    where: {
      publishedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  })

  // 提交到 IndexNow
  const urls = recentArticles.map(article => 
    `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${article.slug}`
  )
  
  await submitBatchToIndexNow(urls)
}

submitRecentArticles()
```

## IndexNow API 端点

### 主要端点
```
https://www.bing.com/indexnow
```

### 备用端点
```
https://ssl.bing.com/webmaster/indexnow/submit
https://indexnow.yandex.com/indexnow
```

## 响应状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 202 | 已接受（已排队处理） |
| 400 | 请求格式错误 |
| 403 | 密钥无效或验证文件未找到 |
| 422 | 参数验证失败 |
| 429 | 请求过多（限流） |
| 500 | 服务器内部错误 |

## 常见问题

### 1. 验证文件返回 404

**原因**：动态路由捕获了验证文件请求

**解决方案**：使用静态文件 `public/indexnow.txt` 而不是动态路由

### 2. 提交返回 403 错误

**可能原因**：
- 验证文件不存在或内容不正确
- 密钥配置错误
- 验证文件未部署到生产环境

**解决方案**：
- 验证 `https://yourdomain.com/indexnow.txt` 可访问
- 检查文件内容是否与 INDEXNOW_KEY 完全一致
- 确保生产环境已部署

### 3. 提交返回 429 错误

**原因**：请求频率过高

**解决方案**：
- 减少提交频率
- 使用批量提交代替多次单个提交
- 实现退避重试机制

### 4. 内容没有被索引

**可能原因**：
- 提交后时间太短（需要几小时到几天）
- 网站存在 SEO 问题（如 noindex 标签）
- 搜索引擎发现内容质量问题

**解决方案**：
- 耐心等待（通常 24-48 小时）
- 检查 robots.txt 和 meta 标签
- 在搜索引擎管理工具中查看索引状态

## 监控和调试

### 测试脚本

使用提供的测试脚本检查 IndexNow 配置：

```bash
node scripts/test-indexnow.js
```

### 查看搜索引擎索引状态

- **Bing Webmaster Tools**: https://www.bing.com/webmasters/
- **Google Search Console**: https://search.google.com/search-console
- **Yandex Webmaster**: https://webmaster.yandex.com/

### 检查日志

查看 IndexNow 提交日志，记录每次提交的结果：

```typescript
async function submitWithLogging(url) {
  const result = await submitToIndexNow(url)
  
  // 记录到数据库
  await prisma.indexNowLog.create({
    data: {
      url,
      success: result.success,
      status: result.status,
      error: result.error,
      submittedAt: new Date()
    }
  })
  
  return result
}
```

## 最佳实践

### 1. 批量提交

将多个 URL 合并为一次提交，减少 API 调用：

```typescript
// 好的做法
await submitBatchToIndexNow(urls)

// 不好的做法
for (const url of urls) {
  await submitToIndexNow(url)
}
```

### 2. 只提交重要页面

优先提交：
- 新发布的内容
- 重要更新
- 高价值页面

避免提交：
- 重复内容
- 低质量页面
- 测试页面

### 3. 提交时机

在以下情况提交：
- 内容发布后立即
- 重要更新后
- 页面重新设计后

### 4. 错误处理

实现重试机制和错误日志：

```typescript
async function submitWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await submitToIndexNow(url)
    
    if (result.success) {
      return result
    }
    
    if (result.status !== 429) {
      break
    }
    
    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
  }
  
  return result
}
```

### 5. 缓存验证文件

验证文件可以缓存 1 小时，减少服务器负载：

```typescript
headers: {
  'Cache-Control': 'public, max-age=3600'
}
```

## 安全建议

### 1. 保护密钥

- 不要将 INDEXNOW_KEY 提交到公开的代码仓库
- 使用环境变量存储密钥
- 在 .gitignore 中添加 `.env.local`

### 2. 验证请求来源

如果需要额外的安全，可以验证请求来源：

```typescript
export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')
  
  // 允许的搜索引擎爬虫
  const allowedBots = [
    'bingbot',
    'googlebot',
    'yandexbot'
  ]
  
  const isAllowed = allowedBots.some(bot => 
    userAgent?.toLowerCase().includes(bot)
  )
  
  if (!isAllowed && process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  // 返回密钥...
}
```

## 性能优化

### 1. 异步提交

不阻塞内容发布流程：

```typescript
async function publishArticle(data) {
  // 立即返回
  const article = await createArticle(data)
  
  // 异步提交
  submitToIndexNow(article.url).catch(console.error)
  
  return article
}
```

### 2. 队列处理

使用队列系统处理大量提交：

```typescript
import { Queue } from 'bull'

const indexNowQueue = new Queue('indexnow', process.env.REDIS_URL)

// 添加任务
await indexNowQueue.add({ url: articleUrl })

// 处理任务
indexNowQueue.process(async (job) => {
  await submitToIndexNow(job.data.url)
})
```

### 3. 节流控制

控制提交频率，避免触发限流：

```typescript
import { setTimeout } from 'timers/promises'

async function submitThrottled(urls) {
  for (const url of urls) {
    await submitToIndexNow(url)
    await setTimeout(1000) // 间隔 1 秒
  }
}
```

## 高级用法

### 1. 自动提交新文章

在数据库触发器或 ORM 钩子中自动提交：

```prisma
// prisma/schema.prisma
model Article {
  id        String   @id @default(uuid())
  title     String
  slug      String
  published Boolean  @default(false)
  publishedAt DateTime?
  
  @@index([published])
}

// 在应用层监听
prisma.$use(async (params, next) => {
  const result = await next(params)
  
  if (params.action === 'create' && params.model === 'Article') {
    const article = result as Article
    if (article.published) {
      const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${article.slug}`
      submitToIndexNow(url).catch(console.error)
    }
  }
  
  return result
})
```

### 2. 监控提交成功率

定期检查并报告提交状态：

```typescript
async function getIndexNowStats() {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const stats = await prisma.indexNowLog.groupBy({
    by: ['success'],
    where: {
      submittedAt: {
        gte: last30Days
      }
    },
    _count: true
  })
  
  console.log('IndexNow Stats (Last 30 Days):')
  console.table(stats)
}
```

### 3. 与 SEO 工具集成

将 IndexNow 提交与其他 SEO 工具结合使用：

```typescript
async function comprehensiveSEOCheck(article) {
  // 1. 提交到 IndexNow
  await submitToIndexNow(article.url)
  
  // 2. 更新 Sitemap
  await rebuildSitemap()
  
  // 3. 提交到 Google Search Console API
  await googleSearchConsole.submit(article.url)
  
  // 4. 发送社交媒体通知
  await postToSocialMedia(article)
  
  // 5. 分析页面性能
  await analyzePagePerformance(article.url)
}
```

## 参考资源

### 官方文档
- IndexNow 官方网站: https://www.indexnow.org/
- Microsoft 文档: https://learn.microsoft.com/en-us/bing/webmaster/getting-started/index-now
- Google 文档: https://developers.google.com/search/docs/crawling-indexing/indexing-api

### 社区资源
- IndexNow GitHub: https://github.com/IndexNow
- Next.js 文档: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

### 工具和库
- [indexnow-sdk](https://github.com/your-org/indexnow-sdk) - IndexNow SDK
- [next-seo](https://github.com/garmeeh/next-seo) - Next.js SEO 工具

## 总结

IndexNow 是一个强大且简单的协议，可以显著提高网站内容的索引速度。通过本指南，您应该能够：

1. ✓ 正确生成和配置 IndexNow 密钥
2. ✓ 创建和部署验证文件
3. ✓ 使用各种方法提交 URL
4. ✓ 集成到内容发布流程
5. ✓ 处理常见问题和错误
6. ✓ 实施最佳实践

记住，IndexNow 只是 SEO 策略的一部分。持续创建高质量内容、优化网站性能和用户体验仍然是成功的关键。
