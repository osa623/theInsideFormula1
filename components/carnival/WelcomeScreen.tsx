'use client'

import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import formula1Logo from '@/public/images/Short_Banner_Imges/formula_logo_1.png'

export interface WelcomeScenario {
  id: number
  code: string
  title: string
  subtitle: string
  description: string
  image: string
  tags: string[]
  animationVariant: {
    initial: { scale: number; x: string; y: string }
    animate: { scale: number[]; x: string[]; y: string[] }
    transition: Transition
  }
}

const SCENARIOS: WelcomeScenario[] = [
  {
    id: 1,
    code: '01 / 05',
    title: 'THE CARNIVAL',
    subtitle: 'INTERACTIVE MOTORSPORT FESTIVAL',
    description:
      'Step into an expansive interactive Formula One world where high-speed motorsport heritage, real-time telemetry, and exploratory 3D environments come together.',
    image: '/images/Welcome_images/loading1.png',
    tags: ['IMMERSIVE 3D WORLD', 'EXPLORATION', 'DYNAMIC SOUNDSCAPES'],
    animationVariant: {
      initial: { scale: 1.05, x: '0%', y: '0%' },
      animate: { scale: [1.05, 1.14], x: ['0%', '3.5%'], y: ['0%', '-1%'] },
      transition: { duration: 6.5, ease: 'easeOut' },
    },
  },
  {
    id: 2,
    code: '02 / 05',
    title: 'THE EXHIBITION HALL',
    subtitle: 'HISTORIC & MODERN RACING ICONS',
    description:
      'Inspect legendary Formula 1 machinery in meticulous 3D detail. Explore aerodynamics breakthroughs, vehicle mechanics, and synchronized audio-guided walkthroughs.',
    image: '/images/Welcome_images/exhibitionLoading3.png',
    tags: ['ICONIC F1 CARS', 'OBSERVATION MODE', 'TECHNICAL NARRATIONS'],
    animationVariant: {
      initial: { scale: 1.15, x: '0%', y: '0%' },
      animate: { scale: [1.15, 1.06], x: ['0%', '-3.5%'], y: ['0%', '1%'] },
      transition: { duration: 6.5, ease: 'easeOut' },
    },
  },
  {
    id: 3,
    code: '03 / 05',
    title: 'THE EDUCATIONAL ZONE',
    subtitle: 'F1 DRIVING ACADEMY & ENGINEERING',
    description:
      'Master vehicle aerodynamics, chassis balance, tire degradation physics, and braking dynamics through dedicated interactive motorsport training modules.',
    image: '/images/Welcome_images/loading2.png',
    tags: ['AERODYNAMICS', 'BRAKING TELEMETRY', 'RACING LINE THEORY'],
    animationVariant: {
      initial: { scale: 1.08, x: '-2%', y: '-1%' },
      animate: { scale: [1.08, 1.15], x: ['-2%', '2.5%'], y: ['-1%', '1.5%'] },
      transition: { duration: 6.5, ease: 'easeOut' },
    },
  },
  {
    id: 4,
    code: '04 / 05',
    title: 'INTERACTIVE ARENA & QUIZ',
    subtitle: 'COMPETITION, KIOSKS & GAMING',
    description:
      'Test your technical motorsport acumen at the 40-question FIA certification kiosks, challenge simulation reaction stations, and discover interactive exhibits.',
    image: '/images/Welcome_images/loading4.png',
    tags: ['40-QUESTION EXAM', 'SIMULATION MINIGAMES', 'FIA TELEMETRY KIOSK'],
    animationVariant: {
      initial: { scale: 1.14, x: '2.5%', y: '1%' },
      animate: { scale: [1.14, 1.06], x: ['2.5%', '-2.5%'], y: ['1%', '-1%'] },
      transition: { duration: 6.5, ease: 'easeOut' },
    },
  },
  {
    id: 5,
    code: '05 / 05',
    title: 'CHAMPIONSHIP HERITAGE',
    subtitle: 'WORLD DRIVERS & CONSTRUCTORS',
    description:
      'Celebrate iconic World Champions from Michael Schumacher and Sebastian Vettel to Max Verstappen and Lando Norris, surrounded by the pinnacle of motorsport history.',
    image: '/images/Welcome_images/loading5.png',
    tags: ['WORLD CHAMPIONS', 'HALL OF FAME', 'CAREER HISTORIES'],
    animationVariant: {
      initial: { scale: 1.06, x: '-1.5%', y: '1%' },
      animate: { scale: [1.06, 1.13], x: ['-1.5%', '3%'], y: ['1%', '-1.5%'] },
      transition: { duration: 6.5, ease: 'easeOut' },
    },
  },
]

const SCENARIO_DURATION_MS = 5500

interface WelcomeScreenProps {
  isOpen: boolean
  onEnter: () => void
}

export default function WelcomeScreen({ isOpen, onEnter }: WelcomeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const lastTimeRef = useRef<number | null>(null)
  const progressRef = useRef(0)

  // Preload all 5 scenario images
  useEffect(() => {
    SCENARIOS.forEach((scenario) => {
      const img = new window.Image()
      img.src = scenario.image
    })
  }, [])

  const nextScenario = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SCENARIOS.length)
    setProgress(0)
    progressRef.current = 0
  }, [])

  const prevScenario = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SCENARIOS.length) % SCENARIOS.length)
    setProgress(0)
    progressRef.current = 0
  }, [])

  const selectScenario = useCallback((idx: number) => {
    setCurrentIndex(idx)
    setProgress(0)
    progressRef.current = 0
  }, [])

  // Auto-progression timer loop
  useEffect(() => {
    if (!isOpen) return

    let animationFrameId: number

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now
      }
      const delta = now - lastTimeRef.current
      lastTimeRef.current = now

      if (!isPaused) {
        progressRef.current += delta / SCENARIO_DURATION_MS
        if (progressRef.current >= 1) {
          progressRef.current = 0
          setCurrentIndex((prev) => (prev + 1) % SCENARIOS.length)
        }
        setProgress(Math.min(progressRef.current * 100, 100))
      }

      animationFrameId = requestAnimationFrame(tick)
    }

    animationFrameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationFrameId)
      lastTimeRef.current = null
    }
  }, [isOpen, isPaused])

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        nextScenario()
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        prevScenario()
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        onEnter()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, nextScenario, onEnter, prevScenario])

  if (!isOpen) return null

  const currentScenario = SCENARIOS[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-screen-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, filter: 'blur(16px)' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="fixed inset-0 z-[110] select-none overflow-hidden bg-black text-white"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Fullscreen Animated Scenario Image (GTA V Style Pan & Zoom) */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScenario.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <motion.img
                src={currentScenario.image}
                alt={currentScenario.title}
                initial={currentScenario.animationVariant.initial}
                animate={currentScenario.animationVariant.animate}
                transition={currentScenario.animationVariant.transition}
                className="h-full w-full object-cover object-center will-change-transform"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Cinematic Vignettes and Gradients */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,0.92) 100%)',
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65vh] bg-gradient-to-t from-black via-black/75 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28vh] bg-gradient-to-b from-black/85 via-black/40 to-transparent" />

        {/* Scanlines / Subtle Racing Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* TOP HEADER BAR */}
        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
          <div className="flex items-center gap-4">
            <img
              src={formula1Logo.src}
              alt="Formula 1 Logo"
              className="h-7 w-auto object-contain drop-shadow-[0_2px_12px_rgba(225,6,0,0.5)] md:h-9"
            />
            <div className="hidden h-6 w-px bg-white/20 sm:block" />
            <div className="hidden flex-col sm:flex">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[#00d2be]">
                FIA TECHNICAL EXHIBITION
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/50">
                THE INSIDE FORMULA ONE // IMMERSIVE WORLD
              </span>
            </div>
          </div>

          {/* Scenario Counter Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#e10600] animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-[0.25em] text-white">
                SCENE {currentScenario.code}
              </span>
            </div>
          </div>
        </header>

        {/* MAIN CINEMATIC CONTENT (BOTTOM-LEFT) */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end px-6 pb-28 md:px-14 md:pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScenario.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl space-y-4"
            >
              {/* Category Subtitle */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded border border-[#e10600]/60 bg-[#e10600]/20 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#ff4d48]">
                  {currentScenario.subtitle}
                </span>
                {currentScenario.tags.map((tag) => (
                  <span
                    key={tag}
                    className="hidden rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] tracking-wider text-white/60 sm:inline-block"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Scenario Title */}
              <h1 className="text-3xl font-black uppercase tracking-wider text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-5xl md:text-6xl">
                {currentScenario.title}
              </h1>

              {/* Description */}
              <p className="max-w-2xl text-sm leading-relaxed text-white/80 drop-shadow md:text-base">
                {currentScenario.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM CONTROLS & NAVIGATION BAR */}
        <footer className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3 border-t border-white/10 bg-black/80 px-6 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-12 md:py-4">
          {/* Scenario Step Indicators & Progress */}
          <div className="flex items-center gap-2 md:gap-3">
            {SCENARIOS.map((sc, idx) => {
              const isActive = idx === currentIndex
              const isPast = idx < currentIndex
              return (
                <button
                  key={sc.id}
                  onClick={() => selectScenario(idx)}
                  className={`group relative flex h-9 items-center gap-2 rounded px-3 transition-colors ${
                    isActive
                      ? 'border border-[#e10600] bg-[#e10600]/20 text-white'
                      : 'border border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                  aria-label={`Jump to scene ${idx + 1}`}
                >
                  <span className="font-mono text-xs font-bold tracking-widest">
                    0{idx + 1}
                  </span>
                  <span className="hidden font-mono text-[10px] uppercase tracking-wider md:inline-block">
                    {sc.title}
                  </span>

                  {/* Active progress bar underneath */}
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b bg-white/20">
                      <div
                        className="h-full bg-[#00d2be] transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  {isPast && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b bg-[#e10600]" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center justify-between gap-3 md:justify-end">
            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevScenario}
                className="flex h-9 items-center justify-center rounded border border-white/15 bg-white/5 px-3 font-mono text-xs font-bold text-white/70 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                title="Previous Scene (Left Arrow)"
              >
                ← PREV
              </button>
              <button
                onClick={nextScenario}
                className="flex h-9 items-center justify-center rounded border border-white/15 bg-white/5 px-3 font-mono text-xs font-bold text-white/70 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                title="Next Scene (Right Arrow)"
              >
                NEXT →
              </button>
            </div>

            {/* Primary Enter Carnival CTA */}
            <button
              onClick={onEnter}
              className="group relative flex h-10 items-center gap-2 overflow-hidden rounded border border-[#e10600] bg-gradient-to-r from-[#e10600] to-[#b30500] px-5 font-mono text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(225,6,0,0.45)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(225,6,0,0.7)] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                ENTER CARNIVAL
                <span className="text-white/60 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
              <span className="hidden font-mono text-[9px] text-white/60 lg:inline-block">
                [ENTER]
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
            </button>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  )
}
