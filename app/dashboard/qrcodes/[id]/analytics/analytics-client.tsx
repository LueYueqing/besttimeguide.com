'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SidebarNavigation from '../../../components/SidebarNavigation'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardStats {
  total: number
  active: number
  paused: number
  archived: number
  dynamic: number
  totalScans: number
}

interface QRAnalyticsData {
  overview: {
    totalScans: number
    timeRangeScans: number
    todayScans: number
    growthRate: number
  }
  timeSeries: Array<{ date: string; count: number }>
  deviceAnalysis: {
    deviceTypeDistribution: Array<{ device: string; count: number }>
    osDistribution: Array<{ os: string; count: number }>
    browserDistribution: Array<{ browser: string; count: number }>
  }
  geoAnalysis: {
    topCountries: Array<{ country: string; count: number }>
    topCities: Array<{ city: string; count: number }>
  }
  qrCode: {
    id: number
    title: string | null
    shortCode: string | null
    scanCount: number
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function QRAnalyticsClient({ qrCodeId }: { qrCodeId: string }) {
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
  const [analyticsData, setAnalyticsData] = useState<QRAnalyticsData | null>(null)

  // 处理状态改变：跳转到 dashboard 并应用筛选
  const handleStatusChange = (newStatus: 'all' | 'active' | 'paused' | 'archived') => {
    setStatus(newStatus)
    router.push(`/dashboard?status=${newStatus}`)
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
        const response = await fetch(`/api/qrcodes/${qrCodeId}/analytics?timeRange=${timeRange}`)
        const data = await response.json()
        if (data.success) {
          setAnalyticsData(data.data)
        } else if (data.requiresUpgrade) {
          // 如果是需要升级的错误，已经在服务端重定向了，这里只是备用处理
          router.push('/pricing?feature=analytics')
        }
      } catch (error) {
        console.error('Error fetching QR code analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [user, qrCodeId, timeRange, router])

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

  // 客户端权限检查：如果是免费用户，重定向到定价页
  const plan = user.plan?.toLowerCase() || 'free'
  const isFree = plan === 'free'
  const isDevUser = typeof window !== 'undefined' && user.email === 'dev@customqr.pro'
  
  // 检查 Pro 试用权限
  const proTrialExpiresAt = user.proTrialExpiresAt
    ? new Date(user.proTrialExpiresAt)
    : null
  const hasProTrial = proTrialExpiresAt && proTrialExpiresAt > new Date()
  
  if (isFree && !isDevUser && !hasProTrial) {
    router.replace('/pricing?feature=analytics')
    return null
  }

  // 格式化图表数据
  const chartData =
    analyticsData?.timeSeries.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      scans: item.count,
    })) || []

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://customqr.pro'
  const shortUrl = analyticsData?.qrCode.shortCode ? `${baseUrl}/r/${analyticsData.qrCode.shortCode}` : null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 顶部头部栏 */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 text-xl lg:text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
                <Image
                  src="/logo.png"
                  alt="CustomQR.pro"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span>CustomQR<span className="text-gradient">.pro</span></span>
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
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900">
                  {analyticsData?.qrCode.title || 'QR Code Analytics'}
                </h1>
                {shortUrl && (
                  <p className="text-sm text-neutral-600 mt-1">
                    <Link href={shortUrl} target="_blank" className="text-blue-600 hover:text-blue-700">
                      {shortUrl}
                    </Link>
                  </p>
                )}
              </div>
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

            <div className="mb-4">
              <Link
                href={`/dashboard/qrcodes/${qrCodeId}`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Back to Edit
              </Link>
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
                    <div className="text-sm text-neutral-600 mb-1">Time Range Scans</div>
                    <div className="text-3xl font-bold text-neutral-900">
                      {analyticsData.overview.timeRangeScans.toLocaleString()}
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

                {/* 3. 设备分析 */}
                {analyticsData.deviceAnalysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* 设备类型分布 */}
                    {analyticsData.deviceAnalysis.deviceTypeDistribution.length > 0 && (
                      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Device Types</h2>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={analyticsData.deviceAnalysis.deviceTypeDistribution}
                              dataKey="count"
                              nameKey="device"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {analyticsData.deviceAnalysis.deviceTypeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* 操作系统分布 */}
                    {analyticsData.deviceAnalysis.osDistribution.length > 0 && (
                      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Operating Systems</h2>
                        <div className="space-y-3">
                          {analyticsData.deviceAnalysis.osDistribution.slice(0, 5).map((item, index) => {
                            const total = analyticsData.deviceAnalysis.osDistribution.reduce((sum, os) => sum + os.count, 0)
                            const percentage = total > 0 ? (item.count / total) * 100 : 0
                            return (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-neutral-700">{item.os}</span>
                                  <span className="text-sm font-medium text-neutral-900">{item.count}</span>
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
                      </div>
                    )}

                    {/* 浏览器分布 */}
                    {analyticsData.deviceAnalysis.browserDistribution.length > 0 && (
                      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Browsers</h2>
                        <div className="space-y-3">
                          {analyticsData.deviceAnalysis.browserDistribution.slice(0, 5).map((item, index) => {
                            const total = analyticsData.deviceAnalysis.browserDistribution.reduce((sum, b) => sum + b.count, 0)
                            const percentage = total > 0 ? (item.count / total) * 100 : 0
                            return (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-neutral-700">{item.browser}</span>
                                  <span className="text-sm font-medium text-neutral-900">{item.count}</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. 地理位置分析 */}
                {analyticsData.geoAnalysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Countries */}
                    {analyticsData.geoAnalysis.topCountries.length > 0 && (
                      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Top Countries</h2>
                        <div className="space-y-3">
                          {analyticsData.geoAnalysis.topCountries.map((item, index) => {
                            const total = analyticsData.geoAnalysis.topCountries.reduce((sum, c) => sum + c.count, 0)
                            const percentage = total > 0 ? (item.count / total) * 100 : 0
                            return (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-neutral-700">{item.country}</span>
                                  <span className="text-sm font-medium text-neutral-900">{item.count}</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Top Cities */}
                    {analyticsData.geoAnalysis.topCities.length > 0 && (
                      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Top Cities</h2>
                        <div className="space-y-3">
                          {analyticsData.geoAnalysis.topCities.map((item, index) => {
                            const total = analyticsData.geoAnalysis.topCities.reduce((sum, c) => sum + c.count, 0)
                            const percentage = total > 0 ? (item.count / total) * 100 : 0
                            return (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-neutral-700">{item.city}</span>
                                  <span className="text-sm font-medium text-neutral-900">{item.count}</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div
                                    className="bg-orange-600 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
                <p className="text-neutral-600">No analytics data available</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

