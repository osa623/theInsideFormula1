'use client'

import React, { useEffect, useMemo } from 'react'
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
}

const BOARD_DEFAULTS: Record<string, [number, number, number]> = {
  'Naming_Board.000': [5.05, -2.28, 8.28],
  'Naming_Board.001': [8.70, -2.28, 4.79],
  'Naming_Board.002': [9.83, -2.28, -0.28],
  'Naming_Board.003': [8.53, -2.28, -5.02],
  'Naming_Board.004': [4.97, -2.28, -8.55],
  'Naming_Board.005': [-0.06, -2.28, -9.97],
  'Naming_Board.006': [-7.79, -2.28, -3.35],
}

export default function ExhibitionHall({
  onPlaceholdersFound,
  onPlayerHeightFound,
  onExhibitionDataLoaded,
}: ExhibitionHallProps) {
  const { scene } = useGLTF('/models/New_Exhibition_Hall_02.glb')

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

      // Triggers: Trigger.000 to Trigger.005 and Map_trigger
      if (name.startsWith('Trigger.') || name === 'Map_trigger') {
        const pos = new THREE.Vector3()
        child.getWorldPosition(pos)
        triggerMap.set(name, pos)
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

    // Construct structured exhibition trigger points
    const triggers: ExhibitionTriggerPoint[] = []

    // 1. QR Triggers: Trigger.000 to Trigger.005
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

    // 3. Exit Trigger: Entrance_Spawn -> return to Carnival
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

  // Material tuning for exhibition interior
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false
        child.receiveShadow = false

        const nameLower = child.name.toLowerCase()
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
