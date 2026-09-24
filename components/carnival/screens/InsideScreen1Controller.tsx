'use client'

import { Html } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  ChampionshipGraphData,
  ConstructorProfile,
  DriverProfile,
  f1DataService,
} from '@/lib/f1/f1DataService'
import { ScreenAnchor } from '../types'
import { AUTOPLAY_TIMINGS, EXHIBITION_SCREEN_CONFIG } from './ScreenConfig'
import { useScreenVisibility } from './OcclusionManager'
import './screenStyles.css'

interface InsideScreen1ControllerProps {
  anchor: ScreenAnchor
  occluders?: THREE.Object3D[]
}

type Phase = 'intro' | 'standings' | 'bargraph' | 'momentum' | 'constructors' | 'leader'

export default function InsideScreen1Controller({
  anchor,
  occluders,
}: InsideScreen1ControllerProps) {
  const config = EXHIBITION_SCREEN_CONFIG.inside1
  const isVisible = useScreenVisibility(anchor, occluders, config.maxViewDistance)

  const [phase, setPhase] = useState<Phase>('intro')
  const [drivers, setDrivers] = useState<DriverProfile[]>([])
  const [constructors, setConstructors] = useState<ConstructorProfile[]>([])
  const [graphData, setGraphData] = useState<ChampionshipGraphData | null>(null)
  const [leader, setLeader] = useState<DriverProfile | null>(null)

  useEffect(() => {
    const update = () => {
      const stds = f1DataService.getCurrentStandings()
      setDrivers(stds)
      if (stds.length > 0) setLeader(stds[0])
      setConstructors(f1DataService.getConstructorStandings())
      setGraphData(f1DataService.getChampionshipGraphData())
    }
    update()
    const unsubscribe = f1DataService.subscribe(update)
    return () => unsubscribe()
  }, [])

  // Autoplay presentation sequence with staggered start
  useEffect(() => {
    const sequence: { phase: Phase; duration: number }[] = [
      { phase: 'intro', duration: AUTOPLAY_TIMINGS.intro },
      { phase: 'standings', duration: AUTOPLAY_TIMINGS.standings },
      { phase: 'bargraph', duration: AUTOPLAY_TIMINGS.graph },
      { phase: 'momentum', duration: AUTOPLAY_TIMINGS.momentum },
      { phase: 'constructors', duration: AUTOPLAY_TIMINGS.constructors },
      { phase: 'leader', duration: AUTOPLAY_TIMINGS.leader },
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
              <span className="w-3 h-3 bg-[#e10600] animate-pulse inline-block" />
              <span className="text-sm font-black tracking-widest text-white">
                FIA FORMULA 1 WORLD CHAMPIONSHIP // 2026 OFFICIAL BROADCAST
              </span>
              <span className="text-xs px-2 py-0.5 bg-[#182029] border border-[#2b3747] text-[#00d2be] font-bold">
                LIVE TELEMETRY
              </span>
            </div>

            {/* Navigation / Phase Tabs */}
            <div className="flex items-center gap-2 text-xs font-bold">
              {[
                { id: 'intro', label: '01 // OVERVIEW' },
                { id: 'standings', label: '02 // DRIVERS' },
                { id: 'bargraph', label: '03 // POINTS BARS' },
                { id: 'momentum', label: '04 // MOMENTUM' },
                { id: 'constructors', label: '05 // CONSTRUCTORS' },
                { id: 'leader', label: '06 // LEADER' },
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
            {/* Phase 1: Intro Overview */}
            {phase === 'intro' && (
              <div className="h-full flex items-center justify-between px-8 bg-[rgba(14,18,24,0.65)] border border-[#1b232e] p-6">
                <div className="space-y-4 max-w-xl">
                  <div className="f1-telemetry-badge text-[#e10600]">
                    SEASON 2026 // NEW TECHNICAL REGULATIONS
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-white uppercase">
                    2026 Championship Status
                  </h1>
                  <p className="text-xs text-[#9eb1c4] leading-relaxed">
                    Welcome to the 2026 FIA Formula 1 World Championship. Featuring next-generation
                    active aerodynamics, 100% sustainable advanced fuels, and a 50/50 internal
                    combustion to electrical power unit split generating over 1,000 BHP.
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="border-l-2 border-[#00d2be] pl-3">
                      <div className="text-[10px] text-[#718293]">ROUNDS COMPLETED</div>
                      <div className="text-lg font-black text-white">14 / 24</div>
                    </div>
                    <div className="border-l-2 border-[#e10600] pl-3">
                      <div className="text-[10px] text-[#718293]">CURRENT LEADER</div>
                      <div className="text-lg font-black text-white">{leader?.name || 'MAX VERSTAPPEN'}</div>
                    </div>
                    <div className="border-l-2 border-[#ffb800] pl-3">
                      <div className="text-[10px] text-[#718293]">TOP CONSTRUCTOR</div>
                      <div className="text-lg font-black text-white">{constructors[0]?.name || 'MERCEDES-AMG'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-[#0e1319] border border-[#232c38] rounded">
                  <div className="text-xs font-bold text-[#00d2be] tracking-widest uppercase mb-2">
                    REGULATION HIGHLIGHTS
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#141a22] p-3 border border-[#25303e]">
                      <div className="text-[#8899aa] text-[10px]">POWER UNIT</div>
                      <div className="text-white font-bold">50% ICE + 50% MGU-K</div>
                    </div>
                    <div className="bg-[#141a22] p-3 border border-[#25303e]">
                      <div className="text-[#8899aa] text-[10px]">AERO MODE</div>
                      <div className="text-white font-bold">ACTIVE Z-MODE & X-MODE</div>
                    </div>
                    <div className="bg-[#141a22] p-3 border border-[#25303e]">
                      <div className="text-[#8899aa] text-[10px]">CHASSIS WEIGHT</div>
                      <div className="text-white font-bold">-30 KG LIGHTER SPEC</div>
                    </div>
                    <div className="bg-[#141a22] p-3 border border-[#25303e]">
                      <div className="text-[#8899aa] text-[10px]">SAFETY RATING</div>
                      <div className="text-white font-bold">FIA GRADE 1+</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 2: Driver Standings Table */}
            {phase === 'standings' && (
              <div className="h-full flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-x-8">
                  {/* Left Column (P1 - P5) */}
                  <table className="f1-data-table">
                    <thead>
                      <tr>
                        <th>POS</th>
                        <th>NO</th>
                        <th>DRIVER</th>
                        <th>CONSTRUCTOR</th>
                        <th>WINS</th>
                        <th className="text-right">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.slice(0, 5).map((d) => (
                        <tr key={d.id} className={d.season2026.position === 1 ? 'bg-[rgba(0,210,190,0.08)]' : ''}>
                          <td className="font-bold text-sm text-[#00d2be]">
                            {String(d.season2026.position).padStart(2, '0')}
                          </td>
                          <td className="text-xs text-[#708092]">{d.number}</td>
                          <td className="font-bold text-sm tracking-wide text-white">{d.name.toUpperCase()}</td>
                          <td className="text-xs text-[#9eb1c4]" style={{ color: d.teamColor }}>
                            {d.team}
                          </td>
                          <td className="text-xs text-[#a0b0c0]">{d.season2026.wins}</td>
                          <td className="text-right font-black text-sm text-white">{d.season2026.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Right Column (P6 - P10) */}
                  <table className="f1-data-table">
                    <thead>
                      <tr>
                        <th>POS</th>
                        <th>NO</th>
                        <th>DRIVER</th>
                        <th>CONSTRUCTOR</th>
                        <th>WINS</th>
                        <th className="text-right">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.slice(5, 10).map((d) => (
                        <tr key={d.id}>
                          <td className="font-bold text-sm text-[#8c9cae]">
                            {String(d.season2026.position).padStart(2, '0')}
                          </td>
                          <td className="text-xs text-[#708092]">{d.number}</td>
                          <td className="font-bold text-sm tracking-wide text-[#e1e7ee]">{d.name.toUpperCase()}</td>
                          <td className="text-xs text-[#9eb1c4]" style={{ color: d.teamColor }}>
                            {d.team}
                          </td>
                          <td className="text-xs text-[#a0b0c0]">{d.season2026.wins}</td>
                          <td className="text-right font-black text-sm text-white">{d.season2026.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>LEADER: {leader?.name.toUpperCase()} ({leader?.team.toUpperCase()}) — {leader?.season2026.points} PTS</span>
                  <span>STANDINGS UPDATED: ROUND 14 / BELGIAN GRAND PRIX</span>
                </div>
              </div>
            )}

            {/* Phase 3: Bar Graph Points Comparison */}
            {phase === 'bargraph' && (
              <div className="h-full flex flex-col justify-between bg-[rgba(14,18,24,0.65)] border border-[#1b232e] p-4">
                <div className="flex items-center justify-between pb-2 text-xs border-b border-[#212936]">
                  <span className="text-[#00d2be] font-bold tracking-wider">
                    CHAMPIONSHIP POINTS COMPARISON // TOP 8 DRIVERS
                  </span>
                  <span className="text-[#728394] text-[11px]">MAX POINTS AVAILABLE: 25 PTS/RACE</span>
                </div>

                <div className="grid grid-cols-8 gap-4 items-end flex-1 pt-6 pb-2 px-6">
                  {drivers.slice(0, 8).map((d) => {
                    const maxPts = drivers[0]?.season2026.points || 300
                    const heightPercent = Math.max(12, Math.round((d.season2026.points / maxPts) * 100))
                    return (
                      <div key={d.id} className="flex flex-col items-center h-full justify-end group">
                        <div className="text-sm font-black text-white pb-1">{d.season2026.points}</div>
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${heightPercent}%`,
                            backgroundColor: d.teamColor || '#00d2be',
                            boxShadow: `0 0 16px ${d.teamColor}33`,
                          }}
                        />
                        <div className="pt-2 text-center">
                          <div className="text-xs font-bold text-white truncate max-w-[100px]">
                            {d.name.split(' ').pop()?.toUpperCase()}
                          </div>
                          <div className="text-[10px] text-[#718294]">P{d.season2026.position}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>POINTS DELTA (P1 TO P2): {(drivers[0]?.season2026.points || 0) - (drivers[1]?.season2026.points || 0)} PTS</span>
                  <span>REMAINING ROUNDS: 10 GRAND PRIX</span>
                </div>
              </div>
            )}

            {/* Phase 4: Championship Momentum SVG Graph */}
            {phase === 'momentum' && graphData && (
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center justify-between px-2 pb-1 text-xs">
                  <span className="text-[#00d2be] font-bold tracking-wider">
                    POINTS ACCUMULATION TRAJECTORY // ROUNDS 01 - 14
                  </span>
                  <div className="flex items-center gap-4">
                    {graphData.drivers.map((d) => (
                      <div key={d.id} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                        <span className="text-white font-semibold">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SVG Graph */}
                <div className="relative flex-1 w-full border border-[#1e252f] bg-[rgba(10,13,17,0.85)] p-2">
                  <svg className="w-full h-full" viewBox="0 0 1000 220" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[50, 100, 150, 200, 250].map((pts, idx) => {
                      const y = 200 - (pts / 300) * 180
                      return (
                        <g key={idx}>
                          <line x1="40" y1={y} x2="980" y2={y} stroke="#1b222c" strokeWidth="1" strokeDasharray="4 4" />
                          <text x="10" y={y + 4} fill="#546476" fontSize="10" fontFamily="monospace">
                            {pts}
                          </text>
                        </g>
                      )
                    })}

                    {/* Rounds on X-axis */}
                    {graphData.rounds.map((round, rIdx) => {
                      const x = 50 + (rIdx / (graphData.rounds.length - 1)) * 920
                      return (
                        <text
                          key={rIdx}
                          x={x}
                          y="215"
                          fill="#68788a"
                          fontSize="10"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {round}
                        </text>
                      )
                    })}

                    {/* Driver Lines */}
                    {graphData.drivers.map((d) => {
                      const pointsStr = d.points
                        .map((pts, idx) => {
                          const x = 50 + (idx / (d.points.length - 1)) * 920
                          const y = 200 - (pts / 300) * 180
                          return `${x},${y}`
                        })
                        .join(' ')

                      return (
                        <g key={d.id}>
                          <polyline
                            fill="none"
                            stroke={d.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={pointsStr}
                          />
                          {d.points.length > 0 && (
                            <circle
                              cx={50 + 920}
                              cy={200 - (d.points[d.points.length - 1] / 300) * 180}
                              r="3.5"
                              fill={d.color}
                            />
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>TELEMETRY METRIC: TOTAL WORLD CHAMPIONSHIP POINTS BY ROUND</span>
                  <span>ACCELERATING MOMENTUM: ANTONELLI & VERSTAPPEN</span>
                </div>
              </div>
            )}

            {/* Phase 5: Constructor Standings */}
            {phase === 'constructors' && (
              <div className="h-full flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-x-8">
                  {/* Left Column (P1 - P5) */}
                  <table className="f1-data-table">
                    <thead>
                      <tr>
                        <th>POS</th>
                        <th>CONSTRUCTOR</th>
                        <th>STATUS</th>
                        <th>WINS</th>
                        <th>PODIUMS</th>
                        <th className="text-right">POINTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {constructors.slice(0, 5).map((c) => (
                        <tr key={c.id}>
                          <td className="font-bold text-sm text-[#00d2be]">
                            {String(c.season2026.position).padStart(2, '0')}
                          </td>
                          <td className="font-bold text-sm tracking-wide" style={{ color: c.color }}>
                            {c.shortName.toUpperCase()}
                          </td>
                          <td className="text-xs text-[#8ca0b4]">{c.season2026.status}</td>
                          <td className="text-xs text-[#e1e7ee]">{c.season2026.wins}</td>
                          <td className="text-xs text-[#e1e7ee]">{c.season2026.podiums}</td>
                          <td className="text-right font-black text-sm text-white">{c.season2026.points} PTS</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Right Column (P6 - P10) */}
                  <table className="f1-data-table">
                    <thead>
                      <tr>
                        <th>POS</th>
                        <th>CONSTRUCTOR</th>
                        <th>STATUS</th>
                        <th>WINS</th>
                        <th>PODIUMS</th>
                        <th className="text-right">POINTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {constructors.slice(5, 10).map((c) => (
                        <tr key={c.id}>
                          <td className="font-bold text-sm text-[#8c9cae]">
                            {String(c.season2026.position).padStart(2, '0')}
                          </td>
                          <td className="font-bold text-sm tracking-wide" style={{ color: c.color }}>
                            {c.shortName.toUpperCase()}
                          </td>
                          <td className="text-xs text-[#8ca0b4]">{c.season2026.status}</td>
                          <td className="text-xs text-[#e1e7ee]">{c.season2026.wins}</td>
                          <td className="text-xs text-[#e1e7ee]">{c.season2026.podiums}</td>
                          <td className="text-right font-black text-sm text-white">{c.season2026.points} PTS</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>CONSTRUCTORS CHAMPIONSHIP LEADER: {constructors[0]?.name.toUpperCase()} ({constructors[0]?.season2026.points} PTS)</span>
                  <span>GAP TO P2: {(constructors[0]?.season2026.points || 0) - (constructors[1]?.season2026.points || 0)} PTS</span>
                </div>
              </div>
            )}

            {/* Phase 6: Championship Leader Hero */}
            {phase === 'leader' && leader && (
              <div className="h-full flex items-center justify-between px-10 bg-[rgba(14,18,24,0.65)] border border-[#1b232e] p-6">
                <div className="space-y-3">
                  <div className="f1-telemetry-badge text-[#00d2be]">
                    CHAMPIONSHIP LEADER // P01 SPOTLIGHT
                  </div>
                  <div className="text-xs font-bold tracking-widest text-[#728599]">
                    CAR #{leader.number} // {leader.team.toUpperCase()}
                  </div>
                  <h1 className="text-5xl font-black tracking-tight text-white uppercase">
                    {leader.name}
                  </h1>
                  <div className="flex items-center gap-6 pt-3">
                    <div className="border-l-2 border-[#00d2be] pl-4">
                      <div className="text-[10px] text-[#718293]">SEASON POINTS</div>
                      <div className="text-2xl font-black text-white">{leader.season2026.points} PTS</div>
                    </div>
                    <div className="border-l-2 border-[#e10600] pl-4">
                      <div className="text-[10px] text-[#718293]">GRAND PRIX WINS</div>
                      <div className="text-2xl font-black text-white">{leader.season2026.wins}</div>
                    </div>
                    <div className="border-l-2 border-[#ffb800] pl-4">
                      <div className="text-[10px] text-[#718293]">PODIUM FINISHES</div>
                      <div className="text-2xl font-black text-white">{leader.season2026.podiums}</div>
                    </div>
                    <div className="border-l-2 border-[#9b51e0] pl-4">
                      <div className="text-[10px] text-[#718293]">POLE POSITIONS</div>
                      <div className="text-2xl font-black text-white">{leader.season2026.poles}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-[#0e1319] border border-[#232c38] rounded w-80 text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-[#00d2be] overflow-hidden mb-3 bg-[#131922] flex items-center justify-center">
                    {leader.headshotUrl ? (
                      <img
                        src={leader.headshotUrl}
                        alt={leader.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-black text-[#00d2be]">#{leader.number}</span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white uppercase">{leader.name}</div>
                  <div className="text-xs text-[#9eb1c4]" style={{ color: leader.teamColor }}>
                    {leader.team}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#1f2835] w-full text-[11px] text-[#6f8092]">
                    NATIONALITY: {leader.country.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Telemetry Ticker */}
          <div className="flex items-center justify-between text-[11px] text-[#525f70] border-t border-[#181d24] pt-2 px-2">
            <span>SCREEN: INSIDE_SCREEN_01 (FAMILY A)</span>
            <span>DISPLAY RESOLUTION: 1920 x 465 (4.13:1)</span>
            <span>DATA SOURCE: ERGAST / JOLPICA LIVE TELEMETRY</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
