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

    // 动态导入 PdfDocument 组件
    const { PdfDocument } = await import('@/components/PdfDocument')
    
    // 渲染 PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(PdfDocument, { article, qrCodeData }) as any
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
