'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SidebarNavigation from '../components/SidebarNavigation'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DashboardStats {
  total: number
  active: number
  paused: number
  archived: number
  dynamic: number
  totalScans: number
}

interface AnalyticsData {
  overview: {
    totalScans: number
    activeQRCodes: number
    todayScans: number
    growthRate: number
  }
  timeSeries: Array<{ date: string; scans: number }>
  topQRCodes: {
    byScans: Array<{
      id: number
      title: string
      scanCount: number
      recentScans: number
      lastScanAt: string | null
      createdAt: string
    }>
    byRecent: Array<{
      id: number
      title: string
      scanCount: number
      recentScans: number
      lastScanAt: string | null
      createdAt: string
    }>
    byGrowth: Array<{
      id: number
      title: string
      scanCount: number
      recentScans: number
      lastScanAt: string | null
      createdAt: string
    }>
  }
  deviceAnalysis?: {
    osDistribution: Array<{ os: string; count: number }>
    browserDistribution: Array<{ browser: string; count: number }>
    deviceTypeDistribution: Array<{ type: string; count: number }>
  }
  geoAnalysis?: {
    topCountries: Array<{ country: string; count: number }>
    topCities: Array<{ country: string; city: string; count: number }>
  }
}

export default function AnalyticsClient() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState<'all' | 'active' | 'paused' | 'archived'>('all')
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    paused: 0,
    archived: 0,
    dynamic: 0,
    totalScans: 0,
  })
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  // 处理状态改变：在 analytics 页面，直接跳转到 dashboard 并应用筛选
  const handleStatusChange = (newStatus: 'all' | 'active' | 'paused' | 'archived') => {
    // 使用 replace 而不是 push，避免在历史记录中留下 analytics 页面
    // 这样用户点击返回按钮时会回到之前的页面，而不是 analytics 页面
    router.replace(`/dashboard?status=${newStatus}`)
  }

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/qrcodes?status=all&limit=1')
        const data = await response.json()
        if (data.success) {
          setStats(data.data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    if (user) {
      fetchStats()
    }
  }, [user])

  // 获取分析数据
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`)
        const data = await response.json()
        if (data.success) {
          setAnalyticsData(data.data)
        } else if (data.requiresUpgrade) {
          // 如果是需要升级的错误，已经在服务端重定向了，这里只是备用处理
          router.push('/pricing?feature=analytics')
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [user, timeRange, router])

  if (userLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-neutral-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // 格式化图表数据
  const chartData =
    analyticsData?.timeSeries.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      scans: item.scans,
    })) || []

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 顶部头部栏 */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 text-xl font-semibold text-neutral-900 hover:text-primary-600 transition-colors">
                <Image
                  src="/images/logo-quart.png"
                  alt="besttimeguide.com"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
                <span>besttimeguide.com</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-600">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 左侧导航栏 */}
        <SidebarNavigation status={status} onStatusChange={handleStatusChange} stats={stats} user={user} />

        {/* 主内容区 */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-neutral-900">Analytics Dashboard</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    timeRange === '7d'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    timeRange === '30d'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setTimeRange('90d')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    timeRange === '90d'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  90 Days
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-neutral-600">Loading analytics...</div>
              </div>
            ) : analyticsData ? (
              <>
                {/* 1. 总体概览统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <div className="text-sm text-neutral-600 mb-1">Total Scans</div>
                    <div className="text-3xl font-bold text-neutral-900">
                      {analyticsData.overview.totalScans.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <div className="text-sm text-neutral-600 mb-1">Active QR Codes</div>
                    <div className="text-3xl font-bold text-neutral-900">
                      {analyticsData.overview.activeQRCodes}
                    </div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <div className="text-sm text-neutral-600 mb-1">Today's Scans</div>
                    <div className="text-3xl font-bold text-neutral-900">
                      {analyticsData.overview.todayScans.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <div className="text-sm text-neutral-600 mb-1">Growth Rate</div>
                    <div
                      className={`text-3xl font-bold ${
                        analyticsData.overview.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {analyticsData.overview.growthRate >= 0 ? '+' : ''}
                      {analyticsData.overview.growthRate.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* 2. 时间趋势图表 */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-8">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Scan Trends</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="scans"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 3. 设备类型分析 */}
                {analyticsData.deviceAnalysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* 操作系统分布 */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Operating Systems</h3>
                      {analyticsData.deviceAnalysis.osDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={analyticsData.deviceAnalysis.osDistribution}
                              dataKey="count"
                              nameKey="os"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ os, percent }) => `${os} ${(percent * 100).toFixed(0)}%`}
                            >
                              {analyticsData.deviceAnalysis.osDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-neutral-500 text-sm">No data available</p>
                      )}
                    </div>

                    {/* 浏览器分布 */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Browsers</h3>
                      {analyticsData.deviceAnalysis.browserDistribution.length > 0 ? (
                        <div className="space-y-3">
                          {analyticsData.deviceAnalysis.browserDistribution.slice(0, 5).map((item, index) => {
                            const total = analyticsData.deviceAnalysis!.browserDistribution.reduce((sum, b) => sum + b.count, 0)
                            const percentage = (item.count / total) * 100
                            return (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-neutral-700">{item.browser}</span>
                                  <span className="text-sm text-neutral-600">{item.count} ({percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-neutral-500 text-sm">No data available</p>
                      )}
                    </div>

                    {/* 设备类型分布 */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Device Types</h3>
                      {analyticsData.deviceAnalysis.deviceTypeDistribution.length > 0 ? (
                        <div className="space-y-3">
                          {analyticsData.deviceAnalysis.deviceTypeDistribution.map((item, index) => {
                            const total = analyticsData.deviceAnalysis!.deviceTypeDistribution.reduce((sum, d) => sum + d.count, 0)
                            const percentage = (item.count / total) * 100
                            return (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-neutral-700 capitalize">{item.type}</span>
                                  <span className="text-sm text-neutral-600">{item.count} ({percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      item.type === 'mobile' ? 'bg-green-600' :
                                      item.type === 'tablet' ? 'bg-blue-600' : 'bg-purple-600'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-neutral-500 text-sm">No data available</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. 地理位置分析 */}
                {analyticsData.geoAnalysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top 10 国家 */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Countries</h3>
                      {analyticsData.geoAnalysis.topCountries.length > 0 ? (
                        <div className="space-y-3">
                          {analyticsData.geoAnalysis.topCountries.map((item, index) => {
                            const total = analyticsData.geoAnalysis!.topCountries.reduce((sum, c) => sum + c.count, 0)
                            const percentage = (item.count / total) * 100
                            return (
                              <div key={index} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-neutral-700">{item.country}</span>
                                    <span className="text-sm text-neutral-600">{item.count} ({percentage.toFixed(1)}%)</span>
                                  </div>
                                  <div className="w-full bg-neutral-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-neutral-500 text-sm">No data available</p>
                      )}
                    </div>

                    {/* Top 10 城市 */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Cities</h3>
                      {analyticsData.geoAnalysis.topCities.length > 0 ? (
                        <div className="space-y-3">
                          {analyticsData.geoAnalysis.topCities.map((item, index) => {
                            const total = analyticsData.geoAnalysis!.topCities.reduce((sum, c) => sum + c.count, 0)
                            const percentage = (item.count / total) * 100
                            return (
                              <div key={index} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-neutral-700">
                                      {item.city}, {item.country}
                                    </span>
                                    <span className="text-sm text-neutral-600">{item.count} ({percentage.toFixed(1)}%)</span>
                                  </div>
                                  <div className="w-full bg-neutral-200 rounded-full h-2">
                                    <div
                                      className="bg-green-600 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-neutral-500 text-sm">No data available</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Top QR码排行榜 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 最受欢迎的QR码 */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Most Popular</h3>
                    <div className="space-y-3">
                      {analyticsData.topQRCodes.byScans.slice(0, 5).map((qr, index) => (
                        <div key={qr.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-neutral-900 truncate max-w-[150px]">
                                {qr.title}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {qr.scanCount.toLocaleString()} total scans
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 最近活跃的QR码 */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recently Active</h3>
                    <div className="space-y-3">
                      {analyticsData.topQRCodes.byRecent.slice(0, 5).map((qr, index) => (
                        <div key={qr.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-neutral-900 truncate max-w-[150px]">
                                {qr.title}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {qr.lastScanAt
                                  ? new Date(qr.lastScanAt).toLocaleDateString()
                                  : 'Never'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 增长最快的QR码 */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Fastest Growing</h3>
                    <div className="space-y-3">
                      {analyticsData.topQRCodes.byGrowth.slice(0, 5).map((qr, index) => (
                        <div key={qr.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-neutral-900 truncate max-w-[150px]">
                                {qr.title}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {qr.recentScans} scans ({timeRange})
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
                <p className="text-neutral-600">No analytics data available</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}


