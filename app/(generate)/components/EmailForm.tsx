'use client'

import { useState } from 'react'

interface EmailFormProps {
  onChange: (data: { email: string; subject: string; body: string }) => void
  placeholder?: string
}

export default function EmailForm({ onChange, placeholder = "email@example.com" }: EmailFormProps) {
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [emailError, setEmailError] = useState('')

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError('')
      return true
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(value)) {
      setEmailError('')
      return true
    } else {
      setEmailError('Please enter a valid email address')
      return false
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    validateEmail(value)
    onChange({ email: value, subject, body })
  }

  const handleSubjectChange = (value: string) => {
    setSubject(value)
    onChange({ email, subject: value, body })
  }

  const handleBodyChange = (value: string) => {
    setBody(value)
    onChange({ email, subject, body: value })
  }

  return (
    <div className="space-y-6">

      {/* Email Address */}
      <div>
        <label htmlFor="email" className="block text-base font-semibold text-neutral-900 mb-3">
          Email Address *
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-all duration-200 ${
              emailError 
                ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-red-50' 
                : email && !emailError
                ? 'border-success-300 focus:ring-4 focus:ring-success-100 focus:border-success-500 bg-success-50'
                : 'border-neutral-300 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white'
            }`}
          />
          {/* Status Icon */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {email && !emailError && (
              <span className="text-success-500 text-xl">✅</span>
            )}
            {emailError && (
              <span className="text-red-500 text-xl">❌</span>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {emailError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              {emailError}
            </p>
          </div>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-base font-semibold text-neutral-900 mb-3">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          placeholder="Email subject (optional)"
          className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="body" className="block text-base font-semibold text-neutral-900 mb-3">
          Message Body
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => handleBodyChange(e.target.value)}
          placeholder="Email message (optional)"
          rows={6}
          className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg resize-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
        />
        <p className="mt-2 text-sm text-neutral-600">
          {body.length} characters
        </p>
      </div>
    </div>
  )
}

