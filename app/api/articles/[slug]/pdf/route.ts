import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import puppeteer from 'puppeteer'
import { marked } from 'marked'

const prisma = new PrismaClient()

// GET - 生成文章PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let browser: any = null
  
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
    })

    // 生成HTML内容
    const htmlContent = generatePDFHTML(article)

    // 启动Puppeteer浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    })

    const page = await browser.newPage()

    // 设置页面内容
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // 等待图片加载
    await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'))
      return Promise.all(images.map(img => {
        if (img.complete) {
          return Promise.resolve()
        }
        return new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
        })
      }))
    })

    // 生成PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
      preferCSSPageSize: false,
    })

    // 关闭浏览器
    await browser.close()

    // 返回PDF文件
    const fileName = `${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    if (browser) {
      await browser.close()
    }
    return NextResponse.json({ success: false, error: 'Failed to generate PDF' }, { status: 500 })
  }
}

// 生成PDF所需的HTML
function generatePDFHTML(article: any): string {
  const { title, description, content, category, author, publishedAt, readingTime, coverImage, featured, tags } = article
  
  const formatDate = (date: string | null) => {
    if (!date) return 'Date not available'
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Date not available'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // 使用marked将markdown转换为HTML
  const contentHTML = marked(content || '')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.8;
      color: #333;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 0;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid #666;
    }
    
    .title {
      font-size: 32px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 15px;
      line-height: 1.3;
    }
    
    .meta {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .cover-image {
      width: 100%;
      max-width: 800px;
      height: auto;
      margin: 0 auto 30px auto;
      display: block;
      border-radius: 12px;
    }
    
    .description {
      background: #f0f7ff;
      padding: 25px;
      border-left: 6px solid #0066cc;
      margin-bottom: 40px;
      font-style: italic;
      font-size: 16px;
      line-height: 1.8;
    }
    
    .content {
      font-size: 16px;
      line-height: 1.8;
    }
    
    .content h1 {
      font-size: 28px;
      font-weight: bold;
      margin: 40px 0 20px 0;
      color: #1a1a1a;
      line-height: 1.3;
      page-break-after: avoid;
    }
    
    .content h2 {
      font-size: 24px;
      font-weight: bold;
      margin: 35px 0 18px 0;
      color: #1a1a1a;
      border-top: 2px solid #ddd;
      padding-top: 20px;
      line-height: 1.4;
      page-break-after: avoid;
    }
    
    .content h3 {
      font-size: 20px;
      font-weight: bold;
      margin: 30px 0 15px 0;
      color: #1a1a1a;
      line-height: 1.4;
      page-break-after: avoid;
    }
    
    .content p {
      margin-bottom: 18px;
      text-align: justify;
      orphans: 2;
      widows: 2;
    }
    
    .content ul, .content ol {
      margin-bottom: 18px;
      padding-left: 40px;
    }
    
    .content li {
      margin-bottom: 12px;
    }
    
    .content blockquote {
      border-left: 6px solid #0066cc;
      padding: 20px 25px;
      margin: 30px 0;
      background: #f9f9f9;
      font-style: italic;
      page-break-inside: avoid;
    }
    
    .content img {
      max-width: 100%;
      height: auto;
      margin: 30px 0;
      border-radius: 12px;
      display: block;
      page-break-inside: avoid;
    }
    
    .content strong {
      font-weight: bold;
      color: #000;
    }
    
    .content em {
      font-style: italic;
    }
    
    .content code {
      background: #f4f4f4;
      padding: 4px 10px;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      border: 1px solid #ddd;
    }
    
    .content a {
      color: #0066cc;
      text-decoration: underline;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    
    .tags {
      margin-top: 30px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }
    
    .tag {
      background: #f0f0f0;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      color: #555;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .header, .content h1, .content h2, .content h3, .content blockquote, .content img {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${title}</h1>
      <div class="meta">
        By ${author?.name || 'Unknown'}${readingTime && readingTime > 0 ? ` • ${readingTime} min read` : ''} • ${formatDate(publishedAt)}
      </div>
      ${featured ? '<div style="color: #0066cc; font-weight: bold; margin-top: 10px;">★ Featured Article</div>' : ''}
    </div>
    
    ${description ? `<div class="description">${description}</div>` : ''}
    
    <div class="content">
      ${contentHTML}
    </div>
    
    ${Array.isArray(tags) && tags.length > 0 ? `
      <div class="tags">
        ${tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
      </div>
    ` : ''}
    
    <div class="footer">
      <p>Generated from besttimeguide.com</p>
      <p>Category: ${category?.name || 'General'}</p>
    </div>
  </div>
</body>
</html>`
}
