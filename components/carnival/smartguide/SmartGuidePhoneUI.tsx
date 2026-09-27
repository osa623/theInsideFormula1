'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SmartGuideZone, AIMessage } from '@/lib/ai/types'
import { f1AIService } from '@/lib/ai/f1AIService'
import { ttsService } from '@/lib/ai/ttsService'

interface SmartGuidePhoneUIProps {
  isOpen: boolean
  activeZone: SmartGuideZone | null
  onClose: () => void
}

export default function SmartGuidePhoneUI({
  isOpen,
  activeZone,
  onClose,
}: SmartGuidePhoneUIProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'chat'>('guide')
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content:
        'Hi! I am your Carnival Smart Guide. How can I assist you in this zone?',
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

  // Scroll chat
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight
    }
  }, [messages, isLoading, activeTab])

  // Reset tab on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab('guide')
    } else {
      ttsService.stop()
      setIsSpeaking(false)
    }
  }, [isOpen])

  // TTS Narration for Zone
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
      })
    }
  }, [activeZone, isSpeaking])

  // Send AI Question
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
            location: 'F1 Carnival',
            section: activeZone?.id ?? 'general',
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
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'The Smart Guide service is momentarily busy. Please try asking again.',
            timestamp: Date.now(),
            source: 'knowledge_base',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, messages, activeZone]
  )

  // Voice recognition
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

  // Key isolation
  const handleKeyIsolation = (e: React.KeyboardEvent) => {
    e.stopPropagation()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 120, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 120, scale: 0.9 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        onKeyDown={handleKeyIsolation}
        onKeyUp={handleKeyIsolation}
        onKeyPress={handleKeyIsolation}
        className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-32px)] h-[640px] max-h-[85vh] rounded-[38px] p-3.5 bg-gradient-to-b from-[#242c38] to-[#0c1017] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(225,6,0,0.25)] border border-white/20 select-none flex flex-col"
      >
        {/* Inner Phone Screen */}
        <div className="relative flex-1 rounded-[28px] bg-[#080c14] border border-white/10 flex flex-col overflow-hidden text-white">
          {/* Top Notch & Status Bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[11px] font-mono text-white/70 border-b border-white/5">
            <span>19:45</span>
            {/* Dynamic Island / Notch */}
            <div className="h-4 w-20 rounded-full bg-black/90 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span>🔋 98%</span>
            </div>
          </div>

          {/* App Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e10600] text-[10px] font-black">
                F1
              </span>
              <div>
                <div className="font-mono text-xs font-black text-white">CARNIVAL GUIDE</div>
                <div className="text-[9px] font-mono text-emerald-400">AI SYSTEM READY</div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-[#e10600] hover:text-white transition-colors"
              title="Lower Phone [P / ESC]"
            >
              ✕
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 text-xs">
            {activeTab === 'guide' ? (
              <div className="space-y-4">
                {/* Zone Card */}
                <div
                  className="rounded-xl p-3.5 border bg-white/5 space-y-2"
                  style={{ borderColor: activeZone?.accentColor || '#e10600' }}
                >
                  <div
                    className="font-mono text-[9px] font-black uppercase tracking-wider"
                    style={{ color: activeZone?.accentColor || '#e10600' }}
                  >
                    {activeZone?.eyebrow || 'CARNIVAL ZONE'}
                  </div>
                  <h3 className="font-sans text-base font-black text-white leading-tight">
                    {activeZone?.title || 'Formula 1 Carnival Grounds'}
                  </h3>
                  <p className="font-sans text-[11px] text-white/60 leading-relaxed">
                    {activeZone?.subtitle || 'Interactive racing, technical zones, and championship exhibition.'}
                  </p>
                </div>

                {/* Audio Guide Narration Button */}
                <button
                  type="button"
                  onClick={handleToggleZoneNarration}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-lg ${
                    isSpeaking
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-white/10 hover:bg-[#e10600] text-white border border-white/15'
                  }`}
                >
                  <span>{isSpeaking ? '⏹ STOP VOCAL GUIDE' : '🔊 LISTEN VOCAL GUIDE'}</span>
                </button>

                {/* Key Bullet Highlights */}
                {activeZone?.bullets && activeZone.bullets.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                      TECHNICAL DOSSIER HIGHLIGHTS
                    </div>
                    <ul className="space-y-1.5">
                      {activeZone.bullets.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-white/80">
                          <span className="text-[#e10600] font-bold mt-0.5">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Prompt */}
                {activeZone?.actionPrompt && (
                  <div className="rounded-lg p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold text-center">
                    {activeZone.actionPrompt}
                  </div>
                )}

                {/* Ask AI shortcut */}
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#e10600] to-[#b80000] text-white font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all"
                >
                  💬 ASK AI ABOUT THIS ZONE
                </button>
              </div>
            ) : (
              /* AI Chat Tab */
              <div className="flex flex-col h-full space-y-3">
                <div ref={chatEndRef} className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl p-3 text-[11px] leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-[#e10600] text-white font-medium rounded-tr-none'
                            : 'bg-white/10 border border-white/10 text-white/95 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.content}</p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white/10 text-[10px] text-white/60 w-fit">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e10600] animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e10600] animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e10600] animate-bounce [animation-delay:0.4s]" />
                      <span className="font-mono ml-1">AI Thinking...</span>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {activeZone?.suggestedQuestions && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {activeZone.suggestedQuestions.slice(0, 3).map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendQuestion(s)}
                        className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-white/70"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void handleSendQuestion()
                  }}
                  className="flex items-center gap-1.5 pt-1 border-t border-white/10"
                >
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`h-9 w-9 flex items-center justify-center rounded-lg border text-xs ${
                      isListening
                        ? 'border-red-500 bg-red-600 text-white animate-pulse'
                        : 'border-white/10 bg-white/5 text-white/70'
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
                    placeholder="Ask an F1 question..."
                    className="flex-1 h-9 px-3 rounded-lg border border-white/15 bg-white/5 text-white font-mono text-[11px] focus:outline-none focus:border-[#e10600]"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="h-9 px-3 rounded-lg bg-[#e10600] text-white font-mono text-[10px] font-bold uppercase hover:bg-[#c20500] disabled:opacity-40"
                  >
                    SEND
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bottom App Navigation Bar */}
          <div className="flex items-center justify-around py-2 border-t border-white/10 bg-black/60 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'guide' ? 'text-[#e10600] font-black' : 'text-white/50 hover:text-white'
              }`}
            >
              <span>🧭</span>
              <span>GUIDE</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'chat' ? 'text-[#e10600] font-black' : 'text-white/50 hover:text-white'
              }`}
            >
              <span>💬</span>
              <span>ASK AI</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex flex-col items-center gap-0.5 text-white/50 hover:text-white"
            >
              <span>▼</span>
              <span>LOWER</span>
            </button>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="flex justify-center pb-1.5 pt-0.5 bg-black/60">
            <div className="h-1 w-28 rounded-full bg-white/30" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
