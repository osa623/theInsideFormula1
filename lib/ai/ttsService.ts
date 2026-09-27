/**
 * Modular Text-to-Speech (TTS) Service for F1 Exhibition & Carnival Smart Guide.
 * Provides clean queueing, non-overlapping playback, instant cancellation,
 * professional museum exhibition narrator voice selection, and audio ducking events.
 */

export interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
  voiceURI?: string
  voiceName?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (err: any) => void
}

export type TTSState = 'idle' | 'speaking' | 'cancelling'

class TTSService {
  private isAvailable: boolean = false
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private lastSpokenText: string = ''
  private lastSpokenTime: number = 0
  private state: TTSState = 'idle'
  private duckingListeners: Set<(isDucking: boolean) => void> = new Set()
  private availableVoices: SpeechSynthesisVoice[] = []

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isAvailable = true
      this.loadVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices()
      }
    }
  }

  private loadVoices() {
    if (!this.isAvailable || typeof window === 'undefined') return
    this.availableVoices = window.speechSynthesis.getVoices()
  }

  public isSupported(): boolean {
    return this.isAvailable
  }

  public isSpeaking(): boolean {
    if (!this.isAvailable || typeof window === 'undefined') return false
    return this.state === 'speaking' || window.speechSynthesis.speaking
  }

  public getState(): TTSState {
    return this.state
  }

  /**
   * Subscribe to audio ducking events for background music synchronization.
   * isDucking = true when TTS begins, false when TTS actually finishes.
   */
  public onDucking(callback: (isDucking: boolean) => void): () => void {
    this.duckingListeners.add(callback)
    return () => {
      this.duckingListeners.delete(callback)
    }
  }

  private notifyDucking(isDucking: boolean) {
    this.duckingListeners.forEach((cb) => {
      try {
        cb(isDucking)
      } catch (err) {
        console.warn('[TTSService] ducking listener error:', err)
      }
    })
  }

  /**
   * Selects a premium exhibition/documentary narrator voice.
   * Priority: British / UK Natural / Neural voices, then Google UK/US, then Apple Daniel/Oliver.
   */
  public selectBestVoice(preferredName?: string): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0) {
      this.loadVoices()
    }
    const voices = this.availableVoices
    if (!voices || voices.length === 0) return null

    if (preferredName) {
      const match = voices.find((v) => v.name.toLowerCase().includes(preferredName.toLowerCase()))
      if (match) return match
    }

    // High-priority museum documentary voices
    const priorityKeywords = [
      'ryan online (natural)', // Edge UK Natural Male (top tier)
      'libby online (natural)', // Edge UK Natural Female
      'sonia online (natural)', // Edge UK Natural
      'george online (natural)',
      'guy online (natural)', // Edge US Natural Male
      'google uk english male', // Chrome UK Male
      'google uk english female',
      'daniel (enhanced)', // macOS/iOS high quality UK narrator
      'oliver',
      'serena',
      'natural',
      'neural',
      'studio',
    ]

    for (const kw of priorityKeywords) {
      const found = voices.find((v) => v.name.toLowerCase().includes(kw) && v.lang.startsWith('en'))
      if (found) return found
    }

    // Fallback: any British English voice
    const enGB = voices.find((v) => v.lang === 'en-GB' || v.lang.startsWith('en-GB'))
    if (enGB) return enGB

    // Fallback: any English voice
    const anyEn = voices.find((v) => v.lang.startsWith('en'))
    return anyEn || voices[0] || null
  }

  /**
   * Phonetic cleaner for motorsport terms so the browser speech engine pronounces
   * technical abbreviations like a human documentary narrator rather than spelling them out clumsily.
   */
  private normalizePhonetics(raw: string): string {
    return raw
      .replace(/[*#_`]/g, '')
      .replace(/\bF1\b/g, 'Formula One')
      .replace(/\bFIA\b/g, 'F-I-A')
      .replace(/\bDRS\b/g, 'D-R-S')
      .replace(/\bERS\b/g, 'E-R-S')
      .replace(/\bMGU-K\b/gi, 'M-G-U-K')
      .replace(/\bMGU-H\b/gi, 'M-G-U-H')
      .replace(/\bkm\/h\b/gi, 'kilometers per hour')
      .replace(/\bkph\b/gi, 'kilometers per hour')
      .replace(/\bBHP\b/g, 'brake horsepower')
      .replace(/\bHP\b/g, 'horsepower')
      .replace(/\bkN\b/g, 'kilonewtons')
      .replace(/\bV6\b/g, 'V-six')
      .replace(/\bV8\b/g, 'V-eight')
      .replace(/\bV10\b/g, 'V-ten')
      .replace(/\bV12\b/g, 'V-twelve')
      .replace(/\bMP4\/6\b/g, 'M-P-four six')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Speaks text using a calm, natural exhibition narrator voice.
   * Automatically ducks background music on start, and restores music on actual completion.
   */
  public speak(text: string, options: TTSOptions = {}): void {
    if (!this.isAvailable || typeof window === 'undefined') {
      options.onEnd?.()
      return
    }

    const cleanText = this.normalizePhonetics(text)

    if (!cleanText) return

    // Prevent immediate rapid duplicate triggers of the exact same audio
    const now = Date.now()
    if (this.lastSpokenText === cleanText && now - this.lastSpokenTime < 4000) {
      return
    }

    this.stop()

    this.lastSpokenText = cleanText
    this.lastSpokenTime = now
    this.state = 'speaking'

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText)
      // Calm, warm, measured exhibition narrator cadence
      utterance.rate = options.rate ?? 0.92
      utterance.pitch = options.pitch ?? 0.95
      utterance.volume = options.volume ?? 0.95

      const voice = this.selectBestVoice(options.voiceName)
      if (voice) {
        utterance.voice = voice
      }

      utterance.onstart = () => {
        this.state = 'speaking'
        this.notifyDucking(true)
        options.onStart?.()
      }

      const handleFinished = () => {
        if (this.state !== 'idle') {
          this.state = 'idle'
          this.currentUtterance = null
          this.notifyDucking(false)
          options.onEnd?.()
        }
      }

      utterance.onend = handleFinished

      utterance.onerror = (e) => {
        console.warn('[TTSService] Speech error:', e)
        if (this.state !== 'idle') {
          this.state = 'idle'
          this.currentUtterance = null
          this.notifyDucking(false)
          options.onError?.(e)
        }
      }

      this.currentUtterance = utterance
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('[TTSService] Playback error: ', err)
      this.state = 'idle'
      this.notifyDucking(false)
      options.onError?.(err)
    }
  }

  /**
   * Immediately stops any currently playing audio and restores background music.
   */
  public stop(): void {
    if (!this.isAvailable || typeof window === 'undefined') return
    try {
      this.state = 'cancelling'
      window.speechSynthesis.cancel()
      this.currentUtterance = null
      this.state = 'idle'
      this.notifyDucking(false)
    } catch {
      this.state = 'idle'
      this.notifyDucking(false)
    }
  }
}

export const ttsService = new TTSService()

