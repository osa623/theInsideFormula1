'use client'

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react'
import type * as THREE from 'three'
import { useKeyboardInput } from './KeyboardInput'
import type { CameraMode, InspectMode, VehicleContextType, VehicleRefData } from './types'

const VehicleContext = createContext<VehicleContextType | null>(null)

interface VehicleProviderProps {
  children: React.ReactNode
  initialMode?: InspectMode
}

const DRIVING_START_POS = { x: 0, y: 0, z: 0 }
const DRIVING_START_ROT_Y = 0
const CAMERA_MODES: CameraMode[] = ['chase', 'far', 'cockpit', 'tvpod']

export function VehicleProvider({ children, initialMode = 'inspect' }: VehicleProviderProps) {
  const [mode, setMode] = useState<InspectMode>(initialMode)
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase')

  const vehicleRef = useRef<THREE.Group | null>(null)
  const vehicleData = useRef<VehicleRefData>({
    speed: 0,
    rotationY: initialMode === 'driving' ? DRIVING_START_ROT_Y : 0,
    steering: 0,
    pitch: 0,
    roll: 0,
  })

  const inputs = useKeyboardInput()

  const cycleCameraMode = useCallback(() => {
    setCameraMode((prev) => {
      const idx = CAMERA_MODES.indexOf(prev)
      return CAMERA_MODES[(idx + 1) % CAMERA_MODES.length]
    })
  }, [])

  const resetVehicle = useCallback(() => {
    if (vehicleRef.current) {
      if (mode === 'driving') {
        vehicleRef.current.position.set(DRIVING_START_POS.x, DRIVING_START_POS.y, DRIVING_START_POS.z)
        vehicleRef.current.rotation.set(0, DRIVING_START_ROT_Y, 0)
      } else {
        vehicleRef.current.position.set(0, 0, 0)
        vehicleRef.current.rotation.set(0, 0, 0)
      }
    }
    vehicleData.current.speed = 0
    vehicleData.current.rotationY = mode === 'driving' ? DRIVING_START_ROT_Y : 0
    vehicleData.current.steering = 0
    vehicleData.current.pitch = 0
    vehicleData.current.roll = 0
  }, [mode])

  // Initial spawn position & mode change reset
  useEffect(() => {
    resetVehicle()
  }, [mode, resetVehicle])

  // Handle R key reset & C key camera view cycle
  useEffect(() => {
    if (inputs.reset) {
      resetVehicle()
    }
  }, [inputs.reset, resetVehicle])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'driving' && e.key.toLowerCase() === 'c') {
        cycleCameraMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, cycleCameraMode])

  return (
    <VehicleContext.Provider
      value={{
        mode,
        setMode,
        cameraMode,
        setCameraMode,
        cycleCameraMode,
        vehicleRef,
        vehicleData,
        inputs,
        resetVehicle,
      }}
    >
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicle(): VehicleContextType {
  const ctx = useContext(VehicleContext)
  if (!ctx) {
    throw new Error('useVehicle must be used within a VehicleProvider')
  }
  return ctx
}
