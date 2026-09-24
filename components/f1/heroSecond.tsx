'use client'

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Magnetic } from './magnetic'

const PARTICLES = [
  { left: '12%', top: '22%', size: 3, delay: 0 },
  { left: '78%', top: '18%', size: 2, delay: 1.2 },
  { left: '64%', top: '64%', size: 4, delay: 0.6 },
  { left: '28%', top: '72%', size: 2, delay: 2.1 },
  { left: '88%', top: '48%', size: 3, delay: 1.7 },
  { left: '42%', top: '34%', size: 2, delay: 0.9 },
  { left: '8%', top: '56%', size: 3, delay: 2.6 },
]

export function HeroSecond() {
  const ref = useRef<HTMLElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 60, damping: 20 })
  const smy = useSpring(my, { stiffness: 60, damping: 20 })
  const s1mx= useSpring(mx, {stiffness: 100, damping: 40 })
  const s1my= useSpring(my, {stiffness: 100, damping: 40 })

  const bgX = useTransform(smx, [-0.5, 0.5], [18, -18])
  const bgY = useTransform(smy, [-0.5, 0.5], [12, -12])
  const bgX1 = useTransform(s1mx, [-0.8, 0.8], [20, -20])
  const bgY1 = useTransform(s1my, [-0.8, 0.8], [15, -15])
  const typeX = useTransform(smx, [-0.5, 0.5], [-24, 24])
  const typeY = useTransform(smy, [-0.5, 0.5], [-14, 14])
  const lightX = useTransform(smx, [-0.5, 0.5], ['30%', '70%'])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const exitScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const exitBlur = useTransform(scrollYProgress, [0, 1], ['blur(0px)', 'blur(12px)'])
  const exitOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const { t } = useLanguage()

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex  items-center h-[5vh] w-full justify-center overflow-hidden"
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        mx.set((e.clientX - rect.left) / rect.width - 0.5)
        my.set((e.clientY - rect.top) / rect.height - 0.5)
      }}
      aria-label="Formula One reimagined hero"
    >
      <motion.div
        className="relative w-full h-auto py-12 inset-0"
        style={{ scale: exitScale, filter: exitBlur, opacity: exitOpacity }}
      >



      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        style={{ opacity: exitOpacity }}
        aria-hidden="true"
      >
        <motion.span
          className="h-10 w-px bg-gradient-to-b from-primary to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      </motion.div>
    </section>
  )
}
