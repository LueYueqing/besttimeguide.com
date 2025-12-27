'use client'

import { useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'

export function AiTriggerWrapper() {
  const { user } = useUser()
  
  useEffect(() => {
    // 检查日期和管理员状态
    const currentDate = new Date()
    const deadline = new Date('2026-03-01')
    const isBeforeDeadline = currentDate < deadline
    
    if (!user?.isAdmin || !isBeforeDeadline) return
    
    console.log('[AI Trigger] 管理员访问首页，触发自动AI改写任务')

    // 异步触发 AI 改写，不阻塞页面加载
    const triggerAiRewrite = async () => {
      try {
        // 使用 fetch 但不等待响应，让它在后台运行
        fetch('/api/articles/ai-rewrite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // 不等待响应，立即返回，让任务在后台运行
        }).catch((error) => {
          // 静默处理错误，不影响用户体验
          console.log('[AI Trigger] Background task triggered (may fail silently):', error)
        })
        console.log('[AI Trigger] AI改写任务已触发')
      } catch (error) {
        // 静默处理错误
        console.log('[AI Trigger] Error triggering background task:', error)
      }
    }

    // 延迟一小段时间，确保页面先加载完成
    const timer = setTimeout(() => {
      triggerAiRewrite()
    }, 2000) // 延迟2秒，确保页面完全加载

    return () => clearTimeout(timer)
  }, [user?.isAdmin])

  return null // 不渲染任何UI
}