'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { f1AIService } from '@/lib/ai/f1AIService'
import { ttsService } from '@/lib/ai/ttsService'
import { EXHIBITION_CARS_KNOWLEDGE } from '@/lib/ai/f1KnowledgeBase'
import { AIMessage } from '@/lib/ai/types'


// image for the logo 
import formula1Logo from '../../public/images/Short_Banner_Imges/formula_logo_1.png';

interface AITerminalModalProps {
  isOpen: boolean
  currentCar?: string | null
  isObservationMode: boolean
  onToggleObservationMode: (active: boolean) => void
  onClose: () => void
}

export default function AITerminalModal({
  isOpen,
  currentCar,
  isObservationMode,
  onToggleObservationMode,
  onClose,
}: AITerminalModalProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to the Formula 1 Exhibition AI Terminal. I can answer technical questions, explain historical regulations, analyze car designs, and provide deep insights on the displayed 1991 Senna MP4/6 and 2017–2021 championship machines.\n\nHow can I assist your technical inquiry today?',
      timestamp: Date.now(),
      source: 'knowledge_base',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 150)
    } else {
      ttsService.stop()
      setIsSpeaking(false)
    }
  }, [isOpen])

  // Current car details
  const carInfo = currentCar ? EXHIBITION_CARS_KNOWLEDGE[currentCar] : null

  // Send query
  const handleSend = useCallback(
    async (textToSend?: string) => {
      const q = (textToSend ?? input).trim()
      if (!q || isLoading) return

      const userMsg: AIMessage = {
        id: `user-${Date.now()}`,
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
        const response = await f1AIService.ask(
          q,
          {
            mode: 'exhibition',
            location: 'Exhibition Hall',
            currentCar: currentCar ?? undefined,
            observationMode: isObservationMode,
          },
          history
        )

        const assistantMsg: AIMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          timestamp: Date.now(),
          source: response.source,
          sources: response.sources,
        }

        setMessages((prev) => [...prev, assistantMsg])

        // Automatically speak if Observation Mode is on
        if (isObservationMode) {
          setIsSpeaking(true)
          ttsService.speak(response.reply, {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          })
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'An error occurred while contacting the AI terminal. Please ask again.',
            timestamp: Date.now(),
            source: 'knowledge_base',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, messages, currentCar, isObservationMode]
  )

  // Voice Speech Recognition
  const toggleVoiceInput = useCallback(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript
        if (speechResult) {
          setInput(speechResult)
          void handleSend(speechResult)
        }
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)

      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }, [isListening, handleSend])

  // Speak / stop audio
  const handleToggleAudio = (text: string) => {
    if (isSpeaking) {
      ttsService.stop()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      ttsService.speak(text, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      })
    }
  }

  // Prevent keyboard events from reaching player controller while typing in modal!
  const handleKeyIsolation = (e: React.KeyboardEvent) => {
    e.stopPropagation()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none"
        onKeyDown={handleKeyIsolation}
        onKeyUp={handleKeyIsolation}
        onKeyPress={handleKeyIsolation}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative flex flex-col w-full max-w-4xl h-[90vh] max-h-[820px] rounded-2xl border border-white/20 bg-[#070a0f] shadow-[0_0_50px_rgba(225,6,0,0.3)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-black/60">
            <div className="flex items-center gap-3">
                     <img
              src={formula1Logo.src}
              alt ="Formula One logo"
              className="h-auto w-[4vw] object-cover"
            />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-mono text-sm font-black tracking-wider text-white">
                    AI TERMINAL: EXHIBITION
                  </h2>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                    ONLINE
                  </span>
                </div>
                <p className="font-mono text-[12px] text-white/50 tracking-wider">
                  Ask questions about the displayed cars, regulations, and F1 history.
                </p>
              </div>
            </div>

            {/* Observation Mode Toggle & Close */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleObservationMode(!isObservationMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  isObservationMode
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
                title="When enabled, walking near cars automatically plays audio tour commentary"
              >
                <span className={`h-2 w-2 rounded-full ${isObservationMode ? 'bg-emerald-400 animate-ping' : 'bg-white/40'}`} />
                OBSERVATION MODE: {isObservationMode ? 'ACTIVE' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-[#e10600] hover:text-white hover:border-[#e10600] transition-colors"
                title="Close Terminal (ESC)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Current Car Context Banner */}
          {carInfo && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 bg-gradient-to-r from-[#e10600]/20 via-[#0d131f] to-transparent border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#e10600] text-white font-mono text-[10px] font-black uppercase">
                  ACTIVE FOCUS
                </span>
                <span className="font-bold text-white">{carInfo.year} {carInfo.name}</span>
              </div>
              <div className="font-mono text-[10px] text-white/60">
                {carInfo.engine.slice(0, 45)}...
              </div>
            </div>
          )}

          {/* Chat Messages Log */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 font-sans text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-lg leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#e10600] text-white font-medium rounded-tr-none'
                      : 'bg-white/10 border border-white/10 text-white/95 rounded-tl-none backdrop-blur-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Verified Web Search Attribution Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-semibold mr-1">
                        VERIFIED SOURCES:
                      </span>
                      {msg.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-[#e10600] border border-white/15 hover:border-[#e10600] font-mono text-[9px] text-white/90 hover:text-white transition-colors"
                          title={s.title}
                        >
                          <span>🌐 {s.domain}</span>
                          <span className="text-[8px] opacity-70">↗</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Message meta & TTS button for assistant */}
                  {msg.role === 'assistant' && (
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-4 text-[10px] font-mono text-white/60">
                      <span>SOURCE: {msg.source === 'gemini' ? 'Inside F1 AI Model' : msg.source === 'openai' ? 'OPENAI GPT' : '2026 ARCHIVE'}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAudio(msg.content)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 hover:bg-[#e10600] text-white transition-colors"
                      >
                        <span>{isSpeaking ? '⏹ STOP AUDIO' : '🔊 LISTEN VOICE'}</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="mt-1 font-mono text-[9px] text-white/40 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-4 max-w-[50%] rounded-2xl rounded-tl-none bg-white/10 border border-white/10 text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#e10600] animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-[#e10600] animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-[#e10600] animate-bounce [animation-delay:0.4s]" />
                <span className="font-mono text-xs ml-2 text-white/60">CONSULTING F1 TELEMETRY...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-6 py-2 border-t border-white/10 bg-black/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="font-mono text-[10px] text-white/40 uppercase whitespace-nowrap">
              SUGGESTED:
            </span>
            {(carInfo ? carInfo.suggestedQuestions : [
              'Who won the 2019 World Championship?',
              'Why are soft tyres faster?',
              'What is an undercut vs overcut?',
              'How does DRS work?',
              'Tell me about the 2020 Mercedes W11',
            ]).map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(suggestion)}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 font-mono text-[11px] text-white/80 hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleSend()
            }}
            className="flex items-center gap-2 p-4 border-t border-white/10 bg-black/80"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                isListening
                  ? 'border-red-500 bg-red-600 text-white animate-pulse'
                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title={isListening ? 'Listening...' : 'Voice Input (Microphone)'}
            >
              🎤
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an F1 technical, regulatory, or vehicle question..."
              className="flex-1 h-11 px-4 rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/40 font-mono text-xs focus:outline-none focus:border-[#e10600] focus:ring-1 focus:ring-[#e10600]"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-11 px-6 rounded-xl bg-[#e10600] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#c20500] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              TRANSMIT
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
