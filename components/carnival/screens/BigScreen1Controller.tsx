'use client'

import { Html } from '@react-three/drei'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import {
  f1DataService,
  RaceEvent,
} from '@/lib/f1/f1DataService'
import { ScreenAnchor } from '../types'
import { AUTOPLAY_TIMINGS, EXHIBITION_SCREEN_CONFIG } from './ScreenConfig'
import { useScreenVisibility } from './OcclusionManager'
import './screenStyles.css'

interface BigScreen1ControllerProps {
  anchor: ScreenAnchor
  occluders?: THREE.Object3D[]
}

type Phase = 'calendar' | 'completed' | 'nextRace' | 'remaining' | 'progress'

export default function BigScreen1Controller({
  anchor,
  occluders,
}: BigScreen1ControllerProps) {
  const config = EXHIBITION_SCREEN_CONFIG.big1
  const isVisible = useScreenVisibility(anchor, occluders, config.maxViewDistance)

  const [phase, setPhase] = useState<Phase>('calendar')
  const [allRaces, setAllRaces] = useState<RaceEvent[]>([])
  const [completedRaces, setCompletedRaces] = useState<RaceEvent[]>([])
  const [remainingRaces, setRemainingRaces] = useState<RaceEvent[]>([])
  const [nextRace, setNextRace] = useState<RaceEvent | null>(null)

  useEffect(() => {
    const update = () => {
      const races = f1DataService.get2026Calendar()
      setAllRaces(races)
      setCompletedRaces(f1DataService.get2026CompletedRaces())
      setRemainingRaces(f1DataService.get2026RemainingRaces())
      setNextRace(f1DataService.getNextRace())
    }
    update()
    const unsubscribe = f1DataService.subscribe(update)
    return () => unsubscribe()
  }, [])

  // Autoplay presentation sequence with staggered start (+5.0s)
  useEffect(() => {
    const sequence: { phase: Phase; duration: number }[] = [
      { phase: 'calendar', duration: AUTOPLAY_TIMINGS.calendar },
      { phase: 'completed', duration: AUTOPLAY_TIMINGS.completedRaces },
      { phase: 'nextRace', duration: AUTOPLAY_TIMINGS.nextRace },
      { phase: 'remaining', duration: AUTOPLAY_TIMINGS.remainingCalendar },
      { phase: 'progress', duration: AUTOPLAY_TIMINGS.seasonProgress },
    ]

    let currentIdx = 0
    let timeoutId: NodeJS.Timeout

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        currentIdx = (currentIdx + 1) % sequence.length
        setPhase(sequence[currentIdx].phase)
        scheduleNext()
      }, sequence[currentIdx].duration)
    }

    const startTimer = setTimeout(() => {
      scheduleNext()
    }, config.staggerDelayMs)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(timeoutId)
    }
  }, [config.staggerDelayMs])

  const totalRaces = allRaces.length || 24
  const completedCount = completedRaces.length || 14
  const progressPercent = Math.round((completedCount / totalRaces) * 100)

  return (
    <group
      position={[anchor.position.x, anchor.position.y, anchor.position.z]}
      rotation={[0, 2.897, 0]}
    >
      <Html
        transform
        distanceFactor={config.distanceFactor}
        position={[0, 0, 0.08]}
        rotation={[0, 0, 0]}
        pointerEvents="none"
        className="select-none"
        style={{
          width: `${config.resolution.width}px`,
          height: `${config.resolution.height}px`,
          display: isVisible ? 'block' : 'none',
        }}
      >
        <div className="f1-screen-root w-full h-full flex flex-col justify-between p-8">
          {/* Top Header Bar */}
          <div className="f1-header-bar px-8 py-3.5">
            <div className="flex items-center gap-4">
              <span className="w-3.5 h-3.5 bg-[#e10600] animate-pulse inline-block" />
              <span className="text-base font-black tracking-widest text-white">
                FIA FORMULA 1 WORLD CHAMPIONSHIP // 2026 OFFICIAL RACING CALENDAR
              </span>
              <span className="text-xs px-2.5 py-0.5 bg-[#182029] border border-[#2b3747] text-[#00d2be] font-bold">
                TOWER DISPLAY 01
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 text-xs font-bold">
              {[
                { id: 'calendar', label: '01 // FULL CALENDAR' },
                { id: 'completed', label: '02 // COMPLETED RACES' },
                { id: 'nextRace', label: '03 // NEXT GRAND PRIX' },
                { id: 'remaining', label: '04 // REMAINING SCHEDULE' },
                { id: 'progress', label: '05 // SEASON PROGRESS' },
              ].map((tab) => (
                <span
                  key={tab.id}
                  className={`px-3.5 py-1.5 border transition-all ${
                    phase === tab.id
                      ? 'border-[#00d2be] text-[#00d2be] bg-[rgba(0,210,190,0.12)]'
                      : 'border-[#222933] text-[#5e6d7e]'
                  }`}
                >
                  {tab.label}
                </span>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden py-4 px-2">
            {/* Phase 1: Full 2026 Season Schedule */}
            {phase === 'calendar' && (
              <div className="h-full flex flex-col justify-between">
                <div className="grid grid-cols-6 gap-3 h-full overflow-hidden">
                  {allRaces.slice(0, 18).map((race) => (
                    <div
                      key={race.round}
                      className={`p-3 border rounded flex flex-col justify-between ${
                        race.status === 'completed'
                          ? 'bg-[rgba(15,22,30,0.7)] border-[#243040]'
                          : race.status === 'next'
                          ? 'bg-[rgba(0,210,190,0.08)] border-[#00d2be]'
                          : 'bg-[rgba(10,14,18,0.7)] border-[#1b232c]'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#1f2937] pb-1">
                        <span className="text-xs font-black text-[#00d2be]">
                          R{String(race.round).padStart(2, '0')}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            race.status === 'completed'
                              ? 'bg-[#182330] text-[#788a9c]'
                              : race.status === 'next'
                              ? 'bg-[#00d2be] text-black'
                              : 'bg-[#151a22] text-[#556677]'
                          }`}
                        >
                          {race.status}
                        </span>
                      </div>
                      <div className="py-2">
                        <div className="text-sm font-bold text-white truncate">{race.name}</div>
                        <div className="text-[11px] text-[#8c9cae] truncate">{race.location}, {race.country}</div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#1f2937] text-[10px]">
                        <span className="text-[#657688]">{race.date}</span>
                        {race.winner && <span className="text-[#ffb800] font-bold truncate max-w-[80px]">🏆 {race.winner.split(' ').pop()}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-3 px-2">
                  <span>24 OFFICIAL FIA FORMULA 1 WORLD CHAMPIONSHIP ROUNDS // ACROSS 5 CONTINENTS</span>
                  <span>RECORD BREAKING SEASON ATTENDANCE & TELEMETRY SYNC</span>
                </div>
              </div>
            )}

            {/* Phase 2: Completed Races Gallery */}
            {phase === 'completed' && (
              <div className="h-full flex flex-col justify-between">
                <div className="grid grid-cols-4 gap-4 h-full">
                  {completedRaces.slice(0, 8).map((race) => (
                    <div
                      key={race.round}
                      className="bg-[rgba(15,20,28,0.75)] border border-[#253243] p-4 rounded flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between border-b border-[#202b3a] pb-2">
                        <span className="text-xs font-black text-[#00d2be]">ROUND {race.round}</span>
                        <span className="text-xs text-[#8c9cae]">{race.date}</span>
                      </div>
                      <div className="py-2">
                        <div className="text-base font-black text-white">{race.name}</div>
                        <div className="text-xs text-[#718294]">{race.circuit}</div>
                      </div>
                      <div className="bg-[#10151e] p-2.5 rounded border border-[#1e2735] space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8899aa]">WINNER</span>
                          <span className="font-bold text-[#ffb800]">🏆 {race.winner || 'MAX VERSTAPPEN'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#667788]">POLE POSITION</span>
                          <span className="text-white font-semibold">{race.pole || 'L. NORRIS'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#667788]">FASTEST LAP</span>
                          <span className="text-[#00d2be] font-semibold">{race.fastestLap || 'K. ANTONELLI'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-3 px-2">
                  <span>TOTAL COMPLETED ROUNDS: {completedCount} OF {totalRaces}</span>
                  <span>WINNERS: VERSTAPPEN (6), ANTONELLI (4), NORRIS (3), LECLERC (1)</span>
                </div>
              </div>
            )}

            {/* Phase 3: Next Grand Prix Spotlight */}
            {phase === 'nextRace' && (
              <div className="h-full flex items-center justify-between px-12 bg-[rgba(14,19,26,0.7)] border border-[#1b2533] p-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="f1-telemetry-badge text-[#00d2be]">
                    UPCOMING ROUND // NEXT IN LINE
                  </div>
                  <div className="text-sm font-bold tracking-widest text-[#728599]">
                    ROUND 15 OF 24 // FIA FORMULA 1 CALENDAR
                  </div>
                  <h1 className="text-5xl font-black tracking-tight text-white uppercase">
                    {nextRace?.name || 'DUTCH GRAND PRIX'}
                  </h1>
                  <div className="text-sm text-[#9eb1c4] leading-relaxed">
                    Host: {nextRace?.location || 'Zandvoort'}, {nextRace?.country || 'Netherlands'}
                    <br />
                    Scheduled Date: {nextRace?.date || '28 - 30 AUGUST 2026'}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="bg-[#111721] p-3 border-l-2 border-[#00d2be] rounded">
                      <div className="text-[10px] text-[#718293] font-bold">CIRCUIT LENGTH</div>
                      <div className="text-xl font-black text-white">{nextRace?.lengthKm || 4.259} KM</div>
                    </div>
                    <div className="bg-[#111721] p-3 border-l-2 border-[#e10600] rounded">
                      <div className="text-[10px] text-[#718293] font-bold">RACE DISTANCE</div>
                      <div className="text-xl font-black text-white">{nextRace?.laps || 72} LAPS</div>
                    </div>
                    <div className="bg-[#111721] p-3 border-l-2 border-[#ffb800] rounded">
                      <div className="text-[10px] text-[#718293] font-bold">BANKED CORNERS</div>
                      <div className="text-xl font-black text-white">18 DEGREES</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-[#0e141c] border border-[#232f3e] rounded w-96 text-center">
                  <div className="text-xs font-black text-[#00d2be] tracking-widest uppercase mb-3">
                    CIRCUIT TELEMETRY PREVIEW
                  </div>
                  <div className="w-full h-44 bg-[#121924] border border-[#222c3b] rounded flex items-center justify-center p-4 relative overflow-hidden">
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-black text-white">{nextRace?.circuit || 'Circuit Zandvoort'}</div>
                      <div className="text-xs text-[#718294]">SEASIDE DUNES // HIGH DOWNFORCE</div>
                      <div className="f1-telemetry-badge text-[#00d2be] mt-2 inline-block">
                        FIA GRADE 1 CERTIFIED
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#1f2937] w-full flex items-center justify-between text-xs text-[#708194]">
                    <span>STATUS: ALL SESSIONS CONFIRMED</span>
                    <span>WEATHER: DRY // 22°C</span>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 4: Remaining Season Schedule */}
            {phase === 'remaining' && (
              <div className="h-full flex flex-col justify-between">
                <div className="grid grid-cols-4 gap-4 h-full">
                  {remainingRaces.slice(0, 8).map((race) => (
                    <div
                      key={race.round}
                      className="bg-[rgba(15,20,28,0.75)] border border-[#253243] p-4 rounded flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between border-b border-[#202b3a] pb-2">
                        <span className="text-xs font-black text-[#00d2be]">ROUND {race.round}</span>
                        <span className="text-xs text-[#8c9cae]">{race.date}</span>
                      </div>
                      <div className="py-2">
                        <div className="text-base font-black text-white">{race.name}</div>
                        <div className="text-xs text-[#718294]">{race.circuit}</div>
                        <div className="text-xs text-[#8ca0b4] pt-1">{race.location}, {race.country}</div>
                      </div>
                      <div className="bg-[#10151e] p-2.5 rounded border border-[#1e2735] flex items-center justify-between text-xs">
                        <span className="text-[#8899aa]">RACE DISTANCE</span>
                        <span className="font-bold text-white">{race.laps || 53} LAPS</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-3 px-2">
                  <span>REMAINING GRAND PRIX: {remainingRaces.length} ROUNDS</span>
                  <span>CHAMPIONSHIP DECIDERS: LAS VEGAS, QATAR, YAS MARINA</span>
                </div>
              </div>
            )}

            {/* Phase 5: Season Progress Gauge */}
            {phase === 'progress' && (
              <div className="h-full flex items-center justify-between px-12 bg-[rgba(14,19,26,0.7)] border border-[#1b2533] p-8">
                <div className="space-y-4 max-w-xl">
                  <div className="f1-telemetry-badge text-[#ffb800]">
                    2026 SEASON TIMELINE // TELEMETRY MONITOR
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-white uppercase">
                    Championship Season Progress
                  </h1>
                  <p className="text-xs text-[#9eb1c4] leading-relaxed">
                    With {completedCount} of 24 Grand Prix in the books, the 2026 FIA Formula 1 World
                    Championship enters the critical European summer phase before heading overseas to the
                    Americas and Middle Eastern season finale.
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>SEASON COMPLETION: {progressPercent}%</span>
                      <span>{completedCount} / {totalRaces} RACES</span>
                    </div>
                    <div className="w-full h-3 bg-[#111721] rounded overflow-hidden border border-[#232f3e]">
                      <div
                        className="h-full bg-gradient-to-r from-[#00d2be] to-[#e10600] rounded"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#101620] border border-[#232f3e] p-5 rounded text-center w-52">
                    <div className="text-xs text-[#718294] font-bold">COMPLETED LAPS</div>
                    <div className="text-3xl font-black text-white pt-1">798</div>
                    <div className="text-[10px] text-[#556677] pt-1">OUT OF ~1,350 LAPS</div>
                  </div>
                  <div className="bg-[#101620] border border-[#232f3e] p-5 rounded text-center w-52">
                    <div className="text-xs text-[#718294] font-bold">POINTS AWARDED</div>
                    <div className="text-3xl font-black text-[#00d2be] pt-1">1,428</div>
                    <div className="text-[10px] text-[#556677] pt-1">CONSTRUCTORS & DRIVERS</div>
                  </div>
                  <div className="bg-[#101620] border border-[#232f3e] p-5 rounded text-center w-52">
                    <div className="text-xs text-[#718294] font-bold">SAFETY CAR PERIODS</div>
                    <div className="text-3xl font-black text-[#ffb800] pt-1">19</div>
                    <div className="text-[10px] text-[#556677] pt-1">VSC & FULL SC</div>
                  </div>
                  <div className="bg-[#101620] border border-[#232f3e] p-5 rounded text-center w-52">
                    <div className="text-xs text-[#718294] font-bold">OVERTAKES RECORDED</div>
                    <div className="text-3xl font-black text-[#e10600] pt-1">682</div>
                    <div className="text-[10px] text-[#556677] pt-1">ON-TRACK PASSES</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Telemetry Ticker */}
          <div className="flex items-center justify-between text-[11px] text-[#525f70] border-t border-[#181d24] pt-2 px-2">
            <span>SCREEN: BIG_SCREEN1 (FAMILY B - TOWER EAST)</span>
            <span>DISPLAY RESOLUTION: 1920 x 844 (2.28:1)</span>
            <span>FIA 2026 OFFICIAL SPORTING REGULATIONS ACCREDITED</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
