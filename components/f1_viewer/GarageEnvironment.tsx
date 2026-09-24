"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useVehicle } from "./Vehicle/VehicleContext";

// Safety margin from circular hall wall (car length ~5.5m, half-length ~2.8m + safety clearance)
const CAR_SAFE_MARGIN = 4.2;

export default function GarageEnvironment() {
  const { scene } = useGLTF("/models/garage_environment.glbs");
  const { mode, vehicleRef, vehicleData } = useVehicle();

  const boundsRef = useRef<{
    maxRadius: number;
    hasGlassHall: boolean;
    glassHallObject: THREE.Object3D | null;
  }>({
    maxRadius: 14.0,
    hasGlassHall: false,
    glassHallObject: null,
  });

  const raycasterRef = useRef(new THREE.Raycaster());

  // Analyze environment scene once GLB is loaded
  useEffect(() => {
    // Force matrixWorld calculation so setFromObject gets true world coordinates
    scene.updateMatrixWorld(true);

    let floorObj: THREE.Object3D | null = null;
    let glassHallObj: THREE.Object3D | null = null;

    scene.traverse((child) => {
      const nameLower = child.name.toLowerCase();
      if (nameLower === "floor" || nameLower.includes("floor")) {
        if (!floorObj || child instanceof THREE.Mesh) {
          floorObj = child;
        }
      }
      if (nameLower === "glass_hall" || nameLower.includes("glass_hall")) {
        if (!glassHallObj || child instanceof THREE.Mesh) {
          glassHallObj = child;
        }
      }
    });

    const targetObj = glassHallObj || floorObj || scene;
    const box = new THREE.Box3().setFromObject(targetObj);
    const hallWidthX = (box.max.x - box.min.x) / 2;
    const hallDepthZ = (box.max.z - box.min.z) / 2;

    const rawRadius = Math.min(hallWidthX, hallDepthZ);
    // Max radius for car center so front/rear wing never pokes outside circular glass wall
    const maxRadius = Math.max(6.0, rawRadius - CAR_SAFE_MARGIN);

    boundsRef.current = {
      maxRadius,
      hasGlassHall: !!glassHallObj,
      glassHallObject: glassHallObj,
    };
  }, [scene]);

  // Per-frame floor snapping & circular boundary enforcement during driving mode
  useFrame(() => {
    if (mode !== "driving" || !vehicleRef.current) return;

    const { maxRadius, hasGlassHall, glassHallObject } = boundsRef.current;
    const pos = vehicleRef.current.position;
    const speed = vehicleData.current.speed;

    // Keep vehicleRef position Y at 0 so car primitive at Y = -2.5 rests flush on garage floor
    pos.y = 0;

    let hitBoundary = false;

    // 1. Circular / Radial Distance Clamping from room center (0,0)
    const currentDist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
    if (currentDist > maxRadius) {
      const scale = maxRadius / currentDist;
      pos.x *= scale;
      pos.z *= scale;
      hitBoundary = true;
    }

    // 2. Dual Raycast Probe (Front Nose & Rear Wing) against Glass_Hall mesh
    if (hasGlassHall && glassHallObject && Math.abs(speed) > 0.001) {
      const raycaster = raycasterRef.current;
      const rotY = vehicleData.current.rotationY;

      // Direction of travel (forward when speed > 0, backward when speed < 0)
      const moveDir = new THREE.Vector3(0, 0, speed >= 0 ? 1 : -1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        rotY
      );

      // Probe origin at front nose (when forward) or rear wing (when reverse)
      const probeOffsetZ = speed >= 0 ? 2.5 : -2.5;
      const probeOffset = new THREE.Vector3(0, 0, probeOffsetZ).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        rotY
      );

      const probeOrigin = pos.clone().add(probeOffset).add(new THREE.Vector3(0, -2.0, 0));
      raycaster.set(probeOrigin, moveDir);
      raycaster.far = 1.8;

      const hits = raycaster.intersectObject(glassHallObject, true);
      if (hits.length > 0) {
        hitBoundary = true;
      }
    }

    // Stop car on reaching boundary
    if (hitBoundary) {
      vehicleData.current.speed = 0;
    }
  });

  return <primitive object={scene} position={[0, 0, 0]} scale={1} />;
}

useGLTF.preload("/models/garage_environment.glb");
