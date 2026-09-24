'use client'

import { Html } from '@react-three/drei'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { f1DataService, QuizQuestion } from '@/lib/f1/f1DataService'
import { ScreenAnchor } from '../types'
import { EXHIBITION_SCREEN_CONFIG } from './ScreenConfig'
import { useScreenVisibility } from './OcclusionManager'
import './screenStyles.css'

interface ComputerQuizControllerProps {
  anchor: ScreenAnchor
  occluders?: THREE.Object3D[]
  isInteracting: boolean
  onExit: () => void
  onPassExam?: () => void
}

export default function ComputerQuizController({
  anchor,
  occluders,
  isInteracting,
  onExit,
  onPassExam,
}: ComputerQuizControllerProps) {
  const config = EXHIBITION_SCREEN_CONFIG.computer
  const isVisible = useScreenVisibility(anchor, occluders, config.maxViewDistance, isInteracting)

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Initialize or reset quiz
  const restartQuiz = useCallback(() => {
    const q = f1DataService.getQuizQuestions(10)
    setQuestions(q)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
    setIsCompleted(false)
  }, [])

  useEffect(() => {
    restartQuiz()
  }, [restartQuiz])

  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null
  }, [questions, currentIndex])

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return
    setSelectedAnswer(idx)
  }

  const handleSubmitOrNext = () => {
    if (selectedAnswer === null) return

    if (!isAnswerSubmitted) {
      setIsAnswerSubmitted(true)
      if (selectedAnswer === currentQuestion?.correctIndex) {
        setScore((prev) => prev + 1)
      }
    } else {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1)
        setSelectedAnswer(null)
        setIsAnswerSubmitted(false)
      } else {
        setIsCompleted(true)
        const finalScore = score + (selectedAnswer === currentQuestion?.correctIndex ? 0 : 0)
        if (finalScore >= 8) {
          onPassExam?.()
        }
      }
    }
  }

  const passed = score >= 8

  return (
    <group
      position={[anchor.position.x, anchor.position.y, anchor.position.z]}
      rotation={[0, 43 * (Math.PI / 180), 0]}
    >
      <Html
        transform
        distanceFactor={config.distanceFactor}
        position={[0, 0, 0.02]}
        rotation={[0, 0, 0]}
        pointerEvents={isInteracting ? 'auto' : 'none'}
        className="select-none"
        style={{
          width: `${config.resolution.width}px`,
          height: `${config.resolution.height}px`,
          display: isVisible ? 'block' : 'none',
        }}
      >
        <div className="f1-screen-root w-full h-full flex flex-col justify-between p-6">
          {/* Top Telemetry Header */}
          <div className="f1-header-bar px-4 py-2 flex items-center justify-between border-b border-[#222832]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[#e10600] animate-pulse inline-block" />
              <span className="text-xs font-bold tracking-widest text-[#00d2be]">
                FIA TELEMETRY KIOSK // STATION K-01
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#758292]">
              <span>SYSTEM: ONLINE</span>
              <span>PROTOCOL: FIA-2026</span>
              {isInteracting && (
                <button
                  onClick={onExit}
                  className="px-2.5 py-0.5 border border-[#3b4554] hover:border-[#e10600] hover:text-[#e10600] text-[#9ca3af] transition-colors text-[10px] font-bold"
                >
                  ESC // EXIT
                </button>
              )}
            </div>
          </div>

          {/* Main Body */}
          {!isInteracting ? (
            /* Standby State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="f1-telemetry-badge text-[#e10600]">
                STANDBY MODE // READY FOR OPERATOR
              </div>
              <h1 className="text-2xl font-black tracking-wider uppercase text-white">
                F1 ACADEMY CERTIFICATION
              </h1>
              <p className="text-xs text-[#8a99a8] max-w-md tracking-wide leading-relaxed">
                High-fidelity examination station for telemetry analysis, powertrain thermal
                management, aerodynamics regulations, and championship rules.
              </p>
              <div
                className="mt-4 px-6 py-2 border border-[#00d2be] text-[#00d2be] text-xs font-bold tracking-widest"
                style={{ animation: 'f1Pulse 2s infinite ease-in-out' }}
              >
                PRESS [E] TO COMMENCE EVALUATION
              </div>
            </div>
          ) : isCompleted ? (
            /* Quiz Results Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div
                className={`text-xs font-bold tracking-widest px-3 py-1 border ${
                  passed
                    ? 'border-[#00d2be] text-[#00d2be] bg-[rgba(0,210,190,0.1)]'
                    : 'border-[#e10600] text-[#e10600] bg-[rgba(225,6,0,0.1)]'
                }`}
              >
                {passed ? 'CERTIFICATION SUCCESSFUL' : 'CERTIFICATION FAILED'}
              </div>

              <div className="text-4xl font-black tracking-tight text-white">
                SCORE: {score} / 10
              </div>

              <p className="text-xs text-[#8a99a8] max-w-md">
                {passed
                  ? 'Congratulations! You have demonstrated high-level technical motorsport competence. The Formula 1 car entrance barrier has been permanently unlocked.'
                  : 'You did not achieve the required 80% passing threshold. Please review technical telemetry procedures and retake the exam.'}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <button onClick={restartQuiz} className="f1-button">
                  RETAKE QUIZ
                </button>
                <button onClick={onExit} className="f1-button bg-[#232932]">
                  EXIT KIOSK
                </button>
              </div>
            </div>
          ) : (
            /* Active Quiz Question */
            <div className="flex-1 flex flex-col justify-between py-3 px-2">
              {/* Question Meta */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#758292] pb-2">
                  <span className="text-[#00d2be] font-bold tracking-widest">
                    QUESTION {String(currentIndex + 1).padStart(2, '0')} / 10
                  </span>
                  <span className="border border-[#262c36] px-2 py-0.5 text-[#9aa7b5]">
                    {currentQuestion?.category}
                  </span>
                </div>

                <h2 className="text-sm font-semibold tracking-wide text-white leading-snug pt-1">
                  {currentQuestion?.question}
                </h2>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 my-2">
                {currentQuestion?.options.map((opt, oIdx) => {
                  let statusClass = ''
                  if (isAnswerSubmitted) {
                    if (oIdx === currentQuestion.correctIndex) statusClass = 'correct'
                    else if (oIdx === selectedAnswer) statusClass = 'incorrect'
                  } else if (oIdx === selectedAnswer) {
                    statusClass = 'selected'
                  }

                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`f1-radio-option text-xs py-2 px-3 ${statusClass}`}
                    >
                      <span className="w-4 h-4 rounded-full border border-[#445063] flex items-center justify-center text-[9px] font-bold text-[#a0afbf]">
                        {['A', 'B', 'C', 'D'][oIdx]}
                      </span>
                      <span className="flex-1 text-[#e1e7ee]">{opt}</span>
                    </div>
                  )
                })}
              </div>

              {/* Feedback and Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1d232c]">
                <div className="text-[11px] text-[#8ea0b3] max-w-sm">
                  {isAnswerSubmitted && currentQuestion?.explanation}
                </div>

                <button
                  onClick={handleSubmitOrNext}
                  disabled={selectedAnswer === null}
                  className="f1-button disabled:opacity-30 disabled:pointer-events-none"
                >
                  {!isAnswerSubmitted
                    ? 'CONFIRM ANSWER'
                    : currentIndex + 1 < questions.length
                    ? 'NEXT QUESTION →'
                    : 'FINISH EXAM'}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Telemetry Ticker */}
          <div className="flex items-center justify-between text-[10px] text-[#525f70] border-t border-[#181d24] pt-2">
            <span>TERMINAL ID: 2026-F1-COMPUTER</span>
            <span>HARDWARE: SGI MOTORSPORT TELEMETRY KIOSK</span>
            <span>STATUS: ACTIVE ONLINE</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
