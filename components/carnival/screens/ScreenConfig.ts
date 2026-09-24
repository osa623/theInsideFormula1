export const EXHIBITION_SCREEN_CONFIG = {
  inside1: {
    id: 'inside1',
    objectName: 'inside_screen',
    layoutFamily: 'inside',
    interactive: false,
    title: '2026 FORMULA 1 WORLD CHAMPIONSHIP',
    subtitle: 'OFFICIAL TELEMETRY & LIVE STANDINGS',
    maxViewDistance: 45.0,
    staggerDelayMs: 0,
    resolution: { width: 1920, height: 465 },
    distanceFactor: 8.0,
  },

  inside2: {
    id: 'inside2',
    objectName: 'inside_screen_2',
    layoutFamily: 'inside',
    interactive: false,
    title: '2026 FORMULA 1 DRIVER ARCHIVE',
    subtitle: 'CURRENT GRID PROFILES & CAREER STATISTICS',
    maxViewDistance: 45.0,
    staggerDelayMs: 2000,
    resolution: { width: 1920, height: 465 },
    distanceFactor: 8.0,
  },

  big1: {
    id: 'big1',
    objectName: 'Big_Screen1',
    layoutFamily: 'big',
    interactive: false,
    title: '2026 FIA FORMULA 1 WORLD CHAMPIONSHIP CALENDAR',
    subtitle: 'OFFICIAL SEASON SCHEDULE & RESULTS',
    maxViewDistance: 120.0,
    staggerDelayMs: 4000,
    resolution: { width: 1920, height: 844 },
    distanceFactor: 7.2,
  },

  big2: {
    id: 'big2',
    objectName: 'Big_Screen2',
    layoutFamily: 'big',
    interactive: false,
    title: 'GRAND PRIX & CIRCUIT INTELLIGENCE',
    subtitle: 'TECHNICAL CIRCUIT METRICS & RACE STORY',
    maxViewDistance: 120.0,
    staggerDelayMs: 6000,
    resolution: { width: 1920, height: 844 },
    distanceFactor: 7.2,
  },

  computer: {
    id: 'computer',
    objectName: 'Computer_Screen',
    layoutFamily: 'computer',
    interactive: true,
    title: 'F1 DRIVING ACADEMY EVALUATION KIOSK',
    subtitle: 'ENGINEERING & REGULATORY CERTIFICATION',
    interactionDistance: 4.5,
    maxViewDistance: 12.0,
    resolution: { width: 760, height: 420 },
    distanceFactor: 1.0,
  },

  tyreTech: {
    id: 'tyreTech',
    objectName: 'Extra_Screens_Tyre.1',
    layoutFamily: 'information',
    interactive: false,
    title: 'TYRE TECHNOLOGY',
    subtitle: 'THE CONTACT THAT MAKES THE DIFFERENCE',
    maxViewDistance: 250.0,
    staggerDelayMs: 0,
    resolution: { width: 1920, height: 1080 },
    dataFile: 'tyres.json',
  },

  chassisTech: {
    id: 'chassisTech',
    objectName: 'Extra_Screens_Chassis.1',
    layoutFamily: 'information',
    interactive: false,
    title: 'CHASSIS TECHNOLOGY',
    subtitle: 'STRUCTURE, SAFETY & LOAD PATHS',
    maxViewDistance: 250.0,
    staggerDelayMs: 1800,
    resolution: { width: 1920, height: 1080 },
    dataFile: 'chassis.json',
  },

  formulaTech: {
    id: 'formulaTech',
    objectName: 'Extra_Screens_Formula.1',
    layoutFamily: 'information',
    interactive: false,
    title: 'FORMULA RACING',
    subtitle: 'CATEGORY ECOSYSTEM & DEVELOPMENT PATHWAYS',
    maxViewDistance: 250.0,
    staggerDelayMs: 3600,
    resolution: { width: 1920, height: 1080 },
    dataFile: 'formula.json',
  },

  trackTech: {
    id: 'trackTech',
    objectName: 'Extra_Screens_Track.1',
    layoutFamily: 'information',
    interactive: false,
    title: 'CIRCUIT TECHNOLOGY',
    subtitle: 'TRACK DESIGN, DEMANDS & HISTORY',
    maxViewDistance: 250.0,
    staggerDelayMs: 5400,
    resolution: { width: 1920, height: 1080 },
    dataFile: 'tracks.json',
  },
} as const

export const AUTOPLAY_TIMINGS = {
  intro: 5000,
  standings: 14000,
  graph: 12000,
  momentum: 12000,
  constructors: 13000,
  leader: 10000,

  gridOverview: 10000,
  driverProfile: 14000,
  driverStats: 10000,
  driverHistory: 12000,
  driverResults: 10000,

  calendar: 12000,
  completedRaces: 14000,
  nextRace: 12000,
  remainingCalendar: 12000,
  seasonProgress: 9000,

  raceProfile: 12000,
  podiumCeremony: 12000,
  circuitProfile: 11000,
  nextDestination: 10000,
  seasonJourney: 11000,

  transition: 900,
} as const

export const DEBUG_SCREENS = false

// Backwards compatibility export
export const SCREEN_CONFIG = {
  wide: {
    phaseInterval: 14000,
    ...EXHIBITION_SCREEN_CONFIG.inside1,
  },
  large: {
    sceneInterval: 12000,
    ...EXHIBITION_SCREEN_CONFIG.inside2,
  },
  monitor: {
    ...EXHIBITION_SCREEN_CONFIG.computer,
  },
  ...EXHIBITION_SCREEN_CONFIG,
}
