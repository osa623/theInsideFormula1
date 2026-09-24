'use client'

import {
  CarnivalEntrance,
  CarnivalExplainZone,
  ChampionSection,
  ExamBoard,
  InformationScreenTrigger,
  GameStationTrigger,
} from './types'
import GraphicsQualitySelector from '@/components/graphics/GraphicsQualitySelector'

interface CarnivalHUDProps {
  isLocked: boolean
  isReady: boolean
  nearbyEntrance: CarnivalEntrance | null
  nearbyExplainZone: CarnivalExplainZone | null
  nearbyExam?: boolean
  nearbyChampionSection?: ChampionSection | null
  nearbyExamBoard?: ExamBoard | null
  nearbyFormulaCarEntrance?: boolean
  nearbyAbout?: boolean
  nearbyInfoScreen?: InformationScreenTrigger | null
  nearbyMap?: boolean
  nearbyGameStation?: GameStationTrigger | null
  activeCinematicView?: { title: string; subtitle?: string; screenId?: string } | null
  previewOpen: boolean
  onRequestLock: () => void
}

export default function CarnivalHUD({
  isLocked,
  isReady,
  nearbyEntrance,
  nearbyExplainZone,
  nearbyExam,
  nearbyChampionSection,
  nearbyExamBoard,
  nearbyFormulaCarEntrance,
  nearbyAbout,
  nearbyInfoScreen,
  nearbyMap,
  nearbyGameStation,
  activeCinematicView,
  previewOpen,
  onRequestLock,
}: CarnivalHUDProps) {
  const isGateEntrance =
    nearbyEntrance?.id === 'openarea' ||
    nearbyEntrance?.id === 'simulation' ||
    nearbyEntrance?.id === 'racingarea'

  const showInspectionActive = !!activeCinematicView
  const showPrompt =
    !previewOpen &&
    (showInspectionActive ||
      nearbyMap ||
      nearbyGameStation ||
      nearbyInfoScreen ||
      nearbyFormulaCarEntrance ||
      nearbyExam ||
      nearbyExamBoard ||
      nearbyChampionSection ||
      nearbyAbout ||
      nearbyEntrance ||
      nearbyExplainZone)

  let promptKey = 'E'
  let promptText = 'Press E to view'
  let promptLabel = ''

  if (showInspectionActive) {
    if (activeCinematicView?.screenId) {
      promptKey = 'ENTER'
      promptText = 'Press ENTER for Next Slide  •  [← / →] Prev/Next  •  [ESC / E] Exit POV'
      promptLabel = activeCinematicView?.title || 'Screen Exhibition'
    } else {
      promptKey = 'E / ESC'
      promptText = 'Press E or ESC to return'
      promptLabel = activeCinematicView?.title || 'Exhibition View'
    }
  } else if (nearbyMap) {
    promptKey = 'E'
    promptText = 'Press E to view Exhibition Map'
    promptLabel = 'Carnival Grounds & Circuit Directory'
  } else if (nearbyGameStation) {
    promptKey = 'E'
    promptText = `Press E to play F1 2D Arcade (${nearbyGameStation.title})`
    promptLabel = nearbyGameStation.subtitle
  } else if (nearbyInfoScreen) {
    promptKey = 'E'
    promptText = `Press E to inspect ${nearbyInfoScreen.title}`
    promptLabel = nearbyInfoScreen.subtitle
  } else if (nearbyFormulaCarEntrance) {
    promptKey = 'E'
    promptText = 'Press E to Enter the Formula Car Experience'
    promptLabel = 'Formula Car Track Access'
  } else if (nearbyExam) {
    promptText = 'Press E to start exam'
    promptLabel = 'Formula Driving Academy'
  } else if (nearbyExamBoard) {
    promptText = `Press E to view ${nearbyExamBoard.label}`
    promptLabel = 'Driving Academy Lesson'
  } else if (nearbyChampionSection) {
    promptText = `Press E to view Champion ${nearbyChampionSection.year}`
    promptLabel = 'Formula 1 Hall of Champions'
  } else if (isGateEntrance) {
    promptText = 'Press E to toggle gate'
    promptLabel = nearbyEntrance?.label || 'Gate Access'
  } else if (nearbyEntrance?.id === 'exhibitionHall02') {
    promptText = 'Press E to enter'
    promptLabel = 'New Exhibition Hall 02'
  } else if (nearbyEntrance) {
    promptText = 'Press E to enter'
    promptLabel = nearbyEntrance.label
  } else if (nearbyAbout) {
    promptText = 'Press E to view About & Creator Info'
    promptLabel = 'Creator Portfolio & Contact'
  } else if (nearbyExplainZone) {
    promptText = 'Press E to inspect'
    promptLabel = nearbyExplainZone.label
  }

  return (
    <>
      <div className="pointer-events-none absolute left-5 top-5 z-30 border border-white/15 bg-black/55 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/75 backdrop-blur-xl md:left-8 md:top-8">
        <div className="text-speed">FORMULA 1 CARNIVAL</div>
        <div className="mt-1 text-white/55">{isReady ? 'W A S D + MOUSE' : 'LOADING ENVIRONMENT'}</div>
      </div>

      {/* Top Right Graphics Settings */}
      <div className="pointer-events-auto absolute right-5 top-5 z-30 md:right-8 md:top-8">
        <GraphicsQualitySelector />
      </div>

      {!isLocked && !previewOpen && !showInspectionActive && (
        <button
          type="button"
          onClick={onRequestLock}
          className="absolute left-1/2 top-1/2 z-30 w-[min(360px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 border border-primary/70 bg-black/75 px-6 py-5 text-center backdrop-blur-xl transition-colors hover:bg-primary/20"
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.45em] text-speed">
            Click to enter
          </span>
          <span className="mt-2 block text-lg font-black uppercase tracking-[0.18em] text-white">
            First Person Mode
          </span>
        </button>
      )}

      {showPrompt && (
        <div
          className="pointer-events-none absolute bottom-10 left-1/2 z-30 -translate-x-1/2 border border-white/20 bg-black/75 px-6 py-4 text-center backdrop-blur-xl shadow-2xl"
        >
          <span className="mx-auto flex h-9 px-3 items-center justify-center border border-primary bg-primary/20 font-mono text-xs font-bold text-white">
            {promptKey}
          </span>
          <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.35em] text-white">
            {promptText}
          </span>
          {promptLabel && (
            <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.25em] text-white/55">
              {promptLabel}
            </span>
          )}
        </div>
      )}

      {showInspectionActive && (
        <div className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-700 bg-gradient-to-t from-black/60 via-transparent to-black/40">
          <div className="absolute inset-8 md:inset-16 border border-white/20 rounded-sm pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]">
            <div className="absolute -top-3 left-6 bg-black/90 px-3 py-1 font-mono text-[10px] tracking-[0.3em] text-primary border border-primary/40 uppercase">
              {activeCinematicView?.subtitle || 'Exhibition View'}
            </div>
            <div className="absolute -bottom-3 right-6 bg-black/90 px-3 py-1 font-mono text-xs tracking-[0.2em] text-white border border-white/30 font-bold uppercase">
              {activeCinematicView?.title}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
