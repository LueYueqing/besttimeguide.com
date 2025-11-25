'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import QRCodePreviewModal from './QRCodePreviewModal'

interface QRCode {
  id: number
  title?: string | null
  description?: string | null
  type: string
  content: any
  design: any
  targetUrl?: string | null
  shortCode?: string | null
  lastScanAt?: string | null
  isDynamic: boolean
  isActive: boolean
  isArchived: boolean
  scanCount: number
  createdAt: string
  updatedAt: string
  analyticsCount: number
}

interface QRCodeListProps {
  qrCodes: QRCode[]
  loading: boolean
  onRefresh: () => void
  user?: {
    plan?: string | null
    email?: string | null
    proTrialExpiresAt?: string | Date | null
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getContentPreview = (content: any, type: string): string => {
  if (!content) return '—'
  
  switch (type) {
    case 'URL':
      return content.url || content.text || '—'
    case 'TEXT':
      return content.text || '—'
    case 'WIFI':
      return content.ssid || 'WiFi Network'
    case 'EMAIL':
      return content.email || '—'
    case 'PHONE':
      return content.phone || '—'
    case 'SMS':
      return content.phone || '—'
    default:
      return JSON.stringify(content).substring(0, 50) || '—'
  }
}

const getTypeLabel = (type: string): string => {
  return type.charAt(0) + type.slice(1).toLowerCase()
}

const formatShortUrl = (shortCode?: string | null) => {
  if (!shortCode) return null
  return `/r/${shortCode}`
}

// QR Code Preview Image Component
function QRCodePreviewImage({ 
  qrId, 
  content, 
  onClick 
}: { 
  qrId: number
  content: string | null
  onClick: (e: React.MouseEvent) => void
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // 使用 API 路由获取预览图（支持 Blob Storage 和本地文件系统）
  const previewUrl = `/api/qr-previews/${qrId}`

  useEffect(() => {
    // 首先尝试使用预览图URL（通过 API 路由，支持 Blob Storage）
    const img = new window.Image()
    img.onload = () => {
      setImageSrc(img.src) // 使用实际加载的 URL（可能是 Blob Storage URL）
      setIsLoading(false)
      setHasError(false)
    }
    img.onerror = async () => {
      // 如果预览图不存在，回退到实时生成
      if (content) {
        try {
          const dataUrl = await QRCode.toDataURL(content, {
            width: 80,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          })
          setImageSrc(dataUrl)
          setIsLoading(false)
          setHasError(false)
        } catch (error) {
          console.error(`Error generating fallback preview for QR ${qrId}:`, error)
          setHasError(true)
          setIsLoading(false)
        }
      } else {
        setHasError(true)
        setIsLoading(false)
      }
    }
    img.src = previewUrl
  }, [qrId, content, previewUrl])

  if (isLoading) {
    return (
      <div className="w-12 h-12 border border-neutral-200 rounded bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-neutral-300 text-xs">QR</div>
      </div>
    )
  }

  if (hasError || !imageSrc) {
    return (
      <div className="w-12 h-12 border border-neutral-200 rounded bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-300 text-xs">—</div>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className="cursor-pointer hover:opacity-80 transition-opacity"
    >
      <img 
        src={imageSrc} 
        alt="QR Code Preview" 
        className="w-12 h-12 border border-neutral-200 rounded"
      />
    </button>
  )
}

// 获取二维码内容用于生成预览
const getQRContentForPreview = (qr: QRCode): string => {
  if (qr.isDynamic && qr.shortCode) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://customqr.pro'
    return `${baseUrl}/r/${qr.shortCode}`
  }
  
  // 静态二维码
  if (qr.content) {
    if (qr.type === 'URL') {
      return qr.content.url || qr.content.text || ''
    }
    if (qr.type === 'TEXT') {
      return qr.content.text || ''
    }
    if (qr.type === 'WIFI') {
      return `WIFI:T:${qr.content.security || 'WPA'};S:${qr.content.ssid || ''};P:${qr.content.password || ''};;`
    }
    if (qr.type === 'EMAIL') {
      return `mailto:${qr.content.email || ''}${qr.content.subject ? `?subject=${encodeURIComponent(qr.content.subject)}` : ''}${qr.content.body ? `&body=${encodeURIComponent(qr.content.body)}` : ''}`
    }
    if (qr.type === 'PHONE') {
      return `tel:${qr.content.phone || ''}`
    }
    if (qr.type === 'SMS') {
      return `sms:${qr.content.phone || ''}${qr.content.message ? `?body=${encodeURIComponent(qr.content.message)}` : ''}`
    }
  }
  
  return ''
}

export default function QRCodeList({ qrCodes, loading, onRefresh, user }: QRCodeListProps) {
  const plan = user?.plan?.toLowerCase() || 'free'
  const isFree = plan === 'free'
  const isDevUser = typeof window !== 'undefined' && user?.email === 'dev@customqr.pro'
  
  // 检查 Pro 试用权限
  const proTrialExpiresAt = user?.proTrialExpiresAt
    ? new Date(user.proTrialExpiresAt)
    : null
  const hasProTrial = proTrialExpiresAt && proTrialExpiresAt > new Date()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [bulkOperating, setBulkOperating] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null)

  const handleQRCodeClick = (qr: QRCode) => {
    setSelectedQRCode(qr)
    setPreviewModalOpen(true)
  }

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === qrCodes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(qrCodes.map(qr => qr.id)))
    }
  }

  // 删除单个QR码
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return
    }

    setDeletingIds(prev => new Set(prev).add(id))
    try {
      const response = await fetch(`/api/qrcodes/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        // 刷新列表
        onRefresh()
        // 如果已选中，从选中列表中移除
        setSelectedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      } else {
        alert(data.error || 'Failed to delete QR code')
      }
    } catch (error) {
      console.error('Error deleting QR code:', error)
      alert('Failed to delete QR code. Please try again.')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  // 批量操作
  const handleBulkOperation = async (operation: 'activate' | 'pause' | 'delete') => {
    if (selectedIds.size === 0) return

    if (operation === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedIds.size} QR code(s)? This action cannot be undone.`)) {
        return
      }
    }

    setBulkOperating(true)
    const idsArray = Array.from(selectedIds)
    
    try {
      // 对于删除操作，逐个调用DELETE API
      if (operation === 'delete') {
        const deletePromises = idsArray.map(id =>
          fetch(`/api/qrcodes/${id}`, { method: 'DELETE' })
        )
        await Promise.all(deletePromises)
      } else {
        // 对于激活/暂停操作，逐个调用PUT API
        const updatePromises = idsArray.map(id =>
          fetch(`/api/qrcodes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: operation === 'activate' }),
          })
        )
        await Promise.all(updatePromises)
      }

      // 刷新列表
      onRefresh()
      // 清空选中列表
      setSelectedIds(new Set())
    } catch (error) {
      console.error(`Error performing bulk ${operation}:`, error)
      alert(`Failed to ${operation} QR codes. Please try again.`)
    } finally {
      setBulkOperating(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-6 bg-white rounded-lg border border-neutral-200 p-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-16 bg-neutral-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (qrCodes.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-lg border border-neutral-200 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-neutral-900">This folder is empty.</h3>
        <p className="mt-2 text-sm text-neutral-500">
          Get started by creating your first QR code.
        </p>
        <Link
          href="/dashboard/create"
          className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Create QR Code
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-6 bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* 表头 */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-700">
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={selectedIds.size === qrCodes.length && qrCodes.length > 0}
            onChange={toggleSelectAll}
            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-1">QR Code</div>
        <div className="col-span-2">Title</div>
        <div className="col-span-3">Content</div>
        <div className="col-span-1 text-center">Scans</div>
        <div className="col-span-2">
          <div className="flex items-center gap-1">
            Last modified
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* 表格内容 */}
      <div className="divide-y divide-neutral-200">
        {qrCodes.map((qr) => (
          <div
            key={qr.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            {/* 复选框 */}
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.has(qr.id)}
                onChange={() => toggleSelect(qr.id)}
                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* QR Code Preview */}
            <div className="col-span-1 flex items-center">
              <QRCodePreviewImage 
                qrId={qr.id}
                content={getQRContentForPreview(qr)}
                onClick={(e) => {
                  e.stopPropagation()
                  handleQRCodeClick(qr)
                }}
              />
            </div>

            {/* Title */}
            <div className="col-span-2 flex items-center">
              <div>
                <div className="text-sm font-medium text-neutral-900">
                  {qr.title || `${getTypeLabel(qr.type)} QR Code`}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {qr.isDynamic ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Dynamic URL
                      </span>
                      {formatShortUrl(qr.shortCode) && (
                        <span className="text-[11px] text-neutral-400">
                          {formatShortUrl(qr.shortCode)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-neutral-400">Static</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="col-span-3 flex items-center">
              <div className="text-sm text-neutral-600 truncate">
                {qr.isDynamic ? qr.targetUrl || '—' : getContentPreview(qr.content, qr.type)}
              </div>
            </div>

            {/* Scans */}
            <div className="col-span-1 flex items-center justify-center">
              <span className="text-sm font-medium text-neutral-900">
                {qr.scanCount.toLocaleString()}
              </span>
            </div>

            {/* Last modified */}
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-neutral-600">{formatDate(qr.updatedAt)}</span>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-2">
              <Link
                href={`/dashboard/qrcodes/${qr.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </Link>
              {isFree && !isDevUser && !hasProTrial ? (
                <Link
                  href="/pricing?feature=analytics"
                  className="text-sm text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Stats
                </Link>
              ) : (
                <Link
                  href={`/dashboard/qrcodes/${qr.id}/analytics`}
                  className="text-sm text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Stats
                </Link>
              )}
              <button
                className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleDelete(qr.id)}
                disabled={deletingIds.has(qr.id)}
              >
                {deletingIds.has(qr.id) ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 批量操作栏 */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
          <span className="text-sm text-blue-700 font-medium">
            {selectedIds.size} QR code{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkOperation('activate')}
              disabled={bulkOperating}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkOperating ? 'Processing...' : 'Activate'}
            </button>
            <button
              onClick={() => handleBulkOperation('pause')}
              disabled={bulkOperating}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkOperating ? 'Processing...' : 'Pause'}
            </button>
            <button
              onClick={() => handleBulkOperation('delete')}
              disabled={bulkOperating}
              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkOperating ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      <QRCodePreviewModal
        qrCode={selectedQRCode}
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false)
          setSelectedQRCode(null)
        }}
      />
    </div>
  )
}

