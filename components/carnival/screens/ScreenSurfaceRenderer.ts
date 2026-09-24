import * as THREE from 'three'
import { ScreenGeometryService } from './ScreenGeometryService'

export class ScreenSurfaceRenderer {
  public readonly canvas: HTMLCanvasElement
  public readonly ctx: CanvasRenderingContext2D
  public readonly texture: THREE.CanvasTexture
  public readonly material: THREE.MeshBasicMaterial
  public readonly mesh: THREE.Mesh
  public readonly sourceMesh: THREE.Mesh

  private originalMaterial: THREE.Material | THREE.Material[]
  private overlayMesh: THREE.Mesh | null = null

  constructor(
    mesh: THREE.Mesh,
    width: number,
    height: number,
    options: { overlayPlane?: boolean; transparentCanvas?: boolean } = {}
  ) {
    this.sourceMesh = mesh
    this.originalMaterial = mesh.material

    // Ensure mesh has correct UVs mapped
    ScreenGeometryService.ensurePlanarUVs(mesh)

    // Create offscreen canvas
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height

    const context = this.canvas.getContext('2d', { alpha: !!options.transparentCanvas })
    if (!context) {
      throw new Error(`[ScreenSurfaceRenderer] Failed to get 2D context for ${mesh.name}`)
    }
    this.ctx = context

    // Paint initial dark background
    if (options.transparentCanvas) {
      this.ctx.clearRect(0, 0, width, height)
    } else {
      this.ctx.fillStyle = '#0b0d10'
      this.ctx.fillRect(0, 0, width, height)
    }

    // Create CanvasTexture optimized to prevent GPU stall and context loss
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.minFilter = THREE.LinearFilter
    this.texture.magFilter = THREE.LinearFilter
    this.texture.generateMipmaps = false

    // Attach native material to the mesh
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: !!options.transparentCanvas,
      alphaTest: options.transparentCanvas ? 0.04 : 0,
      depthTest: true,
      depthWrite: !options.overlayPlane,
      side: THREE.DoubleSide,
      toneMapped: false,
      polygonOffset: !!options.overlayPlane,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })

    if (options.overlayPlane) {
      mesh.geometry.computeBoundingBox()
      const bounds = mesh.geometry.boundingBox
      const size = bounds?.getSize(new THREE.Vector3()) ?? new THREE.Vector3(2, 2, 0)
      const center = bounds?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3()
      const overlay = new THREE.Mesh(
        new THREE.PlaneGeometry(Math.max(size.x, 0.001), Math.max(size.y, 0.001)),
        this.material
      )
      overlay.name = `${mesh.name}_CanvasOverlay`
      overlay.position.copy(mesh.position)
      overlay.position.add(center.applyQuaternion(mesh.quaternion))
      overlay.quaternion.copy(mesh.quaternion)
      overlay.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)))
      overlay.position.add(new THREE.Vector3(0, 0, -0.05).applyQuaternion(mesh.quaternion))
      overlay.scale.set(Math.max(Math.abs(mesh.scale.x), 0.001), Math.max(Math.abs(mesh.scale.y), 0.001), 1)
      overlay.renderOrder = 20
      overlay.frustumCulled = false
      if (mesh.parent) {
        mesh.parent.add(overlay)
      } else {
        mesh.add(overlay)
      }
      this.overlayMesh = overlay
      this.mesh = overlay
    } else {
      mesh.material = this.material
      mesh.material.needsUpdate = true
      this.mesh = mesh
    }
  }

  public markNeedsUpdate(): void {
    this.texture.needsUpdate = true
  }

  public setDisplayVisible(_visible: boolean): void {
    this.mesh.visible = true
  }

  public dispose(): void {
    if (this.overlayMesh) {
      this.overlayMesh.parent?.remove(this.overlayMesh)
      this.overlayMesh.geometry.dispose()
      this.overlayMesh = null
    } else {
      this.mesh.material = this.originalMaterial
    }
    this.material.dispose()
    this.texture.dispose()
  }
}
