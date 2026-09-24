import * as THREE from 'three'
import {
  ChampionshipGraphData,
  ConstructorProfile,
  DriverHistoryRecord,
  DriverProfile,
  f1DataService,
  RaceEvent,
} from '@/lib/f1/f1DataService'
import { AUTOPLAY_TIMINGS, EXHIBITION_SCREEN_CONFIG } from './ScreenConfig'
import {
  InsideScreen1Scene,
  InsideScreen2Scene,
  InsideScreenLayoutSystem,
} from './InsideScreenLayoutSystem'
import {
  BigScreen1Scene,
  BigScreen2Scene,
  BigScreenLayoutSystem,
} from './BigScreenLayoutSystem'
import { ScreenSurfaceRenderer } from './ScreenSurfaceRenderer'

export interface IExhibitionScreenController {
  initialize(): void
  start(): void
  pause(): void
  resume(): void
  updateData(): void
  setVisible(visible: boolean): void
  dispose(): void
}

/**
 * Controller for inside_screen (2026 Championship Status)
 */
export class InsideScreen1Controller implements IExhibitionScreenController {
  private renderer: ScreenSurfaceRenderer
  private currentScene: InsideScreen1Scene = 'intro'
  private isRunning = false
  private isVisible = true
  private timer: any = null

  private drivers: DriverProfile[] = []
  private constructors: ConstructorProfile[] = []
  private graphData: ChampionshipGraphData | null = null

  private scenes: { scene: InsideScreen1Scene; duration: number }[] = [
    { scene: 'intro', duration: AUTOPLAY_TIMINGS.intro },
    { scene: 'standings', duration: AUTOPLAY_TIMINGS.standings },
    { scene: 'bargraph', duration: AUTOPLAY_TIMINGS.graph },
    { scene: 'momentum', duration: AUTOPLAY_TIMINGS.momentum },
    { scene: 'constructors', duration: AUTOPLAY_TIMINGS.constructors },
    { scene: 'leader', duration: AUTOPLAY_TIMINGS.leader },
  ]
  private sceneIdx = 0
  private unsubscribe?: () => void

  constructor(mesh: THREE.Mesh) {
    const { width, height } = EXHIBITION_SCREEN_CONFIG.inside1.resolution
    this.renderer = new ScreenSurfaceRenderer(mesh, width, height)
  }

  public initialize(): void {
    this.updateData()
    this.renderScene()
    this.unsubscribe = f1DataService.subscribe(() => {
      this.updateData()
    })
  }

  public updateData(): void {
    this.drivers = f1DataService.getCurrentStandings()
    this.constructors = f1DataService.getConstructorStandings()
    this.graphData = f1DataService.getChampionshipGraphData()
    if (this.isVisible) this.renderScene()
  }

  public start(): void {
    this.isRunning = true
    this.renderScene()
    // Staggered offset: 0s
    setTimeout(() => {
      if (this.isRunning) this.scheduleNextScene()
    }, EXHIBITION_SCREEN_CONFIG.inside1.staggerDelayMs)
  }

  public pause(): void {
    this.isRunning = false
    if (this.timer) clearTimeout(this.timer)
  }

  public resume(): void {
    if (!this.isRunning) {
      this.isRunning = true
      this.scheduleNextScene()
    }
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible
    if (visible) {
      this.renderScene()
      this.resume()
    } else {
      this.pause()
    }
  }

  public nextScene(): void {
    this.sceneIdx = (this.sceneIdx + 1) % this.scenes.length
    this.currentScene = this.scenes[this.sceneIdx].scene
    this.renderScene()
  }

  public renderScene(): void {
    InsideScreenLayoutSystem.renderInside1(
      this.renderer.ctx,
      this.currentScene,
      this.drivers,
      this.constructors,
      this.graphData
    )
    this.renderer.markNeedsUpdate()
  }

  public scheduleNextScene(): void {
    if (!this.isRunning) return
    const dur = this.scenes[this.sceneIdx].duration
    this.timer = setTimeout(() => {
      this.nextScene()
      this.scheduleNextScene()
    }, dur)
  }

  public dispose(): void {
    this.pause()
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = undefined
    }
    this.renderer.dispose()
  }
}

/**
 * Controller for inside_screen_2 (2026 Grid & Driver Profiles)
 */
export class InsideScreen2Controller implements IExhibitionScreenController {
  private renderer: ScreenSurfaceRenderer
  private currentScene: InsideScreen2Scene = 'grid'
  private isRunning = false
  private isVisible = true
  private timer: any = null

  private drivers: DriverProfile[] = []
  private activeDriverIdx = 0
  private history: DriverHistoryRecord | null = null

  private scenes: { scene: InsideScreen2Scene; duration: number }[] = [
    { scene: 'grid', duration: AUTOPLAY_TIMINGS.gridOverview },
    { scene: 'profile', duration: AUTOPLAY_TIMINGS.driverProfile },
    { scene: 'seasonStats', duration: AUTOPLAY_TIMINGS.driverStats },
    { scene: 'careerStats', duration: AUTOPLAY_TIMINGS.driverStats },
    { scene: 'timeline', duration: AUTOPLAY_TIMINGS.driverHistory },
    { scene: 'results', duration: AUTOPLAY_TIMINGS.driverResults },
  ]
  private sceneIdx = 0

  private unsubscribe?: () => void

  constructor(mesh: THREE.Mesh) {
    const { width, height } = EXHIBITION_SCREEN_CONFIG.inside2.resolution
    this.renderer = new ScreenSurfaceRenderer(mesh, width, height)
  }

  public initialize(): void {
    this.updateData()
    this.renderScene()
    this.unsubscribe = f1DataService.subscribe(() => {
      this.updateData()
    })
  }

  public updateData(): void {
    this.drivers = f1DataService.getCurrentDrivers()
    const activeDriver = this.drivers[this.activeDriverIdx] || null
    if (activeDriver) {
      this.history = f1DataService.getDriverHistory(activeDriver.id)
    }
    if (this.isVisible) this.renderScene()
  }

  public start(): void {
    this.isRunning = true
    this.renderScene()
    // Staggered offset: +2s
    setTimeout(() => {
      if (this.isRunning) this.scheduleNextScene()
    }, EXHIBITION_SCREEN_CONFIG.inside2.staggerDelayMs)
  }

  public pause(): void {
    this.isRunning = false
    if (this.timer) clearTimeout(this.timer)
  }

  public resume(): void {
    if (!this.isRunning) {
      this.isRunning = true
      this.scheduleNextScene()
    }
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible
    if (visible) {
      this.renderScene()
      this.resume()
    } else {
      this.pause()
    }
  }

  public nextScene(): void {
    this.sceneIdx = (this.sceneIdx + 1) % this.scenes.length
    this.currentScene = this.scenes[this.sceneIdx].scene

    // Advance to next driver when returning to grid
    if (this.sceneIdx === 0) {
      this.activeDriverIdx = (this.activeDriverIdx + 1) % Math.min(this.drivers.length || 1, 8)
      const activeDriver = this.drivers[this.activeDriverIdx] || null
      if (activeDriver) {
        this.history = f1DataService.getDriverHistory(activeDriver.id)
      }
    }

    this.renderScene()
  }

  public renderScene(): void {
    const activeDriver = this.drivers[this.activeDriverIdx] || this.drivers[0] || null
    InsideScreenLayoutSystem.renderInside2(
      this.renderer.ctx,
      this.currentScene,
      this.drivers,
      activeDriver,
      this.history
    )
    this.renderer.markNeedsUpdate()
  }

  public scheduleNextScene(): void {
    if (!this.isRunning) return
    const dur = this.scenes[this.sceneIdx].duration
    this.timer = setTimeout(() => {
      this.nextScene()
      this.scheduleNextScene()
    }, dur)
  }

  public dispose(): void {
    this.pause()
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = undefined
    }
    this.renderer.dispose()
  }
}

/**
 * Controller for Big_Screen1 (2026 Racing Calendar)
 */
export class BigScreen1Controller implements IExhibitionScreenController {
  private renderer: ScreenSurfaceRenderer
  private currentScene: BigScreen1Scene = 'calendar'
  private isRunning = false
  private isVisible = true
  private timer: any = null
  private unsubscribe?: () => void

  private allRaces: RaceEvent[] = []
  private completedRaces: RaceEvent[] = []
  private remainingRaces: RaceEvent[] = []
  private nextRace: RaceEvent | null = null

  private scenes: { scene: BigScreen1Scene; duration: number }[] = [
    { scene: 'calendar', duration: AUTOPLAY_TIMINGS.calendar },
    { scene: 'completed', duration: AUTOPLAY_TIMINGS.completedRaces },
    { scene: 'nextRace', duration: AUTOPLAY_TIMINGS.nextRace },
    { scene: 'remaining', duration: AUTOPLAY_TIMINGS.remainingCalendar },
    { scene: 'progress', duration: AUTOPLAY_TIMINGS.seasonProgress },
  ]
  private sceneIdx = 0

  constructor(mesh: THREE.Mesh) {
    const { width, height } = EXHIBITION_SCREEN_CONFIG.big1.resolution
    this.renderer = new ScreenSurfaceRenderer(mesh, width, height)
  }

  public initialize(): void {
    this.updateData()
    this.renderScene()
    this.unsubscribe = f1DataService.subscribe(() => {
      this.updateData()
    })
  }

  public updateData(): void {
    this.allRaces = f1DataService.get2026Calendar()
    this.completedRaces = f1DataService.get2026CompletedRaces()
    this.remainingRaces = f1DataService.get2026RemainingRaces()
    this.nextRace = f1DataService.getNextRace()
    if (this.isVisible) this.renderScene()
  }

  public start(): void {
    this.isRunning = true
    this.renderScene()
    // Staggered offset: +4s
    setTimeout(() => {
      if (this.isRunning) this.scheduleNextScene()
    }, EXHIBITION_SCREEN_CONFIG.big1.staggerDelayMs)
  }

  public pause(): void {
    this.isRunning = false
    if (this.timer) clearTimeout(this.timer)
  }

  public resume(): void {
    if (!this.isRunning) {
      this.isRunning = true
      this.scheduleNextScene()
    }
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible
    if (visible) {
      this.renderScene()
      this.resume()
    } else {
      this.pause()
    }
  }

  public nextScene(): void {
    this.sceneIdx = (this.sceneIdx + 1) % this.scenes.length
    this.currentScene = this.scenes[this.sceneIdx].scene
    this.renderScene()
  }

  public renderScene(): void {
    BigScreenLayoutSystem.renderBig1(
      this.renderer.ctx,
      this.currentScene,
      this.allRaces,
      this.completedRaces,
      this.remainingRaces,
      this.nextRace
    )
    this.renderer.markNeedsUpdate()
  }

  public scheduleNextScene(): void {
    if (!this.isRunning) return
    const dur = this.scenes[this.sceneIdx].duration
    this.timer = setTimeout(() => {
      this.nextScene()
      this.scheduleNextScene()
    }, dur)
  }

  public dispose(): void {
    this.pause()
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = undefined
    }
    this.renderer.dispose()
  }
}

/**
 * Controller for Big_Screen2 (Grand Prix & Circuit Intelligence)
 */
export class BigScreen2Controller implements IExhibitionScreenController {
  private renderer: ScreenSurfaceRenderer
  private currentScene: BigScreen2Scene = 'spotlight'
  private isRunning = false
  private isVisible = true
  private timer: any = null
  private unsubscribe?: () => void

  private latestRace: any = null
  private nextRace: RaceEvent | null = null
  private allRaces: RaceEvent[] = []

  private scenes: { scene: BigScreen2Scene; duration: number }[] = [
    { scene: 'spotlight', duration: AUTOPLAY_TIMINGS.raceProfile },
    { scene: 'podium', duration: AUTOPLAY_TIMINGS.podiumCeremony },
    { scene: 'circuit', duration: AUTOPLAY_TIMINGS.circuitProfile },
    { scene: 'destination', duration: AUTOPLAY_TIMINGS.nextDestination },
    { scene: 'journey', duration: AUTOPLAY_TIMINGS.seasonJourney },
  ]
  private sceneIdx = 0

  constructor(mesh: THREE.Mesh) {
    const { width, height } = EXHIBITION_SCREEN_CONFIG.big2.resolution
    this.renderer = new ScreenSurfaceRenderer(mesh, width, height)
  }

  public initialize(): void {
    this.updateData()
    this.renderScene()
    this.unsubscribe = f1DataService.subscribe(() => {
      this.updateData()
    })
  }

  public updateData(): void {
    this.latestRace = f1DataService.getLatestRaceInfo()
    this.nextRace = f1DataService.getNextRace()
    this.allRaces = f1DataService.get2026Calendar()
    if (this.isVisible) this.renderScene()
  }

  public start(): void {
    this.isRunning = true
    this.renderScene()
    // Staggered offset: +6s
    setTimeout(() => {
      if (this.isRunning) this.scheduleNextScene()
    }, EXHIBITION_SCREEN_CONFIG.big2.staggerDelayMs)
  }

  public pause(): void {
    this.isRunning = false
    if (this.timer) clearTimeout(this.timer)
  }

  public resume(): void {
    if (!this.isRunning) {
      this.isRunning = true
      this.scheduleNextScene()
    }
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible
    if (visible) {
      this.renderScene()
      this.resume()
    } else {
      this.pause()
    }
  }

  public nextScene(): void {
    this.sceneIdx = (this.sceneIdx + 1) % this.scenes.length
    this.currentScene = this.scenes[this.sceneIdx].scene
    this.renderScene()
  }

  public renderScene(): void {
    BigScreenLayoutSystem.renderBig2(
      this.renderer.ctx,
      this.currentScene,
      this.latestRace,
      this.nextRace,
      this.allRaces
    )
    this.renderer.markNeedsUpdate()
  }

  public scheduleNextScene(): void {
    if (!this.isRunning) return
    const dur = this.scenes[this.sceneIdx].duration
    this.timer = setTimeout(() => {
      this.nextScene()
      this.scheduleNextScene()
    }, dur)
  }

  public dispose(): void {
    this.pause()
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = undefined
    }
    this.renderer.dispose()
  }
}
