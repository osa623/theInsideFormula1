import { useEffect, useRef } from 'react'

export interface MovementInput {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  sprint: boolean
  jump: boolean
}

export function useMovement() {
  const movementRef = useRef<MovementInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
  })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing in text inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return

      const key = e.key.toLowerCase()
      const m = movementRef.current

      switch (key) {
        case 'w':
        case 'arrowup':
          m.forward = true
          break
        case 's':
        case 'arrowdown':
          m.backward = true
          break
        case 'a':
        case 'arrowleft':
          m.left = true
          break
        case 'd':
        case 'arrowright':
          m.right = true
          break
        case 'shift':
          m.sprint = true
          break
        case ' ':
          m.jump = true
          break
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const m = movementRef.current

      switch (key) {
        case 'w':
        case 'arrowup':
          m.forward = false
          break
        case 's':
        case 'arrowdown':
          m.backward = false
          break
        case 'a':
        case 'arrowleft':
          m.left = false
          break
        case 'd':
        case 'arrowright':
          m.right = false
          break
        case 'shift':
          m.sprint = false
          break
        case ' ':
          m.jump = false
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return movementRef
}
