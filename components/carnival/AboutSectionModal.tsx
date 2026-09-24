'use client'

import { useEffect } from 'react'
import { Globe, X } from 'lucide-react'

interface AboutSectionModalProps {
  isOpen: boolean
  onClose: () => void
}

const WEBSITE_URL = 'https://www.osandahirushaka.tech/'
const CREDITS_URL = 'https://f120172021.vercel.app/credits'

export default function AboutSectionModal({ isOpen, onClose }: AboutSectionModalProps) {
  useEffect(() => {
    if (!isOpen) return

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

  const handleOpenLink = () => {
    window.open(WEBSITE_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[92vh] overflow-y-auto bg-[#080b11] border-2 border-[#f40612]/70 rounded-3xl shadow-[0_0_90px_rgba(244,6,18,0.45)] p-6 sm:p-10 flex flex-col items-center text-center font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 h-11 w-11 rounded-full bg-white/10 hover:bg-[#f40612] flex items-center justify-center text-white transition-all cursor-pointer border border-white/20 shadow-md"
          title="Close [E / ESC]"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 bg-[#f40612]/20 border border-[#f40612]/60 rounded-full font-mono text-xs uppercase tracking-widest text-[#ff1e27] mb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f40612] animate-pulse" />
          <span>OFFICIAL DEVELOPER PROFILE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
          About the Creator
        </h2>
        <p className="text-sm sm:text-base text-white/70 mt-1 max-w-md font-mono">
          Formula 1 Carnival & 3D Interactive Exhibition Experience
        </p>

        {/* Enlarged QR Code Container */}
        <div className="mt-6 p-6 sm:p-8 bg-white rounded-2xl shadow-2xl border-4 border-[#f40612]/70 transition-transform hover:scale-105 duration-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/models/QR.png"
            alt="Creator Website QR Code"
            className="w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] object-contain"
          />
        </div>
        <p className="mt-5 font-mono font-thin text-xs sm:text-sm uppercase tracking-wider text-white/70">
          Hey F1 Buddies! , I'm Osanda Hirushaka, the creator of this interactive Formula 1 Carnival & Exhibition Experience. I built this project to bring the thrill of F1 to your screens, allowing you to explore the exhibition grounds and circuit map in 3D. Your support means a lot!
        </p>
        <p className="mt-5 font-mono text-xs sm:text-sm uppercase tracking-wider text-white/70">
          SCAN WITH YOUR PHONE CAMERA OR CLICK THE LINK BELOW
        </p>

        {/* Enlarged Clickable Website Link with Globe Icon */}
        <div className="mt-5 w-full max-w-2xl bg-[#0e131d] border-2 border-white/20 hover:border-[#f40612] rounded-2xl p-4 sm:p-6 transition-all flex items-center justify-center gap-4 group cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(244,6,18,0.35)]">
          {/* Clickable Globe Icon */}
          <button
            type="button"
            onClick={handleOpenLink}
            className="p-3.5 rounded-xl bg-[#f40612] text-white hover:bg-[#ff1e27] hover:scale-110 transition-all cursor-pointer shadow-lg shrink-0"
            title="Open Website (opens in new tab)"
            aria-label="Open Creator Website"
          >
            <Globe className="w-8 h-8 animate-spin-slow" />
          </button>

          {/* Clickable Website Address Text */}
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-lg sm:text-2xl md:text-3xl font-black text-white group-hover:text-[#ff1e27] transition-colors truncate"
          >
            MEET THE DEVELOPER
          </a>


        </div>

      {/* Enlarged Clickable Credits Link with Globe Icon */}
        <div className="mt-5 w-full max-w-2xl bg-[#0e131d] border-2 border-white/20 hover:border-[#f40612] rounded-2xl p-4 sm:p-6 transition-all flex items-center justify-center gap-4 group cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(244,6,18,0.35)]">
          {/* Clickable Globe Icon */}
          <button
            type="button"
            onClick={handleOpenLink}
            className="p-3.5 rounded-xl bg-[#f47506] text-white hover:bg-[#ff1e1e] hover:scale-110 transition-all cursor-pointer shadow-lg shrink-0"
            title="Open Website (opens in new tab)"
            aria-label="Open Creator Website"
          >
            <Globe className="w-8 h-8 animate-spin-slow" />
          </button>

          {/* Clickable Website Address Text */}
          <a
            href={CREDITS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-lg sm:text-2xl md:text-3xl font-black text-white group-hover:text-[#ff1e27] transition-colors truncate"
          >
            CREDITS
          </a>


        </div>

        {/* Footer Prompt */}
        <div className="mt-6 font-mono text-xs text-white/50">
          PRESS <strong className="text-white font-bold">[E]</strong> OR <strong className="text-white font-bold">[ESC]</strong> TO RETURN
        </div>
      </div>
    </div>
  )
}
