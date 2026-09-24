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

export function Hero() {
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
      className="relative flex h-svh items-center w-full justify-center overflow-hidden"
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        mx.set((e.clientX - rect.left) / rect.width - 0.5)
        my.set((e.clientY - rect.top) / rect.height - 0.5)
      }}
      aria-label="Formula One reimagined hero"
    >
      <motion.div
        className="absolute w-full inset-0"
        style={{ scale: exitScale, filter: exitBlur, opacity: exitOpacity }}
      >
        {/* Layer 1: racing scene */}
        <motion.div className="absolute -inset-8" style={{ x: bgX, y: bgY }}>
          <img
            src="/images/hero-car.png"
            alt=""
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
        </motion.div>

         {/* Layer 1: racing scene */}
        <motion.div className="absolute z-40 -inset-2" style={{ x: bgX, y: bgY }}>
          <img
            src="/images/orange-mac-driver.png"
            alt=""
            className="h-full absolute right-0 w-[40%] object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
        </motion.div>

        

        {/* Layer 2: moving gradient light */}
        <motion.div
          aria-hidden="true"
          className="drift absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 45% at ${'50%'} 60%, oklch(0.58 0.235 28 / 14%), transparent 70%)`,
            backgroundPositionX: lightX,
          }}
        />

        {/* Layer 3: floating speed particles */}
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute rounded-full bg-speed/70"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ y: [-8, 8, -8], opacity: [0.3, 0.9, 0.3] }}
            transition={{
              duration: 5 + i,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      {/* Typography */}
      <motion.div
        className="absolute left-0 z-40 flex flex-col items-left px-6 text-left"
        style={{ x: typeX, y: typeY, opacity: exitOpacity }}
      >
        <motion.p
          className="mb-6 font-mono text-[10px] uppercase tracking-[0.6em] text-speed md:text-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
         
        </motion.p>

        <h1 className="text-balance font-black leading-[0.85] tracking-tighter">
        <span className="block overflow-hidden">
            <motion.span
              className="block text-[12vw] md:text-[8vw]"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
            >
              {t.hero.title0}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-[12vw] md:text-[8vw]"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
            >
              {t.hero.title1}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-[16vw] text-primary glow-red md:text-[8vw]"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1, delay: 0.32, ease: [0.19, 1, 0.22, 1] }}
            >
              {t.hero.title2}
            </motion.span>
          </span>
       <motion.span
            className="block text-[16vw] md:text-[8vw] text-transparent"
            style={{
              WebkitTextStroke: "2px white",
            }}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1, delay: 0.32, ease: [0.19, 1, 0.22, 1] }}
          >
            {t.hero.title3}
          </motion.span>

        </h1>

       {/* <motion.p
          className="mt-8 max-w-md text-pretty font-extralight leading-relaxed text-muted-foreground md:text-lg"
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          
        </motion.p>

        <motion.div
          className="mt-10 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <Magnetic>
            <a
              href="#stories"
              className="light-sweep pulse-glow inline-block bg-primary px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground"
            >
              {t.hero.startEngine}
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#drivers"
              className="inline-block border border-border px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-foreground transition-colors hover:border-foreground"
            >
              {t.hero.theGrid}
            </a>
          </Magnetic>
        </motion.div> */}

      </motion.div>

      {/* Secondary Driver images for the upper layers */}
      <motion.div
        className="absolute w-full z-40 inset-0">
              {/* Layer 1: racing scene */}
        <motion.div className="absolute z-40 -inset-2" style={{ x: bgX1, y: bgY1 }}>
          <img
            src="/images/red-ferrari-driver.png"
            alt=""
            className="h-full absolute right-24 w-[40%] object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-transparent" />
        </motion.div>

        </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        style={{ opacity: exitOpacity }}
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          {t.hero.scroll}
        </span>
        <motion.span
          className="h-10 w-px bg-gradient-to-b from-primary to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
