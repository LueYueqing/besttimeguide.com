'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  content: string
  categoryId: number
  metaTitle: string | null
  metaDescription: string | null
  keywords: string | null
  tags: string[]
  featured: boolean
  published: boolean
  publishedAt: string | null
  sourceContent: string | null
  aiRewriteStatus: string | null
  aiRewriteAt: string | null
}

interface ArticleEditorProps {
  categories: Category[]
  article?: Article
}

export default function ArticleEditor({ categories, article }: ArticleEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiRewriteLoading, setAiRewriteLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    description: article?.description || '',
    content: article?.content || '',
    categoryId: article?.categoryId.toString() || '',
    metaTitle: article?.metaTitle || '',
    metaDescription: article?.metaDescription || '',
    keywords: article?.keywords || '',
    tags: article?.tags?.join(', ') || '',
    featured: article?.featured || false,
    published: article?.published || false,
    publishedAt: article?.publishedAt
      ? new Date(article.publishedAt).toISOString().slice(0, 16)
      : '',
    sourceContent: article?.sourceContent || '',
  })

  // 自动生成slug
  useEffect(() => {
    if (!article && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.title, article])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
        tags: tagsArray,
        publishedAt: formData.publishedAt || null,
      }

      const url = article ? `/api/articles/${article.id}` : '/api/articles'
      const method = article ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/dashboard/articles')
        router.refresh()
      } else {
        alert('保存失败：' + data.error)
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAiRewrite = async () => {
    if (!article || !formData.sourceContent) {
      alert('请先填写参考范本内容')
      return
    }

    if (!confirm('确定要标记此文章为 AI 改写状态吗？这将更新文章的 AI 改写状态和时间。')) {
      return
    }

    setAiRewriteLoading(true)
    try {
      const response = await fetch(`/api/articles/${article.id}/ai-rewrite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceContent: formData.sourceContent,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('文章已标记为 AI 改写状态')
        router.refresh()
      } else {
        alert('操作失败：' + data.error)
      }
    } catch (error) {
      console.error('Error marking AI rewrite:', error)
      alert('操作失败')
    } finally {
      setAiRewriteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-neutral-900">
              {article ? '编辑文章' : '新建文章'}
            </h1>
            <Link
              href="/dashboard/articles"
              className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              返回列表
            </Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                pattern="[a-z0-9-]+"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="url-friendly-slug"
              />
              <p className="mt-1 text-xs text-neutral-500">只能包含小写字母、数字和连字符</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="文章摘要..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                分类 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">标签</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="用逗号分隔，例如：travel, japan, guide"
              />
            </div>
          </div>

          {/* Source Content (Reference Template) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700">
                参考范本（原文）
              </label>
              {article && (
                <button
                  type="button"
                  onClick={handleAiRewrite}
                  disabled={aiRewriteLoading || !formData.sourceContent}
                  className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {aiRewriteLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>处理中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>标记为 AI 改写</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              value={formData.sourceContent}
              onChange={(e) => setFormData({ ...formData, sourceContent: e.target.value })}
              rows={15}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="在这里输入参考范本或原文，可用于 AI 生成正式文章内容..."
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                参考范本/原文内容，将用于 AI 生成正式文章内容。此字段为可选。
              </p>
              {article?.aiRewriteStatus && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">AI 改写状态：</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    article.aiRewriteStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    article.aiRewriteStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                    article.aiRewriteStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.aiRewriteStatus === 'pending' ? '待处理' :
                     article.aiRewriteStatus === 'processing' ? '处理中' :
                     article.aiRewriteStatus === 'completed' ? '已完成' :
                     article.aiRewriteStatus === 'failed' ? '失败' : article.aiRewriteStatus}
                  </span>
                  {article.aiRewriteAt && (
                    <span className="text-xs text-neutral-400">
                      {new Date(article.aiRewriteAt).toLocaleString('zh-CN')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              内容 (Markdown) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={20}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="# 标题&#10;&#10;文章内容使用 Markdown 格式..."
            />
            <p className="mt-1 text-xs text-neutral-500">
              支持 Markdown 格式。阅读时间将自动计算。
            </p>
          </div>

          {/* SEO */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">SEO 设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">SEO 标题</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="留空则使用文章标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">SEO 描述</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="留空则使用文章描述"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">关键词</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="用逗号分隔"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">选项</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-neutral-700">设为精选文章</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-neutral-700">立即发布</span>
              </label>

              {formData.published && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">发布时间</label>
                  <input
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Link
              href="/dashboard/articles"
              className="px-6 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

