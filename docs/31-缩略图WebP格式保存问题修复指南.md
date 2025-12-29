# 缩略图 WebP 格式保存问题修复指南

## 问题描述

在文章编辑页面手动上传 WebP 格式的缩略图时，遇到以下问题：

1. 在编辑页面粘贴图片后，图片正确显示为 WebP 格式
2. 右键点击图片查看属性，确认是 WebP 格式
3. 保存文章后刷新页面，缩略图又变回了 JPG 格式

例如：文章 `/articles/143?filter=published` 就存在这个问题。

## 问题原因

在 `app/api/articles/[slug]/route.ts` 的 PUT 方法（更新文章）中，存在自动生成封面图的逻辑：

```javascript
// 如果没有封面图，尝试从内容中提取第一张图片并生成缩略图
let coverImageUrl = existing.coverImage
if (!coverImageUrl && content) {
  // 从内容中提取第一张图片
  const imageRegex = /!\[.*?\]\((.*?)\)/g
  const matches = Array.from(content.matchAll(imageRegex))

  if (matches.length > 0) {
    const firstImageUrl = matches[0][1]
    
    // 下载图片并转换为 JPG
    const fileName = `${articleSlug}-cover-375x200.jpg`
    const resizedBuffer = await sharp(imageBuffer)
      .resize(375, 200, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })  // 强制转换为 JPEG
      .toBuffer()
    
    coverImageUrl = await uploadBufferToR2(resizedBuffer, fileName, 'image/jpeg')
  }
}
```

### 为什么会覆盖 WebP 图片？

1. **前端上传流程**：
   - 用户在编辑页面粘贴图片
   - 前端调用 `/api/upload?resize=true` 上传图片
   - 上传 API 正确将图片转换为 WebP 并返回 URL
   - 前端将 URL 设置到 `formData.coverImage`
   - 用户点击保存，发送 PUT 请求

2. **后端处理流程**：
   - PUT 请求包含 `coverImage` 字段（WebP URL）
   - 但是，PUT 方法的逻辑是：先查询现有文章（`existing`）
   - 此时 `existing.coverImage` 可能为空（因为前端刚上传，还没保存）
   - 条件 `if (!coverImageUrl && content)` 判断为真
   - 自动从内容中提取第一张图片并强制转换为 JPG
   - **覆盖了用户手动上传的 WebP 图片**

### 核心问题

自动生成逻辑会：
1. 从文章内容的 Markdown 中提取第一张图片
2. 强制转换为 JPEG 格式（`.jpg`）
3. 覆盖 `coverImage` 字段

即使用户手动上传了 WebP 格式的缩略图，也会被这个自动生成逻辑覆盖。

## 解决方案

### 实现智能封面图处理逻辑

修改 `app/api/articles/[slug]/route.ts` 的 PUT 方法，实现智能的封面图处理：

```javascript
// 智能处理封面图：
// 1. 如果请求中提供了 coverImage，使用用户上传的（优先级最高）
// 2. 否则，如果数据库中有现有封面图，保持不变
// 3. 都没有时，才从内容中自动生成封面图
let coverImageUrl = existing.coverImage

// 检查请求中是否提供了 coverImage
const hasUserProvidedCoverImage = body.coverImage !== undefined && body.coverImage !== null && body.coverImage !== ''

if (!hasUserProvidedCoverImage && !existing.coverImage && content) {
  // 用户没有上传缩略图，且数据库中也没有，才自动生成
  try {
    // 从 Markdown 内容中提取第一张图片 URL
    const imageRegex = /!\[.*?\]\((.*?)\)/g
    const matches = Array.from(content.matchAll(imageRegex))

    if (matches.length > 0) {
      const firstImageUrl = matches[0][1]

      // 检查是否是有效的 URL
      if (firstImageUrl && (firstImageUrl.startsWith('http://') || firstImageUrl.startsWith('https://'))) {
        try {
          console.log(`[Article Update] Generating cover image from: ${firstImageUrl}`)

          // 下载图片
          const imageBuffer = await downloadImage(firstImageUrl)

          // 使用 sharp 调整为 375x200
          const resizedBuffer = await sharp(imageBuffer)
            .resize(375, 200, {
              fit: 'cover',
              position: 'center',
            })
            .jpeg({ quality: 85 })
            .toBuffer()

          // 生成文件名
          const articleSlug = slug || existing.slug
          const fileName = `${articleSlug}-cover-375x200.jpg`

          // 上传到 R2
          const uploadResult = await uploadBufferToR2(resizedBuffer, fileName, 'image/jpeg')
          coverImageUrl = uploadResult.r2Url

          console.log(`[Article Update] Cover image auto-generated: ${coverImageUrl}`)
        } catch (error) {
          console.error('[Article Update] Error generating cover image:', error)
          // 如果生成失败，继续使用原有的 coverImage（null）
        }
      }
    }
  } catch (error) {
    console.error('[Article Update] Error extracting image from content:', error)
    // 如果提取失败，继续使用原有的 coverImage
  }
} else if (hasUserProvidedCoverImage) {
  // 用户提供了封面图，使用用户上传的
  coverImageUrl = body.coverImage
  console.log(`[Article Update] Using user-provided cover image: ${coverImageUrl}`)
}
```

### 修复后的行为

1. ✅ 用户手动上传的 WebP 缩略图会被正确保存（优先级最高）
2. ✅ 如果没有上传但数据库中有封面图，保持不变
3. ✅ 只有在完全没有封面图时，才自动生成（作为后备方案）
4. ✅ WebP 格式在保存后仍然保持
5. ✅ 减少了不必要的图片处理和上传

### 优先级逻辑

封面图的处理优先级：

```
1. 用户上传的封面图（最高优先级）
   ↓
2. 数据库中现有的封面图
   ↓
3. 从内容自动生成的封面图（最低优先级，后备方案）
```

### 影响

- **正面影响**：
  - ✅ 保留了用户手动上传的 WebP 图片
  - ✅ 保留了自动生成功能作为后备方案
  - ✅ 避免了重复上传和处理
  - ✅ 提升了用户体验
  - ✅ 智能判断，不需要手动干预
  
- **需要注意事项**：
  - 如果用户没有上传封面图且内容中也没有图片，文章将没有封面图
  - 自动生成的封面图始终是 JPG 格式（用于列表展示）

## 相关文件

- `app/api/articles/[slug]/route.ts` - 文章更新 API（PUT 方法）
- `app/dashboard/articles/article-editor.tsx` - 文章编辑页面
- `app/api/upload/route.ts` - 图片上传 API（WebP 转换逻辑）
- `lib/r2.ts` - R2 存储相关函数

## 测试验证

### 测试步骤

1. 打开文章编辑页面（例如 `/dashboard/articles/143`）
2. 在缩略图区域粘贴一张图片
3. 观察图片显示，右键确认是 WebP 格式
4. 点击保存按钮
5. 刷新页面，再次查看缩略图
6. **预期结果**：缩略图仍然是 WebP 格式

### 测试场景

#### 场景 1：用户上传 WebP 缩略图

1. 用户在编辑页面粘贴图片（WebP 格式）
2. 点击保存
3. **预期**：封面图保存为 WebP 格式，不被覆盖

#### 场景 2：用户不上传缩略图，但内容中有图片

1. 用户编辑文章内容，插入图片
2. 不上传缩略图
3. 点击保存
4. **预期**：自动从内容中提取第一张图片生成 JPG 封面图

#### 场景 3：用户不上传缩略图，内容中也没有图片

1. 用户编辑纯文本文章
2. 不上传缩略图
3. 点击保存
4. **预期**：文章没有封面图（封面图字段为 null）

#### 场景 4：已有封面图的文章更新内容

1. 文章已有封面图（数据库中）
2. 用户编辑文章内容
3. 不上传新缩略图
4. 点击保存
5. **预期**：保持原有封面图不变

## 预期行为

- ✅ **用户上传的图片**：保留原始格式（WebP）
- ✅ **自动生成的图片**：统一为 JPG 格式（375x200 像素）
- ✅ **现有封面图**：更新内容时不被覆盖
- ✅ **智能判断**：根据情况自动选择最合适的封面图

## 总结

通过实现智能封面图处理逻辑，解决了以下问题：

1. ✅ WebP 格式的缩略图在保存后不会被覆盖
2. ✅ 用户手动上传的图片格式得到保留
3. ✅ 保留了自动生成功能作为后备方案
4. ✅ 减少了不必要的服务器处理和存储
5. ✅ 提升了用户体验和性能
6. ✅ 符合用户预期行为

这个修复确保了用户的操作（手动上传 WebP 缩略图）不会被系统的自动逻辑覆盖，同时也保留了自动生成功能的便利性，实现了智能的封面图处理。
