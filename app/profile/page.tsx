import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  // 重定向到 dashboard 内的 profile 页面
  redirect('/dashboard/profile')
}

