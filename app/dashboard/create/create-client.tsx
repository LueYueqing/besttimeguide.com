'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import Image from 'next/image'
import QRCode from 'qrcode'
import SidebarNavigation from '../components/SidebarNavigation'
import ScheduleConfigComponent, { ScheduleConfig } from '../../components/ScheduleConfig'
import { getAllTemplates, type QRFrameTemplate } from '@/lib/qr-frames'

interface CreateResponse {
  id: number
  title?: string | null
  targetUrl: string
  shortUrl: string
  shortCode: string
}

interface DashboardStats {
  total: number
  active: number
  paused: number
  archived: number
  dynamic: number
  totalScans: number
}

export default function CreateDynamicQRClient() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [status, setStatus] = useState<'all' | 'active' | 'paused' | 'archived'>('all')
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    paused: 0,
    archived: 0,
    dynamic: 0,
    totalScans: 0,
  })
  const [title, setTitle] = useState('Campaign Landing Page')
  const [targetUrl, setTargetUrl] = useState('https://customqr.pro')
  const [description, setDescription] = useState('')
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({})
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [templates, setTemplates] = useState<QRFrameTemplate[]>([])
  const [templatePreviews, setTemplatePreviews] = useState<Map<string, string>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateResponse | null>(null)
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const prevBlobUrlRef = useRef<string | null>(null)
  const svgContentRef = useRef<string | null>(null) // 存储原始SVG内容用于下载
  const [sidebarOpen, setSidebarOpen] = useState(false) // 移动端侧边栏状态

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/qrcodes?status=all&limit=1')
        const data = await response.json()
        if (data.success) {
          setStats(data.data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    if (user) {
      fetchStats()
    }
  }, [user])

  // 加载模板列表
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
      
      // 为所有模板生成预览图
      for (const template of loadedTemplates) {
        try {
          // 如果模板有框架，组合框架和占位二维码
          try {
            const { combineQRWithFrame } = await import('@/lib/qr-frames')
            const combinedSVG = await combineQRWithFrame(placeholderQR, template.id)
            // 转换为 data URL
            const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml' })
            const previewUrl = URL.createObjectURL(svgBlob)
            previews.set(template.id, previewUrl)
          } catch (error) {
            // 如果组合失败，使用纯占位二维码
            const svgBlob = new Blob([placeholderQR], { type: 'image/svg+xml' })
            const previewUrl = URL.createObjectURL(svgBlob)
            previews.set(template.id, previewUrl)
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

  // 初始预览（如果targetUrl有默认值）
  useEffect(() => {
    if (targetUrl && targetUrl.trim()) {
      // 延迟一下，确保组件完全加载
      const timer = setTimeout(() => {
        generatePreview(targetUrl, selectedFrame)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [])

  // 生成预览二维码
  const generatePreview = useCallback(async (url: string, frameId: string | null) => {
    if (!url || !url.trim()) {
      setQrPreview(null)
      setPreviewUrl('')
      return
    }

    try {
      // 验证URL格式
      try {
        new URL(url)
      } catch {
        // 如果不是有效URL，不生成预览
        setQrPreview(null)
        setPreviewUrl('')
        return
      }

      // 如果选择了框架，先获取模板配置以确定二维码尺寸
      let qrSize = 400 // 默认尺寸
      if (frameId) {
        try {
          const { getTemplateById } = await import('@/lib/qr-frames')
          const template = getTemplateById(frameId)
          if (template) {
            // 如果模板配置了自定义二维码尺寸，使用配置的值
            if (template.qrSize) {
              qrSize = template.qrSize
            } else {
              // 否则根据占位区域大小自动计算
              // 使用占位区域的最小边 × 1.2，确保生成高清晰度二维码（即使缩放后也清晰）
              const placeholderSize = Math.min(template.placeholder.width, template.placeholder.height)
              qrSize = Math.floor(placeholderSize * 1.2) // 生成比占位区域大20%的二维码，确保清晰度
            }
            // 确保最小尺寸
            if (qrSize < 200) qrSize = 200
            // 确保最大尺寸（避免过大）
            if (qrSize > 1000) qrSize = 1000
          }
        } catch (error) {
          console.error('Error getting template:', error)
        }
      }

      // 生成二维码SVG
      // 注意：margin会影响二维码的实际内容区域大小
      // 如果框架需要更大的二维码，可以减少margin或增加width
      const qrCodeSVG = await QRCode.toString(url, {
        type: 'svg',
        width: qrSize,
        margin: frameId ? 1 : 2, // 有框架时使用更小的margin以最大化二维码内容
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      // 如果选择了框架，组合框架和二维码
      if (frameId) {
        try {
          const { combineQRWithFrame } = await import('@/lib/qr-frames')
          const combinedSVG = await combineQRWithFrame(qrCodeSVG, frameId)
          // 将SVG转换为DataURL用于预览
          const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml' })
          const svgUrl = URL.createObjectURL(svgBlob)
          // 清理之前的URL
          if (prevBlobUrlRef.current) {
            URL.revokeObjectURL(prevBlobUrlRef.current)
          }
          prevBlobUrlRef.current = svgUrl
          svgContentRef.current = combinedSVG // 保存带框架的完整SVG内容
          setQrPreview(svgUrl)
          setPreviewUrl(url)
        } catch (error) {
          console.error('Error combining frame:', error)
          // 如果框架组合失败，使用普通二维码
          const svgBlob = new Blob([qrCodeSVG], { type: 'image/svg+xml' })
          const svgUrl = URL.createObjectURL(svgBlob)
          // 清理之前的URL
          if (prevBlobUrlRef.current) {
            URL.revokeObjectURL(prevBlobUrlRef.current)
          }
          prevBlobUrlRef.current = svgUrl
          svgContentRef.current = qrCodeSVG // 保存SVG内容
          setQrPreview(svgUrl)
          setPreviewUrl(url)
        }
      } else {
        // 没有选择框架，直接使用二维码
        const svgBlob = new Blob([qrCodeSVG], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(svgBlob)
        // 清理之前的URL
        if (prevBlobUrlRef.current) {
          URL.revokeObjectURL(prevBlobUrlRef.current)
        }
        prevBlobUrlRef.current = svgUrl
        svgContentRef.current = qrCodeSVG // 保存SVG内容
        setQrPreview(svgUrl)
        setPreviewUrl(url)
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      setQrPreview(null)
      setPreviewUrl('')
    }
  }, [])

  // 当框架选择变化时，重新生成预览
  const prevFrameRef = useRef<string | null>(null)
  useEffect(() => {
    if (targetUrl && targetUrl.trim() && selectedFrame !== prevFrameRef.current) {
      prevFrameRef.current = selectedFrame
      generatePreview(targetUrl, selectedFrame)
    }
  }, [selectedFrame, targetUrl, generatePreview])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/dynamic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          targetUrl,
          description,
          frameTemplateId: selectedFrame || undefined,
          scheduleConfig: Object.keys(scheduleConfig).length > 0 ? scheduleConfig : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to create dynamic QR code.')
      }

      setResult(data.data)
      const svgData = await QRCode.toDataURL(data.data.shortUrl)
      setQrPreview(svgData)
      setShowSuccess(true)
      setError(null)
      
      // 滚动到顶部显示成功消息
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred.')
      setResult(null)
      setQrPreview(null)
      setShowSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAnother = () => {
    setTitle('Campaign Landing Page')
    setTargetUrl('https://customqr.pro')
    setDescription('')
    setScheduleConfig({})
    setSelectedFrame(null)
    setResult(null)
    setQrPreview(null)
    setShowSuccess(false)
    setError(null)
    // 滚动到表单顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-neutral-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 顶部头部栏 */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* 移动端汉堡菜单按钮 */}
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <Link href="/" className="text-xl font-semibold text-neutral-900">
                CustomQR.pro
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-600">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 左侧导航栏 */}
        <SidebarNavigation 
          status={status} 
          onStatusChange={setStatus} 
          stats={stats} 
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* 主内容区 */}
        <main className="flex-1 w-0 lg:ml-64">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Create Dynamic URL QR Code</h1>

            {/* 成功消息横幅 */}
            {showSuccess && result && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">QR Code created successfully!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your dynamic QR code is ready. Short URL: <span className="font-mono font-semibold">{result.shortUrl}</span></p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/qrcodes/${result.id}`)}
                        className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(result.shortUrl)
                          // 可以添加一个临时的复制成功提示
                        }}
                        className="inline-flex items-center rounded-md border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                      >
                        Copy Link
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateAnother}
                        className="inline-flex items-center rounded-md border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                      >
                        Create Another
                      </button>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowSuccess(false)}
                      className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-8">
        <section className={`lg:col-span-5 bg-white border rounded-2xl p-6 shadow-sm transition-all ${
          isSubmitting ? 'border-blue-200 opacity-75' : 'border-neutral-200'
        }`}>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting || showSuccess} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
                QR Code Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                placeholder="e.g. Black Friday Campaign"
              />
            </div>

            <div>
              <label htmlFor="targetUrl" className="block text-sm font-medium text-neutral-700">
                Destination URL *
              </label>
              <input
                id="targetUrl"
                type="url"
                required
                value={targetUrl}
                onChange={(event) => setTargetUrl(event.target.value)}
                onBlur={(event) => {
                  const url = event.target.value.trim()
                  if (url) {
                    generatePreview(url, selectedFrame)
                  }
                }}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                placeholder="https://"
              />
              <p className="mt-1 text-xs text-neutral-500">Users will be redirected to this URL. You can edit it anytime.</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                Notes (optional)
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                placeholder="Add campaign details or internal notes for your team."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                QR Code Frame (optional)
              </label>
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
                      {/* 框架模板 */}
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
                            
                            {/* 模板信息 */}
                            <div className="px-0.5 py-0.5">
                              <div className="text-[7px] font-medium text-neutral-900 truncate leading-tight">
                                {template.name}
                              </div>
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

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Advanced Settings (optional)
              </label>
              <ScheduleConfigComponent value={scheduleConfig} onChange={setScheduleConfig} />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            </fieldset>
            
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || showSuccess}
                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70 min-w-[180px]"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : showSuccess ? (
                  'Created Successfully'
                ) : (
                  'Create Dynamic QR Code'
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Live Preview</h2>
            <div className={`flex flex-col items-center justify-center rounded-xl border p-6 text-center transition-all ${
              qrPreview && result && showSuccess 
                ? 'border-green-300 bg-green-50 shadow-md' 
                : qrPreview
                ? 'border-blue-200 bg-blue-50'
                : 'border-dashed border-neutral-200'
            }`}>
              {qrPreview ? (
                <>
                  <div className="relative">
                    <img src={qrPreview} alt="QR Preview" className="h-48 w-48 lg:h-64 lg:w-64 max-w-full object-contain" />
                    {showSuccess && result && (
                      <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {result ? (
                    <p className="mt-4 text-sm font-medium text-neutral-800 break-all">{result.shortUrl}</p>
                  ) : (
                    <p className="mt-4 text-sm font-medium text-neutral-800 break-all">{previewUrl || targetUrl}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {result ? (
                      <>
                        <button
                          type="button"
                          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(result.shortUrl)
                            } catch (err) {
                              console.error('Failed to copy:', err)
                            }
                          }}
                        >
                          Copy link
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          onClick={async () => {
                            if (!svgContentRef.current) return
                            
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
                                link.download = `${result.shortCode}.png`
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                                
                                // 清理URL
                                URL.revokeObjectURL(downloadUrl)
                                URL.revokeObjectURL(svgUrl)
                              }, 'image/png')
                            } catch (error) {
                              console.error('Error downloading PNG:', error)
                              // 降级方案：直接下载SVG
                              const blob = new Blob([svgContentRef.current], { type: 'image/svg+xml' })
                              const url = URL.createObjectURL(blob)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = `${result.shortCode}.svg`
                              link.click()
                              URL.revokeObjectURL(url)
                            }
                          }}
                        >
                          Download PNG
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                          onClick={() => router.push(`/dashboard/qrcodes/${result.id}`)}
                        >
                          View Details
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={async () => {
                          if (!svgContentRef.current) return
                          
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
                              link.download = `qr-preview.png`
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                              
                              // 清理URL
                              URL.revokeObjectURL(downloadUrl)
                              URL.revokeObjectURL(svgUrl)
                            }, 'image/png')
                          } catch (error) {
                            console.error('Error downloading PNG:', error)
                            // 降级方案：直接下载SVG
                            const blob = new Blob([svgContentRef.current], { type: 'image/svg+xml' })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `qr-preview.svg`
                            link.click()
                            URL.revokeObjectURL(url)
                          }
                        }}
                      >
                        Download Preview
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-neutral-200 text-neutral-400">
                    QR
                  </div>
                  <p className="mt-3 text-sm text-neutral-500">Generate your QR to preview it here.</p>
                </>
              )}
            </div>

            <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
              <p className="font-semibold text-neutral-900">Dynamic URL QR Code</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Change the destination anytime</li>
                <li>Track scans, devices, and locations</li>
                <li>No need to reprint your materials</li>
              </ul>
            </div>
          </div>
        </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

