'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface SearchResult {
  id: number
  slug: string
  title: string
  description: string
  category: string
  coverImage: string | null
  publishedAt: string
  viewCount: number
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  })

  useEffect(() => {
    if (query) {
      performSearch(query, 1)
    }
  }, [query])

  const performSearch = async (searchTerm: string, page: number = 1) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&page=${page}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.articles || [])
        setPagination(data.pagination || pagination)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Error searching:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`)
      performSearch(query, newPage)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search Box */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">Search Results</h1>
          <form onSubmit={handleSubmit} className="wikihow-search-box max-w-2xl">
            <input
              type="search"
              placeholder="Search for best time to..."
              className="wikihow-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="wikihow-search-icon cursor-pointer">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </section>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-neutral-600">Searching...</p>
          </div>
        ) : query ? (
          <>
            {results.length > 0 ? (
              <>
                <div className="mb-4 text-neutral-600">
                  Found {pagination.total} result{pagination.total !== 1 ? 's' : ''} for &quot;{query}&quot;
                </div>
                <div className="space-y-4">
                  {results.map((article) => (
                    <Link
                      key={article.id}
                      href={`/${article.slug}`}
                      className="group block bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md hover:border-wikihow-green-400 transition-all"
                    >
                      <div className="flex flex-col md:flex-row">
                        {article.coverImage && (
                          <div className="w-full md:w-48 h-48 md:h-auto bg-neutral-100 overflow-hidden flex-shrink-0">
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-wikihow-green-100 text-wikihow-green-800 text-xs rounded">
                              {article.category}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                            {article.viewCount > 0 && (
                              <span className="text-xs text-neutral-500">
                                {article.viewCount} views
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-wikihow-linkHover transition-colors">
                            {article.title}
                          </h2>
                          {article.description && (
                            <p className="text-neutral-600 line-clamp-2">
                              {article.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-neutral-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-600 mb-4">No results found for &quot;{query}&quot;</p>
                <p className="text-sm text-neutral-500">Try different keywords or check your spelling.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-600">Enter a search term to find articles.</p>
          </div>
        )}
      </main>

      <Footer variant="full" />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-neutral-600">Loading...</p>
          </div>
        </main>
        <Footer variant="full" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

