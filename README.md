# The Inside Formula 1

A cinematic, interactive Formula 1 storytelling experience built with Next.js, TypeScript, and React Three Fiber. The project blends editorial web design with immersive 3D environments, allowing users to explore a branded F1 showcase, a carnival-style interactive world, and a simulation-driven exhibition hall.

Live experience:
- Main site: https://the-inside-formula1.vercel.app
- Carnival experience: https://the-inside-formula1.vercel.app/carnival
- Simulation experience: https://the-inside-formula1.vercel.app/simulation

## Overview

This repo is more than a static landing page. It is a multi-scene digital experience designed around the Formula 1 brand and atmosphere:

- A polished storytelling homepage with F1-inspired sections and motion-rich transitions
- A 3D interactive carnival space with guided exploration, overlays, and game-like interactions
- A showroom and simulation experience focused on realism, navigation, and exhibition design
- A content layer for drivers, teams, tracks, and F1 data, presented through custom UI components

## Experience highlights

### 1. Main F1 editorial experience
The home route presents a structured, high-impact F1 narrative using layered sections such as:

- hero storytelling
- marquee content
- season and team data
- feature cards and garage-style panels
- championship and calendar modules

Built with motion-driven UX patterns using Framer Motion and GSAP, while preserving a premium editorial aesthetic.

### 2. Carnival mode
The carnival experience is a first-person interactive 3D environment with:

- animated 3D models and environment lighting
- guided movement and camera behavior
- trigger-based information screens and previews
- champion/exam content overlays
- map, about, and station interactions
- desktop-friendly pointer-lock and navigation flow

This is the most immersive part of the project and is treated like a branded interactive exhibit.

### 3. Simulation and exhibition hall
The simulation route focuses on a walkthrough-inspired virtual venue where visitors can navigate and explore a structured hall environment. It includes:

- 3D scene composition and lighting
- contextual signage and station elements
- vehicle/environment placement logic
- immersive exhibition layout for a more realistic walkthrough

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Three.js
- @react-three/fiber
- @react-three/drei
- @react-three/postprocessing
- @react-three/rapier
- Framer Motion
- GSAP
- Zustand

## Project structure

```text
formula-one-experience/
├── app/
│   ├── page.tsx                  # main editorial landing page
│   ├── carnival/page.tsx         # carnival experience route
│   ├── simulation/page.tsx       # simulation route
│   └── api/
├── components/
│   ├── f1/                      # landing page and editorial sections
│   ├── f1_viewer/               # car/scene/viewer logic
│   ├── carnival/                # 3D carnival environment and interactions
│   ├── simulation/              # exhibition simulation scene
│   └── ui/                      # reusable UI building blocks
├── data/
│   ├── f1/                      # championship, drivers, teams, tracks
│   └── tracks/
├── hooks/
├── lib/
├── public/
│   ├── images/
│   └── models/
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind config / setup
├── README.md
└── vercel.json
```

## Key implementation areas

- app/page.tsx — main experience shell and content flow
- app/carnival/page.tsx — carnival entry point and model warmup
- components/carnival/CarnivalScene.tsx — core carnival scene orchestration
- components/simulation/ExhibitionScene.tsx — exhibition simulation logic
- components/f1/ — storytelling and editorial UI components
- data/f1/ — static content and metadata used across the experience
- public/models/ — 3D asset files for the immersive scenes

## Getting started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available scripts

```bash
npm run dev      # start the development server
npm run build    # create a production build
npm start        # run the production server
npm run lint     # run ESLint checks
```

## Production build notes

This project is designed for deployment on Vercel and uses Next.js app routing. The scenes are asset-heavy, so the app benefits from optimized model loading, device-aware rendering, and adaptive quality settings in the 3D modules.

## Design direction

The project combines:

- premium motorsport branding
- documentary-style storytelling
- product-showcase polish
- immersive real-time 3D interaction

This makes it feel less like a standard marketing site and more like a digital Formula 1 exhibition or branded experience portal.

## License

This project does not currently include a license file.

## Notes

Because this project relies on large 3D assets and interactive scenes, local development performance may vary depending on your machine and GPU. For the smoothest experience, run the project on a machine with reasonable graphics support and ensure the assets in public/models are present.


