'use client'

import React, { forwardRef, useImperativeHandle, useEffect, useCallback } from 'react'
import type * as THREE from 'three'
import { useVehicle } from './VehicleContext'
import { VehicleController } from './VehicleController'
import WheelController from './WheelController'

interface VehicleProps {
  children: React.ReactNode
}

const Vehicle = forwardRef<THREE.Group, VehicleProps>(function Vehicle(
  { children },
  externalRef
) {
  const { vehicleRef, vehicleData, mode } = useVehicle()

  // Expose the internal vehicleRef to external consumers
  useImperativeHandle(externalRef, () => vehicleRef.current!, [vehicleRef])

  // Set initial driving position when the group mounts
  useEffect(() => {
    if (mode === 'driving' && vehicleRef.current) {
      // Use vehicleData initial rotationY for spawn orientation
      const rotY = vehicleData.current.rotationY
      vehicleRef.current.rotation.set(0, rotY, 0)
    }
  }, [mode, vehicleRef, vehicleData])

  return (
    <group ref={vehicleRef}>
      {children}
      {mode === 'driving' && (
        <>
          <VehicleController />
          <WheelController />
        </>
      )}
    </group>
  )
})

export default Vehicle
