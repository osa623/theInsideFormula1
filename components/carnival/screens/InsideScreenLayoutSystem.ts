import {
  ChampionshipGraphData,
  ConstructorProfile,
  DriverHistoryRecord,
  DriverProfile,
} from '@/lib/f1/f1DataService'

export type InsideScreen1Scene = 'intro' | 'standings' | 'bargraph' | 'momentum' | 'constructors' | 'leader'
export type InsideScreen2Scene = 'grid' | 'profile' | 'seasonStats' | 'careerStats' | 'timeline' | 'results'

export class InsideScreenLayoutSystem {
  private static readonly W = 1920
  private static readonly H = 465

  public static drawBackground(ctx: CanvasRenderingContext2D): void {
    const { W, H } = this
    const bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, '#06080b')
    bgGrad.addColorStop(0.5, '#0a0d12')
    bgGrad.addColorStop(1, '#05070a')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)'
    ctx.lineWidth = 1
    const gridSize = 36
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

    ctx.strokeStyle = '#1a2330'
    ctx.lineWidth = 2
    ctx.strokeRect(2, 2, W - 4, H - 4)

    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(2, 24); ctx.lineTo(2, 2); ctx.lineTo(24, 2)
    ctx.moveTo(W - 24, 2); ctx.lineTo(W - 2, 2); ctx.lineTo(W - 2, 24)
    ctx.moveTo(2, H - 24); ctx.lineTo(2, H - 2); ctx.lineTo(24, H - 2)
    ctx.moveTo(W - 24, H - 2); ctx.lineTo(W - 2, H - 2); ctx.lineTo(W - 2, H - 24)
    ctx.stroke()
  }

  public static drawHeader(
    ctx: CanvasRenderingContext2D,
    title: string,
    tabs: { id: string; label: string }[],
    activeTabId: string
  ): void {
    const W = this.W
    ctx.fillStyle = 'rgba(10, 13, 18, 0.95)'
    ctx.fillRect(0, 0, W, 48)
    ctx.strokeStyle = '#1c2533'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, 48)
    ctx.lineTo(W, 48)
    ctx.stroke()

    ctx.fillStyle = '#e10600'
    ctx.beginPath()
    ctx.moveTo(20, 14); ctx.lineTo(26, 14); ctx.lineTo(18, 36); ctx.lineTo(12, 36); ctx.closePath(); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(28, 14); ctx.lineTo(34, 14); ctx.lineTo(26, 36); ctx.lineTo(20, 36); ctx.closePath(); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(36, 14); ctx.lineTo(42, 14); ctx.lineTo(34, 36); ctx.lineTo(28, 36); ctx.closePath(); ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 18px "Arial Black", Impact, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(title, 52, 25)

    let tabX = W - 24
    ctx.textAlign = 'right'
    for (let i = tabs.length - 1; i >= 0; i--) {
      const tab = tabs[i]
      const isActive = tab.id === activeTabId
      ctx.font = 'bold 11px monospace'
      const tabWidth = ctx.measureText(tab.label).width + 24
      tabX -= tabWidth

      if (isActive) {
        ctx.fillStyle = '#e10600'
        ctx.fillRect(tabX, 12, tabWidth - 8, 24)
        ctx.fillStyle = '#ffffff'
      } else {
        ctx.fillStyle = 'rgba(20, 26, 36, 0.7)'
        ctx.fillRect(tabX, 12, tabWidth - 8, 24)
        ctx.strokeStyle = '#273244'
        ctx.strokeRect(tabX, 12, tabWidth - 8, 24)
        ctx.fillStyle = '#8395a8'
      }

      ctx.fillText(tab.label, tabX + tabWidth - 14, 25)
      tabX -= 8
    }
  }

  public static drawFooter(ctx: CanvasRenderingContext2D, screenName: string, subInfo: string): void {
    const W = this.W
    const H = this.H
    ctx.fillStyle = '#080a0e'
    ctx.fillRect(0, H - 28, W, 28)
    ctx.strokeStyle = '#181f2b'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, H - 28); ctx.lineTo(W, H - 28); ctx.stroke()

    ctx.fillStyle = '#e10600'
    ctx.fillRect(18, H - 20, 4, 12)

    ctx.fillStyle = '#77879a'
    ctx.font = 'bold 11px monospace'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(`INDOOR PANORAMA // ${screenName.toUpperCase()} // RESOLUTION 1920x465 (4.13:1)`, 28, H - 14)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#00d2be'
    ctx.fillText(subInfo, W - 24, H - 14)
  }

  // ==========================================
  // INSIDE SCREEN 1 (STANDINGS & HERO LEADER)
  // ==========================================

  public static renderInside1(
    ctx: CanvasRenderingContext2D,
    scene: InsideScreen1Scene,
    drivers: DriverProfile[],
    constructors: ConstructorProfile[],
    graphData: ChampionshipGraphData | null
  ): void {
    this.drawBackground(ctx)

    const tabs = [
      { id: 'intro', label: '01 // STANDINGS' },
      { id: 'standings', label: '02 // DRIVERS' },
      { id: 'bargraph', label: '03 // POINTS' },
      { id: 'momentum', label: '04 // MOMENTUM' },
      { id: 'constructors', label: '05 // CONSTRUCTORS' },
      { id: 'leader', label: '06 // LEADER' },
    ]

    this.drawHeader(ctx, 'CHAMPIONSHIP / DRIVER STANDINGS / 2026 SEASON', tabs, scene)

    // Master layout directly matching Reference Image 2 (media_1788886677569.jpg)
    this.renderMasterStandingsDashboard(ctx, drivers, constructors, graphData)

    this.drawFooter(ctx, 'inside_screen', 'FIA FORMULA 1 WORLD CHAMPIONSHIP // OFFICIAL BROADCAST TELEMETRY')
  }

  /**
   * MASTER LAYOUT MATCHING REFERENCE IMAGE 2:
   * - Left: Driver Standings (P1 Hero with big red 01, P2-P6 clean rows with bars)
   * - Center: Hero Leader Spotlight (01 MAX VERSTAPPEN, 362 POINTS in 68px, quote, stats)
   * - Top Right: Season Momentum Line Graph
   * - Bottom Right: 4 Giant Stat Callouts (WINS 6, PODIUMS 10, POLES 5, POINTS 362)
   * - Bottom Strip: Constructors Championship
   */
  public static renderMasterStandingsDashboard(
    ctx: CanvasRenderingContext2D,
    drivers: DriverProfile[],
    constructors: ConstructorProfile[],
    graphData: ChampionshipGraphData | null
  ): void {
    const list = drivers.length >= 6 ? drivers.map(d => ({
      rank: d.season2026?.position || 1,
      name: d.name,
      number: d.number,
      team: d.team,
      points: d.season2026?.points || 0,
      wins: d.season2026?.wins || 0,
      podiums: d.season2026?.podiums || 0,
      poles: d.season2026?.poles || 0,
      color: d.teamColor || '#e10600',
    })) : [
      { rank: 1, name: 'Max Verstappen', number: 1, team: 'Red Bull Racing', points: 362, wins: 6, podiums: 10, poles: 5, color: '#e10600' },
      { rank: 2, name: 'Lando Norris', number: 4, team: 'McLaren F1 Team', points: 315, wins: 3, podiums: 8, poles: 4, color: '#ff8000' },
      { rank: 3, name: 'Charles Leclerc', number: 16, team: 'Scuderia Ferrari', points: 289, wins: 2, podiums: 7, poles: 3, color: '#e80020' },
      { rank: 4, name: 'Oscar Piastri', number: 81, team: 'McLaren F1 Team', points: 248, wins: 2, podiums: 6, poles: 1, color: '#ff8000' },
      { rank: 5, name: 'George Russell', number: 63, team: 'Mercedes-AMG F1', points: 212, wins: 1, podiums: 5, poles: 2, color: '#00d2be' },
      { rank: 6, name: 'Lewis Hamilton', number: 44, team: 'Scuderia Ferrari', points: 184, wins: 0, podiums: 4, poles: 0, color: '#e80020' },
    ]

    const leader = list[0]

    // ----------------------------------------------------
    // LEFT COLUMN: DRIVER STANDINGS LIST
    // ----------------------------------------------------
    const leftX = 24
    const leftY = 60
    const leftW = 490

    // P1 HERO ROW (Giant red 01)
    ctx.fillStyle = 'rgba(18, 24, 34, 0.95)'
    ctx.fillRect(leftX, leftY, leftW, 90)
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 2
    ctx.strokeRect(leftX, leftY, leftW, 90)

    // Giant Red 01
    ctx.fillStyle = '#e10600'
    ctx.font = '900 52px "Arial Black", Impact, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('01', leftX + 16, leftY + 16)

    // Leader name & details
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 22px "Arial Black", sans-serif'
    ctx.fillText(leader.name.toUpperCase(), leftX + 92, leftY + 14)

    ctx.fillStyle = '#8f9fb2'
    ctx.font = 'bold 12px monospace'
    ctx.fillText(`${leader.team.toUpperCase()} // CAR #${leader.number || '—'}`, leftX + 92, leftY + 40)

    // Leader points
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 24px "Arial Black", monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`${leader.points} PTS`, leftX + leftW - 16, leftY + 14)

    ctx.fillStyle = '#e10600'
    ctx.font = 'bold 11px monospace'
    ctx.fillText(`${leader.wins} WINS // ${leader.podiums} POD // ${leader.poles} POLE`, leftX + leftW - 16, leftY + 42)

    // Red progress bar under P1
    ctx.fillStyle = '#e10600'
    ctx.fillRect(leftX + 92, leftY + 68, leftW - 108, 6)

    // P2 through P6 rows
    const rowH = 42
    const rowsY = leftY + 102
    for (let i = 1; i < Math.min(list.length, 6); i++) {
      const d = list[i]
      const ry = rowsY + (i - 1) * (rowH + 6)

      ctx.fillStyle = 'rgba(15, 20, 28, 0.85)'
      ctx.fillRect(leftX, ry, leftW, rowH)
      ctx.strokeStyle = '#1d2736'
      ctx.lineWidth = 1
      ctx.strokeRect(leftX, ry, leftW, rowH)

      // Position pill
      ctx.fillStyle = d.color || '#00d2be'
      ctx.fillRect(leftX, ry, 4, rowH)

      ctx.fillStyle = '#8f9fb2'
      ctx.font = '900 16px "Arial Black", monospace'
      ctx.textAlign = 'left'
      ctx.fillText(String(d.rank).padStart(2, '0'), leftX + 14, ry + 12)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 15px "Arial Black", sans-serif'
      ctx.fillText(d.name.toUpperCase(), leftX + 54, ry + 12)

      ctx.fillStyle = '#6e8094'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(d.team.toUpperCase().slice(0, 18), leftX + 220, ry + 14)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 16px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`${d.points} PTS`, leftX + leftW - 14, ry + 12)
    }

    // ----------------------------------------------------
    // CENTER COLUMN: HERO DRIVER SPOTLIGHT CARD
    // ----------------------------------------------------
    const centerX = 530
    const centerY = 60
    const centerW = 600
    const centerH = 340

    ctx.fillStyle = 'rgba(14, 19, 27, 0.95)'
    ctx.fillRect(centerX, centerY, centerW, centerH)
    ctx.strokeStyle = '#222f42'
    ctx.lineWidth = 2
    ctx.strokeRect(centerX, centerY, centerW, centerH)

    // Red header banner
    ctx.fillStyle = '#e10600'
    ctx.fillRect(centerX, centerY, 210, 26)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 12px "Arial Black", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('CHAMPIONSHIP LEADER // P1', centerX + 12, centerY + 6)

    // Driver Number & Name
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 32px "Arial Black", Impact, sans-serif'
    ctx.fillText(`${String(leader.rank).padStart(2, '0')} / ${leader.name.toUpperCase()}`, centerX + 20, centerY + 44)

    ctx.fillStyle = leader.color || '#00d2be'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(`${leader.team.toUpperCase()} // CAR #${leader.number || '—'}`, centerX + 20, centerY + 82)

    // Giant Points Display (68px font size!)
    ctx.fillStyle = '#e10600'
    ctx.font = '900 68px "Arial Black", Impact, sans-serif'
    ctx.fillText(String(leader.points), centerX + 20, centerY + 112)

    ctx.fillStyle = '#8f9fb2'
    ctx.font = '900 18px monospace'
    ctx.fillText('POINTS', centerX + 180, centerY + 155)

    // Driver motorsport helmet silhouette
    this.drawDriverHelmetSilhouette(ctx, centerX + centerW - 190, centerY + 35, 170, 160)

    // Driver Quote Box
    ctx.fillStyle = 'rgba(20, 27, 38, 0.85)'
    ctx.fillRect(centerX + 20, centerY + 196, centerW - 40, 52)
    ctx.strokeStyle = '#273548'
    ctx.strokeRect(centerX + 20, centerY + 196, centerW - 40, 52)

    ctx.fillStyle = '#e10600'
    ctx.fillRect(centerX + 20, centerY + 196, 4, 52)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'italic bold 14px "Arial Black", sans-serif'
    ctx.fillText('"CONSISTENCY BUILDS CHAMPIONS."', centerX + 34, centerY + 214)

    // Stat Breakdown Pills
    const pillW = (centerW - 40 - 24) / 4
    const pills = [
      { label: 'WINS', val: String(leader.wins), color: '#e10600' },
      { label: 'PODIUMS', val: String(leader.podiums), color: '#00d2be' },
      { label: 'POLES', val: String(leader.poles), color: '#ffb800' },
      { label: 'POINTS', val: String(leader.points), color: '#ffffff' },
    ]

    pills.forEach((p, idx) => {
      const px = centerX + 20 + idx * (pillW + 8)
      const py = centerY + 262

      ctx.fillStyle = 'rgba(18, 25, 36, 0.9)'
      ctx.fillRect(px, py, pillW, 64)
      ctx.strokeStyle = '#243246'
      ctx.lineWidth = 1.5
      ctx.strokeRect(px, py, pillW, 64)

      ctx.fillStyle = '#6d7f94'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(p.label, px + pillW / 2, py + 12)

      ctx.fillStyle = p.color
      ctx.font = '900 24px "Arial Black", Impact, sans-serif'
      ctx.fillText(p.val, px + pillW / 2, py + 32)
    })

    // ----------------------------------------------------
    // RIGHT COLUMN (TOP): SEASON MOMENTUM LINE GRAPH
    // ----------------------------------------------------
    const rightX = 1146
    const rightY = 60
    const rightW = 750
    const graphH = 175

    ctx.fillStyle = 'rgba(13, 18, 25, 0.95)'
    ctx.fillRect(rightX, rightY, rightW, graphH)
    ctx.strokeStyle = '#222f42'
    ctx.lineWidth = 2
    ctx.strokeRect(rightX, rightY, rightW, graphH)

    const completedCount = graphData?.rounds?.length || 5
    ctx.fillStyle = '#e10600'
    ctx.fillRect(rightX, rightY, 240, 24)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 11px "Arial Black", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`SEASON MOMENTUM // ${completedCount} ROUNDS LOGGED`, rightX + 12, rightY + 5)

    this.drawSeasonMomentumGraph(ctx, rightX + 24, rightY + 36, rightW - 48, graphH - 48, graphData)

    // ----------------------------------------------------
    // RIGHT COLUMN (BOTTOM): 4 GIANT STAT CALLOUT BOXES
    // ----------------------------------------------------
    const statBoxY = rightY + 185
    const statBoxH = 155
    const cardW = (rightW - 30) / 4

    const statCards = [
      { label: 'RACE WINS', num: String(leader.wins), sub: 'SEASON VICTORIES', color: '#e10600' },
      { label: 'PODIUMS', num: String(leader.podiums), sub: 'TOP 3 FINISHES', color: '#00d2be' },
      { label: 'POLE POSITIONS', num: String(leader.poles), sub: 'QUALIFYING SPEED', color: '#ffb800' },
      { label: 'TOTAL POINTS', num: String(leader.points), sub: 'CHAMPIONSHIP LEAD', color: '#ffffff' },
    ]

    statCards.forEach((c, idx) => {
      const cx = rightX + idx * (cardW + 10)

      ctx.fillStyle = 'rgba(16, 22, 32, 0.95)'
      ctx.fillRect(cx, statBoxY, cardW, statBoxH)
      ctx.strokeStyle = '#243245'
      ctx.lineWidth = 1.5
      ctx.strokeRect(cx, statBoxY, cardW, statBoxH)

      ctx.fillStyle = c.color
      ctx.fillRect(cx, statBoxY, cardW, 4)

      ctx.fillStyle = '#7a8c9e'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(c.label, cx + cardW / 2, statBoxY + 18)

      ctx.fillStyle = c.color
      ctx.font = '900 36px "Arial Black", Impact, sans-serif'
      ctx.fillText(c.num, cx + cardW / 2, statBoxY + 50)

      ctx.fillStyle = '#5a6b7d'
      ctx.font = 'bold 10px monospace'
      ctx.fillText(c.sub, cx + cardW / 2, statBoxY + 105)

      // Bracket accent
      ctx.strokeStyle = c.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx + cardW - 14, statBoxY + statBoxH - 6)
      ctx.lineTo(cx + cardW - 6, statBoxY + statBoxH - 6)
      ctx.lineTo(cx + cardW - 6, statBoxY + statBoxH - 14)
      ctx.stroke()
    })

    // ----------------------------------------------------
    // BOTTOM STRIP: CONSTRUCTORS CHAMPIONSHIP TICKER
    // ----------------------------------------------------
    const tickerY = 410
    ctx.fillStyle = 'rgba(10, 14, 20, 0.98)'
    ctx.fillRect(leftX, tickerY, 1872, 24)
    ctx.strokeStyle = '#1d2737'
    ctx.lineWidth = 1
    ctx.strokeRect(leftX, tickerY, 1872, 24)

    ctx.fillStyle = '#e10600'
    ctx.font = '900 11px "Arial Black", monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('CONSTRUCTORS CHAMPIONSHIP //', leftX + 12, tickerY + 12)

    const cList = constructors && constructors.length > 0 ? constructors.slice(0, 5).map(c => ({
      name: c.shortName || c.name,
      points: c.season2026?.points || 0,
      wins: c.season2026?.wins || 0,
    })) : [
      { name: 'Mercedes', points: 468, wins: 9 },
      { name: 'Ferrari', points: 346, wins: 2 },
      { name: 'McLaren', points: 287, wins: 2 },
      { name: 'Red Bull', points: 198, wins: 1 },
      { name: 'Aston Martin', points: 94, wins: 0 },
    ]

    let cx = leftX + 220
    cList.forEach((team, idx) => {
      ctx.fillStyle = '#8ea1b4'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(`0${idx + 1} ${team.name.toUpperCase()}`, cx, tickerY + 12)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 12px "Arial Black", monospace'
      ctx.fillText(`${team.points} PTS`, cx + ctx.measureText(`0${idx + 1} ${team.name.toUpperCase()}`).width + 8, tickerY + 12)

      cx += 280
    })
    ctx.textBaseline = 'alphabetic'
  }

  /**
   * Draws motorsport driver helmet silhouette in mood lighting
   */
  private static drawDriverHelmetSilhouette(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    ctx.save()

    // Glowing red circular rim backlight
    const radGrad = ctx.createRadialGradient(x + 85, y + 80, 10, x + 85, y + 80, 80)
    radGrad.addColorStop(0, 'rgba(225, 6, 0, 0.45)')
    radGrad.addColorStop(0.7, 'rgba(225, 6, 0, 0.15)')
    radGrad.addColorStop(1, 'rgba(225, 6, 0, 0)')
    ctx.fillStyle = radGrad
    ctx.beginPath()
    ctx.arc(x + 85, y + 80, 80, 0, Math.PI * 2)
    ctx.fill()

    // Stylized helmet silhouette
    const hx = x + 35
    const hy = y + 25

    ctx.fillStyle = '#141c28'
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 2.5

    // Outer helmet shape
    ctx.beginPath()
    ctx.moveTo(hx + 30, hy + 20)
    ctx.bezierCurveTo(hx + 70, hy - 5, hx + 110, hy + 20, hx + 115, hy + 65)
    ctx.bezierCurveTo(hx + 120, hy + 95, hx + 105, hy + 115, hx + 85, hy + 120)
    ctx.bezierCurveTo(hx + 65, hy + 125, hx + 40, hy + 120, hx + 25, hy + 105)
    ctx.bezierCurveTo(hx + 15, hy + 90, hx + 15, hy + 45, hx + 30, hy + 20)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Visor shape in dark cyan tint
    ctx.fillStyle = '#061a20'
    ctx.strokeStyle = '#00d2be'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(hx + 65, hy + 45)
    ctx.lineTo(hx + 105, hy + 50)
    ctx.bezierCurveTo(hx + 110, hy + 65, hx + 105, hy + 80, hx + 95, hy + 82)
    ctx.lineTo(hx + 60, hy + 76)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Visor reflection streak
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(hx + 72, hy + 52)
    ctx.lineTo(hx + 96, hy + 55)
    ctx.stroke()

    ctx.restore()
  }

  /**
   * Draws the Season Momentum Points Curve line graph
   */
  /**
   * Draws the Season Momentum Points Curve line graph
   */
  private static drawSeasonMomentumGraph(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    graphData?: ChampionshipGraphData | null
  ): void {
    ctx.save()

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let r = 0; r <= 3; r++) {
      const gy = y + (h / 3) * r
      ctx.beginPath()
      ctx.moveTo(x, gy)
      ctx.lineTo(x + w, gy)
      ctx.stroke()
    }

    const leaderPoints = graphData?.drivers?.[0]?.points
    const pointsData = (leaderPoints && leaderPoints.length >= 2)
      ? leaderPoints
      : [25, 51, 68, 86, 111, 136, 154, 179, 194, 204, 219, 237, 242, 267]

    const maxPts = Math.max(300, Math.ceil((pointsData[pointsData.length - 1] || 250) * 1.25))
    const stepX = w / Math.max(1, pointsData.length - 1)

    // Fill under curve
    ctx.beginPath()
    ctx.moveTo(x, y + h)
    pointsData.forEach((pts, i) => {
      const px = x + i * stepX
      const py = y + h - (pts / maxPts) * h
      ctx.lineTo(px, py)
    })
    ctx.lineTo(x + w, y + h)
    ctx.closePath()

    const grad = ctx.createLinearGradient(0, y, 0, y + h)
    grad.addColorStop(0, 'rgba(225, 6, 0, 0.45)')
    grad.addColorStop(1, 'rgba(225, 6, 0, 0.02)')
    ctx.fillStyle = grad
    ctx.fill()

    // Glowing red line stroke
    ctx.shadowColor = '#ff1e1e'
    ctx.shadowBlur = 12
    ctx.strokeStyle = '#e10600'
    ctx.lineWidth = 3

    ctx.beginPath()
    pointsData.forEach((pts, i) => {
      const px = x + i * stepX
      const py = y + h - (pts / maxPts) * h
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.stroke()
    ctx.shadowBlur = 0

    // Highlight data points with white glowing dots
    pointsData.forEach((pts, idx) => {
      const wx = x + idx * stepX
      const wy = y + h - (pts / maxPts) * h

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(wx, wy, 3.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#e10600'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(wx, wy, 6, 0, Math.PI * 2)
      ctx.stroke()
    })

    ctx.restore()
  }

  // ==========================================
  // INSIDE SCREEN 2 (DRIVER PROFILES & GRID)
  // ==========================================

  public static renderInside2(
    ctx: CanvasRenderingContext2D,
    scene: InsideScreen2Scene,
    drivers: DriverProfile[],
    activeDriver: DriverProfile | null,
    driverHistory: DriverHistoryRecord | null
  ): void {
    this.drawBackground(ctx)

    const tabs = [
      { id: 'grid', label: '01 // GRID OVERVIEW' },
      { id: 'profile', label: '02 // DRIVER PROFILE' },
      { id: 'seasonStats', label: '03 // SEASON STATS' },
      { id: 'careerStats', label: '04 // CAREER STATS' },
      { id: 'timeline', label: '05 // TIMELINE' },
      { id: 'results', label: '06 // RACE LOG' },
    ]

    const titleDriver = activeDriver ? ` // ${activeDriver.name.toUpperCase()} (#${activeDriver.number})` : ''
    this.drawHeader(ctx, `CHAMPIONSHIP / DRIVER SPOTLIGHT / 2026 SEASON${titleDriver}`, tabs, scene)

    // Render high-impact dashboard with active driver or grid leader
    const displayDrivers = activeDriver ? [activeDriver, ...drivers.filter(d => d.id !== activeDriver.id)] : drivers
    this.renderMasterStandingsDashboard(ctx, displayDrivers, [], null)

    this.drawFooter(ctx, 'inside_screen_2', 'DRIVER TELEMETRY & 2026 WORLD CHAMPIONSHIP STATUS')
  }
}
