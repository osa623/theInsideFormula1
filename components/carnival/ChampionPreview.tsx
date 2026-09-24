'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import {
  ChampionPreviewData,
  ChampionRaceResult,
  getChampionPreviewData,
} from '@/lib/f1/championPreviewService'
import { ChampionSection } from './types'

interface ChampionPreviewProps {
  section: ChampionSection | null
  onClose: () => void
}

function formatStat(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return String(value)
}

function resultTone(result: ChampionRaceResult) {
  const pos = Number(result.position)
  const status = result.status.toLowerCase()

  if (pos === 1) return 'border-primary/60 bg-primary/15 text-white'
  if (pos === 2 || pos === 3) return 'border-white/40 bg-white/10 text-white'
  if (status.includes('accident') || status.includes('engine') || status.includes('retired') || result.position === 'R') {
    return 'border-red-400/45 bg-red-950/25 text-red-100'
  }
  return 'border-white/15 bg-white/5 text-white/70'
}

function positionLabel(position: string) {
  const num = Number(position)
  if (!Number.isFinite(num)) return position || 'N/A'
  if (num === 1) return '1st'
  if (num === 2) return '2nd'
  if (num === 3) return '3rd'
  return `${num}th`
}

export default function ChampionPreview({ section, onClose }: ChampionPreviewProps) {
  const [data, setData] = useState<ChampionPreviewData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let alive = true
    setData(null)

    if (!section) return

    setLoading(true)
    getChampionPreviewData(section.year)
      .then((nextData) => {
        if (alive) setData(nextData)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [section])

  const rows = useMemo(() => data?.standings.slice(0, 12) || [], [data])
  const raceRows = useMemo(() => data?.raceResults || [], [data])

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          className="absolute inset-0 z-40 overflow-hidden bg-black/45 text-white backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(225,6,0,0.24), transparent 34%), linear-gradient(90deg, rgba(0,0,0,0.82), rgba(0,0,0,0.28) 42%, rgba(0,0,0,0.78))',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />

          <motion.section
            className="relative mx-auto flex h-full w-full max-w-[1800px] flex-col px-4 py-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 22, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
          >
            <header className="grid shrink-0 grid-cols-[1fr_auto] items-start gap-4 border-b border-white/15 pb-3">
              <div className="min-w-0">
                <div className="font-mono text-[9px] uppercase tracking-[0.48em] text-primary">
                  Formula 1 Hall of Champions
                </div>
                <div className="mt-1 flex flex-wrap items-end gap-x-5 gap-y-1">
                  <h1 className="glow-red font-sans text-5xl font-black leading-none text-white sm:text-6xl lg:text-8xl">
                    {section.year}
                  </h1>
                  <div className="pb-1">
                    <div className="font-mono text-[10px] uppercase tracking-[0.42em] text-white/50">
                      Season Archive
                    </div>
                    <div className="mt-1 text-xl font-black uppercase tracking-[0.14em] text-white sm:text-3xl">
                      {data?.driver.name || (loading ? 'Loading champion' : 'Champion Profile')}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="border border-white/20 bg-black/55 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.26em] text-white/70 backdrop-blur-xl transition-colors hover:border-primary/70 hover:text-white"
              >
                ESC Close
              </button>
            </header>

            <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[0.86fr_1.22fr_0.92fr]">
              <motion.aside
                className="relative min-h-0 overflow-hidden border border-white/15 bg-black/55 p-4 shadow-2xl backdrop-blur-xl"
                initial={{ opacity: 0, x: -26 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12, duration: 0.42 }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="relative h-44 overflow-hidden border border-white/10 bg-white/5 sm:h-52 lg:h-[30vh]">
                  {data?.driver.image ? (
                    <img
                      src={data.driver.image}
                      alt=""
                      className="h-full w-full object-cover opacity-70 grayscale contrast-125"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/48">Driver</div>
                    <div className="mt-1 text-2xl font-black uppercase tracking-[0.08em] text-white">
                      {data?.driver.name || 'Loading'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  {[
                    ['Nationality', data?.driver.nationality],
                    ['Team', data?.driver.team],
                    ['Points', data ? formatStat(data.seasonStats.points) : undefined],
                  ].map(([label, value]) => (
                    <div key={label} className="border-l border-primary/70 bg-white/5 px-3 py-2">
                      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">{label}</div>
                      <div className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white/85">
                        {value || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 min-h-0 border border-white/10 bg-black/35 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.34em] text-primary">
                    Season Performance
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    {data?.performanceSummary || 'Loading verified season profile from the historical data source.'}
                  </p>
                  <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
                    Source: {data?.source || 'Jolpica Ergast-compatible API'}
                  </div>
                </div>
              </motion.aside>

              <motion.main
                className="min-h-0 border border-white/15 bg-black/50 p-4 shadow-2xl backdrop-blur-xl"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.42 }}
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.36em] text-primary">
                      Year Summary
                    </div>
                    <h2 className="mt-1 text-2xl font-black uppercase tracking-[0.1em] text-white">
                      Race Results
                    </h2>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                    {raceRows.length || '--'} rounds
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-[3rem_1.1fr_0.82fr_4.5rem_5.5rem] gap-2 border-b border-white/10 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
                  <span>Rd</span>
                  <span>Grand Prix</span>
                  <span>Circuit</span>
                  <span>Result</span>
                  <span>Status</span>
                </div>
                <div className="mt-2 max-h-[54vh] space-y-1.5 overflow-y-auto pr-1">
                  {raceRows.length > 0 ? (
                    raceRows.map((race) => (
                      <div
                        key={`${race.round}-${race.grandPrix}`}
                        className={`grid grid-cols-[3rem_1.1fr_0.82fr_4.5rem_5.5rem] items-center gap-2 border px-2 py-2 font-mono text-[10px] uppercase tracking-[0.08em] ${resultTone(race)}`}
                      >
                        <span className="text-primary">{String(race.round).padStart(2, '0')}</span>
                        <span className="truncate font-bold">{race.grandPrix}</span>
                        <span className="truncate text-white/50">{race.circuit}</span>
                        <span className="font-black">{positionLabel(race.position)}</span>
                        <span className="truncate text-white/55">{race.status}</span>
                      </div>
                    ))
                  ) : (
                    <div className="border border-white/10 bg-white/5 p-6 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                      {loading ? 'Loading race results' : 'Race results unavailable'}
                    </div>
                  )}
                </div>
              </motion.main>

              <motion.aside
                className="min-h-0 border border-white/15 bg-black/55 p-4 shadow-2xl backdrop-blur-xl"
                initial={{ opacity: 0, x: 26 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28, duration: 0.42 }}
              >
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Wins', data?.seasonStats.wins],
                    ['Poles', data?.seasonStats.polePositions],
                    ['Podiums', data?.seasonStats.podiums],
                  ].map(([label, value]) => (
                    <div key={label} className="border border-white/10 bg-white/5 px-3 py-3 text-center">
                      <div className="text-3xl font-black text-primary">{formatStat(value as number | null)}</div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-white/45">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-primary">
                      Formula 1 Points Standing
                    </div>
                    <h2 className="mt-1 text-xl font-black uppercase tracking-[0.1em] text-white">
                      Drivers Table
                    </h2>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Top 12</div>
                </div>

                <div className="mt-3 grid grid-cols-[2.5rem_1fr_0.82fr_3.5rem] gap-2 border-b border-white/10 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  <span>Pos</span>
                  <span>Driver</span>
                  <span>Team</span>
                  <span className="text-right">Pts</span>
                </div>
                <div className="mt-2 max-h-[52vh] space-y-1 overflow-y-auto pr-1">
                  {rows.length > 0 ? (
                    rows.map((row) => (
                      <div
                        key={`${row.position}-${row.driver}`}
                        className={`grid grid-cols-[2.5rem_1fr_0.82fr_3.5rem] items-center gap-2 border px-2 py-2 font-mono text-[10px] uppercase tracking-[0.08em] ${
                          row.isChampion
                            ? 'border-primary/70 border-l-4 border-l-primary bg-primary/15 text-white'
                            : 'border-white/10 bg-white/5 text-white/65'
                        }`}
                      >
                        <span className="text-primary">{String(row.position).padStart(2, '0')}</span>
                        <span className="truncate font-bold">{row.driver}</span>
                        <span className="truncate text-white/50">{row.team}</span>
                        <span className="text-right font-black text-white">{row.points}</span>
                      </div>
                    ))
                  ) : (
                    <div className="border border-white/10 bg-white/5 p-6 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                      {loading ? 'Loading standings' : 'Standings unavailable'}
                    </div>
                  )}
                </div>
              </motion.aside>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
