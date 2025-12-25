import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../components/Navigation'
import Footer from '../../../components/Footer'
import { getPostBySlug, getAllPosts } from '@/lib/blog'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | besttimeguide.com Blog`,
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
      canonical: `https://besttimeguide.com/blog/${slug}`,
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const allPosts = await getAllPosts()
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && (p.category === post.category || p.tags.some((tag) => post.tags.includes(tag))))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />

      {/* Article Header */}
      <article className="pt-20 pb-8 lg:pt-24 lg:pb-12">
        <div className="container max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-neutral-600">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-primary-600">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">{post.title}</span>
          </nav>

          {/* Article Meta */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                post.category === 'Tutorial' ? 'bg-success-100 text-success-700' :
                post.category === 'Guide' ? 'bg-primary-100 text-primary-700' :
                post.category === 'Case Study' ? 'bg-accent-100 text-accent-700' :
                'bg-neutral-100 text-neutral-700'
              }`}>
                {post.category}
              </span>
              <span className="text-neutral-500 text-sm">{post.readingTime} min read</span>
              <span className="text-neutral-500 text-sm">
                {formatDate(post.date)}
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-4">
              {post.title}
            </h1>

            <p className="text-xl text-neutral-700 mb-4">
              {post.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <span>By {post.author}</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-8">
              {post.tags.map((tag) => (
                <span key={tag} className="text-sm bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="container max-w-6xl mx-auto">
          <div className="card p-8 lg:p-12 prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-black text-neutral-900 mt-8 mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-neutral-900 mt-6 mb-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-neutral-900 mt-4 mb-2" {...props} />,
                p: ({ node, ...props }) => <p className="text-neutral-700 mb-4 leading-relaxed" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-neutral-700" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-neutral-700" {...props} />,
                li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                a: ({ node, ...props }) => <a className="text-primary-600 hover:text-primary-700 underline" {...props} />,
                code: ({ node, ...props }) => <code className="bg-neutral-100 text-primary-600 px-2 py-1 rounded text-sm" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary-600 pl-4 italic text-neutral-600 my-4" {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container max-w-6xl mx-auto mt-12">
          <div className="card p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Create Your QR Code?</h2>
            <p className="text-primary-100 mb-6">
              Put what you've learned into practice. Generate your first QR code in minutes.
            </p>
            <Link
              href="/"
              className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg font-bold inline-block"
            >
              Start Generating QR Codes
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="container max-w-6xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="card p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                      {relatedPost.category}
                    </span>
                    <span className="text-neutral-500 text-xs">{relatedPost.readingTime} min</span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{relatedPost.title}</h3>
                  <p className="text-neutral-700 text-sm">{relatedPost.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer variant="full" />
    </div>
  )
}

