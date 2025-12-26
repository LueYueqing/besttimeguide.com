'use client'

import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'

interface EditArticleButtonProps {
    articleId: number
}

export default function EditArticleButton({ articleId }: EditArticleButtonProps) {
    const { user } = useUser()

    if (!user?.isAdmin) {
        return null
    }

    return (
        <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
            <Link
                href={`/dashboard/articles/${articleId}`}
                target="_blank"
                className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full shadow-2xl hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all font-semibold text-sm group ring-1 ring-white/10"
            >
                <svg
                    className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Article</span>
            </Link>
        </div>
    )
}
