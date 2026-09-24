'use client'

import { CarPlaceholder } from './types/simulation'

interface CarSpawnerProps {
  placeholders: CarPlaceholder[]
}

// Car models are pre-integrated into New_Exhibition_Hall.glb.
// No dynamic car models are spawned — this eliminates cloning overhead and VRAM usage.
export default function CarSpawner({ placeholders }: CarSpawnerProps) {
  return null
}
