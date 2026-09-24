'use client'

import { useEffect, useRef } from 'react'

export interface CarnivalMovementInput {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  sprint: boolean
}

export function useCarnivalInput(disabled: boolean) {
  const inputRef = useRef<CarnivalMovementInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  })

  useEffect(() => {
    if (disabled) {
      inputRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
      }
    }
  }, [disabled])

  useEffect(() => {
    const setKey = (event: KeyboardEvent, pressed: boolean) => {
      if (disabled) return
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) return

      const key = event.key.toLowerCase()
      const input = inputRef.current

      if (key === 'w' || key === 'arrowup') input.forward = pressed
      if (key === 's' || key === 'arrowdown') input.backward = pressed
      if (key === 'a' || key === 'arrowleft') input.left = pressed
      if (key === 'd' || key === 'arrowright') input.right = pressed
      if (key === 'shift') input.sprint = pressed
    }

    const onKeyDown = (event: KeyboardEvent) => setKey(event, true)
    const onKeyUp = (event: KeyboardEvent) => setKey(event, false)
    const onBlur = () => {
      inputRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [disabled])

  return inputRef
}
