'use client'

import { Html } from '@react-three/drei'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import {
  DriverHistoryRecord,
  DriverProfile,
  f1DataService,
} from '@/lib/f1/f1DataService'
import { ScreenAnchor } from '../types'
import { AUTOPLAY_TIMINGS, EXHIBITION_SCREEN_CONFIG } from './ScreenConfig'
import { useScreenVisibility } from './OcclusionManager'
import './screenStyles.css'

interface InsideScreen2ControllerProps {
  anchor: ScreenAnchor
  occluders?: THREE.Object3D[]
}

type Phase = 'grid' | 'profile' | 'seasonStats' | 'careerStats' | 'timeline' | 'results'

export default function InsideScreen2Controller({
  anchor,
  occluders,
}: InsideScreen2ControllerProps) {
  const config = EXHIBITION_SCREEN_CONFIG.inside2
  const isVisible = useScreenVisibility(anchor, occluders, config.maxViewDistance)

  const [phase, setPhase] = useState<Phase>('grid')
  const [drivers, setDrivers] = useState<DriverProfile[]>([])
  const [activeDriverIdx, setActiveDriverIdx] = useState(0)

  useEffect(() => {
    const update = () => {
      const dList = f1DataService.getCurrentDrivers()
      setDrivers(dList)
    }
    update()
    const unsubscribe = f1DataService.subscribe(update)
    return () => unsubscribe()
  }, [])

  // Autoplay presentation sequence with staggered start (+2.5s)
  useEffect(() => {
    const sequence: { phase: Phase; duration: number }[] = [
      { phase: 'grid', duration: AUTOPLAY_TIMINGS.gridOverview },
      { phase: 'profile', duration: AUTOPLAY_TIMINGS.driverProfile },
      { phase: 'seasonStats', duration: AUTOPLAY_TIMINGS.driverStats },
      { phase: 'careerStats', duration: AUTOPLAY_TIMINGS.driverStats },
      { phase: 'timeline', duration: AUTOPLAY_TIMINGS.driverHistory },
      { phase: 'results', duration: AUTOPLAY_TIMINGS.driverResults },
    ]

    let currentIdx = 0
    let timeoutId: NodeJS.Timeout

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        currentIdx = (currentIdx + 1) % sequence.length
        setPhase(sequence[currentIdx].phase)

        // Rotate through spotlight drivers on each complete cycle
        if (currentIdx === 0) {
          setActiveDriverIdx((prev) => (prev + 1) % Math.min(drivers.length || 1, 8))
        }

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
  }, [config.staggerDelayMs, drivers.length])

  const activeDriver: DriverProfile | null = drivers[activeDriverIdx] || drivers[0] || null
  const driverHistory: DriverHistoryRecord | null = activeDriver
    ? f1DataService.getDriverHistory(activeDriver.id)
    : null

  return (
    <group
      position={[anchor.position.x, anchor.position.y, anchor.position.z]}
      rotation={[0, Math.PI, 0]}
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
        <div className="f1-screen-root w-full h-full flex flex-col justify-between p-6">
          {/* Top Telemetry Header Bar */}
          <div className="f1-header-bar px-6 py-2.5">
            <div className="flex items-center gap-4">
              <span className="w-3 h-3 bg-[#00d2be] animate-pulse inline-block" />
              <span className="text-sm font-black tracking-widest text-white">
                FIA FORMULA 1 DRIVER ARCHIVE // 2026 GRID PROFILES & CAREER METRICS
              </span>
              <span className="text-xs px-2 py-0.5 bg-[#182029] border border-[#2b3747] text-[#00d2be] font-bold">
                DRIVER INTELLIGENCE
              </span>
            </div>

            {/* Navigation / Phase Tabs */}
            <div className="flex items-center gap-2 text-xs font-bold">
              {[
                { id: 'grid', label: '01 // GRID OVERVIEW' },
                { id: 'profile', label: '02 // DRIVER SPOTLIGHT' },
                { id: 'seasonStats', label: '03 // 2026 STATS' },
                { id: 'careerStats', label: '04 // CAREER TOTALS' },
                { id: 'timeline', label: '05 // TIMELINE' },
                { id: 'results', label: '06 // RACE LOG' },
              ].map((tab) => (
                <span
                  key={tab.id}
                  className={`px-3 py-1 border transition-all ${
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

          {/* Main Display Body */}
          <div className="flex-1 overflow-hidden py-3 px-2">
            {/* Phase 1: 2026 Grid Overview */}
            {phase === 'grid' && (
              <div className="h-full flex flex-col justify-between">
                <div className="grid grid-cols-5 gap-3 h-full">
                  {drivers.slice(0, 10).map((d) => (
                    <div
                      key={d.id}
                      className="bg-[rgba(15,20,27,0.7)] border border-[#232d3b] p-3 flex flex-col justify-between rounded hover:border-[#00d2be] transition-colors"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-[#1b232e]">
                        <span className="text-xs font-black text-[#00d2be]">#{d.number}</span>
                        <span className="text-[10px] text-[#788a9c] font-bold">{d.country.toUpperCase()}</span>
                      </div>
                      <div className="py-2">
                        <div className="text-sm font-bold text-white truncate">{d.name.toUpperCase()}</div>
                        <div className="text-xs truncate font-semibold" style={{ color: d.teamColor }}>
                          {d.team}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#1b232e] text-[10px]">
                        <span className="text-[#657788]">POS {d.season2026.position}</span>
                        <span className="font-bold text-white">{d.season2026.points} PTS</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>2026 WORLD CHAMPIONSHIP GRID // 10 CONSTRUCTORS // 20 REGISTERED DRIVERS</span>
                  <span>CURRENT ROTATING SPOTLIGHT: {activeDriver?.name.toUpperCase()} (#{activeDriver?.number})</span>
                </div>
              </div>
            )}

            {/* Phase 2: Driver Hero Profile */}
            {phase === 'profile' && activeDriver && (
              <div className="h-full flex items-center justify-between px-10 bg-[rgba(14,18,24,0.65)] border border-[#1b232e] p-6">
                <div className="space-y-3 max-w-xl">
                  <div className="f1-telemetry-badge text-[#00d2be]">
                    DRIVER PROFILE // {activeDriver.team.toUpperCase()}
                  </div>
                  <div className="text-sm font-bold tracking-widest text-[#728599]">
                    PERMANENT CAR NUMBER #{activeDriver.number} // {activeDriver.country.toUpperCase()}
                  </div>
                  <h1 className="text-5xl font-black tracking-tight text-white uppercase">
                    {activeDriver.name}
                  </h1>
                  <p className="text-xs text-[#9eb1c4] leading-relaxed">
                    Competing for {activeDriver.team} in the 2026 FIA Formula 1 World Championship.
                    Currently holding Position {activeDriver.season2026.position} in the Driver Standings
                    with {activeDriver.season2026.points} Championship Points.
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="border-l-2 border-[#00d2be] pl-3">
                      <div className="text-[10px] text-[#718293]">SEASON WINS</div>
                      <div className="text-xl font-black text-white">{activeDriver.season2026.wins}</div>
                    </div>
                    <div className="border-l-2 border-[#e10600] pl-3">
                      <div className="text-[10px] text-[#718293]">SEASON PODIUMS</div>
                      <div className="text-xl font-black text-white">{activeDriver.season2026.podiums}</div>
                    </div>
                    <div className="border-l-2 border-[#ffb800] pl-3">
                      <div className="text-[10px] text-[#718293]">WORLD TITLES</div>
                      <div className="text-xl font-black text-white">{activeDriver.career.championships}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-[#0e1319] border border-[#232c38] rounded w-80 text-center">
                  <div className="w-24 h-24 rounded-full border-2 border-[#00d2be] overflow-hidden mb-3 bg-[#131922] flex items-center justify-center">
                    {activeDriver.headshotUrl ? (
                      <img
                        src={activeDriver.headshotUrl}
                        alt={activeDriver.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-[#00d2be]">#{activeDriver.number}</span>
                    )}
                  </div>
                  <div className="text-base font-bold text-white uppercase">{activeDriver.name}</div>
                  <div className="text-xs text-[#9eb1c4] font-semibold" style={{ color: activeDriver.teamColor }}>
                    {activeDriver.team}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#1f2835] w-full text-[11px] text-[#6f8092]">
                    RACING LICENSE: FIA SUPER LICENSE A1
                  </div>
                </div>
              </div>
            )}

            {/* Phase 3: 2026 Season Performance Stats */}
            {phase === 'seasonStats' && activeDriver && (
              <div className="h-full flex flex-col justify-between bg-[rgba(14,18,24,0.65)] border border-[#1b232e] p-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#212b38]">
                  <div>
                    <span className="text-xs font-black tracking-widest text-[#00d2be] uppercase">
                      2026 SEASON TELEMETRY METRICS
                    </span>
                    <h2 className="text-xl font-black text-white">{activeDriver.name.toUpperCase()} (#{activeDriver.number})</h2>
                  </div>
                  <div className="text-xs text-[#75879a] font-bold" style={{ color: activeDriver.teamColor }}>
                    {activeDriver.team.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 my-auto">
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">CHAMPIONSHIP RANK</div>
                    <div className="text-3xl font-black text-[#00d2be] pt-1">P{activeDriver.season2026.position}</div>
                    <div className="text-[10px] text-[#556677] pt-1">OUT OF 20 DRIVERS</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">CHAMPIONSHIP POINTS</div>
                    <div className="text-3xl font-black text-white pt-1">{activeDriver.season2026.points}</div>
                    <div className="text-[10px] text-[#556677] pt-1">14 ROUNDS RACED</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">GRAND PRIX WINS</div>
                    <div className="text-3xl font-black text-[#ffb800] pt-1">{activeDriver.season2026.wins}</div>
                    <div className="text-[10px] text-[#556677] pt-1">WIN RATIO: {Math.round((activeDriver.season2026.wins / 14) * 100)}%</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">PODIUM FINISHES</div>
                    <div className="text-3xl font-black text-[#e10600] pt-1">{activeDriver.season2026.podiums}</div>
                    <div className="text-[10px] text-[#556677] pt-1">PODIUM RATE: {Math.round((activeDriver.season2026.podiums / 14) * 100)}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>POLES: {activeDriver.season2026.poles} // FASTEST LAPS: {activeDriver.season2026.fastestLaps} // STARTS: {activeDriver.season2026.starts}</span>
                  <span>RELIABILITY SCORE: {100 - activeDriver.season2026.dnf * 7}% FINISH RATE</span>
                </div>
              </div>
            )}

            {/* Phase 4: Career Stats */}
            {phase === 'careerStats' && activeDriver && (
              <div className="h-full flex flex-col justify-between bg-[rgba(14,18,24,0.65)] border border-[#1b232e] p-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#212b38]">
                  <div>
                    <span className="text-xs font-black tracking-widest text-[#00d2be] uppercase">
                      ALL-TIME FORMULA 1 CAREER TOTALS
                    </span>
                    <h2 className="text-xl font-black text-white">{activeDriver.name.toUpperCase()}</h2>
                  </div>
                  <div className="text-xs text-[#75879a] font-bold">
                    ACTIVE ERA: 2026 DRIVER COHORT
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 my-auto">
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">WORLD TITLES</div>
                    <div className="text-3xl font-black text-[#ffb800] pt-1">{activeDriver.career.championships}</div>
                    <div className="text-[10px] text-[#556677] pt-1">FIA WDC TITLES</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">CAREER STARTS</div>
                    <div className="text-3xl font-black text-white pt-1">{activeDriver.career.starts}</div>
                    <div className="text-[10px] text-[#556677] pt-1">GRAND PRIX ENTRIES</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">CAREER WINS</div>
                    <div className="text-3xl font-black text-[#e10600] pt-1">{activeDriver.career.wins}</div>
                    <div className="text-[10px] text-[#556677] pt-1">P1 TROPHIES</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">CAREER PODIUMS</div>
                    <div className="text-3xl font-black text-[#00d2be] pt-1">{activeDriver.career.podiums}</div>
                    <div className="text-[10px] text-[#556677] pt-1">TOP-3 FINISHES</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">POLE POSITIONS</div>
                    <div className="text-3xl font-black text-[#9b51e0] pt-1">{activeDriver.career.poles}</div>
                    <div className="text-[10px] text-[#556677] pt-1">QUALIFYING P1</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>HISTORICAL RECOGNITION: FIA FORMULA 1 WORLD CHAMPIONSHIP HALL OF RECORDS</span>
                  <span>WIN PERCENTAGE: {activeDriver.career.starts > 0 ? Math.round((activeDriver.career.wins / activeDriver.career.starts) * 100) : 0}%</span>
                </div>
              </div>
            )}

            {/* Phase 5: Career Timeline */}
            {phase === 'timeline' && activeDriver && driverHistory && (
              <div className="h-full flex flex-col justify-between bg-[rgba(14,18,24,0.65)] border border-[#1b232e] p-6">
                <div className="flex items-center justify-between pb-2 border-b border-[#212b38]">
                  <span className="text-xs font-black tracking-widest text-[#00d2be] uppercase">
                    CAREER MILESTONES & JOURNEY // {activeDriver.name.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#718294] font-bold">MOTORSPORT PROGRESSION</span>
                </div>

                <div className="flex items-center justify-between gap-4 my-auto px-4">
                  {driverHistory.timeline.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex-1 bg-[#121822] border border-[#232e3d] p-4 rounded relative">
                      <div className="text-xs font-black text-[#00d2be] pb-1">{item.year}</div>
                      <div className="text-xs text-white leading-relaxed font-semibold">{item.event}</div>
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00d2be] opacity-50" />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>CAREER ACCREDITATION: MOTORSPORT UK & FIA SUPER LICENSE</span>
                  <span>VERIFIED RECORD // 2026 ARCHIVE</span>
                </div>
              </div>
            )}

            {/* Phase 6: Recent Results Log */}
            {phase === 'results' && activeDriver && driverHistory && (
              <div className="h-full flex flex-col justify-between">
                <div className="pb-2 border-b border-[#212b38] flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-[#00d2be] uppercase">
                    RECENT RACE LOG // 2026 ROUND-BY-ROUND BREAKDOWN ({activeDriver.name.toUpperCase()})
                  </span>
                  <span className="text-xs text-[#718294] font-bold">LAST 5 ROUNDS</span>
                </div>

                <table className="f1-data-table my-auto">
                  <thead>
                    <tr>
                      <th>ROUND</th>
                      <th>GRAND PRIX</th>
                      <th>QUALIFYING</th>
                      <th>FINISH</th>
                      <th>FASTEST LAP</th>
                      <th className="text-right">POINTS AWARDED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverHistory.raceResults2026.slice(0, 5).map((res, rIdx) => (
                      <tr key={rIdx}>
                        <td className="font-bold text-[#00d2be]">{res.round}</td>
                        <td className="font-bold text-white">{res.name}</td>
                        <td className="text-xs text-[#8ca0b4]">{res.pole ? 'P1 (POLE)' : 'TOP 10'}</td>
                        <td className="font-bold text-white">
                          <span className={`px-2 py-0.5 rounded text-xs ${res.pos === '1' ? 'bg-[#ffb800] text-black font-black' : 'bg-[#1b232e] text-[#00d2be]'}`}>
                            P{res.pos}
                          </span>
                        </td>
                        <td className="text-xs">{res.fl ? '⚡ YES (PURPLE)' : '—'}</td>
                        <td className="text-right font-black text-sm text-white">+{res.pts} PTS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>SCORING CRITERIA: 25-18-15-12-10-8-6-4-2-1 + 1 FASTEST LAP</span>
                  <span>TOTAL POINTS IN LOG: {driverHistory.raceResults2026.slice(0, 5).reduce((acc, curr) => acc + curr.pts, 0)} PTS</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Telemetry Ticker */}
          <div className="flex items-center justify-between text-[11px] text-[#525f70] border-t border-[#181d24] pt-2 px-2">
            <span>SCREEN: INSIDE_SCREEN_02 (FAMILY A)</span>
            <span>DISPLAY RESOLUTION: 1920 x 465 (4.13:1)</span>
            <span>DATA SOURCE: OPENF1 & ERGAST DRIVER ARCHIVES</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
