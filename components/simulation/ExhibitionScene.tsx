'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'

import ExhibitionHall from './ExhibitionHall'
import Environment from './Environment'
import PlayerController from './PlayerController'
import CameraController from './CameraController'
import PlayerHUD from './PlayerHUD'
import QRDocumentModal from './QRDocumentModal'
import AITerminalModal from './AITerminalModal'
import { ttsService } from '@/lib/ai/ttsService'
import { EXHIBITION_CARS_KNOWLEDGE } from '@/lib/ai/f1KnowledgeBase'

import { usePointerLock } from './hooks/usePointerLock'
import {
  ExhibitionBoard,
  ExhibitionQRData,
  ExhibitionTriggerPoint,
} from './types/exhibition'
import { useGraphicsQuality } from '@/lib/graphics/useGraphicsQuality'
import { GraphicsConfig, GraphicsQuality } from '@/lib/graphics/GraphicsManager'
import { useThree } from '@react-three/fiber'

function createHallImpulseResponse(context: AudioContext): AudioBuffer {
  const length = Math.max(1, Math.floor(context.sampleRate * 2.4))
  const impulse = context.createBuffer(2, length, context.sampleRate)

  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel)

    for (let i = 0; i < length; i += 1) {
      const envelope = Math.pow(1 - i / length, 2.2)
      const noise = (Math.random() * 2 - 1) * envelope
      const echo = i > 0 ? data[i - 1] * 0.18 : 0
      data[i] = (noise + echo) * (channel === 0 ? 1.0 : 0.78)
    }
  }

  return impulse
}

function GraphicsApplier({ config, quality }: { config: GraphicsConfig; quality: GraphicsQuality }) {
  const { gl, scene, camera } = useThree()

  useEffect(() => {
    const targetDpr = quality === 'auto'
      ? Math.min(window.devicePixelRatio || 1, config.dprTarget)
      : config.dprTarget
    gl.setPixelRatio(targetDpr)

    gl.shadowMap.enabled = config.shadows
    gl.shadowMap.type = config.shadowType
    gl.shadowMap.needsUpdate = true

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.far = config.maxDrawDistance
      camera.updateProjectionMatrix()
    }

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

export default function ExhibitionScene() {
  const { config, quality } = useGraphicsQuality()
  const hallAudioRef = useRef<HTMLAudioElement | null>(null)
  const hallAudioContextRef = useRef<AudioContext | null>(null)
  const duckGainRef = useRef<GainNode | null>(null)

  const ensureHallAudioChain = useCallback(() => {
    const audio = hallAudioRef.current
    if (!audio) return

    if (!hallAudioContextRef.current) {
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtor) return

      const context = new AudioCtor()
      const source = context.createMediaElementSource(audio)

      const warmth = context.createBiquadFilter()
      warmth.type = 'lowshelf'
      warmth.frequency.value = 160
      warmth.gain.value = 5

      const lowpass = context.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 2200
      lowpass.Q.value = 0.8

      const room = context.createConvolver()
      room.buffer = createHallImpulseResponse(context)

      const roomGain = context.createGain()
      roomGain.gain.value = 0.9

      const dryGain = context.createGain()
      dryGain.gain.value = 0.6

      const masterGain = context.createGain()
      masterGain.gain.value = 0.78

      const compressor = context.createDynamicsCompressor()
      compressor.threshold.value = -18
      compressor.knee.value = 16
      compressor.ratio.value = 3
      compressor.attack.value = 0.02
      compressor.release.value = 0.25

      const duckGain = context.createGain()
      duckGain.gain.value = 1.0
      duckGainRef.current = duckGain

      source.connect(warmth)
      warmth.connect(lowpass)
      lowpass.connect(dryGain)
      lowpass.connect(room)
      dryGain.connect(masterGain)
      room.connect(roomGain)
      roomGain.connect(masterGain)
      masterGain.connect(compressor)
      compressor.connect(duckGain)
      duckGain.connect(context.destination)

      hallAudioContextRef.current = context
    }

    if (hallAudioContextRef.current.state === 'suspended') {
      void hallAudioContextRef.current.resume()
    }
  }, [])

  const startHallMusic = useCallback(async () => {
    const audio = hallAudioRef.current
    if (!audio) return

    audio.muted = false
    audio.volume = 0.32
    audio.loop = true

    ensureHallAudioChain()

    try {
      await audio.play()
    } catch {
      // Some browsers still block autoplay until a user interaction occurs.
    }
  }, [ensureHallAudioChain])

  useEffect(() => {
    const audio = new Audio('/music/formulaSong.mp3')
    audio.preload = 'auto'
    audio.autoplay = true
    audio.loop = true
    audio.volume = 0.32
    audio.muted = false
    hallAudioRef.current = audio

    void startHallMusic()

    // Subscribe to TTS ducking events for smooth background music attenuation
    const unsubscribeDucking = ttsService.onDucking((isDucking) => {
      const ctx = hallAudioContextRef.current
      const duckGain = duckGainRef.current
      if (ctx && duckGain) {
        const now = ctx.currentTime
        duckGain.gain.cancelScheduledValues(now)
        duckGain.gain.setValueAtTime(duckGain.gain.value, now)
        if (isDucking) {
          duckGain.gain.linearRampToValueAtTime(0.12, now + 0.35)
        } else {
          duckGain.gain.linearRampToValueAtTime(1.0, now + 0.6)
        }
      } else if (hallAudioRef.current) {
        hallAudioRef.current.volume = isDucking ? 0.06 : 0.32
      }
    })

    return () => {
      unsubscribeDucking()
      hallAudioContextRef.current?.close()
      hallAudioContextRef.current = null
      duckGainRef.current = null
      audio.pause()
      audio.src = ''
      audio.remove()
      hallAudioRef.current = null
    }
  }, [startHallMusic])

  // Scene state
  const [triggers, setTriggers] = useState<ExhibitionTriggerPoint[]>([])
  const [boards, setBoards] = useState<Map<string, ExhibitionBoard>>(new Map())
  const [obstacleBoxes, setObstacleBoxes] = useState<THREE.Box3[]>([])
  const [spawnPosition, setSpawnPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(-5.12, -1.33, 6.23)
  )
  const [playerEyeY, setPlayerEyeY] = useState(-1.33)

  // Interaction state
  const [nearbyTrigger, setNearbyTrigger] = useState<ExhibitionTriggerPoint | null>(null)
  const [activeBoard, setActiveBoard] = useState<ExhibitionBoard | null>(null)
  const [activeQRData, setActiveQRData] = useState<ExhibitionQRData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAITerminalOpen, setIsAITerminalOpen] = useState(false)
  const [isObservationMode, setIsObservationMode] = useState(false)
  const [currentCar, setCurrentCar] = useState<string | null>(null)
  const lastObservedCarRef = useRef<string | null>(null)

  const isInspecting = Boolean(activeBoard)
  const overlayOpen = isModalOpen || isInspecting || isAITerminalOpen

  const { isLocked, requestLock, exitLock, yawRef, pitchRef } = usePointerLock()

  const handleExhibitionDataLoaded = useCallback(
    (data: {
      triggers: ExhibitionTriggerPoint[]
      boards: Map<string, ExhibitionBoard>
      spawnPosition: THREE.Vector3
      obstacleBoxes: THREE.Box3[]
      floorY: number
    }) => {
      setTriggers(data.triggers)
      setBoards(data.boards)
      setObstacleBoxes(data.obstacleBoxes)
      setSpawnPosition(data.spawnPosition)
      setPlayerEyeY(data.floorY + 1.6)
    },
    []
  )

  // Track nearby trigger changes, update current car context, and trigger Observation Mode TTS
  const handleNearbyTriggerChange = useCallback(
    (trig: ExhibitionTriggerPoint | null) => {
      setNearbyTrigger(trig)
      const nextCarKey = trig?.carKey ?? null

      if (nextCarKey) {
        setCurrentCar(nextCarKey)

        // Observation Mode Voice Tour: play whenever entering a car exhibit trigger
        if (isObservationMode && nextCarKey !== lastObservedCarRef.current) {
          lastObservedCarRef.current = nextCarKey
          const car = EXHIBITION_CARS_KNOWLEDGE[nextCarKey]
          if (car) {
            ttsService.stop()
            ttsService.speak(car.audioGuide)
          }
        }
      } else {
        // Player stepped away from car trigger: reset so speech can trigger again upon re-entry
        lastObservedCarRef.current = null
      }
    },
    [isObservationMode]
  )

  // Close inspection and modals
  const handleCloseInspection = useCallback(() => {
    setIsModalOpen(false)
    setIsAITerminalOpen(false)
    setActiveQRData(null)
    setActiveBoard(null)
    ttsService.stop()
    window.setTimeout(requestLock, 120)
  }, [requestLock])

  // Start interaction when pressing E on trigger
  const handleInteract = useCallback(() => {
    if (!nearbyTrigger) return

    // 1. Entrance_Spawn: Return to Carnival
    if (nearbyTrigger.isExit) {
      exitLock()
      window.location.assign('/carnival')
      return
    }

    // 2. Map_trigger: Camera zoom ONLY to Naming_Board.006 (no modal)
    if (nearbyTrigger.isMap) {
      const board = boards.get(nearbyTrigger.targetBoardName) || null
      if (board) {
        exitLock()
        setActiveBoard(board)
      }
      return
    }

    // 3. AI Terminal Trigger: Zoom camera to AI_Screen_Set + Open AITerminalModal
    if (nearbyTrigger.isAITerminal) {
      const board = boards.get(nearbyTrigger.targetBoardName) || null
      exitLock()
      if (board) {
        setActiveBoard(board)
      }
      window.setTimeout(() => {
        setIsAITerminalOpen(true)
      }, 400)
      return
    }

    // 4. Trigger.000 to Trigger.005: Camera zoom to Naming_Board.00X + QR Document Modal
    if (nearbyTrigger.qrData) {
      const board = boards.get(nearbyTrigger.targetBoardName) || null
      exitLock()
      if (board) {
        setActiveBoard(board)
      }
      // Small delay to allow camera zoom to begin before document modal pops up
      window.setTimeout(() => {
        setActiveQRData(nearbyTrigger.qrData || null)
        setIsModalOpen(true)
      }, 450)
    }
  }, [nearbyTrigger, boards, exitLock])

  // Listen for E and Escape keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const key = e.key.toLowerCase()

      if (key === 'e') {
        if (isInspecting || isModalOpen || isAITerminalOpen) {
          handleCloseInspection()
        } else if (nearbyTrigger && !overlayOpen) {
          handleInteract()
        }
      } else if (key === 'escape') {
        if (isInspecting || isModalOpen || isAITerminalOpen) {
          handleCloseInspection()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInspecting, isModalOpen, isAITerminalOpen, nearbyTrigger, overlayOpen, handleInteract, handleCloseInspection])

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#080a0f] select-none"
      onClick={() => {
        requestLock()
        void startHallMusic()
      }}
    >
      {/* Player HUD Overlays & E Prompts */}
      <PlayerHUD
        isLocked={isLocked}
        isInspecting={isInspecting}
        nearbyTrigger={nearbyTrigger}
        inspectingBoardName={activeBoard?.name}
        onRequestLock={requestLock}
        onTriggerInteract={handleInteract}
      />

      {/* QR Document Modal */}
      <QRDocumentModal
        data={activeQRData}
        isOpen={isModalOpen}
        onClose={handleCloseInspection}
      />

      {/* AI Exhibition Terminal Modal */}
      <AITerminalModal
        isOpen={isAITerminalOpen}
        currentCar={currentCar}
        isObservationMode={isObservationMode}
        onToggleObservationMode={(active) => {
          setIsObservationMode(active)
          if (!active) {
            ttsService.stop()
            lastObservedCarRef.current = null
          } else {
            // When turning observation mode ON, immediately play speech for the current nearby car if standing near one
            if (nearbyTrigger?.carKey) {
              lastObservedCarRef.current = nearbyTrigger.carKey
              const car = EXHIBITION_CARS_KNOWLEDGE[nearbyTrigger.carKey]
              if (car) {
                ttsService.stop()
                ttsService.speak(car.audioGuide)
              }
            }
          }
        }}
        onClose={handleCloseInspection}
      />

      {/* R3F 3D Exhibition Canvas */}
      <Canvas
        dpr={config.dprTarget}
        shadows={config.shadows ? { type: config.shadowType } : false}
        gl={{
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: THREE.SRGBColorSpace,
          failIfMajorPerformanceCaveat: false,
        }}
        camera={{
          position: [-5.12, playerEyeY, 6.23],
          fov: 55,
          near: 0.1,
          far: config.maxDrawDistance,
        }}
      >
        <GraphicsApplier config={config} quality={quality} />
        <Suspense fallback={null}>
          <Environment />
          <ExhibitionHall onExhibitionDataLoaded={handleExhibitionDataLoaded} />
        </Suspense>

        {/* FPS Player Movement Physics */}
        <PlayerController
          isLocked={isLocked}
          isInspecting={isInspecting}
          yawRef={yawRef}
          pitchRef={pitchRef}
          playerEyeY={playerEyeY}
          spawnPosition={spawnPosition}
          triggers={triggers}
          obstacleBoxes={obstacleBoxes}
          onNearbyTriggerChange={handleNearbyTriggerChange}
        />

        {/* Camera Zoom to Naming Boards */}
        <CameraController isInspecting={isInspecting} activeBoard={activeBoard} />
      </Canvas>
    </div>
  )
}
