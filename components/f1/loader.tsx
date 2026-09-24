'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'


import formula1Logo from '../../public/images/Short_Banner_Imges/formula_logo_1.png';

const SPEED_LINES = [
  { top: '18%', delay: 0, duration: 0.9, width: 180 },
  { top: '32%', delay: 0.3, duration: 0.7, width: 260 },
  { top: '47%', delay: 0.1, duration: 1.1, width: 140 },
  { top: '61%', delay: 0.5, duration: 0.8, width: 220 },
  { top: '76%', delay: 0.2, duration: 1.0, width: 170 },
]

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const duration = 2400
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      // Non-linear like a rev counter
      const eased = p < 0.7 ? p * 0.8 : 0.56 + (p - 0.7) * 1.4667
      setProgress(Math.min(Math.round(eased * 100), 100))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setDone(true)
        setTimeout(onComplete, 900)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0, filter: 'blur(20px)' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Speed lines */}
          {SPEED_LINES.map((line, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="speedline absolute left-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
              style={{
                top: line.top,
                width: line.width,
                animationDelay: `${line.delay}s`,
                animationDuration: `${line.duration}s`,
              }}
            />
          ))}

          {/* Ignition glow */}
          <motion.div
            aria-hidden="true"
            className="absolute h-64 w-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, oklch(0.58 0.235 28 / 25%) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.6, 1.2, 2], opacity: [0.3, 0.7, 0.5, 0.9] }}
            transition={{ duration: 2.4, ease: 'easeInOut' }}
          />

          {/* Logo */}
          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.h1
                className="text-4xl font-black tracking-[0.35em] text-foreground md:text-6xl"
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
              >
              <img
              src={formula1Logo.src}
              alt ="Formula One logo"
              className="h-[25vh] w-full object-cover"
            />
              </motion.h1>
            </motion.div>

            <motion.p
              className="font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.4, 1] }}
              transition={{ duration: 1.4, delay: 0.5 }}
            >
              {t.loader.engineIgnition}
            </motion.p>

            {/* Progress bar */}
            <div className="relative h-px w-56 overflow-hidden bg-border">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {String(progress).padStart(3, '0')}
              <span className="text-primary"> / 100</span>
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
