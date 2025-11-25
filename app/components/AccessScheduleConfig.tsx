'use client'

import { useState } from 'react'

export interface ScheduleConfig {
  // 时间调度
  timeRanges?: {
    day: string // 'monday' | 'tuesday' | ...
    start: string // '09:00'
    end: string // '18:00'
    enabled: boolean
  }[]
  timezone?: string

  // 日期调度
  startDate?: string | null
  endDate?: string | null

  // 访问限制
  accessLimit?: number | null
}

interface ScheduleConfigProps {
  value: ScheduleConfig
  onChange: (config: ScheduleConfig) => void
}

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

export default function ScheduleConfigComponent({ value, onChange }: ScheduleConfigProps) {
  const [enableTimeSchedule, setEnableTimeSchedule] = useState(
    value.timeRanges && value.timeRanges.length > 0
  )
  const [enableDateSchedule, setEnableDateSchedule] = useState(
    !!value.startDate || !!value.endDate
  )
  const [enableAccessLimit, setEnableAccessLimit] = useState(value.accessLimit !== null && value.accessLimit !== undefined)

  const [timeRanges, setTimeRanges] = useState(
    value.timeRanges || DAYS.map((day) => ({ day: day.value, start: '09:00', end: '18:00', enabled: false }))
  )

  const handleTimeRangeChange = (index: number, field: string, newValue: string | boolean) => {
    const updated = [...timeRanges]
    updated[index] = { ...updated[index], [field]: newValue }
    setTimeRanges(updated)
    onChange({
      ...value,
      timeRanges: enableTimeSchedule ? updated : undefined,
      timezone: enableTimeSchedule ? (value.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone) : undefined,
    })
  }

  const handleDateChange = (field: 'startDate' | 'endDate', date: string) => {
    onChange({
      ...value,
      [field]: enableDateSchedule ? date : null,
    })
  }

  const handleAccessLimitChange = (limit: string) => {
    const numLimit = limit === '' ? null : parseInt(limit, 10)
    onChange({
      ...value,
      accessLimit: enableAccessLimit ? (isNaN(numLimit as number) ? null : numLimit) : null,
    })
  }

  return (
    <div className="space-y-6">
      {/* Time Scheduling */}
      <div className="border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Time Scheduling</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Create time ranges for when this resource should be accessible
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableTimeSchedule}
              onChange={(e) => {
                setEnableTimeSchedule(e.target.checked)
                if (!e.target.checked) {
                  onChange({ ...value, timeRanges: undefined, timezone: undefined })
                } else {
                  onChange({
                    ...value,
                    timeRanges: timeRanges,
                    timezone: value.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                  })
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        {enableTimeSchedule && (
          <div className="space-y-3 mt-4">
            {DAYS.map((day, index) => {
              const range = timeRanges.find((r) => r.day === day.value) || timeRanges[index] || {
                day: day.value,
                start: '09:00',
                end: '18:00',
                enabled: false,
              }
              return (
                <div key={day.value} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 min-w-[100px]">
                    <input
                      type="checkbox"
                      checked={range?.enabled ?? false}
                      onChange={(e) => handleTimeRangeChange(index, 'enabled', e.target.checked)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">{day.label}</span>
                  </label>
                  {range?.enabled && (
                    <>
                      <input
                        type="time"
                        value={range?.start ?? '09:00'}
                        onChange={(e) => handleTimeRangeChange(index, 'start', e.target.value)}
                        className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-500">to</span>
                      <input
                        type="time"
                        value={range?.end ?? '18:00'}
                        onChange={(e) => handleTimeRangeChange(index, 'end', e.target.value)}
                        className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Date Scheduling */}
      <div className="border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Date Range</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Set the date range when this resource should be accessible. After the end date, it will be disabled.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableDateSchedule}
              onChange={(e) => {
                setEnableDateSchedule(e.target.checked)
                if (!e.target.checked) {
                  onChange({ ...value, startDate: null, endDate: null })
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        {enableDateSchedule && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Start Date</label>
              <input
                type="date"
                value={value.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">End Date</label>
              <input
                type="date"
                value={value.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                min={value.startDate || undefined}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Access Limit */}
      <div className="border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Access Limit</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Limit the number of times this resource can be accessed
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableAccessLimit}
              onChange={(e) => {
                setEnableAccessLimit(e.target.checked)
                if (!e.target.checked) {
                  onChange({ ...value, accessLimit: null })
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        {enableAccessLimit && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-neutral-700 mb-1">Maximum Accesses</label>
            <input
              type="number"
              min="1"
              value={value.accessLimit !== null && value.accessLimit !== undefined ? value.accessLimit : ''}
              onChange={(e) => handleAccessLimitChange(e.target.value)}
              placeholder="e.g. 100"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Once this limit is reached, the resource will no longer be accessible
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

