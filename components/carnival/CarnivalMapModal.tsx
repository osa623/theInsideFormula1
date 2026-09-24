'use client'

import { useEffect, useState } from 'react'

interface CarnivalMapModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CarnivalMapModal({ isOpen, onClose }: CarnivalMapModalProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!isOpen) return

    setZoom(1)
    setPan({ x: 0, y: 0 })

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'escape' || key === 'e') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 md:p-8 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center max-w-5xl w-full h-[88vh] bg-[#07090e] border-2 border-[#f40612]/60 rounded-xl shadow-[0_0_60px_rgba(244,6,18,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between px-6 py-3 bg-[#0d1118] border-b border-[#f40612]/30 font-mono">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-[#f40612] animate-pulse rounded-full" />
            <span className="font-bold text-sm tracking-widest text-white uppercase">
              EXHIBITION GROUNDS & CIRCUIT MAP
            </span>
            <span className="text-xs text-white/50 hidden sm:inline">
              // INTERACTIVE DIRECTORY
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1)
                setPan({ x: 0, y: 0 })
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition cursor-pointer"
              title="Reset View"
            >
              RESET
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 px-3 py-1 bg-[#f40612] hover:bg-[#ff1e27] text-white rounded text-xs font-bold uppercase transition cursor-pointer"
              title="Close [E / ESC]"
            >
              CLOSE [E / ESC]
            </button>
          </div>
        </div>

        {/* Map Viewport */}
        <div
          className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-[#030406] cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/models/map_color.png"
              onError={(e) => {
                // Fallback to map.png if map_color.png is not found
                ;(e.currentTarget as HTMLImageElement).src = '/images/AA.png'
              }}
              alt="Formula 1 Carnival Exhibition Grounds Map"
              className="max-h-[72vh] max-w-[85vw] object-contain rounded pointer-events-none shadow-2xl border border-white/10"
              draggable={false}
            />
          </div>

          {/* Quick Legend Overlay */}
          <div className="absolute bottom-4 left-4 pointer-events-none bg-black/80 border border-white/10 rounded p-3 font-mono text-[11px] backdrop-blur text-white/80 hidden sm:block">
            <div className="font-bold text-[#f40612] uppercase tracking-wider mb-1.5 text-[10px]">
              Key Zones & Waypoints
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div>📍 01: Paddock & Entrance</div>
              <div>📍 02: Technical Booths (Tyre, Chassis)</div>
              <div>📍 03: Driving Academy & Exam</div>
              <div>📍 04: Grand Prix Simulation Arena</div>
              <div>📍 05: Hall of Champions 2000-2025</div>
              <div>📍 06: Arcade Gaming Stations</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full flex items-center justify-between px-6 py-2 bg-[#090b10] border-t border-white/10 font-mono text-xs text-white/50">
          <div>Drag to pan • Click + / - to zoom</div>
          <div className="text-[#ffcc00]">PRESS [E] OR [ESC] TO RETURN TO EXHIBITION</div>
        </div>
      </div>
    </div>
  )
}
