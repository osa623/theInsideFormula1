'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SmartGuideZone, AIMessage } from '@/lib/ai/types'
import { f1AIService } from '@/lib/ai/f1AIService'
import { ttsService } from '@/lib/ai/ttsService'

import formula1Logo from '../../../public/images/Short_Banner_Imges/formula_logo_1.png';

interface SmartGuidePhoneUIProps {
  isOpen: boolean
  activeZone: SmartGuideZone | null
  currentLocation?: string
  currentSection?: string | null
  activeTrigger?: string | null
  onClose: () => void
}

export default function SmartGuidePhoneUI({
  isOpen,
  activeZone,
  currentLocation = 'Main Carnival Path',
  currentSection = null,
  activeTrigger = null,
  onClose,
}: SmartGuidePhoneUIProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'guide'>('home')
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content:
        'Smart Guide pit-wall telemetry linked. Ask any question about your current area, racing regulations, or Formula 1 engineering.',
      timestamp: Date.now(),
      source: 'knowledge_base',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight
    }
  }, [messages, isLoading, activeTab])

  // Stop audio when closing
  useEffect(() => {
    if (!isOpen) {
      ttsService.stop()
      setIsSpeaking(false)
    }
  }, [isOpen])

  // Contextual Quick Actions generated dynamically from CURRENT LIVE LOCATION
  const getContextualQuickActions = useCallback(() => {
    const loc = (currentLocation || '').toLowerCase()
    const sec = (currentSection || '').toLowerCase()

    if (loc.includes('championship')) {
      return [
        'Where am I right now?',
        'F1 Champions (2000–2025)',
        'Tell me about this section',
        'Which drivers won 7 World Championships?',
      ]
    }
    if (loc.includes('exam')) {
      return [
        'Where am I right now?',
        'What should I do here?',
        'Explain the 6 technical study boards',
        'F1 Certification Quiz details',
      ]
    }
    if (loc.includes('gaming')) {
      return [
        'Where am I right now?',
        'How does the 2D racing game work?',
        'What is trail braking in Formula 1?',
        'How can I get the fastest hot lap?',
      ]
    }
    if (loc.includes('second main area')) {
      return [
        'Where am I right now?',
        'What exhibits are in the Second Main Area?',
        'Where is the F1 Champions section?',
        'Where is the F1 exam kiosk?',
      ]
    }
    if (loc.includes('educational')) {
      if (sec === 'tyres') {
        return [
          'Where am I right now?',
          'Why are soft tyres faster than hard tyres?',
          'What is tyre graining and blistering?',
          'How does undercut strategy work?',
        ]
      }
      if (sec === 'chassis') {
        return [
          'Where am I right now?',
          'What is an F1 monocoque made of?',
          'How does the Halo protect F1 drivers?',
          'What crash tests does the FIA mandate?',
        ]
      }
      if (sec === 'tracks') {
        return [
          'Where am I right now?',
          'Why is Monza called the Temple of Speed?',
          'How does circuit altitude affect downforce?',
          'What is track evolution?',
        ]
      }
      if (sec === 'formula' || sec === 'formula-franchise') {
        return [
          'Where am I right now?',
          'How does a driver earn an FIA Superlicense?',
          'What is the difference between F2 and F1?',
          'What are the new 2026 engine regulations?',
        ]
      }
      return [
        'Where am I right now?',
        'Explore Tyres',
        'Explore Chassis',
        'Explore Tracks',
        'Formula Franchise',
      ]
    }
    if (loc.includes('car park')) {
      return [
        'Where am I right now?',
        'Where does the main path lead?',
        'How do I enter the Exhibition Hall?',
        'Tell me about the Educational Zone',
      ]
    }
    if (loc.includes('exhibition hall entrance')) {
      return [
        'Where am I right now?',
        'What cars are inside the Exhibition Hall?',
        'What is the AI Exhibition Terminal?',
        'Press [E] to enter Exhibition Hall',
      ]
    }

    // Default Main Path
    return [
      'Where am I right now?',
      'Where does this path lead?',
      'Tell me about the Educational Zone',
      'Where is the Exhibition Hall?',
    ]
  }, [currentLocation, currentSection])

  // Zone TTS Narration
  const handleToggleZoneNarration = useCallback(() => {
    if (!activeZone) return
    if (isSpeaking) {
      ttsService.stop()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      ttsService.speak(activeZone.audioNarration, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      })
    }
  }, [activeZone, isSpeaking])

  // Send Question with strictly current live location context
  const handleSendQuestion = useCallback(
    async (textToSend?: string) => {
      const q = (textToSend ?? input).trim()
      if (!q || isLoading) return

      const userMsg: AIMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: q,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsLoading(true)

      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      try {
        const res = await f1AIService.ask(
          q,
          {
            mode: 'carnival',
            location: currentLocation,
            currentLocation: currentLocation,
            currentSection: currentSection,
            section: currentSection || activeZone?.id || null,
            activeTrigger: activeTrigger,
          },
          history
        )

        const assistantMsg: AIMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: Date.now(),
          source: res.source,
        }

        setMessages((prev) => [...prev, assistantMsg])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Telemetry link interruption. Please re-send your query.',
            timestamp: Date.now(),
            source: 'knowledge_base',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, messages, currentLocation, currentSection, activeTrigger, activeZone]
  )

  // Voice recognition
  const toggleVoiceInput = useCallback(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is unavailable in this browser. Please use the keyboard.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    try {
      const rec = new SpeechRecognition()
      rec.lang = 'en-US'
      rec.interimResults = false
      rec.maxAlternatives = 1

      rec.onstart = () => setIsListening(true)
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript
        if (text) {
          setInput(text)
          void handleSendQuestion(text)
        }
      }
      rec.onerror = () => setIsListening(false)
      rec.onend = () => setIsListening(false)

      recognitionRef.current = rec
      rec.start()
    } catch {
      setIsListening(false)
    }
  }, [isListening, handleSendQuestion])

  if (!isOpen) return null

  const quickActions = getContextualQuickActions()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 140, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 140, scale: 0.92 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 right-6 z-40 w-[400px] max-w-[calc(100vw-24px)] h-[640px] max-h-[85vh] rounded-[38px] p-3 bg-[#07090e]/95 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.88),0_0_0_1px_rgba(255,255,255,0.12)] select-none flex flex-col pointer-events-auto"
      >
        {/* Device Screen Frame */}
        <div className="relative flex-1 rounded-[28px] bg-[#05070b] border border-white/10 flex flex-col overflow-hidden text-white">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[10px] font-mono text-white/40 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00f076] animate-pulse" />
              <span className="font-semibold text-white/70">TELEMETRY LINKED</span>
            </div>
            {/* Key Hint */}
            <span className="text-[9px] tracking-wider text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              [P] TOGGLE GUIDE
            </span>
          </div>

          {/* App Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10">
            <div className="flex items-center gap-2.5">
             <img
              src={formula1Logo.src}
              alt ="Formula One logo"
              className="h-auto w-[4vw] object-cover"
            />
              <div>
                <div className="font-sans text-xs font-black tracking-wider text-white">
                  SMART GUIDE
                </div>
                <div className="text-[9px] font-mono tracking-widest text-[#00d2be]">
                  THE INSIDE FORMULA 1
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-[#e10600] hover:text-white transition-colors border border-white/10"
              title="Lower Guide [P]"
            >
              ✕
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-3.5 text-xs space-y-3">
            {activeTab === 'home' && (
              <div className="space-y-3">
                {/* ── LIVE LOCATION CARD (Always Current Ground Truth) ── */}
                <div className="rounded-2xl p-4 border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#00d2be]">
                      CURRENT LIVE LOCATION
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-mono text-[#00f076]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00f076] animate-ping" />
                      LIVE
                    </span>
                  </div>

                  <h3 className="font-sans text-xl font-black text-white tracking-tight leading-snug">
                    {currentLocation}
                  </h3>

                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-white/60">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-white/80">
                      {currentSection ? currentSection.toUpperCase() : 'CONCOURSE'}
                    </span>
                    {activeTrigger && (
                      <span className="text-[9px] text-white/40">
                        TRIG: {activeTrigger}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── CONTEXTUAL QUICK ACTIONS ── */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-bold tracking-wider text-white/40 uppercase px-1">
                    Contextual Actions
                  </div>
                  <div className="space-y-1.5">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveTab('chat')
                          void handleSendQuestion(action)
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/5 text-[11px] text-white/85 font-sans transition-all flex items-center justify-between group"
                      >
                        <span>{action}</span>
                        <span className="text-white/30 group-hover:text-[#e10600] font-mono text-xs transition-colors">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── DOSSIER SHORTCUT (If in a rich zone) ── */}
                {activeZone && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="w-full p-3 rounded-xl bg-[#e10600]/15 hover:bg-[#e10600]/25 border border-[#e10600]/40 text-white font-mono text-[11px] font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>🧭</span>
                    <span>VIEW {activeZone.title.toUpperCase()} DOSSIER</span>
                  </button>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              /* ── AUTOMOTIVE TELEMETRY CHAT UI ── */
              <div className="flex flex-col h-full space-y-3">
                {/* Live Context Banner */}
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-mono text-white/50 flex items-center justify-between">
                  <span>SYS // LIVE LOCATION: {currentLocation.toUpperCase()}</span>
                  <span className="text-[#00f076]">SYNCED</span>
                </div>

                {/* Messages stream */}
                <div
                  ref={chatEndRef}
                  className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]"
                >
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="font-mono text-[9px] tracking-wider text-white/40 px-1">
                          {isUser ? 'USER // PILOT' : 'AI // PIT WALL'}
                        </div>
                        <div
                          className={`max-w-[88%] p-3 rounded-2xl text-[11px] leading-relaxed font-sans ${
                            isUser
                              ? 'bg-[#161f2e] text-white border border-white/10 rounded-br-sm'
                              : 'bg-white/[0.05] text-white/90 border border-white/10 rounded-bl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    )
                  })}

                  {isLoading && (
                    <div className="flex flex-col items-start space-y-1">
                      <div className="font-mono text-[9px] tracking-wider text-white/40">
                        AI // PROCESSING
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white/60 text-[11px] flex items-center gap-2 font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00d2be] animate-ping" />
                        Analyzing telemetry & application context...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Box: Keyboard events strictly isolated to input element */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void handleSendQuestion()
                  }}
                  className="flex items-center gap-2 pt-2 border-t border-white/10"
                >
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`h-9 w-9 flex items-center justify-center rounded-xl border text-xs transition-colors ${
                      isListening
                        ? 'border-red-500 bg-red-600 text-white animate-pulse'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                    title="Voice input"
                  >
                    🎤
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    placeholder="Ask an F1 or location question..."
                    className="flex-1 h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-white font-mono text-[11px] focus:outline-none focus:border-[#00d2be] transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="h-9 px-3.5 rounded-xl bg-[#e10600] text-white font-mono text-[10px] font-black uppercase hover:bg-[#c20500] disabled:opacity-30 transition-colors"
                  >
                    SEND
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'guide' && activeZone && (
              /* ── ZONE DOSSIER ── */
              <div className="space-y-3">
                <div
                  className="rounded-2xl p-4 border bg-gradient-to-b from-white/[0.06] to-transparent space-y-2.5"
                  style={{ borderColor: `${activeZone.accentColor}55` }}
                >
                  <div
                    className="font-mono text-[9px] font-black uppercase tracking-widest"
                    style={{ color: activeZone.accentColor }}
                  >
                    {activeZone.eyebrow}
                  </div>
                  <h3 className="font-sans text-lg font-black text-white tracking-tight leading-snug">
                    {activeZone.title}
                  </h3>
                  <p className="font-sans text-[11px] text-white/65 leading-relaxed">
                    {activeZone.subtitle}
                  </p>

                  <button
                    type="button"
                    onClick={handleToggleZoneNarration}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-[10px] font-bold uppercase transition-colors border border-white/10"
                  >
                    <span>{isSpeaking ? '⏹' : '🔊'}</span>
                    <span>{isSpeaking ? 'STOP AUDIO GUIDE' : 'LISTEN TO NARRATOR'}</span>
                  </button>
                </div>

                <div className="rounded-2xl p-3.5 bg-black/30 border border-white/5 space-y-2">
                  <div className="text-[10px] font-mono font-bold tracking-wider text-white/50 uppercase">
                    Engineering Focus
                  </div>
                  <ul className="space-y-2 text-[11px] text-white/75 font-sans">
                    {activeZone.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#e10600] font-mono text-xs">▸</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Bottom App Navigation Bar */}
          <div className="flex items-center justify-around py-2 border-t border-white/10 bg-black/60 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                activeTab === 'home' ? 'text-[#e10600] font-black' : 'text-white/40 hover:text-white'
              }`}
            >
              <span>🏠</span>
              <span>HOME</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                activeTab === 'chat' ? 'text-[#e10600] font-black' : 'text-white/40 hover:text-white'
              }`}
            >
              <span>💬</span>
              <span>ASK AI</span>
            </button>

            {activeZone && (
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  activeTab === 'guide' ? 'text-[#e10600] font-black' : 'text-white/40 hover:text-white'
                }`}
              >
                <span>🧭</span>
                <span>DOSSIER</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex flex-col items-center gap-0.5 text-white/40 hover:text-white transition-colors"
            >
              <span>▼</span>
              <span>LOWER</span>
            </button>
          </div>

          {/* Home Indicator */}
          <div className="flex justify-center pb-1.5 pt-0.5 bg-black/60">
            <div className="h-1 w-24 rounded-full bg-white/20" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
