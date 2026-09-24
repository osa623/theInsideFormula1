'use client'

import React, { useEffect } from 'react'
import { Globe, X, ExternalLink, FileText, CheckCircle2 } from 'lucide-react'
import { ExhibitionQRData } from './types/exhibition'

interface QRDocumentModalProps {
  data: ExhibitionQRData | null
  isOpen: boolean
  onClose: () => void
}

export default function QRDocumentModal({ data, isOpen, onClose }: QRDocumentModalProps) {
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

  if (!isOpen || !data) return null

  const handleOpenLink = () => {
    window.open(data.documentUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full bg-[#0a0d14] border-2 border-white/20 rounded-2xl shadow-[0_0_100px_rgba(225,6,0,0.25)] p-6 sm:p-10 flex flex-col font-sans max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 h-11 w-11 rounded-full bg-white/10 hover:bg-[#e10600] flex items-center justify-center text-white transition-all cursor-pointer border border-white/20 shadow-md group"
          title="Close [E / ESC]"
        >
          <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* Document Header Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-xs">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e10600]/20 border border-[#e10600]/70 rounded-full text-[#ff2200] font-black uppercase tracking-widest">
            <FileText className="w-4 h-4" />
            OFFICIAL FIA TECHNICAL DOSSIER
          </span>
          <span className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-white/70 uppercase">
            REF: DOC-{data.year}-SPEC
          </span>
          <span className="px-3 py-1 bg-green-950/50 border border-green-500/50 rounded-full text-green-400 font-bold uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED ARCHIVE
          </span>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          {data.title}
        </h2>
        <p className="text-sm sm:text-base text-white/70 font-mono mt-1">
          {data.subtitle}
        </p>

        {/* Document Body: Enriched QR on Left, Details & Clickable Link on Right */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Enlarged QR Code Document Frame */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.qrImagePath}
              alt={`${data.year} Specification QR Code`}
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain"
            />
            <div className="mt-4 text-center">
              <span className="font-mono text-xs sm:text-sm font-black uppercase text-neutral-900 tracking-wider block">
                SCAN WITH MOBILE CAMERA
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-neutral-600 block mt-0.5">
                INSTANT ACCESS TO 3D VEHICLE ARCHIVE
              </span>
            </div>
          </div>

          {/* Right Column: Technical Dossier Summary & Enlarged Clickable Document Link */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
            {/* Technical Specifications Sheet */}
            <div className="bg-[#10141e] border border-white/15 rounded-2xl p-5 sm:p-6 font-mono text-xs sm:text-sm space-y-3 shadow-inner">
              <div className="text-xs uppercase tracking-widest text-[#e10600] font-black border-b border-white/10 pb-2 flex items-center justify-between">
                <span>VEHICLE ARCHIVE SPECIFICATIONS</span>
                <span className="text-white/40 font-normal">FIA CLASS: FORMULA 1</span>
              </div>

              {data.specs.engine && (
                <div className="flex justify-between items-baseline border-b border-white/5 py-1.5">
                  <span className="text-white/50">POWER UNIT:</span>
                  <span className="text-white font-bold text-right ml-2">{data.specs.engine}</span>
                </div>
              )}

              {data.specs.power && (
                <div className="flex justify-between items-baseline border-b border-white/5 py-1.5">
                  <span className="text-white/50">OUTPUT:</span>
                  <span className="text-[#00d2be] font-black text-right ml-2">{data.specs.power}</span>
                </div>
              )}

              {data.specs.weight && (
                <div className="flex justify-between items-baseline border-b border-white/5 py-1.5">
                  <span className="text-white/50">WEIGHT:</span>
                  <span className="text-white font-bold text-right ml-2">{data.specs.weight}</span>
                </div>
              )}

              {data.specs.championshipResult && (
                <div className="flex flex-col pt-1.5">
                  <span className="text-white/50 text-[11px] uppercase">SEASON RECORD:</span>
                  <span className="text-[#ffcc00] font-bold text-sm mt-0.5">{data.specs.championshipResult}</span>
                </div>
              )}
            </div>

            {/* Enlarged Clickable Web Link Section */}
            <div
              onClick={handleOpenLink}
              className="bg-[#121824] hover:bg-[#161e2e] border-2 border-white/20 hover:border-[#e10600] rounded-2xl p-5 sm:p-6 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(225,6,0,0.3)]"
              title="Click to open web page document (opens in new tab)"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="p-3.5 rounded-xl bg-[#e10600] text-white group-hover:scale-110 group-hover:bg-[#ff1e27] transition-all shadow-lg shrink-0">
                  <Globe className="w-7 h-7" />
                </div>
                <div className="overflow-hidden">
                  <span className="block font-mono text-xs text-white/50 uppercase tracking-widest">
                    ONLINE SPECIFICATION DOSSIER
                  </span>
                  <span className="block font-mono text-base sm:text-lg font-black text-white group-hover:text-[#ff2200] transition-colors truncate">
                    {data.documentUrl}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 group-hover:bg-[#e10600] text-white rounded-xl text-xs sm:text-sm font-mono font-black transition-all shrink-0 shadow-md">
                <span>VIEW WEB DOSSIER</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Prompt */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs text-white/50">
          <span>PRESS <strong className="text-white">[E]</strong> OR <strong className="text-white">[ESC]</strong> TO RETURN</span>
          <span className="hidden sm:inline">FORMULA 1 ARCHIVE SYSTEM</span>
        </div>
      </div>
    </div>
  )
}
