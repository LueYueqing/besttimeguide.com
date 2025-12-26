'use client'

interface ArticleStatsCardsProps {
  stats: {
    total: number
    published: number
    draft: number
    featured: number
    categories: number
  }
}

export default function ArticleStatsCards({ stats }: ArticleStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {/* Total Articles */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">总文章数</div>
        <div className="text-2xl font-semibold text-neutral-900">{stats.total}</div>
      </div>

      {/* Published Articles */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">已发布</div>
        <div className="text-2xl font-semibold text-green-600">{stats.published}</div>
      </div>

      {/* Draft Articles */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">草稿</div>
        <div className="text-2xl font-semibold text-yellow-600">{stats.draft}</div>
      </div>

      {/* Featured Articles */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">精选文章</div>
        <div className="text-2xl font-semibold text-purple-600">{stats.featured}</div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">分类数</div>
        <div className="text-2xl font-semibold text-blue-600">{stats.categories}</div>
      </div>
    </div>
  )
}

