'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useEnvironment, useGLTF } from '@react-three/drei'

const CarnivalScene = dynamic(() => import('@/components/carnival/CarnivalScene'), {
  ssr: false,
})

function CarnivalAssetWarmup() {
  useEffect(() => {
    useGLTF.preload('/models/formula_Carnival_new-optimized.glb')
    useEnvironment.preload({ files: '/models/autumn_field_puresky.hdr' })
  }, [])

  return null
}

export default function CarnivalPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <CarnivalAssetWarmup />
      <CarnivalScene />
    </main>
  )
}
