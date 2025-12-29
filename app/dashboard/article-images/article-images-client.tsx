'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'
import DashboardLayout from '../components/DashboardLayout'

interface Article {
  id: number
  title: string
  slug: string
}

interface ArticleImage {
  id: number
  articleId: number
  slug: string
  name: string
  r2Path: string
  r2Url: string
  size: number
  width?: number
  height?: number
  altText?: string
  sourceUrl?: string
  order: number
  createdAt: string
  updatedAt: string
  article: Article
}

export default function ArticleImagesClient() {
  const toast = useToast()
  const [images, setImages] = useState<ArticleImage[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'size' | 'order' | 'article'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [selectedImage, setSelectedImage] = useState<ArticleImage | null>(null)
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const pasteAreaRef = useRef<HTMLDivElement>(null)

  // 处理粘贴事件
  useEffect(() => {
    if (!showReplaceModal) return

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            handleFileFromPaste(file)
          }
          break
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [showReplaceModal])

  const handleFileFromPaste = (pastedFile: File) => {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(pastedFile.type)) {
      toast.error('只支持 JPEG、PNG、GIF 和 WebP 格式的图片')
      return
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024
    if (pastedFile.size > maxSize) {
      toast.error('图片大小不能超过 10MB')
      return
    }

    // 生成文件名
    const timestamp = new Date().getTime()
    const extension = pastedFile.type.split('/')[1]
    const fileName = `pasted-image-${timestamp}.${extension === 'jpeg' ? 'jpg' : extension}`

    // 创建新的 File 对象
    const file = new File([pastedFile], fileName, { type: pastedFile.type })

    setFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    toast.success('图片已从剪贴板粘贴')
  }

  useEffect(() => {
    fetchImages()
  }, [keyword, sortBy, sortOrder, currentPage])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (keyword) params.append('keyword', keyword)
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      params.append('page', currentPage.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/article-images?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setImages(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      toast.error('加载图片失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: 'createdAt' | 'size' | 'order' | 'article') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  const handleReplace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedImage) return

    setReplacing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/article-images/${selectedImage.id}/replace`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast.success('图片替换成功' + (data.articleUpdated ? '，文章内容已同步更新' : ''))
        setShowReplaceModal(false)
        setFile(null)
        setPreviewUrl(null)
        setSelectedImage(null)
        fetchImages()
      } else {
        toast.error('图片替换失败：' + data.error)
      }
    } catch (error) {
      console.error('Error replacing image:', error)
      toast.error('图片替换失败')
    } finally {
      setReplacing(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('只支持 JPEG、PNG、GIF 和 WebP 格式的图片')
      return
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      toast.error('图片大小不能超过 10MB')
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <DashboardLayout title="文章图片管理" isFullWidth={true}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">文章图片管理</h1>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 sm:max-w-md">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1)
                  }
                }}
                placeholder="搜索关键词、文件名或Alt文本..."
                className="w-full px-4 py-2 pl-10 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 排序 */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field as 'createdAt' | 'size' | 'order' | 'article')
              setSortOrder(order as 'asc' | 'desc')
            }}
            className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm"
          >
            <option value="createdAt-desc">创建时间（最新）</option>
            <option value="createdAt-asc">创建时间（最早）</option>
            <option value="size-desc">大小（从大到小）</option>
            <option value="size-asc">大小（从小到大）</option>
            <option value="order-asc">文章顺序</option>
            <option value="article-asc">文章标题（A-Z）</option>
            <option value="article-desc">文章标题（Z-A）</option>
          </select>
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">加载中...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-neutral-600 mb-4">
            {keyword ? '没有找到匹配的图片' : '暂无图片'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                      缩略图
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      图片信息
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-48">
                      所属文章
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                      <button
                        onClick={() => handleSort('size')}
                        className="flex items-center gap-1 hover:text-neutral-700 transition-colors"
                      >
                        大小
                        {sortBy === 'size' && (
                          <svg
                            className={`w-3 h-3 ${sortOrder === 'asc' ? '' : 'rotate-180'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-32">
                      尺寸
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-40">
                      创建时间
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider w-32">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {images.map((image) => (
                    <tr key={image.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-20 h-14 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={image.r2Url}
                            alt={image.altText || image.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-neutral-900 truncate">
                            {image.name}
                          </div>
                          {image.slug && (
                            <div className="text-xs text-neutral-500 truncate mt-0.5">
                              {image.slug}
                            </div>
                          )}
                          {image.altText && (
                            <div className="text-xs text-neutral-400 truncate mt-0.5 italic">
                              {image.altText}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/dashboard/articles/${image.articleId}`}
                          className="text-sm text-primary-600 hover:text-primary-700 hover:underline block truncate"
                          title={image.article.title}
                        >
                          {image.article.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-600">
                        {formatSize(image.size)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-600">
                        {image.width && image.height ? `${image.width}x${image.height}` : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-600">
                        {formatDate(image.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedImage(image)
                              setShowReplaceModal(true)
                              setFile(null)
                              setPreviewUrl(null)
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="替换图片"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <a
                            href={image.r2Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            title="查看原图"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                          <Link
                            href={`/${image.article.slug}`}
                            target="_blank"
                            className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                            title="查看文章"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页组件 */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
              <div className="text-sm text-neutral-600">
                显示第 {(currentPage - 1) * pagination.limit + 1} -{' '}
                {Math.min(currentPage * pagination.limit, pagination.total)} 条，共 {pagination.total} 条
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 替换图片弹窗 */}
      {showReplaceModal && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowReplaceModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">替换图片</h2>
              <button
                onClick={() => {
                  setShowReplaceModal(false)
                  setFile(null)
                  setPreviewUrl(null)
                }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 原图片 */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-3">当前图片</h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <img
                      src={selectedImage.r2Url}
                      alt={selectedImage.altText || selectedImage.name}
                      className="w-full h-auto rounded"
                    />
                    <div className="mt-3 space-y-1 text-sm text-neutral-600">
                      <p><strong>文件名：</strong>{selectedImage.name}</p>
                      <p><strong>大小：</strong>{formatSize(selectedImage.size)}</p>
                      {selectedImage.width && selectedImage.height && (
                        <p><strong>尺寸：</strong>{selectedImage.width}x{selectedImage.height}px</p>
                      )}
                      {selectedImage.altText && (
                        <p><strong>Alt文本：</strong>{selectedImage.altText}</p>
                      )}
                      <p><strong>所属文章：</strong>{selectedImage.article.title}</p>
                    </div>
                  </div>
                </div>

                {/* 新图片上传 */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-3">上传新图片</h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="预览"
                          className="w-full h-auto rounded border-2 border-primary-500"
                        />
                        <div className="flex items-center justify-between text-sm text-neutral-600">
                          <span>{file?.name}</span>
                          <span>{formatSize(file?.size || 0)}</span>
                        </div>
                        <button
                          onClick={() => {
                            setFile(null)
                            setPreviewUrl(null)
                          }}
                          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                        >
                          重新选择
                        </button>
                      </div>
                    ) : (
                      <div
                        ref={pasteAreaRef}
                        tabIndex={0}
                        className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('file-input')?.click()}
                        onFocus={(e) => e.currentTarget.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2')}
                        onBlur={(e) => e.currentTarget.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2')}
                      >
                        <input
                          id="file-input"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <svg
                          className="mx-auto w-12 h-12 text-neutral-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-neutral-600">点击或拖拽图片到此处上传</p>
                        <p className="mt-1 text-xs text-neutral-400">或直接按 Ctrl+V 粘贴图片</p>
                        <p className="mt-1 text-xs text-neutral-400">支持 JPEG、PNG、GIF、WebP 格式，最大 10MB</p>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>提示：</strong>替换后，图片URL会保持不变（R2路径不变），但显示内容会更新为新的图片。文章内容中的图片会自动同步更新。
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                        <p className="text-sm text-green-800">
                          <strong>快捷方式：</strong>点击上传区域后，可以直接按 Ctrl+V（Windows）或 Cmd+V（Mac）粘贴剪贴板中的图片。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowReplaceModal(false)
                  setFile(null)
                  setPreviewUrl(null)
                }}
                className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
                disabled={replacing}
              >
                取消
              </button>
              <button
                onClick={handleReplace}
                disabled={!file || replacing}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {replacing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    替换中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    确认替换
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
