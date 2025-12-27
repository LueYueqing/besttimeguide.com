# AI 生成文章功能设计方案

## 一、需求分析

### 现有模式
1. **手动模式（Manual）**：用户直接编辑 `content` 字段
2. **AI改写模式（AI Rewrite）**：用户提供 `sourceContent`，AI 改写后生成 `content`

### 新增模式
3. **AI生成模式（AI Generate）**：只提供标题，AI 完全生成文章（包括配图）

## 二、数据库设计

### 当前数据库状态

现有字段：
- `aiRewriteStatus`: AI 改写状态（'pending' | 'processing' | 'completed' | 'failed'）
- `aiRewriteAt`: AI 改写时间

### 方案A：复用现有字段（推荐，最简化）

复用 `aiRewriteStatus` 和 `aiRewriteAt`，通过 `articleMode` 区分用途：

```prisma
model Article {
  // ... 现有字段 ...
  
  // AI 生成相关（新增）
  articleMode        String?   @default("manual") // 'manual' | 'ai-rewrite' | 'ai-generate'
}
```

**字段说明：**
- `articleMode`: 文章创建模式
  - `'manual'`: 手动编辑（默认）
  - `'ai-rewrite'`: AI 改写模式 → 使用 `aiRewriteStatus` 和 `aiRewriteAt`
  - `'ai-generate'`: AI 生成模式 → 复用 `aiRewriteStatus` 和 `aiRewriteAt`（但含义是生成状态）

**提示词管理方案：**
- **固定提示词**：使用默认的 AI 生成提示词模板
- **分类模板**：后期通过配置表管理不同分类的提示词模板（如 `PromptTemplate` 表）
- **自定义提示词**：生成时通过 API 参数传递，不存储到数据库

**优点：**
- 只需要添加一个字段（`articleMode`）
- 提示词统一管理，便于维护和更新
- 代码逻辑简单，复用现有状态管理
- 节省数据库空间

**缺点：**
- 语义上 `aiRewriteStatus` 用于生成模式可能不够直观
- 如果同时需要改写和生成，会有冲突（但实际场景不会同时使用）

### 方案B：添加新字段（更清晰，但更复杂）

```prisma
model Article {
  // ... 现有字段 ...
  
  // AI 生成相关（新增）
  articleMode        String?   @default("manual") // 'manual' | 'ai-rewrite' | 'ai-generate'
  aiGenerateStatus   String?   // 'pending' | 'processing' | 'completed' | 'failed'
  aiGenerateAt       DateTime? // AI 生成时间
}
```

**优点：**
- 语义清晰，字段名明确表达用途
- 可以同时支持改写和生成（虽然实际不会同时使用）

**缺点：**
- 需要数据库迁移（添加3个字段）
- 字段较多，增加数据库复杂度

### 推荐方案A（复用现有字段）

因为：
1. **实际场景**：一篇文章只会使用一种模式，不会同时改写和生成
2. **最简化实现**：只需要添加一个字段（`articleMode`）
3. **代码复用**：可以复用现有的状态管理逻辑
4. **提示词管理**：通过配置表或代码统一管理，更灵活

## 三、API 设计

### 1. 创建文章时指定模式

**POST `/api/articles`**

```typescript
{
  title: string
  categoryId: number
  articleMode: 'manual' | 'ai-rewrite' | 'ai-generate'
  // ... 其他字段
}
```

### 2. AI 生成文章 API

**POST `/api/articles/ai-generate`**

```typescript
// 请求
{
  articleId: number  // 文章ID（必须已创建，只有标题）
  promptTemplateId?: number  // 可选：使用指定的提示词模板ID（后期支持）
  customPrompt?: string  // 可选：临时自定义提示词（不存储，仅本次生成使用）
}

// 响应
{
  success: boolean
  article?: Article
  error?: string
}
```

**提示词优先级：**
1. `customPrompt`（如果提供）→ 使用自定义提示词
2. `promptTemplateId`（如果提供）→ 从配置表加载模板
3. 分类默认模板 → 根据文章分类选择模板
4. 全局默认模板 → 使用固定的默认提示词

**GET `/api/articles/ai-generate?articleId=123`**

批量处理或查询状态。

### 3. 生成流程

```
1. 用户创建文章（只填写标题、分类）
   → articleMode = 'ai-generate'
   → aiRewriteStatus = 'pending'（复用字段，表示生成状态）
   → content = ''（空）

2. 用户点击"AI生成"按钮
   → 调用 POST /api/articles/ai-generate
   → aiRewriteStatus = 'processing'（复用字段）

3. AI 生成流程：
   a. 构建提示词（基于标题 + 分类 + 自定义提示词）
   b. 调用 AI API 生成文章内容（Markdown）
   c. 解析 Markdown 中的图片占位符
   d. 为每个图片占位符生成图片（使用图片生成API，如 DALL-E、Midjourney API 等）
   e. 下载生成的图片，上传到 R2
   f. 替换 Markdown 中的图片占位符为 R2 URL
   g. 提取第一张图片作为封面图（resize 为 375x200）
   h. 更新文章：
      - content = 生成的 Markdown
      - coverImage = 封面图 URL
      - aiRewriteStatus = 'completed'（复用字段）
      - aiRewriteAt = now()（复用字段）

4. 如果失败：
   → aiRewriteStatus = 'failed'（复用字段）
   → 记录错误信息
```

## 四、提示词设计

### 默认提示词模板

```markdown
You are a professional content writer and SEO expert.
Generate a comprehensive, high-quality article based on the following title and category.

## Article Information
- Title: {title}
- Category: {categoryName}
- Target Audience: English-speaking users in the United States

## Requirements

### Content Quality
1. Write in fluent, natural American English
2. Follow Google's E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness)
3. Provide practical, actionable information
4. Use clear, engaging writing style

### SEO Optimization
1. The H1 heading must naturally include the main keyword from the title
2. Answer the core question within the first 120 words
3. Use clear H2/H3 structure to cover subtopics
4. Naturally incorporate related keywords and synonyms
5. Ensure content is comprehensive and valuable

### Structure Requirements
1. Start with an engaging introduction (2-3 paragraphs)
2. Use H2 headings for main sections
3. Use H3 headings for subsections
4. Include practical tips, examples, or recommendations
5. End with a concise conclusion

### Image Requirements
- Include 3-5 relevant images throughout the article
- Use descriptive alt text for each image
- Images should be relevant to the content section
- Format: Use Markdown image syntax: ![alt text](IMAGE_PLACEHOLDER_1), ![alt text](IMAGE_PLACEHOLDER_2), etc.
- Place images at appropriate points in the content (after relevant paragraphs)

### Output Format
- Use Markdown format
- Output ONLY the article content (no explanations or meta-commentary)
- Include image placeholders in the format: IMAGE_PLACEHOLDER_1, IMAGE_PLACEHOLDER_2, etc.
- Each image placeholder should have descriptive alt text

## Example Image Placeholder Usage
```markdown
![Beautiful sunset over mountains](IMAGE_PLACEHOLDER_1)

The best time to visit depends on several factors...

![Travel guide map](IMAGE_PLACEHOLDER_2)
```

Now generate the article based on the title: "{title}"
```

### 图片生成提示词模板

对于每个 `IMAGE_PLACEHOLDER_N`，根据上下文生成图片：

```typescript
// 从 Markdown 中提取图片上下文
const imageContext = extractImageContext(markdown, placeholderIndex)

// 构建图片生成提示词
const imagePrompt = `
Generate a high-quality, professional image for an article about: {title}
Image context: ${imageContext.altText}
Image description: ${imageContext.surroundingText}
Style: Professional, clean, modern, suitable for web content
Aspect ratio: 16:9
Quality: High resolution, web-optimized
`
```

## 五、后台界面设计

### 1. 文章列表页面增强

在 `app/dashboard/articles/articles-client.tsx` 中：

```typescript
// 添加筛选选项
<select>
  <option value="all">All Modes</option>
  <option value="manual">Manual</option>
  <option value="ai-rewrite">AI Rewrite</option>
  <option value="ai-generate">AI Generate</option>
</select>

// 在表格中显示模式
<td>
  {article.articleMode === 'ai-generate' && (
    <span className="badge">AI Generate</span>
  )}
  {article.articleMode === 'ai-rewrite' && (
    <span className="badge">AI Rewrite</span>
  )}
</td>

// 显示生成状态
{article.articleMode === 'ai-generate' && article.aiGenerateStatus && (
  <span className={`status-${article.aiGenerateStatus}`}>
    {article.aiGenerateStatus}
  </span>
)}
```

### 2. 文章创建/编辑页面

在 `app/dashboard/articles/article-editor.tsx` 中：

#### 2.1 创建模式选择器

```tsx
<div className="mb-6">
  <label>Article Creation Mode</label>
  <select 
    value={formData.articleMode} 
    onChange={(e) => setFormData({...formData, articleMode: e.target.value})}
    disabled={!!article} // 编辑时不可修改
  >
    <option value="manual">Manual Editing</option>
    <option value="ai-rewrite">AI Rewrite (from source content)</option>
    <option value="ai-generate">AI Generate (from title only)</option>
  </select>
</div>
```

#### 2.2 条件渲染表单字段

```tsx
{formData.articleMode === 'ai-generate' && (
  <>
    {/* 只显示标题和分类 */}
    <div>
      <label>Title *</label>
      <input 
        value={formData.title} 
        onChange={...}
        required
      />
    </div>
    
    <div>
      <label>Category *</label>
      <select value={formData.categoryId} ...>
        {categories.map(...)}
      </select>
    </div>
    
    {/* AI 生成按钮 */}
    <button 
      onClick={handleAIGenerate}
      disabled={!formData.title || !formData.categoryId || aiGenerateLoading}
    >
      {aiGenerateLoading ? 'Generating...' : 'Generate Article with AI'}
    </button>
    
    {/* 可选：高级选项（折叠） */}
    <details className="mt-4">
      <summary className="cursor-pointer text-sm text-gray-600">Advanced Options</summary>
      <div className="mt-2">
        <label>Custom Prompt (Optional, for this generation only)</label>
        <textarea 
          value={customPrompt || ''}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Leave empty to use default prompt template"
          className="w-full mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          This prompt will only be used for this generation and won't be saved.
        </p>
      </div>
    </details>
    
    {/* 显示生成状态 */}
    {article?.aiGenerateStatus && (
      <div className={`status-${article.aiGenerateStatus}`}>
        Status: {article.aiGenerateStatus}
        {article.aiGenerateAt && (
          <span>Generated at: {new Date(article.aiGenerateAt).toLocaleString()}</span>
        )}
      </div>
    )}
  </>
)}

{formData.articleMode === 'ai-rewrite' && (
  <>
    {/* 显示 sourceContent 输入框 */}
    <div>
      <label>Source Content</label>
      <textarea value={formData.sourceContent} ... />
    </div>
    {/* AI 改写按钮 */}
  </>
)}

{formData.articleMode === 'manual' && (
  <>
    {/* 显示 content 编辑器 */}
    <div>
      <label>Content</label>
      <textarea value={formData.content} ... />
    </div>
  </>
)}
```

#### 2.3 AI 生成处理函数

```typescript
const [aiGenerateLoading, setAiGenerateLoading] = useState(false)

const [customPrompt, setCustomPrompt] = useState('') // 临时自定义提示词（不存储）

const handleAIGenerate = async () => {
  if (!article?.id) {
    // 先保存文章（只保存标题和分类）
    const saveResult = await saveArticle()
    if (!saveResult.success) {
      toast.error('Failed to save article')
      return
    }
    // 获取新创建的文章ID
    article = { id: saveResult.article.id, ... }
  }
  
  setAiGenerateLoading(true)
  try {
    const response = await fetch(`/api/articles/ai-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId: article.id,
        customPrompt: customPrompt.trim() || undefined, // 只在有值时传递
      }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      toast.success('Article generated successfully!')
      // 刷新文章数据
      await fetchArticle(article.id)
      // 更新表单数据
      setFormData(prev => ({
        ...prev,
        content: data.article.content,
        coverImage: data.article.coverImage,
      }))
    } else {
      toast.error(data.error || 'Failed to generate article')
    }
  } catch (error) {
    toast.error('Error generating article')
  } finally {
    setAiGenerateLoading(false)
  }
}
```

### 3. 工作流程界面

```tsx
// 创建新文章时的流程
1. 选择 "AI Generate" 模式
2. 填写标题和分类
3. （可选）填写自定义提示词
4. 点击 "Save" 按钮 → 创建文章（content 为空）
5. 点击 "Generate Article with AI" 按钮
6. 显示生成进度（processing）
7. 生成完成后，显示生成的内容
8. 用户可以编辑生成的内容
9. 保存并发布
```

## 六、图片生成方案

### 方案A：使用 AI 图片生成 API（推荐）

**选项1：DALL-E 3 (OpenAI)**
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    size: "1024x1024", // 或 "1792x1024" 用于横向图片
    quality: "standard",
    n: 1,
  })
  
  return response.data[0].url
}
```

**选项2：Stable Diffusion API**
```typescript
// 使用 Stability AI 或其他 Stable Diffusion API
```

**选项3：Midjourney API**（如果可用）

### 方案B：使用图片搜索 API + 下载（推荐用于次要图片）

**使用 Unsplash API**（免费，质量高）：

```typescript
// 需要安装: npm install unsplash-js
import { createApi } from 'unsplash-js'

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
})

async function searchAndDownloadImage(keywords: string, articleSlug: string, index: number): Promise<string> {
  try {
    // 1. 搜索图片
    const result = await unsplash.search.getPhotos({
      query: keywords,
      page: 1,
      perPage: 1,
      orientation: 'landscape', // 横向图片更适合文章
    })
    
    if (result.errors || !result.response?.results?.length) {
      throw new Error('No images found')
    }
    
    // 2. 获取图片 URL
    const image = result.response.results[0]
    const imageUrl = image.urls.regular // 或 full, raw
    
    // 3. 下载并上传到 R2
    const altText = image.alt_description || keywords
    return await uploadImageToR2(imageUrl, altText, index, articleSlug)
  } catch (error) {
    console.error('Unsplash search failed:', error)
    throw error
  }
}
```

**使用 Pexels API**（备选方案）：

```typescript
// 需要安装: npm install pexels
import { createClient } from 'pexels'

const pexels = createClient(process.env.PEXELS_API_KEY || '')

async function searchAndDownloadImage(keywords: string, articleSlug: string, index: number): Promise<string> {
  try {
    // 1. 搜索图片
    const result = await pexels.photos.search({
      query: keywords,
      per_page: 1,
      orientation: 'landscape',
    })
    
    if (!result.photos?.length) {
      throw new Error('No images found')
    }
    
    // 2. 获取图片 URL
    const image = result.photos[0]
    const imageUrl = image.src.large // 或 original, large2x
    
    // 3. 下载并上传到 R2
    const altText = image.alt || keywords
    return await uploadImageToR2(imageUrl, altText, index, articleSlug)
  } catch (error) {
    console.error('Pexels search failed:', error)
    throw error
  }
}
```

**环境变量配置：**
```env
# Unsplash API (推荐)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# 或 Pexels API (备选)
PEXELS_API_KEY=your_pexels_api_key
```

### 方案C：混合方案（推荐）

1. 优先使用 AI 生成（DALL-E 3）用于关键图片
2. 对于次要图片，使用图片搜索 API（Unsplash、Pexels）
3. 所有图片都上传到 R2

## 七、实现步骤

### Phase 1: 数据库迁移（方案A：复用现有字段）

1. 更新 Prisma schema，只添加一个字段：
   ```prisma
   articleMode        String?   @default("manual")
   ```

2. 创建并运行 migration：
   ```bash
   npx prisma migrate dev --name add_ai_generate_mode
   ```

3. 生成 Prisma Client：
   ```bash
   npx prisma generate
   ```

### Phase 1.5: 提示词模板表（可选，后期扩展）

如果需要按分类管理不同的提示词模板，可以创建配置表：

```prisma
model PromptTemplate {
  id          Int      @id @default(autoincrement())
  name        String   // 模板名称，如 "travel-default", "health-default"
  categoryId  Int?     // 关联分类（可选，null 表示全局默认）
  prompt      String   @db.Text // 提示词模板内容
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  @@index([categoryId])
  @@index([isActive])
  @@map("prompt_templates")
}
```

**当前阶段**：先使用固定的默认提示词，后期再扩展模板表。

### Phase 2: API 开发
1. 创建 `/api/articles/ai-generate` 端点
2. 实现提示词构建逻辑
3. 实现 AI 内容生成
4. 实现图片生成/下载逻辑
5. 实现图片上传到 R2
6. 实现封面图生成

### Phase 3: 前端开发
1. 更新文章编辑器，添加模式选择
2. 添加 AI 生成按钮和状态显示
3. 更新文章列表，显示模式标签
4. 添加生成状态筛选

### Phase 4: 测试和优化
1. 测试完整流程
2. 优化提示词
3. 优化图片生成策略
4. 性能优化

## 八、注意事项

1. **成本控制**：
   - AI 生成内容需要调用 LLM API（按 token 计费）
   - 图片生成需要调用图片生成 API（按图片计费）
   - 需要设置合理的重试和错误处理

2. **质量保证**：
   - 生成的内容需要人工审核
   - 提供编辑功能，允许用户修改生成的内容
   - 可以设置生成后自动保存为草稿，需要手动发布

3. **性能考虑**：
   - 图片生成是异步的，可能需要较长时间
   - 考虑使用队列系统（如 BullMQ）处理长时间任务
   - 提供进度反馈

4. **错误处理**：
   - API 调用失败时的重试机制
   - 部分失败时的回滚策略
   - 用户友好的错误提示

5. **扩展性**：
   - 支持自定义提示词模板
   - 支持不同类别的专用提示词
   - 支持图片生成策略配置

## 九、后续优化方向

1. **批量生成**：支持批量创建文章并生成
2. **模板系统**：为不同类别预设不同的提示词模板
3. **图片优化**：自动优化生成的图片（压缩、格式转换）
4. **A/B 测试**：测试不同的提示词效果
5. **内容审核**：自动检测生成内容的质量
6. **多语言支持**：支持生成其他语言的文章

