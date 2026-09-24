import * as THREE from 'three'
import {
  BigScreen1Controller,
  BigScreen2Controller,
  InsideScreen1Controller,
  InsideScreen2Controller,
} from './ScreenControllers'
import { EXHIBITION_SCREEN_CONFIG } from './ScreenConfig'
import { ScreenGeometryService } from './ScreenGeometryService'
import { InformationScreenController } from './information/InformationScreenController'
import tyresData from '@/data/f1/tyres.json'
import chassisData from '@/data/f1/chassis.json'
import formulaData from '@/data/f1/formula.json'
import tracksData from '@/data/f1/tracks.json'

export class ScreenTimelineController {
  public static instance: ScreenTimelineController | null = null

  private inside1Controller?: InsideScreen1Controller
  private inside2Controller?: InsideScreen2Controller
  private big1Controller?: BigScreen1Controller
  private big2Controller?: BigScreen2Controller
  private informationControllers: InformationScreenController[] = []
  private infoControllerMap = new Map<string, InformationScreenController>()

  private frustum = new THREE.Frustum()
  private projScreenMatrix = new THREE.Matrix4()

  private lastCheckTime = 0

  public static requiredScreenNames(): string[] {
    return [
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
  }

  public initialize(screenMeshes: Map<string, THREE.Mesh>): void {
    ScreenTimelineController.instance = this
    this.infoControllerMap.clear()

    const findMesh = (targetName: string): THREE.Mesh | undefined => {
      const sanitized = THREE.PropertyBinding.sanitizeNodeName(targetName)
      return (
        screenMeshes.get(targetName) ||
        screenMeshes.get(sanitized) ||
        [...screenMeshes.values()].find((m) => ScreenGeometryService.isScreenNameMatch(m, targetName))
      )
    }

    const inside1Mesh = findMesh(EXHIBITION_SCREEN_CONFIG.inside1.objectName)
    if (inside1Mesh) {
      this.inside1Controller = new InsideScreen1Controller(inside1Mesh)
      this.inside1Controller.initialize()
      this.inside1Controller.start()
    }

    const inside2Mesh = findMesh(EXHIBITION_SCREEN_CONFIG.inside2.objectName)
    if (inside2Mesh) {
      this.inside2Controller = new InsideScreen2Controller(inside2Mesh)
      this.inside2Controller.initialize()
      this.inside2Controller.start()
    }

    const big1Mesh = findMesh(EXHIBITION_SCREEN_CONFIG.big1.objectName)
    if (big1Mesh) {
      this.big1Controller = new BigScreen1Controller(big1Mesh)
      this.big1Controller.initialize()
      this.big1Controller.start()
    }

    const big2Mesh = findMesh(EXHIBITION_SCREEN_CONFIG.big2.objectName)
    if (big2Mesh) {
      this.big2Controller = new BigScreen2Controller(big2Mesh)
      this.big2Controller.initialize()
      this.big2Controller.start()
    }

    const informationScreens = [
      { id: 'tyreTech', config: EXHIBITION_SCREEN_CONFIG.tyreTech, data: tyresData },
      { id: 'chassisTech', config: EXHIBITION_SCREEN_CONFIG.chassisTech, data: chassisData },
      { id: 'formulaTech', config: EXHIBITION_SCREEN_CONFIG.formulaTech, data: formulaData },
      { id: 'trackTech', config: EXHIBITION_SCREEN_CONFIG.trackTech, data: tracksData },
    ]

    informationScreens.forEach(({ id, config, data }) => {
      const mesh = findMesh(config.objectName)
      if (!mesh) {
        console.warn(`[ScreenSystem] Information screen mesh missing: ${config.objectName}`)
        return
      }
      const controller = new InformationScreenController(mesh, data, config.resolution)
      controller.initialize()
      this.informationControllers.push(controller)
      this.infoControllerMap.set(id, controller)
      this.infoControllerMap.set(config.objectName, controller)
      this.infoControllerMap.set(THREE.PropertyBinding.sanitizeNodeName(config.objectName), controller)
      setTimeout(() => controller.start(), config.staggerDelayMs)
    })
  }

  public getInformationController(screenId: string): InformationScreenController | undefined {
    return this.infoControllerMap.get(screenId)
  }

  public nextSlide(screenId?: string): void {
    if (screenId) {
      const ctrl = this.getInformationController(screenId)
      ctrl?.nextSlide()
    } else {
      this.informationControllers.forEach((c) => c.nextSlide())
    }
  }

  public prevSlide(screenId?: string): void {
    if (screenId) {
      const ctrl = this.getInformationController(screenId)
      ctrl?.prevSlide()
    } else {
      this.informationControllers.forEach((c) => c.prevSlide())
    }
  }

  public nextSection(screenId?: string): void {
    if (screenId) {
      const ctrl = this.getInformationController(screenId)
      ctrl?.nextSection()
    } else {
      this.informationControllers.forEach((c) => c.nextSection())
    }
  }

  public prevSection(screenId?: string): void {
    if (screenId) {
      const ctrl = this.getInformationController(screenId)
      ctrl?.prevSection()
    } else {
      this.informationControllers.forEach((c) => c.prevSection())
    }
  }

  public updateVisibility(camera: THREE.Camera, nowMs: number): void {
    // Throttle check to ~8 Hz (every 125ms)
    if (nowMs - this.lastCheckTime < 125) return
    this.lastCheckTime = nowMs

    this.projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix)

    const camPos = camera.position

    const checkMesh = (mesh?: THREE.Mesh, maxDist = 80.0): boolean => {
      if (!mesh) return false
      const meshPos = mesh.getWorldPosition(new THREE.Vector3())
      const dist = camPos.distanceTo(meshPos)
      if (dist > maxDist) return false
      if (dist < 25.0) return true
      if (mesh.geometry?.boundingSphere) {
        const sphere = mesh.geometry.boundingSphere.clone().applyMatrix4(mesh.matrixWorld)
        return this.frustum.intersectsSphere(sphere)
      }
      return this.frustum.containsPoint(meshPos)
    }

    if (this.inside1Controller) {
      const visible = checkMesh(this.inside1Controller['renderer'].mesh, EXHIBITION_SCREEN_CONFIG.inside1.maxViewDistance)
      this.inside1Controller.setVisible(visible)
    }

    if (this.inside2Controller) {
      const visible = checkMesh(this.inside2Controller['renderer'].mesh, EXHIBITION_SCREEN_CONFIG.inside2.maxViewDistance)
      this.inside2Controller.setVisible(visible)
    }

    if (this.big1Controller) {
      const visible = checkMesh(this.big1Controller['renderer'].mesh, EXHIBITION_SCREEN_CONFIG.big1.maxViewDistance)
      this.big1Controller.setVisible(visible)
    }

    if (this.big2Controller) {
      const visible = checkMesh(this.big2Controller['renderer'].mesh, EXHIBITION_SCREEN_CONFIG.big2.maxViewDistance)
      this.big2Controller.setVisible(visible)
    }

    const infoConfigs = [
      EXHIBITION_SCREEN_CONFIG.tyreTech,
      EXHIBITION_SCREEN_CONFIG.chassisTech,
      EXHIBITION_SCREEN_CONFIG.formulaTech,
      EXHIBITION_SCREEN_CONFIG.trackTech,
    ]

    this.informationControllers.forEach((controller, index) => {
      const visible = checkMesh(controller.getMesh(), infoConfigs[index]?.maxViewDistance ?? 80)
      controller.setVisible(visible)
    })
  }

  public updateProgress(nowMs: number): void {
    this.informationControllers.forEach((controller) => controller.updateProgress(nowMs))
  }

  public updateData(): void {
    this.inside1Controller?.updateData()
    this.inside2Controller?.updateData()
    this.big1Controller?.updateData()
    this.big2Controller?.updateData()
  }

  public dispose(): void {
    if (ScreenTimelineController.instance === this) {
      ScreenTimelineController.instance = null
    }
    this.infoControllerMap.clear()
    this.inside1Controller?.dispose()
    this.inside2Controller?.dispose()
    this.big1Controller?.dispose()
    this.big2Controller?.dispose()
    this.informationControllers.forEach((controller) => controller.dispose())
    this.informationControllers = []
  }
}
