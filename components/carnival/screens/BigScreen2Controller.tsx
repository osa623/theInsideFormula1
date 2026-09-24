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

interface BigScreen2ControllerProps {
  anchor: ScreenAnchor
  occluders?: THREE.Object3D[]
}

type Phase = 'spotlight' | 'podium' | 'circuit' | 'destination' | 'journey'

export default function BigScreen2Controller({
  anchor,
  occluders,
}: BigScreen2ControllerProps) {
  const config = EXHIBITION_SCREEN_CONFIG.big2
  const isVisible = useScreenVisibility(anchor, occluders, config.maxViewDistance)

  const [phase, setPhase] = useState<Phase>('spotlight')
  const [latestRace, setLatestRace] = useState<any>(null)
  const [nextRace, setNextRace] = useState<RaceEvent | null>(null)

  useEffect(() => {
    const update = () => {
      setLatestRace(f1DataService.getLatestRaceInfo())
      setNextRace(f1DataService.getNextRace())
    }
    update()
    const unsubscribe = f1DataService.subscribe(update)
    return () => unsubscribe()
  }, [])

  // Autoplay presentation sequence with staggered start (+7.5s)
  useEffect(() => {
    const sequence: { phase: Phase; duration: number }[] = [
      { phase: 'spotlight', duration: AUTOPLAY_TIMINGS.raceProfile },
      { phase: 'podium', duration: AUTOPLAY_TIMINGS.podiumCeremony },
      { phase: 'circuit', duration: AUTOPLAY_TIMINGS.circuitProfile },
      { phase: 'destination', duration: AUTOPLAY_TIMINGS.nextDestination },
      { phase: 'journey', duration: AUTOPLAY_TIMINGS.seasonJourney },
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
      rotation={[0, 0.245, 0]}
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
              <span className="w-3.5 h-3.5 bg-[#00d2be] animate-pulse inline-block" />
              <span className="text-base font-black tracking-widest text-white">
                FIA FORMULA 1 GRAND PRIX & CIRCUIT INTELLIGENCE
              </span>
              <span className="text-xs px-2.5 py-0.5 bg-[#182029] border border-[#2b3747] text-[#00d2be] font-bold">
                TOWER DISPLAY 02
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 text-xs font-bold">
              {[
                { id: 'spotlight', label: '01 // GP SPOTLIGHT' },
                { id: 'podium', label: '02 // PODIUM CEREMONY' },
                { id: 'circuit', label: '03 // CIRCUIT TELEMETRY' },
                { id: 'destination', label: '04 // NEXT DESTINATION' },
                { id: 'journey', label: '05 // GLOBAL JOURNEY' },
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
            {/* Phase 1: Grand Prix Spotlight */}
            {phase === 'spotlight' && (
              <div className="h-full flex items-center justify-between px-12 bg-[rgba(14,19,26,0.7)] border border-[#1b2533] p-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="f1-telemetry-badge text-[#e10600]">
                    FEATURED GRAND PRIX // ROUND 14 DEBRIEF
                  </div>
                  <div className="text-sm font-bold tracking-widest text-[#728599]">
                    CIRCUIT DE SPA-FRANCORCHAMPS // ARDENNES, BELGIUM
                  </div>
                  <h1 className="text-5xl font-black tracking-tight text-white uppercase">
                    {latestRace?.name || 'BELGIAN GRAND PRIX 2026'}
                  </h1>
                  <p className="text-xs text-[#9eb1c4] leading-relaxed">
                    A masterclass in changeable Ardennes weather conditions. Mercedes rookie sensation
                    Kimi Antonelli captured his 4th career Grand Prix victory after an aggressive two-stop
                    intermediate-to-slick tyre crossover strategy, holding off a charging Max Verstappen
                    in the closing laps.
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="bg-[#111721] p-3 border-l-2 border-[#00d2be] rounded">
                      <div className="text-[10px] text-[#718293] font-bold">RACE WINNER</div>
                      <div className="text-lg font-black text-white">{latestRace?.winner || 'KIMI ANTONELLI'}</div>
                    </div>
                    <div className="bg-[#111721] p-3 border-l-2 border-[#ffb800] rounded">
                      <div className="text-[10px] text-[#718293] font-bold">WINNING MARGIN</div>
                      <div className="text-lg font-black text-white">+1.248 SEC</div>
                    </div>
                    <div className="bg-[#111721] p-3 border-l-2 border-[#9b51e0] rounded">
                      <div className="text-[10px] text-[#718293] font-bold">FASTEST LAP</div>
                      <div className="text-lg font-black text-white">1:44.721</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-[#0e141c] border border-[#232f3e] rounded w-96 text-center">
                  <div className="text-xs font-black text-[#00d2be] tracking-widest uppercase mb-3">
                    SESSION CONDITIONS
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full text-xs">
                    <div className="bg-[#131b26] p-3 border border-[#243142] rounded">
                      <div className="text-[#6d8094] text-[10px]">TRACK TEMP</div>
                      <div className="text-white font-bold">24.2°C</div>
                    </div>
                    <div className="bg-[#131b26] p-3 border border-[#243142] rounded">
                      <div className="text-[#6d8094] text-[10px]">AIR TEMP</div>
                      <div className="text-white font-bold">18.5°C</div>
                    </div>
                    <div className="bg-[#131b26] p-3 border border-[#243142] rounded">
                      <div className="text-[#6d8094] text-[10px]">HUMIDITY</div>
                      <div className="text-white font-bold">78%</div>
                    </div>
                    <div className="bg-[#131b26] p-3 border border-[#243142] rounded">
                      <div className="text-[#6d8094] text-[10px]">TRACK STATUS</div>
                      <div className="text-[#00d2be] font-bold">DAMP TO DRY</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 2: Podium Ceremony */}
            {phase === 'podium' && (
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-[#212b38]">
                  <span className="text-xs font-black tracking-widest text-[#00d2be] uppercase">
                    OFFICIAL PODIUM CEREMONY & TROPHY PRESENTATION // ROUND 14
                  </span>
                  <span className="text-xs text-[#718294] font-bold">BELGIAN GRAND PRIX 2026</span>
                </div>

                <div className="grid grid-cols-3 gap-6 my-auto px-10">
                  {/* P2 */}
                  <div className="bg-[rgba(15,20,28,0.75)] border border-[#243040] p-6 rounded flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-[#1e2734] pb-2">
                      <span className="text-sm font-black text-[#8c9cae]">POSITION 02</span>
                      <span className="text-xs text-[#718294]">+1.248s</span>
                    </div>
                    <div className="py-4 text-center">
                      <div className="text-2xl font-black text-white">MAX VERSTAPPEN</div>
                      <div className="text-xs text-[#3671c6] font-bold pt-1">RED BULL RACING</div>
                      <div className="mt-3 inline-block px-3 py-1 bg-[#151c26] text-white font-black text-sm rounded">
                        18 PTS
                      </div>
                    </div>
                    <div className="text-[10px] text-[#637485] text-center border-t border-[#1e2734] pt-2">
                      TYRE STRATEGY: INTER $\rightarrow$ SOFT $\rightarrow$ SOFT
                    </div>
                  </div>

                  {/* P1 Winner */}
                  <div className="bg-[rgba(20,28,38,0.85)] border-2 border-[#ffb800] p-6 rounded flex flex-col justify-between shadow-[0_0_24px_rgba(255,184,0,0.15)]">
                    <div className="flex items-center justify-between border-b border-[#2b394b] pb-2">
                      <span className="text-sm font-black text-[#ffb800]">🏆 WINNER // P01</span>
                      <span className="text-xs text-[#00d2be] font-bold">FASTEST LAP (+1)</span>
                    </div>
                    <div className="py-4 text-center">
                      <div className="text-3xl font-black text-white">KIMI ANTONELLI</div>
                      <div className="text-xs text-[#00d2be] font-bold pt-1">MERCEDES-AMG PETRONAS</div>
                      <div className="mt-3 inline-block px-4 py-1.5 bg-[#ffb800] text-black font-black text-base rounded">
                        26 PTS
                      </div>
                    </div>
                    <div className="text-[10px] text-[#8ca0b4] text-center border-t border-[#2b394b] pt-2">
                      TYRE STRATEGY: INTER $\rightarrow$ MEDIUM $\rightarrow$ SOFT
                    </div>
                  </div>

                  {/* P3 */}
                  <div className="bg-[rgba(15,20,28,0.75)] border border-[#243040] p-6 rounded flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-[#1e2734] pb-2">
                      <span className="text-sm font-black text-[#cd7f32]">POSITION 03</span>
                      <span className="text-xs text-[#718294]">+6.819s</span>
                    </div>
                    <div className="py-4 text-center">
                      <div className="text-2xl font-black text-white">LANDO NORRIS</div>
                      <div className="text-xs text-[#ff8000] font-bold pt-1">MCLAREN F1 TEAM</div>
                      <div className="mt-3 inline-block px-3 py-1 bg-[#151c26] text-white font-black text-sm rounded">
                        15 PTS
                      </div>
                    </div>
                    <div className="text-[10px] text-[#637485] text-center border-t border-[#1e2734] pt-2">
                      TYRE STRATEGY: INTER $\rightarrow$ MEDIUM $\rightarrow$ MEDIUM
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-3 px-2">
                  <span>CONSTRUCTORS POINTS IN ROUND 14: MERCEDES (40), RED BULL (30), MCLAREN (27)</span>
                  <span>FIA POST-RACE SCRUTINEERING: ALL CARS PASSED LEGALITY CHECKS</span>
                </div>
              </div>
            )}

            {/* Phase 3: Circuit Focus & Specs */}
            {phase === 'circuit' && (
              <div className="h-full flex items-center justify-between px-12 bg-[rgba(14,19,26,0.7)] border border-[#1b2533] p-8">
                <div className="space-y-4 max-w-xl">
                  <div className="f1-telemetry-badge text-[#00d2be]">
                    TECHNICAL CIRCUIT PROFILE // TELEMETRY
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-white uppercase">
                    Circuit de Spa-Francorchamps
                  </h1>
                  <p className="text-xs text-[#9eb1c4] leading-relaxed">
                    Known as the "Rollercoaster of the Ardennes," Spa features the legendary Eau Rouge /
                    Raidillon complex, the flat-out Blanchimont left-hander, and the Kemmel Straight where
                    2026 active aero enables top speeds surpassing 345 km/h.
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-[#111721] p-3 border border-[#232f3e] rounded">
                      <div className="text-[10px] text-[#718293]">TRACK LENGTH</div>
                      <div className="text-lg font-black text-white">7.004 KM</div>
                    </div>
                    <div className="bg-[#111721] p-3 border border-[#232f3e] rounded">
                      <div className="text-[10px] text-[#718293]">CORNERS</div>
                      <div className="text-lg font-black text-white">19 TURNS</div>
                    </div>
                    <div className="bg-[#111721] p-3 border border-[#232f3e] rounded">
                      <div className="text-[10px] text-[#718293]">DRS ZONES</div>
                      <div className="text-lg font-black text-white">2 SECTORS</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-96">
                  <div className="bg-[#101620] border border-[#232f3e] p-4 rounded text-center">
                    <div className="text-xs text-[#718294] font-bold">MAX SPEED</div>
                    <div className="text-2xl font-black text-white pt-1">346.8 KM/H</div>
                    <div className="text-[10px] text-[#556677] pt-1">KEMMEL STRAIGHT</div>
                  </div>
                  <div className="bg-[#101620] border border-[#232f3e] p-4 rounded text-center">
                    <div className="text-xs text-[#718294] font-bold">MAX LATERAL G</div>
                    <div className="text-2xl font-black text-[#00d2be] pt-1">5.2 G</div>
                    <div className="text-[10px] text-[#556677] pt-1">POUHON (T10-T11)</div>
                  </div>
                  <div className="bg-[#101620] border border-[#232f3e] p-4 rounded text-center">
                    <div className="text-xs text-[#718294] font-bold">FULL THROTTLE</div>
                    <div className="text-2xl font-black text-[#ffb800] pt-1">70%</div>
                    <div className="text-[10px] text-[#556677] pt-1">OF LAP DISTANCE</div>
                  </div>
                  <div className="bg-[#101620] border border-[#232f3e] p-4 rounded text-center">
                    <div className="text-xs text-[#718294] font-bold">GEAR SHIFTS</div>
                    <div className="text-2xl font-black text-[#e10600] pt-1">48 / LAP</div>
                    <div className="text-[10px] text-[#556677] pt-1">8-SPEED SEAMLESS</div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 4: Next Destination */}
            {phase === 'destination' && (
              <div className="h-full flex items-center justify-between px-12 bg-[rgba(14,19,26,0.7)] border border-[#1b2533] p-8">
                <div className="space-y-4 max-w-xl">
                  <div className="f1-telemetry-badge text-[#ffb800]">
                    NEXT DESTINATION // HOST VENUE DISCOVERY
                  </div>
                  <div className="text-sm font-bold tracking-widest text-[#728599]">
                    NETHERLANDS // NORTH SEA COASTLINE
                  </div>
                  <h1 className="text-5xl font-black tracking-tight text-white uppercase">
                    Zandvoort Dunes
                  </h1>
                  <p className="text-xs text-[#9eb1c4] leading-relaxed">
                    Carved straight into the rolling sand dunes beside the North Sea, Circuit Zandvoort
                    offers an old-school high-speed thrill with progressive 18-degree banking at Turn 3
                    (Hugenholtz) and the final Arie Luyendyk curve leading onto the start/finish straight.
                  </p>

                  <div className="flex items-center gap-6 pt-2">
                    <div className="border-l-2 border-[#00d2be] pl-3">
                      <div className="text-[10px] text-[#718293]">ATMOSPHERE</div>
                      <div className="text-base font-black text-white">ORANGE ARMY WAVE</div>
                    </div>
                    <div className="border-l-2 border-[#e10600] pl-3">
                      <div className="text-[10px] text-[#718293]">TYRE STRESS</div>
                      <div className="text-base font-black text-white">HIGH VERTICAL LOAD</div>
                    </div>
                    <div className="border-l-2 border-[#ffb800] pl-3">
                      <div className="text-[10px] text-[#718293]">OVERTAKING RATING</div>
                      <div className="text-base font-black text-white">HIGH DRS DEMAND</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-[#0e141c] border border-[#232f3e] rounded w-96 text-center">
                  <div className="text-xs font-black text-[#00d2be] tracking-widest uppercase mb-3">
                    VENUE COORDINATES
                  </div>
                  <div className="text-3xl font-black text-white">52°23'19" N</div>
                  <div className="text-2xl font-black text-[#8ca0b4] pt-1">4°32'27" E</div>
                  <div className="mt-4 pt-4 border-t border-[#1f2937] w-full text-xs text-[#708194]">
                    <div>ELEVATION: 15M ABOVE SEA LEVEL</div>
                    <div className="pt-1">ORGANIZER: DUTCH GP CORP / FIA</div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 5: Global Journey */}
            {phase === 'journey' && (
              <div className="h-full flex flex-col justify-between bg-[rgba(14,19,26,0.7)] border border-[#1b2533] p-8">
                <div className="flex items-center justify-between pb-3 border-b border-[#212b38]">
                  <div>
                    <span className="text-xs font-black tracking-widest text-[#00d2be] uppercase">
                      THE GLOBAL 2026 FORMULA 1 ODYSSEY
                    </span>
                    <h2 className="text-xl font-black text-white">WORLD TOUR ITINERARY & CONTINENTAL TELEMETRY</h2>
                  </div>
                  <div className="text-xs text-[#75879a] font-bold">5 CONTINENTS // 24 VENUES</div>
                </div>

                <div className="grid grid-cols-4 gap-4 my-auto">
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">EUROPEAN LEG</div>
                    <div className="text-3xl font-black text-white pt-1">9 RACES</div>
                    <div className="text-[10px] text-[#556677] pt-1">TRADITIONAL HEARTLAND</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">AMERICAS EXPANSION</div>
                    <div className="text-3xl font-black text-[#00d2be] pt-1">6 RACES</div>
                    <div className="text-[10px] text-[#556677] pt-1">USA, CANADA, MEXICO, BRAZIL</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">MIDDLE EAST SWEEP</div>
                    <div className="text-3xl font-black text-[#ffb800] pt-1">4 RACES</div>
                    <div className="text-[10px] text-[#556677] pt-1">BAHRAIN, JEDDAH, QATAR, YAS</div>
                  </div>
                  <div className="bg-[#121822] border border-[#243142] p-4 rounded text-center">
                    <div className="text-[11px] text-[#718294] font-bold">ASIA-PACIFIC TOUR</div>
                    <div className="text-3xl font-black text-[#e10600] pt-1">5 RACES</div>
                    <div className="text-[10px] text-[#556677] pt-1">AUSTRALIA, JAPAN, CHINA, SGP</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6e7e90] border-t border-[#1a2029] pt-3 px-2">
                  <span>GLOBAL FREIGHT LOGISTICS: NET-ZERO CARBON SUSTAINABLE CARGO INITIATIVE</span>
                  <span>TOTAL FLIGHT LOG: ~130,000 KM TRAVELLED BY F1 CIRCUS</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Telemetry Ticker */}
          <div className="flex items-center justify-between text-[11px] text-[#525f70] border-t border-[#181d24] pt-2 px-2">
            <span>SCREEN: BIG_SCREEN2 (FAMILY B - TOWER WEST)</span>
            <span>DISPLAY RESOLUTION: 1920 x 844 (2.28:1)</span>
            <span>DATA SOURCE: FORMULA 1 GRAND PRIX DEBRIEF & TELEMETRY LOGS</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
