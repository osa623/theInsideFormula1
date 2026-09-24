'use client'

import React from 'react'
import { CarPlaceholder } from './types/simulation'

interface LightingProps {
  placeholders: CarPlaceholder[]
}

export default function Lighting({ placeholders }: LightingProps) {
  return (
    <>
      {/* Soft Ambient Fill Light */}
      <ambientLight intensity={0.15} />


      <hemisphereLight args={['#ffffff', '#1f2937', 0.20]} />

      {/* Broad white point fill for readable car bodies */}
      <pointLight
        position={[0, 5.5, 6]}
        intensity={10}
        color="#ffffff"
        distance={34}
        decay={1.6}
      />
      <pointLight
        position={[0, 4, -10]}
        intensity={14}
        color="#ffffff"
        distance={28}
        decay={1.7}
      />

      {/* Showroom Spotlights aimed down at each Car Slot Platform */}
      {placeholders.map((ph) => (
        <React.Fragment key={ph.id}>
          <spotLight
            position={[ph.position.x, ph.position.y + 5.5, ph.position.z]}
            target-position={[ph.position.x, ph.position.y + 0.5, ph.position.z]}
            intensity={2.5}
            color="#ffffff"
            angle={0.65}
            penumbra={0.8}
          />
          {/* White local point light for car body highlights */}
          <pointLight
            position={[ph.position.x + 2, ph.position.y + 2, ph.position.z + 2]}
            intensity={2.5}
            color="#ffffff"
            distance={10}
            decay={1.8}
          />
        </React.Fragment>
      ))}
    </>
  )
}
