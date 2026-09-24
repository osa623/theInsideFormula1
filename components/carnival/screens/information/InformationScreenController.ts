import * as THREE from 'three'
import { ScreenSurfaceRenderer } from '../ScreenSurfaceRenderer'
import { ScreenDataAdapter } from '@/components/exhibition/information-screens/ScreenDataAdapter'
import { ScreenCanvasRenderer } from '@/components/exhibition/information-screens/ScreenCanvasRenderer'
import { NormalizedScreenData } from '@/components/exhibition/information-screens/screenTypes'

export class InformationScreenController {
  private renderer: ScreenSurfaceRenderer
  private data: NormalizedScreenData
  private sectionIndex = 0
  private slideIndex = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private slideStartedAt = 0
  private lastProgressRender = 0
  private isRunning = false
  private isVisible = true

  constructor(mesh: THREE.Mesh, rawData: unknown, resolution = { width: 1920, height: 1080 }) {
    this.renderer = new ScreenSurfaceRenderer(mesh, resolution.width, resolution.height)
    this.data = ScreenDataAdapter.normalize(rawData)
  }

  public initialize(): void {
    this.render()
  }

  public start(): void {
    this.isRunning = true
    this.scheduleNextSlide()
  }

  public pause(): void {
    this.isRunning = false
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
  }

  public resume(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.scheduleNextSlide()
  }

  public setVisible(visible: boolean): void {
    if (this.isVisible === visible) return
    this.isVisible = visible
    if (visible) {
      this.render()
      this.resume()
    } else {
      this.pause()
    }
  }

  public updateProgress(_nowMs: number): void {
    if (!this.isVisible || !this.isRunning) return
    const nowMs = performance.now()
    if (nowMs - this.lastProgressRender < 120) return
    this.lastProgressRender = nowMs
    const duration = this.getCurrentSlide().duration
    const progress = Math.min(1, Math.max(0, (nowMs - this.slideStartedAt) / duration))
    ScreenCanvasRenderer.render(this.renderer.ctx, {
      data: this.data,
      sectionIndex: this.sectionIndex,
      slideIndex: this.slideIndex,
      progress,
      isAutoplayOn: this.isRunning,
      isPaused: !this.isRunning,
    })
    this.renderer.markNeedsUpdate()
  }

  public getMesh(): THREE.Mesh {
    return this.renderer.mesh
  }

  public getSourceMesh(): THREE.Mesh {
    return this.renderer.sourceMesh
  }

  public dispose(): void {
    this.pause()
    this.renderer.dispose()
  }

  public nextSlide(): void {
    const currentSection = this.data.sections[this.sectionIndex] ?? this.data.sections[0]
    if (!currentSection) return

    if (this.slideIndex + 1 < currentSection.slides.length) {
      this.slideIndex += 1
    } else {
      this.sectionIndex = (this.sectionIndex + 1) % this.data.sections.length
      this.slideIndex = 0
    }

    this.render()
    if (this.isRunning) {
      this.scheduleNextSlide()
    }
  }

  public prevSlide(): void {
    const currentSection = this.data.sections[this.sectionIndex] ?? this.data.sections[0]
    if (!currentSection) return

    if (this.slideIndex > 0) {
      this.slideIndex -= 1
    } else {
      this.sectionIndex = (this.sectionIndex - 1 + this.data.sections.length) % this.data.sections.length
      const prevSection = this.data.sections[this.sectionIndex]
      this.slideIndex = Math.max(0, (prevSection?.slides.length ?? 1) - 1)
    }

    this.render()
    if (this.isRunning) {
      this.scheduleNextSlide()
    }
  }

  public nextSection(): void {
    if (this.data.sections.length <= 1) return
    this.sectionIndex = (this.sectionIndex + 1) % this.data.sections.length
    this.slideIndex = 0
    this.render()
    if (this.isRunning) {
      this.scheduleNextSlide()
    }
  }

  public prevSection(): void {
    if (this.data.sections.length <= 1) return
    this.sectionIndex = (this.sectionIndex - 1 + this.data.sections.length) % this.data.sections.length
    this.slideIndex = 0
    this.render()
    if (this.isRunning) {
      this.scheduleNextSlide()
    }
  }

  private getCurrentSlide() {
    const currentSection = this.data.sections[this.sectionIndex] ?? this.data.sections[0]
    return currentSection?.slides[this.slideIndex] ?? currentSection?.slides[0] ?? { duration: 8000 }
  }

  private render(): void {
    this.slideStartedAt = performance.now()
    this.lastProgressRender = 0
    ScreenCanvasRenderer.render(this.renderer.ctx, {
      data: this.data,
      sectionIndex: this.sectionIndex,
      slideIndex: this.slideIndex,
      progress: 0,
      isAutoplayOn: this.isRunning,
      isPaused: !this.isRunning,
    })
    this.renderer.markNeedsUpdate()
  }

  private scheduleNextSlide(): void {
    if (!this.isRunning || this.data.sections.length === 0) return
    if (this.timer) clearTimeout(this.timer)
    const duration = this.getCurrentSlide().duration || 8000
    this.timer = setTimeout(() => {
      this.nextSlide()
    }, duration)
  }
}
