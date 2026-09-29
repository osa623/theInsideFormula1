import * as THREE from 'three'

export type LoadingPhase =
  | 'INITIALIZING'
  | 'DOWNLOADING_ASSETS'
  | 'PARSING_GEOMETRY'
  | 'PREPARING_SCENE'
  | 'READY'

export interface SceneLoadingState {
  progress: number
  phase: LoadingPhase
  statusMessage: string
  isApplicationReady: boolean
  isSceneMounted: boolean
  isPlayerReady: boolean
  isFirstFrameDrawn: boolean
}

type LoadingListener = (state: SceneLoadingState) => void

export class SceneLoadingManager {
  private static instance: SceneLoadingManager | null = null
  private listeners: Set<LoadingListener> = new Set()

  private state: SceneLoadingState = {
    progress: 0,
    phase: 'INITIALIZING',
    statusMessage: 'INITIALIZING F1 SIMULATION...',
    isApplicationReady: false,
    isSceneMounted: false,
    isPlayerReady: false,
    isFirstFrameDrawn: false,
  }

  private is3DRoute: boolean = false
  private itemsLoaded = 0
  private itemsTotal = 0

  private constructor() {
    this.setupThreeLoadingManager()
  }

  public static getInstance(): SceneLoadingManager {
    if (!SceneLoadingManager.instance) {
      SceneLoadingManager.instance = new SceneLoadingManager()
    }
    return SceneLoadingManager.instance
  }

  private setupThreeLoadingManager() {
    if (typeof window === 'undefined') return

    THREE.DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.itemsLoaded = itemsLoaded
      this.itemsTotal = itemsTotal
      this.updateState({
        phase: 'DOWNLOADING_ASSETS',
        statusMessage: 'DOWNLOADING 3D ASSETS...',
        progress: Math.min(Math.round((itemsLoaded / itemsTotal) * 75), 75),
      })
    }

    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.itemsLoaded = itemsLoaded
      this.itemsTotal = itemsTotal
      const rawProgress = (itemsLoaded / itemsTotal) * 75
      const currentProgress = Math.max(this.state.progress, Math.min(Math.round(rawProgress), 75))

      const filename = url.split('/').pop() || ''
      let msg = 'DOWNLOADING 3D ASSETS...'
      if (filename.endsWith('.glb')) msg = 'PARSING F1 3D GEOMETRY...'
      else if (filename.endsWith('.hdr') || filename.endsWith('.jpg') || filename.endsWith('.png'))
        msg = 'CALIBRATING LIGHTING & REFLECTIONS...'

      this.updateState({
        progress: currentProgress,
        phase: currentProgress >= 65 ? 'PARSING_GEOMETRY' : 'DOWNLOADING_ASSETS',
        statusMessage: msg,
      })
    }

    THREE.DefaultLoadingManager.onLoad = () => {
      this.updateState({
        progress: 85,
        phase: 'PREPARING_SCENE',
        statusMessage: 'PREPARING SHADERS & COLLIDERS...',
      })
      this.checkApplicationReady()
    }

    THREE.DefaultLoadingManager.onError = (url) => {
      console.warn(`[SceneLoadingManager] Asset load warning for: ${url}`)
    }
  }

  public startRoute(is3D: boolean) {
    this.is3DRoute = is3D
    this.itemsLoaded = 0
    this.itemsTotal = 0

    if (!is3D) {
      // Non-3D routes don't require heavy GLB downloads
      this.updateState({
        progress: 100,
        phase: 'READY',
        statusMessage: 'SYSTEM READY',
        isApplicationReady: true,
        isSceneMounted: true,
        isPlayerReady: true,
        isFirstFrameDrawn: true,
      })
    } else {
      this.updateState({
        progress: 10,
        phase: 'INITIALIZING',
        statusMessage: 'INITIALIZING 3D ENVIRONMENT...',
        isApplicationReady: false,
        isSceneMounted: false,
        isPlayerReady: false,
        isFirstFrameDrawn: false,
      })
    }
  }

  public notifySceneMounted(sceneName: string) {
    this.updateState({
      progress: Math.max(this.state.progress, 90),
      phase: 'PREPARING_SCENE',
      statusMessage: `INITIALIZING ${sceneName.toUpperCase()}...`,
      isSceneMounted: true,
    })
    this.checkApplicationReady()
  }

  public notifyPlayerReady() {
    this.updateState({
      progress: Math.max(this.state.progress, 95),
      statusMessage: 'POSITIONING TELEMETRY SYSTEMS...',
      isPlayerReady: true,
    })
    this.checkApplicationReady()
  }

  public notifyFirstFrameRendered() {
    this.updateState({
      progress: 100,
      phase: 'READY',
      statusMessage: 'SIMULATION READY',
      isFirstFrameDrawn: true,
    })
    this.checkApplicationReady()
  }

  private checkApplicationReady() {
    if (!this.is3DRoute) {
      this.updateState({ isApplicationReady: true })
      return
    }

    // Must satisfy: MODEL_LOADED + SCENE_INITIALIZED + PLAYER_READY + INTERACTION_READY
    const isReady =
      this.state.isSceneMounted &&
      this.state.isPlayerReady &&
      this.state.isFirstFrameDrawn

    if (isReady && !this.state.isApplicationReady) {
      this.updateState({
        progress: 100,
        phase: 'READY',
        statusMessage: 'SIMULATION READY',
        isApplicationReady: true,
      })
    }
  }

  public getState(): SceneLoadingState {
    return this.state
  }

  public subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private updateState(partial: Partial<SceneLoadingState>) {
    this.state = { ...this.state, ...partial }
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }
}

export const sceneLoadingManager = SceneLoadingManager.getInstance()
