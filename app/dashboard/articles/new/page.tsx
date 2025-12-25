import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import ArticleEditor from '../article-editor'

const prisma = new PrismaClient()

export const metadata: Metadata = {
  title: 'New Article | besttimeguide.com',
  description: 'Create a new article',
}

export default async function NewArticlePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/articles/new')
  }

  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) {
    redirect('/auth/signin?callbackUrl=/dashboard/articles/new')
  }

  // 检查是否为管理员
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    redirect('/dashboard')
  }

  // 获取分类列表
  const categories = await prisma.category.findMany({
    orderBy: {
      order: 'asc',
    },
  })

  return <ArticleEditor categories={categories} />
}

