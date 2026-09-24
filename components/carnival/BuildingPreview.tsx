'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CarnivalEntrance } from './types'

interface BuildingPreviewProps {
  entrance: CarnivalEntrance | null
  onCancel: () => void
}

export default function BuildingPreview({ entrance, onCancel }: BuildingPreviewProps) {
  const router = useRouter()
  const [isVisiting, setIsVisiting] = useState(false)

  useEffect(() => {
    setIsVisiting(false)
  }, [entrance?.id])

  const visit = () => {
    if (!entrance) return
    setIsVisiting(true)
    window.setTimeout(() => router.push(entrance.href), 420)
  }

  return (
    <AnimatePresence>
      {entrance && (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-35"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${entrance.accent}55, transparent 58%)`,
            }}
          />
          <motion.div
            className="relative grid w-full max-w-5xl overflow-hidden border border-white/15 bg-black/90 shadow-[0_30px_100px_rgba(0,0,0,0.75)] backdrop-blur-2xl md:grid-cols-[1.2fr_0.8fr]"
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
            style={{ boxShadow: `0 0 0 1px ${entrance.accent}33, 0 30px 100px rgba(0,0,0,0.75)` }}
          >
            <div className="relative min-h-[310px] md:min-h-[520px]">
              <Image
                src={entrance.image}
                alt=""
                fill
                sizes="(min-width: 768px) 54rem, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/35" />
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, transparent, ${entrance.accent}, transparent)` }}
              />
              <div className="absolute left-5 top-5 border border-white/20 bg-black/65 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.32em] text-white/75 backdrop-blur-xl">
                Destination locked
              </div>
              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 border border-white/15 bg-black/70 backdrop-blur-xl">
                {[
                  ['Mode', entrance.mode],
                  ['Level', entrance.difficulty],
                  ['Reward', entrance.rewards],
                ].map(([label, value]) => (
                  <div key={label} className="border-r border-white/10 px-3 py-3 last:border-r-0">
                    <div className="font-mono text-[8px] uppercase tracking-[0.28em] text-white/45">
                      {label}
                    </div>
                    <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-white">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 md:p-9">
              <div>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.45em]"
                  style={{ color: entrance.accent }}
                >
                  {entrance.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-black uppercase tracking-[0.08em] text-white md:text-5xl">
                  {entrance.title}
                </h2>
                <div className="mt-5 h-px w-full bg-white/15">
                  <div className="h-px w-24" style={{ backgroundColor: entrance.accent }} />
                </div>
                <p className="mt-5 text-sm leading-7 text-white/68">{entrance.description}</p>

                <div className="mt-7 border border-white/12 bg-white/[0.035] p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/45">
                    Mission briefing
                  </div>
                  <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                    <span style={{ color: entrance.accent }}>01</span>
                    <span>Confirm destination preview</span>
                    <span style={{ color: entrance.accent }}>02</span>
                    <span>Transition from carnival route</span>
                    <span style={{ color: entrance.accent }}>03</span>
                    <span>Resume existing section experience</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={visit}
                  disabled={isVisiting}
                  className="light-sweep border px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white transition-opacity disabled:opacity-60"
                  style={{ borderColor: entrance.accent, backgroundColor: `${entrance.accent}cc` }}
                >
                  {isVisiting ? 'Loading' : entrance.actionLabel}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isVisiting}
                  className="border border-white/20 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70 transition-colors hover:border-white/45 hover:text-white disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>

            {isVisiting && (
              <motion.div
                className="absolute inset-0 bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.38 }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
