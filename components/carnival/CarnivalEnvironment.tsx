'use client'

import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { useRef } from 'react'
import * as THREE from 'three'
import {
  CarnivalDestinationId,
  CarnivalEntrance,
  CarnivalExplainZone,
  CarnivalGateId,
  CarnivalMetadata,
  ChampionSection,
  ExamBoard,
  ExamTrigger,
  ExplainZoneId,
  ScreenAnchor,
  AboutSectionTrigger,
  InformationScreenTrigger,
  MapTrigger,
  GameStationTrigger,
} from './types'

interface CarnivalEnvironmentProps {
  onReady: (metadata: CarnivalMetadata) => void
}

const MODEL_URL = '/models/formula_Carnival_new-optimized.glb'
const WALKABLE_NAMES = new Set([
  'path',
  'floor-2-3-4',
  'floor-5-6-7',
  'floor',
  'starting_point',
  'car_park_path',
  'path_area',
  'open_area_stage_02',
  'racing_path',
  'racing_track_floo2',
  'racing_track_floor',
  'racing_section_floor',
  'racing_champion_section_path',
  'racing_champion_section_paths',
  'racing_area_section',
  'racing_room_exam_main',
  'racing_room_exam',
  'walking_path_racing_exam',
  'real_racing_entering_path',
])
const FORCED_COLLIDER_NAMES = new Set([
  'champ_section_border',
  'inside_building_border',
  'racing_section_fence_inside.ex',
  'exam_border',
  'decorate_fence',
  'gaming_wall',
  'map',
  'exam_front_wall01',
  'exam_front_wall02',
  'cusion.01',
  'cusion.02',
  'cusion_01',
  'cusion_02',
  'formula_car_entrance_stopp',
  'computer_table',
  'computer_table.001',
  'computer_1',
  'computer_2',
  'computer',
  'interactive_board_3',
  'interactive_board_4',
  'exam_board_prev1',
  'exam_board_prev2',
  'exam_board_prev3',
  'exam_board_prev4',
  'exam_board_prev5',
  'exam_board_prev6',
  'extra_screens_tyre',
  'extra_screens_tyre_1',
  'extra_screens_tyre1',
  'extra_screens_chassis',
  'extra_screens_chassis_1',
  'extra_screens_chassis1',
  'extra_screens_formula',
  'extra_screens_formula_1',
  'extra_screens_formula1',
  'extra_screens_track',
  'extra_screens_track_1',
  'extra_screens_track1',
])
const NEVER_COLLIDER_NAMES = new Set([
  'racing_champion_section_path',
  'racing_champion_section_paths',
  'inside_hall',
  'exam_entrance_prev2',
  'exam_entrance_prev2.001',
  'map_enter',
])
const MARKER_NAMES = new Set([
  'starting_point',
  'simulation_building_entrance',
  'pit_building_entrance',
  'exhibition_building_entrance',
  'exhibition_building_entrance.001',
  'exbition_building_entrance',
  'openarea_building_entrance',
  'open_area_building_entrance',
  'simulation_bulding_entrance',
  'racingarea_entrance',
  'holohraphic_main_01',
  'computer_exam_enter1',
  'computer_exam_enter1.001',
  'pitstop_explain',
  'pitstop_explain.000',
  'stretegy_explain',
  'stretegy_explain.001',
  'strategy_explain',
  'strategy_explain.001',
  'engineering_explain',
  'engineering_explain.002',
  'track_explain',
  'track_explain.003',
  'pitstop_spot',
  'stretegy_spot',
  'stretegy_spot.001',
  'stretegy_spot.002',
  'stretegy_spot.003',
  'strategy_spot',
  'engineering_spot',
  'track_spot',
  'open_area_stage_01',
  'open_area_stage_02',
  'open_area_stage_03',
])

const COLLIDER_NAME_PATTERN =
  /(wall|left_wall|building|banner|billboard|bilboard|wallbaord|wallboard|nameboard|barrier|fence|displaying_board)/i
const ROAD_NAME_PATTERN = /(path|road|parking)/i
const SCREEN_NAME_PATTERN = /(screen|display|billboard|bilboard|wallbaord|wallboard|nameboard|banner)/i
const GLASS_NAME_PATTERN = /(glass|window|windshield)/i
const AIRCRAFT_INTERVAL_SECONDS = process.env.NODE_ENV === 'production' ? 4 * 60 : 10

const ENTRANCE_DETAILS: Record<
  CarnivalDestinationId,
  Omit<CarnivalEntrance, 'position' | 'triggerBox' | 'objectName'>
> = {
  simulation: {
    id: 'simulation',
    label: 'Simulation',
    title: 'SIMULATION HALL',
    eyebrow: 'RACE SYSTEMS // LIVE RUN',
    description:
      'Enter the high-fidelity simulator center to test aerodynamic downforce, pedal thresholds, and launch control.',
    image: '/images/carnival/simulation-preview.png',
    href: '/simulation',
    accent: '#00d4ff',
    mode: 'Telemetry trial',
    difficulty: 'Pro setup',
    rewards: 'Superlicense XP',
    actionLabel: 'Enter Simulation',
  },
  pit: {
    id: 'pit',
    label: 'Pit Building',
    title: 'PIT LANE & GARAGE',
    eyebrow: 'CREW OPS // RAPID REFUEL & TIRES',
    description:
      'Step into the active garage to inspect wheel-gun pressure arrays, telemetry monitors, and wing adjustments.',
    image: '/images/carnival/pit-preview.png',
    href: '/pitstop',
    accent: '#ffb000',
    mode: 'Pit mechanics',
    difficulty: 'Time trial',
    rewards: 'Pit crew badge',
    actionLabel: 'Enter Pit Area',
  },
  exhibition: {
    id: 'exhibition',
    label: 'Exhibition Hall',
    title: 'HERITAGE EXHIBITION',
    eyebrow: 'LEGENDS // DECADES OF APEX SPEED',
    description:
      'Explore championship machinery, historic liveries, cockpit cutaways, and engineering milestones.',
    image: '/images/carnival/exhibition-preview.png',
    href: '/exhibition',
    accent: '#ef233c',
    mode: 'Explore garage',
    difficulty: 'Open access',
    rewards: 'Car archive',
    actionLabel: 'Visit Exhibition',
  },
  openarea: {
    id: 'openarea',
    label: 'Open Area Gate',
    title: 'OPEN AREA GATE',
    eyebrow: 'CARNIVAL ROUTE // OPEN GATE',
    description:
      'Open the main entrance gate to access the Open Area stage and exhibition walkthrough.',
    image: '/images/carnival/exhibition-preview.png',
    href: '#',
    accent: '#10b981',
    mode: 'Gate Access',
    difficulty: 'Open Access',
    rewards: 'Zone Access',
    actionLabel: 'Open Gate',
  },
  racingarea: {
    id: 'racingarea',
    label: 'Racing Area Gate',
    title: 'RACING AREA GATE',
    eyebrow: 'CARNIVAL ROUTE // RACING ENTRANCE',
    description:
      'Open the Racing Area gate to access the championship walkthrough and driving examination hall.',
    image: '/images/carnival/exhibition-preview.png',
    href: '#',
    accent: '#ef233c',
    mode: 'Gate Access',
    difficulty: 'Open Access',
    rewards: 'Zone Access',
    actionLabel: 'Open Gate',
  },
  exhibitionHall02: {
    id: 'exhibitionHall02',
    label: 'New Exhibition Hall',
    title: 'NEW EXHIBITION HALL 02',
    eyebrow: 'HERITAGE // 3D EXHIBITION',
    description:
      'Leave the carnival scene and enter the dedicated Formula 1 exhibition hall with historic car displays.',
    image: '/images/carnival/exhibition-preview.png',
    href: '/simulation',
    accent: '#ef233c',
    mode: '3D walk-through',
    difficulty: 'Open access',
    rewards: 'Car archive',
    actionLabel: 'Enter Hall',
  },
}

const EXPLAIN_ZONE_DETAILS: Record<
  ExplainZoneId,
  Omit<CarnivalExplainZone, 'position' | 'triggerBox' | 'objectName'>
> = {
  pitstop: {
    id: 'pitstop',
    label: 'Pit Stop Mechanics',
    title: 'PIT STOP SYSTEM',
    eyebrow: 'PIT CREW // REACTION & TELEMETRY',
    description:
      'Learn about high-speed pit stop operations, tire changing techniques, wheel nut torque tools, and split-second crew synchronization.',
    image: '/images/carnival/pitstop_explain.jpg',
    accent: '#ffb000',
  },
  strategy: {
    id: 'strategy',
    label: 'Race Strategy',
    title: 'RACE STRATEGY HUB',
    eyebrow: 'DATA & ANALYTICS // PIT WINDOWS',
    description:
      'Explore real-time tire degradation modeling, stint planning, safety car reactions, and undercut vs overcut tactics.',
    image: '/images/carnival/strategy_explain.jpg',
    accent: '#00d4ff',
  },
  engineering: {
    id: 'engineering',
    label: 'Aero & Power Unit',
    title: 'ENGINEERING LAB',
    eyebrow: 'HYBRID V6 TURBO // MGU-K & MGU-H',
    description:
      'Discover hybrid thermal recovery, DRS actuation wings, venturi ground-effect floors, and carbon fiber monocoque integrity.',
    image: '/images/carnival/engineering_explain.jpg',
    accent: '#10b981',
  },
  track: {
    id: 'track',
    label: 'Track Dynamics',
    title: 'CIRCUIT TELEMETRY',
    eyebrow: 'SECTOR PACING // APEX VELOCITY',
    description:
      'Study braking markers, curb riding tolerance, slipstreaming physics, track temperature rubbering, and apex line geometry.',
    image: '/images/carnival/track_explain.jpg',
    accent: '#ef233c',
  },
}

function normalizedName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

function hasNamedAncestor(object: THREE.Object3D, validNames: Set<string>) {
  let current = object.parent
  while (current) {
    const currentName = normalizedName(current.name)
    if (validNames.has(currentName) || validNames.has(current.name.toLowerCase())) {
      return true
    }
    current = current.parent
  }
  return false
}

function hasAncestorMatching(object: THREE.Object3D, pattern: RegExp) {
  let current = object.parent
  while (current) {
    if (pattern.test(current.name)) {
      return true
    }
    current = current.parent
  }
  return false
}

function getWorldYaw(object: THREE.Object3D) {
  const quaternion = new THREE.Quaternion()
  object.getWorldQuaternion(quaternion)
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion)
  return Math.atan2(-forward.x, -forward.z)
}

function isGateDoorMesh(name: string): CarnivalGateId | null {
  const n = normalizedName(name)
  const raw = name.toLowerCase()
  if (n === 'door_panel_003' || n === 'door_panel_3' || raw.includes('door panel.003') || raw.includes('open_area_gate')) {
    return 'openarea'
  }
  if (n === 'door_panel_001' || n === 'door_panel_1' || raw.includes('door panel.001') || raw.includes('door_panel.001') || raw.includes('simulation_hall_gate')) {
    return 'simulation'
  }
  if (
    n === 'racing_area_gate_panel' ||
    raw.includes('racing_area_gate_panel') ||
    n === 'racing_area_gate' ||
    raw.includes('racing_area_gate')
  ) {
    return 'racingarea'
  }
  return null
}

function isGateStructure(name: string): boolean {
  const n = normalizedName(name)
  return (
    n.includes('open_area_gate') ||
    n.includes('simulation_hall_gate') ||
    n.includes('racing_area_gate') ||
    n.includes('door_panel') ||
    n.includes('gate')
  )
}

function shouldExcludeFromCollision(object: THREE.Object3D): boolean {
  return /^champion_building_(200[0-9]|201[0-9]|202[0-5])/i.test(object.name)
}

function shouldUseCollider(object: THREE.Object3D) {
  let current: THREE.Object3D | null = object

  while (current) {
    const name = normalizedName(current.name)
    const raw = current.name.toLowerCase()

    if (NEVER_COLLIDER_NAMES.has(name) || NEVER_COLLIDER_NAMES.has(raw)) {
      return false
    }

    // 0. CHAMPION BUILDINGS 2000-2025: STRICTLY EXCLUDE FROM ALL COLLIDER GENERATION (Per Master Rule)
    if (
      shouldExcludeFromCollision(current) ||
      /^champion_building_(200[0-9]|201[0-9]|202[0-5])/i.test(current.name) ||
      /^champion_building_(200[0-9]|201[0-9]|202[0-5])/i.test(raw)
    ) {
      return false
    }

    // 1. MUST NOT HAVE COLLIDERS (Racing_Area_section and walkable corridors remain completely walkable)
    if (
      raw.includes('racing_area_section') ||
      name.includes('racing_area_section') ||
      raw.includes('racing_path') ||
      name.includes('racing_path') ||
      raw.includes('racing_champion_section_path') ||
      name.includes('racing_champion_section_path') ||
      raw.includes('walking_path_racing_exam') ||
      name.includes('walking_path_racing_exam') ||
      raw.includes('racing_room_exam_main') ||
      name.includes('racing_room_exam_main') ||
      raw.includes('racing_room_exam') ||
      name.includes('racing_room_exam') ||
      raw.includes('racing_section_floor') ||
      name.includes('racing_section_floor')
    ) {
      return false
    }

    // 2. ALL FENCES MUST HAVE COLLIDERS (in the sim, carnival, and racing corridors)
    if (raw.includes('fence') || name.includes('fence')) {
      return true
    }

    // 2. ALL FENCES MUST HAVE COLLIDERS
    if (raw.includes('Inside_hall') || name.includes('Inside_hall')) {
      return true
    }

        // 2. ALL FENCES MUST HAVE COLLIDERS #2
    if (raw.includes('Pit_Entrance_Gate') || name.includes('Pit_Entrance_Gate')) {
      return true
    }

    // 3. Other objects that MUST have colliders (Walls, Borders, Fences, Barriers)
    if (
      raw.includes('wall') ||
      name.includes('wall') ||
      (raw.includes('building') && !shouldExcludeFromCollision(current)) ||
      (name.includes('building') && !shouldExcludeFromCollision(current)) ||
      raw.includes('champ_section_border') ||
      name.includes('champ_section_border') ||
      raw.includes('inside_building_border') ||
      name.includes('inside_building_border') ||
      raw.includes('exam_border') ||
      name.includes('exam_border') ||
      raw.includes('cusion') ||
      name.includes('cusion') ||
      raw === 'map' ||
      name === 'map' ||
      raw.includes('map_board') ||
      name.includes('map_board') ||
      raw.includes('map_kiosk') ||
      name.includes('map_kiosk') ||
      raw.includes('map_stand') ||
      name.includes('map_stand') ||
      FORCED_COLLIDER_NAMES.has(name) ||
      FORCED_COLLIDER_NAMES.has(raw)
    ) {
      return true
    }

    // 4. Other objects that MUST NOT have colliders (gates, holograms, visual decor)
    if (
      raw.includes('banner_floor') ||
      raw.includes('exam_banner') ||
      raw.includes('cube_standard') ||
      name.includes('cube_standard') ||
      raw.includes('holohraphic') ||
      name.includes('holohraphic') ||
      raw.includes('racing_area_gate') ||
      name.includes('racing_area_gate') ||
      raw.includes('gate') ||
      name.includes('gate') ||
      raw.includes('door_panel') ||
      name.includes('door_panel') ||
      raw.includes('door panel') ||
      name.includes('door panel')
    ) {
      return false
    }

    if (isGateDoorMesh(raw) || isGateDoorMesh(name)) return false
    if (isGateStructure(raw) || isGateStructure(name)) return false

    if (
      WALKABLE_NAMES.has(name) ||
      WALKABLE_NAMES.has(raw) ||
      MARKER_NAMES.has(name) ||
      MARKER_NAMES.has(raw) ||
      name.includes('spot') ||
      name.includes('explain') ||
      name.includes('entrance') ||
      name.includes('stage') ||
      name.includes('starting_point')
    ) {
      return false
    }
    if (COLLIDER_NAME_PATTERN.test(name) || COLLIDER_NAME_PATTERN.test(raw)) return true
    current = current.parent
  }

  return false
}

function makeFenceColliderBoxes(object: THREE.Object3D): THREE.Box3[] {
  const mesh = object as THREE.Mesh
  const geom = mesh.geometry
  const overallBox = new THREE.Box3().setFromObject(object)
  const overallSize = overallBox.getSize(new THREE.Vector3())

  if (!geom || !geom.attributes?.position) {
    const center = overallBox.getCenter(new THREE.Vector3())
    if (overallSize.x < 1.0) {
      overallBox.min.x = center.x - 0.5
      overallBox.max.x = center.x + 0.5
    }
    if (overallSize.z < 1.0) {
      overallBox.min.z = center.z - 0.5
      overallBox.max.z = center.z + 0.5
    }
    overallBox.min.y = Math.min(overallBox.min.y, -1.0)
    overallBox.max.y = Math.max(overallBox.max.y, 4.5)
    return [overallBox]
  }

  // Straight fence / border (like simulation Fence, champ_section_border, exam_border):
  // One horizontal dimension is thin (< 4m)
  if (Math.min(overallSize.x, overallSize.z) < 4.0) {
    const center = overallBox.getCenter(new THREE.Vector3())
    if (overallSize.x < 1.0) {
      overallBox.min.x = center.x - 0.5
      overallBox.max.x = center.x + 0.5
    }
    if (overallSize.z < 1.0) {
      overallBox.min.z = center.z - 0.5
      overallBox.max.z = center.z + 0.5
    }
    overallBox.min.y = Math.min(overallBox.min.y, -1.0)
    overallBox.max.y = Math.max(overallBox.max.y, 4.5)
    return [overallBox]
  }

  // Large or curved fence (e.g. Right_fence_Racing, Left_fence_Racing, Racing_section_fence_inside.ex):
  // Decompose into 2.5m spatial grid boxes so the fence itself is solid, but the empty center & corridor stay 100% open
  const posAttr = geom.attributes.position
  const matrix = mesh.matrixWorld
  const cellSize = 2.5
  const grid = new Map<string, THREE.Box3>()
  const v = new THREE.Vector3()

  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i).applyMatrix4(matrix)
    const gx = Math.floor(v.x / cellSize)
    const gz = Math.floor(v.z / cellSize)
    const key = `${gx},${gz}`
    let cellBox = grid.get(key)
    if (!cellBox) {
      cellBox = new THREE.Box3()
      grid.set(key, cellBox)
    }
    cellBox.expandByPoint(v)
  }

  const boxes: THREE.Box3[] = []
  grid.forEach((box) => {
    const s = box.getSize(new THREE.Vector3())
    if (s.x > 0.05 || s.z > 0.05) {
      const center = box.getCenter(new THREE.Vector3())
      if (s.x < 1.0) {
        box.min.x = center.x - 0.5
        box.max.x = center.x + 0.5
      }
      if (s.z < 1.0) {
        box.min.z = center.z - 0.5
        box.max.z = center.z + 0.5
      }
      box.min.y = Math.min(box.min.y, -1.0)
      box.max.y = Math.max(box.max.y, 4.5)
      boxes.push(box)
    }
  })

  return boxes.length > 0 ? boxes : [overallBox]
}

function makeColliderBox(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())

  if (!Number.isFinite(size.x + size.y + size.z)) return null
  const isExtraScreen = normalizedName(object.name).includes('extra_screens')
  if (!isExtraScreen && (size.x < 0.08 || size.z < 0.08 || size.y < 0.12)) return null
  if (isExtraScreen) {
    const center = box.getCenter(new THREE.Vector3())
    if (size.x < 1.0) {
      box.min.x = center.x - 0.5
      box.max.x = center.x + 0.5
    }
    if (size.z < 1.0) {
      box.min.z = center.z - 0.5
      box.max.z = center.z + 0.5
    }
    box.min.y = Math.min(box.min.y, center.y - 2.8)
    box.max.y = Math.max(box.max.y, center.y + 2.8)
  }
  if ((size.x > 300 && size.z > 300) || Math.min(size.x, size.z) > 45) return null

  const name = object.name.toLowerCase()
  const isBanner =
    name.includes('banner') ||
    name.includes('billboard') ||
    name.includes('bilboard') ||
    name.includes('wallbaord') ||
    name.includes('wallboard') ||
    name.includes('nameboard')

  if (isBanner) {
    const center = box.getCenter(new THREE.Vector3())
    const shrinkX = Math.max(0, Math.min(size.x * 0.22, 0.45))
    const shrinkZ = Math.max(0, Math.min(size.z * 0.22, 0.45))
    box.min.x += shrinkX
    box.max.x -= shrinkX
    box.min.z += shrinkZ
    box.max.z -= shrinkZ

    if (box.min.x >= box.max.x) {
      box.min.x = center.x - 0.18
      box.max.x = center.x + 0.18
    }

    if (box.min.z >= box.max.z) {
      box.min.z = center.z - 0.18
      box.max.z = center.z + 0.18
    }
  }

  return box
}

function makeTriggerBox(object: THREE.Object3D, position: THREE.Vector3) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const invalidBox =
    box.isEmpty() ||
    !Number.isFinite(size.x + size.y + size.z) ||
    size.x < 0.15 ||
    size.z < 0.15

  if (invalidBox) {
    box.setFromCenterAndSize(position, new THREE.Vector3(5.0, 8, 5.0))
  } else {
    box.expandByVector(new THREE.Vector3(2.0, 4, 2.0))
  }

  box.min.y = -5
  box.max.y = 15

  return box
}

function tuneMaterial(
  material: THREE.Material,
  options: { isWalkable: boolean; isCollider: boolean; objectName: string }
) {
  const standard = material as THREE.MeshStandardMaterial
  if (!('roughness' in standard)) return

  if (standard.map) standard.map.colorSpace = THREE.SRGBColorSpace
  if (standard.emissiveMap) standard.emissiveMap.colorSpace = THREE.SRGBColorSpace
  if (standard.normalMap) standard.normalMap.colorSpace = THREE.NoColorSpace
  if (standard.roughnessMap) standard.roughnessMap.colorSpace = THREE.NoColorSpace
  if (standard.metalnessMap) standard.metalnessMap.colorSpace = THREE.NoColorSpace
  if (standard.aoMap) standard.aoMap.colorSpace = THREE.NoColorSpace
  standard.shadowSide = THREE.DoubleSide

  standard.envMapIntensity = options.isWalkable ? 0.55 : 1.25

  if (options.isWalkable || ROAD_NAME_PATTERN.test(options.objectName)) {
    standard.envMapIntensity = 0.26
    standard.roughness = Math.max(standard.roughness ?? 0.9, 0.9)
    standard.metalness = 0
    if (standard.color) standard.color.multiplyScalar(0.24)
  } else if (SCREEN_NAME_PATTERN.test(options.objectName)) {
    standard.envMapIntensity = 0.18
    standard.roughness = Math.max(standard.roughness ?? 0.68, 0.68)
    standard.metalness = 0
    standard.transparent = false
    standard.opacity = 1
    standard.depthWrite = true
    standard.depthTest = true

    if (standard.map && standard.color) {
      standard.color.setScalar(0.82)
    }

    if (standard.emissive) {
      standard.emissive.set(0x000000)
      standard.emissiveIntensity = 0
    }

    standard.needsUpdate = true
  } else if (GLASS_NAME_PATTERN.test(options.objectName)) {
    standard.envMapIntensity = 1.45
    standard.roughness = Math.min(standard.roughness ?? 0.18, 0.18)
    standard.metalness = Math.max(standard.metalness ?? 0, 0.02)
  } else if (options.isCollider) {
    standard.roughness = Math.max(standard.roughness ?? 0.55, 0.5)
  }
}

type GateState = 'closed' | 'opening' | 'open' | 'closing'

export default function CarnivalEnvironment({ onReady }: CarnivalEnvironmentProps) {
  const gltf = useGLTF(MODEL_URL)
  const { actions, mixer } = useAnimations(gltf.animations, gltf.scene)
  const openedGatesRef = useRef<Set<CarnivalGateId>>(new Set())
  const movingGatesRef = useRef<Set<CarnivalGateId>>(new Set())
  const gateCollidersRef = useRef<Map<string, THREE.Box3[]>>(new Map())
  const obstacleBoxesRef = useRef<THREE.Box3[]>([])
  const openAreaGateStateRef = useRef<GateState>('closed')
  const simGateStateRef = useRef<GateState>('closed')
  const racingAreaGateStateRef = useRef<GateState>('closed')

  const setGateColliderEnabled = (gateId: CarnivalGateId, enabled: boolean) => {
    const boxes = gateCollidersRef.current.get(gateId) || []
    const obstacleBoxes = obstacleBoxesRef.current
    boxes.forEach((box) => {
      const idx = obstacleBoxes.indexOf(box)
      if (enabled && idx === -1) {
        obstacleBoxes.push(box)
      } else if (!enabled && idx !== -1) {
        obstacleBoxes.splice(idx, 1)
      }
    })
  }
  const lockedEntrancesRef = useRef<THREE.Object3D[]>([])
  const lockedCollidersRef = useRef<THREE.Box3[]>([])
  const formulaCarUnlockedRef = useRef<boolean>(false)
  const formulaCarEntranceObjectRef = useRef<THREE.Object3D | null>(null)
  const formulaCarCollidersRef = useRef<THREE.Box3[]>([])
  const formulaCarDissolveRef = useRef<number>(0)
  const formulaCarMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([])
  const isolatedActionsRef = useRef<Record<string, THREE.AnimationAction>>({})

  const unlockFormulaCarEntrance = () => {
    if (formulaCarUnlockedRef.current) return
    formulaCarUnlockedRef.current = true

    if (formulaCarEntranceObjectRef.current) {
      const mats: THREE.MeshStandardMaterial[] = []
      formulaCarEntranceObjectRef.current.traverse((c) => {
        if (c instanceof THREE.Mesh && c.material) {
          mats.push(c.material as THREE.MeshStandardMaterial)
        }
      })
      formulaCarMaterialsRef.current = mats
    }

    // Remove collider immediately so player can walk through
    const obstacleBoxes = obstacleBoxesRef.current
    formulaCarCollidersRef.current.forEach((box) => {
      const idx = obstacleBoxes.indexOf(box)
      if (idx !== -1) {
        obstacleBoxes.splice(idx, 1)
      }
    })
  }

  const isFormulaCarUnlocked = () => formulaCarUnlockedRef.current

  const aircraftRef = useRef<{
    plane1: THREE.Object3D | null
    plane2: THREE.Object3D | null
    plane1Actions: THREE.AnimationAction[]
    plane2Actions: THREE.AnimationAction[]
    activePlane: 1 | 2 | null
    activeStartedAt: number
    lastTriggeredSlot: number
    activeDuration: number
  }>({
    plane1: null,
    plane2: null,
    plane1Actions: [],
    plane2Actions: [],
    activePlane: null,
    activeStartedAt: 0,
    lastTriggeredSlot: 0,
    activeDuration: 0,
  })

  // Set up isolated animation clips for gates so each gate panel animates independently
  useEffect(() => {
    if (!mixer) return
    const openClip = gltf.animations.find((a) => /open_?area_?open/i.test(a.name))
    const closeClip = gltf.animations.find((a) => /open_?area_?close/i.test(a.name))

    if (openClip && closeClip) {
      const openAreaTracksOpen = openClip.tracks.filter((t) => /door_?panel/i.test(t.name) || /door panel/i.test(t.name))
      const racingAreaTracksOpen = openClip.tracks.filter((t) => /racing_area_gate_panel/i.test(t.name))

      const openAreaTracksClose = closeClip.tracks.filter((t) => /door_?panel/i.test(t.name) || /door panel/i.test(t.name))
      const racingAreaTracksClose = closeClip.tracks.filter((t) => /racing_area_gate_panel/i.test(t.name))

      if (openAreaTracksOpen.length > 0) {
        const clip = new THREE.AnimationClip('openarea_isolated_open', openClip.duration, openAreaTracksOpen)
        isolatedActionsRef.current['openarea_open'] = mixer.clipAction(clip)
      }
      if (openAreaTracksClose.length > 0) {
        const clip = new THREE.AnimationClip('openarea_isolated_close', closeClip.duration, openAreaTracksClose)
        isolatedActionsRef.current['openarea_close'] = mixer.clipAction(clip)
      }
      if (racingAreaTracksOpen.length > 0) {
        const clip = new THREE.AnimationClip('racingarea_isolated_open', openClip.duration, racingAreaTracksOpen)
        isolatedActionsRef.current['racingarea_open'] = mixer.clipAction(clip)
      }
      if (racingAreaTracksClose.length > 0) {
        const clip = new THREE.AnimationClip('racingarea_isolated_close', closeClip.duration, racingAreaTracksClose)
        isolatedActionsRef.current['racingarea_close'] = mixer.clipAction(clip)
      }
    }
  }, [gltf.animations, mixer])

  const metadata = useMemo<CarnivalMetadata>(() => {
    const spawnPosition = new THREE.Vector3(0, 1.65, 0)
    const spawnQuaternion = new THREE.Quaternion()
    const walkableMeshes: THREE.Mesh[] = []
    const walkableBoxes: THREE.Box3[] = []
    const obstacleBoxes: THREE.Box3[] = []
    obstacleBoxesRef.current = obstacleBoxes
    const entrances: CarnivalEntrance[] = []
    const explainZones: CarnivalExplainZone[] = []
    const championSections: ChampionSection[] = []
    const examBoards: ExamBoard[] = []

    const gateColliders = new Map<string, THREE.Box3[]>()
    gateColliders.set('openarea', [])
    gateColliders.set('simulation', [])
    gateColliders.set('racingarea', [])
    gateCollidersRef.current = gateColliders

    lockedEntrancesRef.current = []
    lockedCollidersRef.current = []

    let spawnFound = false
    const entranceObjects = new Map<CarnivalDestinationId, THREE.Object3D>()
    const explainObjects = new Map<ExplainZoneId, THREE.Object3D>()
    const champBuildingObjects = new Map<number, THREE.Object3D>()
    const champYearFrameObjects = new Map<number, THREE.Object3D>()
    let formulaCarTriggerObject: THREE.Object3D | null = null
    let examTriggerObject: THREE.Object3D | null = null
    let cubeScreenObject: THREE.Object3D | null = null
    let insideScreenObject: THREE.Object3D | null = null
    let insideScreen2Object: THREE.Object3D | null = null
    let screenInside1Obj: THREE.Object3D | null = null
    let screenInside2Obj: THREE.Object3D | null = null
    let screenBig1Obj: THREE.Object3D | null = null
    let screenBig2Obj: THREE.Object3D | null = null
    let screenComputerObj: THREE.Object3D | null = null
    let aboutSectionObject: THREE.Object3D | null = null
    let mapEnterObject: THREE.Object3D | null = null
    let mapObject: THREE.Object3D | null = null
    let board7FloorObject: THREE.Object3D | null = null
    let board7ScreenObject: THREE.Object3D | null = null
    let board8FloorObject: THREE.Object3D | null = null
    let board8ScreenObject: THREE.Object3D | null = null
    const informationScreenObjects = new Map<'tyreTech' | 'chassisTech' | 'formulaTech' | 'trackTech', THREE.Object3D>()
    const symbolObjects = new Map<'tyreTech' | 'chassisTech' | 'formulaTech' | 'trackTech', THREE.Object3D>()
    const occluderMeshes: THREE.Object3D[] = []

    const materialTuningCache = new Map<THREE.Material, { category: string; tunedMaterial: THREE.Material }>()

    gltf.scene.updateMatrixWorld(true)

    gltf.scene.traverse((child) => {
      const name = normalizedName(child.name)
      const rawName = child.name.toLowerCase()

      if (name === 'starting_point') {
        child.getWorldPosition(spawnPosition)
        child.getWorldQuaternion(spawnQuaternion)
        spawnFound = true
      }

      if (name === 'simulation_building_entrance' || name === 'simulation_bulding_entrance') {
        entranceObjects.set('simulation', child)
      }
      if (name === 'pit_building_entrance') entranceObjects.set('pit', child)
      if (name.includes('exhibition_building_entrance') || name.includes('exbition_building_entrance')) {
        entranceObjects.set('exhibition', child)
      }
      if (name.includes('openarea_building_entrance') || name.includes('open_area_building_entrance')) {
        entranceObjects.set('openarea', child)
      }
      if (
        name === 'racing_area_gate' ||
        rawName === 'racing_area_gate' ||
        name.includes('racingarea_entrance') ||
        rawName.includes('racingarea_entrance')
      ) {
        entranceObjects.set('racingarea', child)
      }
      if (name === 'holohraphic_main_01' || rawName === 'holohraphic_main_01') {
        entranceObjects.set('exhibitionHall02', child)
      }

      if (rawName.includes('computer_exam_enter1')) {
        examTriggerObject = child
      }
      if (child.name === 'Computer_Screen' || rawName.includes('cube_screen_0.001')) {
        cubeScreenObject = child
        screenComputerObj = child
      }
      if (child.name === 'inside_screen' || rawName === 'inside_screen') {
        insideScreenObject = child
        screenInside1Obj = child
      }
      if (child.name === 'inside_screen_2' || rawName === 'inside_screen_2') {
        insideScreen2Object = child
        screenInside2Obj = child
      }
      if (child.name === 'Big_Screen1') {
        screenBig1Obj = child
      }
      if (child.name === 'Big_Screen2') {
        screenBig2Obj = child
      }
      if (
        child.name === 'Extra_Screens_Tyre.1' ||
        child.name === 'Extra_Screens_Tyre1' ||
        name === 'extra_screens_tyre_1' ||
        name === 'extra_screens_tyre1' ||
        (child as any).userData?.name === 'Extra_Screens_Tyre.1'
      ) {
        informationScreenObjects.set('tyreTech', child)
      }
      if (
        child.name === 'Extra_Screens_Chassis.1' ||
        child.name === 'Extra_Screens_Chassis1' ||
        name === 'extra_screens_chassis_1' ||
        name === 'extra_screens_chassis1' ||
        (child as any).userData?.name === 'Extra_Screens_Chassis.1'
      ) {
        informationScreenObjects.set('chassisTech', child)
      }
      if (
        child.name === 'Extra_Screens_Formula.1' ||
        child.name === 'Extra_Screens_Formula1' ||
        name === 'extra_screens_formula_1' ||
        name === 'extra_screens_formula1' ||
        (child as any).userData?.name === 'Extra_Screens_Formula.1'
      ) {
        informationScreenObjects.set('formulaTech', child)
      }
      if (
        child.name === 'Extra_Screens_Track.1' ||
        child.name === 'Extra_Screens_Track1' ||
        name === 'extra_screens_track_1' ||
        name === 'extra_screens_track1' ||
        (child as any).userData?.name === 'Extra_Screens_Track.1'
      ) {
        informationScreenObjects.set('trackTech', child)
      }

      // Collect Exhibition Information Screen Symbols (Trigger Pads)
      if (rawName.includes('symmbol.001') || rawName.includes('symbol.001') || name.includes('symmbol_001')) {
        symbolObjects.set('formulaTech', child)
      }
      if (rawName.includes('symmbol.002') || rawName.includes('symbol.002') || name.includes('symmbol_002')) {
        symbolObjects.set('trackTech', child)
      }
      if (rawName.includes('symmbol.003') || rawName.includes('symbol.003') || name.includes('symmbol_003')) {
        symbolObjects.set('chassisTech', child)
      }
      if (rawName.includes('symmbol.004') || rawName.includes('symbol.004') || name.includes('symmbol_004')) {
        symbolObjects.set('tyreTech', child)
      }

      if (name === 'about_section' || rawName.includes('about_section')) {
        aboutSectionObject = child
      }

      // Collect building wall meshes for occlusion testing
      if (child instanceof THREE.Mesh && (rawName.includes('wall') || name.includes('wall'))) {
        occluderMeshes.push(child)
      }

      // Collect Champion Buildings (2000 through 2025)
      const champBuildMatch = child.name.match(/^champion_building_(\d{4})/i)
      if (champBuildMatch) {
        const year = parseInt(champBuildMatch[1], 10)
        champBuildingObjects.set(year, child)
      }

      // Collect Photoframe Year Nodes (2000 through 2025)
      const yearMatch = child.name.match(/^(20\d\d)$/)
      if (yearMatch) {
        const year = parseInt(yearMatch[1], 10)
        champYearFrameObjects.set(year, child)
      }

      // Check Formula Car Experience Trigger (Exam_board_prev6.001)
      if (rawName.includes('exam_board_prev6.001') || name === 'exam_board_prev6_001') {
        formulaCarTriggerObject = child
      }

      // Track Formula Car Entrance Stop object
      if (rawName.includes('formula_car_entrance_stopp')) {
        formulaCarEntranceObjectRef.current = child
      }

      // Map trigger zone and kiosk
      if (rawName === 'map_enter') {
        mapEnterObject = child
      }
      if (rawName === 'map' && !rawName.includes('_')) {
        mapObject = child
      }
      if (child.name === 'Map') {
        mapObject = child
      }

      // Game Station floors and screens
      if (child.name === 'Exam_Entrance_prev2.001') {
        board7FloorObject = child
      }
      if (child.name === 'Exam_Entrance_prev2' && !child.name.includes('.001')) {
        board8FloorObject = child
      }
      if (child.name === 'Interactive_Board_7.Screen') {
        board7ScreenObject = child
      }
      if (child.name === 'Interactive_Board_8.Screen') {
        board8ScreenObject = child
      }

      // Self-illuminate champion photoframes for crystal-clear clarity with 0 lighting overhead
      if (rawName.includes('photoframe') && !rawName.includes('border') && child instanceof THREE.Mesh) {
        const standard = child.material as THREE.MeshStandardMaterial
        if (standard && 'roughness' in standard) {
          standard.roughness = 0.2
          standard.metalness = 0.05
          if (standard.map) {
            standard.emissiveMap = standard.map
            standard.emissive = new THREE.Color('#ffffff')
            standard.emissiveIntensity = 0.65
          } else {
            standard.emissive = new THREE.Color('#fff4e0')
            standard.emissiveIntensity = 0.4
          }
          standard.needsUpdate = true
        }
      }

      // Check Exam Boards (1 through 6)
      const boardMatch = child.name.match(/exam_board_prev(\d+)(\.board)?/i)
      if (boardMatch) {
        const num = parseInt(boardMatch[1], 10)
        if (num >= 1 && num <= 6) {
          const isBoardMesh = child.name.toLowerCase().includes('.board') || child instanceof THREE.Mesh
          const pos = new THREE.Vector3()
          child.getWorldPosition(pos)
          const box = new THREE.Box3().setFromObject(child)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())

          const triggerBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(center.x, center.y, center.z),
            new THREE.Vector3(Math.max(size.x + 3.0, 5.0), 8, Math.max(size.z + 3.0, 5.0))
          )

          const lookAtPosition = new THREE.Vector3(center.x, Math.max(center.y, 2.4), center.z)
          let camX = center.x
          let camZ = center.z
          // Correct front-facing camera positions:
          // Boards 1 & 2 are on left wall (x ~ 16.8), so camera in front is at +X (+2.8)
          // Boards 5 & 6 are on right wall (x ~ 55.0), so camera in front is at -X (-2.8)
          // Boards 3 & 4 are on back wall (z ~ 164.2), so camera in front is at -Z (-2.8)
          if (num === 1 || num === 2) {
            camX = center.x + 2.8
          } else if (num === 3 || num === 4) {
            camZ = center.z - 2.8
          } else if (num === 5 || num === 6) {
            camX = center.x - 2.8
          }
          const cameraPosition = new THREE.Vector3(camX, Math.max(center.y, 2.4), camZ)

          // Self-illuminate exam board face for crisp readability
          if (isBoardMesh && child instanceof THREE.Mesh) {
            const standard = child.material as THREE.MeshStandardMaterial
            if (standard && 'roughness' in standard) {
              standard.roughness = 0.25
              standard.metalness = 0.0
              if (standard.map) {
                standard.emissiveMap = standard.map
                standard.emissive = new THREE.Color('#ffffff')
                standard.emissiveIntensity = 0.75
              } else {
                standard.emissive = new THREE.Color('#ffffff')
                standard.emissiveIntensity = 0.5
              }
              standard.needsUpdate = true
            }
          }

          const existingIndex = examBoards.findIndex((b) => b.number === num)
          if (existingIndex >= 0) {
            if (isBoardMesh) {
              examBoards[existingIndex] = {
                id: `board_${num}`,
                number: num,
                objectName: child.name,
                label: `Board 0${num}`,
                position: pos,
                triggerBox,
                cameraPosition,
                lookAtPosition,
              }
            }
          } else {
            examBoards.push({
              id: `board_${num}`,
              number: num,
              objectName: child.name,
              label: `Board 0${num}`,
              position: pos,
              triggerBox,
              cameraPosition,
              lookAtPosition,
            })
          }
        }
      }

      // Check locked entrance doors (formula_car_entrance_stopp)
      if (rawName.includes('formula_car_entrance_stopp')) {
        lockedEntrancesRef.current.push(child)
      }

      if (child instanceof THREE.Mesh) {
        child.frustumCulled = true
        child.receiveShadow = true

        // Gate colliders removed per request (player can pass freely through all gates including racing gate)

        const isWalkable =
          WALKABLE_NAMES.has(name) ||
          WALKABLE_NAMES.has(rawName) ||
          hasNamedAncestor(child, WALKABLE_NAMES)

        const isCollider = shouldUseCollider(child)
        child.castShadow = !isWalkable
        const isRoadLike = hasAncestorMatching(child, ROAD_NAME_PATTERN)

        const tuningCategory = (isWalkable || isRoadLike)
          ? 'road'
          : SCREEN_NAME_PATTERN.test(name)
          ? 'screen'
          : GLASS_NAME_PATTERN.test(name)
          ? 'glass'
          : isCollider
          ? 'collider'
          : 'default'

        const applySmartMaterialTuning = (mat: THREE.Material): THREE.Material => {
          const cached = materialTuningCache.get(mat)
          if (cached) {
            if (cached.category === tuningCategory) {
              return cached.tunedMaterial
            }
            const cloned = mat.clone()
            tuneMaterial(cloned, {
              isWalkable,
              isCollider,
              objectName: isRoadLike ? 'path' : normalizedName(child.name),
            })
            materialTuningCache.set(cloned, { category: tuningCategory, tunedMaterial: cloned })
            return cloned
          }

          tuneMaterial(mat, {
            isWalkable,
            isCollider,
            objectName: isRoadLike ? 'path' : normalizedName(child.name),
          })
          materialTuningCache.set(mat, { category: tuningCategory, tunedMaterial: mat })
          return mat
        }

        const isExtraScreen =
          rawName === 'extra_screens_tyre.1' ||
          rawName === 'extra_screens_tyre1' ||
          rawName === 'extra_screens_chassis.1' ||
          rawName === 'extra_screens_chassis1' ||
          rawName === 'extra_screens_formula.1' ||
          rawName === 'extra_screens_formula1' ||
          rawName === 'extra_screens_track.1' ||
          rawName === 'extra_screens_track1' ||
          name.includes('extra_screens_tyre') ||
          name.includes('extra_screens_chassis') ||
          name.includes('extra_screens_formula') ||
          name.includes('extra_screens_track')

        if (isExtraScreen) {
          // Dedicated 3D exhibition data screen: do NOT apply scenery material tuning!
          // ScreenSurfaceRenderer will assign its native CanvasTexture MeshBasicMaterial.
          return
        }

        if (Array.isArray(child.material)) {
          child.material = child.material.map(applySmartMaterialTuning)
        } else if (child.material) {
          child.material = applySmartMaterialTuning(child.material)
        }

        if (isWalkable) {
          walkableMeshes.push(child)
          walkableBoxes.push(new THREE.Box3().setFromObject(child))
          return
        }

        if (isCollider) {
          if (
            rawName.includes('fence') ||
            rawName.includes('wall') ||
            name.includes('wall') ||
            rawName.includes('building') ||
            name.includes('building') ||
            rawName.includes('champ_section_border') ||
            rawName.includes('exam_border') ||
            rawName.includes('inside_building_border') ||
            name.includes('champ_section_border') ||
            name.includes('exam_border')
          ) {
            const fenceBoxes = makeFenceColliderBoxes(child)
            fenceBoxes.forEach((b) => obstacleBoxes.push(b))
          } else {
            const box = makeColliderBox(child)
            if (box) {
              if (rawName.includes('formula_car_entrance_stopp')) {
                formulaCarCollidersRef.current.push(box)
                lockedCollidersRef.current.push(box)
              }
              obstacleBoxes.push(box)
            }
          }
        }
      }
    })

    // Explicit solid colliders for borders so player cannot pass through them on Z or X axis
    // Note: bounds carefully constrained so as NOT to obstruct Racing_Champion_Section_path (X: -66 to +3, Z: 129 to 164)
    const dedicatedBorders = [
      // champ_section_border (Z axis divider along X: -32.5 to -5.0, at Z <= 128.0)
      new THREE.Box3(new THREE.Vector3(-32.5, -1.0, 126.0), new THREE.Vector3(-5.0, 4.5, 128.0)),
      // exam_border (along Z: 111.0 to 132.0, at X = 75.4)
      new THREE.Box3(new THREE.Vector3(74.2, -1.0, 111.0), new THREE.Vector3(76.5, 4.5, 132.0)),
      // inside_building_border (along Z: 113.0 to 127.5, at X = -51.0, terminating before racing path entrance)
      new THREE.Box3(new THREE.Vector3(-52.5, -1.0, 113.0), new THREE.Vector3(-49.5, 4.5, 127.5)),
      // Decorate_fence: solid fence obstacle along X: 4.0 to 16.8, Z: 133.4 to 135.2
      new THREE.Box3(new THREE.Vector3(4.0, -1.0, 133.4), new THREE.Vector3(16.8, 4.5, 135.2)),
      // Inside_hall perimeter walls with open entrance hole (doorway between X: -41.4 and X: -22.6 at Z ≈ 136.9)
      new THREE.Box3(new THREE.Vector3(-51.5, -1.0, 136.5), new THREE.Vector3(-50.5, 7.0, 165.5)), // Left wall
      new THREE.Box3(new THREE.Vector3(-13.5, -1.0, 136.5), new THREE.Vector3(-12.5, 7.0, 165.5)), // Right wall
      new THREE.Box3(new THREE.Vector3(-51.5, -1.0, 164.5), new THREE.Vector3(-12.5, 7.0, 165.5)), // Back wall
      new THREE.Box3(new THREE.Vector3(-51.5, -1.0, 136.5), new THREE.Vector3(-41.4, 7.0, 137.3)), // Front-left wall
      new THREE.Box3(new THREE.Vector3(-22.6, -1.0, 136.5), new THREE.Vector3(-12.5, 7.0, 137.3)), // Front-right wall
      // Gaming_Wall: solid wall at Z ≈ 130.66, X: 55.0 to 61.2
      new THREE.Box3(new THREE.Vector3(55.0, -1.0, 130.1), new THREE.Vector3(61.2, 10.5, 131.2)),
      // Exam_front_wall01: solid wall at Z ≈ 130.66, X: 43.8 to 50.0
      new THREE.Box3(new THREE.Vector3(43.8, -1.0, 130.1), new THREE.Vector3(50.0, 10.5, 131.2)),
      // Exam_front_wall02: solid wall at Z ≈ 130.66, X: 22.6 to 28.9
      new THREE.Box3(new THREE.Vector3(22.6, -1.0, 130.1), new THREE.Vector3(28.9, 10.5, 131.2)),
      // Map section: solid kiosk obstacle along X: 7.5 to 12.7, Z: 130.0 to 133.9
      new THREE.Box3(new THREE.Vector3(7.5, -1.0, 130.0), new THREE.Vector3(12.7, 5.0, 133.9)),
    ]
    dedicatedBorders.forEach((b) => obstacleBoxes.push(b))

    if (mapObject) {
      const mapBox = new THREE.Box3().setFromObject(mapObject)
      if (!mapBox.isEmpty()) {
        obstacleBoxes.push(mapBox)
      }
    }

    if (!spawnFound) {
      console.warn('[Carnival] Starting_point was not found; using scene origin fallback.')
    }

    ;(['simulation', 'pit', 'exhibition', 'openarea', 'racingarea', 'exhibitionHall02'] as CarnivalDestinationId[]).forEach((id) => {
      const object = entranceObjects.get(id)
      if (!object) {
        return
      }

      const position = new THREE.Vector3()
      object.getWorldPosition(position)
      const triggerBox = makeTriggerBox(object, position)
      if (!triggerBox.isEmpty()) {
        triggerBox.getCenter(position)
      }
      if (id === 'racingarea') {
        triggerBox.expandByVector(new THREE.Vector3(8.0, 6.0, 28.0))
      } else if (id === 'exhibitionHall02') {
        triggerBox.expandByVector(new THREE.Vector3(2.5, 4.0, 2.5))
      }
      entrances.push({
        ...ENTRANCE_DETAILS[id],
        objectName: object.name,
        position,
        triggerBox,
      })
    })

    // Cinematic Information Screen Triggers for Symmbol.001 - Symmbol.004
    const infoScreenTriggers: InformationScreenTrigger[] = []

    const screenTriggerConfigs = [
      {
        id: 'tyreTech' as const,
        symbolName: 'Symmbol.004',
        screenObjectName: 'Extra_Screens_Tyre.1',
        title: 'TYRE TECHNOLOGY',
        subtitle: 'Pirelli Compound Dynamics, Thermal Windows & Contact Mechanics',
        fallbackSymbolPos: new THREE.Vector3(-68.34, 0.0, 76.87),
        fallbackLookAt: new THREE.Vector3(-65.53, 5.05, 64.87),
        fallbackCamPos: new THREE.Vector3(-70.74, 5.05, 70.26),
      },
      {
        id: 'chassisTech' as const,
        symbolName: 'Symmbol.003',
        screenObjectName: 'Extra_Screens_Chassis.1',
        title: 'CHASSIS TECHNOLOGY',
        subtitle: 'Survival Cell, Carbon Fiber Monocoque & Crash Load Dissipation',
        fallbackSymbolPos: new THREE.Vector3(-52.82, 0.0, 76.87),
        fallbackLookAt: new THREE.Vector3(-49.55, 5.05, 66.36),
        fallbackCamPos: new THREE.Vector3(-54.67, 5.05, 71.84),
      },
      {
        id: 'trackTech' as const,
        symbolName: 'Symmbol.002',
        screenObjectName: 'Extra_Screens_Track.1',
        title: 'CIRCUIT TECHNOLOGY',
        subtitle: 'Racing Surface Topography, Curb Profiles & Track Evolution',
        fallbackSymbolPos: new THREE.Vector3(-38.01, 0.0, 76.87),
        fallbackLookAt: new THREE.Vector3(-37.72, 5.05, 64.34),
        fallbackCamPos: new THREE.Vector3(-37.72, 5.05, 71.84),
      },
      {
        id: 'formulaTech' as const,
        symbolName: 'Symmbol.001',
        screenObjectName: 'Extra_Screens_Formula.1',
        title: 'FORMULA RACING ECOSYSTEM',
        subtitle: 'Single-Seater Championship Architecture & Technical Regulations',
        fallbackSymbolPos: new THREE.Vector3(-23.49, 0.0, 76.87),
        fallbackLookAt: new THREE.Vector3(-20.70, 5.05, 62.05),
        fallbackCamPos: new THREE.Vector3(-25.82, 5.05, 67.53),
      },
    ]

    screenTriggerConfigs.forEach((cfg) => {
      const symObj = symbolObjects.get(cfg.id)
      const screenObj = informationScreenObjects.get(cfg.id)

      const symPos = cfg.fallbackSymbolPos.clone()
      if (symObj) {
        symObj.getWorldPosition(symPos)
      }

      const lookAt = cfg.fallbackLookAt.clone()
      if (screenObj) {
        const box = new THREE.Box3().setFromObject(screenObj)
        if (!box.isEmpty()) {
          box.getCenter(lookAt)
        }
      }

      const camPos = cfg.fallbackCamPos.clone()

      // Trigger box centered at symbol position: 5.5m wide x 6m high x 5.5m deep
      const triggerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(symPos.x, Math.max(symPos.y + 1.0, 1.0), symPos.z),
        new THREE.Vector3(5.5, 6.0, 5.5)
      )

      infoScreenTriggers.push({
        id: cfg.id,
        symbolName: cfg.symbolName,
        screenObjectName: cfg.screenObjectName,
        title: cfg.title,
        subtitle: cfg.subtitle,
        position: symPos,
        triggerBox,
        cameraPosition: camPos,
        lookAtPosition: lookAt,
      })
    })

    ;(['pitstop', 'strategy', 'engineering', 'track'] as ExplainZoneId[]).forEach((id) => {
      const object = explainObjects.get(id)
      if (!object) {
        return
      }

      const position = new THREE.Vector3()
      object.getWorldPosition(position)
      const triggerBox = makeTriggerBox(object, position)
      explainZones.push({
        ...EXPLAIN_ZONE_DETAILS[id],
        objectName: object.name,
        position,
        triggerBox,
      })
    })

    let examTrigger: ExamTrigger | null = null
    if (examTriggerObject) {
      const pos = new THREE.Vector3()
      ;(examTriggerObject as THREE.Object3D).getWorldPosition(pos)
      const triggerBox = makeTriggerBox(examTriggerObject, pos)

      let screenPos = new THREE.Vector3(36.77, 2.45, 148.37)
      let screenCamPos = new THREE.Vector3(35.5, 2.45, 148.37)
      if (cubeScreenObject) {
        const screenBox = new THREE.Box3().setFromObject(cubeScreenObject)
        screenPos = screenBox.getCenter(new THREE.Vector3())
        screenCamPos = new THREE.Vector3(screenPos.x - 1.35, screenPos.y, screenPos.z)
      }

      examTrigger = {
        objectName: (examTriggerObject as THREE.Object3D).name,
        position: pos,
        triggerBox,
        screenPosition: screenPos,
        screenCameraPosition: screenCamPos,
      }
    }

    // Build all Champion Buildings (2000 through 2025) dynamically
    for (let y = 2000; y <= 2025; y++) {
      const bObj = champBuildingObjects.get(y)
      const fObj = champYearFrameObjects.get(y)

      if (bObj) {
        const bPos = new THREE.Vector3()
        bObj.getWorldPosition(bPos)
        const bBox = new THREE.Box3().setFromObject(bObj)
        const bCenter = bBox.getCenter(new THREE.Vector3())
        const bSize = bBox.getSize(new THREE.Vector3())

        const triggerBox = new THREE.Box3().setFromCenterAndSize(
          bCenter,
          new THREE.Vector3(Math.max(bSize.x + 3.0, 6.0), 12, Math.max(bSize.z + 3.0, 6.0))
        )

        let fCenter = bCenter.clone()
        if (fObj) {
          const fBox = new THREE.Box3().setFromObject(fObj)
          if (!fBox.isEmpty()) {
            fCenter = fBox.getCenter(new THREE.Vector3())
          }
        }

        const lookAtPosition = new THREE.Vector3(fCenter.x, Math.max(fCenter.y, 2.05), fCenter.z)
        let camX = fCenter.x
        let camY = Math.max(fCenter.y - 0.05, 2.0)
        let camZ = fCenter.z

        if (y >= 2010 && y <= 2015) {
          // North wall corridor: frame faces +Z
          camZ = fCenter.z + 2.4
          camX = fCenter.x + 0.3
        } else if (fCenter.x < bCenter.x) {
          // West wall: frame faces +X
          camX = fCenter.x + 2.4
          camZ = fCenter.z + 0.35
        } else {
          // East wall: frame faces -X
          camX = fCenter.x - 2.4
          camZ = fCenter.z - 0.35
        }

        const cameraPosition = new THREE.Vector3(camX, camY, camZ)

        championSections.push({
          year: y,
          objectName: bObj.name,
          position: bPos,
          triggerBox,
          cameraPosition,
          lookAtPosition,
        })
      }
    }

    // Build Formula Car Entrance Trigger (Exam_board_prev6.001)
    let formulaCarTrigger: ExamTrigger | null = null
    if (formulaCarTriggerObject) {
      const obj = formulaCarTriggerObject as THREE.Object3D
      const pos = new THREE.Vector3()
      obj.getWorldPosition(pos)
      const triggerBox = new THREE.Box3().setFromCenterAndSize(
        pos,
        new THREE.Vector3(7.5, 8.0, 7.5)
      )
      formulaCarTrigger = {
        objectName: obj.name,
        position: pos,
        triggerBox,
        screenPosition: pos,
        screenCameraPosition: pos,
      }
    }
    // Build About Section Trigger (Developer Dossier)
    let aboutTrigger: AboutSectionTrigger | null = null
    const targetAboutObj = aboutSectionObject as THREE.Object3D | null
    if (targetAboutObj) {
      const pos = new THREE.Vector3()
      targetAboutObj.getWorldPosition(pos)
      const triggerBox = makeTriggerBox(targetAboutObj, pos)
      triggerBox.expandByVector(new THREE.Vector3(3.0, 3.5, 3.0))
      aboutTrigger = {
        objectName: targetAboutObj.name,
        position: pos,
        triggerBox,
      }
    }

    // Build Map Interaction Trigger
    let mapTrigger: MapTrigger | null = null
    const mapPos = new THREE.Vector3(10.15, -0.76, 128.24)
    const mEnter = mapEnterObject as THREE.Object3D | null
    if (mEnter) {
      mEnter.getWorldPosition(mapPos)
    }

    const mapScreenPos = new THREE.Vector3(10.22, 1.6, 131.59)
    const mObj = mapObject as THREE.Object3D | null
    if (mObj) {
      mObj.getWorldPosition(mapScreenPos)
      mapScreenPos.y += 0.5
    }

    const mapTriggerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(mapPos.x, Math.max(mapPos.y + 1.2, 1.2), mapPos.z),
      new THREE.Vector3(4.5, 5.0, 4.5)
    )

    const mapCamPos = new THREE.Vector3(mapScreenPos.x, mapScreenPos.y + 0.3, mapScreenPos.z - 2.8)

    mapTrigger = {
      objectName: 'Map_Enter',
      position: mapPos,
      triggerBox: mapTriggerBox,
      cameraPosition: mapCamPos,
      lookAtPosition: mapScreenPos,
    }

    // Build Arcade Game Stations (Board 7 and Board 8)
    const gameStations: GameStationTrigger[] = []

    // Station 7: Board 7
    const s7FloorPos = new THREE.Vector3(62.97, -0.72, 139.30)
    const b7Floor = board7FloorObject as THREE.Object3D | null
    if (b7Floor) {
      b7Floor.getWorldPosition(s7FloorPos)
    }
    const s7ScreenPos = new THREE.Vector3(67.21, 3.30, 139.13)
    const b7Screen = board7ScreenObject as THREE.Object3D | null
    if (b7Screen) {
      b7Screen.getWorldPosition(s7ScreenPos)
    }
    const s7CamPos = new THREE.Vector3(64.6, s7ScreenPos.y, s7ScreenPos.z)
    const s7TriggerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(s7FloorPos.x, Math.max(s7FloorPos.y + 1.2, 1.2), s7FloorPos.z),
      new THREE.Vector3(4.5, 5.0, 4.5)
    )

    gameStations.push({
      stationId: 'GAME_STATION_7',
      triggerObjectName: 'Exam_Entrance_prev2.001',
      screenObjectName: 'Interactive_Board_7.Screen',
      title: 'F1 ARCADE // STATION 07',
      subtitle: 'Circuito de Carnival Grand Prix',
      position: s7FloorPos,
      triggerBox: s7TriggerBox,
      cameraPosition: s7CamPos,
      lookAtPosition: s7ScreenPos,
      returnTransform: {
        position: new THREE.Vector3(s7FloorPos.x, 1.0, s7FloorPos.z),
        yaw: -Math.PI * 0.5,
        pitch: 0,
      },
    })

    // Station 8: Board 8
    const s8FloorPos = new THREE.Vector3(62.97, -0.72, 150.74)
    const b8Floor = board8FloorObject as THREE.Object3D | null
    if (b8Floor) {
      b8Floor.getWorldPosition(s8FloorPos)
    }
    const s8ScreenPos = new THREE.Vector3(67.21, 3.30, 152.86)
    const b8Screen = board8ScreenObject as THREE.Object3D | null
    if (b8Screen) {
      b8Screen.getWorldPosition(s8ScreenPos)
    }
    const s8CamPos = new THREE.Vector3(64.6, s8ScreenPos.y, s8ScreenPos.z)
    const s8TriggerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(s8FloorPos.x, Math.max(s8FloorPos.y + 1.2, 1.2), s8FloorPos.z),
      new THREE.Vector3(4.5, 5.0, 4.5)
    )

    gameStations.push({
      stationId: 'GAME_STATION_8',
      triggerObjectName: 'Exam_Entrance_prev2',
      screenObjectName: 'Interactive_Board_8.Screen',
      title: 'F1 ARCADE // STATION 08',
      subtitle: 'Circuito de Carnival Grand Prix',
      position: s8FloorPos,
      triggerBox: s8TriggerBox,
      cameraPosition: s8CamPos,
      lookAtPosition: s8ScreenPos,
      returnTransform: {
        position: new THREE.Vector3(s8FloorPos.x, 1.0, s8FloorPos.z),
        yaw: -Math.PI * 0.5,
        pitch: 0,
      },
    })

    // Build Screens Anchors
    let screenComputerAnchor: ScreenAnchor | null = null
    const targetComputerObj = (screenComputerObj || cubeScreenObject) as THREE.Object3D | null
    if (targetComputerObj) {
      const obj: THREE.Object3D = targetComputerObj
      // Measure actual mesh geometry bounds to place anchor precisely on the monitor screen (avoiding node pivot in PC tower)
      const screenBox = new THREE.Box3().setFromObject(obj)
      const pos = screenBox.isEmpty() ? new THREE.Vector3(33.143, 3.720, 144.880) : screenBox.getCenter(new THREE.Vector3())
      if (screenBox.isEmpty()) {
        obj.getWorldPosition(pos)
      }
      const quat = new THREE.Quaternion()
      obj.getWorldQuaternion(quat)
      const scale = new THREE.Vector3()
      obj.getWorldScale(scale)
      const rot = new THREE.Euler(0, 43 * (Math.PI / 180), 0)

      // Monitor faces player chair along (+0.682, 0, +0.731)
      const normal = new THREE.Vector3(0.682, 0, 0.731).normalize()
      const cameraPosition = pos.clone().addScaledVector(normal, 1.15)
      const lookAtPosition = pos.clone()
      const triggerBox = new THREE.Box3().setFromCenterAndSize(
        pos,
        new THREE.Vector3(5.5, 5.0, 5.5)
      )

      screenComputerAnchor = {
        id: 'computer',
        objectName: obj.name,
        position: pos,
        rotation: rot,
        quaternion: quat,
        scale,
        dimensions: { width: 1.97, height: 1.08 },
        triggerBox,
        cameraPosition,
        lookAtPosition,
      }
      console.log('[ScreenSystem] Found computer:', screenComputerAnchor)
    }

    let screenInside1Anchor: ScreenAnchor | null = null
    const targetInside1Obj = (screenInside1Obj || insideScreenObject) as THREE.Object3D | null
    if (targetInside1Obj) {
      const obj: THREE.Object3D = targetInside1Obj
      const pos = new THREE.Vector3()
      obj.getWorldPosition(pos)
      const quat = new THREE.Quaternion()
      obj.getWorldQuaternion(quat)
      const scale = new THREE.Vector3()
      obj.getWorldScale(scale)
      const rot = new THREE.Euler(0, Math.PI, 0)

      screenInside1Anchor = {
        id: 'inside1',
        objectName: obj.name,
        position: pos,
        rotation: rot,
        quaternion: quat,
        scale,
        dimensions: { width: 37.30, height: 9.03 },
      }
      console.log('[ScreenSystem] Found inside1:', screenInside1Anchor)
    }

    let screenInside2Anchor: ScreenAnchor | null = null
    const targetInside2Obj = (screenInside2Obj || insideScreen2Object) as THREE.Object3D | null
    if (targetInside2Obj) {
      const obj: THREE.Object3D = targetInside2Obj
      const pos = new THREE.Vector3()
      obj.getWorldPosition(pos)
      const quat = new THREE.Quaternion()
      obj.getWorldQuaternion(quat)
      const scale = new THREE.Vector3()
      obj.getWorldScale(scale)
      const rot = new THREE.Euler(0, Math.PI, 0)

      screenInside2Anchor = {
        id: 'inside2',
        objectName: obj.name,
        position: pos,
        rotation: rot,
        quaternion: quat,
        scale,
        dimensions: { width: 37.30, height: 9.03 },
      }
      console.log('[ScreenSystem] Found inside2:', screenInside2Anchor)
    }

    let screenBig1Anchor: ScreenAnchor | null = null
    if (screenBig1Obj) {
      const obj = screenBig1Obj
      const pos = new THREE.Vector3()
      obj.getWorldPosition(pos)
      const quat = new THREE.Quaternion()
      obj.getWorldQuaternion(quat)
      const scale = new THREE.Vector3()
      obj.getWorldScale(scale)
      const rot = new THREE.Euler(0, 2.897, 0)

      screenBig1Anchor = {
        id: 'big1',
        objectName: obj.name,
        position: pos,
        rotation: rot,
        quaternion: quat,
        scale,
        dimensions: { width: 34.46, height: 15.14 },
      }
      console.log('[ScreenSystem] Found big1:', screenBig1Anchor)
    }

    let screenBig2Anchor: ScreenAnchor | null = null
    if (screenBig2Obj) {
      const obj = screenBig2Obj
      const pos = new THREE.Vector3()
      obj.getWorldPosition(pos)
      const quat = new THREE.Quaternion()
      obj.getWorldQuaternion(quat)
      const scale = new THREE.Vector3()
      obj.getWorldScale(scale)
      const rot = new THREE.Euler(0, 0.245, 0)

      screenBig2Anchor = {
        id: 'big2',
        objectName: obj.name,
        position: pos,
        rotation: rot,
        quaternion: quat,
        scale,
        dimensions: { width: 34.46, height: 15.14 },
      }
      console.log('[ScreenSystem] Found big2:', screenBig2Anchor)
    }

    const buildInformationAnchor = (
      id: 'tyreTech' | 'chassisTech' | 'formulaTech' | 'trackTech'
    ): ScreenAnchor | null => {
      const obj = informationScreenObjects.get(id)
      if (!obj) return null

      const box = new THREE.Box3().setFromObject(obj)
      const pos = box.isEmpty() ? obj.getWorldPosition(new THREE.Vector3()) : box.getCenter(new THREE.Vector3())
      const quat = new THREE.Quaternion()
      obj.getWorldQuaternion(quat)
      const scale = new THREE.Vector3()
      obj.getWorldScale(scale)
      const size = box.getSize(new THREE.Vector3())
      const anchor = {
        id,
        objectName: obj.name,
        position: pos,
        rotation: new THREE.Euler().setFromQuaternion(quat),
        quaternion: quat,
        scale,
        dimensions: {
          width: Math.max(size.x, size.z, 1),
          height: Math.max(size.y, size.x < size.y ? size.x : size.y, 1),
        },
      }
      console.log(`[ScreenSystem] Found ${id}:`, anchor)
      return anchor
    }

    const screenTyreTechAnchor = buildInformationAnchor('tyreTech')
    const screenChassisTechAnchor = buildInformationAnchor('chassisTech')
    const screenFormulaTechAnchor = buildInformationAnchor('formulaTech')
    const screenTrackTechAnchor = buildInformationAnchor('trackTech')

    const monitorScreen = screenComputerAnchor
    const wideScreen = screenInside1Anchor
    const largeScreen = screenInside2Anchor

    const yaw = getWorldYaw({
      getWorldQuaternion: (q: THREE.Quaternion) => q.copy(spawnQuaternion),
    } as THREE.Object3D)
    spawnQuaternion.setFromEuler(new THREE.Euler(0, yaw, 0))

    const playAnimation = (animName: string) => {
      const pattern = new RegExp(animName, 'i')
      Object.entries(actions).forEach(([name, action]) => {
        if (action && pattern.test(name)) {
          action.stop()
          action.reset()
          action.setLoop(THREE.LoopOnce, 1)
          action.clampWhenFinished = true
          action.enabled = true
          action.paused = false
          action.timeScale = 1
          action.play()
        }
      })
    }

    const getOpenAreaAction = (type: 'open' | 'close') => {
      if (type === 'open' && isolatedActionsRef.current['openarea_open']) {
        return isolatedActionsRef.current['openarea_open']
      }
      if (type === 'close' && isolatedActionsRef.current['openarea_close']) {
        return isolatedActionsRef.current['openarea_close']
      }
      const pattern = type === 'open' ? /open_?area_?open/i : /open_?area_?close/i
      const entry = Object.entries(actions).find(([name]) => pattern.test(name))
      return entry ? entry[1] : null
    }

    const getSimGateAction = (type: 'open' | 'close') => {
      const pattern = type === 'open' ? /sim_?gate_?open/i : /sim_?gate_?close/i
      const entry = Object.entries(actions).find(([name]) => pattern.test(name))
      return entry ? entry[1] : null
    }

    const getRacingAreaAction = (type: 'open' | 'close') => {
      if (type === 'open' && isolatedActionsRef.current['racingarea_open']) {
        return isolatedActionsRef.current['racingarea_open']
      }
      if (type === 'close' && isolatedActionsRef.current['racingarea_close']) {
        return isolatedActionsRef.current['racingarea_close']
      }
      const pattern = type === 'open' ? /open_?area_?open/i : /open_?area_?close/i
      const entry = Object.entries(actions).find(([name]) => pattern.test(name))
      return entry ? entry[1] : null
    }

    const openGate = (gateId: CarnivalGateId) => {
      if (gateId === 'openarea') {
        const state = openAreaGateStateRef.current
        if (state === 'open' || state === 'opening') return

        const openAction = getOpenAreaAction('open')
        const closeAction = getOpenAreaAction('close')

        if (!openAction) {
          console.warn('[Carnival] Open_Area_Open action not found in actions')
          return
        }

        if (closeAction) closeAction.stop()

        openAreaGateStateRef.current = 'opening'
        setGateColliderEnabled('openarea', false)
        openAction.reset()
        openAction.setLoop(THREE.LoopOnce, 1)
        openAction.clampWhenFinished = true
        openAction.enabled = true
        openAction.paused = false
        openAction.timeScale = 1
        openAction.play()
        return
      }

      if (gateId === 'simulation') {
        const state = simGateStateRef.current
        if (state === 'open' || state === 'opening') return

        const openAction = getSimGateAction('open')
        const closeAction = getSimGateAction('close')

        if (!openAction) {
          console.warn('[Carnival] sim_Gate_Open action not found in actions')
          return
        }

        if (closeAction) closeAction.stop()

        simGateStateRef.current = 'opening'
        setGateColliderEnabled('simulation', false)
        openAction.reset()
        openAction.setLoop(THREE.LoopOnce, 1)
        openAction.clampWhenFinished = true
        openAction.enabled = true
        openAction.paused = false
        openAction.timeScale = 1
        openAction.play()
        return
      }

      if (gateId === 'racingarea') {
        const state = racingAreaGateStateRef.current
        if (state === 'open' || state === 'opening') return

        const openAction = getRacingAreaAction('open')
        const closeAction = getRacingAreaAction('close')

        if (!openAction) {
          console.warn('[Carnival] Racing Area Open action not found')
          return
        }

        if (closeAction) closeAction.stop()

        racingAreaGateStateRef.current = 'opening'
        setGateColliderEnabled('racingarea', false)
        openAction.reset()
        openAction.setLoop(THREE.LoopOnce, 1)
        openAction.clampWhenFinished = true
        openAction.enabled = true
        openAction.paused = false
        openAction.timeScale = 1
        openAction.play()
        return
      }
    }

    const closeGate = (gateId: CarnivalGateId) => {
      if (gateId === 'openarea') {
        const state = openAreaGateStateRef.current
        if (state === 'closed' || state === 'closing') return

        const openAction = getOpenAreaAction('open')
        const closeAction = getOpenAreaAction('close')

        if (!closeAction) {
          console.warn('[Carnival] Open_Area_Close action not found in actions')
          return
        }

        if (openAction) openAction.stop()

        openAreaGateStateRef.current = 'closing'
        setGateColliderEnabled('openarea', true)
        closeAction.reset()
        closeAction.setLoop(THREE.LoopOnce, 1)
        closeAction.clampWhenFinished = true
        closeAction.enabled = true
        closeAction.paused = false
        closeAction.timeScale = 1
        closeAction.play()
        return
      }

      if (gateId === 'simulation') {
        const state = simGateStateRef.current
        if (state === 'closed' || state === 'closing') return

        const openAction = getSimGateAction('open')
        const closeAction = getSimGateAction('close')

        if (!closeAction) {
          console.warn('[Carnival] sim_Gate_Close action not found in actions')
          return
        }

        if (openAction) openAction.stop()

        simGateStateRef.current = 'closing'
        setGateColliderEnabled('simulation', true)
        closeAction.reset()
        closeAction.setLoop(THREE.LoopOnce, 1)
        closeAction.clampWhenFinished = true
        closeAction.enabled = true
        closeAction.paused = false
        closeAction.timeScale = 1
        closeAction.play()
        return
      }

      if (gateId === 'racingarea') {
        const state = racingAreaGateStateRef.current
        if (state === 'closed' || state === 'closing') return

        const openAction = getRacingAreaAction('open')
        const closeAction = getRacingAreaAction('close')

        if (!closeAction) {
          console.warn('[Carnival] Racing Area Close action not found')
          return
        }

        if (openAction) openAction.stop()

        racingAreaGateStateRef.current = 'closing'
        setGateColliderEnabled('racingarea', true)
        closeAction.reset()
        closeAction.setLoop(THREE.LoopOnce, 1)
        closeAction.clampWhenFinished = true
        closeAction.enabled = true
        closeAction.paused = false
        closeAction.timeScale = 1
        closeAction.play()
        return
      }
    }

    const toggleGate = (gateId: CarnivalGateId) => {
      if (gateId === 'openarea') {
        if (openAreaGateStateRef.current === 'closed') {
          openGate('openarea')
        } else if (openAreaGateStateRef.current === 'open') {
          closeGate('openarea')
        }
        return
      }

      if (gateId === 'simulation') {
        if (simGateStateRef.current === 'closed') {
          openGate('simulation')
        } else if (simGateStateRef.current === 'open') {
          closeGate('simulation')
        }
        return
      }

      if (gateId === 'racingarea') {
        if (racingAreaGateStateRef.current === 'closed' || racingAreaGateStateRef.current === 'closing') {
          openGate('racingarea')
        } else if (racingAreaGateStateRef.current === 'open' || racingAreaGateStateRef.current === 'opening') {
          closeGate('racingarea')
        }
        return
      }
    }

    const isGateOpen = (gateId: CarnivalGateId) => {
      if (gateId === 'openarea') {
        return openAreaGateStateRef.current === 'open' || openAreaGateStateRef.current === 'opening'
      }
      if (gateId === 'simulation') {
        return simGateStateRef.current === 'open' || simGateStateRef.current === 'opening'
      }
      if (gateId === 'racingarea') {
        return racingAreaGateStateRef.current === 'open' || racingAreaGateStateRef.current === 'opening'
      }
      return false
    }

    const hideObject = (objectName: string) => {
      const lower = objectName.toLowerCase()
      if (lower.includes('formula_car_entrance_stopp') || lower.includes('exam_entrance')) {
        lockedEntrancesRef.current.forEach((obj) => {
          obj.visible = false
        })
        lockedCollidersRef.current.forEach((box) => {
          const idx = obstacleBoxesRef.current.indexOf(box)
          if (idx !== -1) {
            obstacleBoxesRef.current.splice(idx, 1)
          }
        })
      }
    }

    const showObject = (objectName: string) => {
      const lower = objectName.toLowerCase()
      if (lower.includes('formula_car_entrance_stopp') || lower.includes('exam_entrance')) {
        lockedEntrancesRef.current.forEach((obj) => {
          obj.visible = true
        })
        lockedCollidersRef.current.forEach((box) => {
          if (!obstacleBoxesRef.current.includes(box)) {
            obstacleBoxesRef.current.push(box)
          }
        })
      }
    }

    return {
      spawnPosition,
      spawnQuaternion,
      walkableMeshes,
      walkableBoxes,
      obstacleBoxes,
      entrances,
      explainZones,
      championSections,
      examBoards,
      examTrigger,
      formulaCarTrigger,
      aboutTrigger,
      infoScreenTriggers,
      mapTrigger,
      gameStations,
      screens: {
        inside1: screenInside1Anchor,
        inside2: screenInside2Anchor,
        big1: screenBig1Anchor,
        big2: screenBig2Anchor,
        computer: screenComputerAnchor,
        monitor: screenComputerAnchor,
        wide: screenInside1Anchor,
        large: screenInside2Anchor,
        tyreTech: screenTyreTechAnchor,
        chassisTech: screenChassisTechAnchor,
        formulaTech: screenFormulaTechAnchor,
        trackTech: screenTrackTechAnchor,
      },
      occluders: occluderMeshes,
      playAnimation,
      openGate,
      closeGate,
      toggleGate,
      isGateOpen,
      unlockFormulaCarEntrance,
      isFormulaCarUnlocked,
      hideObject,
      showObject,
    }
  }, [gltf.scene, actions])

  useEffect(() => {
    openedGatesRef.current.clear()
    movingGatesRef.current.clear()
    openAreaGateStateRef.current = 'closed'
    simGateStateRef.current = 'closed'

    // Stop gate actions and wall actions on mount so they do not auto-play
    Object.entries(actions).forEach(([name, action]) => {
      if (!action) return
      if (
        /open_?area_?open/i.test(name) ||
        /open_?area_?close/i.test(name) ||
        /sim_?gate_?open/i.test(name) ||
        /sim_?gate_?close/i.test(name)
      ) {
        action.stop()
      }
    })
  }, [actions])

  useEffect(() => {
    if (!mixer) return

    const onFinished = (event: unknown) => {
      const e = event as { action?: THREE.AnimationAction }
      const clipName = e.action?.getClip()?.name || ''

      if (
        /openarea_isolated_open/i.test(clipName) ||
        (/open_?area_?open/i.test(clipName) && openAreaGateStateRef.current === 'opening')
      ) {
        openAreaGateStateRef.current = 'open'
        openedGatesRef.current.add('openarea')
        setGateColliderEnabled('openarea', false)
      } else if (
        /openarea_isolated_close/i.test(clipName) ||
        (/open_?area_?close/i.test(clipName) && openAreaGateStateRef.current === 'closing')
      ) {
        openAreaGateStateRef.current = 'closed'
        openedGatesRef.current.delete('openarea')
        setGateColliderEnabled('openarea', true)
      } else if (
        /racingarea_isolated_open/i.test(clipName) ||
        (/open_?area_?open/i.test(clipName) && racingAreaGateStateRef.current === 'opening')
      ) {
        racingAreaGateStateRef.current = 'open'
        openedGatesRef.current.add('racingarea')
        setGateColliderEnabled('racingarea', false)
      } else if (
        /racingarea_isolated_close/i.test(clipName) ||
        (/open_?area_?close/i.test(clipName) && racingAreaGateStateRef.current === 'closing')
      ) {
        racingAreaGateStateRef.current = 'closed'
        openedGatesRef.current.delete('racingarea')
        setGateColliderEnabled('racingarea', true)
      } else if (/sim_?gate_?open/i.test(clipName)) {
        simGateStateRef.current = 'open'
        openedGatesRef.current.add('simulation')
        setGateColliderEnabled('simulation', false)
      } else if (/sim_?gate_?close/i.test(clipName)) {
        simGateStateRef.current = 'closed'
        openedGatesRef.current.delete('simulation')
        setGateColliderEnabled('simulation', true)
      }
    }

    mixer.addEventListener('finished', onFinished)
    return () => {
      mixer.removeEventListener('finished', onFinished)
    }
  }, [mixer])

  useEffect(() => {
    openedGatesRef.current.clear()
    movingGatesRef.current.clear()
    openAreaGateStateRef.current = 'closed'
    simGateStateRef.current = 'closed'

    // Stop gate actions and wall actions on mount so they do not auto-play
    Object.entries(actions).forEach(([name, action]) => {
      if (!action) return
      if (
        /open_?area/i.test(name) ||
        /sim_?gate/i.test(name) ||
        /simgate/i.test(name) ||
        /middle_section/i.test(name) ||
        /^stack$/i.test(name)
      ) {
        action.stop()
      }
    })
  }, [actions])

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        const standard = material as THREE.MeshStandardMaterial
        if ('envMapIntensity' in standard && standard.envMapIntensity === undefined) {
          standard.envMapIntensity = 1.1
        }
        if ('roughness' in standard && standard.roughness === undefined) standard.roughness = 0.58
      })
    })
  }, [gltf.scene])

  useEffect(() => {
    const plane1 = gltf.scene.getObjectByName('Airbus_320_1') ?? null
    const plane2 = gltf.scene.getObjectByName('Airbus_320_2') ?? null
    const actionEntries = Object.entries(actions)
    const plane2Actions = actionEntries
      .filter(([name]) => /airbus_320_2/i.test(name))
      .map(([, action]) => action)
      .filter(Boolean) as THREE.AnimationAction[]
    const plane1Actions = actionEntries
      .filter(([name, action]) => {
        if (!action) return false
        if (plane2Actions.includes(action)) return false
        if (
          /open_?area/i.test(name) ||
          /sim_?gate/i.test(name) ||
          /simgate/i.test(name) ||
          /middle_section/i.test(name) ||
          /wall/i.test(name) ||
          /^stack$/i.test(name)
        ) {
          return false
        }
        return true
      })
      .map(([, action]) => action) as THREE.AnimationAction[]

    if (plane1) plane1.visible = false
    if (plane2) plane2.visible = false

    Object.values(actions).forEach((action) => {
      if (!action) return
      const clipName = action.getClip().name
      if (
        /open_?area/i.test(clipName) ||
        /sim_?gate/i.test(clipName) ||
        /simgate/i.test(clipName) ||
        /middle_section/i.test(clipName) ||
        /wall/i.test(clipName) ||
        /^stack$/i.test(clipName)
      ) {
        return
      }
      action.stop()
      action.setLoop(THREE.LoopOnce, 1)
      action.clampWhenFinished = false
      action.enabled = true
      action.timeScale = 1
    })

    aircraftRef.current = {
      plane1,
      plane2,
      plane1Actions,
      plane2Actions,
      activePlane: null,
      activeStartedAt: 0,
      lastTriggeredSlot: 0,
      activeDuration: 0,
    }

    return () => {
      Object.values(actions).forEach((action) => {
        if (!action) return
        if (
          /open_?area/i.test(action.getClip().name) ||
          /sim_?gate/i.test(action.getClip().name) ||
          /simgate/i.test(action.getClip().name) ||
          /middle_section/i.test(action.getClip().name) ||
          /wall/i.test(action.getClip().name)
        ) {
          return
        }
        action.stop()
      })
      if (plane1) plane1.visible = false
      if (plane2) plane2.visible = false
    }
  }, [actions, gltf.scene])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05)

    // Smooth unlock animation for formula_car_entrance_stopp
    if (
      formulaCarUnlockedRef.current &&
      formulaCarEntranceObjectRef.current &&
      formulaCarEntranceObjectRef.current.visible
    ) {
      formulaCarDissolveRef.current = Math.min(formulaCarDissolveRef.current + dt * 1.5, 1.0)
      const t = formulaCarDissolveRef.current
      const obj = formulaCarEntranceObjectRef.current
      const scale = Math.max(0.001, 1.0 - t)
      obj.scale.set(scale, scale, scale)
      obj.position.y -= dt * 2.5
      const mats = formulaCarMaterialsRef.current
      for (let i = 0; i < mats.length; i++) {
        mats[i].transparent = true
        mats[i].opacity = Math.max(0, 1.0 - t)
      }
      if (t >= 1.0) {
        obj.visible = false
      }
    }

    const aircraft = aircraftRef.current
    const elapsed = clock.getElapsedTime()
    const elapsedSlot = Math.floor(elapsed / AIRCRAFT_INTERVAL_SECONDS)

    if (aircraft.activePlane && elapsed - aircraft.activeStartedAt >= aircraft.activeDuration) {
      const activeActions = aircraft.activePlane === 1 ? aircraft.plane1Actions : aircraft.plane2Actions
      activeActions.forEach((action) => action.stop())
      if (aircraft.plane1) aircraft.plane1.visible = false
      if (aircraft.plane2) aircraft.plane2.visible = false
      aircraft.activePlane = null
      aircraft.activeDuration = 0
    }

    if (elapsedSlot === 0 || elapsedSlot === aircraft.lastTriggeredSlot || aircraft.activePlane) return

    const nextPlane = elapsedSlot % 2 === 1 ? 1 : 2
    const activeObject = nextPlane === 1 ? aircraft.plane1 : aircraft.plane2
    const inactiveObject = nextPlane === 1 ? aircraft.plane2 : aircraft.plane1
    const activeActions = nextPlane === 1 ? aircraft.plane1Actions : aircraft.plane2Actions
    const inactiveActions = nextPlane === 1 ? aircraft.plane2Actions : aircraft.plane1Actions

    inactiveActions.forEach((action) => action.stop())
    if (inactiveObject) inactiveObject.visible = false
    if (activeObject) activeObject.visible = true

    const duration = activeActions.reduce((longest, action) => {
      action.reset()
      action.setLoop(THREE.LoopOnce, 1)
      action.clampWhenFinished = false
      action.enabled = true
      action.timeScale = 1
      action.play()
      return Math.max(longest, action.getClip().duration)
    }, 0)

    aircraft.activePlane = nextPlane
    aircraft.activeStartedAt = elapsed
    aircraft.activeDuration = Math.max(duration, 1)
    aircraft.lastTriggeredSlot = elapsedSlot
  })

  useEffect(() => {
    onReady(metadata)
  }, [metadata, onReady])

  return <primitive object={gltf.scene} />
}

useGLTF.preload(MODEL_URL)
