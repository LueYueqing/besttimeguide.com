'use client'

import { useEffect } from 'react'

export default function ArticleViewTracker({ slug }: { slug: string }) {
    useEffect(() => {
        // 简单的去重逻辑：本次会话内不重复计次
        const viewedKey = `viewed_${slug}`
        if (typeof window !== 'undefined' && sessionStorage.getItem(viewedKey)) {
            return
        }

        const incrementView = async () => {
            try {
                await fetch(`/api/articles/${slug}/view`, {
                    method: 'POST',
                })
                // 标记为已访问
                sessionStorage.setItem(viewedKey, 'true')
            } catch (error) {
                console.error('Failed to track view:', error)
            }
        }

        // 延迟 2 秒后才计入浏览，排除误点
        const timer = setTimeout(incrementView, 2000)

        return () => clearTimeout(timer)
    }, [slug])

    return null
}
