import {
  NormalizedScreenData,
  NormalizedSection,
  NormalizedSlide,
  ScreenRenderState,
  KeyFactItem,
  TableData,
  TimelineEvent,
  ComparisonItem,
} from './screenTypes'

// ── High-Tech F1 Exhibition Design Tokens ──────────────────────────────
const COLOR = {
  bgGradientStart: '#030508',
  bgGradientMid: '#080c14',
  bgGradientEnd: '#0f0407',
  cardBg: 'rgba(6, 10, 16, 0.94)',
  cardBgSubtle: 'rgba(12, 18, 28, 0.78)',
  cardBorder: 'rgba(244, 6, 18, 0.50)',
  cardBorderSubtle: 'rgba(255, 255, 255, 0.12)',
  red: '#f40612',
  redBright: '#ff1e27',
  redGlow: 'rgba(244, 6, 18, 0.75)',
  redDark: '#8a030a',
  white: '#ffffff',
  whiteSoft: '#f5f7fc',
  textMuted: '#9eb0c6',
  textDim: '#6b7c91',
  yellow: '#ffb000',
  cyan: '#00d2be',
  emerald: '#00f076',
  gold: '#ffd166',
  purple: '#a78bfa',
}

// ── Layout Constants (1920 x 1080) ─────────────────────────────────────
const PAD = 48
const HEADER_H = 120
const FOOTER_H = 88
const GAP = 36

// ── Text Formatting Helpers ────────────────────────────────────────────
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth || !currentLine) {
      currentLine = candidate
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) lines.push(currentLine)
  return lines
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  paragraphs: string[],
  x: number,
  y: number,
  maxWidth: number,
  font: string,
  color: string,
  lineHeight: number,
  maxLines = 10
): number {
  ctx.fillStyle = color
  let cursorY = y
  let drawnLines = 0

  for (const para of paragraphs) {
    const lines = fitText(ctx, para, maxWidth, font)
    for (const line of lines) {
      if (drawnLines >= maxLines) return cursorY
      ctx.font = font
      ctx.fillText(line, x, cursorY)
      cursorY += lineHeight
      drawnLines += 1
    }
    cursorY += 12
  }

  return cursorY
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius)
  } else {
    ctx.rect(x, y, w, h)
  }
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  borderColor = COLOR.cardBorder,
  bgColor = COLOR.cardBg,
  cornerRadius = 10
) {
  ctx.save()
  ctx.fillStyle = bgColor
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 2

  ctx.beginPath()
  drawRoundRect(ctx, x, y, w, h, cornerRadius)
  ctx.fill()
  ctx.stroke()

  // Specular top-edge glass sheen highlight
  const sheenGrad = ctx.createLinearGradient(x, y, x + w, y)
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)')
  sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)')
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.25)')
  ctx.strokeStyle = sheenGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x + cornerRadius, y + 1)
  ctx.lineTo(x + w - cornerRadius, y + 1)
  ctx.stroke()

  // Precision red corner bracket accents
  ctx.strokeStyle = COLOR.redBright
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.moveTo(x, y + 26)
  ctx.lineTo(x, y)
  ctx.lineTo(x + 26, y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + w, y + h - 26)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + w - 26, y + h)
  ctx.stroke()
  ctx.restore()
}

// ── Background Carbon Weave & Multi-Layer System ───────────────────────
function drawAtmosphericBackground(ctx: CanvasRenderingContext2D, width: number, height: number, category: string) {
  // 1. Base Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height)
  bgGradient.addColorStop(0, COLOR.bgGradientStart)
  bgGradient.addColorStop(0.5, COLOR.bgGradientMid)
  bgGradient.addColorStop(1, COLOR.bgGradientEnd)
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // 2. Procedural Carbon Fiber Weave Texture (High-tech aerospace feel)
  ctx.save()
  const patternSize = 16
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += patternSize) {
    ctx.strokeStyle = (x / patternSize) % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.35)'
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += patternSize) {
    ctx.strokeStyle = (y / patternSize) % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.35)'
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.restore()

  // 3. Diagonal Engineering Coordinate Grid
  ctx.save()
  ctx.strokeStyle = 'rgba(244, 6, 18, 0.035)'
  ctx.lineWidth = 1
  for (let i = 0; i < 28; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 100, 0)
    ctx.lineTo(i * 100 + 400, height)
    ctx.stroke()
  }
  ctx.restore()

  // 4. Subtle Radial Atmospheric Telemetry Glow
  ctx.save()
  let glowColor = 'rgba(244, 6, 18, 0.06)'
  if (category === 'TYRES') glowColor = 'rgba(255, 176, 0, 0.05)'
  else if (category === 'CHASSIS') glowColor = 'rgba(0, 210, 190, 0.05)'
  else if (category === 'CIRCUITS') glowColor = 'rgba(0, 240, 118, 0.05)'

  const radGlow = ctx.createRadialGradient(width * 0.5, height * 0.45, 100, width * 0.5, height * 0.45, 900)
  radGlow.addColorStop(0, glowColor)
  radGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = radGlow
  ctx.fillRect(0, 0, width, height)
  ctx.restore()

  // 5. High-Resolution OLED/CRT Micro Scanlines
  ctx.save()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)'
  ctx.lineWidth = 1
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.restore()

  // 6. Perimeter Framing & Precision Reticle Brackets
  ctx.save()
  ctx.strokeStyle = 'rgba(244, 6, 18, 0.45)'
  ctx.lineWidth = 2.5
  ctx.strokeRect(20, 12, width - 40, height - 24)

  // Reticle Crosshairs at 4 corners
  const bracketSize = 24
  ctx.strokeStyle = COLOR.redBright
  ctx.lineWidth = 2
  // Top-left
  ctx.beginPath(); ctx.moveTo(20, 12 + bracketSize); ctx.lineTo(20, 12); ctx.lineTo(20 + bracketSize, 12); ctx.stroke()
  // Top-right
  ctx.beginPath(); ctx.moveTo(width - 20 - bracketSize, 12); ctx.lineTo(width - 20, 12); ctx.lineTo(width - 20, 12 + bracketSize); ctx.stroke()
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(20, height - 12 - bracketSize); ctx.lineTo(20, height - 12); ctx.lineTo(20 + bracketSize, height - 12); ctx.stroke()
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(width - 20 - bracketSize, height - 12); ctx.lineTo(width - 20, height - 12); ctx.lineTo(width - 20, height - 12 - bracketSize); ctx.stroke()

  // Technical coordinate labels
  ctx.font = '700 11px monospace'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.fillText('FIA TECH REG // 2026 ARCHIVE', 30, 26)
  ctx.fillText('COORD [1920x1080] // CALIBRATED', width - 260, 26)
  ctx.restore()
}

// ── Top Header Bar ─────────────────────────────────────────────────────
function drawHeader(
  ctx: CanvasRenderingContext2D,
  data: NormalizedScreenData,
  sectionIndex: number,
  width: number
) {
  const section = data.sections[sectionIndex]
  const totalSections = data.sections.length

  // Header container
  drawPanel(ctx, PAD, 24, width - PAD * 2, HEADER_H - 12, 'rgba(244, 6, 18, 0.40)', 'rgba(5, 8, 14, 0.96)', 8)

  // 1. Left F1 Brand Emblem
  ctx.save()
  ctx.fillStyle = 'rgba(244, 6, 18, 0.22)'
  ctx.strokeStyle = COLOR.redBright
  ctx.lineWidth = 2
  ctx.beginPath()
  drawRoundRect(ctx, PAD + 18, 38, 140, 64, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = COLOR.white
  ctx.font = '900 16px Arial'
  ctx.fillText('FORMULA 1', PAD + 32, 60)

  ctx.fillStyle = COLOR.redBright
  ctx.font = '900 italic 34px Impact, Arial Black'
  ctx.fillText('EXHIBITION', PAD + 25, 92)
  ctx.restore()

  // 2. Center: Screen Topic Title
  const titleClean = data.name.replace(/THE INSIDE FORMULA 1\s*[—\-]\s*/i, '').toUpperCase()
  ctx.fillStyle = COLOR.white
  ctx.font = '900 40px Arial'
  ctx.fillText(titleClean, PAD + 184, 72)

  // Subtitle / Subject metadata
  ctx.fillStyle = COLOR.textMuted
  ctx.font = '600 21px Arial'
  const subtext = (data.subject ?? 'OFFICIAL TECHNICAL DOSSIER & REGULATORY ARCHIVE').toUpperCase().slice(0, 75)
  ctx.fillText(subtext, PAD + 186, 102)

  // 3. Telemetry Status Badge (Center-Right)
  const statusX = width - PAD - 580
  ctx.save()
  ctx.fillStyle = 'rgba(0, 240, 118, 0.12)'
  ctx.strokeStyle = COLOR.emerald
  ctx.lineWidth = 1.2
  ctx.beginPath()
  drawRoundRect(ctx, statusX, 48, 200, 44, 5)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = COLOR.emerald
  ctx.beginPath()
  ctx.arc(statusX + 16, 70, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.font = '800 13px monospace'
  ctx.fillStyle = COLOR.white
  ctx.fillText('LIVE TELEMETRY', statusX + 30, 68)
  ctx.font = '700 11px monospace'
  ctx.fillStyle = COLOR.emerald
  ctx.fillText('4.8 GB/S // VERIFIED', statusX + 30, 82)
  ctx.restore()

  // 4. Right: Section pill
  const pillW = 340
  const pillX = width - PAD - pillW - 18
  ctx.save()
  ctx.fillStyle = 'rgba(244, 6, 18, 0.18)'
  ctx.strokeStyle = COLOR.red
  ctx.lineWidth = 1.5
  ctx.beginPath()
  drawRoundRect(ctx, pillX, 38, pillW, 64, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = COLOR.redBright
  ctx.font = '900 20px Arial'
  ctx.fillText(`SECTION ${String(sectionIndex + 1).padStart(2, '0')} / ${String(totalSections).padStart(2, '0')}`, pillX + 16, 62)

  ctx.fillStyle = COLOR.white
  ctx.font = '800 20px Arial'
  const secTitle = (section?.title ?? data.category).toUpperCase().slice(0, 22)
  ctx.fillText(secTitle, pillX + 16, 88)
  ctx.restore()
}

// ── Domain-Specific Visual Schematic Layer (Rendered in Hero Column) ──
function drawDomainWatermark(
  ctx: CanvasRenderingContext2D,
  category: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save()
  ctx.lineWidth = 2

  if (category === 'TYRES') {
    // Faint Tyre Cross-Section & Thermal Map Schematic
    const cx = x + w - 160
    const cy = y + h - 140
    const r = 90

    // Outer tread ring
    ctx.strokeStyle = 'rgba(255, 176, 0, 0.15)'
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()

    // Inner rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2)
    ctx.stroke()

    // Tread blocks
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * (r - 12), cy + Math.sin(a) * (r - 12))
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      ctx.stroke()
    }

    // Thermal label
    ctx.font = '700 12px monospace'
    ctx.fillStyle = 'rgba(255, 176, 0, 0.35)'
    ctx.fillText('THERMAL CORE: 105°C', cx - 60, cy + r + 24)
  } else if (category === 'CHASSIS') {
    // Monocoque Survival Cell Load Vector Wireframe
    const cx = x + w - 210
    const cy = y + h - 160

    ctx.strokeStyle = 'rgba(0, 210, 190, 0.18)'
    ctx.beginPath()
    ctx.moveTo(cx, cy + 40)
    ctx.lineTo(cx + 80, cy)
    ctx.lineTo(cx + 170, cy + 10)
    ctx.lineTo(cx + 190, cy + 60)
    ctx.lineTo(cx, cy + 60)
    ctx.closePath()
    ctx.stroke()

    // Halo arch
    ctx.beginPath()
    ctx.arc(cx + 90, cy + 10, 25, Math.PI, Math.PI * 2)
    ctx.stroke()

    ctx.font = '700 12px monospace'
    ctx.fillStyle = 'rgba(0, 210, 190, 0.35)'
    ctx.fillText('HALO: 120 kN PEAK LOAD', cx, cy + 85)
  } else if (category === 'CIRCUITS') {
    // Abstract Circuit Elevation & Telemetry Track Loop
    const cx = x + w - 210
    const cy = y + h - 150

    ctx.strokeStyle = 'rgba(0, 240, 118, 0.18)'
    ctx.beginPath()
    ctx.moveTo(cx, cy + 30)
    ctx.bezierCurveTo(cx + 20, cy - 20, cx + 90, cy - 30, cx + 140, cy - 10)
    ctx.bezierCurveTo(cx + 190, cy + 10, cx + 180, cy + 50, cx + 120, cy + 60)
    ctx.bezierCurveTo(cx + 70, cy + 70, cx - 10, cy + 60, cx, cy + 30)
    ctx.stroke()

    ctx.font = '700 12px monospace'
    ctx.fillStyle = 'rgba(0, 240, 118, 0.35)'
    ctx.fillText('SPEED TRACE: 342 KM/H', cx, cy + 85)
  } else {
    // Formula Tier Ladder Architecture (F4 -> F3 -> F2 -> F1)
    const cx = x + w - 220
    const cy = y + h - 150

    ctx.strokeStyle = 'rgba(244, 6, 18, 0.20)'
    ctx.strokeRect(cx, cy + 45, 40, 24)
    ctx.strokeRect(cx + 50, cy + 30, 40, 39)
    ctx.strokeRect(cx + 100, cy + 15, 40, 54)
    ctx.strokeRect(cx + 150, cy, 45, 69)

    ctx.font = '700 12px monospace'
    ctx.fillStyle = 'rgba(244, 6, 18, 0.35)'
    ctx.fillText('FIA PATHWAY: F4 » F1', cx, cy + 88)
  }

  ctx.restore()
}

// ── Left Main Hero Column ──────────────────────────────────────────────
function drawHeroColumn(
  ctx: CanvasRenderingContext2D,
  slide: NormalizedSlide,
  slideIdx: number,
  totalSlides: number,
  category: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  drawPanel(ctx, x, y, w, h, 'rgba(244, 6, 18, 0.45)', 'rgba(6, 10, 17, 0.96)', 10)

  // Domain Watermark in Background of Hero Column
  drawDomainWatermark(ctx, category, x, y, w, h)

  const innerPad = 48

  // Slide Badge & Tag
  ctx.save()
  ctx.fillStyle = 'rgba(244, 6, 18, 0.25)'
  ctx.strokeStyle = COLOR.redBright
  ctx.lineWidth = 1.5
  ctx.beginPath()
  drawRoundRect(ctx, x + innerPad, y + 36, 180, 42, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = COLOR.white
  ctx.font = '900 24px Arial'
  ctx.fillText(`SLIDE ${String(slideIdx + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`, x + innerPad + 18, y + 66)
  ctx.restore()

  if (slide.subtitle || slide.yearContext) {
    ctx.fillStyle = COLOR.cyan
    ctx.font = '800 26px Arial'
    const tag = (slide.subtitle ?? slide.yearContext ?? '').toUpperCase().slice(0, 42)
    ctx.fillText(tag, x + innerPad + 204, y + 66)
  }

  // ── Slide Title (Large, Bold, High Impact) ──
  ctx.fillStyle = COLOR.white
  ctx.font = '900 52px Arial'
  let textCursorY = drawWrappedText(
    ctx,
    [slide.title.toUpperCase()],
    x + innerPad,
    y + 144,
    w - innerPad * 2,
    '900 52px Arial',
    COLOR.white,
    62,
    2
  )

  // Red-to-gold gradient accent bar
  const barGrad = ctx.createLinearGradient(x + innerPad, 0, x + innerPad + 220, 0)
  barGrad.addColorStop(0, COLOR.redBright)
  barGrad.addColorStop(1, COLOR.gold)
  ctx.fillStyle = barGrad
  ctx.fillRect(x + innerPad, textCursorY + 10, 200, 5)

  // ── Main Educational Explanation ──
  textCursorY = drawWrappedText(
    ctx,
    slide.content,
    x + innerPad,
    textCursorY + 46,
    w - innerPad * 2,
    '500 33px Arial',
    COLOR.whiteSoft,
    50,
    5
  )

  // ── Bottom Key Takeaway Callout Box ──
  const calloutH = 145
  const calloutY = y + h - calloutH - 36
  const calloutW = w - innerPad * 2

  ctx.save()
  ctx.fillStyle = 'rgba(15, 22, 34, 0.88)'
  ctx.strokeStyle = 'rgba(244, 6, 18, 0.45)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  drawRoundRect(ctx, x + innerPad, calloutY, calloutW, calloutH, 8)
  ctx.fill()
  ctx.stroke()

  // Red left accent strip
  ctx.fillStyle = COLOR.redBright
  ctx.fillRect(x + innerPad, calloutY, 8, calloutH)

  // Quote icon
  ctx.fillStyle = COLOR.redBright
  ctx.font = '900 italic 44px Georgia, serif'
  ctx.fillText('“', x + innerPad + 24, calloutY + 46)

  // Highlight Text
  const quoteText =
    slide.highlightQuote ||
    (slide.keyFacts && slide.keyFacts[0] ? slide.keyFacts[0].value : 'Engineered to withstand extreme aerodynamic and thermal stresses under peak racing conditions.')

  drawWrappedText(
    ctx,
    [quoteText],
    x + innerPad + 60,
    calloutY + 42,
    calloutW - 84,
    '600 italic 27px Arial',
    COLOR.white,
    39,
    2
  )

  // Attribution subline
  ctx.font = '700 13px monospace'
  ctx.fillStyle = COLOR.gold
  ctx.fillText('OFFICIAL FIA HOMOLOGATION DOSSIER // VERIFIED SPECIFICATION', x + innerPad + 60, calloutY + calloutH - 18)

  ctx.restore()
}

// ── Right Technical Data Column ────────────────────────────────────────
function drawDataColumn(
  ctx: CanvasRenderingContext2D,
  slide: NormalizedSlide,
  section: NormalizedSection,
  x: number,
  y: number,
  w: number,
  h: number
) {
  drawPanel(ctx, x, y, w, h, 'rgba(244, 6, 18, 0.45)', 'rgba(6, 10, 17, 0.96)', 10)

  const innerPad = 40

  // Column Title
  ctx.fillStyle = COLOR.white
  ctx.font = '900 28px Arial'
  ctx.fillText('TECHNICAL SPECIFICATIONS', x + innerPad, y + 54)

  ctx.fillStyle = COLOR.redBright
  ctx.fillRect(x + innerPad, y + 66, w - innerPad * 2, 3)

  // Case A: Table
  if (slide.table) {
    const table = slide.table
    const numCols = Math.min(table.columns.length, 3)
    const colWidth = (w - innerPad * 2) / numCols
    const headerY = y + 116

    // Headers with high contrast
    ctx.font = '800 24px Arial'
    ctx.fillStyle = COLOR.redBright
    for (let c = 0; c < numCols; c++) {
      ctx.fillText(table.columns[c].toUpperCase().slice(0, 15), x + innerPad + c * colWidth + 10, headerY)
    }

    const maxRows = Math.min(table.rows.length, 6)
    const rowHeight = Math.floor((h - 220) / maxRows)

    for (let r = 0; r < maxRows; r++) {
      const row = table.rows[r]
      const rowY = headerY + 28 + r * rowHeight

      // Alternating gradient rows
      const rowGrad = ctx.createLinearGradient(x + innerPad, 0, x + w - innerPad, 0)
      if (r % 2 === 0) {
        rowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)')
        rowGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)')
      } else {
        rowGrad.addColorStop(0, 'rgba(244, 6, 18, 0.08)')
        rowGrad.addColorStop(1, 'rgba(255, 255, 255, 0.04)')
      }
      ctx.fillStyle = rowGrad
      ctx.fillRect(x + innerPad, rowY - 8, w - innerPad * 2, rowHeight - 6)

      ctx.fillStyle = COLOR.whiteSoft
      ctx.font = '500 24px Arial'
      for (let c = 0; c < numCols; c++) {
        const cell = row[c] ?? ''
        const clipped = cell.length > 22 ? `${cell.slice(0, 19)}…` : cell
        ctx.fillText(clipped, x + innerPad + c * colWidth + 10, rowY + rowHeight * 0.48)
      }
    }
    return
  }

  // Case B: Timeline Events
  if (slide.events && slide.events.length > 0) {
    const events = slide.events.slice(0, 3)
    const itemH = Math.floor((h - 130) / events.length)

    // Vertical Timeline Connection Spine
    const spineX = x + innerPad + 18
    ctx.strokeStyle = 'rgba(244, 6, 18, 0.40)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(spineX, y + 100)
    ctx.lineTo(spineX, y + 100 + (events.length - 1) * itemH + 30)
    ctx.stroke()

    events.forEach((ev, idx) => {
      const cardY = y + 96 + idx * itemH
      const cardX = x + innerPad + 36
      const cardW = w - innerPad * 2 - 36

      // Illuminated node
      ctx.fillStyle = COLOR.redBright
      ctx.beginPath()
      ctx.arc(spineX, cardY + 28, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.save()
      ctx.fillStyle = 'rgba(16, 22, 34, 0.85)'
      ctx.strokeStyle = COLOR.red
      ctx.lineWidth = 1.5
      ctx.beginPath()
      drawRoundRect(ctx, cardX, cardY, cardW, itemH - 16, 8)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = COLOR.gold
      ctx.font = '900 28px Arial'
      ctx.fillText(ev.period, cardX + 20, cardY + 40)

      ctx.fillStyle = COLOR.white
      ctx.font = '600 24px Arial'
      drawWrappedText(ctx, [ev.event], cardX + 20, cardY + 76, cardW - 36, '600 24px Arial', COLOR.white, 34, 3)
      ctx.restore()
    })
    return
  }

  // Case C: Comparison
  if (slide.comparison && slide.comparison.length > 0) {
    const items = slide.comparison.slice(0, 2)
    const itemH = Math.floor((h - 130) / items.length)

    items.forEach((item, idx) => {
      const cardY = y + 96 + idx * itemH
      ctx.save()
      ctx.fillStyle = 'rgba(16, 22, 34, 0.85)'
      ctx.strokeStyle = item.color || COLOR.red
      ctx.lineWidth = 2
      ctx.beginPath()
      drawRoundRect(ctx, x + innerPad, cardY, w - innerPad * 2, itemH - 16, 8)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = item.color || COLOR.white
      ctx.font = '900 28px Arial'
      ctx.fillText(item.label.toUpperCase(), x + innerPad + 20, cardY + 42)

      if (item.spec) {
        ctx.fillStyle = COLOR.yellow
        ctx.font = '700 24px Arial'
        ctx.fillText(item.spec, x + innerPad + 20, cardY + 74)
      }

      if (item.description) {
        drawWrappedText(ctx, [item.description], x + innerPad + 20, cardY + 110, w - innerPad * 2 - 40, '500 24px Arial', COLOR.whiteSoft, 34, 3)
      }

      // Comparison Bar Gauge at bottom of card
      const barW = w - innerPad * 2 - 40
      const barY = cardY + itemH - 34
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(x + innerPad + 20, barY, barW, 8)
      ctx.fillStyle = item.color || COLOR.redBright
      ctx.fillRect(x + innerPad + 20, barY, barW * (idx === 0 ? 0.85 : 0.65), 8)

      ctx.restore()
    })
    return
  }

  // Case D: Key Facts (Default & Highest Frequency)
  const facts = (slide.keyFacts || []).slice(0, 3)
  const cardCount = Math.max(facts.length, 1)
  const itemH = Math.floor((h - 140) / cardCount)

  if (facts.length === 0) {
    ctx.fillStyle = COLOR.white
    ctx.font = '700 26px Arial'
    const overview = section.overview || section.title
    drawWrappedText(ctx, [overview], x + innerPad, y + 110, w - innerPad * 2, '500 26px Arial', COLOR.whiteSoft, 38, 8)
    return
  }

  facts.forEach((fact, fIdx) => {
    const cardY = y + 96 + fIdx * itemH
    const cardW = w - innerPad * 2
    const cardInnerH = itemH - 16

    ctx.save()
    ctx.fillStyle = 'rgba(14, 20, 32, 0.88)'
    ctx.strokeStyle = 'rgba(244, 6, 18, 0.40)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    drawRoundRect(ctx, x + innerPad, cardY, cardW, cardInnerH, 8)
    ctx.fill()
    ctx.stroke()

    // Left Colored Severity Strip
    const stripColor = fIdx === 0 ? COLOR.redBright : fIdx === 1 ? COLOR.yellow : COLOR.cyan
    ctx.fillStyle = stripColor
    ctx.fillRect(x + innerPad, cardY, 6, cardInnerH)

    // Number badge (01, 02, 03)
    ctx.fillStyle = stripColor
    ctx.font = '900 28px Arial'
    ctx.fillText(`0${fIdx + 1}`, x + innerPad + 20, cardY + 42)

    // Vertical divider
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.fillRect(x + innerPad + 66, cardY + 16, 2, cardInnerH - 32)

    const textX = x + innerPad + 84
    const textW = cardW - 104

    if (fact.label) {
      ctx.fillStyle = COLOR.white
      ctx.font = '900 26px Arial'
      ctx.fillText(fact.label, textX, cardY + 40)

      ctx.fillStyle = COLOR.whiteSoft
      ctx.font = '500 24px Arial'
      drawWrappedText(ctx, [fact.value], textX, cardY + 76, textW, '500 24px Arial', COLOR.textMuted, 34, 3)
    } else {
      ctx.fillStyle = COLOR.whiteSoft
      ctx.font = '500 25px Arial'
      drawWrappedText(ctx, [fact.value], textX, cardY + 42, textW, '500 25px Arial', COLOR.whiteSoft, 36, 4)
    }
    ctx.restore()
  })

  // Bottom Micro-Telemetry Readout Strip
  const stripY = y + h - 34
  ctx.font = '700 12px monospace'
  ctx.fillStyle = COLOR.textDim
  ctx.fillText('DIAGNOSTICS: NOMINAL // CALIBRATION: ACTIVE // PACKET ID: 0x88F', x + innerPad, stripY)
}

// ── Bottom Telemetry & Navigation Bar ──────────────────────────────────
function drawFooter(
  ctx: CanvasRenderingContext2D,
  state: ScreenRenderState,
  width: number,
  height: number
) {
  const { data, sectionIndex, slideIndex, progress, isAutoplayOn } = state
  const section = data.sections[sectionIndex]
  const totalSlides = section?.slides.length ?? 1

  const barY = height - FOOTER_H - 16
  const barH = FOOTER_H
  const barW = width - PAD * 2

  drawPanel(ctx, PAD, barY, barW, barH, 'rgba(244, 6, 18, 0.50)', 'rgba(5, 8, 14, 0.96)', 8)

  // 1. Autoplay Status with pulsing indicator
  ctx.save()
  ctx.strokeStyle = isAutoplayOn ? COLOR.redBright : COLOR.textDim
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(PAD + 34, barY + barH / 2, 14, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = isAutoplayOn ? COLOR.redBright : COLOR.textDim
  ctx.beginPath()
  ctx.arc(PAD + 34, barY + barH / 2, 6, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLOR.white
  ctx.font = '900 20px Arial'
  ctx.fillText(isAutoplayOn ? 'AUTOPLAY: ACTIVE' : 'AUTOPLAY: PAUSED', PAD + 60, barY + barH / 2 + 7)
  ctx.restore()

  // 2. Interactive Keyboard Navigation Prompt
  ctx.save()
  ctx.fillStyle = 'rgba(255, 176, 0, 0.15)'
  ctx.strokeStyle = COLOR.yellow
  ctx.lineWidth = 1.5
  ctx.beginPath()
  drawRoundRect(ctx, PAD + 320, barY + 16, 540, barH - 32, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = COLOR.yellow
  ctx.font = '900 19px Arial'
  ctx.fillText('PRESS [ENTER] NEXT SLIDE   •   [← / →] PREV / NEXT', PAD + 340, barY + barH / 2 + 7)
  ctx.restore()

  // 3. Live Progress Track Bar
  const trackX = PAD + 890
  const trackW = 460

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(trackX, barY + barH / 2)
  ctx.lineTo(trackX + trackW, barY + barH / 2)
  ctx.stroke()

  const filledW = trackW * Math.min(1, Math.max(0, progress))
  ctx.strokeStyle = COLOR.redBright
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(trackX, barY + barH / 2)
  ctx.lineTo(trackX + filledW, barY + barH / 2)
  ctx.stroke()

  // Slide dots
  const dotStep = trackW / Math.max(totalSlides - 1, 1)
  for (let s = 0; s < totalSlides; s++) {
    const dotX = trackX + s * dotStep
    const isCurrent = s === slideIndex
    const isPast = s < slideIndex

    ctx.save()
    if (isCurrent) {
      ctx.fillStyle = COLOR.redBright
      ctx.shadowColor = COLOR.redGlow
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(dotX, barY + barH / 2, 8, 0, Math.PI * 2)
      ctx.fill()
    } else if (isPast) {
      ctx.fillStyle = COLOR.white
      ctx.beginPath()
      ctx.arc(dotX, barY + barH / 2, 5, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(dotX, barY + barH / 2, 5, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
  }

  // 4. Slide Counter
  ctx.fillStyle = COLOR.white
  ctx.font = '900 22px Arial'
  ctx.fillText(`${String(slideIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`, trackX + trackW + 20, barY + barH / 2 + 8)

  // 5. Exit Hint
  ctx.fillStyle = COLOR.textMuted
  ctx.font = '800 17px Arial'
  ctx.fillText('[ESC / E] EXIT POV', width - PAD - 180, barY + barH / 2 + 7)
}

// ── Master Render Entry Point ──────────────────────────────────────────
export class ScreenCanvasRenderer {
  public static render(ctx: CanvasRenderingContext2D, state: ScreenRenderState): void {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const { data, sectionIndex, slideIndex } = state
    const section = data.sections[sectionIndex]
    const slide = section?.slides[slideIndex]

    if (!section || !slide) return

    // 1. Clear & Atmospheric Multi-Layer Background
    ctx.clearRect(0, 0, width, height)
    drawAtmosphericBackground(ctx, width, height, data.category)

    // 2. Top Header Bar
    drawHeader(ctx, data, sectionIndex, width)

    // 3. Main Content Two-Column Layout
    const contentTop = HEADER_H + 24
    const contentH = height - contentTop - FOOTER_H - 36
    const totalW = width - PAD * 2

    // Left Hero Narrative: 59% of width
    const heroW = Math.floor(totalW * 0.59)
    // Right Technical Data: 41% of width
    const dataW = totalW - heroW - GAP
    const dataX = PAD + heroW + GAP

    drawHeroColumn(ctx, slide, slideIndex, section.slides.length, data.category, PAD, contentTop, heroW, contentH)
    drawDataColumn(ctx, slide, section, dataX, contentTop, dataW, contentH)

    // 4. Bottom Footer Bar
    drawFooter(ctx, state, width, height)
  }
}
