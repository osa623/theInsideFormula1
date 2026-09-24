'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CarPlaceholder } from './types/simulation'
import { CAR_SPECS_DATA, DEFAULT_CAR_SPEC } from './carSpecsData'

interface CarInfoPanelProps {
  isInspecting: boolean
  inspectedCar: CarPlaceholder | null
  onClose: () => void
}

export default function CarInfoPanel({
  isInspecting,
  inspectedCar,
  onClose,
}: CarInfoPanelProps) {
  // Listen for ESC key to close inspection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInspecting && e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInspecting, onClose])

  if (!isInspecting || !inspectedCar) return null

  const spec = CAR_SPECS_DATA[inspectedCar.year] || DEFAULT_CAR_SPEC

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-40 flex items-center justify-end p-6 md:p-12 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
          className="pointer-events-auto w-full max-w-lg overflow-hidden border border-border/80 bg-black/92 p-6 backdrop-blur-2xl md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[85vh] flex flex-col justify-between"
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-primary font-bold">
                  EXHIBITION SPECIFICATION // {spec.year}
                </span>
                <h2 className="font-mono text-2xl font-black tracking-tight text-foreground mt-0.5">
                  {spec.model}
                </h2>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {spec.manufacturer}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="border border-border/80 bg-muted/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                ✕ CLOSE [ESC]
              </button>
            </div>

            {/* Description */}
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted-foreground/90">
              {spec.description}
            </p>

            {/* Specs Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-b border-border/60 py-4 font-mono text-[10px]">
              <div className="border-r border-border/40 pr-2">
                <span className="block text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
                  POWER UNIT
                </span>
                <span className="font-semibold text-foreground">{spec.powerUnit}</span>
              </div>
              <div className="pl-2">
                <span className="block text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
                  HORSEPOWER
                </span>
                <span className="font-semibold text-primary">{spec.horsepower}</span>
              </div>

              <div className="border-r border-border/40 pr-2 pt-2 border-t border-border/30">
                <span className="block text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
                  MINIMUM WEIGHT
                </span>
                <span className="font-semibold text-foreground">{spec.weight}</span>
              </div>
              <div className="pl-2 pt-2 border-t border-border/30">
                <span className="block text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
                  TOP SPEED
                </span>
                <span className="font-semibold text-foreground">{spec.topSpeed}</span>
              </div>

              <div className="border-r border-border/40 pr-2 pt-2 border-t border-border/30">
                <span className="block text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
                  AERODYNAMIC CONCEPT
                </span>
                <span className="font-semibold text-foreground">{spec.downforce}</span>
              </div>
              <div className="pl-2 pt-2 border-t border-border/30">
                <span className="block text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
                  TRANSMISSION
                </span>
                <span className="font-semibold text-foreground">{spec.transmission}</span>
              </div>
            </div>

            {/* Technical Highlights Bullet List */}
            <div className="mt-4">
              <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                TECHNICAL HIGHLIGHTS
              </span>
              <ul className="space-y-1.5 font-mono text-[10px] text-muted-foreground">
                {spec.technicalOverview.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-primary rounded-full" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {spec.season}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="border border-primary bg-primary/20 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
            >
              RETURN TO WALKTHROUGH →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
