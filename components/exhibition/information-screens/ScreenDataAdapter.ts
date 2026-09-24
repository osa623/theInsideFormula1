import {
  NormalizedScreenData,
  NormalizedSection,
  NormalizedSlide,
  KeyFactItem,
  TableData,
  TimelineEvent,
  ComparisonItem,
  SlideType,
} from './screenTypes'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function normalizeLines(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeLines(item))
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([k, v]) => {
        const text = normalizeLines(v).join('; ')
        return text ? `${k}: ${text}` : ''
      })
      .filter(Boolean)
  }
  const str = asString(value)
  if (!str) return []
  return str
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function parseKeyFact(item: unknown): KeyFactItem | null {
  if (isRecord(item)) {
    const label = asString(item.label ?? item.key ?? item.title ?? item.name)
    const value = asString(item.value ?? item.detail ?? item.content ?? item.description)
    if (value) return { label: label || undefined, value }
    if (label) return { value: label }
    return null
  }
  const str = asString(item)
  if (!str) return null
  const colonIdx = str.indexOf(':')
  if (colonIdx > 0 && colonIdx < 35) {
    return {
      label: str.slice(0, colonIdx).trim(),
      value: str.slice(colonIdx + 1).trim(),
    }
  }
  return { value: str }
}

function normalizeKeyFacts(slide: JsonRecord): KeyFactItem[] {
  const sources = [
    slide.keyFacts,
    slide.verifiedValues,
    slide.criteria,
    slide.items,
    slide.examples,
    slide.records,
    slide.specifications,
    slide.stats,
    slide.statistics,
  ]

  const results: KeyFactItem[] = []
  for (const source of sources) {
    if (!source) continue
    if (Array.isArray(source)) {
      for (const item of source) {
        const fact = parseKeyFact(item)
        if (fact && fact.value) results.push(fact)
      }
    } else if (isRecord(source)) {
      for (const [key, val] of Object.entries(source)) {
        results.push({ label: key, value: asString(val) })
      }
    }
    if (results.length >= 6) break
  }
  return results.slice(0, 6)
}

function normalizeTable(slide: JsonRecord): TableData | undefined {
  if (Array.isArray(slide.columns) && Array.isArray(slide.rows) && slide.columns.length > 0) {
    const columns = slide.columns.map((c) => asString(c)).filter(Boolean)
    const rows = (slide.rows as unknown[][])
      .filter(Array.isArray)
      .map((row) => row.map((cell) => asString(cell)))
      .slice(0, 8)
    if (columns.length > 0 && rows.length > 0) {
      return { columns, rows }
    }
  }
  if (isRecord(slide.table)) {
    const tbl = slide.table
    if (Array.isArray(tbl.columns) && Array.isArray(tbl.rows)) {
      return normalizeTable(tbl)
    }
  }
  return undefined
}

function normalizeEvents(slide: JsonRecord): TimelineEvent[] | undefined {
  const rawEvents = slide.events ?? slide.changes ?? slide.history
  if (!Array.isArray(rawEvents) || rawEvents.length === 0) return undefined

  const list: TimelineEvent[] = []
  for (const item of rawEvents) {
    if (isRecord(item)) {
      const period = asString(item.period ?? item.year ?? item.date ?? item.time)
      const event = asString(item.event ?? item.title ?? item.description ?? item.name)
      const detail = asString(item.detail ?? item.content)
      if (period || event) {
        list.push({ period, event, detail: detail || undefined })
      }
    } else if (typeof item === 'string') {
      list.push({ period: '', event: item })
    }
    if (list.length >= 7) break
  }
  return list.length > 0 ? list : undefined
}

function normalizeComparison(slide: JsonRecord): ComparisonItem[] | undefined {
  const raw = slide.circuits ?? slide.comparison ?? slide.categories ?? slide.compounds
  if (!Array.isArray(raw) || raw.length === 0) return undefined

  const items: ComparisonItem[] = []
  for (const item of raw) {
    if (isRecord(item)) {
      const label = asString(item.name ?? item.label ?? item.circuit ?? item.title)
      const spec = asString(item.spec ?? item.length ?? item.category ?? item.type)
      const color = asString(item.color)
      const description = asString(item.description ?? item.notes ?? item.detail)
      if (label) {
        items.push({ label, spec: spec || undefined, color: color || undefined, description: description || undefined })
      }
    }
    if (items.length >= 4) break
  }
  return items.length > 0 ? items : undefined
}

function calculateDuration(slide: {
  duration?: number
  content: string[]
  keyFacts: KeyFactItem[]
  table?: TableData
  events?: TimelineEvent[]
  comparison?: ComparisonItem[]
  type: string
}): number {
  if (slide.duration && slide.duration >= 6000) {
    return slide.duration
  }

  const wordCount = [
    ...slide.content,
    ...slide.keyFacts.map((k) => `${k.label || ''} ${k.value}`),
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length

  let duration = 9000 // base: 9s
  if (wordCount > 60) duration += 4000
  else if (wordCount > 30) duration += 2000

  if (slide.table) duration += 4000
  if (slide.events && slide.events.length > 3) duration += 3500
  if (slide.comparison) duration += 3000

  // Cap between 8s and 20s per prompt guidelines
  return Math.min(22000, Math.max(8000, duration))
}

export class ScreenDataAdapter {
  public static normalize(rawData: unknown): NormalizedScreenData {
    const root = isRecord(rawData) ? rawData : {}
    const screen = isRecord(root.screen) ? root.screen : {}

    const id = asString(screen.id ?? root.id) || 'Information_Screen'
    const name = asString(screen.name ?? root.name) || 'THE INSIDE FORMULA 1'
    const subject = asString(screen.subject ?? root.subject ?? screen.purpose ?? root.purpose)

    let category = 'FORMULA 1'
    const lowerId = id.toLowerCase()
    if (lowerId.includes('tyre')) category = 'TYRES'
    else if (lowerId.includes('chassis')) category = 'CHASSIS'
    else if (lowerId.includes('formula')) category = 'CATEGORIES'
    else if (lowerId.includes('track')) category = 'CIRCUITS'

    const defaultDuration =
      Number(
        (isRecord(screen.autoplay) ? screen.autoplay.defaultDuration : undefined) ??
          screen.defaultSlideDuration ??
          10000
      ) || 10000

    const rawSections = Array.isArray(screen.sections)
      ? screen.sections
      : Array.isArray(root.sections)
        ? root.sections
        : []

    const sections: NormalizedSection[] = rawSections
      .filter(isRecord)
      .map((sec, secIdx) => {
        const secId = asString(sec.id) || `section-${secIdx + 1}`
        const title = asString(sec.title ?? sec.name) || `Section ${secIdx + 1}`
        const overview = asString(sec.overview ?? sec.description)

        const rawSlides = Array.isArray(sec.slides) ? sec.slides : []
        const slides: NormalizedSlide[] = rawSlides.map((sl, slIdx) => {
          const slideObj: JsonRecord = isRecord(sl) ? sl : { content: sl }
          const slideId = asString(slideObj.id) || `${secId}-${slIdx + 1}`
          const slideType = (asString(slideObj.type) || 'text').toLowerCase() as SlideType
          const slideTitle = asString(slideObj.title ?? slideObj.name) || `Slide ${slIdx + 1}`
          const subtitle = asString(slideObj.subtitle ?? slideObj.yearContext)
          const yearContext = asString(slideObj.yearContext)

          const content = normalizeLines(
            slideObj.content ??
              slideObj.details ??
              slideObj.description ??
              slideObj.overview ??
              slideObj.definitions ??
              slideObj.terms
          )

          const keyFacts = normalizeKeyFacts(slideObj)
          const table = normalizeTable(slideObj)
          const events = normalizeEvents(slideObj)
          const comparison = normalizeComparison(slideObj)
          const highlightQuote = asString(slideObj.caveat ?? slideObj.quote ?? slideObj.highlight)

          const rawDuration = Number(slideObj.duration)
          const duration = calculateDuration({
            duration: rawDuration > 0 ? rawDuration : undefined,
            content,
            keyFacts,
            table,
            events,
            comparison,
            type: slideType,
          })

          const sourceUrls = Array.isArray(slideObj.sourceUrls)
            ? slideObj.sourceUrls.map((u: unknown) => asString(u)).filter(Boolean)
            : undefined

          return {
            id: slideId,
            type: slideType,
            title: slideTitle,
            subtitle: subtitle || undefined,
            yearContext: yearContext || undefined,
            duration,
            content: content.length > 0 ? content : [title],
            keyFacts,
            table,
            events,
            comparison,
            highlightQuote: highlightQuote || undefined,
            sourceUrls,
          }
        })

        return {
          id: secId,
          title,
          overview: overview || undefined,
          slides: slides.length > 0 ? slides : [
            {
              id: `${secId}-default`,
              type: 'text',
              title,
              duration: defaultDuration,
              content: [overview || title],
              keyFacts: [],
            },
          ],
        }
      })

    return {
      id,
      name,
      category,
      subject: subject || undefined,
      defaultDuration,
      sections,
    }
  }
}
