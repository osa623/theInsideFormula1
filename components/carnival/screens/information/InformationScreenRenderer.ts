import { InformationScreenData, InformationSlide } from './InformationScreenData'

const RED = '#f40612'
const RED_BRIGHT = '#ff1e27'
const WHITE = '#f5f7fb'
const MUTED = '#9eb0c6'
const DIM = '#6b7c91'
const LINE = 'rgba(244, 6, 18, 0.72)'
const CYAN = '#00d2be'
const GOLD = '#ffd166'
const EMERALD = '#00f076'

interface RenderState {
  sectionIndex: number
  slideIndex: number
  progress: number
  data: InformationScreenData
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string) {
  ctx.font = font
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next
    } else {
      lines.push(line)
      line = word
    }
  })

  if (line) lines.push(line)
  return lines
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string[],
  x: number,
  y: number,
  width: number,
  font: string,
  color = WHITE,
  lineHeight = 34,
  maxLines = 8
) {
  ctx.fillStyle = color
  let cursor = y
  let drawn = 0

  for (const paragraph of text) {
    const lines = fitText(ctx, paragraph, width, font)
    for (const line of lines) {
      if (drawn >= maxLines) return cursor
      ctx.font = font
      ctx.fillText(line, x, cursor)
      cursor += lineHeight
      drawn += 1
    }
    cursor += 10
  }

  return cursor
}

function drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.strokeStyle = LINE
  ctx.lineWidth = 2
  ctx.fillStyle = 'rgba(3, 5, 8, 0.88)'
  ctx.fillRect(x, y, w, h)
  ctx.strokeRect(x, y, w, h)

  // Specular top-edge glass sheen
  const sheenGrad = ctx.createLinearGradient(x, y, x + w, y)
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.20)')
  sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)')
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.20)')
  ctx.strokeStyle = sheenGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x + 4, y + 1)
  ctx.lineTo(x + w - 4, y + 1)
  ctx.stroke()

  // Red corner bracket accents
  ctx.strokeStyle = RED_BRIGHT
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, y + 18)
  ctx.lineTo(x, y)
  ctx.lineTo(x + 18, y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + w, y + h - 18)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + w - 18, y + h)
  ctx.stroke()
}

function drawTable(ctx: CanvasRenderingContext2D, slide: InformationSlide, x: number, y: number, w: number) {
  if (!slide.table) return
  const colWidth = w / slide.table.columns.length
  ctx.font = '700 18px Arial'
  ctx.fillStyle = RED
  slide.table.columns.forEach((col, index) => ctx.fillText(col.toUpperCase(), x + index * colWidth + 12, y))

  ctx.font = '400 17px Arial'
  slide.table.rows.forEach((row, rowIndex) => {
    const rowY = y + 34 + rowIndex * 36

    // Alternating gradient rows
    const rowGrad = ctx.createLinearGradient(x, 0, x + w, 0)
    if (rowIndex % 2 === 0) {
      rowGrad.addColorStop(0, 'rgba(255,255,255,0.06)')
      rowGrad.addColorStop(1, 'rgba(255,255,255,0.02)')
    } else {
      rowGrad.addColorStop(0, 'rgba(244, 6, 18, 0.07)')
      rowGrad.addColorStop(1, 'rgba(255,255,255,0.03)')
    }
    ctx.fillStyle = rowGrad
    ctx.fillRect(x, rowY - 26, w, 34)

    ctx.fillStyle = WHITE
    row.forEach((cell, cellIndex) => {
      const clipped = cell.length > 50 ? `${cell.slice(0, 47)}...` : cell
      ctx.fillText(clipped, x + cellIndex * colWidth + 12, rowY)
    })
  })
}

function drawTimeline(ctx: CanvasRenderingContext2D, slide: InformationSlide, x: number, y: number, w: number) {
  if (!slide.events) return
  const step = w / Math.max(slide.events.length, 1)

  // Main horizontal timeline spine
  ctx.strokeStyle = LINE
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, y + 36)
  ctx.lineTo(x + w, y + 36)
  ctx.stroke()

  slide.events.forEach((event, index) => {
    const cx = x + step * index + step * 0.5

    // Node glow ring
    ctx.save()
    ctx.strokeStyle = 'rgba(244, 6, 18, 0.30)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, y + 36, 14, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    // Solid node
    ctx.fillStyle = RED
    ctx.beginPath()
    ctx.arc(cx, y + 36, 9, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = '800 18px Arial'
    ctx.fillStyle = GOLD
    ctx.textAlign = 'center'
    ctx.fillText(event.period, cx, y)
    ctx.textAlign = 'left'
    drawTextBlock(ctx, [event.event], cx - step * 0.38, y + 72, step * 0.76, '400 15px Arial', MUTED, 20, 5)
  })
}

// ── Multi-Layer Atmospheric Background ─────────────────────────────────
function drawAtmosphericBackground(ctx: CanvasRenderingContext2D, width: number, height: number, screenName: string) {
  // 1. Base deep gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height)
  bgGrad.addColorStop(0, '#030508')
  bgGrad.addColorStop(0.5, '#080c14')
  bgGrad.addColorStop(1, '#0f0407')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 2. Carbon fiber weave texture
  ctx.save()
  const gridStep = 14
  for (let gx = 0; gx < width; gx += gridStep) {
    ctx.strokeStyle = (gx / gridStep) % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.30)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(gx, 0)
    ctx.lineTo(gx, height)
    ctx.stroke()
  }
  for (let gy = 0; gy < height; gy += gridStep) {
    ctx.strokeStyle = (gy / gridStep) % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.30)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, gy)
    ctx.lineTo(width, gy)
    ctx.stroke()
  }
  ctx.restore()

  // 3. Diagonal engineering coordinate grid
  ctx.save()
  ctx.strokeStyle = 'rgba(244, 6, 18, 0.03)'
  ctx.lineWidth = 1
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 110, 0)
    ctx.lineTo(i * 110 + 300, height)
    ctx.stroke()
  }
  ctx.restore()

  // 4. Category-specific atmospheric glow
  let glowColor = 'rgba(244, 6, 18, 0.05)'
  const lowName = screenName.toLowerCase()
  if (lowName.includes('tyre')) glowColor = 'rgba(255, 176, 0, 0.04)'
  else if (lowName.includes('chassis')) glowColor = 'rgba(0, 210, 190, 0.04)'
  else if (lowName.includes('track') || lowName.includes('circuit')) glowColor = 'rgba(0, 240, 118, 0.04)'

  const radGlow = ctx.createRadialGradient(width * 0.45, height * 0.45, 80, width * 0.45, height * 0.45, 700)
  radGlow.addColorStop(0, glowColor)
  radGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = radGlow
  ctx.fillRect(0, 0, width, height)

  // 5. OLED micro-scanlines
  ctx.save()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.lineWidth = 1
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.restore()
}

// ── Domain-Specific Watermark Schematic ────────────────────────────────
function drawDomainWatermark(ctx: CanvasRenderingContext2D, screenName: string, x: number, y: number) {
  ctx.save()
  ctx.lineWidth = 1.5
  const lowName = screenName.toLowerCase()

  if (lowName.includes('tyre')) {
    // Faint tyre cross-section
    const cx = x + 680, cy = y + 360, r = 65
    ctx.strokeStyle = 'rgba(255, 176, 0, 0.12)'
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2)
    ctx.stroke()
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 7) {
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8))
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      ctx.stroke()
    }
    ctx.font = '700 10px monospace'
    ctx.fillStyle = 'rgba(255, 176, 0, 0.25)'
    ctx.fillText('THERMAL: 105°C CORE', cx - 50, cy + r + 18)
  } else if (lowName.includes('chassis')) {
    // Monocoque outline
    const cx = x + 640, cy = y + 360
    ctx.strokeStyle = 'rgba(0, 210, 190, 0.14)'
    ctx.beginPath()
    ctx.moveTo(cx, cy + 30)
    ctx.lineTo(cx + 60, cy)
    ctx.lineTo(cx + 130, cy + 8)
    ctx.lineTo(cx + 145, cy + 45)
    ctx.lineTo(cx, cy + 45)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + 68, cy + 8, 18, Math.PI, Math.PI * 2)
    ctx.stroke()
    ctx.font = '700 10px monospace'
    ctx.fillStyle = 'rgba(0, 210, 190, 0.25)'
    ctx.fillText('HALO: 120 kN LOAD', cx, cy + 62)
  } else if (lowName.includes('track') || lowName.includes('circuit')) {
    // Abstract circuit loop
    const cx = x + 640, cy = y + 350
    ctx.strokeStyle = 'rgba(0, 240, 118, 0.14)'
    ctx.beginPath()
    ctx.moveTo(cx, cy + 22)
    ctx.bezierCurveTo(cx + 15, cy - 15, cx + 70, cy - 22, cx + 105, cy - 8)
    ctx.bezierCurveTo(cx + 140, cy + 8, cx + 135, cy + 38, cx + 90, cy + 45)
    ctx.bezierCurveTo(cx + 50, cy + 52, cx - 8, cy + 45, cx, cy + 22)
    ctx.stroke()
    ctx.font = '700 10px monospace'
    ctx.fillStyle = 'rgba(0, 240, 118, 0.25)'
    ctx.fillText('SPEED TRACE: 342 KM/H', cx, cy + 66)
  } else {
    // Formula tier ladder
    const cx = x + 640, cy = y + 350
    ctx.strokeStyle = 'rgba(244, 6, 18, 0.15)'
    ctx.strokeRect(cx, cy + 32, 30, 18)
    ctx.strokeRect(cx + 38, cy + 22, 30, 28)
    ctx.strokeRect(cx + 76, cy + 12, 30, 38)
    ctx.strokeRect(cx + 114, cy, 34, 50)
    ctx.font = '700 10px monospace'
    ctx.fillStyle = 'rgba(244, 6, 18, 0.25)'
    ctx.fillText('FIA PATHWAY: F4 » F1', cx, cy + 66)
  }

  ctx.restore()
}

export class InformationScreenRenderer {
  public static render(ctx: CanvasRenderingContext2D, state: RenderState): void {
    const { data, sectionIndex, slideIndex, progress } = state
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const section = data.sections[sectionIndex]
    const slide = section.slides[slideIndex]
    const nextSection = data.sections[(sectionIndex + 1) % data.sections.length]

    ctx.clearRect(0, 0, width, height)

    // ── Layer 0: Atmospheric Background ──
    drawAtmosphericBackground(ctx, width, height, data.name)

    // ── Layer 1: Main Content Frame ──
    ctx.fillStyle = 'rgba(3, 5, 8, 0.60)'
    ctx.fillRect(28, 28, width - 56, height - 56)
    ctx.strokeStyle = 'rgba(244, 6, 18, 0.65)'
    ctx.lineWidth = 2.5
    ctx.strokeRect(28, 28, width - 56, height - 56)

    // Precision reticle corner brackets
    ctx.strokeStyle = RED_BRIGHT
    ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(28, 48); ctx.lineTo(28, 28); ctx.lineTo(48, 28); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(width - 48, 28); ctx.lineTo(width - 28, 28); ctx.lineTo(width - 28, 48); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(28, height - 48); ctx.lineTo(28, height - 28); ctx.lineTo(48, height - 28); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(width - 48, height - 28); ctx.lineTo(width - 28, height - 28); ctx.lineTo(width - 28, height - 48); ctx.stroke()

    // Coordinate labels
    ctx.font = '700 10px monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.30)'
    ctx.fillText('FIA TECH REG // 2026', 34, 40)
    ctx.fillText(`[${width}×${height}] CALIBRATED`, width - 180, 40)

    // ── Layer 2: Header ──
    // Diagonal tech stripes
    ctx.strokeStyle = 'rgba(244, 6, 18, 0.22)'
    ctx.lineWidth = 2
    for (let i = 0; i < 12; i++) {
      ctx.beginPath()
      ctx.moveTo(40 + i * 170, 92)
      ctx.lineTo(118 + i * 170, 34)
      ctx.stroke()
    }

    // F1 brand block
    ctx.font = '800 22px Arial'
    ctx.fillStyle = WHITE
    ctx.fillText('THE INSIDE', 64, 72)
    ctx.fillStyle = RED
    ctx.font = '900 48px Arial'
    ctx.fillText('F1', 66, 132)

    // Screen title
    ctx.fillStyle = WHITE
    ctx.font = '900 36px Arial'
    ctx.fillText(data.name.replace(/THE INSIDE FORMULA 1\s*[—-]\s*/i, '').toUpperCase(), 248, 76)
    ctx.font = '600 15px Arial'
    ctx.fillStyle = MUTED
    ctx.fillText((data.subject ?? 'FORMULA 1 TECHNICAL EXHIBITION').toUpperCase().slice(0, 120), 252, 110)

    // Live telemetry badge
    ctx.save()
    ctx.fillStyle = 'rgba(0, 240, 118, 0.10)'
    ctx.strokeStyle = EMERALD
    ctx.lineWidth = 1
    ctx.fillRect(248, 118, 160, 26)
    ctx.strokeRect(248, 118, 160, 26)
    ctx.fillStyle = EMERALD
    ctx.beginPath()
    ctx.arc(260, 131, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = '800 11px monospace'
    ctx.fillStyle = WHITE
    ctx.fillText('LIVE TELEMETRY', 272, 135)
    ctx.restore()

    // Header divider line
    ctx.strokeStyle = LINE
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(36, 156)
    ctx.lineTo(width - 38, 156)
    ctx.stroke()

    // ── Layer 3: Left Navigation Panel ──
    const navX = 38
    const navY = 188
    const navW = 290
    const visibleSections = Math.min(data.sections.length, 12)
    const itemH = Math.min(48, Math.floor((height - 280) / visibleSections))
    data.sections.slice(0, visibleSections).forEach((item, index) => {
      const y = navY + index * itemH
      if (index === sectionIndex) {
        // Active section highlight with gradient
        const activeGrad = ctx.createLinearGradient(navX, 0, navX + navW, 0)
        activeGrad.addColorStop(0, RED)
        activeGrad.addColorStop(1, 'rgba(244, 6, 18, 0.60)')
        ctx.fillStyle = activeGrad
        ctx.fillRect(navX, y, navW, itemH - 8)
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.10)'
      ctx.beginPath()
      ctx.moveTo(navX, y + itemH - 8)
      ctx.lineTo(navX + navW, y + itemH - 8)
      ctx.stroke()
      ctx.fillStyle = index === sectionIndex ? WHITE : '#b8c4d6'
      ctx.font = '700 14px Arial'
      ctx.fillText(String(index + 1).padStart(2, '0'), navX + 18, y + 34)
      ctx.font = '800 12px Arial'
      ctx.fillText(item.title.toUpperCase().slice(0, 31), navX + 72, y + 34)
    })

    // ── Layer 4: Main Content Panel ──
    drawPanel(ctx, 360, 188, 800, height - 292)

    // Domain watermark behind text
    drawDomainWatermark(ctx, data.name, 0, 0)

    // Slide counter badge
    ctx.save()
    ctx.fillStyle = 'rgba(244, 6, 18, 0.20)'
    ctx.strokeStyle = RED_BRIGHT
    ctx.lineWidth = 1.5
    ctx.fillRect(400, 210, 120, 32)
    ctx.strokeRect(400, 210, 120, 32)
    ctx.fillStyle = WHITE
    ctx.font = '900 22px Arial'
    ctx.fillText(`${String(sectionIndex + 1).padStart(2, '0')} / ${String(data.sections.length).padStart(2, '0')}`, 410, 236)
    ctx.restore()

    // Red accent block
    ctx.fillStyle = RED
    ctx.fillRect(534, 216, 22, 10)

    // Slide title
    ctx.fillStyle = WHITE
    ctx.font = '900 34px Arial'
    drawTextBlock(ctx, [slide.title.toUpperCase()], 400, 280, 700, '900 34px Arial', WHITE, 42, 3)

    // Subtitle tag
    if (slide.subtitle) {
      ctx.font = '700 16px Arial'
      ctx.fillStyle = CYAN
      ctx.fillText(slide.subtitle.toUpperCase().slice(0, 82), 402, 396)
    }

    // Main content text
    drawTextBlock(ctx, slide.content, 402, slide.subtitle ? 428 : 402, 690, '400 19px Arial', WHITE, 28, 16)

    // ── Layer 5: Right Data Column ──
    const sideX = 1190
    const sideTopH = Math.floor((height - 312) * 0.54)
    drawPanel(ctx, sideX, 188, width - sideX - 38, sideTopH)

    // Data column header
    ctx.font = '900 22px Arial'
    ctx.fillStyle = WHITE
    const dataTitle = slide.type === 'table' ? 'TECHNICAL DATA' : slide.type === 'timeline' ? 'TIMELINE' : 'KEY SPECIFICATIONS'
    ctx.fillText(dataTitle, sideX + 28, 232)

    // Gradient red accent line
    const accentGrad = ctx.createLinearGradient(sideX + 28, 0, width - 76, 0)
    accentGrad.addColorStop(0, RED_BRIGHT)
    accentGrad.addColorStop(1, GOLD)
    ctx.fillStyle = accentGrad
    ctx.fillRect(sideX + 28, 248, width - sideX - 96, 4)

    // Data content rendering
    if (slide.table) {
      drawTable(ctx, slide, sideX + 28, 302, width - sideX - 96)
    } else if (slide.events) {
      drawTimeline(ctx, slide, sideX + 34, 318, width - sideX - 108)
    } else {
      const facts = [...slide.keyFacts, ...slide.metrics].slice(0, 6)
      facts.forEach((fact, index) => {
        const factY = 296 + index * 62

        // Severity color strip
        const stripColor = index === 0 ? RED_BRIGHT : index === 1 ? GOLD : index === 2 ? CYAN : DIM
        ctx.fillStyle = stripColor
        ctx.fillRect(sideX + 28, factY - 20, 4, 50)

        // Number badge
        ctx.strokeStyle = RED
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(sideX + 52, factY - 4, 14, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = stripColor
        ctx.font = '900 12px Arial'
        ctx.fillText(String(index + 1).padStart(2, '0'), sideX + 44, factY)

        drawTextBlock(ctx, [fact], sideX + 82, factY, width - sideX - 146, '400 17px Arial', WHITE, 23, 3)
      })
    }

    // ── Layer 6: Section Overview Panel ──
    drawPanel(ctx, sideX, height - 372, width - sideX - 38, 268)
    ctx.font = '900 21px Arial'
    ctx.fillStyle = WHITE
    ctx.fillText('SECTION OVERVIEW', sideX + 28, height - 322)

    ctx.fillStyle = RED_BRIGHT
    ctx.fillRect(sideX + 28, height - 308, 120, 3)

    drawTextBlock(ctx, [section.overview ?? section.title], sideX + 28, height - 272, width - sideX - 96, '400 18px Arial', MUTED, 25, 7)

    // Attribution line
    ctx.font = '700 11px monospace'
    ctx.fillStyle = GOLD
    ctx.fillText('SOURCE: FIA 2026 TECHNICAL REGULATIONS', sideX + 28, height - 118)

    // ── Layer 7: Enhanced Footer ──
    const footerY = height - 76
    ctx.save()

    // Footer background panel
    ctx.fillStyle = 'rgba(3, 5, 10, 0.92)'
    ctx.strokeStyle = LINE
    ctx.lineWidth = 2
    ctx.fillRect(38, footerY - 40, width - 76, 64)
    ctx.strokeRect(38, footerY - 40, width - 76, 64)

    // F1 triple-stripe emblem
    ctx.fillStyle = RED_BRIGHT
    ctx.beginPath()
    ctx.moveTo(54, footerY - 26); ctx.lineTo(58, footerY - 26); ctx.lineTo(54, footerY + 6); ctx.lineTo(50, footerY + 6); ctx.closePath(); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(62, footerY - 26); ctx.lineTo(66, footerY - 26); ctx.lineTo(62, footerY + 6); ctx.lineTo(58, footerY + 6); ctx.closePath(); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(70, footerY - 26); ctx.lineTo(74, footerY - 26); ctx.lineTo(70, footerY + 6); ctx.lineTo(66, footerY + 6); ctx.closePath(); ctx.fill()

    // Autoplay button
    ctx.fillStyle = WHITE
    ctx.font = '800 14px Arial'
    ctx.fillText('AUTOPLAY', 92, footerY)
    ctx.fillStyle = RED
    ctx.fillRect(190, footerY - 22, 70, 32)
    ctx.fillStyle = WHITE
    ctx.fillText('ON', 210, footerY)

    // Section info
    ctx.fillStyle = MUTED
    ctx.font = '700 13px Arial'
    ctx.fillText(`SECTION ${sectionIndex + 1} / ${data.sections.length}`, 404, footerY - 12)
    ctx.fillStyle = WHITE
    ctx.fillText(section.title.toUpperCase().slice(0, 42), 404, footerY + 12)

    // Progress track bar
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(690, footerY - 8, 520, 6)

    // Filled progress with gradient
    const progressGrad = ctx.createLinearGradient(690, 0, 690 + 520 * progress, 0)
    progressGrad.addColorStop(0, RED)
    progressGrad.addColorStop(1, RED_BRIGHT)
    ctx.fillStyle = progressGrad
    ctx.fillRect(690, footerY - 8, 520 * progress, 6)

    // Slide counter
    ctx.fillStyle = MUTED
    ctx.font = '700 13px Arial'
    ctx.fillText(`${slideIndex + 1} / ${section.slides.length}`, 1264, footerY)

    // Next section preview
    ctx.fillStyle = WHITE
    ctx.fillText(`NEXT: ${nextSection.title.toUpperCase().slice(0, 38)}`, width - 460, footerY)

    ctx.restore()
  }
}
