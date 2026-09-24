'use client'

import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

export function useCarnivalPointerLock(containerRef: RefObject<HTMLElement | null>, disabled: boolean) {
  const [isLocked, setIsLocked] = useState(false)
  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  const requestLock = useCallback(() => {
    if (disabled) return
    const element = containerRef.current
    if (element && !document.pointerLockElement) {
      element.requestPointerLock()
    }
  }, [containerRef, disabled])

  const exitLock = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }
  }, [])

  useEffect(() => {
    if (disabled && document.pointerLockElement) {
      document.exitPointerLock()
    }
  }, [disabled])

  useEffect(() => {
    const onPointerLockChange = () => {
      setIsLocked(document.pointerLockElement === containerRef.current)
    }

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== containerRef.current || disabled) return

      const sensitivity = 0.002
      yawRef.current -= event.movementX * sensitivity
      pitchRef.current -= event.movementY * sensitivity

      const maxPitch = Math.PI / 2 - 0.08
      pitchRef.current = Math.max(-maxPitch, Math.min(maxPitch, pitchRef.current))
    }

    document.addEventListener('pointerlockchange', onPointerLockChange)
    document.addEventListener('mousemove', onMouseMove)

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [containerRef, disabled])

  return { isLocked, requestLock, exitLock, yawRef, pitchRef }
}
