'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  CarnivalEntrance,
  CarnivalExplainZone,
  CarnivalMetadata,
  ChampionSection,
  ExamBoard,
  InformationScreenTrigger,
  MapTrigger,
  GameStationTrigger,
} from './types'
import { useCarnivalInput } from './useCarnivalInput'

interface CarnivalPlayerProps {
  metadata: CarnivalMetadata | null
  disabled: boolean
  isLocked: boolean
  isExamMode?: boolean
  activeCinematicTarget?: { cameraPosition: THREE.Vector3; lookAtPosition: THREE.Vector3 } | null
  teleportTarget?: { position: THREE.Vector3; yaw?: number; pitch?: number } | null
  yawRef: React.MutableRefObject<number>
  pitchRef: React.MutableRefObject<number>
  onNearbyEntranceChange: (entrance: CarnivalEntrance | null) => void
  onNearbyExplainZoneChange: (zone: CarnivalExplainZone | null) => void
  onNearbyExamChange?: (nearby: boolean) => void
  onNearbyChampionSectionChange?: (section: ChampionSection | null) => void
  onNearbyExamBoardChange?: (board: ExamBoard | null) => void
  onNearbyFormulaCarEntranceChange?: (nearby: boolean) => void
  onNearbyMonitorChange?: (nearby: boolean) => void
  onNearbyAboutChange?: (nearby: boolean) => void
  onNearbyInfoScreenChange?: (trigger: InformationScreenTrigger | null) => void
  onNearbyMapChange?: (mapTrigger: MapTrigger | null) => void
  onNearbyGameStationChange?: (station: GameStationTrigger | null) => void
}

const EYE_HEIGHT = 3.0
const PLAYER_RADIUS = 1.42
const WALK_SPEED = 4.85
const SPRINT_SPEED = 9.85
const INTERACTION_RADIUS = 4.25
const BREATH_FREQ = 1.15
const BREATH_AMP_Y = 0.026
const BREATH_AMP_X = 0.006
const BREATH_PITCH_AMP = 0.0045
const BREATH_ROLL_AMP = 0.0035
const WALK_BOB_FREQ = 7.2
const SPRINT_BOB_FREQ = 8.4
const WALK_BOB_AMP_Y = 0.026
const SPRINT_BOB_AMP_Y = 0.034
const WALK_BOB_AMP_X = 0.01
const SPRINT_BOB_AMP_X = 0.013

const raycaster = new THREE.Raycaster()
const rayOrigin = new THREE.Vector3()
const rayDirection = new THREE.Vector3(0, -1, 0)
const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const desired = new THREE.Vector3()
const nextPosition = new THREE.Vector3()
const temp = new THREE.Vector3()
const triggerPadding = new THREE.Vector3(0.45, 0, 0.45)
const targetLookAt = new THREE.Vector3()
const currentLookAt = new THREE.Vector3()
const targetCamPos = new THREE.Vector3()

const hitsTarget: THREE.Intersection[] = []

function positionOnWalkable(pos: THREE.Vector3, metadata: CarnivalMetadata) {
  if (metadata.walkableMeshes.length === 0) return pos.y

  // Raycast from slightly above current position to prevent snapping to roofs
  const startY = pos.y < 0.5 ? pos.y + 20 : pos.y + 1.8
  rayOrigin.set(pos.x, startY, pos.z)
  raycaster.set(rayOrigin, rayDirection)

  hitsTarget.length = 0
  raycaster.intersectObjects(metadata.walkableMeshes, false, hitsTarget)
  if (hitsTarget.length > 0) {
    const maxFloorY = pos.y < 0.5 ? 5 : pos.y + 1.2
    for (let i = 0; i < hitsTarget.length; i++) {
      const hy = hitsTarget[i].point.y
      if (hy <= maxFloorY && hy >= -15) {
        return hy + EYE_HEIGHT
      }
    }
    return hitsTarget[hitsTarget.length - 1].point.y + EYE_HEIGHT
  }

  const insideBox = metadata.walkableBoxes.some((box) => {
    return (
      pos.x >= box.min.x - 1.5 &&
      pos.x <= box.max.x + 1.5 &&
      pos.z >= box.min.z - 1.5 &&
      pos.z <= box.max.z + 1.5
    )
  })

  if (insideBox) return pos.y
  if (pos.z > 70 && pos.z < 170 && pos.x > -90 && pos.x < 90) return pos.y
  return null
}

function solveObstacleCollision(pos: THREE.Vector3, previous: THREE.Vector3, metadata: CarnivalMetadata) {
  const feetY = pos.y - EYE_HEIGHT
  const headY = pos.y
  const racingGateOpen = metadata.isGateOpen?.('racingarea') ?? false
  const openAreaGateOpen = metadata.isGateOpen?.('openarea') ?? false
  const simGateOpen = metadata.isGateOpen?.('simulation') ?? false

  for (const box of metadata.obstacleBoxes) {
    if (box.max.y < feetY + 0.1 || box.min.y > headY) continue
    if (pos.x < box.min.x - PLAYER_RADIUS || pos.x > box.max.x + PLAYER_RADIUS) continue
    if (pos.z < box.min.z - PLAYER_RADIUS || pos.z > box.max.z + PLAYER_RADIUS) continue

    // If racing area gate is open, bypass any obstacle in the gate doorway opening
    if (racingGateOpen) {
      const inRacingGateX = pos.x >= -12.0 && pos.x <= 4.0
      const inRacingGateZ = pos.z >= 86.0 && pos.z <= 106.0
      const boxInRacingGate = box.min.x >= -16.0 && box.max.x <= 6.0 && box.min.z >= 84.0 && box.max.z <= 108.0
      if (inRacingGateX && inRacingGateZ && boxInRacingGate) {
        continue
      }
    }

    // If open area gate is open, bypass any obstacle in the open area gate doorway opening
    if (openAreaGateOpen) {
      const inOpenGateX = pos.x >= -8.0 && pos.x <= 8.0
      const inOpenGateZ = pos.z >= 70.0 && pos.z <= 86.0
      const boxInOpenGate = box.min.x >= -10.0 && box.max.x <= 10.0 && box.min.z >= 68.0 && box.max.z <= 88.0
      if (inOpenGateX && inOpenGateZ && boxInOpenGate) {
        continue
      }
    }

    // If simulation gate is open, bypass any obstacle in the simulation gate doorway opening
    if (simGateOpen) {
      const inSimGateX = pos.x >= -55.0 && pos.x <= -15.0
      const inSimGateZ = pos.z >= 75.0 && pos.z <= 115.0
      const boxInSimGate = box.min.x >= -60.0 && box.max.x <= -10.0 && box.min.z >= 70.0 && box.max.z <= 120.0
      if (inSimGateX && inSimGateZ && boxInSimGate) {
        continue
      }
    }

    // If formula car entrance is unlocked, bypass any obstacle in the formula_car_entrance_stopp corridor
    if (metadata.isFormulaCarUnlocked?.()) {
      const inFormulaCarZoneX = pos.x >= 54.0 && pos.x <= 68.0
      const inFormulaCarZoneZ = pos.z >= 124.0 && pos.z <= 138.0
      const boxInFormulaCar = box.min.x >= 52.0 && box.max.x <= 70.0 && box.min.z >= 122.0 && box.max.z <= 140.0
      if (inFormulaCarZoneX && inFormulaCarZoneZ && boxInFormulaCar) {
        continue
      }
    }

    // Racing_Champion_Section_path: player must remain completely free to walk along the path
    const inRacingPathCorridor = pos.x >= -67.0 && pos.x <= 4.5 && pos.z >= 128.0 && pos.z <= 165.0
    if (inRacingPathCorridor) {
      const boxIntersectsPathFloor =
        box.min.x < 4.5 && box.max.x > -67.0 &&
        box.min.z < 165.0 && box.max.z > 128.0 &&
        box.min.y <= 1.2
      if (boxIntersectsPathFloor && (box.max.y - box.min.y < 3.0 || box.min.x <= -48.0 && box.max.x >= -53.0)) {
        continue
      }
    }

    const fromMinZ = previous.z <= box.min.z - PLAYER_RADIUS + 0.1
    const fromMaxZ = previous.z >= box.max.z + PLAYER_RADIUS - 0.1
    const fromMinX = previous.x <= box.min.x - PLAYER_RADIUS + 0.1
    const fromMaxX = previous.x >= box.max.x + PLAYER_RADIUS - 0.1

    if (fromMinZ && !fromMinX && !fromMaxX) {
      pos.z = box.min.z - PLAYER_RADIUS
    } else if (fromMaxZ && !fromMinX && !fromMaxX) {
      pos.z = box.max.z + PLAYER_RADIUS
    } else if (fromMinX && !fromMinZ && !fromMaxZ) {
      pos.x = box.min.x - PLAYER_RADIUS
    } else if (fromMaxX && !fromMinZ && !fromMaxZ) {
      pos.x = box.max.x + PLAYER_RADIUS
    } else {
      const pushLeft = Math.abs(pos.x - (box.min.x - PLAYER_RADIUS))
      const pushRight = Math.abs((box.max.x + PLAYER_RADIUS) - pos.x)
      const pushBack = Math.abs(pos.z - (box.min.z - PLAYER_RADIUS))
      const pushForward = Math.abs((box.max.z + PLAYER_RADIUS) - pos.z)
      const minPush = Math.min(pushLeft, pushRight, pushBack, pushForward)

      if (minPush === pushLeft) pos.x = box.min.x - PLAYER_RADIUS
      else if (minPush === pushRight) pos.x = box.max.x + PLAYER_RADIUS
      else if (minPush === pushBack) pos.z = box.min.z - PLAYER_RADIUS
      else pos.z = box.max.z + PLAYER_RADIUS
    }

    if (Math.abs(pos.x - previous.x) > 1.6 || Math.abs(pos.z - previous.z) > 1.6) {
      pos.copy(previous)
    }
  }
}

export default function CarnivalPlayer({
  metadata,
  disabled,
  isLocked,
  isExamMode = false,
  activeCinematicTarget = null,
  yawRef,
  pitchRef,
  onNearbyEntranceChange,
  onNearbyExplainZoneChange,
  onNearbyExamChange,
  onNearbyChampionSectionChange,
  onNearbyExamBoardChange,
  onNearbyFormulaCarEntranceChange,
  onNearbyMonitorChange,
  onNearbyAboutChange,
  onNearbyInfoScreenChange,
  onNearbyMapChange,
  onNearbyGameStationChange,
  teleportTarget,
}: CarnivalPlayerProps) {
  const { camera } = useThree()
  const inputRef = useCarnivalInput(disabled || isExamMode)
  const playerPosition = useRef(new THREE.Vector3(0, EYE_HEIGHT, 0))
  const velocity = useRef(new THREE.Vector3())
  const lastEntranceId = useRef<string | null>(null)
  const lastExplainZoneId = useRef<string | null>(null)
  const lastInfoScreenId = useRef<string | null>(null)
  const lastMapNearby = useRef<boolean>(false)
  const lastGameStationId = useRef<string | null>(null)
  const lastExamNearby = useRef<boolean>(false)
  const lastMonitorNearby = useRef<boolean>(false)
  const lastFormulaCarNearby = useRef<boolean>(false)
  const lastAboutNearby = useRef<boolean>(false)
  const lastChampionYear = useRef<number | null>(null)
  const lastBoardNum = useRef<number | null>(null)
  const checkTimer = useRef(0)
  const bobTimer = useRef(0)

  useEffect(() => {
    if (!teleportTarget) return
    playerPosition.current.copy(teleportTarget.position)
    velocity.current.set(0, 0, 0)
    if (teleportTarget.yaw !== undefined) {
      yawRef.current = teleportTarget.yaw
    }
    if (teleportTarget.pitch !== undefined) {
      pitchRef.current = teleportTarget.pitch
    }
    camera.position.copy(playerPosition.current)
    camera.rotation.set(0, yawRef.current, 0, 'YXZ')
  }, [teleportTarget, camera, pitchRef, yawRef])

  useEffect(() => {
    if (!metadata) return

    const spawn = metadata.spawnPosition.clone()
    const snappedEyeY = positionOnWalkable(spawn, metadata)
    spawn.y = snappedEyeY ?? (spawn.y > 0.75 ? spawn.y : spawn.y + EYE_HEIGHT)

    playerPosition.current.copy(spawn)
    velocity.current.set(0, 0, 0)
    bobTimer.current = 0
    lastEntranceId.current = null
    lastExplainZoneId.current = null
    lastMapNearby.current = false
    lastGameStationId.current = null
    lastExamNearby.current = false
    lastAboutNearby.current = false
    lastChampionYear.current = null
    lastBoardNum.current = null

    const euler = new THREE.Euler().setFromQuaternion(metadata.spawnQuaternion, 'YXZ')
    yawRef.current = euler.y
    pitchRef.current = 0
    camera.position.copy(playerPosition.current)
    camera.rotation.set(0, yawRef.current, 0, 'YXZ')
  }, [camera, metadata, pitchRef, yawRef])

  useFrame((_, delta) => {
    if (!metadata) return

    const dt = Math.min(delta, 0.05)
    const input = inputRef.current
    const moving = !disabled && !isExamMode && (input.forward || input.backward || input.left || input.right)
    const speed = input.sprint ? SPRINT_SPEED : WALK_SPEED

    forward.set(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current)).normalize()
    right.set(Math.cos(yawRef.current), 0, -Math.sin(yawRef.current)).normalize()
    desired.set(0, 0, 0)

    if (!disabled && !isExamMode) {
      if (input.forward) desired.add(forward)
      if (input.backward) desired.sub(forward)
      if (input.right) desired.add(right)
      if (input.left) desired.sub(right)
    }

    if (desired.lengthSq() > 0) desired.normalize().multiplyScalar(speed)

    velocity.current.x = THREE.MathUtils.damp(velocity.current.x, desired.x, 12, dt)
    velocity.current.z = THREE.MathUtils.damp(velocity.current.z, desired.z, 12, dt)

    nextPosition.copy(playerPosition.current)
    nextPosition.x += velocity.current.x * dt
    nextPosition.z += velocity.current.z * dt

    const walkableY = positionOnWalkable(nextPosition, metadata)
    if (walkableY !== null) {
      temp.copy(playerPosition.current)
      nextPosition.y = THREE.MathUtils.damp(nextPosition.y, walkableY, 18, dt)
      solveObstacleCollision(nextPosition, temp, metadata)
      playerPosition.current.copy(nextPosition)
    } else {
      velocity.current.multiplyScalar(0.15)
    }

    const flatSpeed = Math.hypot(velocity.current.x, velocity.current.z)
    const isActuallyMoving = moving && flatSpeed > 0.12
    const bobFrequency = input.sprint ? SPRINT_BOB_FREQ : WALK_BOB_FREQ
    const bobAmpY = input.sprint ? SPRINT_BOB_AMP_Y : WALK_BOB_AMP_Y
    const bobAmpX = input.sprint ? SPRINT_BOB_AMP_X : WALK_BOB_AMP_X

    bobTimer.current += dt * (isActuallyMoving ? bobFrequency : BREATH_FREQ)
    const bobY = isActuallyMoving
      ? Math.sin(bobTimer.current * 2) * bobAmpY
      : Math.sin(bobTimer.current) * BREATH_AMP_Y
    const bobX = isActuallyMoving
      ? Math.cos(bobTimer.current) * bobAmpX
      : Math.cos(bobTimer.current * 0.55) * BREATH_AMP_X
    const breathPitch = isActuallyMoving
      ? 0
      : Math.sin(bobTimer.current * 0.72) * BREATH_PITCH_AMP
    const breathRoll = isActuallyMoving
      ? 0
      : Math.cos(bobTimer.current * 0.5) * BREATH_ROLL_AMP

    // Check triggers on interval
    checkTimer.current += dt
    if (checkTimer.current > 0.12) {
      checkTimer.current = 0
      let nearestEntrance: CarnivalEntrance | null = null
      let nearestEntranceDistance = Infinity

      const px = playerPosition.current.x
      const pz = playerPosition.current.z

      for (const entrance of metadata.entrances) {
        const tb = entrance.triggerBox
        const insideTrigger =
          px >= tb.min.x - 0.45 &&
          px <= tb.max.x + 0.45 &&
          pz >= tb.min.z - 0.45 &&
          pz <= tb.max.z + 0.45
        const dx = px - entrance.position.x
        const dz = pz - entrance.position.z
        const distance = Math.hypot(dx, dz)
        if ((insideTrigger || distance < INTERACTION_RADIUS) && distance < nearestEntranceDistance) {
          nearestEntrance = entrance
          nearestEntranceDistance = distance
        }
      }

      const nextEntranceId = nearestEntrance?.id ?? null
      if (nextEntranceId !== lastEntranceId.current) {
        lastEntranceId.current = nextEntranceId
        onNearbyEntranceChange(nearestEntrance)
      }

      let nearestExplainZone: CarnivalExplainZone | null = null
      let nearestExplainDistance = Infinity

      if (metadata.explainZones) {
        for (const zone of metadata.explainZones) {
          const tb = zone.triggerBox
          const insideTrigger =
            px >= tb.min.x - 0.45 &&
            px <= tb.max.x + 0.45 &&
            pz >= tb.min.z - 0.45 &&
            pz <= tb.max.z + 0.45
          const dx = px - zone.position.x
          const dz = pz - zone.position.z
          const distance = Math.hypot(dx, dz)
          if ((insideTrigger || distance < INTERACTION_RADIUS) && distance < nearestExplainDistance) {
            nearestExplainZone = zone
            nearestExplainDistance = distance
          }
        }
      }

      const nextExplainId = nearestExplainZone?.id ?? null
      if (nextExplainId !== lastExplainZoneId.current) {
        lastExplainZoneId.current = nextExplainId
        onNearbyExplainZoneChange(nearestExplainZone)
      }

      // Check Information Screen Triggers (Symmbol.001 - Symmbol.004)
      let nearestInfoScreen: InformationScreenTrigger | null = null
      let nearestInfoDistance = Infinity

      if (metadata.infoScreenTriggers) {
        for (const trig of metadata.infoScreenTriggers) {
          const tb = trig.triggerBox
          const insideTrigger =
            px >= tb.min.x - 0.5 &&
            px <= tb.max.x + 0.5 &&
            pz >= tb.min.z - 0.5 &&
            pz <= tb.max.z + 0.5
          const dx = px - trig.position.x
          const dz = pz - trig.position.z
          const distance = Math.hypot(dx, dz)
          if ((insideTrigger || distance < INTERACTION_RADIUS) && distance < nearestInfoDistance) {
            nearestInfoScreen = trig
            nearestInfoDistance = distance
          }
        }
      }

      const nextInfoId = nearestInfoScreen?.id ?? null
      if (nextInfoId !== lastInfoScreenId.current) {
        lastInfoScreenId.current = nextInfoId
        onNearbyInfoScreenChange?.(nearestInfoScreen)
      }

      // Check Map Trigger (Map_Enter)
      let mapNearby = false
      if (metadata.mapTrigger) {
        const tb = metadata.mapTrigger.triggerBox
        const inside =
          px >= tb.min.x - 0.45 &&
          px <= tb.max.x + 0.45 &&
          pz >= tb.min.z - 0.45 &&
          pz <= tb.max.z + 0.45
        const dx = px - metadata.mapTrigger.position.x
        const dz = pz - metadata.mapTrigger.position.z
        const dist = Math.hypot(dx, dz)
        if (inside || dist < INTERACTION_RADIUS) {
          mapNearby = true
        }
      }

      if (mapNearby !== lastMapNearby.current) {
        lastMapNearby.current = mapNearby
        onNearbyMapChange?.(mapNearby ? metadata.mapTrigger ?? null : null)
      }

      // Check Arcade Game Stations (Board 7 and Board 8)
      let nearestStation: GameStationTrigger | null = null
      let nearestStationDist = Infinity

      if (metadata.gameStations) {
        for (const station of metadata.gameStations) {
          const tb = station.triggerBox
          const inside =
            px >= tb.min.x - 0.45 &&
            px <= tb.max.x + 0.45 &&
            pz >= tb.min.z - 0.45 &&
            pz <= tb.max.z + 0.45
          const dx = px - station.position.x
          const dz = pz - station.position.z
          const dist = Math.hypot(dx, dz)
          if ((inside || dist < INTERACTION_RADIUS) && dist < nearestStationDist) {
            nearestStation = station
            nearestStationDist = dist
          }
        }
      }

      const nextStationId = nearestStation?.stationId ?? null
      if (nextStationId !== lastGameStationId.current) {
        lastGameStationId.current = nextStationId
        onNearbyGameStationChange?.(nearestStation)
      }

      // Check Exam Trigger
      let examNearby = false
      if (metadata.examTrigger) {
        const tb = metadata.examTrigger.triggerBox
        const inside =
          px >= tb.min.x - 0.45 &&
          px <= tb.max.x + 0.45 &&
          pz >= tb.min.z - 0.45 &&
          pz <= tb.max.z + 0.45
        const dx = px - metadata.examTrigger.position.x
        const dz = pz - metadata.examTrigger.position.z
        const dist = Math.hypot(dx, dz)
        if (inside || dist < 4.8) {
          examNearby = true
        }
      }

      if (examNearby !== lastExamNearby.current) {
        lastExamNearby.current = examNearby
        onNearbyExamChange?.(examNearby)
      }

      // Check Monitor Screen Proximity (Computer_Screen / Cube_Screen_0.001)
      let monitorNearby = false
      const targetScreen = metadata.screens?.computer || metadata.screens?.monitor
      if (targetScreen) {
        const dx = px - targetScreen.position.x
        const dz = pz - targetScreen.position.z
        const dist = Math.hypot(dx, dz)
        if (dist < 4.5) {
          monitorNearby = true
        }
      }

      if (monitorNearby !== lastMonitorNearby.current) {
        lastMonitorNearby.current = monitorNearby
        onNearbyMonitorChange?.(monitorNearby)
      }

      // Check Formula Car Trigger (Exam_board_prev6.001)
      let formulaCarNearby = false
      if (metadata.formulaCarTrigger && !metadata.isFormulaCarUnlocked?.()) {
        const box = metadata.formulaCarTrigger.triggerBox
        const inside =
          playerPosition.current.x >= box.min.x &&
          playerPosition.current.x <= box.max.x &&
          playerPosition.current.z >= box.min.z &&
          playerPosition.current.z <= box.max.z
        const dx = playerPosition.current.x - metadata.formulaCarTrigger.position.x
        const dz = playerPosition.current.z - metadata.formulaCarTrigger.position.z
        const dist = Math.hypot(dx, dz)
        if (inside || dist < 4.8) {
          formulaCarNearby = true
        }
      }

      if (formulaCarNearby !== lastFormulaCarNearby.current) {
        lastFormulaCarNearby.current = formulaCarNearby
        onNearbyFormulaCarEntranceChange?.(formulaCarNearby)
      }

      // Check About Section Trigger (Developer Dossier)
      let aboutNearby = false
      if (metadata.aboutTrigger && !isExamMode) {
        const box = metadata.aboutTrigger.triggerBox
        const inside =
          playerPosition.current.x >= box.min.x &&
          playerPosition.current.x <= box.max.x &&
          playerPosition.current.z >= box.min.z &&
          playerPosition.current.z <= box.max.z
        const dx = playerPosition.current.x - metadata.aboutTrigger.position.x
        const dz = playerPosition.current.z - metadata.aboutTrigger.position.z
        const dist = Math.hypot(dx, dz)
        if (inside || dist < 4.2) {
          aboutNearby = true
        }
      }

      if (aboutNearby !== lastAboutNearby.current) {
        lastAboutNearby.current = aboutNearby
        onNearbyAboutChange?.(aboutNearby)
      }

      // Check Champion Sections
      let nearbyChamp: ChampionSection | null = null
      if (metadata.championSections && !isExamMode) {
        let nearestChampDist = Infinity
        for (const champ of metadata.championSections) {
          const box = champ.triggerBox
          const inside =
            playerPosition.current.x >= box.min.x &&
            playerPosition.current.x <= box.max.x &&
            playerPosition.current.z >= box.min.z &&
            playerPosition.current.z <= box.max.z
          const dx = playerPosition.current.x - champ.position.x
          const dz = playerPosition.current.z - champ.position.z
          const dist = Math.hypot(dx, dz)
          if ((inside || dist < 5.0) && dist < nearestChampDist) {
            nearbyChamp = champ
            nearestChampDist = dist
          }
        }
      }

      const nextChampYear = nearbyChamp?.year ?? null
      if (nextChampYear !== lastChampionYear.current) {
        lastChampionYear.current = nextChampYear
        onNearbyChampionSectionChange?.(nearbyChamp)
      }

      // Check Exam Boards
      let nearbyBoard: ExamBoard | null = null
      if (metadata.examBoards && !isExamMode) {
        let nearestBoardDist = Infinity
        for (const board of metadata.examBoards) {
          const box = board.triggerBox
          const inside =
            playerPosition.current.x >= box.min.x &&
            playerPosition.current.x <= box.max.x &&
            playerPosition.current.z >= box.min.z &&
            playerPosition.current.z <= box.max.z
          const dx = playerPosition.current.x - board.position.x
          const dz = playerPosition.current.z - board.position.z
          const dist = Math.hypot(dx, dz)
          if ((inside || dist < 4.5) && dist < nearestBoardDist) {
            nearbyBoard = board
            nearestBoardDist = dist
          }
        }
      }

      const nextBoardNum = nearbyBoard?.number ?? null
      if (nextBoardNum !== lastBoardNum.current) {
        lastBoardNum.current = nextBoardNum
        onNearbyExamBoardChange?.(nearbyBoard)
      }
    }

    // Camera handling
    const defaultCamX = playerPosition.current.x + bobX
    const defaultCamY = playerPosition.current.y + bobY
    const defaultCamZ = playerPosition.current.z

    if (isExamMode) {
      // Smoothly transition camera to look at computer monitor screen
      const monitor = metadata.screens?.monitor
      const screenCamPos = monitor?.cameraPosition || metadata.examTrigger?.screenCameraPosition
      const screenPos = monitor?.lookAtPosition || metadata.examTrigger?.screenPosition

      if (screenCamPos && screenPos) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, screenCamPos.x, 6, dt)
        camera.position.y = THREE.MathUtils.damp(camera.position.y, screenCamPos.y, 6, dt)
        camera.position.z = THREE.MathUtils.damp(camera.position.z, screenCamPos.z, 6, dt)

        targetLookAt.copy(screenPos)
        currentLookAt.lerp(targetLookAt, Math.min(dt * 8, 1))
        camera.lookAt(currentLookAt)
        return
      }
    }

    if (activeCinematicTarget) {
      // Smoothly move camera toward cinematic exhibition target
      const targetPos = activeCinematicTarget.cameraPosition
      const lookPos = activeCinematicTarget.lookAtPosition

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.x, 5.5, dt)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.y, 5.5, dt)
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.z, 5.5, dt)

      targetLookAt.copy(lookPos)
      currentLookAt.lerp(targetLookAt, Math.min(dt * 7, 1))
      camera.lookAt(currentLookAt)
      return
    }

    // Normal First-person Camera
    targetCamPos.set(defaultCamX, defaultCamY, defaultCamZ)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, defaultCamX, 14, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, defaultCamY, 14, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, defaultCamZ, 14, dt)

    camera.rotation.set(pitchRef.current + breathPitch, yawRef.current, breathRoll, 'YXZ')
  })

  return null
}
