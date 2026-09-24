import { useState, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { CarPlaceholder } from '../types/simulation'

const PROXIMITY_THRESHOLD = 4.5

export function useCarInteraction() {
  const [nearCar, setNearCar] = useState<CarPlaceholder | null>(null)
  const [inspectedCar, setInspectedCar] = useState<CarPlaceholder | null>(null)
  const [isInspecting, setIsInspecting] = useState(false)
  const nearCarRef = useRef<CarPlaceholder | null>(null)

  const checkProximity = useCallback((playerPos: THREE.Vector3, placeholders: CarPlaceholder[]) => {
    if (placeholders.length === 0) return

    let closest: CarPlaceholder | null = null
    let minDist = Infinity

    for (const ph of placeholders) {
      const dx = playerPos.x - ph.position.x
      const dz = playerPos.z - ph.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist < PROXIMITY_THRESHOLD && dist < minDist) {
        minDist = dist
        closest = ph
      }
    }

    if (closest !== nearCarRef.current) {
      nearCarRef.current = closest
      setNearCar(closest)
    }
  }, [])

  const startInspection = useCallback((car?: CarPlaceholder) => {
    const target = car || nearCarRef.current
    if (target) {
      setInspectedCar(target)
      setIsInspecting(true)
    }
  }, [])

  const exitInspection = useCallback(() => {
    setIsInspecting(false)
    setInspectedCar(null)
  }, [])

  return {
    nearCar,
    inspectedCar,
    isInspecting,
    checkProximity,
    startInspection,
    exitInspection,
  }
}
