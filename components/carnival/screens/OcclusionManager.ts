import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ScreenAnchor } from '../types'

export interface OcclusionCheckResult {
  inFrustum: boolean
  isFacing: boolean
  inRange: boolean
  isOccluded: boolean
  isVisible: boolean
  distance: number
}

export class ScreenOcclusionTester {
  private raycaster = new THREE.Raycaster()
  private frustum = new THREE.Frustum()
  private projScreenMatrix = new THREE.Matrix4()

  private scratchCenter = new THREE.Vector3()
  private scratchCorner = new THREE.Vector3()
  private scratchDir = new THREE.Vector3()
  private toCamera = new THREE.Vector3()

  // 5 sample points: center, top-left, top-right, bottom-left, bottom-right
  public getSamplePoints(anchor: ScreenAnchor): THREE.Vector3[] {
    const { position, rotation, dimensions } = anchor
    const w = (dimensions?.width || 2.0) * 0.45
    const h = (dimensions?.height || 1.5) * 0.45

    const normal = new THREE.Vector3(0, 0, 1).applyEuler(rotation).normalize()
    const up = new THREE.Vector3(0, 1, 0).applyEuler(rotation).normalize()
    const right = new THREE.Vector3().crossVectors(up, normal).normalize()

    const center = position.clone()
    const pTL = center.clone().addScaledVector(right, -w).addScaledVector(up, h)
    const pTR = center.clone().addScaledVector(right, w).addScaledVector(up, h)
    const pBL = center.clone().addScaledVector(right, -w).addScaledVector(up, -h)
    const pBR = center.clone().addScaledVector(right, w).addScaledVector(up, -h)

    return [center, pTL, pTR, pBL, pBR]
  }

  public testVisibility(
    camera: THREE.Camera,
    anchor: ScreenAnchor,
    occluders: THREE.Object3D[],
    maxDistance: number
  ): OcclusionCheckResult {
    const screenPos = anchor.position
    const camPos = camera.position
    const dist = camPos.distanceTo(screenPos)

    // 1. Distance test
    const inRange = dist <= maxDistance
    if (!inRange) {
      return { inFrustum: false, isFacing: false, inRange: false, isOccluded: true, isVisible: false, distance: dist }
    }

    // 2. Facing direction test (Backface culling)
    const normal = new THREE.Vector3(0, 0, 1).applyEuler(anchor.rotation).normalize()
    this.toCamera.subVectors(camPos, screenPos).normalize()
    const isFacing = this.toCamera.dot(normal) > 0.05
    if (!isFacing) {
      return { inFrustum: false, isFacing: false, inRange: true, isOccluded: true, isVisible: false, distance: dist }
    }

    // 3. Frustum test
    this.projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix)
    const inFrustum = this.frustum.containsPoint(screenPos)
    if (!inFrustum) {
      return { inFrustum: false, isFacing: true, inRange: true, isOccluded: true, isVisible: false, distance: dist }
    }

    // 4. Occlusion raycast test (5 points)
    if (!occluders || occluders.length === 0) {
      return { inFrustum: true, isFacing: true, inRange: true, isOccluded: false, isVisible: true, distance: dist }
    }

    const points = this.getSamplePoints(anchor)
    let visiblePoints = 0

    for (let i = 0; i < points.length; i++) {
      const pt = points[i]
      this.scratchDir.subVectors(pt, camPos)
      const targetDist = this.scratchDir.length()
      this.scratchDir.normalize()

      this.raycaster.set(camPos, this.scratchDir)
      this.raycaster.far = targetDist - 0.2 // Stop just short of the screen

      const hits = this.raycaster.intersectObjects(occluders, false)
      if (hits.length === 0) {
        visiblePoints++
      }
    }

    // Visible if at least 2 of the 5 sample points can be seen
    const isOccluded = visiblePoints < 2
    return {
      inFrustum: true,
      isFacing: true,
      inRange: true,
      isOccluded,
      isVisible: !isOccluded,
      distance: dist,
    }
  }
}

const tester = new ScreenOcclusionTester()

/**
 * React hook that tests screen visibility at 8 Hz with 150ms hysteresis debouncing.
 */
export function useScreenVisibility(
  anchor: ScreenAnchor | undefined,
  occluders: THREE.Object3D[] | undefined,
  maxDistance = 45.0,
  forceVisible = false
): boolean {
  const [isVisible, setIsVisible] = useState(forceVisible)
  const lastCheckTime = useRef(0)
  const pendingState = useRef<boolean>(forceVisible)
  const pendingSince = useRef<number>(0)

  useEffect(() => {
    if (forceVisible) setIsVisible(true)
  }, [forceVisible])

  useFrame(({ camera, clock }) => {
    if (forceVisible || !anchor) {
      if (!isVisible) setIsVisible(true)
      return
    }

    const now = clock.getElapsedTime() * 1000

    // Check at 8 Hz (every 125ms)
    if (now - lastCheckTime.current >= 125) {
      lastCheckTime.current = now

      const result = tester.testVisibility(camera, anchor, occluders || [], maxDistance)
      const nextRaw = result.isVisible

      if (nextRaw !== pendingState.current) {
        pendingState.current = nextRaw
        pendingSince.current = now
      } else {
        // Hysteresis: require stable state for 150ms before changing DOM visibility
        if (now - pendingSince.current >= 150 && isVisible !== nextRaw) {
          setIsVisible(nextRaw)
        }
      }
    }
  })

  return isVisible
}
