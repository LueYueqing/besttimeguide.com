import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'

const prisma = new PrismaClient()

// 生成二维码
async function generateQRCode(url: string): Promise<string> {
  const QRCode = await import('qrcode')
  const qrDataURL = await QRCode.toDataURL(url, {
    width: 200,
    margin: 1,
  })
  return qrDataURL
}

// 下载图片并转换为 base64，支持 WebP 转换
async function downloadImageToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    
    if (!response.ok) {
      console.error(`Failed to download image: ${url}, status: ${response.status}`)
      return url
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // 检测是否是 WebP 格式
    const contentType = response.headers.get('content-type') || ''
    const mimeType = contentType.split(';')[0].trim()
    
    if (mimeType === 'image/webp') {
      // 使用 sharp 将 WebP 转换为 JPEG
      const sharp = await import('sharp')
      const jpegBuffer = await sharp.default(buffer)
        .jpeg({ quality: 90 })
        .toBuffer()
      
      const base64 = jpegBuffer.toString('base64')
      return `data:image/jpeg;base64,${base64}`
    } else {
      // 非 WebP 格式，直接转换
      const base64 = buffer.toString('base64')
      return `data:${mimeType};base64,${base64}`
    }
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error)
    return url
  }
}

// 提取 markdown 中的所有图片 URL
function extractImageUrls(markdown: string): string[] {
  const urls: string[] = []
  const imgRegex = /!\[.*?\]\((.*?)\)/g
  let match
  
  while ((match = imgRegex.exec(markdown)) !== null) {
    const url = match[1]
    if (url.startsWith('http://') || url.startsWith('https://')) {
      urls.push(url)
    }
  }
  
  return urls
}

// 替换 markdown 中的图片 URL 为 base64
function replaceImageUrlsWithBase64(markdown: string, urlMap: Map<string, string>): string {
  return markdown.replace(/!\[.*?\]\((.*?)\)/g, (match, url) => {
    const base64Url = urlMap.get(url)
    if (base64Url) {
      return match.replace(url, base64Url)
    }
    return match
  })
}

// GET - 生成文章PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 获取文章
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
      },
    })

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    // 增加下载次数
    await prisma.article.update({
      where: { id: article.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    } as any)

    // 生成二维码
    const articleUrl = `https://besttimeguide.com/${slug}`
    const qrCodeData = await generateQRCode(articleUrl)

    // 提取并下载所有图片
    const imageUrls = extractImageUrls(article.content || '')
    const imageMap = new Map<string, string>()
    
    // 并行下载所有图片
    if (imageUrls.length > 0) {
      const downloadPromises = imageUrls.map(async (url) => {
        const base64Url = await downloadImageToBase64(url)
        return { url, base64Url }
      })
      
      const results = await Promise.all(downloadPromises)
      results.forEach(({ url, base64Url }) => {
        imageMap.set(url, base64Url)
      })
    }

    // 替换 markdown 中的图片 URL 为 base64
    const processedContent = replaceImageUrlsWithBase64(article.content || '', imageMap)

    // 创建处理后的文章对象
    const processedArticle = {
      ...article,
      content: processedContent,
    }

    // 动态导入 PdfDocument 组件
    const { PdfDocument } = await import('@/components/PdfDocument')
    
    // 渲染 PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(PdfDocument, { article: processedArticle, qrCodeData }) as any
    )

    // 返回PDF
    const fileName = `${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate PDF' }, { status: 500 })
  }
}
