import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import ShareButtons from '../../components/ShareButtons'
import ArticleFeedback from '../../components/ArticleFeedback'
import { getPostBySlug, getAllPosts, type BlogPost } from '@/lib/blog'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

// 完全禁用自动刷新，只使用 on-demand revalidation（按需重新生成）
// 只有在后台主动请求时（文章更新、AI 改写完成）才会重新生成内容
// 这样可以完全避免数据库的定期查询负担
// 注意：不设置 revalidate 或设置为很大的值，配合 on-demand revalidation 使用
export const revalidate = false // Next.js 15 支持 false 来禁用自动刷新

// 允许动态参数：即使 slug 不在 generateStaticParams 中，也会在运行时动态生成
// 这对于构建后新创建的文章很重要，避免 404 错误
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts()
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('[generateStaticParams] Error fetching posts:', error)
    // 如果获取失败，返回空数组，让所有路由都动态生成
    return []
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const postResult = await getPostBySlug(slug)

  // 检查是否是数据库错误或文章不存在
  if (!postResult || ('error' in postResult && postResult.error === 'DATABASE_ERROR')) {
    return {
      title: 'Article Not Found',
    }
  }

  // 此时 postResult 一定是 BlogPost（已经过滤了错误情况）
  const post = postResult as BlogPost

  return {
    title: `${post.title} | besttimeguide.com`,
    description: post.description,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    alternates: {
      canonical: `https://besttimeguide.com/${slug}`,
    },
  }
}

// Helper function to format date safely
function formatDate(dateString: string): string {
  if (!dateString) return 'Date not available'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Date not available'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 提取标题用于生成目录
function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const headings: Array<{ level: number; text: string; id: string }> = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    let text = match[2].trim()

    // 移除 TOC 文本中的 Markdown 格式
    // 移除加粗/斜体 (**text**, __text__, *text*, _text_)
    text = text.replace(/([*_]{1,3})(.*?)\1/g, '$2')
    // 移除链接 [text](url)
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除行内代码 `text`
    text = text.replace(/`([^`]+)`/g, '$1')
    // 移除末尾的 # (标准 Markdown 标题可能以 # 结尾)
    text = text.replace(/\s+#+$/, '')

    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    headings.push({ level, text, id })
  }

  return headings
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  // 使用 unstable_cache 和 cache tag，便于精确控制缓存
  const postResult = await getPostBySlug(slug)

  // 检查是否是数据库连接错误
  if (postResult && 'error' in postResult && postResult.error === 'DATABASE_ERROR') {
    // 数据库连接失败时，Next.js ISR 会自动使用之前生成的静态页面（如果存在）
    // 但如果静态页面不存在或已过期，我们需要显示错误页面
    // 这里我们让 Next.js 的 ISR 机制处理，它会自动使用缓存的静态页面
    // 如果缓存也不存在，则显示 404
    console.warn(`[ArticlePage] Database connection error for ${slug}, ISR will use cached page if available`)
    notFound() // 这会触发 Next.js 使用缓存的静态页面（如果存在）
  }

  // 如果文章不存在
  if (!postResult || 'error' in postResult) {
    notFound()
  }

  const post = postResult

  const allPosts = await getAllPosts()
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && (p.category === post.category || p.tags.some((tag) => post.tags.includes(tag))))
    .slice(0, 6)

  // 处理内容：移除第一个与文章标题相同的 h1 标题，避免重复显示
  let processedContent = post.content
  // 转义标题中的特殊字符，用于正则匹配
  const escapedTitle = post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 匹配开头的 # 标题（可能包含空格和换行）
  const titleRegex = new RegExp(`^#\\s+${escapedTitle}\\s*$`, 'm')
  if (titleRegex.test(processedContent)) {
    processedContent = processedContent.replace(titleRegex, '').trim()
  } else {
    // 如果精确匹配失败，尝试匹配第一个 h1 标题（更宽松的匹配）
    const firstH1Match = processedContent.match(/^#\s+(.+?)\s*$/m)
    if (firstH1Match) {
      const firstH1Text = firstH1Match[1].trim()
      // 如果第一个 h1 标题与文章标题相同，移除它
      if (firstH1Text === post.title) {
        processedContent = processedContent.replace(/^#\s+.+?\s*$/m, '').trim()
      }
    }
  }

  // 提取目录（使用处理后的内容）
  const headings = extractHeadings(processedContent)

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* WikiHow Style Article Layout */}
      <article className="pt-16 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 主内容区域 */}
            <div className="flex-1 lg:max-w-3xl">
              {/* 面包屑导航 */}
              <nav className="mb-4 text-sm text-neutral-600">
                <Link href="/" className="hover:text-primary-600">Home</Link>
                <span className="mx-2">›</span>
                <Link href={`/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary-600">
                  {post.category}
                </Link>
                <span className="mx-2">›</span>
                <span className="text-neutral-900">{post.title}</span>
              </nav>

              {/* 文章标题 */}
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
                {post.title}
              </h1>

              {/* 文章元信息 */}
              <div className="flex items-center gap-4 mb-6 text-sm text-neutral-600 border-b border-neutral-200 pb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>By {post.author}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{post.readingTime} min read</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(post.date)}</span>
                </div>
              </div>

              {/* 文章描述 */}
              {post.description && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <p className="text-neutral-700 leading-relaxed">{post.description}</p>
                </div>
              )}

              {/* 文章内容 */}
              <div className="prose prose-lg max-w-none mb-8">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => {
                      const text = String(props.children)
                      const id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim()
                      return <h1 id={id} className="text-3xl font-bold text-neutral-900 mt-8 mb-4 pt-4 border-t border-neutral-200 first:mt-0 first:pt-0 first:border-t-0" {...props} />
                    },
                    h2: ({ node, ...props }) => {
                      const text = String(props.children)
                      const id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim()
                      return <h2 id={id} className="text-2xl font-bold text-neutral-900 mt-8 mb-4 pt-4 border-t border-neutral-200" {...props} />
                    },
                    h3: ({ node, ...props }) => {
                      const text = String(props.children)
                      const id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim()
                      return <h3 id={id} className="text-xl font-bold text-neutral-900 mt-6 mb-3" {...props} />
                    },
                    p: ({ node, ...props }) => <p className="text-neutral-700 mb-4 leading-relaxed text-base" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-neutral-700 ml-4" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-neutral-700 ml-4" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    a: ({ node, ...props }) => <a className="text-primary-600 hover:text-primary-700 underline" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-neutral-100 text-primary-600 px-2 py-1 rounded text-sm font-mono" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary-500 pl-4 italic text-neutral-600 my-4 bg-neutral-50 py-2" {...props} />,
                    img: ({ node, ...props }) => <img className="rounded-lg my-6 w-full" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-neutral-900" {...props} />,
                  }}
                >
                  {processedContent}
                </ReactMarkdown>
              </div>

              {/* 标签 */}
              {post.tags.length > 0 && (
                <div className="border-t border-neutral-200 pt-6 mb-8">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-neutral-700">Tags:</span>
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 相关文章 */}
              {relatedPosts.length > 0 && (
                <div className="border-t border-neutral-200 pt-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">Related Articles</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        href={`/${relatedPost.slug}`}
                        className="group border border-neutral-200 rounded-lg p-4 hover:shadow-lg transition-all hover:border-primary-300"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded font-medium">
                            {relatedPost.category}
                          </span>
                          <span className="text-neutral-500 text-xs">{relatedPost.readingTime} min read</span>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-neutral-600 text-sm line-clamp-2">{relatedPost.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 右侧边栏 - WikiHow Style */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-20 space-y-6">
                {/* 目录 */}
                {headings.length > 0 && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">Table of Contents</h3>
                    <nav className="space-y-2">
                      {headings.map((heading, index) => (
                        <a
                          key={index}
                          href={`#${heading.id}`}
                          className={`block text-sm hover:text-primary-600 transition-colors ${heading.level === 1 ? 'font-semibold text-neutral-900' :
                              heading.level === 2 ? 'text-neutral-700 ml-4' :
                                'text-neutral-600 ml-8'
                            }`}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* 文章信息卡片 */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">Article Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Category</span>
                      <span className="font-medium text-neutral-900">{post.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Reading Time</span>
                      <span className="font-medium text-neutral-900">{post.readingTime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Published</span>
                      <span className="font-medium text-neutral-900">{formatDate(post.date)}</span>
                    </div>
                    {post.featured && (
                      <div className="pt-2 border-t border-neutral-200">
                        <span className="inline-flex items-center gap-1 text-primary-600 font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Featured Article
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 分享按钮 */}
                <ShareButtons
                  url={`https://besttimeguide.com/${slug}`}
                  title={post.title}
                />

                {/* 文章反馈 */}
                <ArticleFeedback slug={slug} />

                {/* 分类相关文章 */}
                {relatedPosts.length > 0 && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">More from {post.category}</h3>
                    <div className="space-y-4">
                      {relatedPosts.slice(0, 3).map((relatedPost) => (
                        <Link
                          key={relatedPost.slug}
                          href={`/${relatedPost.slug}`}
                          className="block group"
                        >
                          <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{relatedPost.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </article>

      <Footer variant="full" />
    </div>
  )
}
