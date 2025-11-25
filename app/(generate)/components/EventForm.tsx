'use client'

import { useState } from 'react'

interface EventFormProps {
  onChange: (data: {
    title: string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    location: string
    description: string
  }) => void
}

export default function EventForm({ onChange }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    description: ''
  })

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onChange(newData)
  }

  // 设置默认结束日期为开始日期
  const handleStartDateChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, startDate: value }
      // 如果结束日期为空，自动设置为开始日期
      if (!prev.endDate && value) {
        newData.endDate = value
      }
      onChange(newData)
      return newData
    })
  }

  return (
    <div className="space-y-6">

      {/* Event Title */}
      <div>
        <label htmlFor="title" className="block text-base font-semibold text-neutral-900 mb-3">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Meeting, Birthday Party, Conference..."
          className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-all duration-200 ${
            formData.title 
              ? 'border-success-300 focus:ring-4 focus:ring-success-100 focus:border-success-500 bg-success-50' 
              : 'border-neutral-300 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white'
          }`}
        />
      </div>

      {/* Start Date and Time */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-base font-semibold text-neutral-900 mb-3">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="startTime" className="block text-base font-semibold text-neutral-900 mb-3">
            Start Time *
          </label>
          <input
            type="time"
            id="startTime"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
            required
          />
        </div>
      </div>

      {/* End Date and Time */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="endDate" className="block text-base font-semibold text-neutral-900 mb-3">
            End Date *
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            min={formData.startDate || undefined}
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-base font-semibold text-neutral-900 mb-3">
            End Time *
          </label>
          <input
            type="time"
            id="endTime"
            value={formData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
            required
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-base font-semibold text-neutral-900 mb-3">
          Location (Optional)
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Conference Room A, 123 Main St, New York..."
          className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-base font-semibold text-neutral-900 mb-3">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Event details, agenda, or additional information..."
          rows={4}
          className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg resize-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
        />
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> When scanned, this QR code will create a calendar event that users can add directly to their phone's calendar (iPhone Calendar, Google Calendar, etc.).
        </p>
      </div>
    </div>
  )
}

