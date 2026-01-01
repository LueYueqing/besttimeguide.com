import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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

    // 生成 HTML 内容用于 PDF
    const htmlContent = generatePDFHTML(article)

    // 返回 HTML 和 PDF 生成脚本
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// 生成 PDF 所需的 HTML
function generatePDFHTML(article: any): string {
  const { title, description, content, category, author, publishedAt, readingTime } = article
  
  const formatDate = (date: string | null) => {
    if (!date) return 'Date not available'
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Date not available'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - PDF</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #666;
    }
    
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
      line-height: 1.3;
    }
    
    .meta {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .description {
      background: #f0f7ff;
      padding: 15px;
      border-left: 4px solid #0066cc;
      margin-bottom: 30px;
      font-style: italic;
    }
    
    .content {
      font-size: 14px;
      line-height: 1.8;
    }
    
    .content h1 {
      font-size: 24px;
      font-weight: bold;
      margin: 30px 0 15px 0;
      color: #1a1a1a;
    }
    
    .content h2 {
      font-size: 20px;
      font-weight: bold;
      margin: 25px 0 12px 0;
      color: #1a1a1a;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
    
    .content h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0 10px 0;
      color: #1a1a1a;
    }
    
    .content p {
      margin-bottom: 15px;
      text-align: justify;
    }
    
    .content ul, .content ol {
      margin-bottom: 15px;
      padding-left: 30px;
    }
    
    .content li {
      margin-bottom: 8px;
    }
    
    .content blockquote {
      border-left: 4px solid #0066cc;
      padding: 10px 15px;
      margin: 20px 0;
      background: #f9f9f9;
      font-style: italic;
    }
    
    .content img {
      max-width: 100%;
      height: auto;
      margin: 20px 0;
      border-radius: 8px;
    }
    
    .content strong {
      font-weight: bold;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
    
    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">${title}</h1>
    <div class="meta">
      By ${author?.name || 'Unknown'} • ${readingTime || 0} min read • ${formatDate(publishedAt)}
    </div>
  </div>
  
  ${description ? `<div class="description">${description}</div>` : ''}
  
  <div class="content">
    ${content}
  </div>
  
  <div class="footer">
    <p>Generated from besttimeguide.com</p>
    <p>Category: ${category?.name || 'General'}</p>
  </div>
  
  <script type="module">
    import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';
    import html2canvas from 'https://esm.sh/html2canvas@1.4.1';
    
    // 自动生成并下载 PDF
    async function generatePDF() {
      try {
        const element = document.body;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;
        
        let heightLeft = imgHeight * ratio;
        let position = imgY;
        
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, heightLeft);
        heightLeft -= pdfHeight - 20;
        
        while (heightLeft > 0) {
          position = heightLeft - imgHeight * ratio;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, heightLeft);
          heightLeft -= pdfHeight - 20;
        }
        
        const fileName = '${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf';
        pdf.save(fileName);
        
        // 下载完成后关闭窗口
        setTimeout(() => window.close(), 1000);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      }
    }
    
    // 页面加载后自动生成 PDF
    window.addEventListener('load', generatePDF);
  </script>
</body>
</html>`
}
