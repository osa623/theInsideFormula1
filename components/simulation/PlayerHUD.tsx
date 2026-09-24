'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ExhibitionTriggerPoint } from './types/exhibition'
import GraphicsQualitySelector from '@/components/graphics/GraphicsQualitySelector'

interface PlayerHUDProps {
  isLocked: boolean
  isInspecting: boolean
  nearbyTrigger: ExhibitionTriggerPoint | null
  inspectingBoardName?: string | null
  onRequestLock: () => void
  onTriggerInteract: () => void
}

export default function PlayerHUD({
  isLocked,
  isInspecting,
  nearbyTrigger,
  inspectingBoardName,
  onRequestLock,
  onTriggerInteract,
}: PlayerHUDProps) {
  let promptText = ''
  let promptTitle = ''

  if (isInspecting) {
    promptText = 'Press [E] or [ESC] to return'
    promptTitle = inspectingBoardName ? `INSPECTING ${inspectingBoardName.toUpperCase()}` : 'EXHIBITION VIEW'
  } else if (nearbyTrigger?.isExit) {
    promptText = 'Press [E] to Return to Carnival'
    promptTitle = 'CARNIVAL MAIN ENTRANCE'
  } else if (nearbyTrigger?.isMap) {
    promptText = 'Press [E] to view Circuit Directory Map'
    promptTitle = 'EXHIBITION DIRECTORY'
  } else if (nearbyTrigger?.qrData) {
    promptText = `Press [E] to inspect ${nearbyTrigger.qrData.year} QR Document`
    promptTitle = nearbyTrigger.qrData.title
  }

  const showPrompt = Boolean(promptText)

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header HUD Bar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="pointer-events-auto border border-white/20 bg-black/85 px-4 py-2.5 backdrop-blur-xl rounded-lg">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e10600] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e10600]"></span>
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white">
              VIRTUAL // EXHIBITION_HALL_02
            </span>
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
            MODE: <span className="font-bold text-[#e10600]">FIRST-PERSON TOUR</span>
          </div>
        </div>

        {/* Graphics Quality Selector & Return to Carnival */}
        <div className="pointer-events-auto flex items-center gap-2">
          <GraphicsQualitySelector />

          <Link
            href="/carnival"
            className="flex items-center gap-1.5 border border-white/20 bg-black/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 hover:text-white hover:border-[#e10600] rounded-lg transition-colors backdrop-blur-xl"
            title="Return to Formula 1 Carnival"
          >
            <span>←</span> CARNIVAL
          </Link>
        </div>
      </div>

      {/* Center FPS Crosshair & Click-to-lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {!isLocked && !isInspecting ? (
          <button
            type="button"
            onClick={onRequestLock}
            className="pointer-events-auto flex flex-col items-center gap-2 border border-[#e10600]/80 bg-black/90 px-8 py-5 backdrop-blur-2xl shadow-[0_0_40px_rgba(225,6,0,0.35)] transition-all hover:bg-[#e10600] hover:text-white rounded-xl cursor-pointer"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-[0.3em]">
              CLICK TO EXPLORE EXHIBITION HALL
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">
              MOUSE LOOK // WASD MOVE // [E] INTERACT
            </span>
          </button>
        ) : (
          !isInspecting && (
            <div className="h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          )
        )}
      </div>

      {/* Bottom Interactive E-Prompt Overlay */}
      <div className="flex justify-center pb-2">
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.15 }}
              onClick={onTriggerInteract}
              className="pointer-events-auto flex items-center gap-3.5 border-2 border-[#e10600]/80 bg-black/90 px-6 py-3.5 backdrop-blur-2xl shadow-[0_0_35px_rgba(225,6,0,0.4)] rounded-xl cursor-pointer hover:bg-black/95 transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#e10600] font-mono text-xs font-black text-white shadow-md">
                E
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {promptText}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">
                  {promptTitle}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
