'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import TurndownService from 'turndown'
import { useToast } from '@/components/Toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
  articleMode: string | null
  coverImage: string | null
}

interface ArticleEditorProps {
  categories: Category[]
  article?: Article
}

export default function ArticleEditor({ categories, article }: ArticleEditorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [aiRewriteLoading, setAiRewriteLoading] = useState(false)
  const [aiGenerateLoading, setAiGenerateLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [customPrompt, setCustomPrompt] = useState('') // 临时自定义提示词

  // 初始化 Turndown 服务（HTML 转 Markdown）
  const turndownServiceRef = useRef<TurndownService | null>(null)

  useEffect(() => {
    if (!turndownServiceRef.current) {
      const turndownService = new TurndownService({
        headingStyle: 'atx', // 使用 # 格式的标题
        codeBlockStyle: 'fenced', // 使用 ``` 格式的代码块
        bulletListMarker: '-', // 使用 - 作为列表标记
      })

      // 配置图片规则，确保图片被正确转换
      turndownService.addRule('images', {
        filter: 'img',
        replacement: (content: string, node: any) => {
          const img = node as HTMLImageElement
          const alt = img.alt || img.title || img.getAttribute('alt') || ''
          const src = img.src || img.getAttribute('src') || ''
          if (src) {
            return `![${alt}](${src})`
          }
          return ''
        },
      })

      // 移除 script 和 style 标签
      turndownService.remove(['script', 'style', 'noscript'])

      turndownServiceRef.current = turndownService
    }
  }, [])
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
    coverImage: article?.coverImage || '',
    articleMode: article?.articleMode || 'manual',
  })

  // 上传图片函数
  const uploadImage = async (file: File, shouldResize = false): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const url = shouldResize ? '/api/upload?resize=true' : '/api/upload'
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.error || '上传失败')
    }
    return data.url
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadImage(file, true)
      setFormData(prev => ({ ...prev, coverImage: url }))
      toast.success('缩略图上传成功')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('上传失败')
    }
  }

  const handleCoverPaste = async (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData
    if (clipboardData.files && clipboardData.files.length > 0) {
      const file = clipboardData.files[0]
      if (file.type.startsWith('image/')) {
        e.preventDefault()
        try {
          const url = await uploadImage(file, true)
          setFormData(prev => ({ ...prev, coverImage: url }))
          toast.success('缩略图已粘贴并上传')
        } catch (error) {
          console.error('Cover paste failed:', error)
          toast.error('缩略图粘贴上传失败')
        }
      }
    }
  }

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
        // 对于 AI 生成模式，如果没有内容，允许保存空内容
        content: formData.articleMode === 'ai-generate' && !formData.content ? '' : formData.content,
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
        toast.success('文章保存成功')
        // 构建返回 URL，保留筛选参数
        const returnParams = new URLSearchParams()
        const filter = searchParams.get('filter')
        const category = searchParams.get('category')
        const page = searchParams.get('page')
        if (filter) returnParams.set('filter', filter)
        if (category) returnParams.set('category', category)
        if (page) returnParams.set('page', page)
        const returnUrl = returnParams.toString()
          ? `/dashboard/articles?${returnParams.toString()}`
          : '/dashboard/articles'
        router.push(returnUrl)
        router.refresh()
      } else {
        toast.error('保存失败：' + data.error)
      }
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAiRewrite = async () => {
    if (!article || !formData.sourceContent) {
      toast.warning('请先填写参考范本内容')
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
        toast.success('文章已标记为 AI 改写状态')
        router.refresh()
      } else {
        toast.error('操作失败：' + data.error)
      }
    } catch (error) {
      console.error('Error marking AI rewrite:', error)
      toast.error('操作失败')
    } finally {
      setAiRewriteLoading(false)
    }
  }

  const handleAiGenerate = async () => {
    if (!formData.title || !formData.categoryId) {
      toast.warning('请先填写标题和分类')
      return
    }

    // 如果文章还未创建，先保存
    if (!article) {
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
          content: '', // AI 生成模式，内容为空
        }

        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (data.success) {
          // 保存成功后，使用新创建的文章ID进行生成
          const newArticleId = data.article.id
          
          if (!confirm('文章已创建，确定要使用 AI 生成文章内容吗？这将根据标题和分类生成完整的文章（包括配图）。')) {
            setLoading(false)
            router.push(`/dashboard/articles/${newArticleId}`)
            return
          }

          setAiGenerateLoading(true)
          try {
            const generateResponse = await fetch('/api/articles/ai-generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                articleId: newArticleId,
                customPrompt: customPrompt.trim() || undefined,
              }),
            })

            const generateData = await generateResponse.json()

            if (generateData.success) {
              toast.success('文章生成成功！')
              router.push(`/dashboard/articles/${newArticleId}`)
              router.refresh()
            } else {
              toast.error('生成失败：' + (generateData.error || 'Unknown error'))
              router.push(`/dashboard/articles/${newArticleId}`)
            }
          } catch (error) {
            console.error('Error generating article:', error)
            toast.error('生成失败')
            router.push(`/dashboard/articles/${newArticleId}`)
          } finally {
            setAiGenerateLoading(false)
            setLoading(false)
          }
        } else {
          toast.error('保存失败：' + data.error)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error saving article:', error)
        toast.error('保存失败')
        setLoading(false)
      }
      return
    }

    if (!confirm('确定要使用 AI 生成文章内容吗？这将根据标题和分类生成完整的文章（包括配图）。')) {
      return
    }

    setAiGenerateLoading(true)
    try {
      const response = await fetch('/api/articles/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: article.id,
          customPrompt: customPrompt.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('文章生成成功！')
        // 更新表单数据
        setFormData(prev => ({
          ...prev,
          content: data.article.content || prev.content,
          coverImage: data.article.coverImage || prev.coverImage,
        }))
        router.refresh()
      } else {
        toast.error('生成失败：' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error generating article:', error)
      toast.error('生成失败')
    } finally {
      setAiGenerateLoading(false)
    }
  }

  // 处理粘贴事件：自动将 HTML 转换为 Markdown，或上传粘贴的图片
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>, fieldName: 'sourceContent' | 'content') => {
    const clipboardData = e.clipboardData

    // 1. 处理图片粘贴
    if (clipboardData.files && clipboardData.files.length > 0) {
      const file = clipboardData.files[0]
      if (file.type.startsWith('image/')) {
        e.preventDefault()
        const textarea = e.currentTarget
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const currentValue = formData[fieldName] || ''

        // 插入占位符
        const placeholder = `![Uploading ${file.name}...]()`
        let newValue = currentValue.substring(0, start) + placeholder + currentValue.substring(end)

        setFormData(prev => ({ ...prev, [fieldName]: newValue }))

        try {
          const url = await uploadImage(file, true)
          const markdown = `![${file.name}](${url})`
          newValue = currentValue.substring(0, start) + markdown + currentValue.substring(end)
          setFormData(prev => ({ ...prev, [fieldName]: newValue }))
        } catch (error) {
          toast.error('图片上传失败')
          // 恢复原状
          setFormData(prev => ({ ...prev, [fieldName]: currentValue }))
        }
        return
      }
    }

    // 2. 处理 HTML 内容

    // 优先获取 HTML 格式，如果没有则获取纯文本
    const htmlContent = clipboardData.getData('text/html')
    const plainText = clipboardData.getData('text/plain')

    // 检测是否包含 HTML 标签
    if (htmlContent && (htmlContent.includes('<') && htmlContent.includes('>'))) {
      e.preventDefault() // 阻止默认粘贴行为

      if (turndownServiceRef.current) {
        try {
          // 转换 HTML 为 Markdown
          const markdown = turndownServiceRef.current.turndown(htmlContent)

          // 获取当前光标位置
          const textarea = e.currentTarget
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const currentValue = formData[fieldName] || ''

          // 插入转换后的 Markdown 内容
          const newValue =
            currentValue.substring(0, start) +
            markdown +
            currentValue.substring(end)

          setFormData(prev => ({ ...prev, [fieldName]: newValue }))

          // 设置光标位置到插入内容之后
          setTimeout(() => {
            const newCursorPos = start + markdown.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
            textarea.focus()
          }, 0)
        } catch (error) {
          console.error('Error converting HTML to Markdown:', error)
          // 如果转换失败，使用纯文本
          const textarea = e.currentTarget
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const currentValue = formData[fieldName] || ''
          const newValue =
            currentValue.substring(0, start) +
            plainText +
            currentValue.substring(end)
          setFormData(prev => ({ ...prev, [fieldName]: newValue }))
        }
      }
    }
    // 如果是纯文本，使用默认行为（不处理）
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
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {formData.title && (
                  <button
                    type="button"
                    onClick={() => {
                      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(formData.title)}`
                      window.open(searchUrl, '_blank')
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-blue-600 transition-colors rounded hover:bg-neutral-100"
                    title="在 Google 中搜索此标题"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}
              </div>
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

          {/* Article Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              文章创建模式
            </label>
            <select
              value={formData.articleMode}
              onChange={(e) => setFormData({ ...formData, articleMode: e.target.value })}
              disabled={!!article} // 编辑时不可修改
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"
            >
              <option value="manual">手动编辑</option>
              <option value="ai-rewrite">AI 改写（从参考内容）</option>
              <option value="ai-generate">AI 生成（从标题）</option>
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              {formData.articleMode === 'ai-generate' && '选择此模式后，只需填写标题和分类，然后点击"AI 生成"按钮即可生成完整文章'}
              {formData.articleMode === 'ai-rewrite' && '选择此模式后，需要填写参考内容，然后使用 AI 改写功能'}
              {formData.articleMode === 'manual' && '手动编辑文章内容'}
            </p>
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

          {/* AI Generate Section */}
          {formData.articleMode === 'ai-generate' && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-900">AI 生成模式</h3>
                {article && article.aiRewriteStatus && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    article.aiRewriteStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    article.aiRewriteStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                    article.aiRewriteStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.aiRewriteStatus === 'pending' ? '待生成' :
                     article.aiRewriteStatus === 'processing' ? '生成中' :
                     article.aiRewriteStatus === 'completed' ? '已完成' :
                     article.aiRewriteStatus === 'failed' ? '生成失败' : article.aiRewriteStatus}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-blue-800 mb-4">
                填写标题和分类后，点击下方按钮即可使用 AI 生成完整的文章内容（包括配图）。
              </p>

              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-blue-700 hover:text-blue-900">
                  高级选项（自定义提示词）
                </summary>
                <div className="mt-2">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="留空则使用默认提示词模板"
                    rows={3}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="mt-1 text-xs text-blue-600">
                    此提示词仅用于本次生成，不会保存到数据库
                  </p>
                </div>
              </details>

              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={!formData.title || !formData.categoryId || aiGenerateLoading || (article?.aiRewriteStatus === 'processing')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {aiGenerateLoading ? '生成中...' : article?.aiRewriteStatus === 'processing' ? '正在生成...' : '生成文章内容'}
              </button>

              {article?.aiRewriteAt && (
                <p className="mt-2 text-xs text-blue-600">
                  生成时间: {new Date(article.aiRewriteAt).toLocaleString('zh-CN')}
                </p>
              )}
            </div>
          )}

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">缩略图</label>
            <div
              onPaste={handleCoverPaste}
              className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:bg-neutral-50 transition-colors relative"
            >
              {formData.coverImage ? (
                <div className="relative group mx-auto w-full max-w-[375px]">
                  <img src={formData.coverImage} className="w-full h-auto rounded shadow-sm" alt="Cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, coverImage: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="删除缩略图"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-xs px-2 py-1 rounded shadow hover:bg-gray-100">
                      更换
                      <input type="file" onChange={handleCoverUpload} className="hidden" accept="image/*" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <p className="text-neutral-500 mb-2 text-sm">点击上传缩略图 (建议 375x250)</p>
                  <label className="cursor-pointer inline-block px-4 py-2 bg-white border border-neutral-300 rounded shadow-sm hover:bg-neutral-50 text-sm">
                    选择图片
                    <input type="file" onChange={handleCoverUpload} className="hidden" accept="image/*" />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Source Content (Reference Template) - Only for AI Rewrite mode */}
          {formData.articleMode === 'ai-rewrite' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700">
                  参考范本（原文） <span className="text-red-500">*</span>
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
                onPaste={(e) => handlePaste(e, 'sourceContent')}
                rows={15}
                required={formData.articleMode === 'ai-rewrite'}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="在这里输入参考范本或原文，可用于 AI 生成正式文章内容...（支持直接粘贴 HTML 内容，将自动转换为 Markdown）"
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  参考范本/原文内容，将用于 AI 生成正式文章内容。
                </p>
                {article?.aiRewriteStatus && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">AI 改写状态：</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${article.aiRewriteStatus === 'completed' ? 'bg-green-100 text-green-800' :
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
          )}

          {/* Content - For Manual and AI Generate modes */}
          {(formData.articleMode === 'manual' || formData.articleMode === 'ai-generate') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700">
                  文章内容 {formData.articleMode === 'manual' && <span className="text-red-500">*</span>}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'write' ? 'preview' : 'write')}
                    className="px-3 py-1 text-sm bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors"
                  >
                    {activeTab === 'write' ? '预览' : '编辑'}
                  </button>
                </div>
              </div>
              {activeTab === 'write' ? (
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  onPaste={(e) => handlePaste(e, 'content')}
                  rows={20}
                  required={formData.articleMode === 'manual'}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  placeholder="使用 Markdown 格式编写文章内容...（支持直接粘贴 HTML 内容，将自动转换为 Markdown）"
                />
              ) : (
                <div className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-white min-h-[500px] prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content || '*暂无内容*'}</ReactMarkdown>
                </div>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                {formData.articleMode === 'ai-generate' 
                  ? 'AI 生成模式：内容将由 AI 自动生成，生成后可以在此编辑。'
                  : '使用 Markdown 格式编写文章内容'}
              </p>
            </div>
          )}

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

