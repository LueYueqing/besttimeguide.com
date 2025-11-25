'use client'

import { useState } from 'react'

interface URLFormProps {
  onChange: (data: { url: string }) => void
  placeholder?: string
}

export default function URLForm({ onChange, placeholder = "www.example.com" }: URLFormProps) {
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  const validateURL = (value: string) => {
    if (!value.trim()) {
      setUrlError('')
      return true
    }

    try {
      // 使用浏览器原生URL验证
      new URL(value)
      setUrlError('')
      return true
    } catch {
      setUrlError('Please enter a valid URL (e.g., https://example.com)')
      return false
    }
  }

  const handleChange = (value: string) => {
    setUrl(value)
    validateURL(value)
    onChange({ url: value })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    handleChange(value)
  }

  return (
    <div className="space-y-6">

      {/* URL Input */}
      <div>
        <label htmlFor="url" className="block text-base font-semibold text-neutral-900 mb-3">
          Enter your Website
        </label>
        <div className="relative">
          <input
            type="url"
            id="url"
            value={url}
            onChange={handleInputChange}
            placeholder="https://www.example.com"
            className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-all duration-200 ${
              urlError 
                ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-red-50' 
                : url && !urlError
                ? 'border-success-300 focus:ring-4 focus:ring-success-100 focus:border-success-500 bg-success-50'
                : 'border-neutral-300 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white'
            }`}
          />
          {/* Status Icon */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {url && !urlError && (
              <span className="text-success-500 text-xl">✅</span>
            )}
            {urlError && (
              <span className="text-red-500 text-xl">❌</span>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {urlError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              {urlError}
            </p>
          </div>
        )}
      </div>


    </div>
  )
}