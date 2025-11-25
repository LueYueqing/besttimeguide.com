'use client'

import { useState } from 'react'

interface LocationFormProps {
  onChange: (data: { latitude: string; longitude: string; name?: string }) => void
  placeholder?: string
}

export default function LocationForm({ onChange }: LocationFormProps) {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const validateCoordinates = (lat: string, lng: string) => {
    if (!lat.trim() || !lng.trim()) {
      setError('')
      return true
    }

    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)

    if (isNaN(latNum) || isNaN(lngNum)) {
      setError('Please enter valid numeric coordinates')
      return false
    }

    if (latNum < -90 || latNum > 90) {
      setError('Latitude must be between -90 and 90')
      return false
    }

    if (lngNum < -180 || lngNum > 180) {
      setError('Longitude must be between -180 and 180')
      return false
    }

    setError('')
    return true
  }

  const handleLatChange = (value: string) => {
    setLatitude(value)
    validateCoordinates(value, longitude)
    onChange({ latitude: value, longitude, name })
  }

  const handleLngChange = (value: string) => {
    setLongitude(value)
    validateCoordinates(latitude, value)
    onChange({ latitude, longitude: value, name })
  }

  const handleNameChange = (value: string) => {
    setName(value)
    onChange({ latitude, longitude, name: value })
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6)
          const lng = position.coords.longitude.toFixed(6)
          setLatitude(lat)
          setLongitude(lng)
          validateCoordinates(lat, lng)
          onChange({ latitude: lat, longitude: lng, name })
        },
        (error) => {
          setError('Unable to get your location. Please enter coordinates manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
    }
  }

  const isValid = latitude && longitude && !error

  return (
    <div className="space-y-6">
      {/* Get Current Location Button */}
      <div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="w-full px-4 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>📍</span>
          <span>Use My Current Location</span>
        </button>
        <p className="mt-2 text-sm text-neutral-600 text-center">
          Or enter coordinates manually below
        </p>
      </div>

      {/* Location Name (Optional) */}
      <div>
        <label htmlFor="name" className="block text-base font-semibold text-neutral-900 mb-3">
          Location Name (Optional)
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="My Business, Home, Event Venue..."
          className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white transition-all duration-200"
        />
      </div>

      {/* Coordinates */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-base font-semibold text-neutral-900 mb-3">
            Latitude *
          </label>
          <input
            type="text"
            id="latitude"
            value={latitude}
            onChange={(e) => handleLatChange(e.target.value)}
            placeholder="40.7128"
            className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-all duration-200 ${
              error && !latitude
                ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-red-50' 
                : isValid
                ? 'border-success-300 focus:ring-4 focus:ring-success-100 focus:border-success-500 bg-success-50'
                : 'border-neutral-300 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white'
            }`}
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-base font-semibold text-neutral-900 mb-3">
            Longitude *
          </label>
          <input
            type="text"
            id="longitude"
            value={longitude}
            onChange={(e) => handleLngChange(e.target.value)}
            placeholder="-74.0060"
            className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-all duration-200 ${
              error && !longitude
                ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-red-50' 
                : isValid
                ? 'border-success-300 focus:ring-4 focus:ring-success-100 focus:border-success-500 bg-success-50'
                : 'border-neutral-300 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white'
            }`}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Status Icon */}
      {isValid && (
        <div className="flex items-center gap-2 text-success-600">
          <span className="text-xl">✅</span>
          <span className="text-sm font-medium">Valid coordinates - Ready to generate QR code</span>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> You can find coordinates by right-clicking on Google Maps and selecting "What's here?" or use the "Use My Current Location" button above. The QR code will open Google Maps with this location.
        </p>
      </div>
    </div>
  )
}

