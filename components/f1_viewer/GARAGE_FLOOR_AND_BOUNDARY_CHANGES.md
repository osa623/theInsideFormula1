# Garage Floor Placement, Circular Wall Boundaries, Default Camera View & Auto Showcase Documentation

This document details the exact changes made to position the F1 car flush on the floor of `garage_environment.glb`, configure the default low-angle front-wheel profile camera view, enable smooth component-level camera targeting for Auto Showcase mode, enforce circular hall boundary limits, and ensure the car resets to default level when switching to Inspect Mode.

---

## 1. Overview of Changes

- **Target Files**:
  - `components/f1_viewer/CameraRig.tsx`
  - `components/f1_viewer/CanvasScene.tsx`
  - `components/f1_viewer/GarageEnvironment.tsx`
  - `components/f1_viewer/CarControls.tsx`
  - `components/f1_viewer/Vehicle/VehicleContext.tsx`
  - `components/f1_viewer/Vehicle/FollowCamera.tsx`
- **Scope**: Exclusive to `components/f1_viewer/`. No changes were made to any files inside `simulation/`, nor to wheel turning/rotation logic in `WheelController.tsx` or `VehicleController.tsx`.
- **Goal**:
  1. Fix **Auto Showcase mode**: Adjusted GSAP camera target Y coordinates by `-2.2` in `CameraRig.tsx` so that auto showcase camera transitions focus precisely on each car component instead of empty space above the car.
  2. Set the dynamic low-angle front-left wheel profile view (`camera position: [-4.5, -1.3, 3.2]`, `target: [0.2, -1.9, -0.2]`) as the default starting and reset camera view.
  3. Prevent car front/rear wings from poking through the glass hall perimeter by using **Circular/Radial Distance Clamping** and **Dual Front & Rear Raycasting**.
  4. Ensure the car resets to default position `(0, 0, 0)` at default level when transitioning from **Drive Mode** to **Inspect Mode**.

---

## 2. Detailed Code Changes & Snippets

### File 1: `components/f1_viewer/CameraRig.tsx`

#### Snippet: Auto Showcase Target Y Offset Adjustment & GSAP Animation Cleanup
```typescript
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
```

**Why this code snippet is used**:
- `CarModel.tsx` renders the vehicle model primitive offset down by `-2.5` units (putting the visual car center at `Y ≈ -2.2`).
- Subtracting `2.2` from `selectedPart.defaultOffset.cameraPosition[1]` and `selectedPart.defaultOffset.target[1]` ensures that during **Auto Showcase**, camera transitions target the exact 3D position of each component on the car (Front Wing, Nose, Sidepods, Rear Wing, Engine, Cockpit, etc.) rather than empty space above the car.
- `gsap.killTweensOf()` clears previous camera tweens so auto-showcase transitions smoothly every 4.8 seconds without animation conflicts.

---

## 3. Verification Summary

1. **Auto Showcase**: Clicking "AUTO SHOWCASE" smoothly transitions the camera between all car parts (Front Wing, Nose, Sidepods, Floor, Rear Wing, DRS, Halo, Cockpit, Engine, etc.) centered on each part.
2. **Default Camera View**: Page loads directly into the low-angle front-left wheel profile view matching the requested reference image.
3. **Circular Wall Boundary**: Driving near glass walls prevents any part of the car from going outside the hall.
4. **Inspect Mode Reset**: Returning to Inspect Mode resets both car position `(0, 0, 0)` and camera view back to the default view.
