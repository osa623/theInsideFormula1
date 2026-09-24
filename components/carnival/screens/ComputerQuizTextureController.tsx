'use client'

import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { f1DataService, QuizQuestion } from '@/lib/f1/f1DataService'
import { ScreenAnchor } from '../types'
import { EXHIBITION_SCREEN_CONFIG } from './ScreenConfig'
import { ScreenSurfaceRenderer } from './ScreenSurfaceRenderer'
import { useScreenVisibility } from './OcclusionManager'

interface ComputerQuizTextureControllerProps {
  anchor: ScreenAnchor
  occluders?: THREE.Object3D[]
  isInteracting: boolean
  onExit: () => void
  onPassExam?: () => void
}

function findMesh(object: THREE.Object3D | null): THREE.Mesh | null {
  if (!object) return null
  if (object instanceof THREE.Mesh) return object
  let mesh: THREE.Mesh | null = null
  object.traverse((child) => {
    if (!mesh && child instanceof THREE.Mesh) mesh = child
  })
  return mesh
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string) {
  ctx.font = font
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next
    } else {
      lines.push(line)
      line = word
    }
  })

  if (line) lines.push(line)
  return lines
}

function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: string,
  color: string,
  lineHeight: number,
  maxLines = 8
) {
  ctx.font = font
  ctx.fillStyle = color
  wrapText(ctx, text, maxWidth, font).slice(0, maxLines).forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight)
  })
}

function drawCommand(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  width: number,
  active = true
) {
  ctx.fillStyle = active ? '#e10600' : '#29313c'
  ctx.fillRect(x, y, width, 32)
  ctx.strokeStyle = active ? '#ff3b36' : '#445063'
  ctx.strokeRect(x, y, width, 32)
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 13px Arial'
  ctx.fillText(label, x + 12, y + 21)
}

function renderQuizCanvas(
  ctx: CanvasRenderingContext2D,
  state: {
    questions: QuizQuestion[]
    currentIndex: number
    selectedAnswer: number | null
    isAnswerSubmitted: boolean
    score: number
    isCompleted: boolean
    isInteracting: boolean
  }
) {
  const width = ctx.canvas.width
  const height = ctx.canvas.height
  const currentQuestion = state.questions[state.currentIndex] || null
  const passed = state.score >= 8

  ctx.clearRect(0, 0, width, height)
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#05070a')
  gradient.addColorStop(0.58, '#10141b')
  gradient.addColorStop(1, '#180203')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(225,6,0,0.45)'
  ctx.lineWidth = 2
  ctx.strokeRect(18, 18, width - 36, height - 36)
  ctx.fillStyle = '#e10600'
  ctx.fillRect(32, 58, width - 64, 3)

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 20px Arial'
  ctx.fillText('F1 ACADEMY CERTIFICATION', 34, 43)
  ctx.fillStyle = '#9aa7b5'
  ctx.font = '700 10px Arial'
  ctx.fillText('TELEMETRY KIOSK // STATION K-01 // WEBGL DISPLAY', 34, 76)

  if (!state.isInteracting) {
    ctx.fillStyle = '#e10600'
    ctx.font = '800 14px Arial'
    ctx.fillText('STANDBY MODE // READY FOR OPERATOR', 210, 160)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 25px Arial'
    ctx.fillText('PRESS E TO COMMENCE', 188, 210)
    drawWrapped(
      ctx,
      'High-fidelity examination station for telemetry analysis, powertrain thermal management, aerodynamics regulations, and championship rules.',
      116,
      252,
      530,
      '400 15px Arial',
      '#aeb9c8',
      22,
      5
    )
    return
  }

  if (state.isCompleted) {
    ctx.fillStyle = passed ? '#00d2be' : '#e10600'
    ctx.font = '900 17px Arial'
    ctx.fillText(passed ? 'CERTIFICATION SUCCESSFUL' : 'CERTIFICATION FAILED', 214, 140)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 34px Arial'
    ctx.fillText(`SCORE: ${state.score} / 10`, 214, 204)
    drawWrapped(
      ctx,
      passed
        ? 'You have demonstrated the required technical motorsport competence. The Formula 1 car entrance barrier has been permanently unlocked.'
        : 'You did not achieve the required 80% passing threshold. Review the technical exhibits and retake the exam.',
      132,
      258,
      530,
      '400 15px Arial',
      '#aeb9c8',
      22,
      5
    )
    drawCommand(ctx, 'R: RETAKE', 190, 360, 132)
    drawCommand(ctx, 'ESC: EXIT', 392, 360, 132)
    return
  }

  ctx.fillStyle = '#00d2be'
  ctx.font = '800 13px Arial'
  ctx.fillText(`QUESTION ${String(state.currentIndex + 1).padStart(2, '0')} / 10`, 38, 106)
  ctx.fillStyle = '#9aa7b5'
  ctx.textAlign = 'right'
  ctx.fillText((currentQuestion?.category ?? 'F1 TECHNICAL').toUpperCase(), width - 38, 106)
  ctx.textAlign = 'left'
  drawWrapped(ctx, currentQuestion?.question ?? '', 38, 134, width - 76, '700 16px Arial', '#ffffff', 22, 3)

  currentQuestion?.options.forEach((option, index) => {
    const y = 206 + index * 43
    let fill = 'rgba(255,255,255,0.05)'
    let stroke = '#445063'

    if (state.isAnswerSubmitted && index === currentQuestion.correctIndex) {
      fill = 'rgba(0,210,190,0.22)'
      stroke = '#00d2be'
    } else if (state.isAnswerSubmitted && index === state.selectedAnswer) {
      fill = 'rgba(225,6,0,0.22)'
      stroke = '#e10600'
    } else if (index === state.selectedAnswer) {
      fill = 'rgba(225,6,0,0.30)'
      stroke = '#ff3b36'
    }

    ctx.fillStyle = fill
    ctx.fillRect(38, y, width - 76, 34)
    ctx.strokeStyle = stroke
    ctx.strokeRect(38, y, width - 76, 34)
    ctx.fillStyle = stroke
    ctx.font = '900 13px Arial'
    ctx.fillText(['1', '2', '3', '4'][index], 58, y + 22)
    drawWrapped(ctx, option, 88, y + 22, width - 142, '600 12px Arial', '#e1e7ee', 15, 2)
  })

  if (state.isAnswerSubmitted && currentQuestion?.explanation) {
    drawWrapped(ctx, currentQuestion.explanation, 38, 386, width - 238, '400 11px Arial', '#aeb9c8', 14, 2)
  }

  drawCommand(
    ctx,
    state.isAnswerSubmitted ? (state.currentIndex + 1 < state.questions.length ? 'ENTER: NEXT' : 'ENTER: FINISH') : 'ENTER: CONFIRM',
    width - 178,
    368,
    140,
    state.selectedAnswer !== null
  )
}

export default function ComputerQuizTextureController({
  anchor,
  occluders,
  isInteracting,
  onExit,
  onPassExam,
}: ComputerQuizTextureControllerProps) {
  const scene = useThree((state) => state.scene)
  const config = EXHIBITION_SCREEN_CONFIG.computer
  const isVisible = useScreenVisibility(anchor, occluders, config.maxViewDistance, isInteracting)
  const rendererRef = useRef<ScreenSurfaceRenderer | null>(null)
  const passedRef = useRef(false)

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const restartQuiz = useCallback(() => {
    const q = f1DataService.getQuizQuestions(10)
    setQuestions(q)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
    setIsCompleted(false)
    passedRef.current = false
  }, [])

  useEffect(() => {
    restartQuiz()
  }, [restartQuiz])

  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null
  }, [questions, currentIndex])

  const handleSubmitOrNext = useCallback(() => {
    if (selectedAnswer === null) return

    if (!isAnswerSubmitted) {
      setIsAnswerSubmitted(true)
      if (selectedAnswer === currentQuestion?.correctIndex) {
        setScore((prev) => prev + 1)
      }
    } else if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
    } else {
      setIsCompleted(true)
    }
  }, [currentIndex, currentQuestion?.correctIndex, isAnswerSubmitted, questions.length, selectedAnswer])

  useEffect(() => {
    if (!isCompleted || passedRef.current || score < 8) return
    passedRef.current = true
    onPassExam?.()
  }, [isCompleted, onPassExam, score])

  useEffect(() => {
    const object = scene.getObjectByName(anchor.objectName) ?? scene.getObjectByName(config.objectName) ?? null
    const mesh = findMesh(object)
    if (!mesh) {
      console.warn(`[ScreenSystem] Computer screen mesh not found for ${anchor.objectName}`)
      return
    }

    const renderer = new ScreenSurfaceRenderer(mesh, config.resolution.width, config.resolution.height)
    rendererRef.current = renderer

    return () => {
      renderer.dispose()
      rendererRef.current = null
    }
  }, [anchor.objectName, config.objectName, config.resolution.height, config.resolution.width, scene])

  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer || !isVisible) return
    renderQuizCanvas(renderer.ctx, {
      questions,
      currentIndex,
      selectedAnswer,
      isAnswerSubmitted,
      score,
      isCompleted,
      isInteracting,
    })
    renderer.markNeedsUpdate()
  }, [currentIndex, isAnswerSubmitted, isCompleted, isInteracting, isVisible, questions, score, selectedAnswer])

  useEffect(() => {
    if (!isInteracting) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onExit()
        return
      }

      if (isCompleted && event.key.toLowerCase() === 'r') {
        restartQuiz()
        return
      }

      const optionIndex = ['1', '2', '3', '4'].indexOf(event.key)
      if (optionIndex !== -1 && !isAnswerSubmitted) {
        setSelectedAnswer(optionIndex)
        return
      }

      if (event.key === 'Enter') {
        handleSubmitOrNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSubmitOrNext, isAnswerSubmitted, isCompleted, isInteracting, onExit, restartQuiz])

  return null
}
