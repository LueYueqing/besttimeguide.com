'use client'

import { useState } from 'react'

interface DownloadPDFButtonProps {
  slug: string
  title: string
}

export default function DownloadPDFButton({ slug, title }: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = () => {
    setLoading(true)
    // 在新窗口中打开 PDF 生成页面
    const pdfUrl = `/api/articles/${slug}/pdf`
    const newWindow = window.open(pdfUrl, '_blank')
    
    // 监听新窗口关闭
    if (newWindow) {
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed)
          setLoading(false)
        }
      }, 500)
      
      // 设置超时，5秒后重置loading状态
      setTimeout(() => {
        setLoading(false)
        clearInterval(checkClosed)
      }, 5000)
    } else {
      setLoading(false)
      alert('Failed to open PDF generation window. Please check your popup blocker settings.')
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
