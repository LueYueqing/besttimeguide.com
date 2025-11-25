'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { getAllTemplates, combineQRWithFrame, getTemplateById, type QRFrameTemplate } from '@/lib/qr-frames'

// QR码类型定义
export type QRType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'phone' | 'whatsapp' | 'location' | 'event'

// 基础配置接口
export interface QRConfig {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  type: 'image/png' | 'image/jpeg'
  quality: number
  margin: number
  color: {
    dark: string
    light: string
  }
  width: number
  qrStyle?: 'square' | 'rounded' | 'dots' | 'extra-rounded'
  logo: {
    enabled: boolean
    url: string
    size: number // Logo尺寸百分比 (10-30%)
    shape: 'square' | 'circle' | 'rounded'
    backgroundColor: string
    padding: number // Logo周围的内边距
  }
}

// 基础属性接口
export interface QRGeneratorBaseProps {
  type: QRType
  title: string
  description: string
  placeholder: string
  children: React.ReactNode // 自定义表单字段
  onDataChange: (data: string) => void
  generateQRData: (formData: any) => string
  previewFooter?: React.ReactNode // 预览区域底部内容（显示在Download Options下方）
}


export default function QRGeneratorBase({
  type,
  title,
  description,
  placeholder,
  children,
  onDataChange,
  generateQRData,
  previewFooter
}: QRGeneratorBaseProps) {
  const { user } = useUser()
  const router = useRouter()
  const [qrData, setQRData] = useState('')
  const [qrCodeUrl, setQRCodeUrl] = useState('')
  const [qrCodeSvg, setQRCodeSvg] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  
  // 检查用户计划，确定可下载的格式
  const userPlan = user?.plan?.toLowerCase() || user?.subscription?.plan?.toLowerCase() || 'free'
  const isFree = userPlan === 'free'
  const hasProTrial = user?.proTrialExpiresAt && new Date(user.proTrialExpiresAt) > new Date()
  const isDevUser = typeof window !== 'undefined' && user?.email === 'dev@customqr.pro'
  
  // 免费用户只能下载 PNG，Pro/Enterprise 用户可以下载所有格式
  const canDownloadSVG = !isFree || hasProTrial || isDevUser
  const canDownloadJPG = !isFree || hasProTrial || isDevUser
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [templates, setTemplates] = useState<QRFrameTemplate[]>([])
  const [templatePreviews, setTemplatePreviews] = useState<Map<string, string>>(new Map())
  const svgContentRef = useRef<string | null>(null) // 存储原始SVG内容用于下载
  const [config, setConfig] = useState<QRConfig>({
    errorCorrectionLevel: 'M', // 平衡的错误纠正级别，适合大多数情况
    type: 'image/png',
    quality: 0.92,
    margin: 2, // 适中的边距，确保扫描效果
    color: {
      dark: '#000000', // 经典黑色，扫描效果最佳
      light: '#ffffff'
    },
    width: 800, // 高质量尺寸，适合所有用途
    qrStyle: 'square', // 默认方形样式
    logo: {
      enabled: false,
      url: '',
      size: 20, // 默认20%尺寸
      shape: 'square',
      backgroundColor: '#FFFFFF',
      padding: 4
    }
  })
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 加载模板列表和生成预览
  useEffect(() => {
    const loadedTemplates = getAllTemplates()
    setTemplates(loadedTemplates)
    
    // 为每个模板生成预览图（使用静态占位二维码）
    const generatePreviews = async () => {
      const previews = new Map<string, string>()
      
      // 加载静态占位二维码
      let placeholderQR: string | null = null
      try {
        const response = await fetch('/qr-frames/placeholder-qr.svg')
        if (response.ok) {
          placeholderQR = await response.text()
        }
      } catch (error) {
        console.error('Failed to load placeholder QR code:', error)
      }
      
      if (!placeholderQR) {
        console.warn('Placeholder QR code not found, skipping preview generation')
        return
      }
      
      // 为每个模板生成预览
      for (const template of loadedTemplates) {
        try {
          const { combineQRWithFrame } = await import('@/lib/qr-frames')
          const combinedSVG = await combineQRWithFrame(placeholderQR, template.id)
          if (combinedSVG) {
            const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml;charset=utf-8' })
            const blobUrl = URL.createObjectURL(svgBlob)
            previews.set(template.id, blobUrl)
          }
        } catch (error) {
          console.error(`Error generating preview for ${template.id}:`, error)
        }
      }
      setTemplatePreviews(previews)
    }
    
    generatePreviews()
    
    // 清理函数：释放 blob URLs
    return () => {
      templatePreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  // 生成QR码
  const generateQR = async (data: string) => {
    if (!data.trim()) return
    
    setIsGenerating(true)
    try {
      // 统一使用SVG生成，确保预览一致
      await generateQRWithUpdatedConfig(data, config)
    } catch (error) {
      console.error('QR code generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 生成带Frame的QR码
  const generateQRWithFrame = async (data: string) => {
    await generateQRWithUpdatedConfig(data, config)
  }

  // 处理表单数据变化
  const handleFormChange = (formData: any) => {
    const data = generateQRData(formData)
    setQRData(data)
    onDataChange(data)
    if (data) {
      generateQR(data)
    }
  }

  // 当frame选择变化时，重新生成QR码
  useEffect(() => {
    if (qrData) {
      generateQR(qrData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFrame])

  // 处理配置变化时重新生成QR码
  const handleConfigChange = (newConfig: Partial<QRConfig>) => {
    setConfig(prev => {
      const updatedConfig = { ...prev, ...newConfig }
      // 异步重新生成QR码
      if (qrData) {
        setTimeout(() => {
          generateQRWithUpdatedConfig(qrData, updatedConfig)
        }, 0)
      }
      return updatedConfig
    })
  }

  // 使用指定配置生成QR码
  const generateQRWithUpdatedConfig = async (data: string, configToUse: QRConfig) => {
    if (!data.trim()) return
    
    setIsGenerating(true)
    try {
      // 直接使用SVG生成，无需转换为Canvas
      let svgString = await generateSVGQR(data, configToUse)
      console.log('SVG String length:', svgString ? svgString.length : 0)
      
      // 如果选择了frame，应用frame
      if (svgString && selectedFrame) {
        try {
          const { combineQRWithFrame, getTemplateById } = await import('@/lib/qr-frames')
          const template = getTemplateById(selectedFrame)
          if (template) {
            // 获取模板配置以确定二维码尺寸
            const qrSize = template.qrSize || 600
            // 重新生成指定尺寸的二维码
            const qrCodeSVG = await QRCode.toString(data, {
              type: 'svg',
              width: qrSize,
              margin: 1,
              color: {
                dark: configToUse.color.dark,
                light: configToUse.color.light
              }
            })
            // 应用frame
            const combinedSVG = await combineQRWithFrame(qrCodeSVG, selectedFrame)
            if (combinedSVG) {
              svgString = combinedSVG
            }
          }
        } catch (error) {
          console.error('Error applying frame:', error)
        }
      }
      
      if (svgString) {
        // 保存SVG字符串用于直接渲染和下载
        setQRCodeSvg(svgString)
        svgContentRef.current = svgString // 保存用于下载
        // 同时保存DataURL用于下载
        const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`
        setQRCodeUrl(svgDataUrl)
        console.log('Both SVG and DataURL set')
      } else {
        console.error('SVG generation failed')
        svgContentRef.current = null
      }
    } catch (error) {
      console.error('QR code generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }



  // 生成SVG格式的QR码
  const generateSVGQR = async (data: string, configToUse: QRConfig) => {
    try {
      // 直接使用QRCode生成SVG
      const qrSize = configToUse.width
      const svgString = await QRCode.toString(data, {
        type: 'svg',
        width: qrSize,
        margin: configToUse.margin,
        color: {
          dark: configToUse.color.dark,
          light: configToUse.color.light
        }
      })
      
      return svgString
      
    } catch (error) {
      console.error('SVG generation failed:', error)
      return ''
    }
  }




  // 下载QR码
  const downloadQR = async (format: 'png' | 'jpg' | 'svg' = 'png') => {
    if (!qrData.trim()) return
    
    // 检查下载格式权限
    if (format === 'svg' && !canDownloadSVG) {
      // 免费用户尝试下载 SVG，重定向到定价页面
      if (confirm('SVG format is available for Pro and Enterprise plans. Would you like to upgrade?')) {
        router.push('/pricing?feature=download')
      }
      return
    }
    
    if (format === 'jpg' && !canDownloadJPG) {
      // 免费用户尝试下载 JPG，重定向到定价页面
      if (confirm('JPG format is available for Pro and Enterprise plans. Would you like to upgrade?')) {
        router.push('/pricing?feature=download')
      }
      return
    }
    
    const link = document.createElement('a')
    
    // 使用保存的SVG内容（如果存在，包含frame），否则重新生成
    const svgString = svgContentRef.current || await generateSVGQR(qrData, config)
    
    if (format === 'svg') {
      // SVG下载：直接使用当前SVG
      if (svgString) {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        link.href = url
        link.download = `${type}-qr-code.svg`
        link.click()
        URL.revokeObjectURL(url)
      }
    } else {
      // PNG/JPG下载：将SVG转换为Canvas
      if (svgString) {
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(svgBlob)
        
        const img = new window.Image()
        img.onload = () => {
          // 创建临时canvas
          const tempCanvas = document.createElement('canvas')
          const ctx = tempCanvas.getContext('2d')
          
          if (ctx) {
            // 从SVG中获取实际尺寸（支持带frame的SVG）
            let totalWidth = config.width
            let totalHeight = config.width
            
            // 尝试从SVG字符串中解析viewBox
            if (svgString) {
              const viewBoxMatch = svgString.match(/viewBox="[\d\s.]+"/)
              if (viewBoxMatch) {
                const viewBox = viewBoxMatch[0].match(/[\d.]+/g)
                if (viewBox && viewBox.length >= 4) {
                  totalWidth = parseFloat(viewBox[2]) || config.width
                  totalHeight = parseFloat(viewBox[3]) || config.width
                }
              } else {
                // 尝试从width和height属性获取
                const widthMatch = svgString.match(/width="([\d.]+)"/)
                const heightMatch = svgString.match(/height="([\d.]+)"/)
                if (widthMatch) totalWidth = parseFloat(widthMatch[1]) || config.width
                if (heightMatch) totalHeight = parseFloat(heightMatch[1]) || config.width
              }
            }
            
            tempCanvas.width = totalWidth
            tempCanvas.height = totalHeight
            
            // 绘制SVG到canvas
            ctx.drawImage(img, 0, 0, totalWidth, totalHeight)
            
            // 生成下载链接
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
            const quality = format === 'jpg' ? 0.9 : 1.0
            const dataUrl = tempCanvas.toDataURL(mimeType, quality)
            
            link.href = dataUrl
            link.download = `${type}-qr-code.${format}`
            link.click()
          }
          
          URL.revokeObjectURL(svgUrl)
        }
        img.src = svgUrl
      }
    }
  }

  // QR码类型配置
  const qrTypes = [
    { type: 'url', icon: '🔗', label: 'URL', path: '/url-qr-code-generator', available: true },
    { type: 'text', icon: '📝', label: 'Text', path: '/text-qr-code-generator', available: true },
    { type: 'wifi', icon: '📶', label: 'WiFi', path: '/wifi-qr-code-generator', available: true },
    { type: 'vcard', icon: '👤', label: 'Business Card', path: '/business-card-qr-code-generator', available: true },
    { type: 'email', icon: '📧', label: 'Email', path: '/email-qr-code-generator', available: true },
    { type: 'sms', icon: '💬', label: 'SMS', path: '/sms-qr-code-generator', available: true },
    { type: 'phone', icon: '📞', label: 'Phone', path: '/phone-number-qr-code-generator', available: true },
    { type: 'whatsapp', icon: '💚', label: 'WhatsApp', path: '/whatsapp-qr-code-generator', available: true },
    { type: 'location', icon: '📍', label: 'Location', path: '/location-qr-code-generator', available: true },
    { type: 'event', icon: '📅', label: 'Event', path: '/event-qr-code-generator', available: true },
  ]

  return (
    <div className="pt-20 pb-8 lg:pt-24 lg:pb-12 bg-white">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          
          {/* 页面标题 */}
          <div className="text-center mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {title}
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* QR码类型导航 */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-base font-semibold text-neutral-700 mb-1">
                Choose QR Code Type
              </h2>
              <p className="text-sm text-neutral-500">
                Switch between different QR code generators
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {qrTypes.map((qrType) => (
                qrType.available ? (
                  <Link
                    key={qrType.type}
                    href={qrType.path}
                    className={`
                      inline-flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200
                      ${type === qrType.type 
                        ? 'bg-primary-500 text-white border-primary-500 shadow-md' 
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
                      }
                    `}
                  >
                    <span className="text-lg">{qrType.icon}</span>
                    <span className="font-medium">{qrType.label}</span>
                  </Link>
                ) : (
                  <div
                    key={qrType.type}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed"
                    title="Coming Soon"
                  >
                    <span className="text-lg opacity-50">{qrType.icon}</span>
                    <span className="font-medium">
                      {qrType.label}
                      <span className="text-xs ml-1">(Soon)</span>
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* 左侧：表单区域 */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Enter Your Information */}
              <div className="card p-8">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 mb-6">
                  <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    1
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Enter Your Information
                  </h2>
                </div>
                
                {/* 自定义表单字段 */}
                <div className="space-y-6">
                  {React.cloneElement(children as React.ReactElement, {
                    onChange: handleFormChange,
                    placeholder
                  })}
                </div>
              </div>

              {/* Step 2: Design your QR Code */}
              <div className="card p-8">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 mb-6">
                  <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">Design your QR Code</h3>
                </div>
                
                <div className="space-y-6">
                  {/* QR Code Frame Selection */}
                  <div>
                    <h4 className="text-base font-semibold text-neutral-800 mb-4">QR Code Frame (optional)</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="enableFrame"
                          checked={selectedFrame !== null}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              setSelectedFrame(null)
                            } else if (templates.length > 0) {
                              setSelectedFrame(templates[0].id)
                            }
                          }}
                          className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="enableFrame" className="text-sm text-neutral-700">
                          Add decorative frame to QR code
                        </label>
                      </div>
                      
                      {selectedFrame !== null && templates.length > 0 && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-neutral-600 mb-2">
                            Select Frame Style
                          </label>
                          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-1">
                            {templates.map((template) => {
                              const previewUrl = templatePreviews.get(template.id)
                              return (
                                <button
                                  key={template.id}
                                  type="button"
                                  onClick={() => setSelectedFrame(template.id)}
                                  className={`relative rounded border overflow-hidden transition-all ${
                                    selectedFrame === template.id
                                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                                      : 'border-neutral-200 hover:border-neutral-300'
                                  }`}
                                >
                                  {/* 预览图 */}
                                  <div className="aspect-square bg-neutral-50 flex items-center justify-center">
                                    {previewUrl ? (
                                      <img 
                                        src={previewUrl} 
                                        alt={template.name}
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <div className="text-[7px] text-neutral-400">Loading...</div>
                                    )}
                                  </div>
                                  
                                  {/* 选中标记 */}
                                  {selectedFrame === template.id && (
                                    <div className="absolute top-0.5 right-0.5 bg-blue-500 rounded-full p-0.5">
                                      <svg className="h-1 w-1 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shape & Color Section */}
                  <div>
                    <h4 className="text-base font-semibold text-neutral-800 mb-4">Shape & Color</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Foreground Color */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Shape color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={config.color.dark}
                            onChange={(e) => handleConfigChange({
                              color: { ...config.color, dark: e.target.value }
                            })}
                            className="w-12 h-12 rounded-lg border border-neutral-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.color.dark}
                            onChange={(e) => handleConfigChange({
                              color: { ...config.color, dark: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      
                      {/* Background Color */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Background color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={config.color.light}
                            onChange={(e) => handleConfigChange({
                              color: { ...config.color, light: e.target.value }
                            })}
                            className="w-12 h-12 rounded-lg border border-neutral-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.color.light}
                            onChange={(e) => handleConfigChange({
                              color: { ...config.color, light: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono"
                            placeholder="#FFFFFF"
                          />
                        </div>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={config.color.light === 'transparent'}
                            onChange={(e) => handleConfigChange({
                              color: { ...config.color, light: e.target.checked ? 'transparent' : '#FFFFFF' }
                            })}
                            className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-neutral-600">Transparent background</span>
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 右侧：预览和下载区域 */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* QR码预览 */}
              <div className="card p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    QR Code Preview
                  </h3>
                </div>
                
                {qrCodeUrl ? (
                  <div className="space-y-6">
                    <div className="inline-block p-4 bg-white rounded-2xl shadow-soft">
                      <div className="mx-auto w-full max-w-[280px]">
                        <img 
                          src={qrCodeUrl} 
                          alt="Generated QR Code"
                          className="w-full h-auto mx-auto"
                        />
                      </div>
                    </div>
                    
                    
                    {/* 下载选项 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-neutral-900">Download Options</h4>
                      
                      {/* Download Dropdown */}
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                          className="btn btn-primary w-full flex items-center justify-center gap-2"
                          disabled={isGenerating}
                        >
                          <span>📥</span>
                          Download QR Code
                          <span className={`transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        
                        {/* Dropdown Menu */}
                        {showDownloadMenu && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                downloadQR('png')
                                setShowDownloadMenu(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center gap-3 border-b border-neutral-100 last:border-b-0"
                              disabled={isGenerating}
                            >
                              <span>📥</span>
                              <div className="flex-1">
                                <div className="font-medium text-neutral-900">PNG</div>
                                <div className="text-xs text-neutral-500">Recommended, supports transparency</div>
                              </div>
                            </button>
                            {canDownloadJPG ? (
                              <button
                                onClick={() => {
                                  downloadQR('jpg')
                                  setShowDownloadMenu(false)
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center gap-3 border-b border-neutral-100 last:border-b-0"
                                disabled={isGenerating}
                              >
                                <span>📥</span>
                                <div className="flex-1">
                                  <div className="font-medium text-neutral-900">JPG</div>
                                  <div className="text-xs text-neutral-500">Smaller file size</div>
                                </div>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (confirm('JPG format is available for Pro and Enterprise plans. Would you like to upgrade?')) {
                                    router.push('/pricing?feature=download')
                                  }
                                  setShowDownloadMenu(false)
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center gap-3 border-b border-neutral-100 last:border-b-0 opacity-60"
                                disabled={isGenerating}
                              >
                                <span>🔒</span>
                                <div className="flex-1">
                                  <div className="font-medium text-neutral-900 flex items-center gap-2">
                                    JPG
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">PRO</span>
                                  </div>
                                  <div className="text-xs text-neutral-500">Upgrade to unlock</div>
                                </div>
                              </button>
                            )}
                            {canDownloadSVG ? (
                              <button
                                onClick={() => {
                                  downloadQR('svg')
                                  setShowDownloadMenu(false)
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center gap-3 border-b border-neutral-100 last:border-b-0"
                                disabled={isGenerating}
                              >
                                <span>📥</span>
                                <div className="flex-1">
                                  <div className="font-medium text-neutral-900">SVG</div>
                                  <div className="text-xs text-neutral-500">Vector format, infinite scaling</div>
                                </div>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (confirm('SVG format is available for Pro and Enterprise plans. Would you like to upgrade?')) {
                                    router.push('/pricing?feature=download')
                                  }
                                  setShowDownloadMenu(false)
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center gap-3 border-b border-neutral-100 last:border-b-0 opacity-60"
                                disabled={isGenerating}
                              >
                                <span>🔒</span>
                                <div className="flex-1">
                                  <div className="font-medium text-neutral-900 flex items-center gap-2">
                                    SVG
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">PRO</span>
                                  </div>
                                  <div className="text-xs text-neutral-500">Upgrade to unlock</div>
                                </div>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* 预览区域底部内容 */}
                      {previewFooter && (
                        <div className="mt-6">
                          {previewFooter}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-16">
                    <div className="w-32 h-32 bg-neutral-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl text-neutral-400">📱</span>
                    </div>
                    <p className="text-neutral-500">
                      Fill in the form to generate your QR code
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
