/**
 * Type definitions for the 3D Exhibition Information Screen Engine.
 * Supports normalization from read-only data files: tyres.json, chassis.json, formula.json, tracks.json.
 */

export type SlideType =
  | 'text'
  | 'technical'
  | 'specification'
  | 'factcard'
  | 'process'
  | 'timeline'
  | 'comparison'
  | 'table'
  | 'statistics'
  | 'glossary'
  | 'category'
  | 'circuit'
  | 'history'
  | 'material'
  | 'component'
  | 'safety'
  | 'testing'

export interface KeyFactItem {
  label?: string
  value: string
}

export interface TableData {
  columns: string[]
  rows: string[][]
}

export interface TimelineEvent {
  period: string
  event: string
  detail?: string
}

export interface ComparisonItem {
  label: string
  spec?: string
  color?: string
  description?: string
  metrics?: { key: string; value: string }[]
}

export interface NormalizedSlide {
  id: string
  type: SlideType
  title: string
  subtitle?: string
  yearContext?: string
  duration: number // milliseconds
  content: string[]
  keyFacts: KeyFactItem[]
  table?: TableData
  events?: TimelineEvent[]
  comparison?: ComparisonItem[]
  highlightQuote?: string
  metrics?: { label: string; value: string }[]
  sourceUrls?: string[]
}

export interface NormalizedSection {
  id: string
  title: string
  overview?: string
  slides: NormalizedSlide[]
}

export interface NormalizedScreenData {
  id: string
  name: string
  category: string
  subject?: string
  defaultDuration: number
  sections: NormalizedSection[]
}

export interface ScreenRenderState {
  data: NormalizedScreenData
  sectionIndex: number
  slideIndex: number
  progress: number // 0.0 to 1.0
  isAutoplayOn: boolean
  isPaused: boolean
}

export interface ScreenResolution {
  width: number
  height: number
}
