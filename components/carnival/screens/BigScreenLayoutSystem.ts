import { RaceEvent } from '@/lib/f1/f1DataService'

export type BigScreen1Scene = 'calendar' | 'completed' | 'nextRace' | 'remaining' | 'progress'
export type BigScreen2Scene = 'spotlight' | 'podium' | 'circuit' | 'destination' | 'journey'

export class BigScreenLayoutSystem {
  private static readonly W = 1920
  private static readonly H = 844

  public static drawBackground(ctx: CanvasRenderingContext2D): void {
    const { W, H } = this
    const bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, '#07090d')
    bgGrad.addColorStop(0.5, '#0b0e14')
    bgGrad.addColorStop(1, '#06080b')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)'
    ctx.lineWidth = 1
    const gridSize = 48
    ctx.beginPath()
    for (let x = 0; x < W; x += gridSize) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
    }
    ctx.stroke()

    ctx.strokeStyle = '#1e2736'
    ctx.lineWidth = 3
    ctx.strokeRect(3, 3, W - 6, H - 6)

    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(3, 36); ctx.lineTo(3, 3); ctx.lineTo(36, 3)
    ctx.moveTo(W - 36, 3); ctx.lineTo(W - 3, 3); ctx.lineTo(W - 3, 36)
    ctx.moveTo(3, H - 36); ctx.lineTo(3, H - 3); ctx.lineTo(36, H - 3)
    ctx.moveTo(W - 36, H - 3); ctx.lineTo(W - 3, H - 3); ctx.lineTo(W - 3, H - 36)
    ctx.stroke()
  }

  public static drawHeader(
    ctx: CanvasRenderingContext2D,
    title: string,
    tabs: { id: string; label: string }[],
    activeTabId: string
  ): void {
    const W = this.W
    ctx.fillStyle = 'rgba(11, 14, 20, 0.95)'
    ctx.fillRect(0, 0, W, 68)
    ctx.strokeStyle = '#1d2634'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, 68)
    ctx.lineTo(W, 68)
    ctx.stroke()

    ctx.fillStyle = '#e10600'
    ctx.beginPath()
    ctx.moveTo(28, 18); ctx.lineTo(34, 18); ctx.lineTo(24, 50); ctx.lineTo(18, 50); ctx.closePath(); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(38, 18); ctx.lineTo(44, 18); ctx.lineTo(34, 50); ctx.lineTo(28, 50); ctx.closePath(); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(48, 18); ctx.lineTo(54, 18); ctx.lineTo(44, 50); ctx.lineTo(38, 50); ctx.closePath(); ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 22px "Arial Black", Impact, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(title, 68, 34)

    ctx.fillStyle = 'rgba(225, 6, 0, 0.16)'
    ctx.fillRect(660, 20, 140, 28)
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 1.5
    ctx.strokeRect(660, 20, 140, 28)
    ctx.fillStyle = '#e10600'
    ctx.beginPath()
    ctx.arc(676, 34, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px monospace'
    ctx.fillText('LIVE BROADCAST', 690, 34)

    let tabX = W - 36
    ctx.textAlign = 'right'
    for (let i = tabs.length - 1; i >= 0; i--) {
      const tab = tabs[i]
      const isActive = tab.id === activeTabId
      ctx.font = 'bold 13px monospace'
      const tabWidth = ctx.measureText(tab.label).width + 28
      tabX -= tabWidth

      if (isActive) {
        ctx.fillStyle = '#e10600'
        ctx.fillRect(tabX, 20, tabWidth - 10, 28)
        ctx.fillStyle = '#ffffff'
      } else {
        ctx.fillStyle = 'rgba(24, 32, 44, 0.7)'
        ctx.fillRect(tabX, 20, tabWidth - 10, 28)
        ctx.strokeStyle = '#273344'
        ctx.strokeRect(tabX, 20, tabWidth - 10, 28)
        ctx.fillStyle = '#899bb0'
      }

      ctx.fillText(tab.label, tabX + tabWidth - 18, 34)
      tabX -= 10
    }
  }

  public static drawFooter(ctx: CanvasRenderingContext2D, screenName: string, subInfo: string): void {
    const W = this.W
    const H = this.H
    ctx.fillStyle = '#080a0e'
    ctx.fillRect(0, H - 36, W, 36)
    ctx.strokeStyle = '#18202c'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, H - 36); ctx.lineTo(W, H - 36); ctx.stroke()

    ctx.fillStyle = '#e10600'
    ctx.fillRect(24, H - 26, 4, 16)

    ctx.fillStyle = '#78899e'
    ctx.font = 'bold 12px monospace'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(`OUTDOOR SCREEN // ${screenName.toUpperCase()} // RESOLUTION 1920x844 (2.28:1)`, 36, H - 18)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#00d2be'
    ctx.fillText(subInfo, W - 32, H - 18)
  }

  public static renderBig1(
    ctx: CanvasRenderingContext2D,
    scene: BigScreen1Scene,
    allRaces: RaceEvent[],
    completedRaces: RaceEvent[],
    remainingRaces: RaceEvent[],
    nextRace: RaceEvent | null
  ): void {
    this.drawBackground(ctx)

    const tabs = [
      { id: 'calendar', label: '01 // CALENDAR JOURNEY' },
      { id: 'completed', label: '02 // COMPLETED RACES' },
      { id: 'nextRace', label: '03 // NEXT GRAND PRIX' },
      { id: 'remaining', label: '04 // REMAINING SCHEDULE' },
      { id: 'progress', label: '05 // SEASON PROGRESS' },
    ]

    this.drawHeader(ctx, 'FIA FORMULA 1 WORLD CHAMPIONSHIP // OFFICIAL RACE CALENDAR', tabs, scene)

    if (scene === 'calendar') {
      this.renderMasterCalendarJourney(ctx, allRaces, nextRace)
    } else if (scene === 'completed') {
      this.renderBig1Completed(ctx, completedRaces)
    } else if (scene === 'nextRace' && nextRace) {
      this.renderBig1NextRace(ctx, nextRace)
    } else if (scene === 'remaining') {
      this.renderBig1Remaining(ctx, remainingRaces)
    } else if (scene === 'progress') {
      this.renderBig1Progress(ctx, allRaces, completedRaces)
    }

    this.drawFooter(ctx, 'Big_Screen1', 'OFFICIAL 2026 RACE CALENDAR & LIVE TELEMETRY')
  }

  public static renderMasterCalendarJourney(
    ctx: CanvasRenderingContext2D,
    allRaces: RaceEvent[],
    nextRace: RaceEvent | null
  ): void {
    const leftX = 44
    const leftY = 88
    const leftW = 440

    ctx.fillStyle = '#e10600'
    ctx.font = 'bold 13px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('2026 SEASON // OFFICIAL CALENDAR', leftX, leftY)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 46px "Arial Black", Impact, sans-serif'
    ctx.fillText('THE RACE', leftX, leftY + 24)
    ctx.fillText('CALENDAR', leftX, leftY + 70)

    ctx.fillStyle = '#e10600'
    ctx.font = '900 24px "Arial Black", sans-serif'
    ctx.fillText('THE CHAMPIONSHIP JOURNEY', leftX, leftY + 124)

    ctx.fillStyle = '#8e9eaf'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('DIFFERENT TRACKS. DIFFERENT CULTURES.', leftX, leftY + 160)
    ctx.fillText('ONE CHAMPIONSHIP.', leftX, leftY + 180)

    this.drawF1CarSilhouette(ctx, leftX + 10, leftY + 230, 420, 160)

    ctx.fillStyle = 'rgba(16, 22, 32, 0.85)'
    ctx.fillRect(leftX, leftY + 410, leftW, 96)
    ctx.strokeStyle = '#222e40'
    ctx.lineWidth = 1.5
    ctx.strokeRect(leftX, leftY + 410, leftW, 96)

    ctx.fillStyle = '#e10600'
    ctx.fillRect(leftX, leftY + 410, 4, 96)

    const completedCount = allRaces.filter((r) => r.status === 'completed').length
    const activeRound = nextRace?.round || completedCount + 1
    const totalRounds = allRaces.length || 24
    const remainingCount = Math.max(0, totalRounds - completedCount)

    ctx.fillStyle = '#7a8c9e'
    ctx.font = 'bold 11px monospace'
    ctx.fillText('GLOBAL RACING TOUR // FIA WORLD CHAMPIONSHIP', leftX + 16, leftY + 424)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 20px "Arial Black", sans-serif'
    ctx.fillText(`${totalRounds} GRANDS PRIX // OFFICIAL CALENDAR`, leftX + 16, leftY + 448)
    ctx.fillStyle = '#00d2be'
    ctx.font = 'bold 13px monospace'
    ctx.fillText(`STATUS: ROUND ${String(activeRound).padStart(2, '0')} ACTIVE // ${remainingCount} UPCOMING`, leftX + 16, leftY + 478)

    const centerX = 510
    const centerY = 88
    const centerW = 880
    const centerH = 508

    ctx.fillStyle = 'rgba(13, 17, 24, 0.9)'
    ctx.fillRect(centerX, centerY, centerW, centerH)
    ctx.strokeStyle = '#1e293a'
    ctx.lineWidth = 2
    ctx.strokeRect(centerX, centerY, centerW, centerH)

    ctx.fillStyle = '#e10600'
    ctx.fillRect(centerX, centerY, 190, 28)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 12px "Arial Black", sans-serif'
    ctx.fillText('CIRCUIT TELEMETRY // GPS', centerX + 12, centerY + 7)

    const targetRace = nextRace || allRaces.find((r) => r.status === 'completed') || allRaces[0]
    const circuitTitle = targetRace
      ? `${targetRace.circuit.toUpperCase()} // ${targetRace.country.toUpperCase()}`
      : 'MONTE CARLO STREET CIRCUIT // 3.337 KM'

    ctx.fillStyle = '#7c8fa4'
    ctx.font = 'bold 13px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(circuitTitle, centerX + centerW - 20, centerY + 18)

    this.drawGlowingCircuit(ctx, centerX + 30, centerY + 40, centerW - 60, 240)
    this.drawElevationContour(ctx, centerX + 30, centerY + 300, centerW - 60, 60)

    const metricY = centerY + 382
    const mBoxW = (centerW - 60 - 36) / 4
    const metrics = [
      { label: 'CIRCUIT VENUE', val: targetRace?.location?.toUpperCase() || 'GRAND PRIX', color: '#ffffff' },
      { label: 'ROUND', val: `ROUND ${String(targetRace?.round || 1).padStart(2, '0')}`, color: '#e10600' },
      { label: 'TOTAL LAPS', val: `${targetRace?.laps || 57} LAPS`, color: '#ffffff' },
      { label: 'RACE DATE', val: targetRace?.date?.toUpperCase() || 'LIVE 2026', color: '#00d2be' },
    ]

    metrics.forEach((m, idx) => {
      const mx = centerX + 30 + idx * (mBoxW + 12)
      ctx.fillStyle = 'rgba(18, 25, 36, 0.85)'
      ctx.fillRect(mx, metricY, mBoxW, 106)
      ctx.strokeStyle = '#243144'
      ctx.lineWidth = 1.5
      ctx.strokeRect(mx, metricY, mBoxW, 106)

      ctx.fillStyle = '#6b7d91'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(m.label, mx + mBoxW / 2, metricY + 16)

      ctx.fillStyle = m.color
      ctx.font = '900 24px "Arial Black", Impact, sans-serif'
      ctx.fillText(m.val, mx + mBoxW / 2, metricY + 44)

      ctx.fillStyle = m.color === '#e10600' ? '#e10600' : '#2d3b4e'
      ctx.fillRect(mx + 20, metricY + 84, mBoxW - 40, 3)
    })

    const rightX = 1414
    const rightY = 88
    const rightW = 462
    const rightH = 508

    ctx.fillStyle = 'rgba(14, 19, 27, 0.95)'
    ctx.fillRect(rightX, rightY, rightW, rightH)
    ctx.strokeStyle = '#222f42'
    ctx.lineWidth = 2
    ctx.strokeRect(rightX, rightY, rightW, rightH)

    ctx.fillStyle = '#e10600'
    ctx.fillRect(rightX, rightY, rightW, 36)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 15px "Arial Black", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('NEXT RACE // ROUND 07', rightX + 16, rightY + 10)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 32px "Arial Black", Impact, sans-serif'
    ctx.fillText('MONACO', rightX + 20, rightY + 54)
    ctx.fillText('GRAND PRIX', rightX + 20, rightY + 92)

    ctx.fillStyle = '#00d2be'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('MONTE CARLO STREET CIRCUIT', rightX + 20, rightY + 144)

    ctx.fillStyle = '#899ab0'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('COUNTRY: MONACO', rightX + 20, rightY + 172)
    ctx.fillText('DATE: 21 - 24 MAY 2026', rightX + 20, rightY + 196)

    const factY = rightY + 236
    const facts = [
      { label: 'CORNERS', val: '19 TURNS' },
      { label: 'PIT LANE LOSS', val: '22.4 SEC' },
      { label: 'DRS ZONES', val: '1 DETECTION' },
      { label: 'TRACK TEMP', val: '38°C DRY' },
    ]

    facts.forEach((f, idx) => {
      const col = idx % 2
      const row = Math.floor(idx / 2)
      const fx = rightX + 20 + col * 216
      const fy = factY + row * 68

      ctx.fillStyle = 'rgba(21, 29, 41, 0.8)'
      ctx.fillRect(fx, fy, 204, 56)
      ctx.strokeStyle = '#29374a'
      ctx.strokeRect(fx, fy, 204, 56)

      ctx.fillStyle = '#6b7d91'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(f.label, fx + 12, fy + 10)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 16px "Arial Black", sans-serif'
      ctx.fillText(f.val, fx + 12, fy + 28)
    })

    ctx.fillStyle = 'rgba(225, 6, 0, 0.12)'
    ctx.fillRect(rightX + 20, rightY + 396, rightW - 40, 84)
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 2
    ctx.strokeRect(rightX + 20, rightY + 396, rightW - 40, 84)

    ctx.fillStyle = '#e10600'
    ctx.font = '900 13px monospace'
    ctx.fillText('COUNTDOWN TO LIGHTS OUT', rightX + 36, rightY + 412)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 30px "Arial Black", Impact, sans-serif'
    ctx.fillText('03D : 14H : 22M : 45S', rightX + 36, rightY + 434)

    this.drawChampionshipTimeline(ctx, 44, 614, 1832, 170, allRaces)
  }

  private static drawF1CarSilhouette(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    ctx.save()
    const trails = [
      { yOff: 35, len: 260, alpha: 0.9, w: 3 },
      { yOff: 48, len: 320, alpha: 0.75, w: 2 },
      { yOff: 62, len: 390, alpha: 0.95, w: 4 },
      { yOff: 78, len: 340, alpha: 0.8, w: 2.5 },
      { yOff: 95, len: 280, alpha: 0.6, w: 2 },
      { yOff: 110, len: 220, alpha: 0.5, w: 1.5 },
    ]

    trails.forEach((t) => {
      const grad = ctx.createLinearGradient(x + 40, y + t.yOff, x + 40 + t.len, y + t.yOff)
      grad.addColorStop(0, 'rgba(225, 6, 0, 0)')
      grad.addColorStop(0.5, `rgba(225, 6, 0, ${t.alpha * 0.4})`)
      grad.addColorStop(1, `rgba(255, 60, 40, ${t.alpha})`)

      ctx.strokeStyle = grad
      ctx.lineWidth = t.w
      ctx.beginPath()
      ctx.moveTo(x + 40, y + t.yOff)
      ctx.lineTo(x + 40 + t.len, y + t.yOff)
      ctx.stroke()
    })

    const carX = x + 160
    const carY = y + 40

    ctx.fillStyle = '#18212e'
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(carX + 220, carY + 45)
    ctx.lineTo(carX + 180, carY + 38)
    ctx.lineTo(carX + 130, carY + 35)
    ctx.lineTo(carX + 90, carY + 20)
    ctx.lineTo(carX + 60, carY + 20)
    ctx.lineTo(carX + 20, carY + 12)
    ctx.lineTo(carX + 15, carY + 45)
    ctx.lineTo(carX + 45, carY + 52)
    ctx.lineTo(carX + 85, carY + 54)
    ctx.lineTo(carX + 155, carY + 54)
    ctx.lineTo(carX + 215, carY + 52)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#00d2be'
    ctx.beginPath()
    ctx.arc(carX + 105, carY + 28, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#0b0e14'
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.ellipse(carX + 50, carY + 52, 16, 22, 0, 0, Math.PI * 2)
    ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(carX + 185, carY + 52, 14, 20, 0, 0, Math.PI * 2)
    ctx.fill(); ctx.stroke()

    ctx.restore()
  }

  private static drawGlowingCircuit(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    ctx.save()

    const points: [number, number][] = [
      [x + 120, y + 200],
      [x + 240, y + 200],
      [x + 280, y + 175],
      [x + 360, y + 90],
      [x + 440, y + 55],
      [x + 520, y + 55],
      [x + 580, y + 95],
      [x + 540, y + 130],
      [x + 590, y + 155],
      [x + 640, y + 160],
      [x + 720, y + 175],
      [x + 790, y + 185],
      [x + 740, y + 215],
      [x + 680, y + 215],
      [x + 610, y + 185],
      [x + 550, y + 185],
      [x + 460, y + 215],
      [x + 410, y + 230],
      [x + 370, y + 210],
      [x + 240, y + 200],
      [x + 120, y + 200],
    ]

    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 14
    ctx.shadowColor = '#ff1e1e'
    ctx.shadowBlur = 24
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p[0], p[1])
      else ctx.lineTo(p[0], p[1])
    })
    ctx.stroke()

    ctx.shadowBlur = 6
    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = 5
    ctx.stroke()

    ctx.shadowBlur = 0
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    const sfX = x + 180
    const sfY = y + 200
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(sfX - 3, sfY - 14, 6, 28)
    ctx.fillStyle = '#e10600'
    ctx.fillRect(sfX - 3, sfY - 14, 6, 7)
    ctx.fillRect(sfX - 3, sfY, 6, 7)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('START / FINISH', sfX, sfY + 28)

    this.drawTelemetryPin(ctx, x + 330, y + 110, 'SECTOR 1 // 215 KM/H', '#00d2be')
    this.drawTelemetryPin(ctx, x + 550, y + 90, 'SECTOR 2 // 109 KM/H', '#e10600')
    this.drawTelemetryPin(ctx, x + 760, y + 175, 'SPEED TRAP // 324 KM/H', '#ffb800')

    this.drawTurnBadge(ctx, x + 280, y + 175, 'T1')
    this.drawTurnBadge(ctx, x + 520, y + 55, 'T3')
    this.drawTurnBadge(ctx, x + 540, y + 130, 'T6')
    this.drawTurnBadge(ctx, x + 720, y + 175, 'T8')

    ctx.restore()
  }

  private static drawTelemetryPin(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    text: string,
    color: string
  ): void {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(px, py, 4, 0, Math.PI * 2)
    ctx.fill()

    const tagX = px - 60
    const tagY = py - 35
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(tagX + 70, tagY + 12)
    ctx.lineTo(tagX, tagY + 12)
    ctx.stroke()

    ctx.fillStyle = 'rgba(10, 15, 22, 0.95)'
    ctx.fillRect(tagX - 8, tagY - 6, 175, 24)
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.strokeRect(tagX - 8, tagY - 6, 175, 24)

    ctx.fillStyle = color
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(text, tagX - 2, tagY + 10)
  }

  private static drawTurnBadge(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    turn: string
  ): void {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(px + 14, py - 14, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#0a0e14'
    ctx.font = '900 10px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(turn, px + 14, py - 14)
    ctx.textBaseline = 'alphabetic'
  }

  private static drawElevationContour(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    ctx.save()
    ctx.fillStyle = 'rgba(18, 24, 34, 0.7)'
    ctx.fillRect(x, y, w, h)
    ctx.strokeStyle = '#222e40'
    ctx.strokeRect(x, y, w, h)

    ctx.fillStyle = '#65778a'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('ELEVATION CONTOUR PROFILE (DELTA +42M)', x + 14, y + 16)

    const elevPoints = [
      0.2, 0.22, 0.25, 0.45, 0.7, 0.88, 0.85, 0.72, 0.58, 0.42, 0.35, 0.28, 0.2, 0.18, 0.22,
      0.3, 0.38, 0.25, 0.2,
    ]

    const step = (w - 28) / (elevPoints.length - 1)
    const baseLine = y + h - 12

    ctx.beginPath()
    ctx.moveTo(x + 14, baseLine)
    elevPoints.forEach((val, i) => {
      const cx = x + 14 + i * step
      const cy = baseLine - val * (h - 26)
      ctx.lineTo(cx, cy)
    })
    ctx.lineTo(x + w - 14, baseLine)
    ctx.closePath()

    const grad = ctx.createLinearGradient(0, y + 16, 0, baseLine)
    grad.addColorStop(0, 'rgba(225, 6, 0, 0.45)')
    grad.addColorStop(1, 'rgba(225, 6, 0, 0.02)')
    ctx.fillStyle = grad
    ctx.fill()

    ctx.beginPath()
    elevPoints.forEach((val, i) => {
      const cx = x + 14 + i * step
      const cy = baseLine - val * (h - 26)
      if (i === 0) ctx.moveTo(cx, cy)
      else ctx.lineTo(cx, cy)
    })
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.restore()
  }

  private static drawChampionshipTimeline(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    allRaces: RaceEvent[]
  ): void {
    ctx.save()

    ctx.fillStyle = 'rgba(12, 16, 23, 0.95)'
    ctx.fillRect(x, y, w, h)
    ctx.strokeStyle = '#222f42'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, h)

    ctx.fillStyle = '#e10600'
    ctx.fillRect(x, y, 220, 28)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 13px "Arial Black", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('CHAMPIONSHIP CALENDAR', x + 14, y + 7)

    ctx.fillStyle = '#7a8c9f'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'right'
    ctx.fillText('SEASON 2026 // ROUND BY ROUND TIMELINE', x + w - 24, y + 18)

    const trackY = y + 78
    ctx.strokeStyle = '#283548'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x + 40, trackY)
    ctx.lineTo(x + w - 40, trackY)
    ctx.stroke()

    ctx.strokeStyle = '#00d2be'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x + 40, trackY)
    const numVisible = Math.min(16, Math.max(8, allRaces.length))
    const step = (w - 80) / (numVisible - 1)
    const completedCount = allRaces.filter((r) => r.status === 'completed').length
    const curX = x + 40 + Math.min(numVisible - 1, completedCount) * step
    ctx.lineTo(curX, trackY)
    ctx.stroke()

    const schedule = allRaces.length > 0 ? allRaces.slice(0, numVisible) : [
      { round: 1, name: 'Australia', country: 'AUS', status: 'completed', winner: 'Russell' },
      { round: 2, name: 'China', country: 'CHN', status: 'completed', winner: 'Antonelli' },
      { round: 3, name: 'Japan', country: 'JPN', status: 'completed', winner: 'Antonelli' },
      { round: 4, name: 'Miami', country: 'USA', status: 'completed', winner: 'Antonelli' },
      { round: 5, name: 'Canada', country: 'CAN', status: 'completed', winner: 'Antonelli' },
      { round: 6, name: 'Monaco', country: 'MON', status: 'next', winner: '' },
      { round: 7, name: 'Spain', country: 'ESP', status: 'upcoming', winner: '' },
      { round: 8, name: 'Austria', country: 'AUT', status: 'upcoming', winner: '' },
    ]

    schedule.forEach((item, idx) => {
      const nx = x + 40 + idx * step
      const isCompleted = item.status === 'completed'
      const isCurrent = item.status === 'next' || (!isCompleted && idx === completedCount)

      if (isCurrent) {
        ctx.fillStyle = '#e10600'
        ctx.shadowColor = '#ff2222'
        ctx.shadowBlur = 18
        ctx.beginPath()
        ctx.arc(nx, trackY, 20, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.fillStyle = '#ffffff'
        ctx.font = '900 13px "Arial Black", monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(item.round).padStart(2, '0'), nx, trackY)
        ctx.textBaseline = 'alphabetic'

        ctx.fillStyle = '#e10600'
        ctx.fillRect(nx - 50, trackY - 48, 100, 20)
        ctx.fillStyle = '#ffffff'
        ctx.font = '900 11px monospace'
        ctx.fillText('ACTIVE NOW', nx, trackY - 34)

        ctx.fillStyle = '#ffffff'
        ctx.font = '900 14px "Arial Black", sans-serif'
        ctx.fillText(item.country.slice(0, 3).toUpperCase(), nx, trackY + 38)
        ctx.fillStyle = '#e10600'
        ctx.font = 'bold 11px monospace'
        ctx.fillText(`ROUND ${String(item.round).padStart(2, '0')}`, nx, trackY + 54)
      } else if (isCompleted) {
        ctx.fillStyle = '#00d2be'
        ctx.beginPath()
        ctx.arc(nx, trackY, 14, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#080c12'
        ctx.font = '900 11px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(item.round).padStart(2, '0'), nx, trackY)
        ctx.textBaseline = 'alphabetic'

        ctx.fillStyle = '#8ca0b4'
        ctx.font = 'bold 12px monospace'
        ctx.fillText(item.country.slice(0, 3).toUpperCase(), nx, trackY + 36)
        ctx.fillStyle = '#00d2be'
        ctx.font = 'bold 10px monospace'
        ctx.fillText('DONE', nx, trackY + 50)
      } else {
        ctx.fillStyle = '#1c2533'
        ctx.strokeStyle = '#324258'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(nx, trackY, 12, 0, Math.PI * 2)
        ctx.fill(); ctx.stroke()

        ctx.fillStyle = '#65778a'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(item.round).padStart(2, '0'), nx, trackY)
        ctx.textBaseline = 'alphabetic'

        ctx.fillStyle = '#59697a'
        ctx.font = 'bold 11px monospace'
        ctx.fillText(item.country.slice(0, 3).toUpperCase(), nx, trackY + 36)
      }
    })

    ctx.restore()
  }

  private static renderBig1Completed(ctx: CanvasRenderingContext2D, races: RaceEvent[]): void {
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 36px "Arial Black", Impact, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('2026 RACE WINNERS & RESULTS', 48, 105)

    const list = races.slice(0, 12)
    const cardW = 430
    const cardH = 92

    list.forEach((race, i) => {
      const col = i % 4
      const row = Math.floor(i / 4)
      const x = 48 + col * (cardW + 16)
      const y = 145 + row * (cardH + 16)

      ctx.fillStyle = 'rgba(16, 22, 32, 0.9)'
      ctx.fillRect(x, y, cardW, cardH)
      ctx.strokeStyle = '#222f42'
      ctx.lineWidth = 1.5
      ctx.strokeRect(x, y, cardW, cardH)

      ctx.fillStyle = '#e10600'
      ctx.fillRect(x, y, 4, cardH)

      ctx.fillStyle = '#00d2be'
      ctx.font = 'bold 13px monospace'
      ctx.fillText(`ROUND ${String(race.round).padStart(2, '0')} // ${race.country.toUpperCase()}`, x + 16, y + 22)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 18px "Arial Black", sans-serif'
      ctx.fillText(race.name.toUpperCase(), x + 16, y + 48)

      ctx.fillStyle = '#ffb800'
      ctx.font = 'bold 15px monospace'
      ctx.fillText(`🏆 WINNER: ${race.winner?.toUpperCase() || 'P1 FINISHER'}`, x + 16, y + 74)
    })
  }

  private static renderBig1NextRace(ctx: CanvasRenderingContext2D, race: RaceEvent): void {
    this.renderMasterCalendarJourney(ctx, [race], race)
  }

  private static renderBig1Remaining(ctx: CanvasRenderingContext2D, races: RaceEvent[]): void {
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 36px "Arial Black", Impact, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('UPCOMING GRANDS PRIX // 2026 CALENDAR', 48, 105)

    const list = races.slice(0, 12)
    const cardW = 430
    const cardH = 92

    list.forEach((race, i) => {
      const col = i % 4
      const row = Math.floor(i / 4)
      const x = 48 + col * (cardW + 16)
      const y = 145 + row * (cardH + 16)

      ctx.fillStyle = 'rgba(16, 22, 32, 0.9)'
      ctx.fillRect(x, y, cardW, cardH)
      ctx.strokeStyle = '#222f42'
      ctx.lineWidth = 1.5
      ctx.strokeRect(x, y, cardW, cardH)

      ctx.fillStyle = '#00d2be'
      ctx.fillRect(x, y, 4, cardH)

      ctx.fillStyle = '#8fa2b8'
      ctx.font = 'bold 13px monospace'
      ctx.fillText(`ROUND ${String(race.round).padStart(2, '0')}`, x + 16, y + 22)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 18px "Arial Black", sans-serif'
      ctx.fillText(race.name.toUpperCase(), x + 16, y + 48)

      ctx.fillStyle = '#00d2be'
      ctx.font = 'bold 13px monospace'
      ctx.fillText(`VENUE: ${race.location.toUpperCase()}`, x + 16, y + 74)
    })
  }

  private static renderBig1Progress(
    ctx: CanvasRenderingContext2D,
    allRaces: RaceEvent[],
    completedRaces: RaceEvent[]
  ): void {
    this.renderMasterCalendarJourney(ctx, allRaces, null)
  }

  public static renderBig2(
    ctx: CanvasRenderingContext2D,
    scene: BigScreen2Scene,
    latestRace: any,
    nextRace: RaceEvent | null,
    allRaces: RaceEvent[] = []
  ): void {
    this.drawBackground(ctx)

    const tabs = [
      { id: 'spotlight', label: '01 // CALENDAR JOURNEY' },
      { id: 'podium', label: '02 // CIRCUIT GUIDE' },
      { id: 'circuit', label: '03 // TELEMETRY MAP' },
      { id: 'destination', label: '04 // GLOBAL VENUES' },
      { id: 'journey', label: '05 // TIMELINE' },
    ]

    const titleText = latestRace ? `LATEST GP: ${latestRace.name.toUpperCase()} (P1: ${latestRace.winner.toUpperCase()})` : 'FIA FORMULA 1 WORLD CHAMPIONSHIP'
    this.drawHeader(ctx, `LIVE TELEMETRY // ${titleText}`, tabs, scene)
    this.renderMasterCalendarJourney(ctx, allRaces, nextRace)
    this.drawFooter(ctx, 'Big_Screen2', 'CIRCUIT TELEMETRY & WORLD CHAMPIONSHIP ROADMAP')
  }
}
