"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useCarStore } from "@/hooks/useCarStore";
import { useVehicle } from "./Vehicle/VehicleContext";

const DEFAULT_CAMERA_POS: [number, number, number] = [-4.5, -1.3, 3.2];
const DEFAULT_TARGET_POS: [number, number, number] = [0.2, -1.9, -0.2];

export default function CameraRig() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const selectedPart = useCarStore((state) => state.selectedPart);
  const isShowcaseActive = useCarStore((state) => state.isShowcaseActive);

  const { mode } = useVehicle();
  const isDriving = mode === "driving";

  // GSAP Camera Transition Effect — only in inspect mode
  useEffect(() => {
    if (isDriving) return;
    if (!controlsRef.current) return;

    const targetCameraPos: [number, number, number] = selectedPart
      ? [
          selectedPart.defaultOffset.cameraPosition[0],
          selectedPart.defaultOffset.cameraPosition[1] - 2.2,
          selectedPart.defaultOffset.cameraPosition[2],
        ]
      : DEFAULT_CAMERA_POS;

    const targetLookAt: [number, number, number] = selectedPart
      ? [
          selectedPart.defaultOffset.target[0],
          selectedPart.defaultOffset.target[1] - 2.2,
          selectedPart.defaultOffset.target[2],
        ]
      : DEFAULT_TARGET_POS;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controlsRef.current.target);

    // Animate Camera Position
    gsap.to(camera.position, {
      x: targetCameraPos[0],
      y: targetCameraPos[1],
      z: targetCameraPos[2],
      duration: 1.6,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(
          controlsRef.current?.target.x || 0,
          controlsRef.current?.target.y || 0,
          controlsRef.current?.target.z || 0
        );
      },
    });

    // Animate OrbitControls Target
    gsap.to(controlsRef.current.target, {
      x: targetLookAt[0],
      y: targetLookAt[1],
      z: targetLookAt[2],
      duration: 1.6,
      ease: "power3.inOut",
      onUpdate: () => {
        controlsRef.current?.update();
      },
    });
  }, [selectedPart, camera, isDriving]);

  // Disable OrbitControls when driving
  if (isDriving) {
    return null;
  }

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.05}
      autoRotate={!selectedPart && !isShowcaseActive}
      autoRotateSpeed={0.6}
      minDistance={3.0}
      maxDistance={12}
      maxPolarAngle={Math.PI / 2 + 0.05}
    />
  );
}
