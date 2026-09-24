import * as THREE from 'three'
import { EXHIBITION_SCREEN_CONFIG } from './ScreenConfig'

export interface ScreenGeometryInfo {
  objectName: string
  mesh: THREE.Mesh
  localBounds: THREE.Box3
  worldBounds: THREE.Box3
  center: THREE.Vector3
  width: number
  height: number
  aspectRatio: number
  normal: THREE.Vector3
}

export class ScreenGeometryService {
  private static screenInfoMap = new Map<string, ScreenGeometryInfo>()

  private static normalizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  }

  private static stripNonAlphanumeric(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  private static screenNameAliases(target: string): string[] {
    const rawTarget = target.toLowerCase()
    const normalized = this.normalizeName(target)
    const stripped = this.stripNonAlphanumeric(target)
    const sanitized = THREE.PropertyBinding.sanitizeNodeName(target).toLowerCase()

    const aliases = new Set([
      rawTarget,
      normalized,
      stripped,
      sanitized,
      this.normalizeName(sanitized),
    ])

    if (normalized.endsWith('_1')) {
      aliases.add(normalized.replace(/_1$/, '_001'))
      aliases.add(normalized.replace(/_1$/, '001'))
      aliases.add(normalized.replace(/_1$/, '1'))
    }

    if (stripped.endsWith('1')) {
      aliases.add(stripped.replace(/1$/, '001'))
    }

    return [...aliases]
  }

  public static isScreenNameMatch(objOrName: THREE.Object3D | string, target: string): boolean {
    const aliases = this.screenNameAliases(target)
    const candidates: string[] = []

    if (typeof objOrName === 'string') {
      candidates.push(objOrName)
    } else if (objOrName) {
      if (objOrName.name) candidates.push(objOrName.name)
      const userDataName = (objOrName as any).userData?.name
      if (userDataName && typeof userDataName === 'string') {
        candidates.push(userDataName)
      }
    }

    for (const name of candidates) {
      const raw = name.toLowerCase()
      const normalized = this.normalizeName(name)
      const stripped = this.stripNonAlphanumeric(name)
      const sanitized = THREE.PropertyBinding.sanitizeNodeName(name).toLowerCase()

      if (
        aliases.includes(raw) ||
        aliases.includes(normalized) ||
        aliases.includes(stripped) ||
        aliases.includes(sanitized)
      ) {
        return true
      }
    }

    return false
  }

  /**
   * Discovers and validates all configured screen meshes in the GLTF scene.
   */
  public static discoverScreens(scene: THREE.Object3D): Map<string, THREE.Mesh> {
    const screens = new Map<string, THREE.Mesh>()
    const targetNames = [
      EXHIBITION_SCREEN_CONFIG.inside1.objectName,
      EXHIBITION_SCREEN_CONFIG.inside2.objectName,
      EXHIBITION_SCREEN_CONFIG.big1.objectName,
      EXHIBITION_SCREEN_CONFIG.big2.objectName,
      EXHIBITION_SCREEN_CONFIG.computer.objectName,
      EXHIBITION_SCREEN_CONFIG.tyreTech.objectName,
      EXHIBITION_SCREEN_CONFIG.chassisTech.objectName,
      EXHIBITION_SCREEN_CONFIG.formulaTech.objectName,
      EXHIBITION_SCREEN_CONFIG.trackTech.objectName,
    ]

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        for (const target of targetNames) {
          if (this.isScreenNameMatch(child, target)) {
            screens.set(target, child)
            if (child.name && child.name !== target) {
              screens.set(child.name, child)
            }
          }
        }
      }
    })

    // Fallback if not direct mesh (e.g. node group containing mesh)
    for (const target of targetNames) {
      if (!screens.has(target)) {
        let obj = scene.getObjectByName(target) ?? null
        if (!obj) {
          const sanitizedTarget = THREE.PropertyBinding.sanitizeNodeName(target)
          obj = scene.getObjectByName(sanitizedTarget) ?? null
        }
        if (!obj) {
          scene.traverse((child) => {
            if (!obj && this.isScreenNameMatch(child, target)) {
              obj = child
            }
          })
        }
        if (obj) {
          if (obj instanceof THREE.Mesh) {
            screens.set(target, obj)
            if (obj.name && obj.name !== target) {
              screens.set(obj.name, obj)
            }
          } else {
            obj.traverse((c) => {
              if (!screens.has(target) && c instanceof THREE.Mesh) {
                screens.set(target, c)
                if (c.name && c.name !== target) {
                  screens.set(c.name, c)
                }
              }
            })
          }
        }
      }
    }

    // Verify and log all screens
    for (const target of targetNames) {
      if (screens.has(target)) {
        console.log(`[ScreenSystem] Found ${target} -> mesh: ${screens.get(target)?.name}`)
      } else {
        console.warn(`[ScreenSystem] Blender object not found: ${target}`)
      }
    }

    return screens
  }

  /**
   * Ensures the mesh geometry has valid planar UV coordinates so that CanvasTextures map properly.
   */
  public static ensurePlanarUVs(mesh: THREE.Mesh): void {
    const geometry = mesh.geometry
    if (!geometry || !geometry.attributes.position) return

    // Only skip if already generated with corrected planar UVs (version 4)
    if ((geometry as any)._planarUVsGenerated === 4) {
      return
    }

    const posAttr = geometry.attributes.position
    const count = posAttr.count
    const name = mesh.name.toLowerCase()

    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    let minZ = Infinity, maxZ = -Infinity

    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const z = posAttr.getZ(i)
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      if (z < minZ) minZ = z
      if (z > maxZ) maxZ = z
    }

    const rangeX = maxX - minX || 1.0
    const rangeY = maxY - minY || 1.0
    const rangeZ = maxZ - minZ || 1.0

    const uvs = new Float32Array(count * 2)

    if (name.includes('computer_screen') || name.includes('cube_screen') || name.includes('screen02')) {
      // Computer_Screen (Cube_Screen_0.001): plane lies in X-Z with normal -Y.
      for (let i = 0; i < count; i++) {
        const x = posAttr.getX(i)
        const z = posAttr.getZ(i)
        const u = (x - minX) / rangeX
        const v = (z - minZ) / rangeZ
        uvs[i * 2] = u
        uvs[i * 2 + 1] = v
      }
    } else {
      // All quad display screens (Big screens, inside screens, and extra screens)
      for (let i = 0; i < count; i++) {
        const x = posAttr.getX(i)
        const z = posAttr.getZ(i)
        const u = (maxZ - z) / rangeZ
        const v = 1.0 - (x - minX) / rangeX
        uvs[i * 2] = u
        uvs[i * 2 + 1] = v
      }
    }

    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geometry.attributes.uv.needsUpdate = true
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    ;(geometry as any)._planarUVsGenerated = 4
  }

  /**
   * Measures authoritative dimensions, bounds, and aspect ratio of a screen mesh.
   */
  public static measureScreen(object: THREE.Mesh): ScreenGeometryInfo {
    this.ensurePlanarUVs(object)

    object.updateMatrixWorld(true)

    const localBounds = new THREE.Box3()
    if (object.geometry) {
      object.geometry.computeBoundingBox()
      if (object.geometry.boundingBox) {
        localBounds.copy(object.geometry.boundingBox)
      }
    }

    const worldBounds = new THREE.Box3().setFromObject(object)
    const center = worldBounds.getCenter(new THREE.Vector3())

    // Scaled dimensions
    const scale = new THREE.Vector3()
    object.getWorldScale(scale)

    const localSize = localBounds.getSize(new THREE.Vector3())
    // Screen width is along local Z (scale.z * localSize.z)
    // Screen height is along local X (scale.x * localSize.x)
    const width = Math.max(localSize.z * scale.z, worldBounds.getSize(new THREE.Vector3()).x)
    const height = Math.max(localSize.x * scale.x, worldBounds.getSize(new THREE.Vector3()).y)
    const aspectRatio = width / (height || 1.0)

    // Compute surface normal
    const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(object.getWorldQuaternion(new THREE.Quaternion())).normalize()

    const info: ScreenGeometryInfo = {
      objectName: object.name,
      mesh: object,
      localBounds,
      worldBounds,
      center,
      width,
      height,
      aspectRatio,
      normal,
    }

    this.screenInfoMap.set(object.name, info)
    return info
  }

  public static getScreenBounds(object: THREE.Mesh): THREE.Box3 {
    const info = this.screenInfoMap.get(object.name)
    return info ? info.worldBounds : new THREE.Box3().setFromObject(object)
  }

  public static getScreenAspect(object: THREE.Mesh): number {
    const info = this.screenInfoMap.get(object.name)
    return info ? info.aspectRatio : 16 / 9
  }

  public static getScreenCenter(object: THREE.Mesh): THREE.Vector3 {
    const info = this.screenInfoMap.get(object.name)
    return info ? info.center.clone() : object.getWorldPosition(new THREE.Vector3())
  }
}
