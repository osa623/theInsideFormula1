'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Magnetic } from './magnetic'
import { WordReveal } from './reveal'

export function Finale() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const glow = useTransform(scrollYProgress, [0.3, 1], [0, 1])
  const { t } = useLanguage()

  return (
    <footer ref={ref} className="relative overflow-hidden pt-32 md:pt-48" aria-label="Site footer">
      {/* Rising glow like brake discs at night */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60vh]"
        style={{
          opacity: glow,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 100%, oklch(0.58 0.235 28 / 22%), transparent 70%)',
        }}
      />

      <div className="relative flex flex-col items-center px-5 text-center md:px-10">
        <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.6em] text-speed">
          {t.finale.tag}
        </p>
        <h2 className="text-balance font-black leading-[0.85] tracking-tighter">
          <WordReveal text={t.finale.title1} className="block text-[12vw] md:text-[8vw]" />
          <WordReveal
            text={t.finale.title2}
            className="block text-[12vw] text-primary glow-red md:text-[8vw]"
            delay={0.25}
          />
        </h2>
        <p className="mt-8 max-w-md text-pretty font-extralight leading-relaxed text-muted-foreground">
          {t.finale.subtitle}
        </p>

        <form
          className="mt-10 flex w-full max-w-md items-stretch gap-0"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="footer-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-email"
            type="email"
            required
            placeholder={t.finale.placeholder}
            className="min-w-0 flex-1 border border-border bg-card px-5 py-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <Magnetic strength={0.2}>
            <button
              type="submit"
              className="light-sweep h-full whitespace-nowrap bg-primary px-6 py-4 font-mono text-xs uppercase tracking-[0.25em] text-primary-foreground"
            >
              {t.finale.join}
            </button>
          </Magnetic>
        </form>
      </div>

      {/* Giant ghost wordmark */}
      <div className="relative mt-24 overflow-hidden md:mt-32" aria-hidden="true">
        <motion.p
          className="select-none whitespace-nowrap text-center font-black leading-[0.75] tracking-tighter text-foreground/[0.05]"
          style={{ fontSize: 'clamp(6rem, 22vw, 24rem)' }}
          initial={{ y: '40%' }}
          whileInView={{ y: '10%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
        >
          FORMULA ONE
        </motion.p>
      </div>

      <div className="relative flex flex-col items-center justify-between gap-4 border-t border-border px-5 py-8 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex-row md:px-10">
        <span>{t.finale.credit1}</span>
        <span>{t.finale.credit2}</span>
      </div>
    </footer>
  )
}
