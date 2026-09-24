export interface InformationSlide {
  id: string
  type: string
  title: string
  subtitle?: string
  duration: number
  content: string[]
  keyFacts: string[]
  table?: {
    columns: string[]
    rows: string[][]
  }
  events?: {
    period: string
    event: string
  }[]
  metrics: string[]
}

export interface InformationSection {
  id: string
  title: string
  overview?: string
  slides: InformationSlide[]
}

export interface InformationScreenData {
  id: string
  name: string
  subject?: string
  defaultDuration: number
  sections: InformationSection[]
}

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return undefined
}

function normalizeText(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeText(item))
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, entry]) => {
        const text = normalizeText(entry).join('; ')
        return text ? `${key}: ${text}` : ''
      })
      .filter(Boolean)
  }

  const text = asString(value)
  if (!text) return []

  return text
    .split(/\n{2,}/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function normalizeMetrics(slide: JsonRecord): string[] {
  const keys = ['verifiedValues', 'stats', 'statistics', 'specifications']
  return keys.flatMap((key) => normalizeText(slide[key])).slice(0, 6)
}

function normalizeTable(slide: JsonRecord): InformationSlide['table'] {
  const columns = Array.isArray(slide.columns) ? slide.columns.map((col) => String(col)) : []
  const rows = Array.isArray(slide.rows)
    ? slide.rows
        .filter(Array.isArray)
        .map((row) => row.map((cell) => String(cell)))
        .slice(0, 8)
    : []

  if (columns.length > 0 && rows.length > 0) return { columns, rows }
  return undefined
}

function normalizeEvents(slide: JsonRecord): InformationSlide['events'] {
  if (!Array.isArray(slide.events)) return undefined

  const events = slide.events
    .filter(isRecord)
    .map((event) => ({
      period: asString(event.period ?? event.year ?? event.date) ?? '',
      event: asString(event.event ?? event.description ?? event.title) ?? '',
    }))
    .filter((event) => event.period || event.event)
    .slice(0, 7)

  return events.length > 0 ? events : undefined
}

function estimateDuration(slide: Pick<InformationSlide, 'duration' | 'content' | 'keyFacts' | 'table' | 'events'>) {
  if (slide.duration > 0) return slide.duration

  const wordCount = [...slide.content, ...slide.keyFacts].join(' ').split(/\s+/).filter(Boolean).length
  const structuredWeight = (slide.table?.rows.length ?? 0) * 700 + (slide.events?.length ?? 0) * 700
  return Math.min(22000, Math.max(8000, 7000 + wordCount * 55 + structuredWeight))
}

function normalizeSlide(rawSlide: unknown, index: number, defaultDuration: number): InformationSlide {
  const slide = isRecord(rawSlide) ? rawSlide : { content: rawSlide }
  const content = normalizeText(slide.content ?? slide.details ?? slide.description ?? slide.overview)
  const keyFacts = normalizeText(slide.keyFacts ?? slide.highlights ?? slide.notes).slice(0, 5)
  const table = normalizeTable(slide)
  const events = normalizeEvents(slide)

  const normalized: InformationSlide = {
    id: asString(slide.id) ?? `slide-${index + 1}`,
    type: (asString(slide.type) ?? (table ? 'table' : events ? 'timeline' : 'text')).toLowerCase(),
    title: asString(slide.title) ?? `Slide ${index + 1}`,
    subtitle: asString(slide.subtitle ?? slide.yearContext),
    duration: Number(slide.duration) || defaultDuration,
    content,
    keyFacts,
    table,
    events,
    metrics: normalizeMetrics(slide),
  }

  normalized.duration = estimateDuration(normalized)
  return normalized
}

export function normalizeInformationScreen(rawData: unknown): InformationScreenData {
  const root = isRecord(rawData) ? rawData : {}
  const screen = isRecord(root.screen) ? root.screen : {}
  const defaultDuration =
    Number((isRecord(screen.autoplay) ? screen.autoplay.defaultDuration : undefined) ?? screen.defaultSlideDuration) ||
    10000
  const rawSections = Array.isArray(screen.sections)
    ? screen.sections
    : Array.isArray(root.sections)
      ? root.sections
      : []

  const sections = rawSections
    .filter(isRecord)
    .map((section, sectionIndex) => {
      const slides = Array.isArray(section.slides) ? section.slides : [section]
      return {
        id: asString(section.id) ?? `section-${sectionIndex + 1}`,
        title: asString(section.title) ?? `Section ${sectionIndex + 1}`,
        overview: asString(section.overview),
        slides: slides.map((slide, slideIndex) => normalizeSlide(slide, slideIndex, defaultDuration)),
      }
    })
    .filter((section) => section.slides.length > 0)

  const fallbackSections: InformationSection[] = [
    {
      id: 'fallback-section',
      title: 'Technical Exhibit',
      overview: 'Detailed exhibit data is loading for this display.',
      slides: [
        {
          id: 'fallback-slide',
          type: 'text',
          title: asString(screen.name) ?? 'Formula 1 Technical Exhibit',
          duration: defaultDuration,
          content: normalizeText(root).slice(0, 6),
          keyFacts: ['Screen data source is connected, but no section list was found.'],
          metrics: [],
        },
      ],
    },
  ]

  return {
    id: asString(screen.id) ?? 'unknown-screen',
    name: asString(screen.name) ?? asString(screen.title) ?? 'THE INSIDE FORMULA 1',
    subject: asString(screen.subject ?? screen.purpose ?? screen.contentPurpose),
    defaultDuration,
    sections: sections.length > 0 ? sections : fallbackSections,
  }
}
