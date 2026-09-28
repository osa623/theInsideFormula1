export type AIMode = 'exhibition' | 'carnival' | 'observation'

export interface AIContext {
  mode: AIMode
  location: string
  currentLocation?: string
  currentSection?: string | null
  activeTrigger?: string | null
  currentCar?: string | null
  section?: string | null
  triggerId?: string | null
  observationMode?: boolean
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  audioText?: string
  source?: 'gemini' | 'openai' | 'knowledge_base' | 'domain_guard'
}

export interface AIChatRequest {
  prompt: string
  context?: AIContext
  history?: { role: 'user' | 'assistant'; content: string }[]
}

export interface AIChatResponse {
  reply: string
  isF1Related: boolean
  source: 'gemini' | 'openai' | 'knowledge_base' | 'domain_guard'
  contextUsed?: {
    location?: string
    currentCar?: string | null
    section?: string | null
  }
  audioText?: string
}

export interface SmartGuideZone {
  id: string
  triggerName: string
  title: string
  subtitle: string
  eyebrow: string
  description: string
  audioNarration: string
  bullets: string[]
  suggestedQuestions: string[]
  actionPrompt?: string
  accentColor: string
}

export interface ExhibitionCarKnowledge {
  id: string
  year: string
  name: string
  chassis: string
  engine: string
  power: string
  weight: string
  drivers: string
  championshipResult: string
  technicalInnovations: string
  overview: string
  audioGuide: string
  suggestedQuestions: string[]
}
