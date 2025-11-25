'use client'

import { useState } from 'react'

interface TextFormProps {
  onChange: (data: { text: string }) => void
  placeholder?: string
}

export default function TextForm({ onChange, placeholder = "Enter your text message" }: TextFormProps) {
  const [text, setText] = useState('')

  const handleChange = (value: string) => {
    setText(value)
    onChange({ text: value })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    handleChange(value)
  }

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <div>
        <label htmlFor="text" className="block text-base font-semibold text-neutral-900 mb-3">
          Enter your Text
        </label>
        <div className="relative">
          <textarea
            id="text"
            value={text}
            onChange={handleInputChange}
            placeholder={placeholder}
            rows={6}
            className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-all duration-200 resize-none ${
              text
                ? 'border-success-300 focus:ring-4 focus:ring-success-100 focus:border-success-500 bg-success-50'
                : 'border-neutral-300 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white'
            }`}
          />
          {/* Character Count */}
          <div className="absolute bottom-2 right-2 text-xs text-neutral-500">
            {text.length} characters
          </div>
          {/* Status Icon */}
          <div className="absolute top-4 right-4">
            {text && (
              <span className="text-success-500 text-xl">✅</span>
            )}
          </div>
        </div>
        
        {/* Help Text */}
        <p className="mt-2 text-sm text-neutral-600">
          Enter any text up to 300 characters. Perfect for sharing messages, contact info, or notes.
        </p>
      </div>
    </div>
  )
}

