'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useVehicle } from './VehicleContext'
import type { CameraMode } from './types'

const Y_AXIS = new THREE.Vector3(0, 1, 0)
const MAX_SPEED = 0.60

interface CameraPreset {
  xOffset: number
  zOffset: number
  yOffset: number
  lookAtZ: number
  lookAtY: number
  fov: number
  damp: number
}

const CAMERA_PRESETS: Record<CameraMode, CameraPreset> = {
  chase: {
    xOffset: 4.0,
    zOffset: -8.2,
    yOffset: 2.8,
    lookAtZ: 2.5,
    lookAtY: 0.5,
    fov: 50,
    damp: 14,
  },
  far: {
    xOffset: 0,
    zOffset: -9.5,
    yOffset: 3.2,
    lookAtZ: 2.0,
    lookAtY: 0.4,
    fov: 40,
    damp: 10,
  },
  cockpit: {
    xOffset: 0,
    zOffset: 0.15,
    yOffset: 0.95,
    lookAtZ: 15.0,
    lookAtY: 0.8,
    fov: 75,
    damp: 28,
  },
  tvpod: {
    xOffset: 0,
    zOffset: -0.3,
    yOffset: 1.35,
    lookAtZ: 12.0,
    lookAtY: 0.6,
    fov: 65,
    damp: 24,
  },
}

export function FollowCamera() {
  const { mode, cameraMode, vehicleRef, vehicleData } = useVehicle()
  const lookAtTargetRef = useRef(new THREE.Vector3())
  const prevCameraModeRef = useRef<CameraMode>(cameraMode)
  const isFirstFrameRef = useRef(true)

  // Reset snap trigger whenever camera mode changes
  useEffect(() => {
    if (prevCameraModeRef.current !== cameraMode) {
      isFirstFrameRef.current = true
      prevCameraModeRef.current = cameraMode
    }
  }, [cameraMode])

  useFrame(({ camera, clock }, delta) => {
    if (mode !== 'driving' || !vehicleRef.current) return

    const dt = Math.min(delta, 0.1)
    const carPos = vehicleRef.current.position.clone()

    // Anchor camera reference point to the visual car center (CarModel is offset down by -2.2)
    carPos.y -= 2.2

    const rotationY = vehicleData.current.rotationY
    const speed = vehicleData.current.speed
    const speedRatio = Math.min(Math.abs(speed) / MAX_SPEED, 1.0)

    const preset = CAMERA_PRESETS[cameraMode] || CAMERA_PRESETS.chase

    // Dynamic Z distance scaling with speed for chase modes
    const speedZ = (cameraMode === 'chase' || cameraMode === 'far') ? -speedRatio * 2.0 : 0
    const zOffset = preset.zOffset + speedZ
    const yOffset = preset.yOffset
    const xOffset = preset.xOffset

    const dynamicOffset = new THREE.Vector3(xOffset , yOffset, zOffset)
    const rotatedOffset = dynamicOffset.clone().applyAxisAngle(Y_AXIS, rotationY)
    const targetCameraPos = carPos.clone().add(rotatedOffset)

    // Calculate target lookAt vector ahead of vehicle
    const lookAtOffset = new THREE.Vector3(0, preset.lookAtY, preset.lookAtZ).applyAxisAngle(Y_AXIS, rotationY)
    const targetLookAt = carPos.clone().add(lookAtOffset)

    // Speed vibration effect for cockpit/chase views
    if (speedRatio > 0.35 && (cameraMode === 'chase' || cameraMode === 'cockpit')) {
      const shake = (speedRatio - 0.35) * (cameraMode === 'cockpit' ? 0.05 : 0.03)
      const time = clock.getElapsedTime() * 45
      targetCameraPos.x += Math.sin(time) * shake
      targetCameraPos.y += Math.cos(time * 1.4) * shake * 0.5
    }

    // Instant snap on first frame or camera mode switch
    if (isFirstFrameRef.current) {
      camera.position.copy(targetCameraPos)
      lookAtTargetRef.current.copy(targetLookAt)
      camera.lookAt(lookAtTargetRef.current)
      isFirstFrameRef.current = false
    } else {
      // Smooth damp position & lookAt
      const dampSpeed = THREE.MathUtils.lerp(preset.damp, preset.damp * 0.6, speedRatio)
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCameraPos.x, dampSpeed, dt)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCameraPos.y, dampSpeed, dt)
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraPos.z, dampSpeed, dt)

      lookAtTargetRef.current.x = THREE.MathUtils.damp(lookAtTargetRef.current.x, targetLookAt.x, 18, dt)
      lookAtTargetRef.current.y = THREE.MathUtils.damp(lookAtTargetRef.current.y, targetLookAt.y, 18, dt)
      lookAtTargetRef.current.z = THREE.MathUtils.damp(lookAtTargetRef.current.z, targetLookAt.z, 18, dt)

      camera.lookAt(lookAtTargetRef.current)
    }

    // Dynamic FOV update
    if ('fov' in camera && typeof (camera as THREE.PerspectiveCamera).fov === 'number') {
      const perspCam = camera as THREE.PerspectiveCamera
      const fovBoost = (cameraMode === 'chase' || cameraMode === 'far') ? speedRatio * 10 : 0
      const targetFov = preset.fov + fovBoost
      perspCam.fov = THREE.MathUtils.damp(perspCam.fov, targetFov, 8, dt)
      perspCam.updateProjectionMatrix()
    }
  })

  return null
}
