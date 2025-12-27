import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import sharp from 'sharp'

// 优先使用 CDN_BASE_URL，如果未设置则回退到 CLOUDFLARE_R2_PUBLIC_URL
const R2_PUBLIC_URL = process.env.CDN_BASE_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL

// 初始化 R2 客户端
const getR2Client = () => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'besttimeguide'
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Cloudflare R2 credentials are not configured')
  }

  return {
    client: new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
    bucketName,
  }
}

// 生成文件名（基于文章slug和alt文本，SEO友好）
function generateFileName(articleSlug: string | null, alt: string, url: string, index: number): string {
  // 从 URL 提取扩展名
  let extension = ''
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const urlFileName = pathname.split('/').pop() || ''
    const extMatch = urlFileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    if (extMatch) {
      extension = extMatch[1].toLowerCase()
      // 统一 jpeg 为 jpg
      if (extension === 'jpeg') extension = 'jpg'
    }
  } catch {
    // URL 解析失败，稍后使用默认扩展名
  }

  // 如果没有从 URL 提取到扩展名，默认使用 png
  if (!extension) {
    extension = 'png'
  }

  // 构建文件名：{article-slug}-{index}-{alt-keywords}.{ext}
  const parts: string[] = []

  // 1. 文章slug（如果有）
  if (articleSlug) {
    parts.push(articleSlug)
  }

  // 2. 索引（从1开始，用于区分同一篇文章的多张图片）
  parts.push(String(index + 1))

  // 3. Alt文本关键词（如果有且有效）
  if (alt && alt.trim().length >= 3) {
    const altKeywords = alt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .replace(/^-|-$/g, '') // 移除开头和结尾的连字符
      .substring(0, 30) // 限制长度，避免文件名过长
    
    if (altKeywords && altKeywords.length >= 3) {
      parts.push(altKeywords)
    }
  }

  // 组合文件名
  let fileName = parts.join('-')
  
  // 确保文件名不会太长（限制总长度为80字符，不包括扩展名）
  if (fileName.length > 80) {
    // 如果太长，保留slug和索引，截断alt部分
    if (articleSlug) {
      const slugAndIndex = `${articleSlug}-${index + 1}`
      const remainingLength = 80 - slugAndIndex.length - 1 // -1 for the dash
      if (remainingLength > 0 && parts.length > 2) {
        const altPart = parts[2].substring(0, remainingLength)
        fileName = `${slugAndIndex}-${altPart}`
      } else {
        fileName = slugAndIndex
      }
    } else {
      fileName = fileName.substring(0, 80)
    }
  }

  // 添加扩展名
  return `${fileName}.${extension}`
}

// 生成 R2 路径：article\{year-month-day}\filename
function generateR2Path(fileName: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const datePath = `${year}-${month}-${day}`

  return `article/${datePath}/${fileName}`
}

// 下载图片
async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error)
    throw error
  }
}

// 检查图片 URL 是否已经是 R2 URL
function isR2Url(url: string): boolean {
  if (R2_PUBLIC_URL) {
    const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '')
    return url.startsWith(baseUrl) || url.includes('/article/')
  }
  // 检查是否是 R2 默认 URL 格式
  return url.includes('.r2.cloudflarestorage.com') || url.includes('.r2.dev')
}

// 上传图片到 R2
export async function uploadImageToR2(
  imageUrl: string,
  alt: string,
  index: number,
  articleSlug?: string | null
): Promise<string> {
  try {
    // 如果图片 URL 已经是 R2 URL，检查是否需要转换为 CDN 链接
    if (isR2Url(imageUrl)) {
      // 如果已经使用了自定义 CDN 域名，直接返回
      if (R2_PUBLIC_URL) {
        const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '')
        if (imageUrl.startsWith(baseUrl)) {
          console.log(`[R2] Image ${index + 1} is already using CDN: ${imageUrl}`)
          return imageUrl
        }
      }

      // 如果是 R2 原始链接，需要转换为 CDN 链接
      // 从原始链接中提取路径：https://{accountId}.r2.cloudflarestorage.com/{path}
      // 或：https://pub-{hash}.r2.dev/{path}
      const r2PathMatch = imageUrl.match(/\.r2\.(cloudflarestorage\.com|dev)\/(.+)$/)
      if (r2PathMatch && R2_PUBLIC_URL) {
        const r2Path = r2PathMatch[2]
        const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '')
        const cdnUrl = `${baseUrl}/${r2Path}`
        console.log(`[R2] Image ${index + 1} converted from R2 URL to CDN: ${imageUrl} -> ${cdnUrl}`)
        return cdnUrl
      }

      // 如果无法转换，返回原 URL
      console.log(`[R2] Image ${index + 1} is already in R2 but cannot convert to CDN: ${imageUrl}`)
      return imageUrl
    }

    const { client, bucketName } = getR2Client()

    // 下载图片
    console.log(`[R2] Downloading image ${index + 1}: ${imageUrl}`)
    const imageBuffer = await downloadImage(imageUrl)

    // 获取图片信息（尺寸和文件大小）
    let imageInfo: { width?: number; height?: number; size: number; format?: string } = {
      size: imageBuffer.length,
    }

    try {
      const metadata = await sharp(imageBuffer).metadata()
      imageInfo = {
        width: metadata.width,
        height: metadata.height,
        size: imageBuffer.length,
        format: metadata.format,
      }
      console.log(`[R2] Image ${index + 1} info: ${imageInfo.width}x${imageInfo.height}, ${(imageInfo.size / 1024).toFixed(2)} KB, format: ${imageInfo.format}`)
    } catch (error) {
      // 如果 sharp 无法处理（可能是 SVG 或其他格式），只记录文件大小
      console.log(`[R2] Image ${index + 1} size: ${(imageInfo.size / 1024).toFixed(2)} KB (could not read dimensions)`)
    }

    // 生成文件名和路径（基于文章slug，SEO友好）
    const fileName = generateFileName(articleSlug || null, alt, imageUrl, index)

    // 检测内容类型
    const contentType = getContentType(imageUrl, imageBuffer)

    // 上传到 R2
    return await uploadBufferToR2(imageBuffer, fileName, contentType)
  } catch (error) {
    console.error(`[R2] Error uploading image:`, error)
    throw error
  }
}

// 直接上传 Buffer 到 R2
export async function uploadBufferToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const { client, bucketName } = getR2Client()
  const r2Path = generateR2Path(fileName)

  console.log(`[R2] Uploading buffer to: ${r2Path}`)
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2Path,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // 1 年缓存
  })

  await client.send(command)

  // 生成公共访问 URL
  let publicUrl: string
  if (R2_PUBLIC_URL) {
    const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '')
    publicUrl = `${baseUrl}/${r2Path}`
  } else {
    publicUrl = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${r2Path}`
  }

  console.log(`[R2] Buffer uploaded successfully: ${publicUrl}`)
  return publicUrl
}

// 检测图片内容类型
function getContentType(url: string, buffer: Buffer): string {
  // 从 URL 扩展名判断
  const urlLower = url.toLowerCase()
  if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
    return 'image/jpeg'
  }
  if (urlLower.includes('.png')) {
    return 'image/png'
  }
  if (urlLower.includes('.gif')) {
    return 'image/gif'
  }
  if (urlLower.includes('.webp')) {
    return 'image/webp'
  }
  if (urlLower.includes('.svg')) {
    return 'image/svg+xml'
  }

  // 从文件头判断（Magic Number）
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return 'image/jpeg'
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png'
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif'
  }
  if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'image/webp'
  }

  // 默认返回 png
  return 'image/png'
}

// 批量上传图片（自动去重，跳过已上传的图片）
export async function uploadImagesToR2(
  images: Array<{ url: string; alt: string }>,
  articleSlug?: string | null
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>()
  let skippedCount = 0
  let uploadedCount = 0

  for (let i = 0; i < images.length; i++) {
    const { url, alt } = images[i]
    try {
      // 这里的逻辑已更新：
      // 即使图片已经是 R2 URL，也需要调用 uploadImageToR2
      // 因为 uploadImageToR2 内部包含了将 R2 原始链接转换为 CDN 链接的逻辑
      // 如果我们在这里跳过，就会导致已经是 R2 格式但未转换为 CDN 格式的链接被直接保留

      const newUrl = await uploadImageToR2(url, alt, i, articleSlug)

      // 统计逻辑：如果 URL 变了（说明被转换或新上传了），或者是新上传的
      // 这里简化统计，不再区分跳过还是上传，统一视为处理成功
      uploadedCount++
      urlMap.set(url, newUrl)
    } catch (error) {
      console.error(`[R2] Failed to upload image ${i + 1} (${url}):`, error)
      // 如果上传失败，保留原 URL
      urlMap.set(url, url)
    }
  }

  if (skippedCount > 0) {
    console.log(`[R2] Skipped ${skippedCount} already uploaded images, uploaded ${uploadedCount} new images`)
  }

  return urlMap
}
