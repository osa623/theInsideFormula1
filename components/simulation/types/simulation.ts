import type * as THREE from 'three'

export interface CarPlaceholder {
  id: string
  name: string
  year: string
  position: THREE.Vector3
  rotation: THREE.Euler
  quaternion: THREE.Quaternion
  scale: THREE.Vector3
}

export interface CarSpec {
  year: string
  manufacturer: string
  model: string
  season: string
  powerUnit: string
  horsepower: string
  weight: string
  fuel: string
  hybridSystem: string
  transmission: string
  topSpeed: string
  downforce: string
  brakeSystem: string
  tyres: string
  suspension: string
  description: string
  technicalOverview: string[]
}

export interface InteractionState {
  nearCar: CarPlaceholder | null
  inspectedCar: CarPlaceholder | null
  isInspecting: boolean
}
