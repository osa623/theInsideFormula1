'use client'

import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SmartGuideZone } from '@/lib/ai/types'

interface CarnivalPhone3DProps {
  isOpen: boolean
  activeZone?: SmartGuideZone | null
  currentLocation?: string
}

export default function CarnivalPhone3D({ isOpen, activeZone, currentLocation }: CarnivalPhone3DProps) {
  const { camera } = useThree()
  const { scene } = useGLTF('/models/phone.glb')

  const phoneGroupRef = useRef<THREE.Group>(new THREE.Group())
  const canvasTextureRef = useRef<THREE.CanvasTexture | null>(null)

  // Clone scene so it can be safely used
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    return clone
  }, [scene])

  // Canvas texture on MobileScreen
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawPhoneScreen = () => {
      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024)
      bgGrad.addColorStop(0, '#0a0e17')
      bgGrad.addColorStop(0.5, '#121824')
      bgGrad.addColorStop(1, '#06080d')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, 512, 1024)

      // Top Status Bar
      ctx.fillStyle = '#ffffff'
      ctx.font = '700 24px monospace'
      ctx.fillText('19:45', 36, 44)
      ctx.fillText('5G // F1 TELEMETRY', 180, 44)
      ctx.fillText('98%', 430, 44)

      // F1 Brand Header
      ctx.fillStyle = '#e10600'
      ctx.fillRect(36, 72, 440, 110)
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 36px Arial Black, sans-serif'
      ctx.fillText('F1 CARNIVAL', 56, 124)
      ctx.font = '700 20px monospace'
      ctx.fillText('SMART GUIDE // ACTIVE', 56, 156)

      // Active Zone Display
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.fillRect(36, 210, 440, 360)
      ctx.strokeStyle = activeZone?.accentColor || '#e10600'
      ctx.lineWidth = 3
      ctx.strokeRect(36, 210, 440, 360)

      ctx.fillStyle = activeZone?.accentColor || '#e10600'
      ctx.font = '800 20px monospace'
      ctx.fillText(activeZone?.eyebrow || 'CARNIVAL EXPLORER', 56, 250)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 30px Arial Black, sans-serif'
      const title = (currentLocation || activeZone?.title || 'F1 Carnival Grounds').toUpperCase()
      ctx.fillText(title.slice(0, 22), 56, 295)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '500 22px Arial, sans-serif'
      const desc = activeZone?.description || `Explore ${currentLocation || 'Carnival Grounds'}, interactive booths, racing simulations, and championship archives.`
      const words = desc.split(' ')
      let line = ''
      let y = 345
      for (const word of words) {
        if (ctx.measureText(line + word).width < 400) {
          line += word + ' '
        } else {
          ctx.fillText(line, 56, y)
          y += 32
          line = word + ' '
          if (y > 520) break
        }
      }
      if (line && y <= 520) ctx.fillText(line, 56, y)

      // Interactive Action Indicator
      ctx.fillStyle = activeZone?.accentColor || '#e10600'
      ctx.fillRect(56, 590, 400, 60)
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 22px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(isOpen ? 'ACTIVE GUIDE ON SCREEN' : 'PRESS [P] FOR SMART GUIDE', 256, 628)
      ctx.textAlign = 'left'

      // Lower Telemetry readout
      ctx.fillStyle = 'rgba(0, 210, 190, 0.7)'
      ctx.font = '600 18px monospace'
      ctx.fillText('AI MODEL: F1 AI Model', 56, 700)
      ctx.fillText('TTS ENGINE: VOCAL GUIDANCE READY', 56, 730)
      ctx.fillText(`GPS: ${(currentLocation || 'ZONE LOCATED').toUpperCase()}`, 56, 760)

      if (canvasTextureRef.current) {
        canvasTextureRef.current.needsUpdate = true
      }
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    canvasTextureRef.current = tex

    // Apply texture to MobileScreen inside clonedScene
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name === 'MobileScreen' || child.name.toLowerCase().includes('screen')) {
          child.material = new THREE.MeshStandardMaterial({
            map: tex,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: tex,
            emissiveIntensity: 0.85,
            roughness: 0.15,
            metalness: 0.8,
          })
        } else {
          // Phone body material tuning (sleek space gray)
          if (child.material) {
            const mat = (Array.isArray(child.material) ? child.material[0] : child.material) as THREE.MeshStandardMaterial
            mat.roughness = 0.2
            mat.metalness = 0.85
          }
        }
      }
    })

    drawPhoneScreen()
    const timer = window.setInterval(drawPhoneScreen, 500)

    return () => {
      window.clearInterval(timer)
      tex.dispose()
    }
  }, [clonedScene, activeZone, isOpen, currentLocation])

  // Attach group to camera
  useEffect(() => {
    const group = phoneGroupRef.current
    group.clear()
    group.add(clonedScene)

    // Initial scale and orientation to face player
    // In phone.glb, Smartphone has scale ~0.1. We adjust scale for comfortable handheld size
    clonedScene.scale.set(1.4, 1.4, 1.4)
    // Rotate so screen faces camera
    clonedScene.rotation.set(Math.PI / 2, 0, Math.PI)

    camera.add(group)

    return () => {
      camera.remove(group)
    }
  }, [camera, clonedScene])

  // Target positions in camera space
  // PHONE_DOWN: docked at bottom right
  const posDown = useMemo(() => new THREE.Vector3(0.24, -0.28, -0.42), [])
  const rotDown = useMemo(() => new THREE.Euler(-0.45, -0.35, 0.15), [])

  // PHONE_OPEN: raised up in view
  const posOpen = useMemo(() => new THREE.Vector3(0.12, -0.09, -0.32), [])
  const rotOpen = useMemo(() => new THREE.Euler(-0.12, -0.15, 0.03), [])

  // Smooth lerp transition in useFrame
  useFrame((_, delta) => {
    const group = phoneGroupRef.current
    if (!group) return

    const targetPos = isOpen ? posOpen : posDown
    const targetRot = isOpen ? rotOpen : rotDown
    const speed = isOpen ? 8.0 : 6.0

    group.position.lerp(targetPos, Math.min(1, delta * speed))
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRot.x, Math.min(1, delta * speed))
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRot.y, Math.min(1, delta * speed))
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetRot.z, Math.min(1, delta * speed))
  })

  return null
}

useGLTF.preload('/models/phone.glb')
