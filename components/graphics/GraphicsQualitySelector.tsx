'use client'

import React from 'react'
import { GraphicsQuality } from '@/lib/graphics/GraphicsManager'
import { useGraphicsQuality } from '@/lib/graphics/useGraphicsQuality'

interface GraphicsQualitySelectorProps {
  className?: string
  compact?: boolean
}

export default function GraphicsQualitySelector({ className = '', compact = false }: GraphicsQualitySelectorProps) {
  const { quality, resolvedQuality, setQuality } = useGraphicsQuality()

  const options: { id: GraphicsQuality; label: string }[] = [
    { id: 'auto', label: 'AUTO' },
    { id: 'low', label: 'LOW' },
    { id: 'medium', label: 'MED' },
    { id: 'high', label: 'HIGH' },
  ]

  return (
    <div
      className={`inline-flex items-center gap-1 bg-black/75 border border-white/20 rounded-lg p-1 font-mono text-[10px] backdrop-blur-md shadow-lg select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-white/50 px-1.5 font-bold uppercase tracking-wider hidden sm:inline">
        QUALITY:
      </span>
      {options.map((opt) => {
        const isActive = quality === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setQuality(opt.id)}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
              isActive
                ? 'bg-[#e10600] text-white shadow-[0_0_10px_rgba(225,6,0,0.5)]'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title={`Graphics profile: ${opt.label} ${opt.id === 'auto' ? `(${resolvedQuality.toUpperCase()})` : ''}`}
          >
            {opt.label}
          </button>
        )
      })}
      {quality === 'auto' && (
        <span className="text-[9px] text-[#ffcc00] font-black px-1 uppercase hidden md:inline">
          [{resolvedQuality.toUpperCase()}]
        </span>
      )}
    </div>
  )
}
