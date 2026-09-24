import type * as THREE from 'three'

export type InspectMode = 'inspect' | 'driving'
export type DrivingMode = InspectMode
export type CameraMode = 'chase' | 'far' | 'cockpit' | 'tvpod'

export interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  brake: boolean
  reset: boolean
}

export interface VehicleRefData {
  speed: number
  rotationY: number
  steering: number
  pitch: number
  roll: number
  groundY?: number
}

export interface VehicleContextType {
  mode: InspectMode
  setMode: (mode: InspectMode) => void
  cameraMode: CameraMode
  setCameraMode: (mode: CameraMode) => void
  cycleCameraMode: () => void
  vehicleRef: React.RefObject<THREE.Group | null>
  vehicleData: React.MutableRefObject<VehicleRefData>
  inputs: InputState
  resetVehicle: () => void
}
