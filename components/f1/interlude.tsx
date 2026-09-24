'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

/**
 * Pinned typography scene — a single sentence fills the screen,
 * scaling up as you scroll through it. Used as scene transitions.
 */
export function Interlude({
  word,
  accent = false,
}: {
  word: string
  accent?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 1.6])
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0])
  const blur = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [
    'blur(20px)',
    'blur(0px)',
    'blur(0px)',
    'blur(16px)',
  ])
  const glowOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 0.8, 0])

  return (
    <section ref={ref} className="relative h-[180vh]" aria-label={word}>
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        {/* Passing light streak */}
        <motion.div
          aria-hidden="true"
          className="absolute h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{ opacity: glowOpacity }}
        />
        <motion.h2
          className={`select-none text-center font-black leading-none tracking-tighter ${
            accent ? 'text-primary glow-red' : 'text-foreground'
          }`}
          style={{
            scale,
            opacity,
            filter: blur,
            fontSize: 'clamp(4rem, 18vw, 16rem)',
          }}
        >
          {word}
        </motion.h2>
      </div>
    </section>
  )
}

/** Infinite marquee strip */
export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden border-y border-border py-5" aria-hidden="true">
      <div className="marquee flex w-max items-center gap-10">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        ))}
      </div>
    </div>
  )
}
