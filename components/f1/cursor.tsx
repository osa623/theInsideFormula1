'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const trailX = useSpring(x, { stiffness: 120, damping: 18, mass: 0.6 })
  const trailY = useSpring(y, { stiffness: 120, damping: 18, mass: 0.6 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
    document.body.classList.add('custom-cursor-active')

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const target = e.target as HTMLElement
      setHovering(!!target.closest('a, button, [data-cursor="hover"]'))
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.body.classList.remove('custom-cursor-active')
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <>
      {/* Glowing trail */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[110] rounded-full"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          width: hovering ? 56 : 36,
          height: hovering ? 56 : 36,
          background: 'radial-gradient(circle, oklch(0.58 0.235 28 / 35%) 0%, transparent 70%)',
          transition: 'width 0.25s ease, height 0.25s ease',
        }}
      />
      {/* Dot */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[111] rounded-full bg-primary"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          width: hovering ? 10 : 6,
          height: hovering ? 10 : 6,
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
      />
    </>
  )
}
