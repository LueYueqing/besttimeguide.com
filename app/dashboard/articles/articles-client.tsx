'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useToast } from '@/components/Toast'
import SidebarNavigation from '../components/SidebarNavigation'

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
}

interface ArticlesClientProps {
  categories: Category[]
}

export default function ArticlesClient({ categories }: ArticlesClientProps) {
  const router = useRouter()
  const { user } = useUser()
  const toast = useToast()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false)
  const [quickCreateTitles, setQuickCreateTitles] = useState('')
  const [quickCreateCategory, setQuickCreateCategory] = useState<string>('')
  const [quickCreateLoading, setQuickCreateLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false)
  const [quickCreateTitles, setQuickCreateTitles] = useState('')
  const [quickCreateCategory, setQuickCreateCategory] = useState<string>('')
  const [quickCreateLoading, setQuickCreateLoading] = useState(false)

  useEffect(() => {
    setCurrentPage(1) // 切换筛选条件时重置到第一页
  }, [filter, categoryFilter])

  useEffect(() => {
    fetchArticles()
  }, [filter, categoryFilter, currentPage])

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
    if (!confirm('确定要重置这篇文章的 AI 改写冷却时间吗？这将允许立即重新处理。')) {
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
        toast.success('冷却时间已重置，可以立即重新处理')
        fetchArticles() // 刷新列表
      } else {
        toast.error('重置失败：' + data.error)
      }
    } catch (error) {
      console.error('Error resetting cooldown:', error)
      toast.error('重置失败')
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
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`成功创建 ${data.created} 篇文章`)
        setShowQuickCreateModal(false)
        setQuickCreateTitles('')
        setQuickCreateCategory('')
        fetchArticles() // 刷新列表
      } else {
        toast.error('创建失败：' + data.error)
      }
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
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        {/* 左侧导航栏 */}
        <SidebarNavigation user={user || {}} />

        {/* 主内容区 */}
        <main className="flex-1 w-0 lg:ml-64">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'published'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                已发布
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'draft'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                草稿
              </button>
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    标题
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    AI 处理
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    发布时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    更新时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{article.title}</div>
                          {article.description && (
                            <div className="text-sm text-neutral-500 truncate max-w-md">
                              {article.description}
                            </div>
                          )}
                        </div>
                        {article.featured && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            精选
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-600">{article.category.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.published ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          已发布
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded">
                          草稿
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.aiRewriteStatus ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                article.aiRewriteStatus === 'completed'
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
                            {/* 如果在冷却期内，显示重置按钮 */}
                            {article.aiRewriteAt && isInCooldown(article.aiRewriteAt) && (
                              <button
                                onClick={() => handleResetCooldown(article.id)}
                                className="px-2 py-0.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                                title="重置冷却时间，允许立即重新处理"
                              >
                                重置
                              </button>
                            )}
                          </div>
                          {article.aiRewriteAt && (
                            <span className="text-xs text-neutral-500">
                              {new Date(article.aiRewriteAt).toLocaleString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {isInCooldown(article.aiRewriteAt) && (
                                <span className="ml-1 text-orange-600">(冷却中)</span>
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {formatDate(article.publishedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {formatDate(article.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/articles/${article.id}`}
                          className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                          title="编辑文章"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        {article.published && (
                          <Link
                            href={`/${article.slug}`}
                            target="_blank"
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="查看文章"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pagination.hasPrev
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
                disabled={!pagination.hasNext}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pagination.hasNext
                    ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
              >
                下一页
              </button>
            </div>
          </div>
        )}
          </div>
        </main>
      </div>

      {/* 快捷创建文章弹窗 */}
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

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>提示：</strong>提交后将自动创建多篇文章，系统会自动生成 slug。创建的文章将作为草稿保存，您可以在编辑页面完善内容。
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
    </div>
  )
}

