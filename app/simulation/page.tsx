'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

const ExhibitionScene = dynamic(() => import('@/components/simulation/ExhibitionScene'), {
  ssr: false,
})

function SimulationAssetWarmup() {
  useEffect(() => {
    useGLTF.preload('/models/New_Exhibition_Hall_02.glb')
  }, [])

  return null
}

export default function SimulationPage() {
  return (
    <main className="w-screen h-screen bg-black overflow-hidden">
      <SimulationAssetWarmup />
      <ExhibitionScene />
    </main>
  )
}
