'use client'

import { useEffect, useState } from 'react'
import type { InputState } from './types'

const initialInputs: InputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  brake: false,
  reset: false,
}

export function useKeyboardInput(): InputState {
  const [inputs, setInputs] = useState<InputState>(initialInputs)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing inputs if typing in an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

      const key = e.key.toLowerCase()

      if (['w', 'arrowup', 's', 'arrowdown', 'a', 'arrowleft', 'd', 'arrowright', ' ', 'r'].includes(key)) {
        if (key === ' ') e.preventDefault()
      }

      setInputs((prev) => {
        switch (key) {
          case 'w':
          case 'arrowup':
            return { ...prev, forward: true }
          case 's':
          case 'arrowdown':
            return { ...prev, backward: true }
          case 'a':
          case 'arrowleft':
            return { ...prev, left: true }
          case 'd':
          case 'arrowright':
            return { ...prev, right: true }
          case ' ':
            return { ...prev, brake: true }
          case 'r':
            return { ...prev, reset: true }
          default:
            return prev
        }
      })
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      setInputs((prev) => {
        switch (key) {
          case 'w':
          case 'arrowup':
            return { ...prev, forward: false }
          case 's':
          case 'arrowdown':
            return { ...prev, backward: false }
          case 'a':
          case 'arrowleft':
            return { ...prev, left: false }
          case 'd':
          case 'arrowright':
            return { ...prev, right: false }
          case ' ':
            return { ...prev, brake: false }
          case 'r':
            return { ...prev, reset: false }
          default:
            return prev
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return inputs
}
