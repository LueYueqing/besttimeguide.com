'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'
import { combineQRWithFrame, type QRFrameTemplate } from '@/lib/qr-frames'
import SidebarNavigation from '../../components/SidebarNavigation'
import { useUser } from '@/contexts/UserContext'

function FrameDebugContent() {
  const searchParams = useSearchParams()
  const { user } = useUser()
  const templateId = searchParams.get('id') || 'envelope-style'
  
  const [templates, setTemplates] = useState<QRFrameTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<QRFrameTemplate | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prevBlobUrlRef = useRef<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 从API加载模板配置（实时读取 templates.json）
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/debug/templates')
        if (!response.ok) {
          throw new Error('Failed to load templates')
        }
        const data = await response.json()
        if (data.success && data.templates) {
          setTemplates(data.templates)
          
          // 根据 templateId 选择模板
          const template = data.templates.find((t: QRFrameTemplate) => t.id === templateId)
          if (template) {
            setSelectedTemplate(template)
          } else {
            setError(`Template "${templateId}" not found`)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load templates')
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [templateId])

  // 生成预览
  const generatePreview = useCallback(async (template: QRFrameTemplate) => {
    if (!template) return

    const testUrl = 'https://customqr.pro'
    
    try {
      // 确定二维码尺寸
      let qrSize = 400
      if (template.qrSize) {
        qrSize = template.qrSize
      } else {
        const placeholderSize = Math.min(template.placeholder.width, template.placeholder.height)
        qrSize = Math.max(200, Math.min(800, Math.floor(placeholderSize * 1.2)))
      }

      // 生成二维码SVG
      const qrCodeSVG = await QRCode.toString(testUrl, {
        type: 'svg',
        width: qrSize,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      // 组合框架和二维码
      const combinedSVG = await combineQRWithFrame(qrCodeSVG, template.id)
      
      // 转换为 blob URL
      const svgBlob = new Blob([combinedSVG], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      // 清理之前的URL
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current)
      }
      prevBlobUrlRef.current = svgUrl
      
      setQrPreview(svgUrl)
      setPreviewUrl(testUrl)
    } catch (err: any) {
      console.error('Error generating preview:', err)
      setError(err.message || 'Failed to generate preview')
    }
  }, [])

  // 当模板变化时，重新生成预览
  useEffect(() => {
    if (selectedTemplate) {
      generatePreview(selectedTemplate)
    }
  }, [selectedTemplate, generatePreview])

  // 刷新预览（重新读取配置）
  const handleRefresh = useCallback(() => {
    if (selectedTemplate) {
      generatePreview(selectedTemplate)
    }
  }, [selectedTemplate, generatePreview])

  // 切换模板
  const handleTemplateChange = (newTemplateId: string) => {
    const newUrl = `/dashboard/debug/frame?id=${newTemplateId}`
    window.history.pushState({}, '', newUrl)
    const template = templates.find(t => t.id === newTemplateId)
    if (template) {
      setSelectedTemplate(template)
      setError(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* 侧边栏 */}
      <SidebarNavigation
        status="all"
        onStatusChange={() => {}}
        stats={{
          total: 0,
          active: 0,
          paused: 0,
          archived: 0,
          dynamic: 0,
          totalScans: 0,
        }}
        user={user ? {
          plan: user.plan || null,
          email: user.email || null,
          subscription: user.subscription || null,
          proTrialExpiresAt: user.proTrialExpiresAt || null,
          proTrialDaysLeft: user.proTrialDaysLeft,
          referralStats: user.referralStats,
        } : {
          plan: null,
          email: null,
          subscription: null,
          proTrialExpiresAt: null,
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 主内容 */}
      <main className="flex-1 w-0 lg:ml-64">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">框架调试工具</h1>
              <p className="text-sm text-neutral-600 mt-1">
                实时预览二维码与框架的组合效果，修改 templates.json 后刷新即可看到效果
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              刷新预览
            </button>
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 左侧：模板选择和配置信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 模板选择 */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">选择模板</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="font-medium text-sm text-neutral-900">{template.name}</div>
                      <div className="text-xs text-neutral-600 mt-1">{template.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 当前配置信息 */}
              {selectedTemplate && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">当前配置</h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-neutral-600 mb-1">模板ID</div>
                      <div className="font-mono text-neutral-900 bg-neutral-50 p-2 rounded">
                        {selectedTemplate.id}
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-600 mb-1">占位符位置</div>
                      <div className="font-mono text-neutral-900 bg-neutral-50 p-2 rounded">
                        x: {selectedTemplate.placeholder.x}, y: {selectedTemplate.placeholder.y}
                        <br />
                        width: {selectedTemplate.placeholder.width}, height: {selectedTemplate.placeholder.height}
                      </div>
                    </div>
                    {selectedTemplate.qrSize && (
                      <div>
                        <div className="text-neutral-600 mb-1">二维码尺寸</div>
                        <div className="font-mono text-neutral-900 bg-neutral-50 p-2 rounded">
                          qrSize: {selectedTemplate.qrSize}
                        </div>
                      </div>
                    )}
                    {selectedTemplate.qrScale && (
                      <div>
                        <div className="text-neutral-600 mb-1">缩放比例</div>
                        <div className="font-mono text-neutral-900 bg-neutral-50 p-2 rounded">
                          qrScale: {selectedTemplate.qrScale}
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t border-neutral-200">
                      <div className="text-xs text-neutral-500">
                        修改 templates.json 后，点击"刷新预览"按钮即可看到最新效果
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 右侧：预览区域 */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">预览效果</h2>
                
                {qrPreview ? (
                  <div className="space-y-4">
                    <div className="relative bg-neutral-50 rounded-lg p-4 max-h-[500px] overflow-auto">
                      {/* 预览图片容器 */}
                      <div className="relative flex justify-center" id="preview-container">
                        <div className="relative inline-block">
                          <img
                            src={qrPreview}
                            alt="QR Code Preview"
                            className="relative max-w-full h-auto"
                            style={{ maxHeight: '500px', objectFit: 'contain', display: 'block' }}
                            id="preview-image"
                          />
                          {/* 网格和占位符覆盖层（使用 SVG，与图片同尺寸） */}
                          {selectedTemplate && (
                            <svg
                              className="absolute top-0 left-0 w-full h-full pointer-events-none"
                              style={{ 
                                maxHeight: '500px',
                                width: 'auto',
                                height: 'auto',
                              }}
                              viewBox="0 0 1000 1300"
                              preserveAspectRatio="xMidYMid meet"
                            >
                              {/* 网格线 */}
                              <defs>
                                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
                                </pattern>
                                <pattern id="grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
                                </pattern>
                              </defs>
                              <rect width="1000" height="1300" fill="url(#grid)" />
                              <rect width="1000" height="1300" fill="url(#grid-major)" />
                              
                              {/* 占位符区域标记 */}
                              <rect
                                x={selectedTemplate.placeholder.x}
                                y={selectedTemplate.placeholder.y}
                                width={selectedTemplate.placeholder.width}
                                height={selectedTemplate.placeholder.height}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                opacity="0.8"
                              />
                              {/* 占位符标签 */}
                              <text
                                x={selectedTemplate.placeholder.x}
                                y={selectedTemplate.placeholder.y - 5}
                                fill="#3b82f6"
                                fontSize="12"
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                ({selectedTemplate.placeholder.x}, {selectedTemplate.placeholder.y})
                              </text>
                              <text
                                x={selectedTemplate.placeholder.x + selectedTemplate.placeholder.width}
                                y={selectedTemplate.placeholder.y + selectedTemplate.placeholder.height + 15}
                                fill="#3b82f6"
                                fontSize="12"
                                fontFamily="monospace"
                                fontWeight="bold"
                                textAnchor="end"
                              >
                                {selectedTemplate.placeholder.width} × {selectedTemplate.placeholder.height}
                              </text>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-neutral-600">
                      <div className="mb-2">测试URL: {previewUrl}</div>
                      <div className="text-xs text-neutral-500">
                        当前模板: {selectedTemplate?.name || selectedTemplate?.id}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-neutral-400">
                    生成预览中...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function FrameDebugClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-600">加载中...</div>
      </div>
    }>
      <FrameDebugContent />
    </Suspense>
  )
}

