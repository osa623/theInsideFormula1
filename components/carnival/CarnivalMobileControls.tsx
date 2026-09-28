'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { updateTouchMovement, resetTouchMovement } from './useCarnivalInput'

interface CarnivalMobileControlsProps {
  yawRef: React.MutableRefObject<number>
  pitchRef: React.MutableRefObject<number>
  onInteract: () => void
  onTogglePhone: () => void
  isPhoneOpen: boolean
  hasNearbyInteraction: boolean
}

export default function CarnivalMobileControls({
  yawRef,
  pitchRef,
  onInteract,
  onTogglePhone,
  isPhoneOpen,
  hasNearbyInteraction,
}: CarnivalMobileControlsProps) {
  const [isTouch, setIsTouch] = useState(false)
  const [isSprinting, setIsSprinting] = useState(false)

  // Joystick visual state
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 })
  const joystickTouchIdRef = useRef<number | null>(null)
  const joystickCenterRef = useRef<{ x: number; y: number } | null>(null)
  const joystickContainerRef = useRef<HTMLDivElement | null>(null)

  // Camera look state
  const cameraTouchIdRef = useRef<number | null>(null)
  const lastCameraTouchRef = useRef<{ x: number; y: number } | null>(null)

  // Detect touch capability on mount
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      setIsTouch(hasTouch)
    }
    checkTouch()
    window.addEventListener('resize', checkTouch)
    return () => window.removeEventListener('resize', checkTouch)
  }, [])

  // ── Virtual Joystick Handlers ──
  const handleJoystickStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchIdRef.current !== null) return
    const touch = e.changedTouches[0]
    joystickTouchIdRef.current = touch.identifier

    const rect = joystickContainerRef.current?.getBoundingClientRect()
    if (rect) {
      joystickCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
    }
  }, [])

  const handleJoystickMove = useCallback((e: TouchEvent) => {
    if (joystickTouchIdRef.current === null || !joystickCenterRef.current) return

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === joystickTouchIdRef.current) {
        const dx = touch.clientX - joystickCenterRef.current.x
        const dy = touch.clientY - joystickCenterRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxRadius = 45

        const clampedDist = Math.min(dist, maxRadius)
        const angle = Math.atan2(dy, dx)

        const clampedX = Math.cos(angle) * clampedDist
        const clampedY = Math.sin(angle) * clampedDist

        setStickPos({ x: clampedX, y: clampedY })

        // Deadzone check
        const deadzone = 8
        if (dist > deadzone) {
          const normX = clampedX / maxRadius
          const normY = clampedY / maxRadius

          updateTouchMovement({
            forward: normY < -0.28,
            backward: normY > 0.28,
            left: normX < -0.28,
            right: normX > 0.28,
          })
        } else {
          updateTouchMovement({
            forward: false,
            backward: false,
            left: false,
            right: false,
          })
        }
        break
      }
    }
  }, [])

  const handleJoystickEnd = useCallback((e: TouchEvent) => {
    if (joystickTouchIdRef.current === null) return

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null
        joystickCenterRef.current = null
        setStickPos({ x: 0, y: 0 })
        updateTouchMovement({
          forward: false,
          backward: false,
          left: false,
          right: false,
        })
        break
      }
    }
  }, [])

  // ── Touch Camera Look Handlers ──
  const handleCameraStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (cameraTouchIdRef.current !== null) return
    const touch = e.changedTouches[0]
    cameraTouchIdRef.current = touch.identifier
    lastCameraTouchRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleCameraMove = useCallback((e: TouchEvent) => {
    if (cameraTouchIdRef.current === null || !lastCameraTouchRef.current) return

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === cameraTouchIdRef.current) {
        const deltaX = touch.clientX - lastCameraTouchRef.current.x
        const deltaY = touch.clientY - lastCameraTouchRef.current.y

        lastCameraTouchRef.current = { x: touch.clientX, y: touch.clientY }

        const touchSens = 0.0032
        yawRef.current -= deltaX * touchSens
        pitchRef.current -= deltaY * touchSens

        const maxPitch = Math.PI / 2 - 0.08
        pitchRef.current = Math.max(-maxPitch, Math.min(maxPitch, pitchRef.current))
        break
      }
    }
  }, [pitchRef, yawRef])

  const handleCameraEnd = useCallback((e: TouchEvent) => {
    if (cameraTouchIdRef.current === null) return

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === cameraTouchIdRef.current) {
        cameraTouchIdRef.current = null
        lastCameraTouchRef.current = null
        break
      }
    }
  }, [])

  // Global touchmove / touchend listeners for fluid dragging
  useEffect(() => {
    if (!isTouch) return

    window.addEventListener('touchmove', handleJoystickMove, { passive: false })
    window.addEventListener('touchend', handleJoystickEnd)
    window.addEventListener('touchcancel', handleJoystickEnd)

    window.addEventListener('touchmove', handleCameraMove, { passive: false })
    window.addEventListener('touchend', handleCameraEnd)
    window.addEventListener('touchcancel', handleCameraEnd)

    return () => {
      window.removeEventListener('touchmove', handleJoystickMove)
      window.removeEventListener('touchend', handleJoystickEnd)
      window.removeEventListener('touchcancel', handleJoystickEnd)

      window.removeEventListener('touchmove', handleCameraMove)
      window.removeEventListener('touchend', handleCameraEnd)
      window.removeEventListener('touchcancel', handleCameraEnd)
      resetTouchMovement()
    }
  }, [isTouch, handleJoystickMove, handleJoystickEnd, handleCameraMove, handleCameraEnd])

  const toggleSprint = () => {
    setIsSprinting((prev) => {
      const next = !prev
      updateTouchMovement({ sprint: next })
      return next
    })
  }

  if (!isTouch) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none touch-none">
      {/* ── Virtual Joystick (Bottom Left) ── */}
      <div
        ref={joystickContainerRef}
        onTouchStart={handleJoystickStart}
        className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/20 flex items-center justify-center pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)] active:bg-white/[0.12]"
      >
        {/* Direction indicators */}
        <div className="absolute top-2 text-[9px] font-mono font-bold text-white/30">▲</div>
        <div className="absolute bottom-2 text-[9px] font-mono font-bold text-white/30">▼</div>
        <div className="absolute left-2 text-[9px] font-mono font-bold text-white/30">◀</div>
        <div className="absolute right-2 text-[9px] font-mono font-bold text-white/30">▶</div>

        {/* Thumb Stick */}
        <div
          className="w-14 h-14 rounded-full bg-white/30 border border-white/50 backdrop-blur-lg flex items-center justify-center shadow-lg transition-transform duration-75"
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-white/70" />
        </div>
      </div>

      {/* ── Camera Look Region (Right Side Half) ── */}
      <div
        onTouchStart={handleCameraStart}
        className="absolute top-20 right-0 bottom-36 w-[45vw] pointer-events-auto"
      />

      {/* ── Touch Action Buttons (Bottom Right) ── */}
      <div className="absolute bottom-8 right-8 flex items-end gap-3 pointer-events-auto">
        {/* Sprint Toggle Button */}
        <button
          type="button"
          onClick={toggleSprint}
          className={`h-14 w-14 rounded-full border backdrop-blur-md flex flex-col items-center justify-center transition-all ${
            isSprinting
              ? 'bg-[#e10600] border-white text-white shadow-[0_0_20px_rgba(225,6,0,0.6)]'
              : 'bg-white/10 border-white/20 text-white/70'
          }`}
          title="Toggle Sprint"
        >
          <span className="text-sm">⚡</span>
          <span className="text-[9px] font-mono font-black">RUN</span>
        </button>

        {/* Smart Guide Phone Toggle Button */}
        <button
          type="button"
          onClick={onTogglePhone}
          className={`h-14 w-14 rounded-full border backdrop-blur-md flex flex-col items-center justify-center transition-all ${
            isPhoneOpen
              ? 'bg-[#00d2be] border-white text-black font-bold shadow-[0_0_20px_rgba(0,210,190,0.5)]'
              : 'bg-white/10 border-white/20 text-white/70'
          }`}
          title="Smart Guide"
        >
          <span className="text-sm">📱</span>
          <span className="text-[9px] font-mono font-black">GUIDE</span>
        </button>

        {/* Primary Interact [E] Button */}
        {hasNearbyInteraction && (
          <button
            type="button"
            onClick={onInteract}
            className="h-16 w-16 rounded-full bg-[#e10600] border-2 border-white text-white font-mono font-black text-sm flex flex-col items-center justify-center shadow-[0_0_25px_rgba(225,6,0,0.8)] active:scale-95 transition-all"
            title="Interact"
          >
            <span>[E]</span>
            <span className="text-[9px] font-sans font-bold">ENTER</span>
          </button>
        )}
      </div>
    </div>
  )
}
