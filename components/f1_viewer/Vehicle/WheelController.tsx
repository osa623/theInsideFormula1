"use client";

import { useFrame } from "@react-three/fiber";
import { useVehicle } from "./VehicleContext";
import * as THREE from "three";
import { useEffect, useRef } from "react";

interface WheelTarget {
  mesh: THREE.Object3D;
  isFront: boolean;
  isLeft: boolean;
}

const WHEEL_SPIN_FACTOR = 60;
const STEER_DAMP_SPEED = 20;

export default function WheelController() {
  const { vehicleRef, vehicleData, mode } = useVehicle();
  const wheelTargetsRef = useRef<WheelTarget[]>([]);
  const pivotsMapRef = useRef<Map<string, THREE.Group>>(new Map());

  useEffect(() => {
    if (!vehicleRef.current) return;

    const detected: WheelTarget[] = [];

    vehicleRef.current.traverse((child) => {
      // Match ONLY the 4 main parent wheel group nodes in formula_car.glb
      // This ensures both tyre sub-mesh and rim sub-mesh remain together inside the parent group!
      const name = child.name;

      const isLF = name === "WHEEL_LF_60";
      const isRF = name === "WHEEL_RF_45";
      const isLR = name === "WHEEL_LR_117";
      const isRR = name === "WHEEL_RR_96";

      if (isLF || isRF || isLR || isRR) {
        const isFront = isLF || isRF;
        const isLeft = isLF || isLR;

        detected.push({
          mesh: child,
          isFront,
          isLeft,
        });
      }
    });

    // Create pivot groups for front wheels once
    detected.forEach(({ mesh, isFront, isLeft }) => {
      if (isFront && mesh.parent && !pivotsMapRef.current.has(mesh.uuid)) {
        const parent = mesh.parent;

        // Create pivot group at wheel's current local position
        const pivot = new THREE.Group();
        pivot.name = isLeft ? "STEER_PIVOT_LF" : "STEER_PIVOT_RF";
        pivot.position.copy(mesh.position);

        // Place wheel inside pivot at local origin
        mesh.position.set(0, 0, 0);

        parent.add(pivot);
        pivot.add(mesh);

        pivotsMapRef.current.set(mesh.uuid, pivot);
      }
    });

    wheelTargetsRef.current = detected;
  }, [vehicleRef, mode]);

  useFrame((_, delta) => {
    if (mode !== "driving" || !vehicleRef.current) return;

    const dt = Math.min(delta, 0.1);
    const speed = vehicleData.current.speed;
    const steering = vehicleData.current.steering ?? 0;

    wheelTargetsRef.current.forEach(({ mesh, isFront }) => {
      // 1. Steering rotation for front wheels
      if (isFront) {
        const pivot = pivotsMapRef.current.get(mesh.uuid);
        if (pivot) {
          pivot.rotation.y = THREE.MathUtils.damp(
            pivot.rotation.y,
            steering,
            STEER_DAMP_SPEED,
            dt
          );
        }
      }

      // 2. Wheel spinning on pitch axis (X-axis) according to speed
      mesh.rotation.x += speed * dt * WHEEL_SPIN_FACTOR;
    });
  });

  return null;
}