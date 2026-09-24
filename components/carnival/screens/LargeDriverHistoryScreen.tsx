'use client'

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import {
  ConstructorHistoryRecord,
  ConstructorProfile,
  DriverHistoryRecord,
  DriverProfile,
  f1DataService,
} from '@/lib/f1/f1DataService'
import { ScreenAnchor } from '../types'
import { SCREEN_CONFIG } from './ScreenConfig'
import './screenStyles.css'

interface LargeDriverHistoryScreenProps {
  anchor: ScreenAnchor
}

type ScreenMode = 'driver' | 'constructor'

export default function LargeDriverHistoryScreen({ anchor }: LargeDriverHistoryScreenProps) {
  const [drivers, setDrivers] = useState<DriverProfile[]>([])
  const [constructors, setConstructors] = useState<ConstructorProfile[]>([])
  const [currentDriverIdx, setCurrentDriverIdx] = useState(0)
  const [currentConstructorIdx, setCurrentConstructorIdx] = useState(0)
  const [mode, setMode] = useState<ScreenMode>('driver')
  const [isVisible, setIsVisible] = useState(false)

  const modeRef = useRef(mode)
  modeRef.current = mode
  const driverIdxRef = useRef(currentDriverIdx)
  driverIdxRef.current = currentDriverIdx
  const constructorIdxRef = useRef(currentConstructorIdx)
  constructorIdxRef.current = currentConstructorIdx

  useEffect(() => {
    const update = () => {
      setDrivers(f1DataService.getCurrentDrivers())
      setConstructors(f1DataService.getCurrentConstructors())
    }
    update()
    const unsubscribe = f1DataService.subscribe(update)
    return () => unsubscribe()
  }, [])

  // Auto-play presentation loop: cycles through top drivers, then top constructors, driven by SCREEN_CONFIG
  useEffect(() => {
    if (drivers.length === 0 || constructors.length === 0) return

    const interval = setInterval(() => {
      if (modeRef.current === 'driver') {
        const maxDrivers = Math.min(drivers.length, 6)
        if (driverIdxRef.current + 1 < maxDrivers) {
          setCurrentDriverIdx((prev) => prev + 1)
        } else {
          setMode('constructor')
          setCurrentConstructorIdx(0)
        }
      } else {
        const maxConstructors = Math.min(constructors.length, 4)
        if (constructorIdxRef.current + 1 < maxConstructors) {
          setCurrentConstructorIdx((prev) => prev + 1)
        } else {
          setMode('driver')
          setCurrentDriverIdx(0)
        }
      }
    }, SCREEN_CONFIG.large.sceneInterval)

    return () => clearInterval(interval)
  }, [drivers.length, constructors.length])

  // Visibility and occlusion: only visible when player is inside the racing building
  useFrame(({ camera }) => {
    const dist = camera.position.distanceTo(anchor.position)
    const visible = dist < 40.0 && camera.position.y > 0.4 && camera.position.z >= 95 && camera.position.x <= 8
    if (visible !== isVisible) {
      setIsVisible(visible)
    }
  })

  const activeDriver = drivers[currentDriverIdx] || null
  const driverHistory: DriverHistoryRecord | null = activeDriver
    ? f1DataService.getDriverHistory(activeDriver.id)
    : null

  const activeConstructor = constructors[currentConstructorIdx] || null
  const constructorHistory: ConstructorHistoryRecord | null = activeConstructor
    ? f1DataService.getConstructorHistory(activeConstructor.id)
    : null

  return (
    <group
      position={[anchor.position.x, anchor.position.y + 0.05, anchor.position.z]}
      rotation={[-Math.PI / 2, 0, Math.PI]}
    >
      <Html
        transform
        distanceFactor={8.0}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        pointerEvents="none"
        className="select-none"
        style={{
          width: '1800px',
          height: '1050px',
          display: isVisible ? 'block' : 'none',
        }}
      >
        <div className="f1-screen-root w-full h-full flex flex-col justify-between p-10">
          {/* Header Bar */}
          <div className="f1-header-bar px-8 py-4">
            <div className="flex items-center gap-4">
              <span className="w-3.5 h-3.5 bg-[#e10600] animate-pulse inline-block" />
              <span className="text-base font-black tracking-widest text-white">
                FIA FORMULA 1 HISTORICAL & TECHNICAL DATABASE // 2026 ARCHIVE
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <span
                className={`px-4 py-1.5 border transition-all ${
                  mode === 'driver'
                    ? 'border-[#00d2be] text-[#00d2be] bg-[rgba(0,210,190,0.12)]'
                    : 'border-[#222933] text-[#5e6d7e]'
                }`}
              >
                DRIVER DOSSIER // {activeDriver ? activeDriver.name.toUpperCase() : ''}
              </span>
              <span
                className={`px-4 py-1.5 border transition-all ${
                  mode === 'constructor'
                    ? 'border-[#00d2be] text-[#00d2be] bg-[rgba(0,210,190,0.12)]'
                    : 'border-[#222933] text-[#5e6d7e]'
                }`}
              >
                CONSTRUCTOR HERITAGE // {activeConstructor ? activeConstructor.shortName.toUpperCase() : ''}
              </span>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-hidden py-6 px-4">
            {mode === 'driver' && activeDriver && (
              <div className="h-full flex flex-col justify-between">
                {/* Driver Title Block (NO Photos - Pure Typography & Data) */}
                <div className="flex items-start justify-between border-b border-[#1f2631] pb-6">
                  <div>
                    <div className="flex items-center gap-4">
                      <span
                        className="text-5xl font-black text-white px-3 py-1 bg-[#161c24] border border-[#2e3745]"
                        style={{ color: activeDriver.teamColor }}
                      >
                        #{activeDriver.number}
                      </span>
                      <div>
                        <h1 className="text-5xl font-black tracking-tight text-white uppercase">
                          {activeDriver.name}
                        </h1>
                        <span className="text-lg font-bold tracking-widest text-[#8ea0b4] uppercase block pt-1">
                          {activeDriver.team} // {activeDriver.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2026 Key Metrics Banner */}
                  <div className="flex items-center gap-4">
                    <div className="border border-[#222a36] bg-[rgba(15,19,25,0.9)] px-6 py-3 text-center">
                      <span className="text-xs text-[#6e7e90] uppercase block">Standings</span>
                      <span className="text-2xl font-black text-[#00d2be]">
                        P{String(activeDriver.season2026.position).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="border border-[#222a36] bg-[rgba(15,19,25,0.9)] px-6 py-3 text-center">
                      <span className="text-xs text-[#6e7e90] uppercase block">2026 Points</span>
                      <span className="text-2xl font-black text-white">{activeDriver.season2026.points}</span>
                    </div>
                    <div className="border border-[#222a36] bg-[rgba(15,19,25,0.9)] px-6 py-3 text-center">
                      <span className="text-xs text-[#6e7e90] uppercase block">2026 Wins</span>
                      <span className="text-2xl font-black text-[#ffb800]">{activeDriver.season2026.wins}</span>
                    </div>
                    <div className="border border-[#222a36] bg-[rgba(15,19,25,0.9)] px-6 py-3 text-center">
                      <span className="text-xs text-[#6e7e90] uppercase block">2026 Poles</span>
                      <span className="text-2xl font-black text-white">{activeDriver.season2026.poles}</span>
                    </div>
                  </div>
                </div>

                {/* Mid Section: Current Season vs Career Statistics */}
                <div className="grid grid-cols-2 gap-8 py-6">
                  {/* Current Season Box */}
                  <div className="border border-[#222a36] bg-[rgba(14,18,24,0.85)] p-6">
                    <div className="f1-telemetry-badge text-[#00d2be] mb-4">
                      2026 CURRENT SEASON PERFORMANCE
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border-l-2 border-[#00d2be] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Grand Prix Starts</span>
                        <span className="text-xl font-bold text-white">{activeDriver.season2026.starts}</span>
                      </div>
                      <div className="border-l-2 border-[#00d2be] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Podiums</span>
                        <span className="text-xl font-bold text-white">{activeDriver.season2026.podiums}</span>
                      </div>
                      <div className="border-l-2 border-[#00d2be] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Fastest Laps</span>
                        <span className="text-xl font-bold text-[#ffb800]">
                          {activeDriver.season2026.fastestLaps}
                        </span>
                      </div>
                      <div className="border-l-2 border-[#00d2be] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Did Not Finish (DNF)</span>
                        <span className="text-xl font-bold text-[#e10600]">{activeDriver.season2026.dnf}</span>
                      </div>
                      <div className="border-l-2 border-[#00d2be] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Win Percentage</span>
                        <span className="text-xl font-bold text-white">
                          {((activeDriver.season2026.wins / Math.max(activeDriver.season2026.starts, 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="border-l-2 border-[#00d2be] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Podium Ratio</span>
                        <span className="text-xl font-bold text-white">
                          {((activeDriver.season2026.podiums / Math.max(activeDriver.season2026.starts, 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Career Achievements Box */}
                  <div className="border border-[#222a36] bg-[rgba(14,18,24,0.85)] p-6">
                    <div className="f1-telemetry-badge text-[#ffb800] mb-4">
                      ALL-TIME FORMULA 1 CAREER RECORD
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border-l-2 border-[#ffb800] pl-3">
                        <span className="text-xs text-[#6e7e90] block">World Titles</span>
                        <span className="text-xl font-bold text-[#ffb800]">
                          {activeDriver.career.championships}
                        </span>
                      </div>
                      <div className="border-l-2 border-[#ffb800] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Career Wins</span>
                        <span className="text-xl font-bold text-white">{activeDriver.career.wins}</span>
                      </div>
                      <div className="border-l-2 border-[#ffb800] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Career Podiums</span>
                        <span className="text-xl font-bold text-white">{activeDriver.career.podiums}</span>
                      </div>
                      <div className="border-l-2 border-[#ffb800] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Career Pole Positions</span>
                        <span className="text-xl font-bold text-white">{activeDriver.career.poles}</span>
                      </div>
                      <div className="border-l-2 border-[#ffb800] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Total Career Starts</span>
                        <span className="text-xl font-bold text-white">{activeDriver.career.starts}</span>
                      </div>
                      <div className="border-l-2 border-[#ffb800] pl-3">
                        <span className="text-xs text-[#6e7e90] block">Status</span>
                        <span className="text-xs font-black text-[#00d2be] uppercase pt-1 block">
                          ACTIVE FIA SUPERLICENSE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Timeline & 2026 Race Log */}
                <div className="border border-[#222a36] bg-[rgba(14,18,24,0.9)] p-5">
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-bold text-[#00d2be] tracking-widest uppercase">
                      CAREER PROGRESSION & 2026 RACE LOG
                    </span>
                    <span className="text-[11px] text-[#6b7b8d]">OFFICIAL TELEMETRY ARCHIVE</span>
                  </div>

                  {/* Horizontal Career Timeline */}
                  <div className="grid grid-cols-6 gap-3 pt-2">
                    {driverHistory?.timeline.slice(0, 6).map((item, tIdx) => (
                      <div key={tIdx} className="border-t-2 border-[#00d2be] pt-2 relative">
                        <span className="text-xs font-black text-[#00d2be] block">{item.year}</span>
                        <span className="text-[11px] text-[#8fa0b2] leading-tight block pt-0.5">
                          {item.event}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mode === 'constructor' && activeConstructor && (
              <div className="h-full flex flex-col justify-between">
                {/* Constructor Title Block */}
                <div className="flex items-start justify-between border-b border-[#1f2631] pb-6">
                  <div>
                    <h1
                      className="text-5xl font-black tracking-tight uppercase"
                      style={{ color: activeConstructor.color }}
                    >
                      {activeConstructor.name}
                    </h1>
                    <span className="text-lg font-bold tracking-widest text-[#8ea0b4] uppercase block pt-1">
                      CONSTRUCTOR STATUS: {activeConstructor.season2026.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="border border-[#222a36] bg-[rgba(15,19,25,0.9)] px-6 py-3 text-center">
                      <span className="text-xs text-[#6e7e90] uppercase block">Standings</span>
                      <span className="text-2xl font-black text-[#00d2be]">
                        P{String(activeConstructor.season2026.position).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="border border-[#222a36] bg-[rgba(15,19,25,0.9)] px-6 py-3 text-center">
                      <span className="text-xs text-[#6e7e90] uppercase block">2026 Points</span>
                      <span className="text-2xl font-black text-white">
                        {activeConstructor.season2026.points} PTS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Constructor Metrics */}
                <div className="grid grid-cols-2 gap-8 py-6">
                  <div className="border border-[#222a36] bg-[rgba(14,18,24,0.85)] p-6">
                    <div className="f1-telemetry-badge text-[#00d2be] mb-4">
                      2026 CAMPAIGN STATISTICS
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border-l-2 border-[#00d2be] pl-3">
                        <span className="text-xs text-[#6e7e90] block">2026 Race Wins</span>
                        <span className="text-2xl font-black text-[#ffb800]">
                          {activeConstructor.season2026.wins}
                        </span>
                      </div>
                      <div className="border-l-2 border-[#00d2be] pl-3">
                        <span className="text-xs text-[#6e7e90] block">2026 Podiums</span>
                        <span className="text-2xl font-black text-white">
                          {activeConstructor.season2026.podiums}
                        </span>
                      </div>
                      <div className="border-l-2 border-[#00d2be] pl-3">
                        <span className="text-xs text-[#6e7e90] block">2026 Poles</span>
                        <span className="text-2xl font-black text-white">
                          {activeConstructor.season2026.poles}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#222a36] bg-[rgba(14,18,24,0.85)] p-6">
                    <div className="f1-telemetry-badge text-[#ffb800] mb-4">
                      HISTORICAL CONSTRUCTOR HERITAGE
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border-l-2 border-[#ffb800] pl-3">
                        <span className="text-xs text-[#6e7e90] block">World Titles</span>
                        <span className="text-2xl font-black text-[#ffb800]">
                          {activeConstructor.history.championships}
                        </span>
                      </div>
                      <div className="border-l-2 border-[#ffb800] pl-3">
                        <span className="text-xs text-[#6e7e90] block">All-Time Wins</span>
                        <span className="text-2xl font-black text-white">
                          {activeConstructor.history.wins}
                        </span>
                      </div>
                      <div className="border-l-2 border-[#ffb800] pl-3">
                        <span className="text-xs text-[#6e7e90] block">All-Time Podiums</span>
                        <span className="text-2xl font-black text-white">
                          {activeConstructor.history.podiums}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Constructor Historical Milestones */}
                <div className="border border-[#222a36] bg-[rgba(14,18,24,0.9)] p-5">
                  <div className="text-xs font-bold text-[#00d2be] tracking-widest uppercase pb-3">
                    HISTORICAL CHAMPIONSHIP MILESTONES & TIMELINE
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {constructorHistory?.timeline.map((item, cIdx) => (
                      <div key={cIdx} className="border-t-2 border-[#ffb800] pt-2">
                        <span className="text-xs font-black text-[#ffb800] block">{item.year}</span>
                        <span className="text-[11px] text-[#8ea0b2] block pt-1">{item.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Broadcast Ticker */}
          <div className="f1-header-bar px-6 py-2 text-[11px] text-[#647486] flex items-center justify-between">
            <span>OFFICIAL DATABASE QUERY: OK</span>
            <span>DISPLAY CYCLE: {(SCREEN_CONFIG.large.sceneInterval / 1000).toFixed(1)}S INTERVAL // AUTOMATED PRESENTATION</span>
            <span>FIA ARCHIVES VERIFIED</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
