import * as THREE from 'three'

const MAX_RADIUS = 19.5 // Outer boundary
const PLAYER_RADIUS = 0.35

export function useCollision(floorY: number) {
  const clampPlayerPosition = (pos: THREE.Vector3, obstacleBoxes: THREE.Box3[] = []) => {
    // 1. Outer circular boundary clamp
    const distFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
    if (distFromCenter > MAX_RADIUS) {
      const scale = MAX_RADIUS / distFromCenter
      pos.x *= scale
      pos.z *= scale
    }

    // 2. Solid obstacle colliders (Naming_Board.000 to .006, Building_01, Building_02)
    for (const box of obstacleBoxes) {
      if (
        pos.x >= box.min.x - PLAYER_RADIUS &&
        pos.x <= box.max.x + PLAYER_RADIUS &&
        pos.z >= box.min.z - PLAYER_RADIUS &&
        pos.z <= box.max.z + PLAYER_RADIUS
      ) {
        // Push out to the nearest boundary edge
        const dLeft = Math.abs(pos.x - (box.min.x - PLAYER_RADIUS))
        const dRight = Math.abs(pos.x - (box.max.x + PLAYER_RADIUS))
        const dBack = Math.abs(pos.z - (box.min.z - PLAYER_RADIUS))
        const dFront = Math.abs(pos.z - (box.max.z + PLAYER_RADIUS))

        const minD = Math.min(dLeft, dRight, dBack, dFront)
        if (minD === dLeft) pos.x = box.min.x - PLAYER_RADIUS
        else if (minD === dRight) pos.x = box.max.x + PLAYER_RADIUS
        else if (minD === dBack) pos.z = box.min.z - PLAYER_RADIUS
        else if (minD === dFront) pos.z = box.max.z + PLAYER_RADIUS
      }
    }

    // 3. Ground floor level clamp
    if (pos.y < floorY) {
      pos.y = floorY
    }
  }

  return {
    clampPlayerPosition,
    FLOOR_Y: floorY,
  }
}
