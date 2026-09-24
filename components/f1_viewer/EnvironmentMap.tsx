"use client";

import { Environment, ContactShadows } from "@react-three/drei";

export default function EnvironmentMap() {
  return (
    <>
      <Environment preset="city" environmentIntensity={0.9} />
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.7}
        scale={100}
        blur={2}
        far={4}
      />
    </>
  );
}