'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

interface AddressFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export default function AddressField({ value, onChange, placeholder, error, className }: AddressFieldProps) {
  const [showMap, setShowMap] = useState(false)

  const trimmed = value.trim()
  const mapQuery = encodeURIComponent(trimmed)

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
      </div>

      {trimmed.length > 3 && (
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          {showMap ? 'הסתר מפה' : 'הצג במפה'}
        </button>
      )}

      {showMap && trimmed.length > 3 && (
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <iframe
            title="מיקום על המפה"
            width="100%"
            height="200"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
