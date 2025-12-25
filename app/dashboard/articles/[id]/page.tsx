import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import ArticleEditor from '../article-editor'

const prisma = new PrismaClient()

interface EditArticlePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditArticlePageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Edit Article #${id} | besttimeguide.com`,
    description: 'Edit article',
  }
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/articles')
  }

  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) {
    redirect('/auth/signin?callbackUrl=/dashboard/articles')
  }

  // 检查是否为管理员
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    redirect('/dashboard')
  }

  const { id } = await params
  const articleId = parseInt(id, 10)

  if (isNaN(articleId)) {
    redirect('/dashboard/articles')
  }

  // 获取文章数据
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!article) {
    redirect('/dashboard/articles')
  }

  // 解析tags
  let tags: string[] = []
  if (article.tags) {
    try {
      tags = JSON.parse(article.tags)
    } catch {
      tags = article.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
    }
  }

  const articleWithTags = {
    ...article,
    tags,
  }

  // 获取分类列表
  const categories = await prisma.category.findMany({
    orderBy: {
      order: 'asc',
    },
  })

  return <ArticleEditor categories={categories} article={articleWithTags} />
}

