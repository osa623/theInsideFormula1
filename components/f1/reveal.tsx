'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const letterVariants: Variants = {
  hidden: { y: '110%', rotate: 4, opacity: 0 },
  visible: (i: number) => ({
    y: '0%',
    rotate: 0,
    opacity: 1,
    transition: {
      delay: i * 0.035,
      duration: 0.7,
      ease: [0.19, 1, 0.22, 1],
    },
  }),
}

export function LetterReveal({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  return (
    <span className={className} aria-label={text} role="text">
      {text.split('').map((char, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden="true">
          <motion.span
            className="inline-block will-change-transform"
            custom={i + delay * 40}
            variants={letterVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true, margin: '-10%' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  return (
    <span className={className} aria-label={text} role="text">
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden="true">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{
              delay: delay + i * 0.08,
              duration: 0.8,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            {word}
          </motion.span>
          {'\u00A0'}
        </span>
      ))}
    </span>
  )
}

export function BlurReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: 'blur(16px)', y: 30 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay, duration: 1, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function ScaleReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay, duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({
  value,
  suffix = '',
  className,
}: {
  value: number
  suffix?: string
  className?: string
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      onViewportEnter={(entry) => {
        const el = entry?.target as HTMLElement | null
        if (!el) return
        const duration = 1400
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          el.textContent = `${Math.round(eased * value)}${suffix}`
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }}
    >
      0{suffix}
    </motion.span>
  )
}
