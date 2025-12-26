'use client'

import { useState, useEffect } from 'react'

interface ArticleFeedbackProps {
  slug: string
}

interface FeedbackStats {
  yes: number
  no: number
  total: number
}

export default function ArticleFeedback({ slug }: ArticleFeedbackProps) {
  const [submitted, setSubmitted] = useState(false)
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // 从 localStorage 检查是否已提交过
  useEffect(() => {
    const feedbackKey = `article_feedback_${slug}`
    const saved = localStorage.getItem(feedbackKey)
    if (saved) {
      setSubmitted(true)
      setHelpful(saved === 'true')
    }
  }, [slug])

  // 加载统计信息
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`/api/articles/${slug}/feedback`)
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error loading feedback stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    loadStats()
  }, [slug])

  const handleSubmit = async (isHelpful: boolean) => {
    if (submitted || loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/articles/${slug}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful: isHelpful }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        setHelpful(isHelpful)
        setStats(data.stats)

        // 保存到 localStorage，防止重复提交
        const feedbackKey = `article_feedback_${slug}`
        localStorage.setItem(feedbackKey, String(isHelpful))
      } else {
        console.error('Error submitting feedback:', data.error)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-bold text-neutral-900 mb-4">
        Did this article help you?
      </h3>

      {!submitted ? (
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Yes
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              Thank you for your feedback! {helpful ? "We're glad this article was helpful." : "We'll use your feedback to improve our content."}
            </span>
          </div>

          {stats && stats.total > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-6 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-600">{stats.yes}</span>
                  <span>found this helpful</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-red-600">{stats.no}</span>
                  <span>did not find this helpful</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {loadingStats && !stats && (
        <div className="mt-4 text-sm text-neutral-500">Loading feedback statistics...</div>
      )}
    </div>
  )
}

