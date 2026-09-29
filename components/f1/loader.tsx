'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { sceneLoadingManager, SceneLoadingState } from '@/lib/loading/sceneLoadingManager'

import formula1Logo from '../../public/images/Short_Banner_Imges/formula_logo_1.png'

const SPEED_LINES = [
  { top: '18%', delay: 0, duration: 0.9, width: 180 },
  { top: '32%', delay: 0.3, duration: 0.7, width: 260 },
  { top: '47%', delay: 0.1, duration: 1.1, width: 140 },
  { top: '61%', delay: 0.5, duration: 0.8, width: 220 },
  { top: '76%', delay: 0.2, duration: 1.0, width: 170 },
]

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [loadingState, setLoadingState] = useState<SceneLoadingState>(() =>
    sceneLoadingManager.getState()
  )
  const [displayProgress, setDisplayProgress] = useState(0)
  const [done, setDone] = useState(false)
  const { t } = useLanguage()

  // Subscribe to real asset download, GLB parsing, and scene readiness
  useEffect(() => {
    const unsubscribe = sceneLoadingManager.subscribe((state) => {
      setLoadingState(state)
    })
    return unsubscribe
  }, [])

  // Smoothly interpolate display progress towards real loading progress
  useEffect(() => {
    let animId: number
    const target = loadingState.progress

    const step = () => {
      setDisplayProgress((prev) => {
        if (prev < target) {
          const delta = Math.max(1, Math.ceil((target - prev) * 0.18))
          const next = Math.min(prev + delta, target)
          return next
        }
        return prev
      })

      if (displayProgress < target) {
        animId = requestAnimationFrame(step)
      }
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [loadingState.progress, displayProgress])

  // Transition away ONLY when the application is actually ready for interaction
  useEffect(() => {
    if (loadingState.isApplicationReady && displayProgress >= 99) {
      const exitTimer = setTimeout(() => {
        setDone(true)
        setTimeout(onComplete, 700)
      }, 350)
      return () => clearTimeout(exitTimer)
    }

    // Safety timeout (25s) in case of unexpected network stall on slow devices
    const safetyTimer = setTimeout(() => {
      setDone(true)
      setTimeout(onComplete, 700)
    }, 25000)

    return () => clearTimeout(safetyTimer)
  }, [loadingState.isApplicationReady, displayProgress, onComplete])

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-background select-none pointer-events-auto"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(16px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
                  alt="Formula One logo"
                  className="h-[25vh] w-full object-cover"
                />
              </motion.h1>
            </motion.div>

            {/* Meaningful Real Loading Status Message */}
            <motion.p
              key={loadingState.statusMessage}
              className="font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground text-center"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loadingState.statusMessage || t.loader.engineIgnition}
            </motion.p>

            {/* Real Progress Bar */}
            <div className="relative h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-primary to-red-400 rounded-full"
                style={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>

            {/* Accurate Percentage Display */}
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {String(displayProgress).padStart(3, '0')}
              <span className="text-primary font-bold"> / 100%</span>
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
