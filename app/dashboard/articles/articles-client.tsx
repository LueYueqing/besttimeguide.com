'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useToast } from '@/components/Toast'
import DashboardLayout from '../components/DashboardLayout'

interface Category {
  id: number
  name: string
  slug: string
}

interface Article {
  id: number
  title: string
  slug: string
  description: string | null
  category: {
    id: number
    name: string
    slug: string
  }
  author: {
    id: number
    name: string | null
    email: string | null
  }
  featured: boolean
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  aiRewriteStatus: string | null
  aiRewriteAt: string | null
  articleMode: string | null
  viewCount: number
  coverImage: string | null
}

interface ArticlesClientProps {
  categories: Category[]
}

export default function ArticlesClient({ categories }: ArticlesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const toast = useToast()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // 从 URL 参数中读取初始筛选状态
  const getInitialFilter = (): 'all' | 'published' | 'draft' => {
    const filterParam = searchParams.get('filter')
    if (filterParam === 'published' || filterParam === 'draft') {
      return filterParam
    }
    return 'all'
  }

  const getInitialCategory = (): string => {
    return searchParams.get('category') || 'all'
  }

  const getInitialPage = (): number => {
    const pageParam = searchParams.get('page')
    return pageParam ? parseInt(pageParam, 10) : 1
  }

  const getInitialSearch = (): string => {
    return searchParams.get('search') || searchParams.get('q') || ''
  }

  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>(getInitialFilter())
  const [categoryFilter, setCategoryFilter] = useState<string>(getInitialCategory())
  const [currentPage, setCurrentPage] = useState(getInitialPage())
  const [searchQuery, setSearchQuery] = useState<string>(getInitialSearch())

  // 排序状态
  const getInitialSort = (): { field: 'publishedAt' | 'updatedAt' | 'viewCount' | null; order: 'asc' | 'desc' } => {
    const sortField = searchParams.get('sort')
    const sortOrder = searchParams.get('order') as 'asc' | 'desc' | null
    if (sortField === 'publishedAt' || sortField === 'updatedAt' || sortField === 'viewCount') {
      return { field: sortField as 'publishedAt' | 'updatedAt' | 'viewCount', order: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc' }
    }
    return { field: null, order: 'desc' }
  }
  const [sortField, setSortField] = useState<'publishedAt' | 'updatedAt' | 'viewCount' | null>(getInitialSort().field)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(getInitialSort().order)
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false)
  const [quickCreateTitles, setQuickCreateTitles] = useState('')
  const [quickCreateCategory, setQuickCreateCategory] = useState<string>('')
  const [quickCreateMode, setQuickCreateMode] = useState<'manual' | 'ai-rewrite' | 'ai-generate'>('manual')
  const [quickCreateLoading, setQuickCreateLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // 更新 URL 参数
  const updateUrlParams = (newFilter: 'all' | 'published' | 'draft', newCategory: string, newPage: number, newSearch: string, newSortField: 'publishedAt' | 'updatedAt' | 'viewCount' | null, newSortOrder: 'asc' | 'desc') => {
    const params = new URLSearchParams()
    if (newFilter !== 'all') {
      params.set('filter', newFilter)
    }
    if (newCategory !== 'all') {
      params.set('category', newCategory)
    }
    if (newSearch.trim()) {
      params.set('search', newSearch.trim())
    }
    if (newSortField) {
      params.set('sort', newSortField)
      params.set('order', newSortOrder)
    }
    if (newPage > 1) {
      params.set('page', newPage.toString())
    }
    const queryString = params.toString()
    const newUrl = queryString ? `/dashboard/articles?${queryString}` : '/dashboard/articles'
    router.push(newUrl, { scroll: false })
  }

  // 处理排序
  const handleSort = (field: 'publishedAt' | 'updatedAt' | 'viewCount') => {
    if (sortField === field) {
      // 如果点击同一列，切换排序顺序
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      setSortOrder(newOrder)
    } else {
      // 如果点击不同列，设置为该列，默认降序
      setSortField(field)
      setSortOrder('desc')
    }
    setCurrentPage(1) // 排序时重置到第一页
  }

  useEffect(() => {
    setCurrentPage(1) // 切换筛选条件、搜索或排序时重置到第一页
  }, [filter, categoryFilter, searchQuery, sortField, sortOrder])

  useEffect(() => {
    updateUrlParams(filter, categoryFilter, currentPage, searchQuery, sortField, sortOrder) // 更新 URL 参数
  }, [filter, categoryFilter, currentPage, searchQuery, sortField, sortOrder])

  useEffect(() => {
    fetchArticles()
  }, [filter, categoryFilter, currentPage, searchQuery, sortField, sortOrder])

  // 页面加载时，后台自动触发 AI 改写（不等待返回）
  useEffect(() => {
    // 只在管理员用户访问时触发
    if (!user?.isAdmin) {
      return
    }

    // 异步触发 AI 改写，不阻塞页面加载
    const triggerAiRewrite = async () => {
      try {
        // 使用 fetch 但不等待响应，让它在后台运行
        // 注意：这个 API 调用会在后台处理待改写的文章，可能需要较长时间
        fetch('/api/articles/ai-rewrite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // 不等待响应，立即返回，让任务在后台运行
        }).catch((error) => {
          // 静默处理错误，不影响用户体验
          console.log('[AI Rewrite] Background task triggered (may fail silently):', error)
        })
        console.log('[AI Rewrite] Background task triggered')
      } catch (error) {
        // 静默处理错误
        console.log('[AI Rewrite] Error triggering background task:', error)
      }
    }

    // 延迟一小段时间，确保页面先加载完成
    const timer = setTimeout(() => {
      triggerAiRewrite()
    }, 1000)

    return () => clearTimeout(timer)
  }, [user?.isAdmin]) // 依赖管理员状态，只在管理员访问时执行

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'published') {
        params.append('published', 'true')
      } else if (filter === 'draft') {
        params.append('published', 'false')
      }
      if (categoryFilter !== 'all') {
        params.append('categoryId', categoryFilter)
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }
      if (sortField) {
        params.append('sort', sortField)
        params.append('order', sortOrder)
      }
      params.append('page', currentPage.toString())
      params.append('limit', '10')

      const response = await fetch(`/api/articles?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setArticles(data.articles)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        fetchArticles()
      } else {
        alert('删除失败：' + data.error)
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('删除失败')
    }
  }

  const handleResetCooldown = async (id: number) => {
    if (!confirm('确定要重新生成这篇文章的 AI 内容吗？这将把文章状态重置为"待处理"，AI 将在几分钟内重新生成内容、搜索图片并尝试自动发布。')) {
      return
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'resetCooldown' }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('冷却时间已重置，文章已设置为待处理状态')
        fetchArticles() // 刷新列表
      } else {
        toast.error('重置失败：' + data.error)
      }
    } catch (error) {
      console.error('Error resetting cooldown:', error)
      toast.error('重置失败')
    }
  }

  // 刷新单个文章的缓存
  const handleRevalidateCache = async (slug: string, title: string) => {
    try {
      // 优先使用 tag 重新验证（更可靠）
      const tagUrl = `/api/revalidate?tag=article-${slug}`
      const tagResponse = await fetch(tagUrl, { method: 'POST' })
      const tagData = await tagResponse.json()

      // 同时清除路径缓存（作为备用）
      const pathUrl = `/api/revalidate?path=/${slug}`
      await fetch(pathUrl, { method: 'POST' })

      if (tagResponse.ok) {
        toast.success(`"${title}" 的缓存已刷新，通常几秒内生效。如未看到更新，请硬刷新浏览器（Ctrl+F5）`)
      } else {
        toast.warning(`"${title}" 的缓存刷新可能未完全生效`)
      }
    } catch (error) {
      console.error('Error revalidating cache:', error)
      toast.error('刷新缓存失败')
    }
  }

  // 批量刷新当前页所有已发布文章的缓存
  const handleBatchRevalidateCache = async () => {
    const publishedArticles = articles.filter((article) => article.published)

    if (publishedArticles.length === 0) {
      toast.warning('当前页面没有已发布的文章')
      return
    }

    if (!confirm(`确定要刷新当前页面 ${publishedArticles.length} 篇已发布文章的缓存吗？`)) {
      return
    }

    try {
      let successCount = 0
      let failCount = 0

      // 并行刷新所有文章的缓存
      const promises = publishedArticles.map(async (article) => {
        try {
          // 优先使用 tag 重新验证
          const tagUrl = `/api/revalidate?tag=article-${article.slug}`
          const tagResponse = await fetch(tagUrl, { method: 'POST' })

          // 同时清除路径缓存
          await fetch(`/api/revalidate?path=/${article.slug}`, { method: 'POST' })

          if (tagResponse.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          console.error(`Error revalidating cache for ${article.slug}:`, error)
          failCount++
        }
      })

      await Promise.all(promises)

      // 清除所有文章列表缓存
      await fetch('/api/revalidate?tag=all-posts', { method: 'POST' })

      if (failCount === 0) {
        toast.success(`成功刷新 ${successCount} 篇文章的缓存，通常几秒内生效。如未看到更新，请硬刷新浏览器（Ctrl+F5）`)
      } else {
        toast.warning(`刷新完成：成功 ${successCount} 篇，失败 ${failCount} 篇。如未看到更新，请硬刷新浏览器（Ctrl+F5）`)
      }
    } catch (error) {
      console.error('Error batch revalidating cache:', error)
      toast.error('批量刷新缓存失败')
    }
  }

  // 检查文章是否在冷却期内（24小时内处理过）
  const isInCooldown = (aiRewriteAt: string | null): boolean => {
    if (!aiRewriteAt) return false
    const lastProcessed = new Date(aiRewriteAt)
    const now = new Date()
    const hoursSinceLastProcess = (now.getTime() - lastProcessed.getTime()) / (1000 * 60 * 60)
    return hoursSinceLastProcess < 24
  }

  // 处理快捷创建文章
  const handleQuickCreate = async () => {
    if (!quickCreateTitles.trim()) {
      toast.warning('请输入至少一个文章标题')
      return
    }

    if (!quickCreateCategory) {
      toast.warning('请选择一个分类')
      return
    }

    // 解析标题（支持换行或逗号分隔）
    const titles = quickCreateTitles
      .split(/[\n,，]/)
      .map((title) => title.trim())
      .filter((title) => title.length > 0)

    if (titles.length === 0) {
      toast.warning('请输入至少一个有效的文章标题')
      return
    }

    setQuickCreateLoading(true)
    try {
      const response = await fetch('/api/articles/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titles,
          categoryId: parseInt(quickCreateCategory, 10),
          articleMode: quickCreateMode,
        }),
      })

      const data = await response.json()

    } catch (error) {
      console.error('Error creating articles:', error)
      toast.error('创建失败')
    } finally {
      setQuickCreateLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  return (
    <DashboardLayout title="文章管理" isFullWidth={true}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-neutral-900">文章管理</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuickCreateModal(true)}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              快捷文章
            </button>
            <Link
              href="/dashboard/articles/new"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              + 新建文章
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'published'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              已发布
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'draft'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              草稿
            </button>

            {/* 批量刷新缓存按钮 */}
            {articles.some((article) => article.published) && (
              <button
                onClick={handleBatchRevalidateCache}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-2"
                title="刷新当前页面所有已发布文章的缓存"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新缓存
              </button>
            )}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm"
          >
            <option value="all">所有分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* 搜索框 */}
          <div className="flex-1 sm:max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1) // 搜索时重置到第一页
                  }
                }}
                placeholder="搜索文章标题、描述或内容..."
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
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">加载中...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-neutral-600 mb-4">暂无文章</p>
          <Link
            href="/dashboard/articles/new"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            创建第一篇文章 →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-visible">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-16">
                    缩略图
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    标题
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                    分类
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-20">
                    状态
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-28">
                    AI 处理
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-20">
                    <button
                      onClick={() => handleSort('viewCount')}
                      className="flex items-center gap-1 hover:text-neutral-700 transition-colors"
                    >
                      浏览量
                      {sortField === 'viewCount' && (
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-28">
                    <button
                      onClick={() => handleSort('publishedAt')}
                      className="flex items-center gap-1 hover:text-neutral-700 transition-colors"
                    >
                      发布时间
                      {sortField === 'publishedAt' && (
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-28">
                    <button
                      onClick={() => handleSort('updatedAt')}
                      className="flex items-center gap-1 hover:text-neutral-700 transition-colors"
                    >
                      更新时间
                      {sortField === 'updatedAt' && (
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
                  <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider w-32">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-neutral-50 relative">
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="w-12 h-9 bg-neutral-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 如果图片加载失败，隐藏图片，显示占位符
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : null}
                        {!article.coverImage && (
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-sm font-medium text-neutral-900 truncate">{article.title}</div>
                            {article.articleMode && (
                              <span className={`px-1.5 py-0.5 text-xs rounded flex-shrink-0 ${article.articleMode === 'ai-generate' ? 'bg-purple-100 text-purple-800' :
                                article.articleMode === 'ai-rewrite' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                {article.articleMode === 'ai-generate' ? 'AI生成' :
                                  article.articleMode === 'ai-rewrite' ? 'AI改写' :
                                    '手动'}
                              </span>
                            )}
                            {article.featured && (
                              <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded flex-shrink-0">
                                精选
                              </span>
                            )}
                          </div>
                          {article.description && (
                            <div className="text-xs text-neutral-500 truncate max-w-[200px] mt-0.5">
                              {article.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-xs text-neutral-600">{article.category.name}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {article.published ? (
                        <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                          已发布
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-xs bg-neutral-100 text-neutral-800 rounded">
                          草稿
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {article.aiRewriteStatus ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${article.aiRewriteStatus === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : article.aiRewriteStatus === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : article.aiRewriteStatus === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                              {article.aiRewriteStatus === 'pending'
                                ? '待处理'
                                : article.aiRewriteStatus === 'processing'
                                  ? '处理中'
                                  : article.aiRewriteStatus === 'completed'
                                    ? '已完成'
                                    : article.aiRewriteStatus === 'failed'
                                      ? '失败'
                                      : article.aiRewriteStatus}
                            </span>
                            {article.aiRewriteStatus !== 'processing' && (
                              <button
                                onClick={() => handleResetCooldown(article.id)}
                                className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                                title="重新触发 AI 生成/改写流程"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            )}
                          </div>
                          {/* 显示处理时间：只在有 aiRewriteAt 时显示（即已开始处理、完成或失败） */}
                          {article.aiRewriteAt && (
                            <span className="text-xs text-neutral-500">
                              {new Date(article.aiRewriteAt).toLocaleString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {/* 只在失败状态且处于冷却期时显示"冷却中" */}
                              {article.aiRewriteStatus === 'failed' && isInCooldown(article.aiRewriteAt) && (
                                <span className="ml-1 text-orange-600">(冷却中)</span>
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-600">
                      {article.viewCount}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-600">
                      {formatDate(article.publishedAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-600">
                      {formatDate(article.updatedAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium relative z-10">
                      <div className="flex items-center justify-end gap-1.5 relative z-10">
                        <Link
                          href={`/dashboard/articles/${article.id}?${new URLSearchParams({
                            ...(filter !== 'all' && { filter }),
                            ...(categoryFilter !== 'all' && { category: categoryFilter }),
                            ...(currentPage > 1 && { page: currentPage.toString() }),
                          }).toString()}`}
                          className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors relative z-10"
                          title="编辑文章"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        {article.published && (
                          <>
                            <Link
                              href={`/${article.slug}`}
                              target="_blank"
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors relative z-10"
                              title="查看文章"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRevalidateCache(article.slug, article.title)
                              }}
                              className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors relative z-10"
                              title="刷新缓存"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(article.id)
                          }}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors relative z-10"
                          title="删除文章"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 分页组件 */}
      {!loading && articles.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
          <div className="text-sm text-neutral-600">
            显示第 {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} 条，共 {pagination.total} 条
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.hasPrev
                ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
            >
              上一页
            </button>

            {/* 页码按钮 */}
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
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
              disabled={!pagination.hasNext}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.hasNext
                ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {showQuickCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowQuickCreateModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* 头部 */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">快捷创建文章</h2>
              <button
                onClick={() => setShowQuickCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  文章标题 <span className="text-neutral-500">(每行一个或逗号分隔)</span>
                </label>
                <textarea
                  value={quickCreateTitles}
                  onChange={(e) => setQuickCreateTitles(e.target.value)}
                  placeholder={`请输入文章标题，每行一个或使用逗号分隔
例如：
Best Time to Visit Japan
Best Time to Visit Korea
Best Time to Visit Thailand`}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={8}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  已输入 {quickCreateTitles.split(/[\n,，]/).filter(t => t.trim().length > 0).length} 个标题
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  分类 <span className="text-red-500">*</span>
                </label>
                <select
                  value={quickCreateCategory}
                  onChange={(e) => setQuickCreateCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">请选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  文章模式
                </label>
                <select
                  value={quickCreateMode}
                  onChange={(e) => setQuickCreateMode(e.target.value as 'manual' | 'ai-rewrite' | 'ai-generate')}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="manual">手动编辑</option>
                  <option value="ai-rewrite">AI 改写（从参考内容）</option>
                  <option value="ai-generate">AI 生成（从标题）</option>
                </select>
                <p className="mt-1 text-xs text-neutral-500">
                  {quickCreateMode === 'manual' && '创建后需要手动编辑内容'}
                  {quickCreateMode === 'ai-rewrite' && '创建后需要在编辑页面提供参考内容，然后使用 AI 改写'}
                  {quickCreateMode === 'ai-generate' && '创建后可以在编辑页面直接使用 AI 生成完整文章和配图'}
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>提示：</strong>提交后将自动创建多篇文章，系统会自动生成 slug。创建的文章将作为草稿保存。
                  {quickCreateMode === 'ai-generate' && (
                    <span className="block mt-1">选择"AI 生成"模式后，创建的文章可以在编辑页面直接使用 AI 生成完整内容和配图。</span>
                  )}
                  {quickCreateMode === 'ai-rewrite' && (
                    <span className="block mt-1">选择"AI 改写"模式后，创建的文章需要在编辑页面提供参考内容，然后使用 AI 改写功能。</span>
                  )}
                  {quickCreateMode === 'manual' && (
                    <span className="block mt-1">选择"手动编辑"模式后，您可以在编辑页面手动完善内容。</span>
                  )}
                </p>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowQuickCreateModal(false)
                  setQuickCreateTitles('')
                  setQuickCreateCategory('')
                  setQuickCreateMode('manual')
                }}
                className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
                disabled={quickCreateLoading}
              >
                取消
              </button>
              <button
                onClick={handleQuickCreate}
                disabled={quickCreateLoading || !quickCreateTitles.trim() || !quickCreateCategory}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {quickCreateLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    创建文章
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

