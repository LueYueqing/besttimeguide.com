'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@/contexts/UserContext'
import SidebarNavigation from '../../components/SidebarNavigation'

interface BulkCreateResult {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
  created: Array<{
    id: number
    title: string
    shortUrl: string
    shortCode: string
  }>
}

export default function BulkCreateClient() {
  const { user, loading: userLoading } = useUser()
  const [status, setStatus] = useState<'all' | 'active' | 'paused' | 'archived'>('all')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    dynamic: 0,
    totalScans: 0,
  })
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<string[][]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BulkCreateResult | null>(null)

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

  // 解析CSV文件
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = []
    let currentLine: string[] = []
    let currentField = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"'
          i++ // 跳过下一个引号
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        currentLine.push(currentField.trim())
        currentField = ''
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (currentField || currentLine.length > 0) {
          currentLine.push(currentField.trim())
          lines.push(currentLine)
          currentLine = []
          currentField = ''
        }
        if (char === '\r' && nextChar === '\n') {
          i++ // 跳过\n
        }
      } else {
        currentField += char
      }
    }

    // 添加最后一行
    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField.trim())
      lines.push(currentLine)
    }

    return lines
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setFile(selectedFile)
    setError(null)
    setResult(null)

    try {
      const text = await selectedFile.text()
      const parsed = parseCSV(text)

      if (parsed.length === 0) {
        setError('CSV file is empty')
        return
      }

      setCsvData(parsed)
      setHeaders(parsed[0] || [])
      setPreviewRows(parsed.slice(1, 6)) // 显示前5行数据
    } catch (err) {
      console.error('Error parsing CSV:', err)
      setError('Failed to parse CSV file. Please check the file format.')
    }
  }

  const handleBulkCreate = async () => {
    if (!file || csvData.length < 2) {
      setError('Please upload a valid CSV file with data rows')
      return
    }

    setIsUploading(true)
    setError(null)
    setResult(null)

    try {
      // 准备数据：跳过标题行，将每行转换为对象
      const rows = csvData.slice(1).filter((row) => row.some((cell) => cell.trim() !== ''))
      const data = rows.map((row, index) => {
        const rowObj: any = {}
        headers.forEach((header, colIndex) => {
          rowObj[header.toLowerCase().trim()] = row[colIndex]?.trim() || ''
        })
        return { ...rowObj, _rowIndex: index + 2 } // +2 因为跳过标题行且从1开始计数
      })

      const response = await fetch('/api/dynamic/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })

      const resultData = await response.json()

      if (!response.ok || !resultData.success) {
        throw new Error(resultData.error || 'Failed to create QR codes')
      }

      setResult(resultData.data)
    } catch (err) {
      console.error('Error creating bulk QR codes:', err)
      setError(err instanceof Error ? err.message : 'Failed to create QR codes')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadResults = () => {
    if (!result) return

    const csv = [
      ['Title', 'Short URL', 'Short Code', 'Status'],
      ...result.created.map((item) => [item.title, item.shortUrl, item.shortCode, 'Success']),
      ...result.errors.map((err) => ['', '', '', `Error: ${err.error} (Row ${err.row})`]),
    ]

    const csvContent = csv.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `qr-codes-results-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-neutral-900">
                CustomQR.pro
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
        <SidebarNavigation status={status} onStatusChange={setStatus} stats={stats} user={user} />

        <main className="flex-1 lg:ml-64">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Dashboard / Bulk Create</p>
                <h1 className="text-2xl font-semibold text-neutral-900 mt-1">Bulk Create Dynamic QR Codes</h1>
              </div>
              <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                ← Back to Dashboard
              </Link>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* 说明 */}
          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold text-blue-900 mb-2">CSV Format Requirements</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>First row must contain column headers</li>
              <li>Required columns: <code className="bg-blue-100 px-1 rounded">title</code> and <code className="bg-blue-100 px-1 rounded">targeturl</code> (case-insensitive)</li>
              <li>Optional column: <code className="bg-blue-100 px-1 rounded">description</code></li>
              <li>Example: <code className="bg-blue-100 px-1 rounded">title,targeturl,description</code></li>
            </ul>
          </div>

          {/* 文件上传 */}
          <div>
            <label htmlFor="csv-file" className="block text-sm font-medium text-neutral-700 mb-2">
              Upload CSV File
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-neutral-500">Upload a CSV file with your QR code data</p>
          </div>

          {/* 预览 */}
          {previewRows.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Preview (first 5 rows)</h3>
              <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index} className="px-4 py-2 text-left text-xs font-medium text-neutral-700 uppercase">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-sm text-neutral-600">
                            {cell || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Total rows: {csvData.length - 1} (excluding header)
              </p>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* 结果 */}
          {result && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-900">Creation Results</h3>
                <button
                  onClick={downloadResults}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Download Results CSV
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">{result.success}</div>
                  <div className="text-xs text-neutral-600">Successfully Created</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                  <div className="text-xs text-neutral-600">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-600">{result.success + result.failed}</div>
                  <div className="text-xs text-neutral-600">Total Processed</div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-neutral-700 mb-2">Errors:</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.errors.map((err, index) => (
                      <div key={index} className="text-xs text-red-600">
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleBulkCreate}
              disabled={!file || csvData.length < 2 || isUploading}
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploading ? 'Creating...' : `Create ${csvData.length > 1 ? csvData.length - 1 : 0} QR Codes`}
            </button>
            {result && (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                View in Dashboard
              </Link>
            )}
          </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

