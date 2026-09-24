'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useVehicle } from './VehicleContext'

// Tuning constants for professional F1 vehicle physics
const MAX_SPEED = 0.60
const MAX_REVERSE = -0.80
const ACCELERATION = 0.5
const BRAKE_POWER = 5.0
const FRICTION = 0.30
const BASE_STEER_ANGLE = Math.PI / 6 // 30 degrees in radians
const TURN_RATE = 4.0
const STEER_SMOOTH_SPEED = 12

const Y_AXIS = new THREE.Vector3(0, 1, 0)

export function VehicleController() {
  const { mode, vehicleRef, vehicleData, inputs } = useVehicle()
  const prevSpeed = useRef<number>(0)

  useFrame((_, delta) => {
    if (mode !== 'driving' || !vehicleRef.current) return

    // Limit max frame delta to prevent physics jumps
    const dt = Math.min(delta, 0.1)

    let { speed, rotationY, steering, pitch, roll } = vehicleData.current
    const { forward, backward, left, right, brake } = inputs

    // 1. Acceleration / Reverse / Friction
    if (forward) {
      speed += ACCELERATION * dt
      if (speed > MAX_SPEED) speed = MAX_SPEED
    } else if (backward) {
      speed -= ACCELERATION * dt
      if (speed < MAX_REVERSE) speed = MAX_REVERSE
    } else {
      // Natural friction deceleration
      speed = THREE.MathUtils.damp(speed, 0, FRICTION, dt)
    }

    // 2. Emergency Brake
    if (brake) {
      speed = THREE.MathUtils.damp(speed, 0, BRAKE_POWER, dt)
    }

    // Stop tiny drift decimals
    if (Math.abs(speed) < 0.0001) {
      speed = 0
    }

    // 3. Speed-based Steering Sensitivity & Return
    const speedRatio = Math.min(Math.abs(speed) / MAX_SPEED, 1.0)
    // At higher speeds, steering angle is scaled down for high-speed stability
    const steeringSensitivity = 1 / (1 + speedRatio * 1.2)

    let targetSteering = 0
    if (left) {
      targetSteering += BASE_STEER_ANGLE * steeringSensitivity
    }
    if (right) {
      targetSteering -= BASE_STEER_ANGLE * steeringSensitivity
    }

    // Smoothly interpolate steering towards target (and smoothly return to center when released)
    steering = THREE.MathUtils.damp(steering, targetSteering, STEER_SMOOTH_SPEED, dt)

    // 4. Chassis Turning (RotationY)
    if (Math.abs(speed) > 0.0005) {
      const turnDir = speed >= 0 ? 1 : -1
      const turnAmount = turnDir * steering * speedRatio * TURN_RATE * dt
      rotationY += turnAmount
    }

    // 5. Vehicle Movement along facing direction
    const forwardVector = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, rotationY)
    vehicleRef.current.position.addScaledVector(forwardVector, speed)

    // 6. Suspension Simulation (Subtle Pitch & Roll)
    const acceleration = (speed - prevSpeed.current) / (dt || 0.016)
    prevSpeed.current = speed

    // Acceleration compresses rear (pitch up), braking compresses front (pitch down)
    const targetPitch = THREE.MathUtils.clamp(-acceleration * 0.05, -0.04, 0.04)
    // Turning creates body roll outwards
    const targetRoll = THREE.MathUtils.clamp(-speedRatio * steering * 0.08, -0.05, 0.05)

    pitch = THREE.MathUtils.damp(pitch || 0, targetPitch, 8, dt)
    roll = THREE.MathUtils.damp(roll || 0, targetRoll, 8, dt)

    // Apply orientation (YXZ Euler order to prevent gymbal lock)
    vehicleRef.current.rotation.set(pitch, rotationY, roll, 'YXZ')

    // 7. Persist state
    vehicleData.current.speed = speed
    vehicleData.current.rotationY = rotationY
    vehicleData.current.steering = steering
    vehicleData.current.pitch = pitch
    vehicleData.current.roll = roll
  })

  return null
}
