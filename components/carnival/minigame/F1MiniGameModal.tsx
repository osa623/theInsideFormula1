'use client'

import { useEffect, useRef, useState } from 'react'
import { F1MiniGameEngine } from './F1MiniGameEngine'
import { GAME_CONFIG, MiniGameStationId, RaceState } from './types'

interface F1MiniGameModalProps {
  isOpen: boolean
  stationId: MiniGameStationId
  onExit: (stationId: MiniGameStationId) => void
}

export default function F1MiniGameModal({ isOpen, stationId, onExit }: F1MiniGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<F1MiniGameEngine | null>(null)
  const [raceState, setRaceState] = useState<RaceState | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize isolated game engine
    const engine = new F1MiniGameEngine(canvas)
    engineRef.current = engine

    engine.onStateUpdate = (state) => {
      setRaceState({ ...state })
    }

    engine.start()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onExit(stationId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      engine.stop()
      engineRef.current = null
    }
  }, [isOpen, onExit, stationId])

  if (!isOpen) return null

  const playerEntry = raceState?.leaderboard.find((l) => l.isPlayer)
  const currentLap = playerEntry?.currentLap ?? 1
  const playerPosition = playerEntry?.position ?? 1
  const speedKmh = Math.round(Math.abs(engineRef.current?.playerCar.speed ?? 0) * 0.72)

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    const centis = Math.floor((ms % 1000) / 10)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 md:p-6 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center max-w-[1320px] w-full bg-[#080b10] border-2 border-[#e10600]/60 rounded-xl shadow-[0_0_80px_rgba(225,6,0,0.35)] overflow-hidden">
        {/* Header HUD Bar */}
        <div className="w-full flex items-center justify-between px-6 py-3 bg-[#0c1017] border-b border-[#e10600]/40 font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#e10600] text-white font-black text-xs uppercase tracking-widest rounded-sm shadow-md">
              <span>F1 ARCADE</span>
              <span className="text-[10px] opacity-80">STATION {stationId === 'GAME_STATION_7' ? '07' : '08'}</span>
            </div>
            <div className="text-white font-bold text-sm tracking-wider hidden sm:block">
              CIRCUITO DE CARNIVAL
            </div>
          </div>

          {/* Telemetry Display */}
          <div className="flex items-center gap-6 text-xs">
            {/* Position */}
            <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded border border-white/10">
              <span className="text-white/60">POS:</span>
              <span className="font-black text-base text-[#ffcc00]">P{playerPosition}</span>
              <span className="text-white/40">/5</span>
            </div>

            {/* Lap Counter */}
            <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded border border-white/10">
              <span className="text-white/60">LAP:</span>
              <span className="font-black text-base text-white">{currentLap}</span>
              <span className="text-white/40">/{GAME_CONFIG.TOTAL_LAPS}</span>
            </div>

            {/* Gear Indicator */}
            <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded border border-white/10 hidden lg:flex">
              <span className="text-white/60">GEAR:</span>
              <span className="font-black text-base text-[#ffffff]">
                {raceState?.status === 'COUNTDOWN' ? 'N' : raceState?.playerGear ?? 1}
              </span>
            </div>

            {/* Speedometer */}
            <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded border border-white/10 hidden md:flex">
              <span className="text-white/60">SPEED:</span>
              <span className="font-black text-base text-[#00d2be] w-12 text-right">
                {raceState?.playerSpeedKmh ?? 0}
              </span>
              <span className="text-white/40">KM/H</span>
            </div>

            {/* DRS Status */}
            {raceState?.playerDrsActive && (
              <div className="flex items-center gap-1 bg-green-950/70 border border-green-500/60 px-2.5 py-1 rounded text-green-400 font-black text-xs animate-pulse hidden sm:flex">
                <span>DRS ACTIVE</span>
              </div>
            )}

            {/* Race Timer */}
            <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded border border-white/10 hidden sm:flex">
              <span className="text-white/60">TIME:</span>
              <span className="font-bold text-white w-20 text-right">{formatTime(raceState?.raceTimeMs ?? 0)}</span>
            </div>
          </div>

          {/* Exit Button */}
          <button
            type="button"
            onClick={() => onExit(stationId)}
            className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-[#e10600] text-white text-xs font-bold uppercase tracking-wider rounded border border-white/20 transition-all cursor-pointer"
            title="Exit Game [ESC]"
          >
            <span>EXIT [ESC]</span>
          </button>
        </div>

        {/* 2D Racing Canvas */}
        <div className="relative w-full aspect-[16/9] max-h-[76vh] flex items-center justify-center bg-[#111]">
          <canvas
            ref={canvasRef}
            width={GAME_CONFIG.CANVAS_WIDTH}
            height={GAME_CONFIG.CANVAS_HEIGHT}
            className="w-full h-full object-contain"
          />

          {/* Live Mini Leaderboard Overlay */}
          <div className="absolute top-4 left-4 pointer-events-none bg-black/75 border border-white/10 rounded p-2.5 font-mono text-[11px] shadow-lg hidden sm:block">
            <div className="text-[9px] uppercase tracking-widest text-[#e10600] font-black mb-1">
              RACE TIMING
            </div>
            {raceState?.leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between gap-3 py-0.5 ${
                  entry.isPlayer ? 'text-[#ffcc00] font-black' : 'text-white/70'
                }`}
              >
                <span className="w-5">{entry.position}.</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="w-28 truncate">{entry.name}</span>
                <span className="text-[10px] opacity-60">
                  {entry.finished ? 'FIN' : `L${entry.currentLap}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Controls Guide */}
        <div className="w-full flex flex-wrap items-center justify-between px-6 py-2 bg-[#090c12] border-t border-white/10 text-xs font-mono text-white/60">
          <div className="flex items-center gap-6">
            <span>
              <strong className="text-white">W / ↑</strong> ACCELERATE
            </span>
            <span>
              <strong className="text-white">S / ↓</strong> BRAKE / REVERSE
            </span>
            <span>
              <strong className="text-white">A / D / ← / →</strong> STEER
            </span>
            <span>
              <strong className="text-white">R</strong> RESTART
            </span>
          </div>
          <div className="text-[#ffcc00] font-bold">
            🏁 COMPLETE 3 LAPS TO WIN
          </div>
        </div>
      </div>
    </div>
  )
}
