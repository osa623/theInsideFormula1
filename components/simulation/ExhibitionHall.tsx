'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import {
  EXHIBITION_QR_ITEMS,
  ExhibitionBoard,
  ExhibitionTriggerPoint,
} from './types/exhibition'
import { CarPlaceholder } from './types/simulation'

interface ExhibitionHallProps {
  onPlaceholdersFound?: (placeholders: CarPlaceholder[]) => void
  onPlayerHeightFound?: (playerHeight: number) => void
  onExhibitionDataLoaded?: (data: {
    triggers: ExhibitionTriggerPoint[]
    boards: Map<string, ExhibitionBoard>
    spawnPosition: THREE.Vector3
    obstacleBoxes: THREE.Box3[]
    floorY: number
  }) => void
  isObservationMode?: boolean
  currentCar?: string | null
}

// Guaranteed exact world coordinates from New_Exhibition_Hall_02.glb
const TRIGGER_DEFAULTS: Record<string, [number, number, number]> = {
  'Trigger.000': [4.52, -2.90, 7.37],
  'Trigger.001': [8.04, -2.90, 4.31],
  'Trigger.002': [9.00, -2.90, -0.32],
  'Trigger.003': [7.68, -2.90, -4.73],
  'Trigger.004': [4.49, -2.90, -7.91],
  'Trigger.005': [-0.15, -2.90, -9.15],
  'Map_trigger': [-6.98, -2.90, -2.91],
  'Entrance_Spawn': [-5.12, -2.93, 6.23],
  'AI_Bot_Trigger': [-6.35, -2.90, 1.08],
}

const BOARD_DEFAULTS: Record<string, [number, number, number]> = {
  'Naming_Board.000': [5.05, -2.28, 8.28],
  'Naming_Board.001': [8.70, -2.28, 4.79],
  'Naming_Board.002': [9.83, -2.28, -0.28],
  'Naming_Board.003': [8.53, -2.28, -5.02],
  'Naming_Board.004': [4.97, -2.28, -8.55],
  'Naming_Board.005': [-0.06, -2.28, -9.97],
  'Naming_Board.006': [-7.79, -2.28, -3.35],
  'AI_Screen_Set': [-8.18, -0.28, 1.39],
}

export default function ExhibitionHall({
  onPlaceholdersFound,
  onPlayerHeightFound,
  onExhibitionDataLoaded,
  isObservationMode = false,
  currentCar = null,
}: ExhibitionHallProps) {
  const { scene } = useGLTF('/models/New_Exhibition_Hall_02.glb')

  const isObservationModeRef = useRef(isObservationMode)
  useEffect(() => {
    isObservationModeRef.current = isObservationMode
  }, [isObservationMode])

  const currentCarRef = useRef(currentCar)
  useEffect(() => {
    currentCarRef.current = currentCar
  }, [currentCar])

  const parsedData = useMemo(() => {
    let floorY = -2.93
    let spawnPos = new THREE.Vector3(-5.12, -2.93, 6.23)
    const triggerMap = new Map<string, THREE.Vector3>()
    const boardPositions = new Map<string, THREE.Vector3>()
    const obstacleBoxes: THREE.Box3[] = []
    const legacyPlaceholders: CarPlaceholder[] = []

    scene.updateMatrixWorld(true)

    // Pre-populate defaults
    Object.entries(TRIGGER_DEFAULTS).forEach(([key, val]) => {
      triggerMap.set(key, new THREE.Vector3(...val))
    })
    Object.entries(BOARD_DEFAULTS).forEach(([key, val]) => {
      boardPositions.set(key, new THREE.Vector3(...val))
    })

    scene.traverse((child) => {
      const name = child.name || ''

      // Floor detection
      if (/(^|_)floor($|_)/i.test(name)) {
        const pos = new THREE.Vector3()
        child.getWorldPosition(pos)
        floorY = Math.min(floorY, pos.y)
      }

      // Entrance_Spawn
      if (name === 'Entrance_Spawn') {
        child.getWorldPosition(spawnPos)
        triggerMap.set('Entrance_Spawn', spawnPos.clone())
      }

      // Triggers: Trigger.000 to Trigger.005, Map_trigger, AI_Bot_Trigger
      if (name.startsWith('Trigger.') || name === 'Map_trigger' || name === 'AI_Bot_Trigger') {
        const pos = new THREE.Vector3()
        child.getWorldPosition(pos)
        triggerMap.set(name, pos)
      }

      // AI_Screen_Set (Keep original orientation; add solid collision obstacle)
      if (name === 'AI_Screen_Set') {
        const pos = new THREE.Vector3()
        child.getWorldPosition(pos)
        boardPositions.set(name, pos)

        // Solid collider for the AI Screen setup (prevent walking through)
        const box = new THREE.Box3().setFromObject(child)
        if (!box.isEmpty()) {
          obstacleBoxes.push(box)
        }
      }

      // Naming_Board.000 to Naming_Board.006
      if (name.startsWith('Naming_Board.')) {
        const pos = new THREE.Vector3()
        child.getWorldPosition(pos)
        boardPositions.set(name, pos)

        // Solid collider for naming board (precise box from object geometry)
        const box = new THREE.Box3().setFromObject(child)
        if (!box.isEmpty()) {
          obstacleBoxes.push(box)
        }
      }

      // Building_01 and Building_02 solid colliders
      if (name.startsWith('Building_01') || name.startsWith('Building_02')) {
        const box = new THREE.Box3().setFromObject(child)
        if (!box.isEmpty()) {
          obstacleBoxes.push(box)
        }
      }

      // adding Colliders for the Naming Boards
        if (name.startsWith('Naming_Board.')) {
        const box = new THREE.Box3().setFromObject(child)
        if (!box.isEmpty()) {
          obstacleBoxes.push(box)
        }
      }

        // adding Colliders for the Boards
        if (name.startsWith('Board.')) {
        const box = new THREE.Box3().setFromObject(child)
        if (!box.isEmpty()) {
          obstacleBoxes.push(box)
        }
      }

        // adding Colliders for the MiddleBeam
        if (name.includes('Middle_Beam_02')) {
        const box = new THREE.Box3().setFromObject(child)
        if (!box.isEmpty()) {
          obstacleBoxes.push(box)
        }
      }

      
        // adding Colliders for the Bottom Beam Base
        if (name.includes('Bottom_beam_base')) {
        const box = new THREE.Box3().setFromObject(child)
        if (!box.isEmpty()) {
          obstacleBoxes.push(box)
        }
      }

      // Car_Position_2017 to Car_Position_2028 (Car Stands / Podiums)
      if (name.startsWith('Car_Position')) {
        const box = new THREE.Box3().setFromObject(child)
        if (!box.isEmpty()) {
          obstacleBoxes.push(box)
        }
      }

      // Car Models & Podium Cylinders (Full physical car colliders)
      if (
        name.includes('f1_model') ||
        name.includes('F1_model') ||
        name.includes('f1_Model') ||
        name.includes('Senna') ||
        name.includes('McLaren') ||
        name.includes('redbull') ||
        name.startsWith('Cylinder.')
      ) {
        const box = new THREE.Box3().setFromObject(child)
        if (!box.isEmpty()) {
          obstacleBoxes.push(box)
        }
      }
    })

    // Construct structured exhibition boards with front-facing camera zoom coordinates
    const boards = new Map<string, ExhibitionBoard>()
    const boardToTriggerMap: Record<string, string> = {
      'Naming_Board.000': 'Trigger.000',
      'Naming_Board.001': 'Trigger.001',
      'Naming_Board.002': 'Trigger.002',
      'Naming_Board.003': 'Trigger.003',
      'Naming_Board.004': 'Trigger.004',
      'Naming_Board.005': 'Trigger.005',
      'Naming_Board.006': 'Map_trigger',
    }

    boardPositions.forEach((boardPos, boardName) => {
      const trigName = boardToTriggerMap[boardName] || 'Trigger.000'
      const trigPos = triggerMap.get(trigName) || new THREE.Vector3(...TRIGGER_DEFAULTS[trigName])

      // Vector pointing from board towards trigger (front direction)
      const forwardDir = new THREE.Vector3(
        trigPos.x - boardPos.x,
        0,
        trigPos.z - boardPos.z
      ).normalize()

      // Position camera ~1.85m in front of the board, looking directly at the board center
      const cameraPosition = new THREE.Vector3(
        boardPos.x + forwardDir.x * 1.85,
        -1.45,
        boardPos.z + forwardDir.z * 1.85
      )
      const lookAtPosition = new THREE.Vector3(boardPos.x, -2.0, boardPos.z)

      boards.set(boardName, {
        name: boardName,
        position: boardPos,
        cameraPosition,
        lookAtPosition,
      })
    })

    // AI Terminal Board
    const aiBoardPos = boardPositions.get('AI_Screen_Set') || new THREE.Vector3(...BOARD_DEFAULTS['AI_Screen_Set'])
    boards.set('AI_Screen_Set', {
      name: 'AI_Screen_Set',
      position: aiBoardPos,
      cameraPosition: new THREE.Vector3(-6.7, -1.25, 1.15),
      lookAtPosition: new THREE.Vector3(-8.18, -0.5, 1.39),
    })

    // Construct structured exhibition trigger points
    const triggers: ExhibitionTriggerPoint[] = []
    const CAR_KEYS = ['senna-mp4-6', '2017', '2018', '2019', '2020', '2021']

    // 1. QR Triggers: Trigger.000 to Trigger.005 with carKey mappings
    for (let i = 0; i <= 5; i++) {
      const triggerName = `Trigger.00${i}`
      const boardName = `Naming_Board.00${i}`
      const pos = triggerMap.get(triggerName) || new THREE.Vector3(...TRIGGER_DEFAULTS[triggerName])

      triggers.push({
        id: `trig-${i}`,
        name: triggerName,
        position: pos,
        targetBoardName: boardName,
        qrData: EXHIBITION_QR_ITEMS[triggerName],
        carKey: CAR_KEYS[i],
      })
    }

    // 2. Map Trigger: Map_trigger -> Naming_Board.006 (Camera zoom ONLY)
    const mapPos = triggerMap.get('Map_trigger') || new THREE.Vector3(...TRIGGER_DEFAULTS['Map_trigger'])
    triggers.push({
      id: 'trig-map',
      name: 'Map_trigger',
      position: mapPos,
      targetBoardName: 'Naming_Board.006',
      isMap: true,
    })

    // 3. AI Terminal Trigger: AI_Bot_Trigger -> AI_Screen_Set
    const aiPos = triggerMap.get('AI_Bot_Trigger') || new THREE.Vector3(...TRIGGER_DEFAULTS['AI_Bot_Trigger'])
    triggers.push({
      id: 'trig-ai-terminal',
      name: 'AI_Bot_Trigger',
      position: aiPos,
      targetBoardName: 'AI_Screen_Set',
      isAITerminal: true,
    })

    // 4. Exit Trigger: Entrance_Spawn -> return to Carnival
    triggers.push({
      id: 'trig-exit',
      name: 'Entrance_Spawn',
      position: spawnPos.clone(),
      targetBoardName: '',
      isExit: true,
    })

    return {
      triggers,
      boards,
      spawnPosition: spawnPos,
      obstacleBoxes,
      floorY,
      playerHeight: floorY + 1.6,
      legacyPlaceholders,
    }
  }, [scene])

  // Material tuning for exhibition interior & dynamic AI_Screen texture
  useEffect(() => {
    let aiCanvasTexture: THREE.CanvasTexture | null = null
    let animId: number | null = null

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false
        child.receiveShadow = false

        const nameLower = child.name.toLowerCase()

        // AI Screen OLED Dynamic Texture (1024x1024 matching screen aspect ratio)
        if (child.name === 'AI_Screen' || nameLower === 'ai_screen') {
          const canvas = document.createElement('canvas')
          canvas.width = 1024
          canvas.height = 1024
          const ctx = canvas.getContext('2d')

          if (ctx) {
            let tick = 0
            const drawScreen = () => {
              tick += 0.05
              const isObs = isObservationModeRef.current

              if (isObs) {
                // ════════════════════════════════════════════════════════════════
                // ── OBSERVATION MODE: VIBRANT LIGHT BLUE / CYAN HIGH-TECH THEME
                // ════════════════════════════════════════════════════════════════

                // 1. Background gradient (deep space/ocean cyan-blue)
                const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024)
                bgGrad.addColorStop(0, '#020b18')
                bgGrad.addColorStop(0.5, '#04162e')
                bgGrad.addColorStop(1, '#02213d')
                ctx.fillStyle = bgGrad
                ctx.fillRect(0, 0, 1024, 1024)

                // High-tech cyber grid
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.045)'
                ctx.lineWidth = 1
                for (let x = 0; x < 1024; x += 24) {
                  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke()
                }
                for (let y = 0; y < 1024; y += 24) {
                  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke()
                }

                // 2. Light Blue Outer Precision Border & Corner Brackets
                ctx.strokeStyle = '#00e5ff'
                ctx.lineWidth = 4
                ctx.strokeRect(28, 28, 968, 968)

                ctx.strokeStyle = 'rgba(0, 229, 255, 0.28)'
                ctx.lineWidth = 1.5
                ctx.strokeRect(36, 36, 952, 952)

                // Corner brackets in bright cyan
                ctx.strokeStyle = '#38bdf8'
                ctx.lineWidth = 3.5
                const cSize = 26
                ctx.beginPath(); ctx.moveTo(28, 28 + cSize); ctx.lineTo(28, 28); ctx.lineTo(28 + cSize, 28); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(996 - cSize, 28); ctx.lineTo(996, 28); ctx.lineTo(996, 28 + cSize); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(28, 996 - cSize); ctx.lineTo(28, 996); ctx.lineTo(28 + cSize, 996); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(996 - cSize, 996); ctx.lineTo(996, 996); ctx.lineTo(996, 996 - cSize); ctx.stroke()

                // 3. Header Bar (Light Blue Theme)
                ctx.fillStyle = 'rgba(0, 229, 255, 0.14)'
                ctx.fillRect(52, 52, 920, 96)
                ctx.strokeStyle = '#00e5ff'
                ctx.lineWidth = 2
                ctx.strokeRect(52, 52, 920, 96)

                ctx.fillStyle = '#00e5ff'
                ctx.fillRect(52, 52, 14, 96)

                ctx.fillStyle = '#ffffff'
                ctx.font = '900 30px Arial Black, sans-serif'
                ctx.fillText('EXHIBITION // OBSERVATION TOUR ACTIVE', 84, 98)

                ctx.fillStyle = 'rgba(0, 229, 255, 0.85)'
                ctx.font = '700 13px monospace'
                ctx.fillText('ACOUSTIC RADAR SENSING // AUTOMATIC AUDIO TOUR // 6 CARS', 86, 128)

                // Pulsing light blue status indicator
                const pulseR = 8 + Math.sin(tick * 3) * 3
                ctx.fillStyle = 'rgba(0, 229, 255, 0.35)'
                ctx.beginPath(); ctx.arc(920, 88, pulseR + 5, 0, Math.PI * 2); ctx.fill()
                ctx.fillStyle = '#00e5ff'
                ctx.beginPath(); ctx.arc(920, 88, 8, 0, Math.PI * 2); ctx.fill()
                ctx.font = '800 13px monospace'
                ctx.fillText('OBSERVING', 816, 93)

                // 4. Middle Area (Radar + Audio Spectrum Visualizer)
                ctx.fillStyle = 'rgba(0, 229, 255, 0.035)'
                ctx.fillRect(52, 180, 920, 520)
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)'
                ctx.strokeRect(52, 180, 920, 520)

                // ── Animation A: Circular Proximity Radar Scanner (Left side) ──
                const rcx = 240
                const rcy = 430
                const maxR = 120

                // Radar concentric rings
                for (let r = 40; r <= maxR; r += 40) {
                  ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)'
                  ctx.lineWidth = 1.2
                  ctx.beginPath(); ctx.arc(rcx, rcy, r, 0, Math.PI * 2); ctx.stroke()
                }
                // Radar crosshair axes
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.18)'
                ctx.beginPath(); ctx.moveTo(rcx - maxR - 10, rcy); ctx.lineTo(rcx + maxR + 10, rcy); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(rcx, rcy - maxR - 10); ctx.lineTo(rcx, rcy + maxR + 10); ctx.stroke()

                // Sweeping radar beam
                const sweep = tick * 2.2
                ctx.save()
                ctx.beginPath()
                ctx.moveTo(rcx, rcy)
                ctx.arc(rcx, rcy, maxR, sweep - 0.45, sweep)
                ctx.closePath()
                const sweepGrad = ctx.createRadialGradient(rcx, rcy, 0, rcx, rcy, maxR)
                sweepGrad.addColorStop(0, 'rgba(0, 229, 255, 0)')
                sweepGrad.addColorStop(1, 'rgba(0, 229, 255, 0.35)')
                ctx.fillStyle = sweepGrad
                ctx.fill()
                ctx.restore()

                ctx.strokeStyle = '#00e5ff'
                ctx.lineWidth = 2.5
                ctx.beginPath()
                ctx.moveTo(rcx, rcy)
                ctx.lineTo(rcx + Math.cos(sweep) * maxR, rcy + Math.sin(sweep) * maxR)
                ctx.stroke()

                // 6 Car Exhibit Blips on Radar
                const blips = [
                  { angle: 0.3, r: 85, color: '#38bdf8', label: 'MP4/6' },
                  { angle: 1.2, r: 95, color: '#34d399', label: '2017' },
                  { angle: 2.1, r: 75, color: '#fbbf24', label: '2018' },
                  { angle: 3.3, r: 90, color: '#f472b6', label: '2019' },
                  { angle: 4.2, r: 80, color: '#a855f7', label: '2020' },
                  { angle: 5.4, r: 100, color: '#38bdf8', label: '2021' },
                ]
                blips.forEach((b) => {
                  const bx = rcx + Math.cos(b.angle) * b.r
                  const by = rcy + Math.sin(b.angle) * b.r
                  const isCurrent = currentCarRef.current && currentCarRef.current.includes(b.label.toLowerCase())

                  // Ping pulse if active
                  if (isCurrent) {
                    const ping = (tick * 40) % 25
                    ctx.strokeStyle = b.color
                    ctx.lineWidth = 1.5
                    ctx.beginPath(); ctx.arc(bx, by, ping, 0, Math.PI * 2); ctx.stroke()
                  }

                  ctx.fillStyle = b.color
                  ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill()
                  ctx.font = '700 11px monospace'
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
                  ctx.fillText(b.label, bx + 8, by + 4)
                })

                ctx.font = '800 12px monospace'
                ctx.fillStyle = '#00e5ff'
                ctx.fillText('PROXIMITY RADAR // 360° ACOUSTIC SENSING', 90, 580)

                // ── Animation B: Colorful Audio Equalizer Spectrum (Right side) ──
                ctx.font = '800 13px monospace'
                ctx.fillStyle = '#38bdf8'
                ctx.fillText('AUDIO GUIDE FREQUENCY SPECTRUM (DUAL-CHANNEL)', 430, 235)

                const numBars = 19
                const barStart = 430
                const barWidth = 22
                const barSpacing = 27
                const baseH = 480

                for (let i = 0; i < numBars; i++) {
                  const h =
                    40 +
                    Math.abs(Math.sin(tick * 3.2 + i * 0.42)) * 140 +
                    Math.abs(Math.cos(tick * 2.1 - i * 0.35)) * 60
                  const bx = barStart + i * barSpacing
                  const by = baseH - h

                  // Multi-color gradient: light cyan -> violet -> hot pink
                  const barGrad = ctx.createLinearGradient(0, baseH, 0, by)
                  barGrad.addColorStop(0, '#00e5ff')
                  barGrad.addColorStop(0.55, '#a855f7')
                  barGrad.addColorStop(1, '#ec4899')

                  ctx.fillStyle = barGrad
                  ctx.fillRect(bx, by, barWidth, h)

                  // Peak dot
                  ctx.fillStyle = '#ffffff'
                  ctx.fillRect(bx, by - 5, barWidth, 3)
                }

                // ── Animation C: Flowing Multi-color Sine Waves (Bottom of middle box) ──
                // Cyan Wave
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)'
                ctx.lineWidth = 3
                ctx.beginPath()
                for (let x = 60; x <= 964; x += 4) {
                  const y = 640 + Math.sin(x * 0.016 + tick * 1.5) * 32 + Math.cos(x * 0.038 - tick) * 14
                  if (x === 60) ctx.moveTo(x, y)
                  else ctx.lineTo(x, y)
                }
                ctx.stroke()

                // Violet Wave
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.75)'
                ctx.lineWidth = 2
                ctx.beginPath()
                for (let x = 60; x <= 964; x += 4) {
                  const y = 640 + Math.cos(x * 0.02 - tick * 1.2) * 26 + Math.sin(x * 0.045 + tick * 1.8) * 10
                  if (x === 60) ctx.moveTo(x, y)
                  else ctx.lineTo(x, y)
                }
                ctx.stroke()

                // Top telemetry status chips inside middle box
                ctx.font = '700 13px monospace'
                ctx.fillStyle = '#00e5ff'
                ctx.fillText('VOICE ENGINE: SPEECH SYNTHESIS READY', 80, 215)
                ctx.fillStyle = '#34d399'
                ctx.fillText('WALK TRIGGER: PROXIMITY AUTOPLAY ACTIVE', 80, 240)
                ctx.fillStyle = '#fbbf24'
                ctx.fillText(`TARGET: ${(currentCarRef.current || 'ALL EXHIBITS').toUpperCase()}`, 80, 265)

                // 5. Interactive Prompt Banner (Light Blue Observation Theme)
                ctx.fillStyle = 'rgba(0, 180, 216, 0.32)'
                ctx.fillRect(160, 740, 704, 96)
                ctx.strokeStyle = '#00e5ff'
                ctx.lineWidth = 2.5
                ctx.strokeRect(160, 740, 704, 96)

                ctx.fillStyle = '#ffffff'
                ctx.font = '900 26px Arial Black, sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText('OBSERVATION MODE ON • WALK TO CARS TO HEAR AUDIO', 512, 788)
                ctx.font = '700 15px monospace'
                ctx.fillStyle = 'rgba(224, 247, 255, 0.9)'
                ctx.fillText('WALK FREELY OR PRESS [E] TO OPEN FULL AI TERMINAL', 512, 818)
                ctx.textAlign = 'left'

                // 6. Footer Readout
                ctx.font = '600 14px monospace'
                ctx.fillStyle = 'rgba(0, 229, 255, 0.75)'
                ctx.fillText('OBSERVATION TOUR RUNNING // HIGH-FIDELITY SPEECH REPLAY ENABLED // 6 EXHIBITS', 52, 920)
                ctx.fillStyle = 'rgba(0, 229, 255, 0.5)'
                ctx.fillText('FIA TECHNICAL ARCHIVE // REAL-TIME AI GUIDANCE', 52, 946)
              } else {
                // ════════════════════════════════════════════════════════════════
                // ── NORMAL MODE: CLASSIC F1 RED RACING TERMINAL DESIGN
                // ════════════════════════════════════════════════════════════════

                // Background
                const grad = ctx.createLinearGradient(0, 0, 1024, 1024)
                grad.addColorStop(0, '#04070d')
                grad.addColorStop(0.5, '#070b14')
                grad.addColorStop(1, '#0e0408')
                ctx.fillStyle = grad
                ctx.fillRect(0, 0, 1024, 1024)

                // Carbon weave pattern
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)'
                ctx.lineWidth = 1
                for (let x = 0; x < 1024; x += 20) {
                  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke()
                }
                for (let y = 0; y < 1024; y += 20) {
                  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke()
                }

                // Outer precision border (Classic Red)
                ctx.strokeStyle = '#e10600'
                ctx.lineWidth = 4
                ctx.strokeRect(28, 28, 968, 968)

                // Thin secondary inner border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
                ctx.lineWidth = 1
                ctx.strokeRect(36, 36, 952, 952)

                // Corner brackets
                ctx.strokeStyle = '#ffffff'
                ctx.lineWidth = 3
                const cSize = 24
                ctx.beginPath(); ctx.moveTo(28, 28 + cSize); ctx.lineTo(28, 28); ctx.lineTo(28 + cSize, 28); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(996 - cSize, 28); ctx.lineTo(996, 28); ctx.lineTo(996, 28 + cSize); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(28, 996 - cSize); ctx.lineTo(28, 996); ctx.lineTo(28 + cSize, 996); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(996 - cSize, 996); ctx.lineTo(996, 996); ctx.lineTo(996, 996 - cSize); ctx.stroke()

                // Header Bar (Classic Red)
                ctx.fillStyle = 'rgba(225, 6, 0, 0.15)'
                ctx.fillRect(52, 52, 920, 96)
                ctx.strokeStyle = '#e10600'
                ctx.lineWidth = 2
                ctx.strokeRect(52, 52, 920, 96)

                ctx.fillStyle = '#e10600'
                ctx.fillRect(52, 52, 14, 96)

                ctx.fillStyle = '#ffffff'
                ctx.font = '900 32px Arial Black, sans-serif'
                ctx.fillText('FORMULA 1 EXHIBITION TERMINAL', 84, 100)

                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
                ctx.font = '700 13px monospace'
                ctx.fillText('RESEARCH // NEURAL ARCHIVE // GEMINI 1.5 PRO', 86, 128)

                // Status pill
                ctx.fillStyle = '#00f076'
                ctx.beginPath(); ctx.arc(920, 88, 8, 0, Math.PI * 2); ctx.fill()
                ctx.font = '800 14px monospace'
                ctx.fillText('ONLINE', 840, 94)

                // Middle telemetry grid
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
                ctx.fillRect(52, 180, 920, 520)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
                ctx.strokeRect(52, 180, 920, 520)

                // Telemetry Grid Lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
                ctx.lineWidth = 1
                for (let gy = 240; gy < 700; gy += 60) {
                  ctx.beginPath(); ctx.moveTo(52, gy); ctx.lineTo(972, gy); ctx.stroke()
                }

                // Multi-layer Telemetry Waves
                // Wave 1: Primary Cyan
                ctx.strokeStyle = 'rgba(0, 210, 190, 0.85)'
                ctx.lineWidth = 3
                ctx.beginPath()
                for (let x = 60; x <= 964; x += 4) {
                  const y = 440 + Math.sin(x * 0.015 + tick) * 55 + Math.cos(x * 0.04 - tick * 1.4) * 22
                  if (x === 60) ctx.moveTo(x, y)
                  else ctx.lineTo(x, y)
                }
                ctx.stroke()

                // Wave 2: Secondary Red
                ctx.strokeStyle = 'rgba(225, 6, 0, 0.65)'
                ctx.lineWidth = 2
                ctx.beginPath()
                for (let x = 60; x <= 964; x += 4) {
                  const y = 440 + Math.cos(x * 0.018 - tick * 0.8) * 40 + Math.sin(x * 0.05 + tick * 1.8) * 16
                  if (x === 60) ctx.moveTo(x, y)
                  else ctx.lineTo(x, y)
                }
                ctx.stroke()

                // Telemetry readouts in center
                ctx.font = '700 14px monospace'
                ctx.fillStyle = '#00d2be'
                ctx.fillText('CHASSIS DYNAMICS: STABLE', 80, 220)
                ctx.fillText('AERO LOAD: 14.8 kN @ 280 KM/H', 80, 250)
                ctx.fillStyle = '#ffb800'
                ctx.fillText('THERMAL WINDOW: 102°C OPTIMAL', 620, 220)
                ctx.fillText('TELEMETRY BAND: 5.8 GHz ULTRA-WIDE', 620, 250)

                // Interactive prompt banner (Classic Red)
                ctx.fillStyle = 'rgba(225, 6, 0, 0.9)'
                ctx.fillRect(160, 740, 704, 96)
                ctx.strokeStyle = '#ffffff'
                ctx.lineWidth = 2.5
                ctx.strokeRect(160, 740, 704, 96)

                ctx.fillStyle = '#ffffff'
                ctx.font = '900 28px Arial Black, sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText('PRESS [E] TO ACTIVATE AI ASSISTANT', 512, 800)
                ctx.textAlign = 'left'

                // Footer readout
                ctx.font = '600 14px monospace'
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
                ctx.fillText('CORE: AI-ASSISTANT // SENSORS: CALIBRATED // OBSERVATION MODE: AVAILABLE', 52, 920)
                ctx.fillText('F1 TECHNICAL ARCHIVE // FORMULA 1 EXPERIENCE', 52, 946)
              }

              if (aiCanvasTexture) {
                aiCanvasTexture.needsUpdate = true
              }
            }

            aiCanvasTexture = new THREE.CanvasTexture(canvas)
            aiCanvasTexture.colorSpace = THREE.SRGBColorSpace

            // ── ORIENTATION FIX: Correct mesh UVs so screen is upright and text reads left-to-right ──
            aiCanvasTexture.matrixAutoUpdate = false
            aiCanvasTexture.matrix.set(
               0, -1, 1,
              -1,  0, 1,
               0,  0, 1
            )

            const screenMat = new THREE.MeshStandardMaterial({
              map: aiCanvasTexture,
              emissive: new THREE.Color(0xffffff),
              emissiveMap: aiCanvasTexture,
              emissiveIntensity: 0.95,
              roughness: 0.2,
              metalness: 0.8,
              side: THREE.DoubleSide,
            })
            child.material = screenMat

            const intervalId = window.setInterval(drawScreen, 80)
            return () => window.clearInterval(intervalId)
          }
        }

        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat) => {
            const stdMat = mat as THREE.MeshStandardMaterial
            if (nameLower.includes('glass')) {
              stdMat.transparent = true
              stdMat.opacity = 0.3
              stdMat.roughness = 0.05
              stdMat.metalness = 0.9
              stdMat.depthWrite = false
            } else if (nameLower.includes('floor')) {
              stdMat.roughness = 0.4
              stdMat.metalness = 0.1
            } else if (nameLower.includes('naming_board')) {
              stdMat.roughness = 0.25
              stdMat.metalness = 0.2
            }
          })
        }
      }
    })

    return () => {
      if (animId) cancelAnimationFrame(animId)
      aiCanvasTexture?.dispose()
    }
  }, [scene])

  useEffect(() => {
    onPlaceholdersFound?.(parsedData.legacyPlaceholders)
    onPlayerHeightFound?.(parsedData.playerHeight)
    onExhibitionDataLoaded?.({
      triggers: parsedData.triggers,
      boards: parsedData.boards,
      spawnPosition: parsedData.spawnPosition,
      obstacleBoxes: parsedData.obstacleBoxes,
      floorY: parsedData.floorY,
    })
  }, [parsedData, onPlaceholdersFound, onPlayerHeightFound, onExhibitionDataLoaded])

  return <primitive object={scene} />
}

useGLTF.preload('/models/New_Exhibition_Hall_02.glb')
