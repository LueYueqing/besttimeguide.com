'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface DownloadPDFButtonProps {
  slug: string
  title: string
}

export default function DownloadPDFButton({ slug, title }: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      // 获取文章数据
      const response = await fetch(`/api/articles/${slug}/pdf`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch article')
      }

      const article = data.article

      // 创建一个隐藏的容器来渲染PDF内容
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '800px'
      container.style.background = '#fff'
      container.style.padding = '40px 20px'
      document.body.appendChild(container)

      // 格式化日期
      const formatDate = (date: string | null) => {
        if (!date) return 'Date not available'
        const d = new Date(date)
        if (isNaN(d.getTime())) return 'Date not available'
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      }

      // 渲染内容到容器
      container.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #666;">
            <h1 style="font-size: 28px; font-weight: bold; color: #1a1a1a; margin-bottom: 10px; line-height: 1.3;">${article.title}</h1>
            <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
              By ${article.author} • ${article.readingTime} min read • ${formatDate(article.publishedAt)}
            </div>
          </div>
          
          ${article.description ? `<div style="background: #f0f7ff; padding: 15px; border-left: 4px solid #0066cc; margin-bottom: 30px; font-style: italic;">${article.description}</div>` : ''}
          
          <div id="pdf-content" style="font-size: 14px; line-height: 1.8;"></div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #666;">
            <p>Generated from besttimeguide.com</p>
            <p>Category: ${article.category}</p>
          </div>
        </div>
      `

      // 使用ReactMarkdown渲染markdown内容
      const contentDiv = container.querySelector('#pdf-content')
      if (contentDiv) {
        const { createRoot } = await import('react-dom/client')
        const root = createRoot(contentDiv)
        
        root.render(
          <div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '30px 0 15px 0', color: '#1a1a1a' }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '25px 0 12px 0', color: '#1a1a1a', borderTop: '1px solid #ddd', paddingTop: '15px' }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '20px 0 10px 0', color: '#1a1a1a' }}>{children}</h3>,
                p: ({ children }) => <p style={{ marginBottom: '15px', textAlign: 'justify' }}>{children}</p>,
                ul: ({ children }) => <ul style={{ marginBottom: '15px', paddingLeft: '30px' }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ marginBottom: '15px', paddingLeft: '30px' }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: '8px' }}>{children}</li>,
                blockquote: ({ children }) => <blockquote style={{ borderLeft: '4px solid #0066cc', padding: '10px 15px', margin: '20px 0', background: '#f9f9f9', fontStyle: 'italic' }}>{children}</blockquote>,
                strong: ({ children }) => <strong style={{ fontWeight: 'bold' }}>{children}</strong>,
                em: ({ children }) => <em>{children}</em>,
                code: ({ children }) => <code style={{ background: '#f4f4f4', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '0.9em' }}>{children}</code>,
                a: ({ href, children }) => <a href={href} style={{ color: '#0066cc', textDecoration: 'underline' }}>{children}</a>,
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        )

        // 等待React渲染完成
        await new Promise(resolve => setTimeout(resolve, 500))

        // 使用html2canvas转换为图片
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
        })

        // 清理React根
        root.unmount()

        // 生成PDF
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 10
        
        let heightLeft = imgHeight * ratio
        let position = imgY
        
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, heightLeft)
        heightLeft -= pdfHeight - 20
        
        while (heightLeft > 0) {
          position = heightLeft - imgHeight * ratio
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, heightLeft)
          heightLeft -= pdfHeight - 20
        }
        
        const fileName = `${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
        pdf.save(fileName)
      }

      // 清理容器
      document.body.removeChild(container)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 hover:border-primary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
      title="Download as PDF"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>{loading ? 'Preparing...' : 'Download PDF'}</span>
    </button>
  )
}
