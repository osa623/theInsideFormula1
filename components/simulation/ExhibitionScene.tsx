'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'

import ExhibitionHall from './ExhibitionHall'
import Environment from './Environment'
import PlayerController from './PlayerController'
import CameraController from './CameraController'
import PlayerHUD from './PlayerHUD'
import QRDocumentModal from './QRDocumentModal'

import { usePointerLock } from './hooks/usePointerLock'
import {
  ExhibitionBoard,
  ExhibitionQRData,
  ExhibitionTriggerPoint,
} from './types/exhibition'
import { useGraphicsQuality } from '@/lib/graphics/useGraphicsQuality'
import { GraphicsConfig, GraphicsQuality } from '@/lib/graphics/GraphicsManager'
import { useThree } from '@react-three/fiber'

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

  const isInspecting = Boolean(activeBoard)
  const overlayOpen = isModalOpen || isInspecting

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

  // Close inspection and modal
  const handleCloseInspection = useCallback(() => {
    setIsModalOpen(false)
    setActiveQRData(null)
    setActiveBoard(null)
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

    // 3. Trigger.000 to Trigger.005: Camera zoom to Naming_Board.00X + QR Document Modal
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
        if (isInspecting || isModalOpen) {
          handleCloseInspection()
        } else if (nearbyTrigger && !overlayOpen) {
          handleInteract()
        }
      } else if (key === 'escape') {
        if (isInspecting || isModalOpen) {
          handleCloseInspection()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInspecting, isModalOpen, nearbyTrigger, overlayOpen, handleInteract, handleCloseInspection])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#080a0f] select-none" onClick={requestLock}>
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
          onNearbyTriggerChange={setNearbyTrigger}
        />

        {/* Camera Zoom to Naming Boards */}
        <CameraController isInspecting={isInspecting} activeBoard={activeBoard} />
      </Canvas>
    </div>
  )
}
