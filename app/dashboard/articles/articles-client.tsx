'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
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
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

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
            <Link
              href="/dashboard/articles/new"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              + 新建文章
            </Link>
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
                          {article.aiRewriteAt && (
                            <span className="text-xs text-neutral-500">
                              {new Date(article.aiRewriteAt).toLocaleString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/articles/${article.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          编辑
                        </Link>
                        {article.published && (
                          <Link
                            href={`/${article.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            查看
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
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
    </div>
  )
}

