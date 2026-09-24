import * as THREE from 'three'

export type CarnivalDestinationId =
  | 'simulation'
  | 'pit'
  | 'exhibition'
  | 'openarea'
  | 'racingarea'
  | 'exhibitionHall02'

export type ExplainZoneId = 'pitstop' | 'strategy' | 'engineering' | 'track'

export type CarnivalGateId = 'openarea' | 'simulation' | 'racingarea'

export interface CarnivalEntrance {
  id: CarnivalDestinationId
  objectName: string
  label: string
  title: string
  eyebrow: string
  description: string
  image: string
  href: string
  accent: string
  mode: string
  difficulty: string
  rewards: string
  actionLabel: string
  position: THREE.Vector3
  triggerBox: THREE.Box3
}

export interface CarnivalExplainZone {
  id: ExplainZoneId
  objectName: string
  label: string
  title: string
  eyebrow: string
  description: string
  image: string
  accent: string
  position: THREE.Vector3
  triggerBox: THREE.Box3
}

export interface ChampionSection {
  year: number
  objectName: string
  position: THREE.Vector3
  triggerBox: THREE.Box3
  cameraPosition: THREE.Vector3
  lookAtPosition: THREE.Vector3
}

export interface AboutSectionTrigger {
  objectName: string
  position: THREE.Vector3
  triggerBox: THREE.Box3
}

export interface ExamTrigger {
  objectName: string
  position: THREE.Vector3
  triggerBox: THREE.Box3
  screenPosition: THREE.Vector3
  screenCameraPosition: THREE.Vector3
}

export interface ExamBoard {
  id: string
  number: number
  objectName: string
  label: string
  position: THREE.Vector3
  triggerBox: THREE.Box3
  cameraPosition: THREE.Vector3
  lookAtPosition: THREE.Vector3
}

export interface InformationScreenTrigger {
  id: 'tyreTech' | 'chassisTech' | 'trackTech' | 'formulaTech'
  symbolName: string
  screenObjectName: string
  title: string
  subtitle: string
  position: THREE.Vector3
  triggerBox: THREE.Box3
  cameraPosition: THREE.Vector3
  lookAtPosition: THREE.Vector3
}

export interface MapTrigger {
  objectName: string
  position: THREE.Vector3
  triggerBox: THREE.Box3
  cameraPosition: THREE.Vector3
  lookAtPosition: THREE.Vector3
}

export type GameStationId = 'GAME_STATION_7' | 'GAME_STATION_8'

export interface GameStationTrigger {
  stationId: GameStationId
  triggerObjectName: string
  screenObjectName: string
  title: string
  subtitle: string
  position: THREE.Vector3
  triggerBox: THREE.Box3
  cameraPosition: THREE.Vector3
  lookAtPosition: THREE.Vector3
  returnTransform: {
    position: THREE.Vector3
    yaw: number
    pitch: number
  }
}

export type ExhibitionScreenId =
  | 'inside1'
  | 'inside2'
  | 'big1'
  | 'big2'
  | 'computer'
  | 'monitor'
  | 'wide'
  | 'large'
  | 'tyreTech'
  | 'chassisTech'
  | 'formulaTech'
  | 'trackTech'

export interface ScreenAnchor {
  id: ExhibitionScreenId
  objectName: string
  position: THREE.Vector3
  rotation: THREE.Euler
  quaternion: THREE.Quaternion
  scale: THREE.Vector3
  dimensions: { width: number; height: number }
  triggerBox?: THREE.Box3
  cameraPosition?: THREE.Vector3
  lookAtPosition?: THREE.Vector3
}

export interface CarnivalMetadata {
  spawnPosition: THREE.Vector3
  spawnQuaternion: THREE.Quaternion
  walkableMeshes: THREE.Mesh[]
  walkableBoxes: THREE.Box3[]
  obstacleBoxes: THREE.Box3[]
  entrances: CarnivalEntrance[]
  explainZones: CarnivalExplainZone[]
  championSections: ChampionSection[]
  examBoards: ExamBoard[]
  examTrigger: ExamTrigger | null
  formulaCarTrigger?: ExamTrigger | null
  aboutTrigger?: AboutSectionTrigger | null
  infoScreenTriggers?: InformationScreenTrigger[]
  mapTrigger?: MapTrigger | null
  gameStations?: GameStationTrigger[]
  screens?: {
    inside1: ScreenAnchor | null
    inside2: ScreenAnchor | null
    big1: ScreenAnchor | null
    big2: ScreenAnchor | null
    computer: ScreenAnchor | null
    // Backwards compatibility aliases
    monitor?: ScreenAnchor | null
    wide?: ScreenAnchor | null
    large?: ScreenAnchor | null
    tyreTech?: ScreenAnchor | null
    chassisTech?: ScreenAnchor | null
    formulaTech?: ScreenAnchor | null
    trackTech?: ScreenAnchor | null
  }
  occluders?: THREE.Object3D[]
  playAnimation?: (animName: string) => void
  openGate?: (gateId: CarnivalGateId) => void
  closeGate?: (gateId: CarnivalGateId) => void
  toggleGate?: (gateId: CarnivalGateId) => void
  isGateOpen?: (gateId: CarnivalGateId) => boolean
  unlockFormulaCarEntrance?: () => void
  isFormulaCarUnlocked?: () => boolean
  hideObject?: (name: string) => void
  showObject?: (name: string) => void
}
