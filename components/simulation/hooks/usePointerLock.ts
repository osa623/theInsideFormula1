import { useEffect, useRef, useState, useCallback } from 'react'

export function usePointerLock() {
  const [isLocked, setIsLocked] = useState(false)
  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  const requestLock = useCallback(() => {
    if (typeof document !== 'undefined' && !document.pointerLockElement) {
      document.body.requestPointerLock()
    }
  }, [])

  const exitLock = useCallback(() => {
    if (typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock()
    }
  }, [])

  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = !!document.pointerLockElement
      setIsLocked(locked)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return

      const sensitivity = 0.0022
      yawRef.current -= e.movementX * sensitivity
      pitchRef.current -= e.movementY * sensitivity

      // Clamp vertical pitch look angle between -85 deg and +85 deg
      const maxPitch = Math.PI / 2 - 0.05
      pitchRef.current = Math.max(-maxPitch, Math.min(maxPitch, pitchRef.current))
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return {
    isLocked,
    requestLock,
    exitLock,
    yawRef,
    pitchRef,
  }
}
