export type MiniGameStationId = 'GAME_STATION_7' | 'GAME_STATION_8'

export interface CarState {
  id: string
  name: string
  color: string
  accentColor: string
  x: number
  y: number
  angle: number // radians (0 = pointing right)
  speed: number
  angularVelocity: number
  isPlayer: boolean
  currentWaypoint: number
  currentLap: number
  checkpointPassed: boolean
  lapTimes: number[]
  bestLapTime: number | null
  finished: boolean
  finishTime: number | null
  raceDistance: number
  // Cockpit & steering telemetry
  steerAngle: number // -1 (full left) to +1 (full right)
  gear: number
  rpmRatio: number // 0 to 1
  drsActive: boolean
  // AI specific
  targetSpeed: number
  lateralOffset: number
  steerP: number
}

export type RaceStatus = 'COUNTDOWN' | 'RACING' | 'FINISHED'

export interface LeaderboardEntry {
  id: string
  name: string
  color: string
  isPlayer: boolean
  position: number
  currentLap: number
  totalLaps: number
  finished: boolean
  finishTime: number | null
}

export interface RaceState {
  status: RaceStatus
  countdownNumber: number // 3, 2, 1, 0 (GO)
  totalLaps: number
  raceTimeMs: number
  leaderboard: LeaderboardEntry[]
  winner: string | null
  // Player telemetry for HUD
  playerSpeedKmh: number
  playerGear: number
  playerRpmRatio: number
  playerDrsActive: boolean
}

export interface TrackPoint {
  x: number
  y: number
}

export const GAME_CONFIG = {
  TOTAL_LAPS: 3,
  AI_COUNT: 4, // 4 AI + 1 Player = 5 cars
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  ROAD_WIDTH: 160,
  PLAYER_MAX_SPEED: 520, // ~340 km/h top speed
  PLAYER_ACCEL: 310,
  PLAYER_BRAKE: 480,
  PLAYER_REVERSE_SPEED: -120,
  STEER_SPEED: 3.2,
  DRIFT_FACTOR: 0.94,
  GRASS_SLOWDOWN: 0.38,
}
