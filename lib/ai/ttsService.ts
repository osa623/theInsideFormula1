/**
 * Modular Text-to-Speech (TTS) Service for F1 Exhibition & Carnival Smart Guide.
 * Provides clean queueing, non-overlapping playback, instant cancellation,
 * and graceful fallback for unsupported browsers.
 */

export interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
  voiceURI?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (err: any) => void
}

class TTSService {
  private isAvailable: boolean = false
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private lastSpokenText: string = ''
  private lastSpokenTime: number = 0

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isAvailable = true
    }
  }

  public isSupported(): boolean {
    return this.isAvailable
  }

  public isSpeaking(): boolean {
    if (!this.isAvailable || typeof window === 'undefined') return false
    return window.speechSynthesis.speaking
  }

  /**
   * Speaks the provided text cleanly. Automatically stops previous speech to prevent overlapping audio.
   */
  public speak(text: string, options: TTSOptions = {}): void {
    if (!this.isAvailable || typeof window === 'undefined') {
      console.warn('[TTSService] SpeechSynthesis is not supported on this platform.')
      options.onEnd?.()
      return
    }

    const cleanText = text
      .replace(/[*#_`]/g, '') // remove markdown symbols
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) return

    // Prevent immediate rapid duplicate triggers of the exact same audio
    const now = Date.now()
    if (this.lastSpokenText === cleanText && now - this.lastSpokenTime < 4000) {
      return
    }

    this.stop()

    this.lastSpokenText = cleanText
    this.lastSpokenTime = now

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = options.rate ?? 1.02
      utterance.pitch = options.pitch ?? 1.0
      utterance.volume = options.volume ?? 0.95

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (v) =>
          (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('George') || v.name.includes('David'))) ||
          v.lang === 'en-GB' ||
          v.lang === 'en-US'
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        options.onStart?.()
      }

      utterance.onend = () => {
        this.currentUtterance = null
        options.onEnd?.()
      }

      utterance.onerror = (e) => {
        this.currentUtterance = null
        options.onError?.(e)
      }

      this.currentUtterance = utterance
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('[TTSService] Playback error: ', err)
      options.onError?.(err)
    }
  }

  /**
   * Immediately stops any currently playing audio.
   */
  public stop(): void {
    if (!this.isAvailable || typeof window === 'undefined') return
    try {
      window.speechSynthesis.cancel()
      this.currentUtterance = null
    } catch {
      // Ignore cleanup error
    }
  }
}

export const ttsService = new TTSService()
