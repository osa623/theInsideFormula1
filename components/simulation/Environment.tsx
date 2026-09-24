'use client'

import React from 'react'

export default function Environment() {
  return (
    <>
      <color attach="background" args={['#080a0f']} />
      <ambientLight intensity={0.85} color="#e5edff" />
      <directionalLight position={[0, 18, 0]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[12, 10, 15]} intensity={0.6} color="#ffe8d2" />
      <directionalLight position={[-12, 10, -15]} intensity={0.6} color="#d2e8ff" />
      {/* Showroom atmospheric fog */}
      <fog attach="fog" args={['#080a0f', 30, 95]} />
    </>
  )
}
