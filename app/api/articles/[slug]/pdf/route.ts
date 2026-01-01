import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'
import { marked } from 'marked'

const prisma = new PrismaClient()

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

    // 创建PDF文档
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      bufferPages: true,
    })

    // 创建buffer来存储PDF
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => {
      // PDF生成完成
    })

    // 设置字体
    const fontRegular = 'Helvetica'
    const fontBold = 'Helvetica-Bold'

    // 添加标题
    doc.fontSize(24)
      .font(fontBold)
      .text(article.title, { align: 'center' })
      .moveDown()

    // 添加元信息
    doc.fontSize(10)
      .font(fontRegular)
      .fillColor('#666666')
      .text(
        `By ${article.author?.name || 'Unknown'}${
          article.readingTime && article.readingTime > 0 ? ` • ${article.readingTime} min read` : ''
        } • ${formatDate(article.publishedAt)}`,
        { align: 'center' }
      )

    if (article.featured) {
      doc.fontSize(10)
        .fillColor('#0066cc')
        .font(fontBold)
        .text('★ Featured Article', { align: 'center' })
    }

    doc.moveDown(2)

    // 添加描述
    if (article.description) {
      doc.fontSize(12)
        .font(fontRegular)
        .fillColor('#333333')
        .rect(50, doc.y, 515, 80)
        .fill('#f0f7ff')
        .fillColor('#333333')
        .text(article.description, 60, doc.y + 10, {
          width: 495,
          align: 'justify',
          lineGap: 2,
        })
        .moveDown(2)
    }

    // 解析并添加内容
    const contentHTML = await marked(article.content || '')
    addContentToPDF(doc, contentHTML)

    // 添加标签
    if (Array.isArray(article.tags) && article.tags.length > 0) {
      doc.moveDown(2)
        .fontSize(10)
        .font(fontRegular)
        .fillColor('#666666')
        .text('Tags:', 50, doc.y, { width: 515 })

      const tagY = doc.y + 5
      let tagX = 50

      article.tags.forEach((tag) => {
        if (tagX > 400) {
          tagX = 50
          doc.moveDown(1)
        }

        doc.rect(tagX, doc.y, 80, 20)
          .fill('#f0f0f0')
          .fillColor('#555555')
          .text(tag, tagX + 5, doc.y + 5, {
            width: 70,
            align: 'center',
          })

        tagX += 90
      })
    }

    // 添加页脚（二维码）
    addFooter(doc, article.slug, article.category?.name || 'General')

    // 完成PDF生成
    doc.end()

    // 等待PDF生成完成
    await new Promise<void>((resolve) => {
      doc.on('end', () => resolve())
    })

    // 合并chunks生成buffer
    const pdfBuffer = Buffer.concat(chunks)

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
    return NextResponse.json({ success: false, error: 'Failed to generate PDF' }, { status: 500 })
  }
}

// 格式化日期
function formatDate(date: string | Date | null): string {
  if (!date) return 'Date not available'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Date not available'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 添加内容到PDF
function addContentToPDF(doc: PDFKit.PDFDocument, html: string) {
  // 简单的HTML解析器，将HTML转换为PDF内容
  const lines = html.split('\n')
  const fontRegular = 'Helvetica'
  const fontBold = 'Helvetica-Bold'

  doc.fontSize(12)
    .font(fontRegular)
    .fillColor('#333333')

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) {
      doc.moveDown(0.5)
      continue
    }

    // 处理标题
    if (trimmedLine.startsWith('<h1>')) {
      const text = trimmedLine.replace(/<\/?h1>/g, '').trim()
      doc.fontSize(20)
        .font(fontBold)
        .fillColor('#1a1a1a')
        .text(text, { continued: false })
        .moveDown(0.5)
      doc.fontSize(12)
        .font(fontRegular)
        .fillColor('#333333')
    } else if (trimmedLine.startsWith('<h2>')) {
      const text = trimmedLine.replace(/<\/?h2>/g, '').trim()
      doc.fontSize(16)
        .font(fontBold)
        .fillColor('#1a1a1a')
        .text(text, { continued: false })
        .moveDown(0.5)
      doc.fontSize(12)
        .font(fontRegular)
        .fillColor('#333333')
    } else if (trimmedLine.startsWith('<h3>')) {
      const text = trimmedLine.replace(/<\/?h3>/g, '').trim()
      doc.fontSize(14)
        .font(fontBold)
        .fillColor('#1a1a1a')
        .text(text, { continued: false })
        .moveDown(0.5)
      doc.fontSize(12)
        .font(fontRegular)
        .fillColor('#333333')
    }
    // 处理段落
    else if (trimmedLine.startsWith('<p>')) {
      const text = trimmedLine
        .replace(/<\/?p>/g, '')
        .replace(/<strong>(.*?)<\/strong>/g, '$1')
        .replace(/<em>(.*?)<\/em>/g, '$1')
        .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
        .replace(/<code>(.*?)<\/code>/g, '$1')
        .replace(/&nbsp;/g, ' ')
        .trim()

      if (text) {
        doc.text(text, { align: 'justify', lineGap: 2 })
        doc.moveDown(0.5)
      }
    }
    // 处理列表
    else if (trimmedLine.startsWith('<ul>') || trimmedLine.startsWith('<ol>')) {
      // 列表会在处理li时处理
    } else if (trimmedLine.startsWith('</ul>') || trimmedLine.endsWith('</ol>')) {
      doc.moveDown(0.5)
    } else if (trimmedLine.startsWith('<li>')) {
      const text = trimmedLine
        .replace(/<\/?li>/g, '')
        .replace(/<strong>(.*?)<\/strong>/g, '$1')
        .replace(/<em>(.*?)<\/em>/g, '$1')
        .replace(/<code>(.*?)<\/code>/g, '$1')
        .replace(/&nbsp;/g, ' ')
        .trim()

      if (text) {
        doc.text(`• ${text}`, { continued: false })
        doc.moveDown(0.3)
      }
    }
    // 处理引用
    else if (trimmedLine.startsWith('<blockquote>')) {
      const text = trimmedLine.replace(/<\/?blockquote>/g, '').trim()
      doc.rect(60, doc.y, 495, 40)
        .fill('#f9f9f9')
        .fillColor('#333333')
        .text(`"${text}"`, 70, doc.y + 5, {
          width: 475,
          align: 'justify',
          lineGap: 2,
        })
        .moveDown(1)
    }
    // 处理图片
    else if (trimmedLine.startsWith('<img')) {
      const srcMatch = trimmedLine.match(/src="([^"]*)"/)
      if (srcMatch && srcMatch[1]) {
        try {
          // 尝试加载图片
          doc.image(srcMatch[1], {
            fit: [500, 300],
            align: 'center',
          })
          doc.moveDown(1)
        } catch (error) {
          // 如果图片加载失败，只显示文本
          doc.moveDown(0.5)
        }
      }
    }
  }
}

// 添加页脚
function addFooter(doc: PDFKit.PDFDocument, slug: string, categoryName: string) {
  const footerY = doc.page.height - 80

  // 添加分隔线
  doc.moveTo(50, footerY)
    .lineTo(565, footerY)
    .strokeColor('#dddddd')
    .stroke()

  // 添加提示文字
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#666666')
    .text('Scan QR code to view this article online', 50, footerY + 10, {
      width: 515,
      align: 'center',
    })

  // 添加URL
  const url = `https://besttimeguide.com/${slug}`
  doc.text(url, 50, footerY + 30, {
    width: 515,
    align: 'center',
  })

  // 添加生成信息
  doc.text('Generated from besttimeguide.com', 50, footerY + 45, {
    width: 515,
    align: 'center',
  })

  // 添加分类
  doc.text(`Category: ${categoryName}`, 50, footerY + 60, {
    width: 515,
    align: 'center',
  })
}
