import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'

const prisma = new PrismaClient()

// 从图片URL中提取文件名
function extractFileName(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const fileName = pathname.split('/').pop() || 'image'
    return fileName
  } catch {
    return 'image'
  }
}

// 从图片URL中提取slug/关键词（基于文件名）
function extractSlug(url: string): string {
  const fileName = extractFileName(url)
  // 移除文件扩展名
  const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|gif|webp|svg)$/i, '')
  // 转换为小写，用连字符替换空格和特殊字符
  return nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100) || 'image'
}

// 从文章内容中提取所有图片URL
function extractImageUrls(content: string): string[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  const urls: string[] = []
  let match

  while ((match = imageRegex.exec(content)) !== null) {
    urls.push(match[2])
  }

  return urls
}

// 获取图片信息（大小和尺寸）
async function getImageInfo(url: string): Promise<{ size: number; width?: number; height?: number } | null> {
  try {
    console.log(`  Fetching image: ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      console.log(`  Failed to fetch: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 获取文件大小
    const size = buffer.length

    // 尝试获取图片尺寸
    let width: number | undefined
    let height: number | undefined
    try {
      const metadata = await sharp(buffer).metadata()
      width = metadata.width
      height = metadata.height
    } catch (error) {
      // 无法获取尺寸
    }

    return { size, width, height }
  } catch (error) {
    console.error(`  Error fetching image:`, error)
    return null
  }
}

// 判断是否是R2 URL
function isR2Url(url: string): boolean {
  const R2_PUBLIC_URL = process.env.CDN_BASE_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL
  if (R2_PUBLIC_URL) {
    const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '')
    return url.startsWith(baseUrl) || url.includes('/article/')
  }
  return url.includes('.r2.cloudflarestorage.com') || url.includes('.r2.dev')
}

// 从R2 URL中提取路径
function extractR2Path(url: string): string | null {
  const R2_PUBLIC_URL = process.env.CDN_BASE_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL

  // 尝试从CDN URL提取
  if (R2_PUBLIC_URL) {
    const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '')
    if (url.startsWith(baseUrl)) {
      return url.substring(baseUrl.length + 1) // +1 to remove the leading slash
    }
  }

  // 尝试从R2原始URL提取
  const r2PathMatch = url.match(/\.r2\.(cloudflarestorage\.com|dev)\/(.+)$/)
  if (r2PathMatch) {
    return r2PathMatch[2]
  }

  return null
}

// 主函数
async function main() {
  console.log('开始提取文章图片...\n')

  // 获取所有已发布的文章
  const articles = await prisma.article.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
    },
  })

  console.log(`找到 ${articles.length} 篇已发布的文章\n`)

  let totalImagesProcessed = 0
  let totalImagesAdded = 0
  let totalImagesSkipped = 0

  for (const article of articles) {
    console.log(`\n处理文章: ${article.title} (ID: ${article.id})`)

    // 从文章内容中提取图片URL
    const imageUrls = extractImageUrls(article.content)
    console.log(`  找到 ${imageUrls.length} 张图片`)

    if (imageUrls.length === 0) {
      console.log('  没有图片，跳过')
      continue
    }

    let articleImagesAdded = 0

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i]
      console.log(`\n  处理图片 ${i + 1}/${imageUrls.length}`)

      // 检查是否已存在
      const existingImage = await prisma.articleImage.findFirst({
        where: {
          articleId: article.id,
          r2Url: imageUrl,
        },
      })

      if (existingImage) {
        console.log(`  图片已存在，跳过`)
        totalImagesSkipped++
        continue
      }

      // 提取图片信息
      const fileName = extractFileName(imageUrl)
      const slug = extractSlug(imageUrl)
      const r2Path = extractR2Path(imageUrl)

      // 获取图片大小和尺寸
      const imageInfo = await getImageInfo(imageUrl)

      if (!imageInfo) {
        console.log(`  无法获取图片信息，跳过`)
        continue
      }

      // 保存到数据库
      try {
        await prisma.articleImage.create({
          data: {
            articleId: article.id,
            slug,
            name: fileName,
            r2Path: r2Path || '',
            r2Url: imageUrl,
            size: imageInfo.size,
            width: imageInfo.width,
            height: imageInfo.height,
            sourceUrl: isR2Url(imageUrl) ? null : imageUrl, // 如果不是R2链接，保存原始URL
            order: i,
          },
        })

        console.log(`  ✓ 保存成功: ${fileName} (${(imageInfo.size / 1024).toFixed(2)} KB)`)
        totalImagesAdded++
        articleImagesAdded++
      } catch (error) {
        console.error(`  ✗ 保存失败:`, error)
      }

      totalImagesProcessed++
    }

    console.log(`\n  文章 ${article.title} 处理完成: 添加 ${articleImagesAdded} 张图片`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('提取完成!')
  console.log('='.repeat(60))
  console.log(`总文章数: ${articles.length}`)
  console.log(`总图片数: ${totalImagesProcessed}`)
  console.log(`成功添加: ${totalImagesAdded}`)
  console.log(`已存在跳过: ${totalImagesSkipped}`)
  console.log('='.repeat(60))
}

// 运行脚本
main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
