'use client'

import { ContactShadows, Environment as DreiEnvironment } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import BuildingPreview from './BuildingPreview'
import ChampionPreview from './ChampionPreview'
import CarnivalEnvironment from './CarnivalEnvironment'
import CarnivalHUD from './CarnivalHUD'
import CarnivalPlayer from './CarnivalPlayer'
import ExplainZonePreview from './ExplainZonePreview'
import ScreenManager from './screens/ScreenManager'
import AboutSectionModal from './AboutSectionModal'
import CarnivalMapModal from './CarnivalMapModal'
import F1MiniGameModal from './minigame/F1MiniGameModal'
import { MiniGameStationId } from './minigame/types'
import {
  CarnivalEntrance,
  CarnivalExplainZone,
  CarnivalGateId,
  CarnivalMetadata,
  ChampionSection,
  ExamBoard,
  InformationScreenTrigger,
  MapTrigger,
  GameStationTrigger,
} from './types'
import { ScreenTimelineController } from './screens/ScreenTimelineController'
import { useCarnivalPointerLock } from './useCarnivalPointerLock'
import { useGraphicsQuality } from '@/lib/graphics/useGraphicsQuality'
import { GraphicsConfig, GraphicsQuality } from '@/lib/graphics/GraphicsManager'

function CarnivalLighting({ config }: { config: GraphicsConfig }) {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const parkingWall1LightRef = useRef<THREE.DirectionalLight>(null)
  const parkingWall3LightRef = useRef<THREE.DirectionalLight>(null)

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.target.position.set(0, 0, 125)
      lightRef.current.target.updateMatrixWorld()
      lightRef.current.parent?.add(lightRef.current.target)
    }

    if (parkingWall1LightRef.current) {
      parkingWall1LightRef.current.target.position.set(5.05, 1.0, 86.17)
      parkingWall1LightRef.current.target.updateMatrixWorld()
      parkingWall1LightRef.current.parent?.add(parkingWall1LightRef.current.target)
    }

    if (parkingWall3LightRef.current) {
      parkingWall3LightRef.current.target.position.set(40.5, 1.0, 72.59)
      parkingWall3LightRef.current.target.updateMatrixWorld()
      parkingWall3LightRef.current.parent?.add(parkingWall3LightRef.current.target)
    }
  }, [])

  useEffect(() => {
    const light = lightRef.current
    if (light && light.shadow) {
      if (light.shadow.map) {
        light.shadow.map.dispose()
        // @ts-ignore
        light.shadow.map = null
      }
      light.shadow.mapSize.set(config.shadowMapSize, config.shadowMapSize)
      light.shadow.bias = config.shadowBias
      light.shadow.normalBias = config.shadowNormalBias
      light.shadow.camera.near = 5
      light.shadow.camera.far = config.shadowFar
      light.shadow.camera.left = -config.shadowFrustum
      light.shadow.camera.right = config.shadowFrustum
      light.shadow.camera.top = config.shadowFrustum
      light.shadow.camera.bottom = -config.shadowFrustum
      light.shadow.camera.updateProjectionMatrix()
      light.shadow.needsUpdate = true
    }
  }, [config])

  return (
    <>
      <DreiEnvironment files="/models/autumn_field_puresky.hdr" background environmentIntensity={config.envIntensity} />
      <ambientLight intensity={0.06} />
      <hemisphereLight args={['#dce9f8', '#251a14', 0.45]} />

      <directionalLight
        ref={lightRef}
        position={[48, 68, 62]}
        intensity={2.6}
        color="#fff4e8"
        castShadow={config.shadows}
        shadow-mapSize={[config.shadowMapSize, config.shadowMapSize]}
        shadow-bias={config.shadowBias}
        shadow-normalBias={config.shadowNormalBias}
        shadow-camera-near={5}
        shadow-camera-far={config.shadowFar}
        shadow-camera-left={-config.shadowFrustum}
        shadow-camera-right={config.shadowFrustum}
        shadow-camera-top={config.shadowFrustum}
        shadow-camera-bottom={-config.shadowFrustum}
      />

      <directionalLight
        ref={parkingWall1LightRef}
        position={[23.05, 29, 96.17]}
        intensity={1.8}
      />

      <directionalLight
        ref={parkingWall3LightRef}
        position={[58.5, 29, 82.59]}
        intensity={1.8}
      />

      {/* Warm and cool room fill lighting for interior realism */}
      <pointLight position={[-30, 8.0, 145]} intensity={1.5} distance={55} decay={2} color="#ffe8d2" />
      <pointLight position={[36, 8.0, 150]} intensity={1.5} distance={55} decay={2} color="#eaf2ff" />

      <ContactShadows
        position={[0, 0.03, 0]}
        opacity={config.contactShadowOpacity}
        scale={config.contactShadowScale}
        blur={config.contactShadowBlur}
        far={config.contactShadowFar}
        resolution={config.contactShadowResolution}
        frames={1}
      />
      <fog attach="fog" args={['#aebbc0', config.fogNear, config.fogFar]} />
    </>
  )
}

function GraphicsApplier({ config, quality }: { config: GraphicsConfig; quality: GraphicsQuality }) {
  const { gl, scene, camera } = useThree()

  useEffect(() => {
    // 1. Immediately apply the pixel ratio based on quality preset
    const targetDpr = quality === 'auto'
      ? Math.min(window.devicePixelRatio || 1, config.dprTarget)
      : config.dprTarget
    gl.setPixelRatio(targetDpr)

    // 2. Configure renderer shadow map
    gl.shadowMap.enabled = config.shadows
    gl.shadowMap.type = config.shadowType
    gl.shadowMap.needsUpdate = true

    // 3. Update Camera far plane
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.far = config.maxDrawDistance
      camera.updateProjectionMatrix()
    }

    // 4. Update material anisotropy and texture filtering across the scene
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
        materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.envMapIntensity = config.envIntensity

            const textures = [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.aoMap]
            textures.forEach((tex) => {
              if (tex) {
                tex.anisotropy = config.anisotropy
                if (config.textureFiltering) {
                  tex.minFilter = config.textureFiltering
                }
                tex.needsUpdate = true
              }
            })
          }
        })
      }
    })
  }, [config, quality, gl, scene, camera])

  return null
}

function AdaptiveResolution({ config, quality }: { config: GraphicsConfig; quality: GraphicsQuality }) {
  const gl = useThree((state) => state.gl)
  const frameTimes = useRef<number[]>([])
  const lastTime = useRef(performance.now())

  useFrame(() => {
    if (quality !== 'auto') return

    const now = performance.now()
    const dt = now - lastTime.current
    lastTime.current = now

    frameTimes.current.push(dt)
    if (frameTimes.current.length > 25) {
      frameTimes.current.shift()
      const avgDt = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length
      const currentDpr = gl.getPixelRatio()

      if (avgDt > 22.0 && currentDpr > config.dprMin) {
        gl.setPixelRatio(Math.max(config.dprMin, +(currentDpr - 0.05).toFixed(2)))
      } else if (avgDt < 16.0 && currentDpr < config.dprMax) {
        gl.setPixelRatio(Math.min(config.dprMax, +(currentDpr + 0.02).toFixed(2)))
      }
    }
  })

  return null
}

export default function CarnivalScene() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [metadata, setMetadata] = useState<CarnivalMetadata | null>(null)
  const [nearbyEntrance, setNearbyEntrance] = useState<CarnivalEntrance | null>(null)
  const [nearbyExplainZone, setNearbyExplainZone] = useState<CarnivalExplainZone | null>(null)
  const [nearbyExam, setNearbyExam] = useState(false)
  const [nearbyChampionSection, setNearbyChampionSection] = useState<ChampionSection | null>(null)
  const [nearbyExamBoard, setNearbyExamBoard] = useState<ExamBoard | null>(null)
  const [nearbyFormulaCarEntrance, setNearbyFormulaCarEntrance] = useState(false)
  const [nearbyMonitor, setNearbyMonitor] = useState(false)
  const [nearbyAbout, setNearbyAbout] = useState(false)
  const [nearbyInfoScreen, setNearbyInfoScreen] = useState<InformationScreenTrigger | null>(null)
  const [nearbyMap, setNearbyMap] = useState<MapTrigger | null>(null)
  const [nearbyGameStation, setNearbyGameStation] = useState<GameStationTrigger | null>(null)

  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [activeGameStation, setActiveGameStation] = useState<GameStationTrigger | null>(null)
  const [isMiniGameOpen, setIsMiniGameOpen] = useState(false)
  const [teleportTarget, setTeleportTarget] = useState<{ position: THREE.Vector3; yaw?: number; pitch?: number } | null>(null)

  const [activeChampionSection, setActiveChampionSection] = useState<ChampionSection | null>(null)
  const [activeExamBoard, setActiveExamBoard] = useState<ExamBoard | null>(null)
  const [activeInfoScreen, setActiveInfoScreen] = useState<InformationScreenTrigger | null>(null)
  const dismissedInfoScreenRef = useRef<string | null>(null)

  const [previewEntrance, setPreviewEntrance] = useState<CarnivalEntrance | null>(null)
  const [activeExplainZone, setActiveExplainZone] = useState<CarnivalExplainZone | null>(null)
  const [isExamOpen, setIsExamOpen] = useState(false)
  const [, setIsExamPassed] = useState(false)

  const handleNearbyInfoScreenChange = useCallback((screen: InformationScreenTrigger | null) => {
    setNearbyInfoScreen(screen)
    if (screen) {
      if (dismissedInfoScreenRef.current !== screen.id) {
        setActiveInfoScreen(screen)
      }
    } else {
      dismissedInfoScreenRef.current = null
      setActiveInfoScreen((prev) => (prev ? null : null))
    }
  }, [])

  const hasCinematicActive = !!activeChampionSection || !!activeExamBoard || !!activeInfoScreen || !!activeGameStation
  const overlayOpen =
    !!previewEntrance ||
    !!activeExplainZone ||
    isExamOpen ||
    hasCinematicActive ||
    isAboutOpen ||
    isMapOpen ||
    isMiniGameOpen

  const activeCinematicTarget = useMemo(() => {
    if (activeGameStation) {
      return {
        cameraPosition: activeGameStation.cameraPosition,
        lookAtPosition: activeGameStation.lookAtPosition,
      }
    }
    if (activeInfoScreen) {
      return {
        cameraPosition: activeInfoScreen.cameraPosition,
        lookAtPosition: activeInfoScreen.lookAtPosition,
      }
    }
    if (activeExamBoard) {
      return {
        cameraPosition: activeExamBoard.cameraPosition,
        lookAtPosition: activeExamBoard.lookAtPosition,
      }
    }
    return null
  }, [activeGameStation, activeInfoScreen, activeExamBoard])

  const activeCinematicView = useMemo(() => {
    if (activeGameStation) {
      return {
        title: activeGameStation.title,
        subtitle: activeGameStation.subtitle,
      }
    }
    if (activeInfoScreen) {
      return {
        title: activeInfoScreen.title,
        subtitle: activeInfoScreen.subtitle,
        screenId: activeInfoScreen.id,
      }
    }
    if (activeExamBoard) {
      return {
        title: activeExamBoard.label,
        subtitle: 'Driving Academy Training Lesson',
      }
    }
    return null
  }, [activeGameStation, activeInfoScreen, activeExamBoard])

  const { isLocked, requestLock, exitLock, yawRef, pitchRef } = useCarnivalPointerLock(
    containerRef,
    overlayOpen
  )

  const handleReady = useCallback((nextMetadata: CarnivalMetadata) => {
    setMetadata(nextMetadata)
  }, [])

  const openPreview = useCallback(() => {
    if (!nearbyEntrance || overlayOpen) return

    if (nearbyEntrance.id === 'exhibitionHall02') {
      exitLock()
      window.location.assign(nearbyEntrance.href)
      return
    }

    if (
      nearbyEntrance.id === 'openarea' ||
      nearbyEntrance.id === 'simulation' ||
      nearbyEntrance.id === 'racingarea'
    ) {
      metadata?.toggleGate?.(nearbyEntrance.id as CarnivalGateId)
      return
    }

    exitLock()
    setPreviewEntrance(nearbyEntrance)
  }, [exitLock, metadata, nearbyEntrance, overlayOpen])

  const closePreview = useCallback(() => {
    setPreviewEntrance(null)
    window.setTimeout(requestLock, 120)
  }, [requestLock])

  const openExplainZone = useCallback(() => {
    if (!nearbyExplainZone || overlayOpen) return
    exitLock()
    setActiveExplainZone(nearbyExplainZone)
  }, [exitLock, nearbyExplainZone, overlayOpen])

  const closeExplainZone = useCallback(() => {
    setActiveExplainZone(null)
    window.setTimeout(requestLock, 120)
  }, [requestLock])

  const openExam = useCallback(() => {
    if (overlayOpen) return
    exitLock()
    setIsExamOpen(true)
  }, [exitLock, overlayOpen])

  const closeExam = useCallback(() => {
    setIsExamOpen(false)
    window.setTimeout(requestLock, 120)
  }, [requestLock])

  const closeChampionPreview = useCallback(() => {
    setActiveChampionSection(null)
    window.setTimeout(requestLock, 120)
  }, [requestLock])

  const handleExamPass = useCallback(() => {
    setIsExamPassed(true)
    metadata?.hideObject?.('formula_car_entrance_stopp')
    metadata?.hideObject?.('exam_entrance_prev2')
  }, [metadata])

  const launchGameStation = useCallback(
    (station: GameStationTrigger) => {
      if (overlayOpen) return
      exitLock()
      setActiveGameStation(station)
      // Smooth camera zoom transition before launching 2D game
      window.setTimeout(() => {
        setIsMiniGameOpen(true)
      }, 750)
    },
    [exitLock, overlayOpen]
  )

  const handleExitMiniGame = useCallback(
    (stationId: MiniGameStationId) => {
      setIsMiniGameOpen(false)
      const station = activeGameStation || metadata?.gameStations?.find((s) => s.stationId === stationId)
      setActiveGameStation(null)

      if (station?.returnTransform) {
        setTeleportTarget({
          position: station.returnTransform.position.clone(),
          yaw: station.returnTransform.yaw,
          pitch: station.returnTransform.pitch,
        })
      }
      window.setTimeout(requestLock, 150)
    },
    [activeGameStation, metadata, requestLock]
  )

  const openMap = useCallback(() => {
    if (overlayOpen) return
    exitLock()
    setIsMapOpen(true)
  }, [exitLock, overlayOpen])

  const closeMap = useCallback(() => {
    setIsMapOpen(false)
    window.setTimeout(requestLock, 120)
  }, [requestLock])

  const openAbout = useCallback(() => {
    if (overlayOpen) return
    exitLock()
    setIsAboutOpen(true)
  }, [exitLock, overlayOpen])

  const closeAbout = useCallback(() => {
    setIsAboutOpen(false)
    window.setTimeout(requestLock, 120)
  }, [requestLock])

  const closeInfoScreen = useCallback(() => {
    if (activeInfoScreen) {
      dismissedInfoScreenRef.current = activeInfoScreen.id
      setActiveInfoScreen(null)
      window.setTimeout(requestLock, 120)
    }
  }, [activeInfoScreen, requestLock])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      const key = event.key.toLowerCase()

      // Interactive slide & topic controls when inspecting information screens
      if (activeInfoScreen) {
        if (key === 'enter' || key === ' ' || key === 'arrowright') {
          event.preventDefault()
          ScreenTimelineController.instance?.nextSlide(activeInfoScreen.id)
          return
        }
        if (key === 'arrowleft') {
          event.preventDefault()
          ScreenTimelineController.instance?.prevSlide(activeInfoScreen.id)
          return
        }
        if (key === 'tab' || key === 'arrowdown') {
          event.preventDefault()
          ScreenTimelineController.instance?.nextSection(activeInfoScreen.id)
          return
        }
        if (key === 'arrowup') {
          event.preventDefault()
          ScreenTimelineController.instance?.prevSection(activeInfoScreen.id)
          return
        }
        if (key === 'escape' || key === 'e' || key === 'backspace') {
          event.preventDefault()
          closeInfoScreen()
          return
        }
      }

      if (key === 'e') {
        // If map is open -> close it
        if (isMapOpen) {
          closeMap()
          return
        }
        // If about is open -> close it
        if (isAboutOpen) {
          closeAbout()
          return
        }
        // If champion archive is open -> return to player POV
        if (activeChampionSection) {
          closeChampionPreview()
          return
        }
        if (activeExamBoard) {
          setActiveExamBoard(null)
          return
        }

        // Arcade Game Station trigger (Board 7 & Board 8)
        if (nearbyGameStation && !overlayOpen) {
          launchGameStation(nearbyGameStation)
          return
        }

        // Map View trigger (Map_Enter)
        if (nearbyMap && !overlayOpen) {
          openMap()
          return
        }

        // About Section trigger
        if (nearbyAbout && !overlayOpen) {
          openAbout()
          return
        }

        // Information screen inspection trigger
        if (nearbyInfoScreen && !overlayOpen) {
          setActiveInfoScreen(nearbyInfoScreen)
          return
        }

        // Exam computer / Monitor kiosk trigger (Cube_Screen_0.001)
        if ((nearbyExam || nearbyMonitor) && !overlayOpen) {
          openExam()
          return
        }

        // Formula car experience entrance trigger (Exam_board_prev6.001)
        if (nearbyFormulaCarEntrance && !overlayOpen) {
          metadata?.unlockFormulaCarEntrance?.()
          return
        }

        // Champion section photo frame trigger
        if (nearbyChampionSection && !overlayOpen) {
          setActiveChampionSection(nearbyChampionSection)
          return
        }

        // Exam board preview trigger
        if (nearbyExamBoard && !overlayOpen) {
          setActiveExamBoard(nearbyExamBoard)
          return
        }

        // Building / Gate entrance trigger
        if (nearbyEntrance) {
          openPreview()
          return
        }

        // Explain zone trigger
        if (nearbyExplainZone) {
          openExplainZone()
        }
      }

      if (key === 'escape') {
        if (isMiniGameOpen) {
          handleExitMiniGame(activeGameStation?.stationId ?? 'GAME_STATION_7')
          return
        }
        if (isMapOpen) {
          closeMap()
          return
        }
        if (isAboutOpen) {
          closeAbout()
          return
        }
        if (activeInfoScreen) {
          closeInfoScreen()
          return
        }
        if (activeChampionSection) {
          closeChampionPreview()
          return
        }
        if (activeExamBoard) {
          setActiveExamBoard(null)
          return
        }
        if (previewEntrance) closePreview()
        if (activeExplainZone) closeExplainZone()
        if (isExamOpen) closeExam()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    activeChampionSection,
    activeExamBoard,
    activeExplainZone,
    activeGameStation,
    activeInfoScreen,
    closeAbout,
    closeChampionPreview,
    closeExam,
    closeExplainZone,
    closeInfoScreen,
    closeMap,
    closePreview,
    handleExitMiniGame,
    isAboutOpen,
    isExamOpen,
    isMapOpen,
    isMiniGameOpen,
    launchGameStation,
    metadata,
    nearbyAbout,
    nearbyChampionSection,
    nearbyEntrance,
    nearbyExam,
    nearbyExamBoard,
    nearbyExplainZone,
    nearbyFormulaCarEntrance,
    nearbyGameStation,
    nearbyInfoScreen,
    nearbyMap,
    nearbyMonitor,
    openAbout,
    openExam,
    openExplainZone,
    openMap,
    openPreview,
    overlayOpen,
    previewEntrance,
  ])

  const { config, quality } = useGraphicsQuality()

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-black" onClick={requestLock}>
      <Canvas
        dpr={config.dprTarget}
        shadows={config.shadows ? { type: config.shadowType } : false}
        camera={{ position: [0, 1.65, 0], fov: 58, near: 0.08, far: config.maxDrawDistance }}
        gl={{
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.88,
          outputColorSpace: THREE.SRGBColorSpace,
          failIfMajorPerformanceCaveat: false,
        }}
      >
        <color attach="background" args={['#111111']} />
        <GraphicsApplier config={config} quality={quality} />
        <AdaptiveResolution config={config} quality={quality} />
        <Suspense fallback={null}>
          <CarnivalLighting config={config} />
          <CarnivalEnvironment onReady={handleReady} />
          <ScreenManager
            metadata={metadata}
            isInteractingWithMonitor={isExamOpen}
            onExitMonitor={closeExam}
            onPassExam={handleExamPass}
          />
        </Suspense>

        <CarnivalPlayer
          metadata={metadata}
          disabled={overlayOpen}
          isLocked={isLocked}
          isExamMode={isExamOpen}
          activeCinematicTarget={activeCinematicTarget}
          teleportTarget={teleportTarget}
          yawRef={yawRef}
          pitchRef={pitchRef}
          onNearbyEntranceChange={setNearbyEntrance}
          onNearbyExplainZoneChange={setNearbyExplainZone}
          onNearbyExamChange={setNearbyExam}
          onNearbyChampionSectionChange={setNearbyChampionSection}
          onNearbyExamBoardChange={setNearbyExamBoard}
          onNearbyFormulaCarEntranceChange={setNearbyFormulaCarEntrance}
          onNearbyMonitorChange={setNearbyMonitor}
          onNearbyAboutChange={setNearbyAbout}
          onNearbyInfoScreenChange={handleNearbyInfoScreenChange}
          onNearbyMapChange={setNearbyMap}
          onNearbyGameStationChange={setNearbyGameStation}
        />
      </Canvas>

      <CarnivalHUD
        isLocked={isLocked}
        isReady={!!metadata}
        nearbyEntrance={nearbyEntrance}
        nearbyExplainZone={nearbyExplainZone}
        nearbyExam={nearbyExam || nearbyMonitor}
        nearbyChampionSection={nearbyChampionSection}
        nearbyExamBoard={nearbyExamBoard}
        nearbyFormulaCarEntrance={nearbyFormulaCarEntrance}
        nearbyAbout={nearbyAbout}
        nearbyInfoScreen={nearbyInfoScreen}
        nearbyMap={!!nearbyMap}
        nearbyGameStation={nearbyGameStation}
        activeCinematicView={activeCinematicView}
        previewOpen={overlayOpen}
        onRequestLock={requestLock}
      />
      <BuildingPreview entrance={previewEntrance} onCancel={closePreview} />
      <ChampionPreview section={activeChampionSection} onClose={closeChampionPreview} />
      <ExplainZonePreview explainZone={activeExplainZone} onClose={closeExplainZone} />
      <AboutSectionModal isOpen={isAboutOpen} onClose={closeAbout} />
      <CarnivalMapModal isOpen={isMapOpen} onClose={closeMap} />
      <F1MiniGameModal
        isOpen={isMiniGameOpen}
        stationId={activeGameStation?.stationId ?? 'GAME_STATION_7'}
        onExit={handleExitMiniGame}
      />
    </div>
  )
}
