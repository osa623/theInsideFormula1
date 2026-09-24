"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { findCarPartByMeshName } from "@/data/carParts";
import { useCarStore } from "@/hooks/useCarStore";
import { useVehicle } from "./Vehicle/VehicleContext";

interface MeshMetadata {
  mesh: THREE.Mesh;
  originalPosition: THREE.Vector3;
  originalMaterial: THREE.Material | THREE.Material[];
  partId: string;
  explodeVector: THREE.Vector3;
}

export default function CarModel() {
  const { scene } = useGLTF("/models/2026_Model.glb");

  const meshMapRef = useRef<Map<string, MeshMetadata>>(new Map());

  const selectedPart = useCarStore((state) => state.selectedPart);
  const hoveredPart = useCarStore((state) => state.hoveredPart);
  const isExploded = useCarStore((state) => state.isExploded);
  const setSelectedPart = useCarStore((state) => state.setSelectedPart);
  const setHoveredPart = useCarStore((state) => state.setHoveredPart);

  const { mode } = useVehicle();
  const isDriving = mode === "driving";

  /*
   ANALYZE MODEL PARTS
  */
  useEffect(() => {
    const map = new Map<string, MeshMetadata>();

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const partData = findCarPartByMeshName(child.name);
        const originalPos = child.position.clone();

        map.set(child.uuid, {
          mesh: child,
          originalPosition: originalPos,
          originalMaterial: child.material,
          partId: partData.id,
          explodeVector: new THREE.Vector3(...partData.explodeVector),
        });

        child.userData.partId = partData.id;
      }
    });

    meshMapRef.current = map;
  }, [scene]);

  useEffect(() => {

  console.log("===== CAR MODEL HIERARCHY =====");

  scene.traverse((child) => {

    console.log(
      "Name:",
      child.name,
      "| Type:",
      child.type,
      "| UUID:",
      child.uuid,
      "| Parent:",
      child.parent?.name
    );

  });

  console.log("===== END MODEL HIERARCHY =====");


}, [scene]);

  /*
   EXPLODE ANIMATION
  */
  useFrame((_, delta) => {
    if (isDriving) return;

    const lerp = THREE.MathUtils.clamp(delta * 4, 0, 1);

    meshMapRef.current.forEach(({ mesh, originalPosition, explodeVector }) => {
      const target = isExploded
        ? originalPosition.clone().add(explodeVector)
        : originalPosition;

      mesh.position.lerp(target, lerp);
    });
  });

  const pointerHandlers = isDriving
    ? {}
    : {
        onPointerOver: (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          const obj = event.object;
          if (obj instanceof THREE.Mesh) {
            setHoveredPart(obj.name, obj.name);
          }
        },

        onPointerOut: (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          document.body.style.cursor = "default";
          setHoveredPart(null);
        },

        onClick: (event: ThreeEvent<MouseEvent>) => {
  event.stopPropagation();

  let obj = event.object;

  let partObject = obj;

  while (partObject.parent) {
    if (
      partObject.name &&
      !partObject.name.startsWith("Object_")
    ) {
      break;
    }

    partObject = partObject.parent;
  }


  setSelectedPart(
    partObject.name,
    partObject.name
  );
}
      };

  return (
    <primitive position={[0, -2.5 , 0]} object={scene} scale={2.0} {...pointerHandlers} />
  );
}

useGLTF.preload("/models/2026_Model.glb");