'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

interface QuestionDefinition {
  id: number
  question: string
  options: string[]
  correctAnswer: string
}

const RAW_QUESTIONS: QuestionDefinition[] = [
  {
    id: 1,
    question: 'What is the first thing a driver should do before attempting to drive fast?',
    options: [
      'Accelerate immediately',
      "Understand the car's controls",
      'Brake as late as possible',
      'Find the apex',
    ],
    correctAnswer: "Understand the car's controls",
  },
  {
    id: 2,
    question: "Which control is primarily used to increase the car's acceleration?",
    options: ['Brake', 'Steering wheel', 'Throttle', 'Gear indicator'],
    correctAnswer: 'Throttle',
  },
  {
    id: 3,
    question: 'What is the main purpose of heavy braking before a corner?',
    options: [
      'Increase speed',
      'Reduce speed and prepare for the corner',
      'Increase downforce',
      'Make the car turn automatically',
    ],
    correctAnswer: 'Reduce speed and prepare for the corner',
  },
  {
    id: 4,
    question: 'What is trail braking?',
    options: [
      'Accelerating while turning',
      'Keeping maximum throttle through a corner',
      'Progressively releasing brake pressure as steering input increases',
      'Braking only after the corner',
    ],
    correctAnswer: 'Progressively releasing brake pressure as steering input increases',
  },
  {
    id: 5,
    question: 'What is the main purpose of maintaining the correct speed through a corner?',
    options: [
      'Always drive at maximum speed',
      'Keep the car balanced and preserve momentum',
      'Stop the car completely',
      'Avoid using the racing line',
    ],
    correctAnswer: 'Keep the car balanced and preserve momentum',
  },
  {
    id: 6,
    question: 'What is the basic racing-line principle taught in the training?',
    options: [
      'Inside → Inside → Inside',
      'Outside → Inside → Outside',
      'Outside → Outside → Inside',
      'Inside → Outside → Inside',
    ],
    correctAnswer: 'Outside → Inside → Outside',
  },
  {
    id: 7,
    question: 'What is the apex of a corner?',
    options: [
      'The fastest section of a straight',
      'The point where the car leaves the circuit',
      'The optimal point toward the inside of the corner',
      'The braking marker',
    ],
    correctAnswer: 'The optimal point toward the inside of the corner',
  },
  {
    id: 8,
    question: 'Why is corner-exit speed important?',
    options: [
      'It helps carry speed onto the following straight',
      'It eliminates the need for braking',
      'It makes the car stop faster',
      'It means the apex is unnecessary',
    ],
    correctAnswer: 'It helps carry speed onto the following straight',
  },
  {
    id: 9,
    question: 'What should a driver generally do as the car exits a corner?',
    options: [
      'Increase steering angle and brake harder',
      'Unwind the steering and progressively increase throttle',
      'Immediately turn toward the inside',
      'Stop accelerating',
    ],
    correctAnswer: 'Unwind the steering and progressively increase throttle',
  },
  {
    id: 10,
    question: 'What is the correct overall driving sequence taught by the six boards?',
    options: [
      'Accelerate → Brake → Turn → Apex → Accelerate',
      'Brake → Turn → Apex → Accelerate → Repeat',
      'Apex → Brake → Reverse → Accelerate',
      'Turn → Accelerate → Brake → Stop',
    ],
    correctAnswer: 'Brake → Turn → Apex → Accelerate → Repeat',
  },
]

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function generateExam() {
  const shuffledQuestions = shuffleArray(RAW_QUESTIONS)
  return shuffledQuestions.map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }))
}

interface RacingExamProps {
  isOpen: boolean
  onClose: () => void
  onPass: () => void
}

type ExamViewState = 'landing' | 'loading' | 'exam' | 'result'

export default function RacingExam({ isOpen, onClose, onPass }: RacingExamProps) {
  const [viewState, setViewState] = useState<ExamViewState>('landing')
  const [loadingStep, setLoadingStep] = useState(0)
  const [questions, setQuestions] = useState<QuestionDefinition[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [score, setScore] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const initExamData = useCallback(() => {
    setQuestions(generateExam())
    setCurrentIndex(0)
    setUserAnswers({})
    setScore(0)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setViewState('landing')
      setIsMinimized(false)
      setIsFullscreen(false)
      initExamData()
    }
  }, [isOpen, initExamData])

  const startExamFlow = () => {
    initExamData()
    setViewState('loading')
    setLoadingStep(0)
    setTimeout(() => setLoadingStep(1), 700)
    setTimeout(() => setLoadingStep(2), 1400)
    setTimeout(() => setViewState('exam'), 2100)
  }

  if (!isOpen) return null

  const currentQ = questions[currentIndex]
  const selectedAnswer = userAnswers[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const hasSelected = !!selectedAnswer
  const isPassed = score >= 8
  const optionLetters = ['A', 'B', 'C', 'D']

  const handleSelectOption = (option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: option,
    }))
  }

  const handleNext = () => {
    if (!hasSelected) return
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      let correctCount = 0
      questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswer) {
          correctCount++
        }
      })
      setScore(correctCount)
      setViewState('result')
      if (correctCount >= 8) {
        onPass()
      }
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900/90 px-4 py-2 text-white shadow-2xl backdrop-blur-xl">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#ef233c]" />
        <span className="font-mono text-xs font-bold text-neutral-300">Exam Portal (Minimized)</span>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="rounded bg-neutral-800 px-2 py-1 text-[11px] font-bold hover:bg-neutral-700"
        >
          RESTORE
        </button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 select-none backdrop-blur-md md:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`relative flex flex-col overflow-hidden rounded-xl border-2 border-neutral-700 bg-[#0d0f12] text-white shadow-[0_0_90px_rgba(239,35,60,0.18)] transition-all ${
            isFullscreen ? 'h-full w-full max-w-none rounded-none' : 'h-[92vh] max-h-[840px] w-full max-w-5xl'
          }`}
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
        >
          {/* Browser Window Titlebar */}
          <div className="flex items-center justify-between border-b border-neutral-800 bg-[#161a20] px-4 py-2.5">
            <div className="flex items-center gap-3">
              {/* Window Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-3.5 w-3.5 rounded-full bg-[#ef233c] transition-opacity hover:opacity-80"
                  title="Close"
                />
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="h-3.5 w-3.5 rounded-full bg-[#f4a261] transition-opacity hover:opacity-80"
                  title="Minimize"
                />
                <button
                  type="button"
                  onClick={() => setIsFullscreen((prev) => !prev)}
                  className="h-3.5 w-3.5 rounded-full bg-[#2a9d8f] transition-opacity hover:opacity-80"
                  title="Maximize"
                />
              </div>

              {/* Browser Tab */}
              <div className="ml-2 flex items-center gap-2 rounded-t-md bg-[#0d0f12] px-4 py-1.5 font-mono text-xs text-neutral-300 border-t-2 border-[#ef233c]">
                <span>🏎️</span>
                <span className="font-semibold tracking-wide">Driving Academy Exam Portal</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="rounded px-2.5 py-1 font-mono text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                {isFullscreen ? 'EXIT FULLSCREEN' : 'FULL SCREEN'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded bg-neutral-800 px-3 py-1 font-mono text-xs font-bold text-neutral-300 hover:bg-[#ef233c] hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Browser Navigation / URL Bar */}
          <div className="flex items-center gap-3 border-b border-neutral-800 bg-[#12151b] px-4 py-2 text-neutral-400">
            <div className="flex items-center gap-1.5 text-xs">
              <button type="button" className="rounded p-1 hover:bg-neutral-800">←</button>
              <button type="button" className="rounded p-1 hover:bg-neutral-800">→</button>
              <button type="button" onClick={startExamFlow} className="rounded p-1 hover:bg-neutral-800">↻</button>
            </div>

            {/* Address Bar */}
            <div className="flex flex-1 items-center gap-2 rounded-md border border-neutral-800 bg-[#0d0f12] px-3 py-1 font-mono text-xs text-neutral-300">
              <span className="text-green-400">🔒</span>
              <span className="text-neutral-500">https://</span>
              <span className="font-semibold text-white">www.racingacademy-exam.local</span>
              <span className="text-neutral-500">/exam/session</span>
            </div>

            <div className="font-mono text-[11px] text-neutral-500">SECURE LOCAL CONNECTION</div>
          </div>

          {/* Webpage Content */}
          <div className="flex flex-1 flex-col overflow-y-auto bg-[#0d0f12]">
            {/* VIEW: LANDING */}
            {viewState === 'landing' && (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ef233c]/40 bg-[#ef233c]/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#ef233c]">
                  Official Certification Portal
                </div>
                <h1 className="text-3xl font-black uppercase tracking-wider text-white md:text-5xl">
                  DRIVING ACADEMY
                </h1>
                <h2 className="mt-2 text-xl font-bold uppercase tracking-tight text-neutral-400 md:text-2xl">
                  FINAL DRIVER KNOWLEDGE ASSESSMENT
                </h2>

                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-6 py-4">
                    <div className="font-mono text-xs text-neutral-400">QUESTIONS</div>
                    <div className="mt-1 font-mono text-2xl font-black text-white">10</div>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-6 py-4">
                    <div className="font-mono text-xs text-neutral-400">PASS CRITERIA</div>
                    <div className="mt-1 font-mono text-2xl font-black text-[#ef233c]">8 / 10</div>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-6 py-4">
                    <div className="font-mono text-xs text-neutral-400">ACCESS</div>
                    <div className="mt-1 font-mono text-2xl font-black text-green-400">REAL RACING TRACK</div>
                  </div>
                </div>

                <p className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-400">
                  Welcome to the final theoretical evaluation. Passing this examination with 8 or more correct answers will immediately unlock the gate to the real Formula racing track.
                </p>

                <button
                  type="button"
                  onClick={startExamFlow}
                  className="mt-8 rounded-md bg-[#ef233c] px-10 py-4 font-mono text-sm font-black uppercase tracking-[0.25em] text-white shadow-[0_0_30px_rgba(239,35,60,0.4)] transition-all hover:bg-[#d91d34] hover:scale-105"
                >
                  ENTER EXAM →
                </button>
              </div>
            )}

            {/* VIEW: LOADING */}
            {viewState === 'loading' && (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-neutral-800 border-t-[#ef233c]" />
                <h3 className="mt-6 font-mono text-lg font-bold text-white">
                  {loadingStep === 0 && 'Loading Examination Portal...'}
                  {loadingStep === 1 && 'Connecting to examination system...'}
                  {loadingStep >= 2 && 'Preparing examination questions...'}
                </h3>
                <div className="mt-4 h-1.5 w-64 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full bg-[#ef233c] transition-all duration-700 ease-out"
                    style={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* VIEW: EXAM */}
            {viewState === 'exam' && currentQ && (
              <div className="flex flex-1 flex-col justify-between p-6 md:p-10">
                {/* Header info */}
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#ef233c]">
                        ASSESSMENT IN PROGRESS
                      </span>
                      <div className="mt-1 text-sm font-semibold text-neutral-400">
                        Formula Academy Official Test
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs text-neutral-500">QUESTION</span>
                      <div className="font-mono text-2xl font-black text-white">
                        {currentIndex + 1} <span className="text-sm text-neutral-500">/ 10</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full bg-[#ef233c] transition-all duration-300 ease-out"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>

                  {/* Question */}
                  <div className="mt-8">
                    <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                      Question {currentIndex + 1} of 10
                    </div>
                    <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                      {currentQ.question}
                    </h2>

                    {/* Options */}
                    <div className="mt-6 grid gap-3">
                      {currentQ.options.map((option, idx) => {
                        const isChosen = selectedAnswer === option
                        const letter = optionLetters[idx] || '•'
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleSelectOption(option)}
                            className={`group flex w-full items-center gap-4 rounded-lg border p-4 text-left font-sans text-sm md:text-base transition-all ${
                              isChosen
                                ? 'border-[#ef233c] bg-[#ef233c]/15 text-white shadow-[0_0_20px_rgba(239,35,60,0.25)]'
                                : 'border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/80 hover:text-white'
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded font-mono text-xs font-bold transition-colors ${
                                isChosen
                                  ? 'bg-[#ef233c] text-white'
                                  : 'bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 group-hover:text-white'
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="flex-1 font-medium">{option}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-5">
                  <div className="font-mono text-xs text-neutral-500">
                    {hasSelected ? 'Option selected. Click Next to proceed.' : 'Please select one answer.'}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasSelected}
                    className="flex items-center gap-2 rounded-md bg-[#ef233c] px-8 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-opacity hover:bg-[#d91d34] disabled:opacity-40"
                  >
                    {isLastQuestion ? 'SUBMIT EXAM' : 'NEXT →'}
                  </button>
                </div>
              </div>
            )}

            {/* VIEW: RESULT */}
            {viewState === 'result' && (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.4em] text-neutral-400">
                  EXAMINATION RESULTS
                </div>

                {isPassed ? (
                  <>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-green-400 md:text-5xl">
                      EXAM PASSED
                    </h2>
                    <div className="mt-4 font-mono text-2xl text-neutral-200">
                      SCORE: <span className="font-black text-white">{score}</span> / 10
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 rounded bg-green-500/10 px-4 py-2 font-mono text-xs font-bold text-green-400 border border-green-500/30">
                      STATUS: CERTIFIED DRIVER (PASS CRITERIA ≥ 8/10 MET)
                    </div>
                    <p className="mt-4 max-w-lg text-sm text-neutral-400 leading-relaxed">
                      CONGRATULATIONS! You have successfully completed the Driving Academy knowledge assessment. The barrier to the real Formula racing track has been unlocked!
                    </p>
                    <div className="mt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md bg-[#ef233c] px-8 py-3.5 font-mono text-xs font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,35,60,0.4)] transition-all hover:bg-[#d91d34]"
                      >
                        PROCEED TO TRACK →
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-[#ef233c] md:text-5xl">
                      EXAM FAILED
                    </h2>
                    <div className="mt-4 font-mono text-2xl text-neutral-200">
                      SCORE: <span className="font-black text-white">{score}</span> / 10
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 rounded bg-red-500/10 px-4 py-2 font-mono text-xs font-bold text-[#ef233c] border border-red-500/30">
                      STATUS: NOT QUALIFIED (8 / 10 IS REQUIRED TO PASS)
                    </div>
                    <p className="mt-4 max-w-lg text-sm text-neutral-400 leading-relaxed">
                      Review the Driving Academy training boards and try again. The track entrance remains locked until you achieve a passing score of 8 or higher.
                    </p>
                    <div className="mt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={startExamFlow}
                        className="rounded-md bg-[#ef233c] px-8 py-3.5 font-mono text-xs font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,35,60,0.4)] transition-all hover:bg-[#d91d34]"
                      >
                        RETAKE EXAM
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-neutral-700 bg-neutral-900 px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      >
                        EXIT
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Browser Status Bar */}
          <div className="flex items-center justify-between border-t border-neutral-800 bg-[#161a20] px-5 py-2.5 font-mono text-[10px] text-neutral-500">
            <div>PASS REQUIREMENT: ≥ 8 / 10</div>
            <div>STATUS: {viewState === 'result' ? (isPassed ? 'QUALIFIED' : 'FAILED') : 'ACTIVE'}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
