'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import DashboardLayout from './components/DashboardLayout'
import ArticleStatsCards from './components/ArticleStatsCards'

interface ArticleStats {
  total: number
  published: number
  draft: number
  featured: number
  categories: number
}

interface RecentArticle {
  id: number
  title: string
  slug: string
  publishedAt: string | null
  category: {
    name: string
  }
}

export default function DashboardClient() {
  const { user, loading: userLoading } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ArticleStats>({
    total: 0,
    published: 0,
    draft: 0,
    featured: 0,
    categories: 0,
  })
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([])

  const isAdmin = user?.isAdmin || false

  useEffect(() => {
    if (!userLoading && user) {
      if (isAdmin) {
        fetchStats()
      } else {
        setLoading(false)
      }
    }
  }, [user, userLoading, isAdmin])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/articles/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setRecentArticles(data.recentArticles || [])
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
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

  if (userLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 普通用户视图
  if (!isAdmin) {
    return (
      <DashboardLayout title="个人仪表板">
        {/* 欢迎区域 */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            欢迎回来, {user?.name || user?.email || '用户'}!
          </h1>
          <p className="text-neutral-600">
            这是您的个人仪表板。您可以在这里管理您的账户信息。
          </p>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Link
            href="/dashboard/profile"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">账户设置</h3>
                <p className="text-sm text-neutral-600">管理您的个人信息和偏好设置</p>
              </div>
            </div>
          </Link>

          <Link
            href="/help"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">帮助中心</h3>
                <p className="text-sm text-neutral-600">查看常见问题和联系支持</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 账户信息卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">账户信息</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">邮箱</span>
              <span className="text-neutral-900 font-medium">{user?.email || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">计划</span>
              <span className="text-neutral-900 font-medium">
                {user?.plan === 'PRO' ? 'Pro' : user?.plan === 'ENTERPRISE' ? 'Enterprise' : 'Free'}
              </span>
            </div>
            {user?.subscription && (
              <div className="flex justify-between">
                <span className="text-neutral-600">订阅状态</span>
                <span className={`font-medium ${user.subscription.status === 'ACTIVE' ? 'text-green-600' : 'text-neutral-600'
                  }`}>
                  {user.subscription.status === 'ACTIVE' ? '活跃' : user.subscription.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // 管理员视图
  return (
    <DashboardLayout title="管理仪表板">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">管理仪表板</h1>
        <p className="text-neutral-600 mt-2">管理文章内容和网站数据</p>
      </div>

      {/* 统计卡片 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">加载统计中...</p>
        </div>
      ) : (
        <>
          <ArticleStatsCards stats={stats} />

          {/* 快捷操作 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Link
              href="/dashboard/articles/new"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-primary-500"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">新建文章</h3>
                  <p className="text-sm text-neutral-600">创建一篇新文章</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/articles"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">管理文章</h3>
                  <p className="text-sm text-neutral-600">查看和编辑所有文章</p>
                </div>
              </div>
            </Link>

            <Link
              href="/blog"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">查看前台</h3>
                  <p className="text-sm text-neutral-600">预览已发布的文章</p>
                </div>
              </div>
            </Link>
          </div>

          {/* 最近发布的文章 */}
          {recentArticles.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">最近发布的文章</h2>
              <div className="space-y-3">
                {recentArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/dashboard/articles/${article.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-neutral-900">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-500">{article.category.name}</span>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className="text-xs text-neutral-500">{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <Link
                  href="/dashboard/articles"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  查看所有文章 →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
