'use client'

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { LetterReveal } from './reveal'

const HOTSPOTS = [
  {
    id: 'aero',
    x: '12%',
    y: '58%',
    value: '1,800 kg',
  },
  {
    id: 'suspension',
    x: '30%',
    y: '48%',
    value: '3 mm',
  },
  {
    id: 'power',
    x: '55%',
    y: '42%',
    value: '1,000+ hp',
  },
  {
    id: 'ers',
    x: '68%',
    y: '55%',
    value: '120 kW',
  },
  {
    id: 'drs',
    x: '88%',
    y: '35%',
    value: '+12 km/h',
  },
  {
    id: 'tyres',
    x: '78%',
    y: '68%',
    value: '5.0 g',
  },
]

export function Machine() {
  const [activeId, setActiveId] = useState('power')
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()

  const active = HOTSPOTS.find((h) => h.id === activeId)!
  const activeT = t.machine.hotspots[activeId as keyof typeof t.machine.hotspots]

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 70, damping: 18 })
  const smy = useSpring(my, { stiffness: 70, damping: 18 })
  const rotateY = useTransform(smx, [-0.5, 0.5], [-6, 6])
  const rotateX = useTransform(smy, [-0.5, 0.5], [4, -4])

  return (
    <section id="machine" className="relative overflow-hidden py-12 md:py-12" aria-label="The machine">
      {/* Ambient blue light */}
      <div
        aria-hidden="true"
        className="drift pointer-events-none absolute right-0 top-1/4 h-auto w-[600px] rounded-full opacity-50"
        style={{ background: 'radial-gradient(circle, oklch(0.75 0.14 230 / 10%), transparent 70%)' }}
      />

      <div className="px-5 md:px-5">
        <header className="mb-16 items-center justify-center flex flex-col gap-4 md:mb-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-neon">
            {t.machine.tag}
          </p>
          <h2 className="font-black flex leading-[0.85] tracking-tighter">
            <LetterReveal text={t.machine.title1} className=" text-primary text-[13vw] md:text-[15vw]" />
            <LetterReveal
              text={t.machine.title2}
              className="block text-[13vw] text-white md:text-[15vw]"
              delay={0.2}
            />
          </h2>
        </header>
      </div>
    </section>
  )
}
