'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { CarnivalMetadata } from '../types'
import { EXHIBITION_SCREEN_CONFIG } from './ScreenConfig'
import { ScreenGeometryService } from './ScreenGeometryService'
import { ScreenTimelineController } from './ScreenTimelineController'
import ComputerQuizTextureController from './ComputerQuizTextureController'

interface ExhibitionScreenManagerProps {
  metadata: CarnivalMetadata | null
  isInteractingWithMonitor: boolean
  onExitMonitor: () => void
  onPassExam?: () => void
}


export default function ExhibitionScreenManager({
  metadata,
  isInteractingWithMonitor,
  onExitMonitor,
  onPassExam,
}: ExhibitionScreenManagerProps) {
  const scene = useThree((state) => state.scene)
  const timelineRef = useRef<ScreenTimelineController | null>(null)
  const initializedRef = useRef(false)

  // Initialize native 3D screen textures on physical meshes
  useEffect(() => {
    if (!metadata || initializedRef.current) return

    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const initializeScreens = (attempt = 0) => {
      if (cancelled || initializedRef.current) return

      const screenMeshes = ScreenGeometryService.discoverScreens(scene)
      const requiredInfoScreens = [
        EXHIBITION_SCREEN_CONFIG.tyreTech.objectName,
        EXHIBITION_SCREEN_CONFIG.chassisTech.objectName,
        EXHIBITION_SCREEN_CONFIG.formulaTech.objectName,
        EXHIBITION_SCREEN_CONFIG.trackTech.objectName,
      ]
      const hasInfoScreens = requiredInfoScreens.every((name) => screenMeshes.has(name))

      if (!hasInfoScreens && attempt < 10) {
        retryTimer = setTimeout(() => initializeScreens(attempt + 1), 250)
        return
      }

      // Measure and log geometry for each discovered mesh
      screenMeshes.forEach((mesh, name) => {
        const info = ScreenGeometryService.measureScreen(mesh)
        console.log(
          `[ScreenSystem] Initialized physical screen '${name}': dimensions ${info.width.toFixed(2)}m x ${info.height.toFixed(2)}m (aspect: ${info.aspectRatio.toFixed(2)})`
        )
      })

      // Initialize centralized autoplay timeline controller
      const timeline = new ScreenTimelineController()
      timeline.initialize(screenMeshes)
      timelineRef.current = timeline
      initializedRef.current = true
    }

    initializeScreens()

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      timelineRef.current?.dispose()
      timelineRef.current = null
      initializedRef.current = false
    }
  }, [metadata, scene])

  // Update visibility throttling per frame (~8 Hz)
  useFrame(({ camera, clock }) => {
    if (timelineRef.current) {
      const nowMs = clock.getElapsedTime() * 1000
      timelineRef.current.updateVisibility(camera, nowMs)
      timelineRef.current.updateProgress(nowMs)
    }
  })

  // Passive screens render directly as WebGL CanvasTextures on physical Blender meshes.
  const computerAnchor = metadata?.screens?.computer || metadata?.screens?.monitor

  return (
    <group name="ExhibitionScreenManager_Root">
      {computerAnchor && (
        <ComputerQuizTextureController
          anchor={computerAnchor}
          occluders={metadata?.occluders}
          isInteracting={isInteractingWithMonitor}
          onExit={onExitMonitor}
          onPassExam={onPassExam}
        />
      )}
    </group>
  )
}
