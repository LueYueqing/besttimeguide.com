'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import Image from 'next/image'
import QRCode from 'qrcode'
import SidebarNavigation from '../../components/SidebarNavigation'
import { combineQRWithFrame, getTemplateById, getAllTemplates, type QRFrameTemplate } from '@/lib/qr-frames'

interface QRCodeData {
  id: number
  title?: string | null
  description?: string | null
  type: string
  targetUrl?: string | null
  shortCode?: string | null
  shortUrl?: string | null
  isDynamic: boolean
  isActive: boolean
  scanCount: number
  analyticsCount: number
  createdAt: string
  updatedAt: string
  lastScanAt?: string | null
  frameTemplateId?: string | null
}

interface DashboardStats {
  total: number
  active: number
  paused: number
  archived: number
  dynamic: number
  totalScans: number
}

export default function EditQRCodeClient({ qrCodeId }: { qrCodeId: string }) {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [status, setStatus] = useState<'all' | 'active' | 'paused' | 'archived'>('all')
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    paused: 0,
    archived: 0,
    dynamic: 0,
    totalScans: 0,
  })

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

  const [qrCode, setQrCode] = useState<QRCodeData | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [templates, setTemplates] = useState<QRFrameTemplate[]>([])
  const [templatePreviews, setTemplatePreviews] = useState<Map<string, string>>(new Map())
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const prevBlobUrlRef = useRef<string | null>(null)
  const svgContentRef = useRef<string | null>(null) // 存储原始SVG内容用于下载
  const [sidebarOpen, setSidebarOpen] = useState(false) // 移动端侧边栏状态

  // 获取stats数据
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
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
    fetchStats()
  }, [user])

  // 加载QR码数据
  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`/api/qrcodes/${qrCodeId}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load QR code')
        }

        setQrCode(data.data)
        setTitle(data.data.title || '')
        setDescription(data.data.description || '')
        setTargetUrl(data.data.targetUrl || '')
        setIsActive(data.data.isActive)
        setSelectedFrame(data.data.frameTemplateId || null)

        // 生成QR码预览（带框架）
        if (data.data.shortUrl) {
          setPreviewUrl(data.data.shortUrl)
          await generatePreview(data.data.shortUrl, data.data.frameTemplateId)
        }
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Failed to load QR code')
      } finally {
        setLoading(false)
      }
    }

    fetchQRCode()
  }, [qrCodeId])

  // 生成预览（支持框架）
  const generatePreview = useCallback(async (url: string, frameId: string | null | undefined) => {
    if (!url || !url.trim()) {
      setQrPreview(null)
      return
    }

    try {
      // 确定二维码尺寸
      let qrSize = 400
      if (frameId) {
        try {
          const template = getTemplateById(frameId)
          if (template) {
            if (template.qrSize) {
              qrSize = template.qrSize
            } else {
              const placeholderSize = Math.min(template.placeholder.width, template.placeholder.height)
              qrSize = Math.max(200, Math.min(800, Math.floor(placeholderSize * 1.2)))
            }
          }
        } catch (error) {
          console.error('Error getting template:', error)
        }
      }

      // 生成二维码SVG
      const qrCodeSVG = await QRCode.toString(url, {
        type: 'svg',
        width: qrSize,
        margin: frameId ? 1 : 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      // 如果选择了框架，组合框架和二维码
      if (frameId) {
        try {
          const combinedSVG = await combineQRWithFrame(qrCodeSVG, frameId)
          svgContentRef.current = combinedSVG // 保存带框架的完整SVG内容
          const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml' })
          const svgUrl = URL.createObjectURL(svgBlob)
          
          // 清理之前的URL
          if (prevBlobUrlRef.current) {
            URL.revokeObjectURL(prevBlobUrlRef.current)
          }
          prevBlobUrlRef.current = svgUrl
          
          setQrPreview(svgUrl)
        } catch (error) {
          console.error('Error combining frame:', error)
          // 如果框架组合失败，使用普通二维码
          svgContentRef.current = qrCodeSVG
          const svgBlob = new Blob([qrCodeSVG], { type: 'image/svg+xml' })
          const svgUrl = URL.createObjectURL(svgBlob)
          if (prevBlobUrlRef.current) {
            URL.revokeObjectURL(prevBlobUrlRef.current)
          }
          prevBlobUrlRef.current = svgUrl
          setQrPreview(svgUrl)
        }
      } else {
        // 没有框架，使用普通二维码
        svgContentRef.current = qrCodeSVG
        const svgBlob = new Blob([qrCodeSVG], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(svgBlob)
        if (prevBlobUrlRef.current) {
          URL.revokeObjectURL(prevBlobUrlRef.current)
        }
        prevBlobUrlRef.current = svgUrl
        setQrPreview(svgUrl)
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      setQrPreview(null)
    }
  }, [])

  // 加载模板列表和生成预览图
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

  // 当targetUrl或框架变化时更新QR码预览
  useEffect(() => {
    if (qrCode?.shortUrl) {
      generatePreview(qrCode.shortUrl, selectedFrame)
    }
  }, [qrCode?.shortUrl, selectedFrame, generatePreview])

  // 当框架选择变化时，重新生成预览
  useEffect(() => {
    if (previewUrl && previewUrl.trim()) {
      generatePreview(previewUrl, selectedFrame)
    }
  }, [selectedFrame, previewUrl, generatePreview])

  // 清理 blob URL
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/qrcodes/${qrCodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          targetUrl: qrCode?.isDynamic ? targetUrl : undefined,
          isActive,
          frameTemplateId: selectedFrame || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update QR code')
      }

      // 更新本地状态
      if (data.data) {
        setQrCode((prev) => (prev ? { ...prev, ...data.data } : null))
      }

      // 显示成功消息并刷新
      router.refresh()
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to update QR code')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/qrcodes/${qrCodeId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete QR code')
      }

      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to delete QR code')
      setDeleting(false)
      setDeleteConfirm(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-neutral-600">Loading...</div>
      </div>
    )
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
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
          <SidebarNavigation status={status} onStatusChange={setStatus} stats={stats} user={user} />
          <main className="flex-1 lg:ml-64 flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-neutral-900 mb-4">QR Code Not Found</h1>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Back to Dashboard
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 顶部头部栏 */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
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
            <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
              {qrCode.isDynamic ? 'Edit Dynamic QR Code' : 'Edit QR Code'}
            </h1>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-8">
              <section className={`lg:col-span-5 bg-white border rounded-2xl p-6 shadow-sm transition-all ${
                saving ? 'border-blue-200 opacity-75' : 'border-neutral-200'
              }`}>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
                QR Code Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                placeholder="e.g. Black Friday Campaign"
              />
            </div>

            {qrCode.isDynamic && (
              <div>
                <label htmlFor="targetUrl" className="block text-sm font-medium text-neutral-700">
                  Destination URL *
                </label>
                <input
                  id="targetUrl"
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  placeholder="https://"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Users will be redirected to this URL. You can edit it anytime.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                Notes (optional)
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-neutral-700">Active</span>
              </label>
              <p className="mt-1 text-xs text-neutral-500">
                {isActive
                  ? 'QR code is active and will redirect users'
                  : 'QR code is paused and will not redirect users'}
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                  deleteConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'border border-red-300 text-red-700 hover:bg-red-50'
                }`}
              >
                {deleting ? 'Deleting...' : deleteConfirm ? 'Confirm Delete' : 'Delete'}
              </button>
              {deleteConfirm && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Live Preview</h2>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 p-6 text-center">
              {qrPreview && qrCode.shortUrl ? (
                <>
                  <div className="relative">
                    <img src={qrPreview} alt="QR Preview" className="h-48 w-48 lg:h-64 lg:w-64 max-w-full object-contain" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-neutral-800 break-all">
                    {qrCode.shortUrl}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      onClick={() => {
                        navigator.clipboard.writeText(qrCode.shortUrl!)
                      }}
                    >
                      Copy link
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
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
                            link.download = `${qrCode.shortCode || 'qr-code'}.png`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            
                            // 清理URL
                            URL.revokeObjectURL(svgUrl)
                            URL.revokeObjectURL(downloadUrl)
                          }, 'image/png')
                        } catch (error) {
                          console.error('Error downloading PNG:', error)
                        }
                      }}
                    >
                      Download PNG
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-neutral-200 text-neutral-400">
                  QR
                </div>
              )}
            </div>

            <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600 space-y-2">
              <div>
                <span className="font-semibold text-neutral-900">Scans:</span>{' '}
                {qrCode.scanCount.toLocaleString()}
              </div>
              {qrCode.lastScanAt && (
                <div>
                  <span className="font-semibold text-neutral-900">Last scan:</span>{' '}
                  {new Date(qrCode.lastScanAt).toLocaleDateString()}
                </div>
              )}
              <div>
                <span className="font-semibold text-neutral-900">Created:</span>{' '}
                {new Date(qrCode.createdAt).toLocaleDateString()}
              </div>
            </div>

            {qrCode.isDynamic && (
              <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                <p className="font-semibold text-blue-900">Dynamic QR Code</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Change the destination anytime</li>
                  <li>Track scans, devices, and locations</li>
                  <li>No need to reprint your materials</li>
                </ul>
              </div>
            )}
          </div>
        </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

