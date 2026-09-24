"use client";

import { useFrame, useThree } from "@react-three/fiber";

export default function CameraDebugger() {
  const { camera } = useThree();

  useFrame(() => {
    console.clear();

    console.log("Position:", [
      Number(camera.position.x.toFixed(2)),
      Number(camera.position.y.toFixed(2)),
      Number(camera.position.z.toFixed(2)),
    ]);

    console.log("Target:", camera.rotation);
  });

  return null;
}