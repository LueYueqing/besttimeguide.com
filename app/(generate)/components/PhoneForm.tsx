'use client'

import { useState } from 'react'

interface PhoneFormProps {
  onChange: (data: { phone: string; name?: string }) => void
  placeholder?: string
}

export default function PhoneForm({ onChange, placeholder = "+1-555-123-4567" }: PhoneFormProps) {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const validatePhone = (value: string) => {
    if (!value.trim()) {
      setPhoneError('')
      return true
    }

    // 简单的电话验证：至少包含数字
    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (phoneRegex.test(value) && value.replace(/\D/g, '').length >= 7) {
      setPhoneError('')
      return true
    } else {
      setPhoneError('Please enter a valid phone number')
      return false
    }
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    validatePhone(value)
    onChange({ phone: value, name })
  }

  const handleNameChange = (value: string) => {
    setName(value)
    onChange({ phone, name: value })
  }

  return (
    <div className="space-y-6">

      {/* Name (Optional) */}
      <div>
        <label htmlFor="name" className="block text-base font-semibold text-neutral-900 mb-3">
          Contact Name (Optional)
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
        />
        <p className="mt-2 text-sm text-neutral-600">
          Optional: Add a name to identify this contact
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-base font-semibold text-neutral-900 mb-3">
          Phone Number *
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-all duration-200 ${
              phoneError 
                ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-red-50' 
                : phone && !phoneError
                ? 'border-success-300 focus:ring-4 focus:ring-success-100 focus:border-success-500 bg-success-50'
                : 'border-neutral-300 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white'
            }`}
          />
          {/* Status Icon */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {phone && !phoneError && (
              <span className="text-success-500 text-xl">✅</span>
            )}
            {phoneError && (
              <span className="text-red-500 text-xl">❌</span>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {phoneError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              {phoneError}
            </p>
          </div>
        )}
        
        <p className="mt-2 text-sm text-neutral-600">
          Include country code for international numbers (e.g., +1 for USA, +44 for UK). The QR code will allow users to call this number directly with one tap.
        </p>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> When scanned, this QR code opens the phone dialer with the number pre-filled. Users can then tap to call directly from any smartphone.
        </p>
      </div>
    </div>
  )
}

