'use client'

import { useState } from 'react'

interface BusinessCardFormProps {
  onChange: (data: {
    name: string
    organization: string
    title: string
    phone: string
    email: string
    website: string
    address: string
    city: string
    state: string
    zip: string
    country: string
  }) => void
}

export default function BusinessCardForm({ onChange }: BusinessCardFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  })

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onChange(newData)
  }

  return (
    <div className="space-y-6">

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-base font-semibold text-neutral-900 mb-3">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="John Doe"
          className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-all duration-200 ${
            formData.name 
              ? 'border-success-300 focus:ring-4 focus:ring-success-100 focus:border-success-500 bg-success-50' 
              : 'border-neutral-300 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white'
          }`}
        />
      </div>

      {/* Organization and Title */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="organization" className="block text-base font-semibold text-neutral-900 mb-3">
            Company / Organization
          </label>
          <input
            type="text"
            id="organization"
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            placeholder="Acme Corporation"
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-base font-semibold text-neutral-900 mb-3">
            Job Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Marketing Manager"
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Phone and Email */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-base font-semibold text-neutral-900 mb-3">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1-555-123-4567"
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-base font-semibold text-neutral-900 mb-3">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-all duration-200 ${
              formData.email && formData.email.includes('@')
                ? 'border-success-300 focus:ring-4 focus:ring-success-100 focus:border-success-500 bg-success-50' 
                : 'border-neutral-300 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white'
            }`}
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-base font-semibold text-neutral-900 mb-3">
          Website URL
        </label>
        <input
          type="url"
          id="website"
          value={formData.website}
          onChange={(e) => handleChange('website', e.target.value)}
          placeholder="https://www.example.com"
          className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-base font-semibold text-neutral-900 mb-3">
          Street Address
        </label>
        <input
          type="text"
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="123 Main Street"
          className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
        />
      </div>

      {/* City, State, Zip */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-base font-semibold text-neutral-900 mb-3">
            City
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="New York"
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-base font-semibold text-neutral-900 mb-3">
            State / Province
          </label>
          <input
            type="text"
            id="state"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="NY"
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="zip" className="block text-base font-semibold text-neutral-900 mb-3">
            ZIP / Postal Code
          </label>
          <input
            type="text"
            id="zip"
            value={formData.zip}
            onChange={(e) => handleChange('zip', e.target.value)}
            placeholder="10001"
            className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-base font-semibold text-neutral-900 mb-3">
          Country
        </label>
        <input
          type="text"
          id="country"
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          placeholder="United States"
          className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
        />
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> At minimum, fill in your name. All other fields are optional but help create a complete business card.
        </p>
      </div>
    </div>
  )
}

