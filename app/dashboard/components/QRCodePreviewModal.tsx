'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { combineQRWithFrame, getTemplateById } from '@/lib/qr-frames'

interface QRCodePreviewModalProps {
  qrCode: {
    id: number
    title?: string | null
    shortCode?: string | null
    targetUrl?: string | null
    content?: any
    isDynamic: boolean
    type: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export default function QRCodePreviewModal({ qrCode, isOpen, onClose }: QRCodePreviewModalProps) {
  const router = useRouter()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const svgContentRef = useRef<string | null>(null) // 存储原始SVG内容用于下载
  const blobUrlRef = useRef<string | null>(null) // 跟踪当前的blob URL用于清理

  // 获取二维码内容
  const getQRContent = () => {
    if (!qrCode) return ''
    
    if (qrCode.isDynamic && qrCode.shortCode) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://customqr.pro'
      return `${baseUrl}/r/${qrCode.shortCode}`
    }
    
    // 静态二维码
    if (qrCode.content) {
      if (qrCode.type === 'URL') {
        return qrCode.content.url || qrCode.content.text || ''
      }
      if (qrCode.type === 'TEXT') {
        return qrCode.content.text || ''
      }
      if (qrCode.type === 'WIFI') {
        return `WIFI:T:${qrCode.content.security || 'WPA'};S:${qrCode.content.ssid || ''};P:${qrCode.content.password || ''};;`
      }
      if (qrCode.type === 'EMAIL') {
        return `mailto:${qrCode.content.email || ''}${qrCode.content.subject ? `?subject=${encodeURIComponent(qrCode.content.subject)}` : ''}${qrCode.content.body ? `&body=${encodeURIComponent(qrCode.content.body)}` : ''}`
      }
      if (qrCode.type === 'PHONE') {
        return `tel:${qrCode.content.phone || ''}`
      }
      if (qrCode.type === 'SMS') {
        return `sms:${qrCode.content.phone || ''}${qrCode.content.message ? `?body=${encodeURIComponent(qrCode.content.message)}` : ''}`
      }
    }
    
    return ''
  }

  // 生成二维码（支持框架）
  useEffect(() => {
    if (!isOpen || !qrCode) {
      // 清理之前的blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
      setQrDataUrl(null)
      setQrSvg(null)
      svgContentRef.current = null
      return
    }

    const content = getQRContent()
    if (!content) return

    const generateQR = async () => {
      try {
        // 获取框架ID
        const frameTemplateId = qrCode.content?.frameTemplateId || null

        // 确定二维码尺寸（预览时使用更大的尺寸以获得更好的清晰度）
        let qrSize = 600 // 提高默认尺寸从400到600
        if (frameTemplateId) {
          try {
            const template = getTemplateById(frameTemplateId)
            if (template) {
              if (template.qrSize) {
                qrSize = Math.max(template.qrSize, 600) // 确保至少600px
              } else {
                const placeholderSize = Math.min(template.placeholder.width, template.placeholder.height)
                qrSize = Math.max(600, Math.min(1000, Math.floor(placeholderSize * 1.5))) // 提高最小值和最大值
              }
            }
          } catch (error) {
            console.error('Error getting template:', error)
          }
        }

        // 生成二维码SVG
        const qrCodeSVG = await QRCode.toString(content, {
          type: 'svg',
          width: qrSize,
          margin: frameTemplateId ? 1 : 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })

        // 如果选择了框架，组合框架和二维码
        let finalSVG = qrCodeSVG
        if (frameTemplateId) {
          try {
            finalSVG = await combineQRWithFrame(qrCodeSVG, frameTemplateId)
          } catch (error) {
            console.error('Error combining frame:', error)
            // 如果框架组合失败，使用普通二维码
          }
        }

        svgContentRef.current = finalSVG

        // 清理之前的blob URL
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
        }
        
        // 优先使用SVG显示（矢量图，不会模糊）
        const svgBlob = new Blob([finalSVG], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(svgBlob)
        blobUrlRef.current = svgUrl
        
        // 直接使用SVG URL显示（矢量图，清晰度不受缩放影响）
        setQrDataUrl(svgUrl)
        setQrSvg(finalSVG)
        
        // 同时生成PNG版本用于下载（如果需要）
        // 注意：预览使用SVG，下载时再生成PNG
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQR()
    
    // 清理函数：组件卸载时释放blob URL
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [isOpen, qrCode])

  // 下载 PNG
  const handleDownloadPNG = async () => {
    if (!svgContentRef.current || !qrCode) return
    
    setDownloading('png')
    try {
      // 将SVG转换为Canvas再下载PNG
      const svgBlob = new Blob([svgContentRef.current], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      const img = new window.Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = svgUrl
      })
      
      // 解析SVG获取尺寸
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgContentRef.current, 'image/svg+xml')
      const svgElement = svgDoc.querySelector('svg')
      
      let svgWidth = 1000
      let svgHeight = 1300
      
      if (svgElement) {
        const viewBox = svgElement.getAttribute('viewBox')
        if (viewBox) {
          const values = viewBox.split(' ')
          if (values.length === 4) {
            svgWidth = parseFloat(values[2])
            svgHeight = parseFloat(values[3])
          }
        } else {
          const width = svgElement.getAttribute('width')
          const height = svgElement.getAttribute('height')
          if (width) svgWidth = parseFloat(width)
          if (height) svgHeight = parseFloat(height)
        }
      }
      
      // 创建Canvas（2倍分辨率以获得更好的质量）
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = svgWidth * scale
      canvas.height = svgHeight * scale
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        URL.revokeObjectURL(svgUrl)
        return
      }
      
      // 绘制白色背景
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制SVG图像
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // 转换为PNG并下载
      canvas.toBlob((blob) => {
        if (!blob) return
        
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${qrCode.shortCode || qrCode.id || 'qrcode'}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL
        URL.revokeObjectURL(svgUrl)
        URL.revokeObjectURL(downloadUrl)
      }, 'image/png')
    } catch (error) {
      console.error('Error downloading PNG:', error)
    } finally {
      setDownloading(null)
    }
  }

  // 下载 SVG
  const handleDownloadSVG = () => {
    if (!svgContentRef.current || !qrCode) return
    
    setDownloading('svg')
    try {
      const blob = new Blob([svgContentRef.current], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${qrCode.shortCode || qrCode.id || 'qrcode'}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading SVG:', error)
    } finally {
      setDownloading(null)
    }
  }

  // 下载 PDF（可选功能，需要安装 jspdf）
  const handleDownloadPDF = async () => {
    if (!svgContentRef.current || !qrCode) return
    
    setDownloading('pdf')
    try {
      // 尝试动态导入 jsPDF（如果已安装）
      const jsPDFModule = await import('jspdf').catch(() => null)
      if (!jsPDFModule) {
        alert('PDF download is not available. Please install jspdf package or use PNG/SVG instead.')
        setDownloading(null)
        return
      }
      
      // 将SVG转换为Canvas再转换为PNG
      const svgBlob = new Blob([svgContentRef.current], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      const img = new window.Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = svgUrl
      })
      
      // 解析SVG获取尺寸
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgContentRef.current, 'image/svg+xml')
      const svgElement = svgDoc.querySelector('svg')
      
      let svgWidth = 1000
      let svgHeight = 1300
      
      if (svgElement) {
        const viewBox = svgElement.getAttribute('viewBox')
        if (viewBox) {
          const values = viewBox.split(' ')
          if (values.length === 4) {
            svgWidth = parseFloat(values[2])
            svgHeight = parseFloat(values[3])
          }
        } else {
          const width = svgElement.getAttribute('width')
          const height = svgElement.getAttribute('height')
          if (width) svgWidth = parseFloat(width)
          if (height) svgHeight = parseFloat(height)
        }
      }
      
      // 创建Canvas并转换为PNG
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = svgWidth * scale
      canvas.height = svgHeight * scale
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        URL.revokeObjectURL(svgUrl)
        setDownloading(null)
        return
      }
      
      // 绘制白色背景
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制SVG图像
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // 转换为PNG DataURL
      const pngDataUrl = canvas.toDataURL('image/png')
      
      // 创建PDF（根据SVG尺寸计算PDF尺寸，保持比例）
      const { default: jsPDF } = jsPDFModule
      const pdfWidth = 100 // mm
      const pdfHeight = (svgHeight / svgWidth) * pdfWidth // 保持宽高比
      
      const doc = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      })
      
      // 将PNG添加到PDF（填满整个页面）
      doc.addImage(pngDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      doc.save(`${qrCode.shortCode || qrCode.id || 'qrcode'}.pdf`)
      
      // 清理URL
      URL.revokeObjectURL(svgUrl)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please use PNG or SVG instead.')
    } finally {
      setDownloading(null)
    }
  }

  // 复制链接
  const handleCopyLink = async () => {
    if (!qrCode) return
    
    const content = getQRContent()
    try {
      await navigator.clipboard.writeText(content)
      // 可以添加一个临时的成功提示
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  if (!isOpen || !qrCode) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 左右布局：左侧二维码，右侧信息 */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* 左侧：二维码预览 */}
            <div className="flex-shrink-0 flex items-center justify-center md:w-1/2">
              {qrDataUrl ? (
                <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white w-full">
                  <img 
                    src={qrDataUrl} 
                    alt="QR Code" 
                    style={{ 
                      display: 'block',
                      maxWidth: '100%',
                      height: 'auto',
                      width: '100%',
                      maxHeight: '600px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ) : (
                <div className="w-full border border-neutral-200 rounded-lg flex items-center justify-center bg-neutral-50" style={{ aspectRatio: '1', minHeight: '300px' }}>
                  <div className="animate-pulse text-neutral-400">Generating...</div>
                </div>
              )}
            </div>

            {/* 右侧：标题、内容和操作按钮 */}
            <div className="flex-1 flex flex-col md:w-1/2">
              {/* 标题 */}
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 pr-8">
                {qrCode.title || 'QR Code Preview'}
              </h2>
              
              {/* 链接信息 */}
              <div className="mb-6">
                <p className="text-sm text-neutral-600 mb-2 font-medium">QR Code Content:</p>
                <p className="text-xs text-neutral-500 break-all font-mono bg-neutral-50 p-3 rounded border border-neutral-200">
                  {getQRContent()}
                </p>
              </div>

              {/* 下载按钮组 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={handleDownloadPNG}
                  disabled={!qrDataUrl || downloading !== null}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === 'png' ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      PNG
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadSVG}
                  disabled={!qrSvg || downloading !== null}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === 'svg' ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      SVG
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={!qrDataUrl || downloading !== null}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === 'pdf' ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      PDF
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>

              {/* 编辑按钮 */}
              <button
                onClick={() => {
                  onClose()
                  router.push(`/dashboard/qrcodes/${qrCode.id}`)
                }}
                className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Edit QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

