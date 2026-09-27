import * as THREE from 'three'

export interface CarnivalLocationState {
  location: string
  section: string | null
  trigger: string | null
}

export interface AuthoritativeZoneDef {
  id: string
  location: string
  section: string | null
  trigger: string | null
  priority: number
  contains: (x: number, z: number) => boolean
}

/**
 * Authoritative World / Location Map based on exact Blender scene nodes:
 * 1. Holohraphic_Main_01 -> Exhibition Hall Entrance
 * 2. Path -> Main Carnival Path
 * 3. Car_Park_Path -> Car Park
 * 4. Path_Area -> Educational Zone
 *    - Symmbol.004 -> F1 Tyres
 *    - Symmbol.003 -> F1 Chassis
 *    - Symmbol.002 -> F1 Tracks
 *    - Symmbol.001 -> Formula Franchise
 * 5. Racing_Path -> Second Main Area
 * 6. Racing_Champion_Section_path -> Championship Section
 * 7. Walking_Path_Racing_Exam -> Exam Section
 * 8. Real_Racing_Entering_Path -> Gaming Area
 */
const AUTHORITATIVE_ZONES: AuthoritativeZoneDef[] = [
  // ── High Priority: Specific Educational Symbol Triggers ──
  {
    id: 'symmbol-004',
    location: 'Educational Zone',
    section: 'tyres',
    trigger: 'Symmbol.004',
    priority: 100,
    contains: (x, z) => Math.hypot(x - (-68.34), z - 74.29) < 6.8,
  },
  {
    id: 'symmbol-003',
    location: 'Educational Zone',
    section: 'chassis',
    trigger: 'Symmbol.003',
    priority: 100,
    contains: (x, z) => Math.hypot(x - (-52.82), z - 74.29) < 6.8,
  },
  {
    id: 'symmbol-002',
    location: 'Educational Zone',
    section: 'tracks',
    trigger: 'Symmbol.002',
    priority: 100,
    contains: (x, z) => Math.hypot(x - (-38.01), z - 74.29) < 6.8,
  },
  {
    id: 'symmbol-001',
    location: 'Educational Zone',
    section: 'formula-franchise',
    trigger: 'Symmbol.001',
    priority: 100,
    contains: (x, z) => Math.hypot(x - (-23.49), z - 74.29) < 6.8,
  },

  // ── High Priority: Exhibition Entrance ──
  {
    id: 'exhibition-entrance',
    location: 'Exhibition Hall Entrance',
    section: null,
    trigger: 'Holohraphic_Main_01',
    priority: 95,
    contains: (x, z) => Math.hypot(x - 0.08, z - (-7.04)) < 8.0 || (Math.abs(x) < 8.0 && z < 2.0),
  },

  // ── High Priority: Sub-areas of the Second Main Area ──
  {
    id: 'gaming-area',
    location: 'Gaming Area',
    section: 'gaming',
    trigger: 'Real_Racing_Entering_Path',
    priority: 85,
    contains: (x, z) => x >= 48.0 && x <= 78.0 && z >= 126.0 && z <= 170.0,
  },
  {
    id: 'exam-section',
    location: 'Exam Section',
    section: 'exam',
    trigger: 'Walking_Path_Racing_Exam',
    priority: 85,
    contains: (x, z) => x >= 10.0 && x <= 48.0 && z >= 128.0 && z <= 198.0,
  },
  {
    id: 'championship-section',
    location: 'Championship Section',
    section: 'championship',
    trigger: 'Racing_Champion_Section_path',
    priority: 85,
    contains: (x, z) => x >= -72.0 && x <= 8.0 && z >= 136.0 && z <= 172.0,
  },

  // ── Medium Priority: Major Areas ──
  {
    id: 'second-main-area',
    location: 'Second Main Area',
    section: null,
    trigger: 'Racing_Path',
    priority: 50,
    contains: (x, z) => z >= 102.0,
  },
  {
    id: 'educational-zone',
    location: 'Educational Zone',
    section: null,
    trigger: 'Path_Area',
    priority: 50,
    contains: (x, z) => x <= -8.0 && z >= 46.0 && z <= 102.0,
  },
  {
    id: 'car-park',
    location: 'Car Park',
    section: null,
    trigger: 'Car_Park_Path',
    priority: 50,
    contains: (x, z) => x >= 4.0 && z >= 46.0 && z <= 82.0,
  },

  // ── Base Priority: Main Carnival Path ──
  {
    id: 'main-path',
    location: 'Main Carnival Path',
    section: null,
    trigger: 'Path',
    priority: 10,
    contains: (_x, _z) => true, // Fallback default path
  },
]

// Sort descending by priority once
const SORTED_ZONES = [...AUTHORITATIVE_ZONES].sort((a, b) => b.priority - a.priority)

let lastLoggedLocation: string | null = null

/**
 * Resolves current live location deterministically from player coordinates.
 * The highest priority match that contains (px, pz) wins immediately.
 */
export function getLiveCarnivalLocation(pos: THREE.Vector3): CarnivalLocationState {
  const px = pos.x
  const pz = pos.z

  for (const zone of SORTED_ZONES) {
    if (zone.contains(px, pz)) {
      const state: CarnivalLocationState = {
        location: zone.location,
        section: zone.section,
        trigger: zone.trigger,
      }

      // Log location transitions for clear debugging
      if (lastLoggedLocation !== state.location) {
        if (lastLoggedLocation) {
          console.log(`[SmartGuide] Location changed: ${lastLoggedLocation} → ${state.location}`)
        }
        console.log(`[SmartGuide] Active location: ${state.location}`)
        lastLoggedLocation = state.location
      }

      return state
    }
  }

  return {
    location: 'Main Carnival Path',
    section: null,
    trigger: 'Path',
  }
}
