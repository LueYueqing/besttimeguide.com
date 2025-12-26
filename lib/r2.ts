import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

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

// 生成文件名（从 alt 文本或 URL 提取）
function generateFileName(alt: string, url: string, index: number): string {
  // 尝试从 alt 文本生成文件名
  let baseName = alt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/-+/g, '-') // 多个连字符合并为一个
    .replace(/^-|-$/g, '') // 移除开头和结尾的连字符
    .substring(0, 50) // 限制长度

  // 如果 alt 文本为空或太短，尝试从 URL 提取
  if (!baseName || baseName.length < 3) {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const urlFileName = pathname.split('/').pop() || ''
      baseName = urlFileName
        .replace(/[^a-z0-9.-]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50)
    } catch {
      // URL 解析失败，使用默认名称
    }
  }

  // 如果还是没有有效的名称，使用索引
  if (!baseName || baseName.length < 3) {
    baseName = `image-${index + 1}`
  }

  // 确保有扩展名
  if (!baseName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    baseName += '.png' // 默认使用 png
  }

  return baseName
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
  index: number
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

    // 生成文件名和路径
    const fileName = generateFileName(alt, imageUrl, index)
    const r2Path = generateR2Path(fileName)

    // 检测内容类型
    const contentType = getContentType(imageUrl, imageBuffer)

    // 上传到 R2
    console.log(`[R2] Uploading to: ${r2Path}`)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: r2Path,
      Body: imageBuffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 年缓存
    })

    await client.send(command)

    // 生成公共访问 URL
    // 如果配置了自定义域名（推荐），使用自定义域名
    // 否则使用 R2 的默认公共访问 URL（需要配置 R2 公共访问）
    let publicUrl: string
    if (R2_PUBLIC_URL) {
      // 使用自定义域名，路径不包含 bucket 名称
      const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '') // 移除末尾的斜杠
      publicUrl = `${baseUrl}/${r2Path}`
    } else {
      // 使用 R2 默认公共访问 URL（不推荐，建议配置自定义域名）
      // 注意：R2 的默认公共访问 URL 格式为：https://pub-{hash}.r2.dev/{path}
      // 但通常需要配置自定义域名才能正常访问
      console.warn('[R2] CUSTOM_DOMAIN/CDN_BASE_URL not set, using default R2 URL (may not work without custom domain)')
      publicUrl = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${r2Path}`
    }

    console.log(`[R2] Uploaded successfully: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error(`[R2] Error uploading image:`, error)
    throw error
  }
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
  images: Array<{ url: string; alt: string }>
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

      const newUrl = await uploadImageToR2(url, alt, i)

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
