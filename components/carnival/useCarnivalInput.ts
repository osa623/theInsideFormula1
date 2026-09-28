'use client'

import { useEffect, useRef } from 'react'

export interface CarnivalMovementInput {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  sprint: boolean
}

// Global touch movement state fed by mobile virtual joystick
const touchInputState: CarnivalMovementInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
}

export function updateTouchMovement(movement: Partial<CarnivalMovementInput>) {
  Object.assign(touchInputState, movement)
}

export function resetTouchMovement() {
  touchInputState.forward = false
  touchInputState.backward = false
  touchInputState.left = false
  touchInputState.right = false
  touchInputState.sprint = false
}

export function useCarnivalInput(disabled: boolean) {
  const keyboardState = useRef<CarnivalMovementInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  })

  const inputRef = useRef<CarnivalMovementInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  })

  // Synchronize combined keyboard + touch inputs
  const syncInputs = () => {
    if (disabled) {
      inputRef.current.forward = false
      inputRef.current.backward = false
      inputRef.current.left = false
      inputRef.current.right = false
      inputRef.current.sprint = false
      return
    }

    inputRef.current.forward = keyboardState.current.forward || touchInputState.forward
    inputRef.current.backward = keyboardState.current.backward || touchInputState.backward
    inputRef.current.left = keyboardState.current.left || touchInputState.left
    inputRef.current.right = keyboardState.current.right || touchInputState.right
    inputRef.current.sprint = keyboardState.current.sprint || touchInputState.sprint
  }

  useEffect(() => {
    if (disabled) {
      keyboardState.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
      }
      resetTouchMovement()
      syncInputs()
    }
  }, [disabled])

  useEffect(() => {
    const setKey = (event: KeyboardEvent, pressed: boolean) => {
      if (disabled) return
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) return

      const key = event.key.toLowerCase()
      const kb = keyboardState.current

      if (key === 'w' || key === 'arrowup') kb.forward = pressed
      if (key === 's' || key === 'arrowdown') kb.backward = pressed
      if (key === 'a' || key === 'arrowleft') kb.left = pressed
      if (key === 'd' || key === 'arrowright') kb.right = pressed
      if (key === 'shift') kb.sprint = pressed

      syncInputs()
    }

    const onKeyDown = (event: KeyboardEvent) => setKey(event, true)
    const onKeyUp = (event: KeyboardEvent) => setKey(event, false)
    const onBlur = () => {
      keyboardState.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
      }
      resetTouchMovement()
      syncInputs()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    // Interval to poll touch input updates
    const pollInterval = window.setInterval(syncInputs, 16)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      window.clearInterval(pollInterval)
    }
  }, [disabled])

  return inputRef
}

