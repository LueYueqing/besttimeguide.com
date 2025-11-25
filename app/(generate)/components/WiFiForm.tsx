'use client'

import { useState } from 'react'

interface WiFiFormProps {
  onChange: (data: { ssid: string; password: string; security: string; hidden: boolean }) => void
  placeholder?: string
}

export default function WiFiForm({ onChange, placeholder = "MyWiFiNetwork" }: WiFiFormProps) {
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [security, setSecurity] = useState('WPA')
  const [hidden, setHidden] = useState(false)

  const handleSsidChange = (value: string) => {
    setSsid(value)
    onChange({ ssid: value, password, security, hidden })
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    onChange({ ssid, password: value, security, hidden })
  }

  const handleSecurityChange = (value: string) => {
    setSecurity(value)
    onChange({ ssid, password, security: value, hidden })
  }

  const handleHiddenChange = (value: boolean) => {
    setHidden(value)
    onChange({ ssid, password, security, hidden: value })
  }

  return (
    <div className="space-y-6">
      {/* Network Name (SSID) */}
      <div>
        <label htmlFor="ssid" className="block text-sm font-semibold text-neutral-900 mb-2">
          Network Name (SSID) *
        </label>
        <input
          type="text"
          id="ssid"
          value={ssid}
          onChange={(e) => handleSsidChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
          required
        />
        <p className="text-sm text-neutral-600 mt-1">
          Enter your WiFi network name exactly as it appears
        </p>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-neutral-900 mb-2">
          WiFi Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          placeholder="Enter your WiFi password"
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
        />
        <p className="text-sm text-neutral-600 mt-1">
          Leave empty for open networks (not recommended)
        </p>
      </div>

      {/* Security Type */}
      <div>
        <label htmlFor="security" className="block text-sm font-semibold text-neutral-900 mb-2">
          Security Type
        </label>
        <select
          id="security"
          value={security}
          onChange={(e) => handleSecurityChange(e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
        >
          <option value="WPA">WPA/WPA2 (Most Common)</option>
          <option value="WEP">WEP (Legacy)</option>
          <option value="nopass">Open Network (No Password)</option>
        </select>
        <p className="text-sm text-neutral-600 mt-1">
          WPA/WPA2 is the most secure and commonly used option
        </p>
      </div>

      {/* Hidden Network */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="hidden"
          checked={hidden}
          onChange={(e) => handleHiddenChange(e.target.checked)}
          className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="hidden" className="text-sm font-semibold text-neutral-900">
          Hidden Network
        </label>
        <p className="text-sm text-neutral-600">
          Check if your network doesn't broadcast its name
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-amber-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-amber-800 mb-1">Security Notice</h4>
            <p className="text-sm text-amber-700">
              Anyone with access to this QR code can connect to your WiFi network. 
              Only share with trusted individuals and consider changing your password regularly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
