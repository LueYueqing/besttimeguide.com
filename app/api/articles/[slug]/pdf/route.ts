import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { marked } from 'marked'
import jsPDF from 'jspdf'

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
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - margin * 2

    let y = margin
    const lineHeight = 6
    const titleHeight = 10
    const headerHeight = 8

    // 添加标题
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    const titleLines = doc.splitTextToSize(article.title, contentWidth)
    titleLines.forEach((line: string) => {
      doc.text(line, margin, y)
      y += titleHeight
    })
    y += 5

    // 添加元信息
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(102, 102, 102)
    const metaText = `By ${article.author?.name || 'Unknown'}${
      article.readingTime && article.readingTime > 0 ? ` • ${article.readingTime} min read` : ''
    } • ${formatDate(article.publishedAt)}`
    doc.text(metaText, margin, y, { align: 'center', maxWidth: contentWidth })
    y += 5

    if (article.featured) {
      doc.setTextColor(0, 102, 204)
      doc.setFont('helvetica', 'bold')
      doc.text('★ Featured Article', margin, y, { align: 'center', maxWidth: contentWidth })
      y += 5
    }

    y += 10

    // 添加描述框
    if (article.description) {
      doc.setFillColor(240, 247, 255)
      doc.rect(margin, y, contentWidth, 30, 'F')
      doc.setTextColor(51, 51, 51)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const descLines = doc.splitTextToSize(article.description, contentWidth - 10)
      descLines.forEach((line: string, index: number) => {
        doc.text(line, margin + 5, y + 5 + index * lineHeight)
      })
      y += 35
    }

    // 解析并添加内容
    const contentHTML = await marked(article.content || '')
    addContentToPDF(doc, contentHTML, y, margin, contentWidth, lineHeight)

    // 添加标签
    if (Array.isArray(article.tags) && article.tags.length > 0) {
      y = doc.internal.pageSize.getHeight() - 40
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(102, 102, 102)
      doc.text('Tags:', margin, y)
      y += 7

      let tagX = margin
      const tagWidth = 30
      const tagHeight = 6

      article.tags.forEach((tag) => {
        if (tagX + tagWidth > pageWidth - margin) {
          tagX = margin
          y += tagHeight + 3
        }

        doc.setFillColor(240, 240, 240)
        doc.rect(tagX, y, tagWidth, tagHeight, 'F')
        doc.setTextColor(85, 85, 85)
        doc.setFontSize(8)
        doc.text(tag, tagX + tagWidth / 2, y + tagHeight / 2 + 1, { align: 'center' })
        tagX += tagWidth + 5
      })
    }

    // 添加页脚（二维码）
    addFooter(doc, slug, article.category?.name || 'General', pageWidth, margin)

    // 返回PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
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
function addContentToPDF(
  doc: jsPDF,
  html: string,
  startY: number,
  margin: number,
  contentWidth: number,
  lineHeight: number
) {
  const lines = html.split('\n')
  let y = startY

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 51, 51)

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) {
      y += lineHeight / 2
      continue
    }

    // 检查是否需要新页面
    if (y > 250) {
      doc.addPage()
      y = margin
    }

    // 处理标题
    if (trimmedLine.startsWith('<h1>')) {
      const text = trimmedLine.replace(/<\/?h1>/g, '').trim()
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 26, 26)
      const h1Lines = doc.splitTextToSize(text, contentWidth)
      h1Lines.forEach((h1Line: string) => {
        doc.text(h1Line, margin, y)
        y += lineHeight * 2
      })
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 51, 51)
      y += lineHeight
    } else if (trimmedLine.startsWith('<h2>')) {
      const text = trimmedLine.replace(/<\/?h2>/g, '').trim()
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 26, 26)
      const h2Lines = doc.splitTextToSize(text, contentWidth)
      h2Lines.forEach((h2Line: string) => {
        doc.text(h2Line, margin, y)
        y += lineHeight * 1.5
      })
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 51, 51)
      y += lineHeight
    } else if (trimmedLine.startsWith('<h3>')) {
      const text = trimmedLine.replace(/<\/?h3>/g, '').trim()
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 26, 26)
      const h3Lines = doc.splitTextToSize(text, contentWidth)
      h3Lines.forEach((h3Line: string) => {
        doc.text(h3Line, margin, y)
        y += lineHeight * 1.5
      })
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 51, 51)
      y += lineHeight
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
        const pLines = doc.splitTextToSize(text, contentWidth)
        pLines.forEach((pLine: string) => {
          if (y > 270) {
            doc.addPage()
            y = margin
          }
          doc.text(pLine, margin, y)
          y += lineHeight
        })
        y += lineHeight / 2
      }
    }
    // 处理列表
    else if (trimmedLine.startsWith('<li>')) {
      const text = trimmedLine
        .replace(/<\/?li>/g, '')
        .replace(/<strong>(.*?)<\/strong>/g, '$1')
        .replace(/<em>(.*?)<\/em>/g, '$1')
        .replace(/<code>(.*?)<\/code>/g, '$1')
        .replace(/&nbsp;/g, ' ')
        .trim()

      if (text) {
        doc.text(`• ${text}`, margin + 5, y)
        y += lineHeight
      }
    }
    // 处理引用
    else if (trimmedLine.startsWith('<blockquote>')) {
      const text = trimmedLine.replace(/<\/?blockquote>/g, '').trim()
      doc.setFillColor(249, 249, 249)
      doc.rect(margin + 5, y, contentWidth - 10, 15, 'F')
      doc.setTextColor(51, 51, 51)
      const quoteLines = doc.splitTextToSize(`"${text}"`, contentWidth - 20)
      quoteLines.forEach((quoteLine: string, index: number) => {
        doc.text(quoteLine, margin + 10, y + 5 + index * lineHeight)
      })
      y += 20
    }
  }
}

// 添加页脚
function addFooter(doc: jsPDF, slug: string, categoryName: string, pageWidth: number, margin: number) {
  const footerY = 280

  // 添加分隔线
  doc.setDrawColor(221, 221, 221)
  doc.line(margin, footerY, pageWidth - margin, footerY)

  // 添加提示文字
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(102, 102, 102)
  doc.text('Scan QR code to view this article online', margin, footerY + 5, { align: 'center', maxWidth: pageWidth - margin * 2 })

  // 添加URL
  const url = `https://besttimeguide.com/${slug}`
  doc.text(url, margin, footerY + 10, { align: 'center', maxWidth: pageWidth - margin * 2 })

  // 添加生成信息
  doc.text('Generated from besttimeguide.com', margin, footerY + 15, { align: 'center', maxWidth: pageWidth - margin * 2 })

  // 添加分类
  doc.text(`Category: ${categoryName}`, margin, footerY + 20, { align: 'center', maxWidth: pageWidth - margin * 2 })
}
