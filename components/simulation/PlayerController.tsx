'use client'

import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMovement } from './hooks/useMovement'
import { useCollision } from './hooks/useCollision'
import { ExhibitionTriggerPoint } from './types/exhibition'

interface PlayerControllerProps {
  isLocked: boolean
  isInspecting: boolean
  yawRef: React.MutableRefObject<number>
  pitchRef: React.MutableRefObject<number>
  playerEyeY: number
  spawnPosition?: THREE.Vector3
  triggers?: ExhibitionTriggerPoint[]
  obstacleBoxes?: THREE.Box3[]
  onNearbyTriggerChange?: (trigger: ExhibitionTriggerPoint | null) => void
}

const IDLE_BOB_FREQ = 2.2
const IDLE_BOB_AMP_Y = 0.012
const IDLE_BOB_AMP_X = 0.006
const IDLE_ROT_AMP = 0.003
const WALK_SPEED = 2.4
const SPRINT_SPEED = 5.2
const BOB_FREQ_WALK = 4.0
const BOB_FREQ_SPRINT = 6.0
const BOB_AMP_WALK = 0.03
const BOB_AMP_SPRINT = 0.03

export default function PlayerController({
  isLocked,
  isInspecting,
  yawRef,
  pitchRef,
  playerEyeY,
  spawnPosition,
  triggers = [],
  obstacleBoxes = [],
  onNearbyTriggerChange,
}: PlayerControllerProps) {
  const { camera } = useThree()
  const movementRef = useMovement()
  const { clampPlayerPosition } = useCollision(playerEyeY - 1.6)

  // Default spawn location is Entrance_Spawn: [-5.12, eyeY, 6.23]
  const playerPos = useRef(new THREE.Vector3(-5.12, playerEyeY, 6.23))
  const velocity = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const moveDir = useRef(new THREE.Vector3())
  const distanceWalked = useRef(0)
  const lastCheckTime = useRef(0)
  const idleBobTime = useRef(0)
  const lastTriggerId = useRef<string | null>(null)
  const spawnInitialized = useRef(false)

  // Initialize spawn position once available
  useEffect(() => {
    if (spawnPosition && !spawnInitialized.current) {
      spawnInitialized.current = true
      playerPos.current.set(spawnPosition.x, playerEyeY, spawnPosition.z)
      camera.position.copy(playerPos.current)
    }
  }, [spawnPosition, playerEyeY, camera])

  useEffect(() => {
    playerPos.current.y = playerEyeY
  }, [playerEyeY])

  useFrame((_, delta) => {
    // Lock movement during zoom inspection mode
    if (isInspecting) return

    const dt = Math.min(delta, 0.1)
    const m = movementRef.current
    const speed = m.sprint ? SPRINT_SPEED : WALK_SPEED

    const yaw = yawRef.current
    forward.current.set(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize()
    right.current.set(Math.cos(yaw), 0, -Math.sin(yaw)).normalize()

    moveDir.current.set(0, 0, 0)
    if (m.forward) moveDir.current.add(forward.current)
    if (m.backward) moveDir.current.sub(forward.current)
    if (m.right) moveDir.current.add(right.current)
    if (m.left) moveDir.current.sub(right.current)

    if (moveDir.current.lengthSq() > 0) {
      moveDir.current.normalize()
    }

    moveDir.current.multiplyScalar(speed)
    velocity.current.x = THREE.MathUtils.damp(velocity.current.x, moveDir.current.x, 14, dt)
    velocity.current.z = THREE.MathUtils.damp(velocity.current.z, moveDir.current.z, 14, dt)

    playerPos.current.x += velocity.current.x * dt
    playerPos.current.z += velocity.current.z * dt

    // Enforce obstacle collisions
    clampPlayerPosition(playerPos.current, obstacleBoxes)

    // Head bobbing
    const currentSpeed = Math.hypot(velocity.current.x, velocity.current.z)
    let headBobY = 0
    let headBobX = 0
    let idleRot = 0

    if (currentSpeed > 0.4) {
      const bobFreq = m.sprint ? BOB_FREQ_SPRINT : BOB_FREQ_WALK
      const bobAmp = m.sprint ? BOB_AMP_SPRINT : BOB_AMP_WALK
      distanceWalked.current += currentSpeed * dt

      headBobY = Math.sin(distanceWalked.current * bobFreq) * bobAmp
      headBobX = Math.cos(distanceWalked.current * bobFreq * 0.5) * (bobAmp * 0.5)
      idleBobTime.current = 0
    } else {
      idleBobTime.current += dt
      headBobY = Math.sin(idleBobTime.current * IDLE_BOB_FREQ) * IDLE_BOB_AMP_Y
      headBobX = Math.cos(idleBobTime.current * IDLE_BOB_FREQ * 0.7) * IDLE_BOB_AMP_X
      idleRot = Math.sin(idleBobTime.current * 0.8) * IDLE_ROT_AMP
    }

    if (isLocked) {
      const pitch = pitchRef.current
      camera.rotation.set(pitch + idleRot, yaw, idleRot * 0.5, 'YXZ')
      camera.position.x = playerPos.current.x + headBobX
      camera.position.y = playerPos.current.y + headBobY
      camera.position.z = playerPos.current.z
    }

    // Immediate per-frame proximity detection for triggers
    let nearestTrigger: ExhibitionTriggerPoint | null = null
    let nearestDist = Infinity

    for (const trig of triggers) {
      const dist = Math.hypot(
        playerPos.current.x - trig.position.x,
        playerPos.current.z - trig.position.z
      )
      // Generous trigger radius (2.8m) so player reliably detects triggers upon stepping near
      const maxDist = 2.8
      if (dist < maxDist && dist < nearestDist) {
        nearestDist = dist
        nearestTrigger = trig
      }
    }

    const nextId = nearestTrigger?.id ?? null
    if (nextId !== lastTriggerId.current) {
      lastTriggerId.current = nextId
      onNearbyTriggerChange?.(nearestTrigger)
    }
  })

  return null
}
