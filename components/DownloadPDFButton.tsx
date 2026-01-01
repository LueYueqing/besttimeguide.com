'use client'

import { useState } from 'react'

interface DownloadPDFButtonProps {
  slug: string
  title: string
}

export default function DownloadPDFButton({ slug, title }: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      // 直接下载服务端生成的PDF
      const response = await fetch(`/api/articles/${slug}/pdf`)
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // 获取PDF文件
      const blob = await response.blob()
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // 生成文件名
      const fileName = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
      a.download = fileName
      
      // 触发下载
      document.body.appendChild(a)
      a.click()
      
      // 清理
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
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
