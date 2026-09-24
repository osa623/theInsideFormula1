'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useLanguage } from '@/lib/language-context'
import { LetterReveal } from './reveal'

// Stylized circuit line art (abstract, decorative)
const TRACKS: Record<string, string> = {
  melbourne:
    'M20 70 C15 55 25 35 45 30 C65 25 70 15 95 20 C120 25 145 35 140 55 C135 75 110 80 90 70 C70 60 55 85 35 80 C25 78 22 75 20 70 Z',

  shanghai:
    'M25 55 C20 35 45 20 70 25 C90 28 110 15 130 30 C145 45 120 55 105 60 C90 65 120 80 100 85 C75 95 40 85 35 70 C30 60 25 60 25 55 Z',

  suzuka:
    'M20 40 C35 15 75 10 95 30 C110 45 85 55 75 65 C65 75 90 85 120 75 C145 65 150 40 130 30 C110 20 95 35 100 50 C105 70 125 85 140 70',

  sakhir:
    'M25 30 C45 15 90 15 120 25 C145 35 135 55 115 55 C95 55 90 75 115 80 C80 90 40 80 30 60 C20 45 20 35 25 30 Z',

  jeddah:
    'M30 20 C60 15 110 20 135 35 C145 45 130 55 110 50 C90 45 85 65 105 75 C80 90 40 80 35 60 C30 45 20 35 30 20 Z',

  miami:
    'M25 35 L55 25 C80 20 100 30 125 25 C145 25 145 45 130 55 C110 70 120 85 95 85 C70 85 65 65 45 65 C25 65 15 50 25 35 Z',

  montreal:
    'M20 30 C45 20 65 35 85 25 C110 10 135 25 130 45 C125 60 100 55 90 70 C80 85 45 80 35 60 C25 50 15 40 20 30 Z',

  monaco:
    'M20 70 C25 35 50 20 70 35 C90 50 110 20 135 35 C150 45 135 65 115 65 C90 65 85 85 60 75 C45 70 30 85 20 70 Z',

  catalunya:
    'M20 55 C25 30 55 20 75 35 C95 50 110 25 135 35 C150 45 135 65 115 70 C95 75 85 90 60 80 C40 75 15 75 20 55 Z',

  redbullring:
    'M25 25 C45 15 80 20 95 35 L125 25 C140 30 135 50 115 55 L100 75 C75 85 45 75 35 55 C25 45 20 35 25 25 Z',

  silverstone:
    'M15 55 C20 30 45 25 65 35 C80 45 90 25 110 20 C135 20 150 45 135 60 C120 75 95 65 80 75 C60 90 25 80 15 55 Z',

  spa:
    'M20 35 C45 15 80 20 100 35 C120 50 145 35 140 60 C135 80 100 75 85 65 C70 55 55 85 35 75 C20 65 15 50 20 35 Z',

  hungaroring:
    'M25 40 C35 20 70 25 85 35 C100 45 125 25 140 45 C150 65 120 75 100 65 C80 55 70 85 45 75 C25 70 15 55 25 40 Z',

  zandvoort:
    'M25 30 C55 15 95 20 125 35 C145 50 120 60 105 65 C90 70 110 85 80 85 C50 85 25 65 25 30 Z',

  monza:
    'M35 20 C60 15 110 20 130 35 C145 50 125 65 105 60 C85 55 75 85 55 80 C35 75 20 50 35 20 Z',

  madrid:
    'M20 45 C35 20 70 25 90 35 C110 45 140 25 145 50 C140 75 110 65 90 70 C70 80 45 85 30 65 C20 55 15 50 20 45 Z',

  baku:
    'M20 25 L65 25 C80 25 90 35 85 45 C80 55 110 55 130 40 C145 30 145 60 130 70 C105 90 70 80 60 65 C45 50 20 60 20 25 Z',

  sepang:
    'M25 45 L50 25 L85 25 C105 25 125 35 135 50 L125 65 L95 65 C85 65 75 75 80 85 L35 85 L25 70 Z',

  marinabay:
    'M20 25 L70 25 L90 40 L130 35 L140 60 L110 70 L90 85 L45 80 L20 60 Z',

  austin:
    'M25 35 C50 15 85 20 105 35 C120 45 140 30 135 55 C130 75 100 70 85 60 C70 50 55 85 35 75 C20 65 15 45 25 35 Z',

  mexicocity:
    'M20 35 C45 20 75 30 95 25 C120 15 145 35 135 55 C125 75 95 65 80 75 C55 90 30 75 25 55 C20 45 15 40 20 35 Z',

  interlagos:
    'M25 25 C50 15 90 25 120 20 C145 25 140 50 120 55 C95 60 105 85 75 80 C50 75 30 90 25 60 C20 45 15 35 25 25 Z',

  lasvegas:
    'M25 25 L120 25 C140 30 145 55 125 60 L90 60 C75 60 70 80 50 75 C30 70 20 45 25 25 Z',

  lusail:
    'M20 40 C35 20 80 15 120 30 C145 40 135 65 110 65 C90 65 85 85 55 75 C30 70 15 55 20 40 Z',

  yasmarina:
    'M25 30 C55 20 90 30 115 25 C140 25 145 50 125 60 C110 70 120 85 90 80 C60 75 35 85 25 60 C20 45 15 35 25 30 Z',
}

export interface CalendarSession {
  date: string
  time?: string
}

export interface CalendarRace {
  round: string
  roundNumber?: number
  name: string
  officialName?: string
  circuit: string
  circuitId?: string
  locality?: string
  country?: string
  date: string
  image?: string
  track: string
  laps: number
  length: string
  color: string
  status?: 'completed' | 'next' | 'upcoming'
  sessions?: {
    fp1?: CalendarSession
    fp2?: CalendarSession
    fp3?: CalendarSession
    sprint?: CalendarSession
    qualifying?: CalendarSession
    race?: CalendarSession
  }
}

// Built-in initial 2026 calendar (ensures instantaneous paint & offline reliability)
const INITIAL_RACES: CalendarRace[] = [
  {
    round: 'R01',
    roundNumber: 1,
    name: 'MELBOURNE',
    circuit: 'Albert Park Circuit',
    date: '2026-03-08T04:00:00Z',
    image: '/images/race-melbourne.png',
    track: 'melbourne',
    laps: 58,
    length: '5.278 km',
    color: 'var(--primary)',
    status: 'upcoming',
  },
  {
    round: 'R02',
    roundNumber: 2,
    name: 'SHANGHAI',
    circuit: 'Shanghai International Circuit',
    date: '2026-03-15T07:00:00Z',
    image: '/images/race-shanghai.png',
    track: 'shanghai',
    laps: 56,
    length: '5.451 km',
    color: 'var(--speed)',
    status: 'upcoming',
  },
  {
    round: 'R03',
    roundNumber: 3,
    name: 'SUZUKA',
    circuit: 'Suzuka Circuit',
    date: '2026-03-29T05:00:00Z',
    image: '/images/race-suzuka.png',
    track: 'suzuka',
    laps: 53,
    length: '5.807 km',
    color: 'var(--neon)',
    status: 'upcoming',
  },
  {
    round: 'R04',
    roundNumber: 4,
    name: 'SAKHIR',
    circuit: 'Bahrain International Circuit',
    date: '2026-04-12T15:00:00Z',
    image: '/images/race-sakhir.png',
    track: 'sakhir',
    laps: 57,
    length: '5.412 km',
    color: 'var(--silver)',
    status: 'upcoming',
  },
  {
    round: 'R05',
    roundNumber: 5,
    name: 'JEDDAH',
    circuit: 'Jeddah Corniche Circuit',
    date: '2026-04-19T17:00:00Z',
    image: '/images/race-jeddah.png',
    track: 'jeddah',
    laps: 50,
    length: '6.174 km',
    color: 'var(--primary)',
    status: 'upcoming',
  },
  {
    round: 'R06',
    roundNumber: 6,
    name: 'MIAMI',
    circuit: 'Miami International Autodrome',
    date: '2026-05-03T20:00:00Z',
    image: '/images/race-miami.png',
    track: 'miami',
    laps: 57,
    length: '5.412 km',
    color: 'var(--speed)',
    status: 'upcoming',
  },
  {
    round: 'R07',
    roundNumber: 7,
    name: 'MONTREAL',
    circuit: 'Circuit Gilles Villeneuve',
    date: '2026-05-24T18:00:00Z',
    image: '/images/race-montreal.png',
    track: 'montreal',
    laps: 70,
    length: '4.361 km',
    color: 'var(--neon)',
    status: 'upcoming',
  },
  {
    round: 'R08',
    roundNumber: 8,
    name: 'MONACO',
    circuit: 'Circuit de Monaco',
    date: '2026-06-07T13:00:00Z',
    image: '/images/race-monaco.png',
    track: 'monaco',
    laps: 78,
    length: '3.337 km',
    color: 'var(--silver)',
    status: 'upcoming',
  },
  {
    round: 'R09',
    roundNumber: 9,
    name: 'BARCELONA',
    circuit: 'Circuit de Barcelona-Catalunya',
    date: '2026-06-14T13:00:00Z',
    image: '/images/race-barcelona.png',
    track: 'catalunya',
    laps: 66,
    length: '4.657 km',
    color: 'var(--primary)',
    status: 'upcoming',
  },
  {
    round: 'R10',
    roundNumber: 10,
    name: 'SPIELBERG',
    circuit: 'Red Bull Ring',
    date: '2026-06-28T13:00:00Z',
    image: '/images/race-spielberg.png',
    track: 'redbullring',
    laps: 71,
    length: '4.318 km',
    color: 'var(--speed)',
    status: 'upcoming',
  },
  {
    round: 'R11',
    roundNumber: 11,
    name: 'SILVERSTONE',
    circuit: 'Silverstone Circuit',
    date: '2026-07-05T14:00:00Z',
    image: '/images/race-silverstone.png',
    track: 'silverstone',
    laps: 52,
    length: '5.891 km',
    color: 'var(--neon)',
    status: 'upcoming',
  },
  {
    round: 'R12',
    roundNumber: 12,
    name: 'SPA',
    circuit: 'Circuit de Spa-Francorchamps',
    date: '2026-07-19T13:00:00Z',
    image: '/images/race-spa.png',
    track: 'spa',
    laps: 44,
    length: '7.004 km',
    color: 'var(--silver)',
    status: 'upcoming',
  },
  {
    round: 'R13',
    roundNumber: 13,
    name: 'BUDAPEST',
    circuit: 'Hungaroring',
    date: '2026-07-26T13:00:00Z',
    image: '/images/race-hungary.png',
    track: 'hungaroring',
    laps: 70,
    length: '4.381 km',
    color: 'var(--primary)',
    status: 'upcoming',
  },
  {
    round: 'R14',
    roundNumber: 14,
    name: 'ZANDVOORT',
    circuit: 'Circuit Zandvoort',
    date: '2026-08-23T13:00:00Z',
    image: '/images/race-zandvoort.png',
    track: 'zandvoort',
    laps: 72,
    length: '4.259 km',
    color: 'var(--speed)',
    status: 'upcoming',
  },
  {
    round: 'R15',
    roundNumber: 15,
    name: 'MONZA',
    circuit: 'Autodromo Nazionale Monza',
    date: '2026-09-06T13:00:00Z',
    image: '/images/race-monza.png',
    track: 'monza',
    laps: 53,
    length: '5.793 km',
    color: 'var(--neon)',
    status: 'upcoming',
  },
  {
    round: 'R16',
    roundNumber: 16,
    name: 'MADRID',
    circuit: 'Madring',
    date: '2026-09-13T13:00:00Z',
    image: '/images/race-madrid.png',
    track: 'madrid',
    laps: 57,
    length: '5.470 km',
    color: 'var(--silver)',
    status: 'upcoming',
  },
  {
    round: 'R17',
    roundNumber: 17,
    name: 'BAKU',
    circuit: 'Baku City Circuit',
    date: '2026-09-27T11:00:00Z',
    image: '/images/race-baku.png',
    track: 'baku',
    laps: 51,
    length: '6.003 km',
    color: 'var(--primary)',
    status: 'upcoming',
  },
  {
    round: 'R18',
    roundNumber: 18,
    name: 'SINGAPORE',
    circuit: 'Marina Bay Street Circuit',
    date: '2026-10-11T12:00:00Z',
    image: '/images/race-singapore.png',
    track: 'marinabay',
    laps: 62,
    length: '4.940 km',
    color: 'var(--speed)',
    status: 'upcoming',
  },
  {
    round: 'R19',
    roundNumber: 19,
    name: 'AUSTIN',
    circuit: 'Circuit of the Americas',
    date: '2026-10-25T19:00:00Z',
    image: '/images/race-austin.png',
    track: 'austin',
    laps: 56,
    length: '5.513 km',
    color: 'var(--neon)',
    status: 'upcoming',
  },
  {
    round: 'R20',
    roundNumber: 20,
    name: 'MEXICO CITY',
    circuit: 'Autódromo Hermanos Rodríguez',
    date: '2026-11-01T20:00:00Z',
    image: '/images/race-mexico.png',
    track: 'mexicocity',
    laps: 71,
    length: '4.304 km',
    color: 'var(--silver)',
    status: 'upcoming',
  },
  {
    round: 'R21',
    roundNumber: 21,
    name: 'INTERLAGOS',
    circuit: 'Autódromo José Carlos Pace',
    date: '2026-11-08T17:00:00Z',
    image: '/images/race-interlagos.png',
    track: 'interlagos',
    laps: 71,
    length: '4.309 km',
    color: 'var(--primary)',
    status: 'upcoming',
  },
  {
    round: 'R22',
    roundNumber: 22,
    name: 'LAS VEGAS',
    circuit: 'Las Vegas Strip Circuit',
    date: '2026-11-21T06:00:00Z',
    image: '/images/race-lasvegas.png',
    track: 'lasvegas',
    laps: 50,
    length: '6.201 km',
    color: 'var(--speed)',
    status: 'upcoming',
  },
  {
    round: 'R23',
    roundNumber: 23,
    name: 'LUSAIL',
    circuit: 'Lusail International Circuit',
    date: '2026-11-29T16:00:00Z',
    image: '/images/race-lusail.png',
    track: 'lusail',
    laps: 57,
    length: '5.419 km',
    color: 'var(--neon)',
    status: 'upcoming',
  },
  {
    round: 'R24',
    roundNumber: 24,
    name: 'ABU DHABI',
    circuit: 'Yas Marina Circuit',
    date: '2026-12-06T13:00:00Z',
    image: '/images/race-yasmarina.png',
    track: 'yasmarina',
    laps: 58,
    length: '5.281 km',
    color: 'var(--silver)',
    status: 'upcoming',
  },
]

function Countdown({ target }: { target: string }) {
  const [parts, setParts] = useState<[string, string, string] | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const update = () => {
      const diff = Math.max(new Date(target).getTime() - Date.now(), 0)
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setParts([String(d).padStart(2, '0'), String(h).padStart(2, '0'), String(m).padStart(2, '0')])
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [target])

  const units = [t.calendar.countdown.days, t.calendar.countdown.hrs, t.calendar.countdown.min]

  return (
    <div className="flex items-baseline gap-3 font-mono tabular-nums" aria-label="Countdown to lights out">
      {units.map((unit, i) => (
        <div key={unit} className="flex flex-col">
          <span className="text-3xl font-black md:text-4xl text-foreground">{parts ? parts[i] : '--'}</span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{unit}</span>
        </div>
      ))}
    </div>
  )
}

function TrackPath({ d, color }: { d?: string; color: string }) {
  const defaultPath = TRACKS.melbourne
  return (
    <svg viewBox="0 0 160 100" className="h-24 w-40 md:h-28 md:w-48 filter drop-shadow-[0_0_8px_rgba(244,6,18,0.2)]" aria-hidden="true">
      <motion.path
        d={d || defaultPath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </svg>
  )
}

function SessionTimeline({ sessions }: { sessions?: CalendarRace['sessions'] }) {
  if (!sessions) return null

  const items: { label: string; date?: string; time?: string }[] = [
    { label: 'FP1', date: sessions.fp1?.date, time: sessions.fp1?.time },
    { label: 'FP2', date: sessions.fp2?.date, time: sessions.fp2?.time },
    sessions.sprint ? { label: 'SPRINT', date: sessions.sprint?.date, time: sessions.sprint?.time } : { label: 'FP3', date: sessions.fp3?.date, time: sessions.fp3?.time },
    { label: 'QUALIFYING', date: sessions.qualifying?.date, time: sessions.qualifying?.time },
    { label: 'GRAND PRIX', date: sessions.race?.date, time: sessions.race?.time },
  ].filter((item) => Boolean(item.date))

  if (items.length === 0) return null

  return (
    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2 text-[10px] font-mono">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-muted-foreground"
        >
          <span className="font-bold text-white/80">{item.label}</span>
          <span className="text-primary/90">{item.time ? item.time.slice(0, 5) : 'TBD'}</span>
        </span>
      ))}
    </div>
  )
}

function RaceStop({ race, index }: { race: CalendarRace; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const even = index % 2 === 0
  const { t } = useLanguage()
  const weather = t.calendar.weathers[race.track as keyof typeof t.calendar.weathers] || 'SUNNY / 26°C'

  const formattedDate = useMemo(() => {
    try {
      const d = new Date(race.date)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    } catch {
      return race.date
    }
  }, [race.date])

  return (
    <article ref={ref} className="relative grid grid-cols-12 items-center gap-6 py-16 md:py-24">
      {/* Image side */}
      <div
        className={`group relative col-span-12 overflow-hidden md:col-span-7 rounded-xl border border-white/10 bg-black/60 shadow-2xl ${
          even ? 'md:col-start-1' : 'md:col-start-6'
        }`}
        data-cursor="hover"
      >
        <div className="light-sweep relative aspect-[16/10] overflow-hidden">
          <motion.div className="absolute -inset-y-[12%] inset-x-0" style={{ y: imgY }}>
            <img
              src={race.image || '/images/race-melbourne.png'}
              alt={`${race.circuit} destination`}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/images/race-melbourne.png'
              }}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute left-6 top-6 flex items-center gap-3">
            <span
              className="px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold tracking-[0.3em] bg-black/70 backdrop-blur-md border border-white/20"
              style={{ color: race.color }}
            >
              {race.round}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/80 bg-black/50 px-2 py-0.5 rounded">
              {weather}
            </span>
          </div>

          {race.status === 'next' && (
            <div className="absolute right-6 top-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-mono text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
              <span className="h-2 w-2 rounded-full bg-white" />
              NEXT GRAND PRIX
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono text-white/70">
            <span>{race.country ? race.country.toUpperCase() : 'FIA F1 WORLD CHAMPIONSHIP'}</span>
            <span className="text-white/90 font-bold">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Info side — overlaps the image */}
      <div
        className={`relative z-10 col-span-12 md:col-span-5 md:row-start-1 ${
          even ? 'md:col-start-7 md:-ml-16' : 'md:col-start-1 md:-mr-16 md:text-right'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, x: even ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
          className="backdrop-blur-md bg-background/80 p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-2 font-mono text-[10px] text-red-500 font-bold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            ROUND {race.roundNumber ?? race.round} // 2026 CALENDAR
          </div>
          <h3 className="text-5xl font-black leading-[0.9] tracking-tighter md:text-7xl text-foreground">
            {race.name}
          </h3>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {race.circuit} • {race.laps} {t.calendar.laps} • {race.length}
          </p>

          <div className={`mt-6 flex items-center gap-8 ${even ? '' : 'md:justify-end'}`}>
            <TrackPath d={TRACKS[race.track] || TRACKS.melbourne} color={race.color} />
            <Countdown target={race.date} />
          </div>

          <SessionTimeline sessions={race.sessions} />
        </motion.div>
      </div>
    </article>
  )
}

export function Calendar() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end end'] })
  const lineScale = useSpring(scrollYProgress, { stiffness: 80, damping: 25 })
  const { t } = useLanguage()

  const [races, setRaces] = useState<CalendarRace[]>(INITIAL_RACES)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  const [isLiveApi, setIsLiveApi] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadRealCalendar() {
      try {
        setIsLoading(true)
        // Attempt 1: Fetch via local API route (has caching and enriched specs)
        const localRes = await fetch('/api/f1/calendar', { cache: 'no-store' })
        if (localRes.ok) {
          const data = await localRes.json()
          if (Array.isArray(data?.races) && data.races.length > 0 && isMounted) {
            setRaces(data.races)
            setIsLiveApi(true)
            setIsLoading(false)
            return
          }
        }

        // Attempt 2: Direct Ergast API fallback
        const extRes = await fetch('https://api.jolpi.ca/ergast/f1/2026/races.json')
        if (extRes.ok) {
          const extData = await extRes.json()
          const raw = extData?.MRData?.RaceTable?.Races
          if (Array.isArray(raw) && raw.length > 0 && isMounted) {
            const mapped: CalendarRace[] = raw.map((r: any, i: number) => {
              const rNum = parseInt(r.round, 10) || i + 1
              const cId = (r.Circuit?.circuitId || '').toLowerCase()
              const matchedTrack = TRACKS[cId] ? cId : 'melbourne'
              return {
                round: `R${String(rNum).padStart(2, '0')}`,
                roundNumber: rNum,
                name: r.Circuit?.Location?.locality?.toUpperCase() || r.raceName.toUpperCase(),
                circuit: r.Circuit?.circuitName || 'Grand Prix Circuit',
                circuitId: cId,
                country: r.Circuit?.Location?.country,
                date: `${r.date}T${r.time || '13:00:00Z'}`,
                image: '/images/race-melbourne.png',
                track: matchedTrack,
                laps: 55,
                length: '5.300 km',
                color: i % 3 === 0 ? 'var(--primary)' : i % 3 === 1 ? 'var(--speed)' : 'var(--neon)',
                status: new Date(`${r.date}T${r.time || '13:00:00Z'}`).getTime() < Date.now() ? 'completed' : 'upcoming',
                sessions: {
                  fp1: r.FirstPractice,
                  fp2: r.SecondPractice,
                  fp3: r.ThirdPractice,
                  qualifying: r.Qualifying,
                  sprint: r.Sprint,
                  race: { date: r.date, time: r.time },
                },
              }
            })
            setRaces(mapped)
            setIsLiveApi(true)
          }
        }
      } catch (err) {
        console.warn('[Calendar] Live API fetch error, using verified 2026 dataset: ', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadRealCalendar()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredRaces = useMemo(() => {
    if (filter === 'all') return races
    return races.filter((r) => r.status === filter)
  }, [races, filter])

  return (
    <section id="calendar" ref={ref} className="relative px-5 py-28 md:px-10 md:py-44" aria-label="Race calendar">
      <header className="mb-10 md:mb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-speed">
            {t.calendar.tag}
          </p>

          {/* Real API Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] tracking-wider text-muted-foreground">
            <span
              className={`h-2 w-2 rounded-full ${
                isLiveApi ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500'
              }`}
            />
            <span>
              {isLoading
                ? 'SYNCING 2026 CALENDAR FEED...'
                : isLiveApi
                ? 'FIA 2026 REAL API FEED // JOLPICA ERGAST'
                : 'OFFICIAL 2026 CALENDAR ARCHIVE'}
            </span>
          </div>
        </div>

        <h2 className="font-black leading-[0.85] tracking-tighter">
          <LetterReveal text={t.calendar.title1} className="block text-[13vw] md:text-[8vw]" />
          <LetterReveal
            text={t.calendar.title2}
            className="block text-[13vw] text-primary md:text-[8vw]"
            delay={0.2}
          />
        </h2>

        {/* Filter controls */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === 'all'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
            }`}
          >
            All Rounds ({races.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === 'upcoming'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === 'completed'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
            }`}
          >
            Completed
          </button>
        </div>
      </header>

      {/* Journey line */}
      <div className="relative">
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-0 hidden h-full w-px origin-top -translate-x-1/2 bg-gradient-to-b from-primary via-speed to-neon md:block"
          style={{ scaleY: lineScale }}
        />
        {filteredRaces.map((race, i) => (
          <RaceStop key={`${race.round}-${race.name}`} race={race} index={i} />
        ))}
      </div>
    </section>
  )
}
