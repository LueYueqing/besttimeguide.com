import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import ArticleImagesClient from './article-images-client'

const prisma = new PrismaClient()

export const metadata: Metadata = {
  title: 'Article Images Management | besttimeguide.com',
  description: 'Manage article images',
}

export default async function ArticleImagesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/article-images')
  }

  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
  if (isNaN(userId)) {
    redirect('/auth/signin?callbackUrl=/dashboard/article-images')
  }

  // 检查是否为管理员
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    redirect('/dashboard')
  }

  return <ArticleImagesClient />
}
