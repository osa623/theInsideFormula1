# Formula One Experience

Interactive Next.js + TypeScript project showcasing a Formula One 3D experience, viewer, and simulation scenes built with React, Three.js and related tooling.

## Quick start

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## What this repo contains

Selected top-level folders and purpose:

- `app/` — Next.js app routes and pages
- `components/` — UI, F1 visual components and 3D viewer code
	- `components/f1/` — page-level and UI components (calendar, cursor, drivers, finale, garage, hero, loader, machine, magnetic, nav, post-card, reveal, stories, teams, etc.)
	- `components/f1_viewer/` — 3D viewer pieces (CameraRig, CanvasScene, CarModel, Controls, EnvironmentMap, GarageEnvironment, Loader, Vehicle/*)
	- `components/simulation/` — simulation scenes and helpers (CameraController, CarSpawner, PlayerController, HUD, Lighting, ExhibitionScene, Environment)
	- `components/ui/` — common UI pieces (buttons, controls)
- `data/` — static data (tracks, car parts)
- `public/` — static assets (images, HDRIs)
- `hooks/` — shared hooks (e.g. `useCarStore.ts`)
- `lib/` — utilities, language and posts helpers

## Important components & files (high level)

- `app/page.tsx` — landing page
- `app/posts/[slug]/page.tsx` — post detail pages
- `components/f1_viewer/CanvasScene.tsx` — main react-three-fiber scene
- `components/f1_viewer/Vehicle/Vehicle.tsx` — vehicle logic and controllers
- `components/simulation/ExhibitionScene.tsx` — the exhibition hall walkthrough scene
- `data/tracks/*.json` — track geometry / layout data

## Preview
Exhibition and build previews (located in `Screenshots/`):

![Exhibition view 1](Screenshots/Pview_1.png)
![Exhibition view 2](Screenshots/Pview_2.png)
![Build screenshot 1](Screenshots/build_1.png)
![Build screenshot 2](Screenshots/build_2.png)

## Local development notes

- Uses `three` + `@react-three/fiber` + `@react-three/drei` for 3D scenes.
- Physics/interaction via `@react-three/rapier` where applicable.
- State management uses `zustand` for small stores like vehicle state.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm start` — start production server

## Dependencies (excerpt from `package.json`)

- `next`, `react`, `react-dom`
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `zustand`, `framer-motion`, `gsap`

## Contributing

If you'd like this README expanded (detailed component docs, how to add tracks, model export guidelines, or contribution guidelines), tell me which areas to document and I will expand it.

## License
Add a `LICENSE` file if you plan to publish or share the project.

