# F1 Viewer Hall Setup Guide

This guide explains the hall-specific changes made in the F1 viewer so you can reproduce or tune them later without touching the simulation project.

## What changed

The viewer now loads the new hall model from `public/models/Exhall_explore_hall.glb`, places the car on the hall floor when driving mode starts or when you press reset, blocks the car from driving through the glass wall, and uses `public/models/NightSkyHDRI001_4K_HDR.exr` for the environment.

## Where the behavior lives

- `components/f1_viewer/GarageEnvironment.tsx` handles the hall model, spawn point, and wall collision.
- `components/f1_viewer/EnvironmentMap.tsx` applies the night sky HDRI.
- `components/f1_viewer/CanvasScene.tsx` does not need extra logic because it already renders `GarageEnvironment` and the vehicle stack.

## How the car spawn is decided

1. The hall model is loaded with `useGLTF`.
2. A bounding box is built from the hall scene.
3. The spawn point is set to the hall center on X and Z, with Y placed slightly above the hall floor.
4. When driving mode starts, or when reset is triggered, the car is moved to that spawn point.

If you need a different spawn location, change the value computed from the hall bounds in `GarageEnvironment.tsx`.

## How wall blocking works

1. The code finds the vehicle forward direction from the current rotation.
2. It casts a ray from a point near the car nose toward the front.
3. If a near-vertical surface is hit within the front clearance distance, the vehicle is pushed backward.
4. The vehicle speed is set to zero so it feels like the car has hit a real wall.

If the car stops too early or too late, tune these values in `GarageEnvironment.tsx`:

- `FRONT_PROBE_DISTANCE` controls how far the nose probe starts from the vehicle center.
- `FRONT_CLEARANCE` controls how close the nose is allowed to get to the wall.
- `WALL_PADDING` controls how much margin is left inside the hall bounds.

## How the floor placement works

The car still relies on the existing ground raycast in `components/f1_viewer/Vehicle/GroundDetection.tsx` for exact floor contact. The hall spawn only gives it a good starting point. If the car floats or sinks, tune the floor offset used in the spawn calculation.

## How to change the environment later

To switch to another HDRI, update the `files` prop in `components/f1_viewer/EnvironmentMap.tsx` and keep the path inside `public/`.

## Safe edit order

If you want to change the hall again later, edit in this order:

1. Update the hall spawn value.
2. Adjust the wall probe or clearance constants.
3. Swap the HDRI file path.
4. Test driving mode and reset behavior.
