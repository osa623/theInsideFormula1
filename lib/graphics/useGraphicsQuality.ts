'use client'

import { useEffect, useState } from 'react'
import { GraphicsConfig, GraphicsManager, GraphicsQuality, ResolvedQuality } from './GraphicsManager'

export function useGraphicsQuality(): {
  quality: GraphicsQuality
  resolvedQuality: ResolvedQuality
  config: GraphicsConfig
  setQuality: (q: GraphicsQuality) => void
} {
  const [quality, setQualityState] = useState<GraphicsQuality>(GraphicsManager.getQuality())
  const [resolvedQuality, setResolvedQuality] = useState<ResolvedQuality>(GraphicsManager.getResolvedQuality())
  const [config, setConfig] = useState<GraphicsConfig>(GraphicsManager.getConfig())

  useEffect(() => {
    const unsubscribe = GraphicsManager.subscribe(() => {
      setQualityState(GraphicsManager.getQuality())
      setResolvedQuality(GraphicsManager.getResolvedQuality())
      setConfig(GraphicsManager.getConfig())
    })
    return unsubscribe
  }, [])

  const setQuality = (next: GraphicsQuality) => {
    GraphicsManager.setQuality(next)
  }

  return {
    quality,
    resolvedQuality,
    config,
    setQuality,
  }
}
