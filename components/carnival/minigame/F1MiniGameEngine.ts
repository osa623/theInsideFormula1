import { CarState, GAME_CONFIG, LeaderboardEntry, RaceState, TrackPoint } from './types'

export class F1MiniGameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animFrameId: number | null = null
  private lastTime = 0
  private running = false

  // Lengthy Real Grand Prix Circuit (~24,000 px long, 3 Grand Prix Sectors)
  public readonly waypoints: TrackPoint[] = [
    // Sector 1: Main Pit Straight & Prima Variante Chicane
    { x: 1500, y: 4800 }, // Waypoint 0: Start / Finish Line
    { x: 2100, y: 4800 },
    { x: 2700, y: 4800 },
    { x: 3300, y: 4800 },
    { x: 3900, y: 4800 }, // 150m Brake Board
    { x: 4200, y: 4800 }, // 50m Brake Board
    { x: 4480, y: 4620 }, // Turn 1 right apex (Prima Variante entry)
    { x: 4380, y: 4380 }, // Turn 2 left apex (Prima Variante exit)
    { x: 4550, y: 4100 }, // Straight acceleration out of Variante

    // Curva Biassono (Curva Grande - high speed sweeping right bend)
    { x: 4850, y: 3750 },
    { x: 5300, y: 3250 },
    { x: 5650, y: 2650 },
    { x: 5750, y: 2000 },
    { x: 5650, y: 1500 }, // Exit Curva Biassono

    // Sector 2: Variante della Roggia Chicane & Lesmo Corners
    { x: 5350, y: 1250 }, // Brake into Roggia (100m board)
    { x: 5050, y: 1380 }, // Turn 4 left apex (Roggia)
    { x: 4750, y: 1250 }, // Turn 5 right apex (Roggia exit)
    { x: 4350, y: 1050 }, // Run towards Lesmo 1
    { x: 3900, y: 1000 }, // Entry Lesmo 1
    { x: 3500, y: 1050 }, // Apex Lesmo 1 (90-deg fast right)
    { x: 3150, y: 1180 }, // Short chute between Lesmos
    { x: 2800, y: 1320 }, // Lesmo 2 entry
    { x: 2450, y: 1480 }, // Lesmo 2 apex & exit onto Serraglio

    // Serraglio High-Speed Straight (DRS Zone 2)
    { x: 2050, y: 1720 },
    { x: 1650, y: 2000 },
    { x: 1300, y: 2320 },
    { x: 1050, y: 2680 }, // Curvetta kink underbridge

    // Sector 3: Variante Ascari (Turns 8, 9, 10 fast rhythm chicane)
    { x: 880,  y: 3000 }, // 100m brake board Ascari
    { x: 740,  y: 3250 }, // Turn 8 left entry
    { x: 860,  y: 3520 }, // Turn 9 right flick
    { x: 680,  y: 3820 }, // Turn 10 left exit onto Rettifilo Posteriore

    // Rettifilo Posteriore (Long Back Straight)
    { x: 640,  y: 4200 }, // DRS acceleration zone
    { x: 620,  y: 4500 },
    { x: 650,  y: 4780 }, // 150m Brake Board Parabolica

    // Curva Parabolica (Curva Alboreto - legendary long radius sweeping corner)
    { x: 720,  y: 5050 }, // Parabolica entry
    { x: 880,  y: 5240 }, // Parabolica early apex
    { x: 1100, y: 5200 }, // Parabolica mid apex
    { x: 1280, y: 5050 }, // Parabolica late apex & wide acceleration exit
    { x: 1400, y: 4900 }, // Transition onto main straight
  ]

  // Track boundaries for mini-map bounding box
  private mapMinX = 500
  private mapMaxX = 5900
  private mapMinY = 800
  private mapMaxY = 5400

  // Cars
  public playerCar!: CarState
  public aiCars: CarState[] = []
  public allCars: CarState[] = []

  // Race state
  public raceState: RaceState = {
    status: 'COUNTDOWN',
    countdownNumber: 3,
    totalLaps: GAME_CONFIG.TOTAL_LAPS,
    raceTimeMs: 0,
    leaderboard: [],
    winner: null,
    playerSpeedKmh: 0,
    playerGear: 1,
    playerRpmRatio: 0,
    playerDrsActive: false,
  }

  // Countdown timer
  private countdownStartTime = 0

  // Input states
  private keys = {
    up: false,
    down: false,
    left: false,
    right: false,
  }

  // Dynamic steering visual angle (-1 to 1)
  private visualSteer = 0

  // Particle systems: skid marks, sparks, and tire smoke
  private skidmarks: { x: number; y: number; alpha: number }[] = []
  private sparks: { x: number; y: number; vx: number; vy: number; life: number }[] = []
  private smoke: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number }[] = []

  // Callback to inform UI
  public onStateUpdate?: (state: RaceState) => void

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not get 2D canvas context')
    this.ctx = context

    this.computeMapBounds()
    this.initCars()
  }

  private computeMapBounds(): void {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const wp of this.waypoints) {
      if (wp.x < minX) minX = wp.x
      if (wp.x > maxX) maxX = wp.x
      if (wp.y < minY) minY = wp.y
      if (wp.y > maxY) maxY = wp.y
    }
    this.mapMinX = minX - 300
    this.mapMaxX = maxX + 300
    this.mapMinY = minY - 300
    this.mapMaxY = maxY + 300
  }

  public initCars(): void {
    const p0 = this.waypoints[0]
    const p1 = this.waypoints[1]
    const startAngle = Math.atan2(p1.y - p0.y, p1.x - p0.x)

    // Player Car: Scuderia Red with full detailed chassis
    this.playerCar = {
      id: 'player',
      name: 'YOU (Scuderia)',
      color: '#e10600',
      accentColor: '#ffffff',
      x: p0.x + 50,
      y: p0.y - 30,
      angle: startAngle,
      speed: 0,
      angularVelocity: 0,
      isPlayer: true,
      currentWaypoint: 1,
      currentLap: 1,
      checkpointPassed: false,
      lapTimes: [],
      bestLapTime: null,
      finished: false,
      finishTime: null,
      raceDistance: 0,
      steerAngle: 0,
      gear: 1,
      rpmRatio: 0,
      drsActive: false,
      targetSpeed: GAME_CONFIG.PLAYER_MAX_SPEED,
      lateralOffset: 0,
      steerP: 3.4,
    }

    // AI Cars with distinct authentic liveries and competitive race pace
    const aiConfigs = [
      { id: 'ai-1', name: 'Verstappen (Red Bull)', color: '#001a30', accent: '#ffcc00', targetSpeed: 505, offset: -28, steerP: 3.6 },
      { id: 'ai-2', name: 'Hamilton (Mercedes)', color: '#cfd4dc', accent: '#00d2be', targetSpeed: 490, offset: 28, steerP: 3.5 },
      { id: 'ai-3', name: 'Norris (McLaren)', color: '#ff8000', accent: '#005aff', targetSpeed: 480, offset: -38, steerP: 3.4 },
      { id: 'ai-4', name: 'Alonso (Aston Martin)', color: '#00594f', accent: '#cedc00', targetSpeed: 470, offset: 38, steerP: 3.3 },
    ]

    this.aiCars = aiConfigs.slice(0, GAME_CONFIG.AI_COUNT).map((cfg, idx) => {
      const gridRow = idx + 1
      const gridSide = gridRow % 2 === 0 ? 1 : -1
      const gridX = p0.x - gridRow * 85
      const gridY = p0.y + gridSide * 30

      return {
        id: cfg.id,
        name: cfg.name,
        color: cfg.color,
        accentColor: cfg.accent,
        x: gridX,
        y: gridY,
        angle: startAngle,
        speed: 0,
        angularVelocity: 0,
        isPlayer: false,
        currentWaypoint: 1,
        currentLap: 1,
        checkpointPassed: false,
        lapTimes: [],
        bestLapTime: null,
        finished: false,
        finishTime: null,
        raceDistance: -gridRow * 80,
        steerAngle: 0,
        gear: 1,
        rpmRatio: 0,
        drsActive: false,
        targetSpeed: cfg.targetSpeed,
        lateralOffset: cfg.offset,
        steerP: cfg.steerP,
      }
    })

    this.allCars = [this.playerCar, ...this.aiCars]
    this.updateLeaderboard()
  }

  public start(): void {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    this.countdownStartTime = performance.now()
    this.raceState.status = 'COUNTDOWN'
    this.raceState.countdownNumber = 3
    this.raceState.raceTimeMs = 0
    this.raceState.winner = null

    this.bindEvents()
    this.loop()
  }

  public stop(): void {
    this.running = false
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
    this.unbindEvents()
  }

  public restart(): void {
    this.skidmarks = []
    this.sparks = []
    this.smoke = []
    this.visualSteer = 0
    this.initCars()
    this.countdownStartTime = performance.now()
    this.raceState.status = 'COUNTDOWN'
    this.raceState.countdownNumber = 3
    this.raceState.raceTimeMs = 0
    this.raceState.winner = null
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  }

  private unbindEvents(): void {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return
    const key = e.key.toLowerCase()

    if (key === 'w' || key === 'arrowup') {
      this.keys.up = true
      e.preventDefault()
    } else if (key === 's' || key === 'arrowdown') {
      this.keys.down = true
      e.preventDefault()
    } else if (key === 'a' || key === 'arrowleft') {
      this.keys.left = true
      e.preventDefault()
    } else if (key === 'd' || key === 'arrowright') {
      this.keys.right = true
      e.preventDefault()
    } else if (key === 'r') {
      this.restart()
      e.preventDefault()
    }
  }

  private handleKeyUp = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase()

    if (key === 'w' || key === 'arrowup') this.keys.up = false
    if (key === 's' || key === 'arrowdown') this.keys.down = false
    if (key === 'a' || key === 'arrowleft') this.keys.left = false
    if (key === 'd' || key === 'arrowright') this.keys.right = false
  }

  private loop = (): void => {
    if (!this.running) return

    const now = performance.now()
    const dt = Math.min((now - this.lastTime) / 1000, 0.1)
    this.lastTime = now

    this.update(dt, now)
    this.render()

    this.animFrameId = requestAnimationFrame(this.loop)
  }

  // ── Physics & Logic Update ───────────────────────────────────────────
  private update(dt: number, now: number): void {
    if (this.raceState.status === 'COUNTDOWN') {
      const elapsed = (now - this.countdownStartTime) / 1000
      if (elapsed < 1.0) {
        this.raceState.countdownNumber = 3
      } else if (elapsed < 2.0) {
        this.raceState.countdownNumber = 2
      } else if (elapsed < 3.0) {
        this.raceState.countdownNumber = 1
      } else if (elapsed < 4.0) {
        this.raceState.countdownNumber = 0 // GO!
        this.raceState.status = 'RACING'
      }
    } else if (this.raceState.status === 'RACING') {
      this.raceState.raceTimeMs += dt * 1000
    }

    const canMove = this.raceState.status === 'RACING' || this.raceState.status === 'FINISHED'

    // Update Player Car
    if (canMove && !this.playerCar.finished) {
      this.updatePlayerCar(dt)
    }

    // Update AI Cars
    if (canMove) {
      for (const ai of this.aiCars) {
        if (!ai.finished) {
          this.updateAICar(ai, dt)
        }
      }
    }

    // Car-to-Car Collisions
    this.resolveCarCollisions()

    // Lap progress & checkpoints
    for (const car of this.allCars) {
      this.updateCarLapProgress(car)
    }

    // Leaderboard
    this.updateLeaderboard()

    // Smooth visual steering with responsive interpolation
    const targetSteer = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0)
    this.visualSteer += (targetSteer - this.visualSteer) * Math.min(dt * 14, 1)

    // Update Telemetry for HUD
    const speedKmh = Math.round(Math.abs(this.playerCar.speed) * 0.72)
    this.raceState.playerSpeedKmh = speedKmh
    this.raceState.playerGear = this.computeGear(speedKmh)
    this.raceState.playerRpmRatio = this.computeRpmRatio(speedKmh, this.raceState.playerGear)
    this.raceState.playerDrsActive = this.isDrsZone(this.playerCar.currentWaypoint)

    // Particles decay
    // 1. Skid marks decay
    for (let i = this.skidmarks.length - 1; i >= 0; i--) {
      this.skidmarks[i].alpha -= dt * 0.35
      if (this.skidmarks[i].alpha <= 0) {
        this.skidmarks.splice(i, 1)
      }
    }

    // 2. Sparks decay
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i]
      sp.x += sp.vx * dt
      sp.y += sp.vy * dt
      sp.life -= dt * 3.5
      if (sp.life <= 0) {
        this.sparks.splice(i, 1)
      }
    }

    // 3. Smoke decay
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const sm = this.smoke[i]
      sm.x += sm.vx * dt
      sm.y += sm.vy * dt
      sm.radius += dt * 14
      sm.alpha -= dt * 1.4
      if (sm.alpha <= 0) {
        this.smoke.splice(i, 1)
      }
    }

    this.onStateUpdate?.(this.raceState)
  }

  private computeGear(kmh: number): number {
    if (kmh < 50) return 1
    if (kmh < 95) return 2
    if (kmh < 145) return 3
    if (kmh < 195) return 4
    if (kmh < 245) return 5
    if (kmh < 285) return 6
    if (kmh < 320) return 7
    return 8
  }

  private computeRpmRatio(kmh: number, gear: number): number {
    const gearMins = [0, 0, 50, 95, 145, 195, 245, 285, 320]
    const gearMaxs = [0, 50, 95, 145, 195, 245, 285, 320, 365]
    const minKmh = gearMins[gear] ?? 0
    const maxKmh = gearMaxs[gear] ?? 100
    return Math.max(0.1, Math.min(1.0, (kmh - minKmh) / (maxKmh - minKmh)))
  }

  private isDrsZone(wp: number): boolean {
    // Sector 1 Main Pit Straight (wp 0 to 4) and Sector 2 Serraglio Straight (wp 22 to 25)
    return (wp >= 0 && wp <= 4) || (wp >= 22 && wp <= 25)
  }

  private updatePlayerCar(dt: number): void {
    const car = this.playerCar
    const onGrass = this.isOffTrack(car.x, car.y)
    let maxSpeed = onGrass
      ? GAME_CONFIG.PLAYER_MAX_SPEED * GAME_CONFIG.GRASS_SLOWDOWN
      : GAME_CONFIG.PLAYER_MAX_SPEED

    // DRS boost on straights
    if (this.isDrsZone(car.currentWaypoint) && !onGrass) {
      maxSpeed += 40
    }

    // Acceleration & Braking
    if (this.keys.up) {
      car.speed = Math.min(car.speed + GAME_CONFIG.PLAYER_ACCEL * dt, maxSpeed)
    } else if (this.keys.down) {
      if (car.speed > 0) {
        car.speed = Math.max(car.speed - GAME_CONFIG.PLAYER_BRAKE * dt, 0)
        // Hard braking emits tire smoke puffs
        if (car.speed > 160 && Math.random() < 0.4) {
          const rearAngle = car.angle + Math.PI + (Math.random() - 0.5) * 0.4
          this.smoke.push({
            x: car.x - Math.cos(car.angle) * 22,
            y: car.y - Math.sin(car.angle) * 22,
            vx: Math.cos(rearAngle) * 50,
            vy: Math.sin(rearAngle) * 50,
            radius: 5,
            alpha: 0.6,
          })
        }
      } else {
        car.speed = Math.max(car.speed - GAME_CONFIG.PLAYER_ACCEL * dt, GAME_CONFIG.PLAYER_REVERSE_SPEED)
      }
    } else {
      if (car.speed > 0) {
        car.speed = Math.max(car.speed - 120 * dt, 0)
      } else if (car.speed < 0) {
        car.speed = Math.min(car.speed + 120 * dt, 0)
      }
    }

    // Steering
    const speedRatio = Math.min(Math.abs(car.speed) / 100, 1.0)
    if (this.keys.left) {
      car.angle -= GAME_CONFIG.STEER_SPEED * speedRatio * dt * (car.speed >= 0 ? 1 : -1)
    }
    if (this.keys.right) {
      car.angle += GAME_CONFIG.STEER_SPEED * speedRatio * dt * (car.speed >= 0 ? 1 : -1)
    }

    // Position update
    car.x += Math.cos(car.angle) * car.speed * dt
    car.y += Math.sin(car.angle) * car.speed * dt

    // Dynamic sparks & skidmarks at high speed cornering or heavy braking
    if (Math.abs(car.speed) > 260 && (this.keys.left || this.keys.right || this.keys.down)) {
      if (Math.random() < 0.45) {
        this.skidmarks.push({ x: car.x, y: car.y, alpha: 0.75 })
      }
      if (Math.random() < 0.4) {
        const sparkAngle = car.angle + Math.PI + (Math.random() - 0.5) * 0.9
        this.sparks.push({
          x: car.x,
          y: car.y,
          vx: Math.cos(sparkAngle) * (200 + Math.random() * 140),
          vy: Math.sin(sparkAngle) * (200 + Math.random() * 140),
          life: 1.0,
        })
      }
    }
  }

  private updateAICar(car: CarState, dt: number): void {
    const targetWp = this.waypoints[car.currentWaypoint]
    const nextWp = this.waypoints[(car.currentWaypoint + 1) % this.waypoints.length]

    const segDx = nextWp.x - targetWp.x
    const segDy = nextWp.y - targetWp.y
    const segLen = Math.hypot(segDx, segDy) || 1
    const nx = -segDy / segLen
    const ny = segDx / segLen

    const targetX = targetWp.x + nx * car.lateralOffset
    const targetY = targetWp.y + ny * car.lateralOffset

    const dx = targetX - car.x
    const dy = targetY - car.y
    const distToTarget = Math.hypot(dx, dy)
    const targetAngle = Math.atan2(dy, dx)

    let diff = targetAngle - car.angle
    while (diff < -Math.PI) diff += Math.PI * 2
    while (diff > Math.PI) diff -= Math.PI * 2

    car.angle += Math.sign(diff) * Math.min(Math.abs(diff), car.steerP * dt)

    // Corner braking: decelerate realistically in chicanes & technical bends
    const cornerFactor = Math.max(0.40, 1.0 - Math.abs(diff) * 0.72)
    const onGrass = this.isOffTrack(car.x, car.y)
    let desiredSpeed = onGrass ? car.targetSpeed * 0.38 : car.targetSpeed * cornerFactor

    if (this.isDrsZone(car.currentWaypoint)) {
      desiredSpeed += 30
    }

    if (car.speed < desiredSpeed) {
      car.speed = Math.min(car.speed + 270 * dt, desiredSpeed)
    } else {
      car.speed = Math.max(car.speed - 380 * dt, desiredSpeed)
    }

    car.x += Math.cos(car.angle) * car.speed * dt
    car.y += Math.sin(car.angle) * car.speed * dt

    if (distToTarget < 130) {
      car.currentWaypoint = (car.currentWaypoint + 1) % this.waypoints.length
    }
  }

  private resolveCarCollisions(): void {
    const carRadius = 26
    for (let i = 0; i < this.allCars.length; i++) {
      for (let j = i + 1; j < this.allCars.length; j++) {
        const c1 = this.allCars[i]
        const c2 = this.allCars[j]
        const dx = c2.x - c1.x
        const dy = c2.y - c1.y
        const dist = Math.hypot(dx, dy)

        if (dist < carRadius * 2 && dist > 0.1) {
          const overlap = carRadius * 2 - dist
          const pushX = (dx / dist) * (overlap * 0.5)
          const pushY = (dy / dist) * (overlap * 0.5)

          c1.x -= pushX
          c1.y -= pushY
          c2.x += pushX
          c2.y += pushY

          c1.speed *= 0.88
          c2.speed *= 0.88
        }
      }
    }
  }

  private updateCarLapProgress(car: CarState): void {
    if (car.finished) return

    const wpIdx = car.currentWaypoint
    const targetWp = this.waypoints[wpIdx]
    const dist = Math.hypot(targetWp.x - car.x, targetWp.y - car.y)

    if (car.isPlayer && dist < 140) {
      car.currentWaypoint = (car.currentWaypoint + 1) % this.waypoints.length
    }

    // Mid-track checkpoint verification (Waypoint 20 - Lesmo exit)
    if (car.currentWaypoint >= 20) {
      car.checkpointPassed = true
    }

    // Lap complete crossing start/finish line (Waypoint 0)
    if (car.checkpointPassed && car.currentWaypoint === 0 && dist < 150) {
      car.checkpointPassed = false
      car.lapTimes.push(this.raceState.raceTimeMs)

      if (car.currentLap >= this.raceState.totalLaps) {
        car.finished = true
        car.finishTime = this.raceState.raceTimeMs
        if (!this.raceState.winner) {
          this.raceState.winner = car.name
        }

        if (car.isPlayer) {
          this.raceState.status = 'FINISHED'
        }
      } else {
        car.currentLap += 1
      }
    }

    const wpBase = car.currentLap * 8000 + car.currentWaypoint * 180
    car.raceDistance = wpBase - dist
  }

  private updateLeaderboard(): void {
    const sorted = [...this.allCars].sort((a, b) => {
      if (a.finished && b.finished) return (a.finishTime ?? 0) - (b.finishTime ?? 0)
      if (a.finished) return -1
      if (b.finished) return 1
      return b.raceDistance - a.raceDistance
    })

    this.raceState.leaderboard = sorted.map((car, idx) => ({
      id: car.id,
      name: car.name,
      color: car.color,
      isPlayer: car.isPlayer,
      position: idx + 1,
      currentLap: car.currentLap,
      totalLaps: this.raceState.totalLaps,
      finished: car.finished,
      finishTime: car.finishTime,
    }))
  }

  private isOffTrack(x: number, y: number): boolean {
    let minDistance = Infinity

    for (let i = 0; i < this.waypoints.length; i++) {
      const p1 = this.waypoints[i]
      const p2 = this.waypoints[(i + 1) % this.waypoints.length]

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const lenSq = dx * dx + dy * dy

      let t = 0
      if (lenSq > 0) {
        t = Math.max(0, Math.min(1, ((x - p1.x) * dx + (y - p1.y) * dy) / lenSq))
      }

      const projX = p1.x + t * dx
      const projY = p1.y + t * dy
      const dist = Math.hypot(x - projX, y - projY)

      if (dist < minDistance) minDistance = dist
    }

    return minDistance > (GAME_CONFIG.ROAD_WIDTH + 10) * 0.55
  }

  // ── Render ───────────────────────────────────────────────────────────
  private render(): void {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    // 1. Clear background: Grass verge with racecourse lawn pattern
    ctx.fillStyle = '#142318'
    ctx.fillRect(0, 0, w, h)

    // 2. THIRD-PERSON CHASE CAMERA TRANSFORMATION
    // The player's car is rendered in full view with natural chase camera!
    // Forward heading is up, placed nicely at 62% height so upcoming corners & cars are clearly visible.
    ctx.save()
    const viewCenterX = w * 0.5
    const viewCenterY = h * 0.65

    ctx.translate(viewCenterX, viewCenterY)
    ctx.rotate(-this.playerCar.angle - Math.PI / 2)
    ctx.translate(-this.playerCar.x, -this.playerCar.y)

    // Render Circuit (Curbs, Asphalt, Lines, Markers)
    this.renderWorldTrack(ctx)

    // Render Skid marks
    for (const sm of this.skidmarks) {
      ctx.fillStyle = `rgba(10, 10, 10, ${sm.alpha})`
      ctx.beginPath()
      ctx.arc(sm.x, sm.y, 8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Render Tire Smoke
    for (const sm of this.smoke) {
      ctx.fillStyle = `rgba(220, 225, 235, ${sm.alpha})`
      ctx.beginPath()
      ctx.arc(sm.x, sm.y, sm.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Render Sparks
    for (const sp of this.sparks) {
      ctx.fillStyle = `rgba(255, ${Math.floor(180 * sp.life + 75)}, 50, ${sp.life})`
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, 3 * sp.life + 1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Render AI Competitors on track
    for (const ai of this.aiCars) {
      this.drawAICarInWorld(ctx, ai)
    }

    // RENDER FULL PLAYER F1 CAR
    this.drawPlayerCarInWorld(ctx, this.playerCar)

    ctx.restore()

    // 3. SLEEK BROADCAST F1 TELEMETRY HUD (Replacing the obstructive cockpit overlay)
    this.renderBroadcastHUD(ctx, w, h)

    // 4. Circuit Mini-Map Radar (Top-right corner)
    this.renderMiniMapRadar(ctx, w, h)

    // 5. Countdown Gantry Overlay
    if (this.raceState.status === 'COUNTDOWN') {
      this.drawCountdownGantry(ctx, w, h)
    }

    // 6. Finish Flag Banner
    if (this.raceState.status === 'FINISHED') {
      this.drawFinishBanner(ctx, w, h)
    }
  }

  private renderWorldTrack(ctx: CanvasRenderingContext2D): void {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const roadW = GAME_CONFIG.ROAD_WIDTH + 14

    // 1. Run-off Gravel Traps
    ctx.strokeStyle = '#c49e6b'
    ctx.lineWidth = roadW + 50
    this.drawCircuitPath(ctx)

    // 2. Asphalt Runoff Safety Bands (FIA Blue)
    ctx.strokeStyle = '#1b4c8a'
    ctx.lineWidth = roadW + 30
    this.drawCircuitPath(ctx)

    // 3. 3D Rumble Kerbs (Red & White Alternating Teeth)
    ctx.strokeStyle = '#d70000'
    ctx.lineWidth = roadW + 18
    this.drawCircuitPath(ctx)

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = roadW + 10
    ctx.setLineDash([32, 32])
    this.drawCircuitPath(ctx)
    ctx.setLineDash([])

    // 4. Deep Racing Asphalt Track Surface
    ctx.strokeStyle = '#16191f'
    ctx.lineWidth = roadW
    this.drawCircuitPath(ctx)

    // 5. White Track Boundary Lines (Left & Right Edge)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.lineWidth = roadW - 4
    this.drawCircuitPath(ctx)

    // Asphalt core re-fill to leave crisp white boundary lines
    ctx.strokeStyle = '#16191f'
    ctx.lineWidth = roadW - 12
    this.drawCircuitPath(ctx)

    // 6. Procedural Darkened Rubber Racing Groove
    ctx.strokeStyle = 'rgba(8, 9, 12, 0.45)'
    ctx.lineWidth = 44
    this.drawCircuitPath(ctx)

    // Center Dashed Track Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
    ctx.lineWidth = 3
    ctx.setLineDash([25, 35])
    this.drawCircuitPath(ctx)
    ctx.setLineDash([])

    // Start / Finish Line & Starting Grid Slots
    this.drawStartFinishLine(ctx)
    this.drawStartingGrid(ctx)

    // Distance Brake Marker Boards (150m, 100m, 50m) along straight entries
    this.drawBrakeMarkers(ctx)
  }

  private drawCircuitPath(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath()
    const pts = this.waypoints
    ctx.moveTo(pts[0].x, pts[0].y)

    for (let i = 1; i < pts.length; i++) {
      const curr = pts[i]
      const next = pts[(i + 1) % pts.length]
      const mx = (curr.x + next.x) * 0.5
      const my = (curr.y + next.y) * 0.5
      ctx.quadraticCurveTo(curr.x, curr.y, mx, my)
    }
    ctx.closePath()
    ctx.stroke()
  }

  private drawStartFinishLine(ctx: CanvasRenderingContext2D): void {
    const p0 = this.waypoints[0]
    const p1 = this.waypoints[1]
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x)
    const perp = angle + Math.PI * 0.5
    const halfRoad = (GAME_CONFIG.ROAD_WIDTH + 14) * 0.52

    const x1 = p0.x + Math.cos(perp) * halfRoad
    const y1 = p0.y + Math.sin(perp) * halfRoad
    const x2 = p0.x - Math.cos(perp) * halfRoad
    const y2 = p0.y - Math.sin(perp) * halfRoad

    ctx.save()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 16
    ctx.setLineDash([14, 14])
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  private drawStartingGrid(ctx: CanvasRenderingContext2D): void {
    const p0 = this.waypoints[0]
    const p1 = this.waypoints[1]
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x)

    ctx.save()
    for (let i = 0; i < 5; i++) {
      const gridRow = i
      const gridSide = gridRow % 2 === 0 ? 1 : -1
      const gx = p0.x - gridRow * 85
      const gy = p0.y + gridSide * 30

      ctx.save()
      ctx.translate(gx, gy)
      ctx.rotate(angle)

      ctx.strokeStyle = i === 0 ? '#ffcc00' : 'rgba(255, 255, 255, 0.75)'
      ctx.lineWidth = 2.5
      ctx.strokeRect(-32, -18, 64, 36)

      if (i === 0) {
        ctx.fillStyle = '#ffcc00'
        ctx.fillRect(-34, -20, 4, 40)
      }

      ctx.restore()
    }
    ctx.restore()
  }

  private drawBrakeMarkers(ctx: CanvasRenderingContext2D): void {
    const brakeIndices = [4, 14, 27, 33]
    for (const idx of brakeIndices) {
      const wp = this.waypoints[idx]
      const nextWp = this.waypoints[(idx + 1) % this.waypoints.length]
      const angle = Math.atan2(nextWp.y - wp.y, nextWp.x - wp.x)
      const perp = angle + Math.PI * 0.5
      const bx = wp.x + Math.cos(perp) * ((GAME_CONFIG.ROAD_WIDTH + 14) * 0.60)
      const by = wp.y + Math.sin(perp) * ((GAME_CONFIG.ROAD_WIDTH + 14) * 0.60)

      ctx.save()
      ctx.translate(bx, by)
      ctx.rotate(angle)

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(-14, -9, 28, 18)
      ctx.strokeStyle = '#e10600'
      ctx.lineWidth = 2
      ctx.strokeRect(-14, -9, 28, 18)

      ctx.fillStyle = '#000000'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('100', 0, 0)
      ctx.restore()
    }
  }

  // ── DRAW FULL PLAYER F1 CAR ──────────────────────────────────────────
  private drawPlayerCarInWorld(ctx: CanvasRenderingContext2D, car: CarState): void {
    ctx.save()
    ctx.translate(car.x, car.y)
    ctx.rotate(car.angle)

    const len = 58
    const width = 30
    const steer = this.visualSteer * 0.45 // Turning front wheels

    // 1. Ground Shadow underneath chassis
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    ctx.beginPath()
    ctx.roundRect(-len * 0.52, -width * 0.75, len * 1.05, width * 1.5, 8)
    ctx.fill()

    // 2. Glowing Brake Discs under hard braking
    if (this.keys.down && car.speed > 80) {
      ctx.fillStyle = 'rgba(255, 90, 0, 0.85)'
      ctx.shadowColor = '#ff4400'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(len * 0.25, -width * 0.68, 6, 0, Math.PI * 2)
      ctx.arc(len * 0.25, width * 0.68, 6, 0, Math.PI * 2)
      ctx.arc(-len * 0.42, -width * 0.74, 7, 0, Math.PI * 2)
      ctx.arc(-len * 0.42, width * 0.74, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // 3. Four Tires (Pirelli P-Zero Red Soft)
    // Rear Tires (Fixed)
    ctx.fillStyle = '#111111'
    ctx.fillRect(-len * 0.48, -width * 0.82, 17, 9)
    ctx.fillRect(-len * 0.48, width * 0.82 - 9, 17, 9)
    // Rear tire red pinstripe
    ctx.fillStyle = '#ff1e27'
    ctx.fillRect(-len * 0.48 + 4, -width * 0.82, 9, 2)
    ctx.fillRect(-len * 0.48 + 4, width * 0.82 - 2, 9, 2)

    // Front Tires (Steerable with dynamic steering angle!)
    // Left Front
    ctx.save()
    ctx.translate(len * 0.25, -width * 0.74)
    ctx.rotate(steer)
    ctx.fillStyle = '#111111'
    ctx.fillRect(-7.5, -4.5, 15, 9)
    ctx.fillStyle = '#ff1e27'
    ctx.fillRect(-4, -4.5, 8, 2)
    ctx.restore()

    // Right Front
    ctx.save()
    ctx.translate(len * 0.25, width * 0.74)
    ctx.rotate(steer)
    ctx.fillStyle = '#111111'
    ctx.fillRect(-7.5, -4.5, 15, 9)
    ctx.fillStyle = '#ff1e27'
    ctx.fillRect(-4, 2.5, 8, 2)
    ctx.restore()

    // 4. Suspension Wishbones (Double A-arms)
    ctx.strokeStyle = '#222222'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(len * 0.26, -width * 0.28)
    ctx.lineTo(len * 0.25, -width * 0.68)
    ctx.moveTo(len * 0.16, -width * 0.28)
    ctx.lineTo(len * 0.25, -width * 0.68)
    ctx.moveTo(len * 0.26, width * 0.28)
    ctx.lineTo(len * 0.25, width * 0.68)
    ctx.moveTo(len * 0.16, width * 0.28)
    ctx.lineTo(len * 0.25, width * 0.68)
    ctx.stroke()

    // 5. Main Aerodynamic Body (Scuderia Rosso Corsa)
    ctx.fillStyle = car.color
    ctx.beginPath()
    ctx.moveTo(len * 0.54, 0) // Pointed nose tip
    ctx.lineTo(len * 0.26, -width * 0.24)
    ctx.lineTo(len * 0.05, -width * 0.50) // Sidepod shoulder
    ctx.lineTo(-len * 0.30, -width * 0.44) // Coke-bottle undercut
    ctx.lineTo(-len * 0.48, -width * 0.36) // Rear engine cover
    ctx.lineTo(-len * 0.48, width * 0.36)
    ctx.lineTo(-len * 0.30, width * 0.44)
    ctx.lineTo(len * 0.05, width * 0.50)
    ctx.lineTo(len * 0.26, width * 0.24)
    ctx.closePath()
    ctx.fill()

    // 6. Sidepod Air Intakes
    ctx.fillStyle = '#080808'
    ctx.fillRect(len * 0.05, -width * 0.48, 4, width * 0.20)
    ctx.fillRect(len * 0.05, width * 0.28, 4, width * 0.20)

    // 7. White Livery Stripe & Shark Fin
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-len * 0.36, -2, len * 0.42, 4)

    // 8. Front Wing (Multi-Element with Carbon Endplates)
    ctx.fillStyle = car.color
    ctx.fillRect(len * 0.48, -width * 0.72, 6, width * 1.44)
    ctx.fillStyle = '#0c0c0c'
    ctx.fillRect(len * 0.44, -width * 0.76, 10, 3)
    ctx.fillRect(len * 0.44, width * 0.76 - 3, 10, 3)

    // 9. Active Rear Wing (With animated DRS!)
    const isDrs = this.raceState.playerDrsActive
    ctx.fillStyle = '#0c0c0c'
    ctx.fillRect(-len * 0.58, -width * 0.76, 7, width * 1.52)

    // DRS Flap
    if (isDrs) {
      // DRS OPEN: Green wing flap elevated
      ctx.fillStyle = '#00ff44'
      ctx.shadowColor = '#00ff44'
      ctx.shadowBlur = 8
      ctx.fillRect(-len * 0.56, -width * 0.65, 3, width * 1.3)
      ctx.shadowBlur = 0
    } else {
      // DRS CLOSED: Red flap
      ctx.fillStyle = car.color
      ctx.fillRect(-len * 0.57, -width * 0.68, 3, width * 1.36)
    }

    // 10. Cockpit Opening & Driver Helmet
    ctx.fillStyle = '#090a0d'
    ctx.beginPath()
    ctx.ellipse(len * 0.04, 0, 9, 6, 0, 0, Math.PI * 2)
    ctx.fill()

    // Driver Helmet (facing direction of travel)
    ctx.fillStyle = '#ffcc00'
    ctx.beginPath()
    ctx.arc(len * 0.04, 0, 4.8, 0, Math.PI * 2)
    ctx.fill()
    // Black Visor
    ctx.fillStyle = '#111111'
    ctx.beginPath()
    ctx.arc(len * 0.06, 0, 3.2, -Math.PI * 0.4, Math.PI * 0.4)
    ctx.fill()

    // Halo safety structure
    ctx.strokeStyle = '#1b1d22'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(len * 0.12, 0)
    ctx.lineTo(len * 0.02, -5)
    ctx.moveTo(len * 0.12, 0)
    ctx.lineTo(len * 0.02, 5)
    ctx.stroke()

    // 11. Rear Blinking Rain/ERS LED
    const blink = Math.floor(Date.now() / 200) % 2 === 0
    ctx.fillStyle = blink ? '#ff1e27' : '#550000'
    ctx.fillRect(-len * 0.59, -3, 3, 6)

    ctx.restore()
  }

  // Draw AI car in world coordinates
  private drawAICarInWorld(ctx: CanvasRenderingContext2D, car: CarState): void {
    ctx.save()
    ctx.translate(car.x, car.y)
    ctx.rotate(car.angle)

    const len = 52
    const width = 28

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.beginPath()
    ctx.roundRect(-len * 0.5, -width * 0.75, len, width * 1.5, 6)
    ctx.fill()

    // Tires
    ctx.fillStyle = '#111111'
    ctx.fillRect(len * 0.22, -width * 0.72, 14, 8)
    ctx.fillRect(len * 0.22, width * 0.72 - 8, 14, 8)
    ctx.fillRect(-len * 0.46, -width * 0.78, 16, 9)
    ctx.fillRect(-len * 0.46, width * 0.78 - 9, 16, 9)

    // Bodywork
    ctx.fillStyle = car.color
    ctx.beginPath()
    ctx.moveTo(len * 0.52, 0)
    ctx.lineTo(len * 0.22, -width * 0.26)
    ctx.lineTo(-len * 0.08, -width * 0.46)
    ctx.lineTo(-len * 0.46, -width * 0.35)
    ctx.lineTo(-len * 0.46, width * 0.35)
    ctx.lineTo(-len * 0.08, width * 0.46)
    ctx.lineTo(len * 0.22, width * 0.26)
    ctx.closePath()
    ctx.fill()

    // Livery Accent
    ctx.fillStyle = car.accentColor
    ctx.fillRect(-len * 0.16, -width * 0.12, len * 0.36, width * 0.24)

    // Front Wing
    ctx.fillStyle = car.color
    ctx.fillRect(len * 0.46, -width * 0.68, 5, width * 1.36)

    // Rear Wing
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(-len * 0.55, -width * 0.74, 6, width * 1.48)

    // Driver Helmet
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2)
    ctx.fill()

    // Blinking Rain / ERS LED Light at rear
    const blink = Math.floor(Date.now() / 200) % 2 === 0
    ctx.fillStyle = blink ? '#ff1e27' : '#550000'
    ctx.fillRect(-len * 0.56, -2.5, 3, 5)

    ctx.restore()
  }

  // ── SLEEK BROADCAST F1 TELEMETRY HUD ─────────────────────────────────
  // Modern, unobtrusive broadcast telemetry pod at bottom center
  private renderBroadcastHUD(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const podW = 280
    const podH = 76
    const px = (w - podW) * 0.5
    const py = h - podH - 18

    ctx.save()

    // Container
    ctx.fillStyle = 'rgba(7, 10, 15, 0.88)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(px, py, podW, podH, 12)
    ctx.fill()
    ctx.stroke()

    // 15-LED RPM Shift Lights
    const rpm = this.raceState.playerRpmRatio
    const ledCount = 15
    for (let i = 0; i < ledCount; i++) {
      const lx = px + 18 + i * 16.5
      const ly = py + 14
      const active = i / ledCount <= rpm

      let ledColor = '#152418'
      if (active) {
        if (i < 5) ledColor = '#00ff44' // Green
        else if (i < 10) ledColor = '#ff2200' // Red
        else ledColor = '#00d2be' // Cyan redline shift flash!
      }

      ctx.fillStyle = ledColor
      ctx.beginPath()
      ctx.arc(lx, ly, 3.8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Huge Bold Gear Display
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 34px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const gearText = this.raceState.status === 'COUNTDOWN' ? 'N' : String(this.raceState.playerGear)
    ctx.fillText(gearText, px + 50, py + 48)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '700 9px monospace'
    ctx.fillText('GEAR', px + 50, py + 66)

    // Speedometer (KM/H)
    ctx.fillStyle = '#00d2be'
    ctx.font = '900 24px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`${this.raceState.playerSpeedKmh}`, px + 95, py + 46)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '700 10px monospace'
    ctx.fillText('KM/H', px + 155, py + 46)

    // DRS Badge
    if (this.raceState.playerDrsActive) {
      ctx.fillStyle = '#00ff44'
      ctx.font = '900 11px monospace'
      ctx.fillText('⚡ DRS ACTIVE', px + 95, py + 64)
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.font = '700 10px monospace'
      ctx.fillText('DRS CLOSED', px + 95, py + 64)
    }

    // Throttle / Brake Bars
    const barX = px + 215
    const barY = py + 32
    // Throttle Bar (Green)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(barX, barY, 45, 12)
    if (this.keys.up) {
      ctx.fillStyle = '#00ff44'
      ctx.fillRect(barX, barY, 45, 12)
    }
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 8px monospace'
    ctx.fillText('THR', barX + 48, barY + 9)

    // Brake Bar (Red)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(barX, barY + 16, 45, 12)
    if (this.keys.down) {
      ctx.fillStyle = '#ff2200'
      ctx.fillRect(barX, barY + 16, 45, 12)
    }
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 8px monospace'
    ctx.fillText('BRK', barX + 48, barY + 25)

    ctx.restore()
  }

  // ── CIRCUIT MINI-MAP RADAR ───────────────────────────────────────────
  private renderMiniMapRadar(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const mapBoxW = 200
    const mapBoxH = 150
    const padX = w - mapBoxW - 18
    const padY = 18

    ctx.save()
    // Radar Background Container
    ctx.fillStyle = 'rgba(8, 11, 16, 0.88)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(padX, padY, mapBoxW, mapBoxH, 10)
    ctx.fill()
    ctx.stroke()

    // Title Badge
    ctx.fillStyle = '#e10600'
    ctx.font = 'bold 9px monospace'
    ctx.fillText('CIRCUIT MAP // GP RADAR', padX + 12, padY + 16)

    // Scale Track into Map Box
    const rangeX = this.mapMaxX - this.mapMinX || 1
    const rangeY = this.mapMaxY - this.mapMinY || 1
    const innerW = mapBoxW - 28
    const innerH = mapBoxH - 32
    const scale = Math.min(innerW / rangeX, innerH / rangeY)

    const offsetX = padX + 14 + (innerW - rangeX * scale) * 0.5
    const offsetY = padY + 24 + (innerH - rangeY * scale) * 0.5

    const toMapX = (wx: number) => offsetX + (wx - this.mapMinX) * scale
    const toMapY = (wy: number) => offsetY + (wy - this.mapMinY) * scale

    // Draw Mini-Map Track Outline
    ctx.strokeStyle = '#444d5a'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    const pts = this.waypoints
    ctx.moveTo(toMapX(pts[0].x), toMapY(pts[0].y))
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(toMapX(pts[i].x), toMapY(pts[i].y))
    }
    ctx.closePath()
    ctx.stroke()

    // Start / Finish Line marker
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(toMapX(pts[0].x), toMapY(pts[0].y), 3.5, 0, Math.PI * 2)
    ctx.stroke()

    // Draw AI cars as small colored dots
    for (const ai of this.aiCars) {
      const ax = toMapX(ai.x)
      const ay = toMapY(ai.y)
      ctx.fillStyle = ai.color
      ctx.beginPath()
      ctx.arc(ax, ay, 3.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw Player car as pulsating gold/red dot
    const px = toMapX(this.playerCar.x)
    const py = toMapY(this.playerCar.y)
    ctx.fillStyle = '#ffcc00'
    ctx.beginPath()
    ctx.arc(px, py, 5.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#e10600'
    ctx.beginPath()
    ctx.arc(px, py, 3.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  // 5-Red-Lights F1 Starting Gantry
  private drawCountdownGantry(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const boxW = 340
    const boxH = 90
    const bx = (w - boxW) * 0.5
    const by = 80

    ctx.save()
    ctx.fillStyle = 'rgba(10, 10, 14, 0.94)'
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(bx, by, boxW, boxH, 10)
    ctx.fill()
    ctx.stroke()

    const num = this.raceState.countdownNumber
    const activeLights = num === 3 ? 1 : num === 2 ? 2 : num === 1 ? 3 : 5

    for (let i = 0; i < 5; i++) {
      const lx = bx + 45 + i * 62
      const ly = by + 45
      const isActive = i < activeLights

      ctx.fillStyle = isActive ? '#ff1e27' : '#33080a'
      ctx.shadowColor = isActive ? '#ff1e27' : 'transparent'
      ctx.shadowBlur = isActive ? 18 : 0
      ctx.beginPath()
      ctx.arc(lx, ly, 18, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  private drawFinishBanner(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const bannerW = 540
    const bannerH = 190
    const bx = (w - bannerW) * 0.5
    const by = (h - bannerH) * 0.5

    ctx.save()
    ctx.fillStyle = 'rgba(5, 8, 12, 0.96)'
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(bx, by, bannerW, bannerH, 14)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🏁 GRAND PRIX FINISH 🏁', w * 0.5, by + 52)

    ctx.fillStyle = '#ffcc00'
    ctx.font = '800 24px Arial'
    const winner = this.raceState.winner || 'Scuderia'
    ctx.fillText(`WINNER: ${winner.toUpperCase()}`, w * 0.5, by + 94)

    const playerPos = this.raceState.leaderboard.find((l) => l.isPlayer)?.position ?? 1
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 20px Arial'
    ctx.fillText(`YOUR FINISH: P${playerPos} OF 5`, w * 0.5, by + 128)

    ctx.fillStyle = '#a6b4c6'
    ctx.font = '600 16px Arial'
    ctx.fillText('[R] RESTART RACE   •   [ESC] EXIT TO CARNIVAL', w * 0.5, by + 162)
    ctx.restore()
  }
}
