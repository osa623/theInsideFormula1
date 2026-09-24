'use client'

import * as THREE from 'three'

export type GraphicsQuality = 'auto' | 'low' | 'medium' | 'high'
export type ResolvedQuality = 'low' | 'medium' | 'high'

export interface GraphicsConfig {
  dprMin: number
  dprMax: number
  dprTarget: number
  shadows: boolean
  shadowMapSize: number
  shadowType: THREE.ShadowMapType
  shadowFar: number
  shadowFrustum: number
  shadowBias: number
  shadowNormalBias: number
  anisotropy: number
  maxDrawDistance: number
  fogNear: number
  fogFar: number
  contactShadowResolution: number
  contactShadowScale: number
  contactShadowOpacity: number
  contactShadowBlur: number
  contactShadowFar: number
  envIntensity: number
  usePostProcessing: boolean
  enableAO: boolean
  enableBloom: boolean
  textureFiltering: THREE.MinificationTextureFilter
}

export const GRAPHICS_PROFILES: Record<ResolvedQuality, GraphicsConfig> = {
  low: {
    // Slightly softer / mild reduction in render resolution (~44% fewer pixel shading calculations)
    dprMin: 0.68,
    dprMax: 0.80,
    dprTarget: 0.75,

    // Shadows MUST remain enabled, but low quality / short distance / low resolution
    shadows: true,
    shadowMapSize: 512,
    shadowType: THREE.BasicShadowMap, // Lightweight 1-tap shadow test
    shadowFar: 85,                    // Short shadow distance
    shadowFrustum: 38,                // Tighter shadow frustum (only nearby geometry casts shadows)
    shadowBias: -0.0003,
    shadowNormalBias: 0.04,

    // Lightweight texture & anisotropy
    anisotropy: 1,
    textureFiltering: THREE.LinearFilter,

    // Reduced view distance (distant objects culled, fog brings in horizon softly)
    maxDrawDistance: 160,
    fogNear: 45,
    fogFar: 145,

    // Reduced effects & contact shadows
    contactShadowResolution: 128,
    contactShadowScale: 60,
    contactShadowOpacity: 0.5,
    contactShadowBlur: 1.5,
    contactShadowFar: 20,

    // Reduced reflections
    envIntensity: 0.15,

    // Disable heavy post-processing & AO
    usePostProcessing: false,
    enableAO: false,
    enableBloom: false,
  },
  medium: {
    // Balanced native 1:1 render scale
    dprMin: 0.90,
    dprMax: 1.05,
    dprTarget: 1.0,

    // Medium quality shadows & medium distance
    shadows: true,
    shadowMapSize: 1024,
    shadowType: THREE.PCFShadowMap,
    shadowFar: 140,
    shadowFrustum: 60,
    shadowBias: -0.0002,
    shadowNormalBias: 0.03,

    // Medium texture filtering & anisotropy
    anisotropy: 4,
    textureFiltering: THREE.LinearMipmapLinearFilter,

    // Medium view distance
    maxDrawDistance: 280,
    fogNear: 75,
    fogFar: 240,

    // Moderate effects & contact shadows
    contactShadowResolution: 256,
    contactShadowScale: 100,
    contactShadowOpacity: 0.75,
    contactShadowBlur: 1.0,
    contactShadowFar: 35,

    // Moderate reflections
    envIntensity: 0.28,

    usePostProcessing: false,
    enableAO: false,
    enableBloom: false,
  },
  high: {
    // Crisp native to supersampled render scale
    dprMin: 1.0,
    dprMax: 1.5,
    dprTarget: 1.35,

    // High quality shadows, 2048 resolution, long distance
    shadows: true,
    shadowMapSize: 2048,
    shadowType: THREE.PCFShadowMap,
    shadowFar: 220,
    shadowFrustum: 85,
    shadowBias: -0.00015,
    shadowNormalBias: 0.025,

    // Maximum texture sharpness & 16x anisotropy
    anisotropy: 16,
    textureFiltering: THREE.LinearMipmapLinearFilter,

    // Long view distance
    maxDrawDistance: 500,
    fogNear: 105,
    fogFar: 310,

    // High contact shadows
    contactShadowResolution: 512,
    contactShadowScale: 140,
    contactShadowOpacity: 0.88,
    contactShadowBlur: 0.8,
    contactShadowFar: 48,

    // Rich reflections
    envIntensity: 0.35,

    usePostProcessing: true,
    enableAO: true,
    enableBloom: true,
  },
}

const STORAGE_KEY = 'f1_graphics_quality'

class GraphicsManagerClass {
  private userPreference: GraphicsQuality = 'auto'
  private resolvedQuality: ResolvedQuality = 'medium'
  private listeners = new Set<() => void>()

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as GraphicsQuality | null
      if (stored && ['auto', 'low', 'medium', 'high'].includes(stored)) {
        this.userPreference = stored
      }
      this.detectInitialCapability()
    }
  }

  private detectInitialCapability(): void {
    if (this.userPreference !== 'auto') {
      this.resolvedQuality = this.userPreference
      return
    }

    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

      if (!gl) {
        this.resolvedQuality = 'low'
        return
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : ''
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
      const dpr = window.devicePixelRatio || 1

      // Heuristic detection based on GPU renderer, texture limits, and device
      const isLowTier =
        isMobile ||
        renderer.includes('SwiftShader') ||
        renderer.includes('llvmpipe') ||
        renderer.includes('Intel HD') ||
        maxTextureSize < 4096

      const isHighTier =
        !isMobile &&
        maxTextureSize >= 8192 &&
        dpr >= 1 &&
        (renderer.includes('RTX') ||
          renderer.includes('GTX') ||
          renderer.includes('Radeon') ||
          renderer.includes('Apple M') ||
          renderer.includes('GeForce'))

      if (isLowTier) {
        this.resolvedQuality = 'low'
      } else if (isHighTier) {
        this.resolvedQuality = 'high'
      } else {
        this.resolvedQuality = 'medium'
      }
    } catch {
      this.resolvedQuality = 'medium'
    }
  }

  public getQuality(): GraphicsQuality {
    return this.userPreference
  }

  public getResolvedQuality(): ResolvedQuality {
    return this.resolvedQuality
  }

  public getConfig(): GraphicsConfig {
    return GRAPHICS_PROFILES[this.resolvedQuality]
  }

  public setQuality(quality: GraphicsQuality): void {
    this.userPreference = quality
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, quality)
    }

    if (quality === 'auto') {
      this.detectInitialCapability()
    } else {
      this.resolvedQuality = quality
    }

    this.notify()
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb())
  }

  // Runtime frame monitoring for AUTO mode
  public reportFramePerformance(avgDeltaMs: number): void {
    if (this.userPreference !== 'auto') return

    // If sustained frame time > 33ms (< 30fps), degrade quality gracefully
    if (avgDeltaMs > 34 && this.resolvedQuality === 'high') {
      this.resolvedQuality = 'medium'
      this.notify()
    } else if (avgDeltaMs > 38 && this.resolvedQuality === 'medium') {
      this.resolvedQuality = 'low'
      this.notify()
    }
  }
}

export const GraphicsManager = new GraphicsManagerClass()
