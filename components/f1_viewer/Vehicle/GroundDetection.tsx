"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useVehicle } from "./VehicleContext";

const downVector = new THREE.Vector3(0, -1, 0);

export default function GroundDetection() {
  const { vehicleRef, vehicleData } = useVehicle();
  const raycaster = new THREE.Raycaster();
  const normalMatrix = new THREE.Matrix3();

  useFrame((state, delta) => {
    if (!vehicleRef.current) return;

    const dt = Math.min(delta, 0.1);
    const carPos = vehicleRef.current.position;

    // Cast ray from HIGH above the car straight down
    // This ensures we always hit the TOP surface of the road, never the underside
    const origin = new THREE.Vector3(carPos.x, carPos.y + 50, carPos.z);
    raycaster.set(origin, downVector);
    raycaster.far = 200;

    // Get ALL objects in the scene except the car itself
    const scene = vehicleRef.current.parent;
    if (!scene) return;

    const targets: THREE.Object3D[] = [];
    scene.traverse((child) => {
      // Skip the car group and all its descendants
      if (child === vehicleRef.current) return;
      let isCarChild = false;
      let parent = child.parent;
      while (parent) {
        if (parent === vehicleRef.current) { isCarChild = true; break; }
        parent = parent.parent;
      }
      if (isCarChild) return;

      if ((child as THREE.Mesh).isMesh) {
        targets.push(child);
      }
    });

    const hits = raycaster.intersectObjects(targets, false);

    // Find the highest upward-facing surface that is at or below the ray origin
    let bestY: number | null = null;

    for (let i = 0; i < hits.length; i++) {
      const hit = hits[i];
      if (!hit.face) continue;

      normalMatrix.getNormalMatrix(hit.object.matrixWorld);
      const worldNormal = hit.face.normal.clone().applyMatrix3(normalMatrix).normalize();

      // Only accept upward-facing surfaces (road, not walls/ceilings)
      if (worldNormal.y > 0.3) {
        // The FIRST valid upward-facing hit from above is the road surface
        bestY = hit.point.y;
        break;
      }
    }

    if (bestY !== null) {
      // Place car on road surface (small offset so wheels sit ON the asphalt)
      const targetY = bestY + 0.05;
      carPos.y = THREE.MathUtils.damp(carPos.y, targetY, 12, dt);

      if (vehicleData.current) {
        vehicleData.current.groundY = targetY;
      }
    }
  });

  return null;
}