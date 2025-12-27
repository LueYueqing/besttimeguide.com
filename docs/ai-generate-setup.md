# AI 生成文章功能配置指南

## 一、提示词位置

提示词定义在 `app/api/articles/ai-generate/route.ts` 文件中，常量名为 `AI_GENERATE_PROMPT`（第 53-105 行）。

### 当前提示词内容

```typescript
const AI_GENERATE_PROMPT = `You are a professional content writer and SEO expert.
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
\`\`\`markdown
![Beautiful sunset over mountains](IMAGE_PLACEHOLDER_1)

The best time to visit depends on several factors...

![Travel guide map](IMAGE_PLACEHOLDER_2)
\`\`\`

Now generate the article based on the title: "{title}"`
```

### 提示词说明

- **位置**：`app/api/articles/ai-generate/route.ts` 第 53 行
- **使用方式**：在生成文章时，会将 `{title}` 和 `{categoryName}` 替换为实际值
- **自定义提示词**：在编辑器中可以输入自定义提示词，会覆盖默认提示词

## 二、需要准备的 API Key

### 必需 API Key（至少一个）

#### 1. DeepSeek API Key（推荐，性价比高）

- **环境变量名**：`DEEPSEEK_API_KEY`
- **获取地址**：https://platform.deepseek.com/
- **使用模型**：`deepseek-chat`
- **价格**：相对便宜，适合大量生成
- **配置方式**：在 `.env.local` 文件中添加：
  ```env
  DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
  ```

#### 2. OpenAI API Key（备选）

- **环境变量名**：`OPENAI_API_KEY`
- **获取地址**：https://platform.openai.com/api-keys
- **使用模型**：`gpt-4o-mini`
- **价格**：相对较贵
- **配置方式**：在 `.env.local` 文件中添加：
  ```env
  OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
  ```

**注意**：系统会优先使用 `DEEPSEEK_API_KEY`，如果未设置则使用 `OPENAI_API_KEY`。

### 可选 API Key（用于图片搜索）

#### 3. Unsplash API Key（推荐，图片质量高）

- **环境变量名**：`UNSPLASH_ACCESS_KEY`
- **获取地址**：https://unsplash.com/developers
- **用途**：搜索和下载高质量图片
- **免费额度**：每小时 50 次请求
- **配置方式**：在 `.env.local` 文件中添加：
  ```env
  UNSPLASH_ACCESS_KEY=your_unsplash_access_key
  ```

#### 4. Pexels API Key（备选）

- **环境变量名**：`PEXELS_API_KEY`
- **获取地址**：https://www.pexels.com/api/
- **用途**：搜索和下载图片（Unsplash 的备选方案）
- **免费额度**：每小时 200 次请求
- **配置方式**：在 `.env.local` 文件中添加：
  ```env
  PEXELS_API_KEY=your_pexels_api_key
  ```

**图片搜索优先级**：系统会先尝试 Unsplash，如果失败则尝试 Pexels。如果两者都未配置，图片占位符将不会被替换。

## 三、完整环境变量配置示例

在 `.env.local` 文件中添加以下配置：

```env
# AI 内容生成（必需，至少配置一个）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
# 或
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# 图片搜索 API（可选，但建议至少配置一个）
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
# 或
# PEXELS_API_KEY=your_pexels_api_key

# R2 存储配置（必需，用于上传图片）
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CDN_BASE_URL=https://your-cdn-domain.com
```

## 四、功能说明

### 1. 文章生成流程

1. 用户选择"AI 生成"模式创建文章
2. 填写标题和选择分类
3. 点击"生成文章内容"按钮
4. 系统调用 AI API 生成文章内容（包含图片占位符）
5. 系统搜索图片并上传到 R2
6. 替换图片占位符为实际 R2 URL
7. 从第一张图片生成封面图（375x200）
8. 更新文章内容并保存

### 2. 自定义提示词

在文章编辑器中，如果选择"AI 生成"模式，可以输入自定义提示词。自定义提示词会完全替换默认提示词。

### 3. 图片处理

- 系统会自动从生成的内容中提取图片占位符
- 使用图片的 alt text 作为搜索关键词
- 下载图片后上传到 R2 存储
- 使用 SEO 友好的文件名格式：`{article-slug}-{keyword}-{index}.{ext}`

## 五、修改提示词

如果需要修改提示词，编辑 `app/api/articles/ai-generate/route.ts` 文件中的 `AI_GENERATE_PROMPT` 常量即可。

修改后需要重启开发服务器或重新部署应用才能生效。

