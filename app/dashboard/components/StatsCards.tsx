'use client'

interface StatsCardsProps {
  stats: {
    total: number
    active: number
    paused: number
    dynamic: number
    totalScans: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {/* Total QR Codes */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">Total QR Codes</div>
        <div className="text-2xl font-semibold text-neutral-900">{stats.total}</div>
      </div>

      {/* Dynamic QR Codes */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">Dynamic QR Codes</div>
        <div className="text-2xl font-semibold text-purple-600">{stats.dynamic}</div>
      </div>

      {/* Active QR Codes */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">Active QR Codes</div>
        <div className="text-2xl font-semibold text-green-600">{stats.active}</div>
      </div>

      {/* Paused QR Codes */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">Paused QR Codes</div>
        <div className="text-2xl font-semibold text-yellow-600">{stats.paused}</div>
      </div>

      {/* Total Scans */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-sm text-neutral-500 mb-1">Total Scans</div>
        <div className="text-2xl font-semibold text-blue-600">
          {stats.totalScans.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

