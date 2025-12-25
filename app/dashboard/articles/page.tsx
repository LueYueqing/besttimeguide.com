import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import ArticlesClient from './articles-client'

const prisma = new PrismaClient()

export const metadata: Metadata = {
  title: 'Articles Management | besttimeguide.com',
  description: 'Manage articles and content',
}

export default async function ArticlesPage() {
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

  // 获取分类列表
  const categories = await prisma.category.findMany({
    orderBy: {
      order: 'asc',
    },
  })

  return <ArticlesClient categories={categories} />
}

