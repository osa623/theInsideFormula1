'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { CarnivalExplainZone } from './types'

interface ExplainZonePreviewProps {
  explainZone: CarnivalExplainZone | null
  onClose: () => void
}

export default function ExplainZonePreview({ explainZone, onClose }: ExplainZonePreviewProps) {
  return (
    <AnimatePresence>
      {explainZone && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-black/90 backdrop-blur-xl select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {/* Background image display */}
          <div className="absolute inset-0 z-0">
            <Image
              src={explainZone.image}
              alt={explainZone.title}
              fill
              sizes="100vw"
              className="object-cover opacity-60 scale-105 transition-transform duration-1000 ease-out"
              priority
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(circle at 70% 30%, ${explainZone.accent}44, transparent 70%)`,
              }}
            />
            {/* Tech grid overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          {/* Top Bar Header */}
          <div className="relative z-10 flex items-center justify-between p-6 md:p-10">
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full animate-pulse"
                style={{ backgroundColor: explainZone.accent }}
              />
              <span className="font-mono text-xs uppercase tracking-[0.35em] text-white/80">
                EXPLANATION DISPLAY // {explainZone.id}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-3 border border-white/20 bg-black/60 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.25em] text-white/80 backdrop-blur-md transition-all hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              <span>EXIT FULLSCREEN</span>
              <span className="flex h-5 w-5 items-center justify-center rounded border border-white/30 text-[10px] text-white/60 group-hover:border-white/60 group-hover:text-white">
                ✕
              </span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pb-12 md:px-10 md:pb-16">
            <motion.div
              className="grid gap-8 lg:grid-cols-12 lg:items-end"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {/* Text Information Column */}
              <div className="lg:col-span-7">
                <div className="inline-block border border-white/20 bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.4em] text-white/70 backdrop-blur-md">
                  {explainZone.eyebrow}
                </div>

                <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-6xl md:text-7xl">
                  {explainZone.title}
                </h1>

                <div className="mt-4 h-1 w-32" style={{ backgroundColor: explainZone.accent }} />

                <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                  {explainZone.description}
                </p>

                {/* Info Pills */}
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="border border-white/15 bg-black/40 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white/90 backdrop-blur-md">
                    <span className="text-white/40">Status: </span>
                    <span style={{ color: explainZone.accent }}>Interactive Preview</span>
                  </div>
                  <div className="border border-white/15 bg-black/40 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white/90 backdrop-blur-md">
                    <span className="text-white/40">Mode: </span>
                    <span>Fullscreen Screen View</span>
                  </div>
                </div>
              </div>

              {/* Media Preview Box (Ready for custom videos/images) */}
              <div className="lg:col-span-5">
                <div className="relative aspect-video w-full overflow-hidden border border-white/20 bg-black/80 shadow-2xl backdrop-blur-md">
                  <Image
                    src={explainZone.image}
                    alt={`${explainZone.title} Display`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
                    MANUAL MEDIA SLOT // VIDEO / IMAGE READY
                  </div>
                  <div
                    className="absolute top-0 right-0 border-l border-b border-white/20 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-white/50"
                    style={{ backgroundColor: `${explainZone.accent}33` }}
                  >
                    PREVIEW SCREEN
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Controls Bar */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 bg-black/80 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 backdrop-blur-md md:px-10">
            <div>PRESS <kbd className="rounded border border-white/30 px-1.5 py-0.5 text-white/80">ESC</kbd> OR CLICK EXIT TO RETURN</div>
            <div className="hidden sm:block">FORMULA 1 CARNIVAL // EXPLANATION ZONE</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
