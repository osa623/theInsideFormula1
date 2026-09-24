'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ExhibitionBoard } from './types/exhibition'

interface CameraControllerProps {
  isInspecting: boolean
  activeBoard: ExhibitionBoard | null
}

export default function CameraController({ isInspecting, activeBoard }: CameraControllerProps) {
  const { camera } = useThree()
  const lookAtRef = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (!isInspecting || !activeBoard) return

    const dt = Math.min(delta, 0.1)
    const targetPos = activeBoard.cameraPosition
    const targetLookAt = activeBoard.lookAtPosition

    // Smoothly lerp camera position to front of naming board
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.x, 5.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.y, 5.5, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.z, 5.5, dt)

    // Smoothly lerp lookAt target directly to board center
    lookAtRef.current.x = THREE.MathUtils.damp(lookAtRef.current.x, targetLookAt.x, 7.5, dt)
    lookAtRef.current.y = THREE.MathUtils.damp(lookAtRef.current.y, targetLookAt.y, 7.5, dt)
    lookAtRef.current.z = THREE.MathUtils.damp(lookAtRef.current.z, targetLookAt.z, 7.5, dt)

    camera.lookAt(lookAtRef.current)
  })

  return null
}
