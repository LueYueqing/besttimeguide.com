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

  useEffect(() => {
    fetchArticles()
  }, [filter, categoryFilter])

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

      const response = await fetch(`/api/articles?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setArticles(data.articles)
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
          </div>
        </main>
      </div>
    </div>
  )
}

