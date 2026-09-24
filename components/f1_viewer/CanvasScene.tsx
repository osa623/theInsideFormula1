"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense } from "react";

import CameraRig from "./CameraRig";
import CarControls from "./CarControls";
import CarModel from "./CarModel";
import EnvironmentMap from "./EnvironmentMap";
import GarageEnvironment from "./GarageEnvironment";
import InfoPanel from "./InfoPanel";
import Lights from "./Lights";
import ShowcaseMode from "./ShowcaseMode";

import { Vehicle, VehicleProvider, FollowCamera } from "./Vehicle";
import { useCarStore } from "@/hooks/useCarStore";

function SceneContent() {
  const isLowPowerMode = useCarStore((state) => state.isLowPowerMode);

  return (
    <>
      <GarageEnvironment />
      <EnvironmentMap />
      <Lights />

      {/* Vehicle wraps the CarModel — handles position/rotation for driving */}
      <Vehicle>
        <CarModel />
      </Vehicle>

      {/* Camera systems */}
      <CameraRig />
      <FollowCamera />

      {/* Post-processing Bloom for glowing emissive part highlights */}
      {!isLowPowerMode && (
        <EffectComposer enableNormalPass={false}>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      )}
    </>
  );
}

export default function CanvasScene() {
  const resetView = useCarStore((state) => state.resetView);
  const isLowPowerMode = useCarStore((state) => state.isLowPowerMode);

  return (
    <VehicleProvider>
      <div className="relative h-screen w-full overflow-hidden bg-background">
        {/* Dynamic HUD Overlays */}
        <InfoPanel />
        <CarControls />
        <ShowcaseMode />

        {/* R3F 3D Canvas */}
        <Canvas
          shadows={!isLowPowerMode}
          dpr={isLowPowerMode ? 1 : [1, 2]}
          camera={{ position: [-4.5, -1.3, 3.2], fov: 45 }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              resetView();
            }
          }}
        >
          <Suspense fallback={null}>
            <SceneContent />
          </Suspense>
        </Canvas>
      </div>
    </VehicleProvider>
  );
}