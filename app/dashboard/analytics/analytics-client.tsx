'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '../components/DashboardLayout'
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
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

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
    <DashboardLayout title="数据分析" isFullWidth={true}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">数据统计</h1>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${timeRange === range
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                }`}
            >
              {range === '7d' ? '7天' : range === '30d' ? '30天' : '90天'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-neutral-600">加载中...</div>
        </div>
      ) : analyticsData ? (
        <>
          {/* 总体概览统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="text-sm text-neutral-600 mb-1">总展现量</div>
              <div className="text-3xl font-bold text-neutral-900">
                {analyticsData.overview.totalScans.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="text-sm text-neutral-600 mb-1">活跃内容</div>
              <div className="text-3xl font-bold text-neutral-900">
                {analyticsData.overview.activeQRCodes}
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="text-sm text-neutral-600 mb-1">今日展现</div>
              <div className="text-3xl font-bold text-neutral-900">
                {analyticsData.overview.todayScans.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="text-sm text-neutral-600 mb-1">增长率</div>
              <div
                className={`text-3xl font-bold ${analyticsData.overview.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {analyticsData.overview.growthRate >= 0 ? '+' : ''}
                {analyticsData.overview.growthRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* 时间趋势图表 */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">访问趋势</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scans"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 设备分析 */}
            {analyticsData.deviceAnalysis && (
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">设备分布</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.deviceAnalysis.osDistribution}
                        dataKey="count"
                        nameKey="os"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {analyticsData.deviceAnalysis.osDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 热门内容 */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">热门文章</h3>
              <div className="space-y-4">
                {analyticsData.topQRCodes.byScans.slice(0, 5).map((qr, index) => (
                  <div key={qr.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-sm font-bold text-neutral-400 w-4">{index + 1}</span>
                      <div className="truncate">
                        <div className="text-sm font-medium text-neutral-900 truncate">{qr.title}</div>
                        <div className="text-xs text-neutral-500">总点击: {qr.scanCount.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-primary-600">
                      {qr.recentScans > 0 ? `+${qr.recentScans}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <p className="text-neutral-600">暂无统计数据</p>
        </div>
      )}
    </DashboardLayout>
  )
}
