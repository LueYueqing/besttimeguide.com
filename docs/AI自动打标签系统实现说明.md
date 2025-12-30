# AI 自动打标签系统实现说明

## 概述

本文档说明 AI 自动打标签系统的实现方案，包括双层标签架构（时间标签 + AI 实体标签）。

## 已完成的工作

### 1. 分类 AI 提示词更新

已修改 `scripts/init-category-ai-prompts.sql`，为 5 个分类添加了标签生成要求：

- **Travel**: 要求 AI 提取旅行相关的实体标签（目的地、活动、文化体验等）
- **Social Media**: 要求 AI 提取社交媒体相关的实体标签（平台、策略、工具等）
- **Health**: 要求 AI 提取健康相关的实体标签（疾病、疗法、营养等）
- **Shopping**: 要求 AI 提取购物相关的实体标签（产品类型、促销策略、零售商等）
- **Lifestyle**: 要求 AI 提取生活方式相关的实体标签（习惯、实践、主题等）

### 2. API 代码更新

已修改 `app/api/articles/ai-rewrite/route.ts`，实现以下功能：

- 解析 AI 响应中的两部分内容（Markdown 内容 + JSON 标签）
- 使用 `---TAGS---` 分隔符分离内容
- 调用 `processTagsFromAI` 合并 AI 实体标签和时间标签
- 记录详细的日志（AI 实体标签、时间标签、最终标签）

### 3. 标签处理函数

已存在并已实现：

- `lib/extract-tags.ts`: 处理 AI 实体标签的提取和标准化
- `lib/auto-time-tags.ts`: 自动生成时间标签（season、month、week）

## 需要手动执行的步骤

由于环境变量限制，需要手动更新数据库中的分类提示词。请执行以下方法之一：

### 方法 1: 使用数据库客户端（推荐）

连接到 PostgreSQL 数据库，执行以下 SQL：

```sql
-- Travel 分类
UPDATE "categories" 
SET "aiPrompt" = 'You are a professional travel writer and destination expert.
Generate a comprehensive, engaging travel guide based on the following title.

## Article Information
- Title: {title}
- Category: Travel
- Target Audience: English-speaking travelers planning trips

## CRITICAL REQUIREMENTS

### Image Placeholders (MANDATORY)
You MUST include 4-5 image placeholders in the format: `![alt text](IMAGE_PLACEHOLDER_N(keywords))`
Place at least one image after the introduction and one at the start of each major section.

### Content Structure
1. **Introduction** - Hook the reader with why this destination/time matters, include travel context
2. **Best Time to Visit** - Detailed seasonal breakdown, weather patterns, crowd levels
3. **How to Get There** - Flight options, transportation tips, visa requirements
4. **Where to Stay** - Accommodation recommendations by budget (luxury, mid-range, budget)
5. **Top Attractions & Experiences** - Must-see spots, hidden gems, unique activities
6. **Travel Tips** - Budget breakdown, packing list, local customs, safety tips
7. **Sample Itinerary** - 3-5 day suggested schedule
8. **FAQ** - 5 common questions travelers ask about this destination

### Writing Style
- Use vivid, descriptive language that helps readers imagine the experience
- Include practical details (prices, hours, locations) where relevant
- Focus on actionable advice travelers can use immediately
- Maintain an inspiring yet realistic tone
- Include recent information (2024/2025 data when available)

### SEO Optimization
- Use clear H1, H2, H3 hierarchy
- Include travel-related keywords naturally
- Add bullet points and numbered lists for easy scanning

**FINAL REMINDER:** Include 4-5 image placeholders in the exact format `![alt text](IMAGE_PLACEHOLDER_N(keywords))` throughout the article.

## Tag Generation Requirement
After the Markdown content, you MUST include a list of relevant entities/tags that appear in the article. 

**Format:**
[MARKDOWN CONTENT HERE]

---TAGS---
["entity1", "entity2", "entity3", "entity4", "entity5", "entity6", "entity7"]

**Tag Guidelines:**
- Extract 5-7 meaningful entities/topics/keywords from your article
- Focus on specific concepts, not generic terms (e.g., use "cherry blossoms" not just "flowers")
- Include destinations, activities, tips, and key concepts
- Use lowercase with spaces between words (they will be standardized automatically)
- Examples for travel articles: ["tokyo", "spring travel", "cherry blossoms", "budget tips", "cultural experiences", "public transport", "local cuisine"]

Respond with the Markdown content followed by the tags as shown above.'
WHERE "slug" = 'travel';
```

（其他分类的 SQL 请参考 `scripts/init-category-ai-prompts.sql` 文件）

### 方法 2: 使用 Next.js API

创建一个临时的 API 端点来更新分类提示词：

```typescript
// app/api/update-prompts/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  const prompts = {
    'travel': '...完整的提示词内容...',
    'social-media': '...完整的提示词内容...',
    'health': '...完整的提示词内容...',
    'shopping': '...完整的提示词内容...',
    'lifestyle': '...完整的提示词内容...',
  }

  for (const [slug, aiPrompt] of Object.entries(prompts)) {
    await prisma.category.updateMany({
      where: { slug },
      data: { aiPrompt }
    })
  }

  return NextResponse.json({ success: true })
}
```

然后调用 `POST /api/update-prompts`。

## AI 响应格式

AI 应该返回以下格式的响应：

```markdown
# Article Title

Here is the article content in Markdown format...

## Section 1

Content continues...

---TAGS---
["tokyo", "spring travel", "cherry blossoms", "budget tips", "cultural experiences"]
```

## 标签处理流程

1. **AI 实体标签提取**: 从 AI 响应中解析 `---TAGS---` 之后的 JSON 数组
2. **标签标准化**: 使用 `normalizeTag` 函数标准化标签（小写、连字符、去特殊字符）
3. **时间标签生成**: 使用 `generateAutoTimeTags` 函数自动生成时间标签
4. **标签合并**: 使用 `processTagsFromAI` 函数合并两种标签
   - 去重
   - 限制数量（3-8 个标签）
   - 优先保留重要的实体标签
5. **保存到数据库**: 将最终标签数组保存为 JSON 字符串

## 系统常量

在 `lib/extract-tags.ts` 中定义：

```typescript
export const TAG_CONFIG = {
  MAX_TAGS: 8,    // 最大标签数量
  MIN_TAGS: 3,    // 最小标签数量
}
```

## 预期日志输出

当 AI 生成文章时，应该看到以下日志：

```
[AI 流水线] 使用 DeepSeek (deepseek-chat) 生成内容
[AI 流水线] 使用分类提示词: Social Media
[AI 流水线] 解析到 AI 实体标签: ["instagram engagement", "content scheduling", "analytics tools"]
[AI 流水线] 时间标签: ["weekend", "morning", "spring", "march"]
[AI 流水线] 最终标签（AI实体+时间标签）: ["instagram engagement", "content scheduling", "analytics tools", "weekend", "morning", "spring"]
```

## 测试步骤

1. 更新数据库中的分类提示词
2. 调用 `/api/articles/ai-rewrite` API
3. 检查日志输出，确认 AI 返回了标签
4. 查看数据库中的 `tags` 字段，确认标签格式正确
5. 检查前端页面，确认标签正确显示

## 故障排除

### 问题: AI 没有返回标签

**原因**: AI 可能忽略了 `---TAGS---` 要求

**解决**: 
1. 检查分类提示词是否正确更新
2. 增加 `system` 提示词中的强制要求
3. 调整 AI 的 `temperature` 参数（降低可提高一致性）

### 问题: 标签数量不正确

**原因**: 标签合并逻辑可能有问题

**解决**:
1. 检查 `processTagsFromAI` 函数的逻辑
2. 调整 `TAG_CONFIG` 常量
3. 查看 AI 返回的标签质量

### 问题: 时间标签生成错误

**原因**: `generateAutoTimeTags` 函数可能无法识别某些关键词

**解决**:
1. 检查文章标题和内容是否包含时间相关关键词
2. 扩展关键词匹配规则
3. 添加手动标签作为备选方案

## 后续优化

1. **标签质量**: 评估 AI 生成的标签质量，调整提示词
2. **标签统计**: 统计最常用的标签，优化标签标准化规则
3. **标签推荐**: 基于标签推荐相关文章
4. **标签权重**: 为不同类型的标签设置权重（时间标签优先级等）
5. **标签验证**: 添加标签验证逻辑，确保标签质量
