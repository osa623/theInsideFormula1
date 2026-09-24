'use client'

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  ChampionshipGraphData,
  ConstructorProfile,
  DriverProfile,
  f1DataService,
} from '@/lib/f1/f1DataService'
import { ScreenAnchor } from '../types'
import { SCREEN_CONFIG } from './ScreenConfig'
import './screenStyles.css'

interface WideChampionshipScreenProps {
  anchor: ScreenAnchor
}

type PresentationPhase = 'drivers' | 'constructors' | 'graph' | 'latestRace'

export default function WideChampionshipScreen({ anchor }: WideChampionshipScreenProps) {
  const [phase, setPhase] = useState<PresentationPhase>('drivers')
  const [drivers, setDrivers] = useState<DriverProfile[]>([])
  const [constructors, setConstructors] = useState<ConstructorProfile[]>([])
  const [graphData, setGraphData] = useState<ChampionshipGraphData | null>(null)
  const [latestRace, setLatestRace] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  const normalRef = useRef(new THREE.Vector3(0, 0, -1))
  const toCameraRef = useRef(new THREE.Vector3())

  useEffect(() => {
    const update = () => {
      setDrivers(f1DataService.getCurrentStandings())
      setConstructors(f1DataService.getConstructorStandings())
      setGraphData(f1DataService.getChampionshipGraphData())
      setLatestRace(f1DataService.getLatestRaceInfo())
    }
    update()
    const unsubscribe = f1DataService.subscribe(update)
    return () => unsubscribe()
  }, [])

  // Auto-play presentation loop driven by SCREEN_CONFIG
  useEffect(() => {
    const phases: PresentationPhase[] = ['drivers', 'constructors', 'graph', 'latestRace']
    const interval = setInterval(() => {
      setPhase((current) => {
        const nextIdx = (phases.indexOf(current) + 1) % phases.length
        return phases[nextIdx]
      })
    }, SCREEN_CONFIG.wide.phaseInterval)

    return () => clearInterval(interval)
  }, [])

  // Visibility and backface culling: only show when player is inside building and facing the screen
  useFrame(({ camera }) => {
    const dist = camera.position.distanceTo(anchor.position)
    toCameraRef.current.subVectors(camera.position, anchor.position).normalize()
    const dot = toCameraRef.current.dot(normalRef.current)

    const visible = dist < 45.0 && dot > 0.05 && camera.position.z >= 95 && camera.position.x <= 8
    if (visible !== isVisible) {
      setIsVisible(visible)
    }
  })

  // In GLB: inside_screen scale is ~4.52 x 18.65, orientation is facing in -Z
  return (
    <group
      position={[anchor.position.x, anchor.position.y, anchor.position.z]}
      rotation={[0, Math.PI, 0]}
    >
      <Html
        transform
        distanceFactor={8.0}
        position={[0, 0, 0.08]}
        rotation={[0, 0, 0]}
        pointerEvents="none"
        className="select-none"
        style={{
          width: '1800px',
          height: '460px',
          display: isVisible ? 'block' : 'none',
        }}
      >
        <div className="f1-screen-root w-full h-full flex flex-col justify-between p-6">
          {/* Header Bar */}
          <div className="f1-header-bar px-6 py-3">
            <div className="flex items-center gap-4">
              <span className="w-3 h-3 bg-[#e10600] animate-pulse inline-block" />
              <span className="text-sm font-black tracking-widest text-white">
                FIA FORMULA 1 WORLD CHAMPIONSHIP // 2026 OFFICIAL TELEMETRY BROADCAST
              </span>
            </div>

            {/* Phase Tabs Indicator */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span
                className={`px-3 py-1 border transition-all ${
                  phase === 'drivers'
                    ? 'border-[#00d2be] text-[#00d2be] bg-[rgba(0,210,190,0.12)]'
                    : 'border-[#222933] text-[#5e6d7e]'
                }`}
              >
                01 // DRIVER STANDINGS
              </span>
              <span
                className={`px-3 py-1 border transition-all ${
                  phase === 'constructors'
                    ? 'border-[#00d2be] text-[#00d2be] bg-[rgba(0,210,190,0.12)]'
                    : 'border-[#222933] text-[#5e6d7e]'
                }`}
              >
                02 // CONSTRUCTORS
              </span>
              <span
                className={`px-3 py-1 border transition-all ${
                  phase === 'graph'
                    ? 'border-[#00d2be] text-[#00d2be] bg-[rgba(0,210,190,0.12)]'
                    : 'border-[#222933] text-[#5e6d7e]'
                }`}
              >
                03 // CHAMPIONSHIP MOMENTUM
              </span>
              <span
                className={`px-3 py-1 border transition-all ${
                  phase === 'latestRace'
                    ? 'border-[#00d2be] text-[#00d2be] bg-[rgba(0,210,190,0.12)]'
                    : 'border-[#222933] text-[#5e6d7e]'
                }`}
              >
                04 // LATEST ROUND
              </span>
            </div>
          </div>

          {/* Body Content per Phase */}
          <div className="flex-1 overflow-hidden py-3 px-2">
            {/* Phase 1: Drivers Standings */}
            {phase === 'drivers' && (
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
                        <th className="text-right">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.slice(0, 5).map((d) => (
                        <tr key={d.id} className={d.season2026.position === 1 ? 'bg-[rgba(0,210,190,0.06)]' : ''}>
                          <td className="font-bold text-sm text-[#00d2be]">
                            {String(d.season2026.position).padStart(2, '0')}
                          </td>
                          <td className="text-xs text-[#708092]">{d.number}</td>
                          <td className="font-bold text-sm tracking-wide text-white">{d.name.toUpperCase()}</td>
                          <td className="text-xs text-[#9eb1c4]" style={{ color: d.teamColor }}>
                            {d.team}
                          </td>
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
                          <td className="text-right font-black text-sm text-white">{d.season2026.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>LEADER: KIMI ANTONELLI (MERCEDES) +66 PTS GAP</span>
                  <span>CURRENT REGULATION CYCLE: 2026 POWER UNIT SPEC</span>
                </div>
              </div>
            )}

            {/* Phase 2: Constructors Standings */}
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
                          <td className="text-right font-black text-sm text-white">{c.season2026.points} PTS</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-2 px-2">
                  <span>CONSTRUCTORS CHAMPIONSHIP LEADER: MERCEDES-AMG PETRONAS (468 PTS)</span>
                  <span>MERCEDES 10 WINS IN 14 ROUNDS</span>
                </div>
              </div>
            )}

            {/* Phase 3: Championship Momentum SVG Graph */}
            {phase === 'graph' && graphData && (
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
                    {[50, 100, 150, 200].map((pts, idx) => {
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
                          {/* Final point marker */}
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
              </div>
            )}

            {/* Phase 4: Latest Race & Movement */}
            {phase === 'latestRace' && latestRace && (
              <div className="h-full flex items-center justify-between gap-6 px-4">
                {/* Race Identity Card */}
                <div className="flex-1 border border-[#222a36] bg-[rgba(14,18,24,0.9)] p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="f1-telemetry-badge text-[#e10600]">LATEST GRAND PRIX RESULT</div>
                    <h2 className="text-xl font-black text-white pt-2">{latestRace.name.toUpperCase()}</h2>
                    <p className="text-xs text-[#8ea0b3]">{latestRace.circuit} // ROUND {latestRace.round} OF 24</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-[#222933] pt-3">
                    <div>
                      <span className="text-[10px] text-[#6b7b8d] uppercase block">Race Winner</span>
                      <span className="text-sm font-bold text-[#00d2be]">{latestRace.winner}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6b7b8d] uppercase block">Pole Position</span>
                      <span className="text-sm font-bold text-white">{latestRace.polePosition}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6b7b8d] uppercase block">Fastest Lap</span>
                      <span className="text-sm font-bold text-[#ffb800]">{latestRace.fastestLap}</span>
                    </div>
                  </div>
                </div>

                {/* Podium Finishers */}
                <div className="w-80 border border-[#222a36] bg-[rgba(14,18,24,0.9)] p-5 flex flex-col justify-between h-full">
                  <div className="text-xs font-bold text-[#8ba0b5] tracking-wider">OFFICIAL PODIUM CEREMONY</div>
                  <div className="space-y-2 py-2">
                    {latestRace.podium.map((name: string, pIdx: number) => (
                      <div key={pIdx} className="flex items-center justify-between border-b border-[#1c222b] pb-1.5">
                        <span className="text-xs font-black text-[#00d2be]">P{pIdx + 1}</span>
                        <span className="text-xs font-bold text-white">{name.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-[#556577] text-right">VERIFIED FIA TELEMETRY DATA</div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Broadcast Ticker */}
          <div className="f1-header-bar px-4 py-1.5 text-[10px] text-[#647486] flex items-center justify-between">
            <span>CHAMPIONSHIP DATA REFRESH: LIVE SYNC</span>
            <span>NEXT ROUND: ROUND 15 // SINGAPORE GRAND PRIX // MARINA BAY</span>
            <span>AUTO-PLAY SYSTEM: {(SCREEN_CONFIG.wide.phaseInterval / 1000).toFixed(1)}S ROTATION</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
