# The Inside Formula One

![The Inside Formula One — Main Cover](./public/images/Welcome_images/coverPhoto.png)

The Inside Formula One is a browser-based interactive 3D Formula One environment designed to combine exploration, education, exhibition, AI assistance, historical information, multimedia, and an embedded racing experience. Instead of consuming Formula One information only through conventional webpages, users enter an interactive environment where information is discovered spatially through exploration, interaction, visual exhibits, audio narration, AI assistance, educational areas, historical displays, quizzes, and racing.

## Project Links

- Project Demonstration Video: https://youtu.be/duWRdpKXg54
- GitHub Repository: https://github.com/osa623/theInsideFormula1.git
- Live Site: https://the-inside-formula1.vercel.app/

## Project Overview

The project is a browser-native, Web3D Formula One experience built around an open exploration model. Visitors move through a Carnival environment and transition into exhibition, education, historical, and racing experiences without relying on a conventional page-by-page content flow.

This is a Formula One exhibition platform rather than a standard racing game. It includes a dedicated gameplay-style racing component, but the larger experience is an interactive educational and immersive environment.

## Why This Project Exists

The project turns Formula One information into a spatial and interactive experience. Instead of reading a collection of static pages, visitors walk through a 3D environment, approach exhibits, trigger contextual information, listen to narration, ask questions, and test knowledge in a guided educational setting.

## Key Features

- Interactive 3D Carnival environment
- Exhibition Hall with Formula One vehicle displays
- Interactive car and exhibit information panels
- AI terminal and Formula One-focused Smart Guide
- Context-aware location and section information
- Educational zones covering tyres, chassis, tracks, and Formula Franchise concepts
- Championship and historical display areas
- Quiz / examination station with Formula One content
- Embedded racing experience as a dedicated subsystem
- Prerecorded exhibition narration for selected Formula One vehicles
- Background music and audio ducking for narrated content
- Adaptive graphics quality profiles for different hardware capabilities
- Web Audio API-based audio processing and TTS integration

## User Experience Flow

> Exploration Flow

Welcome
↓
Carnival
↓
Exhibition Hall
↓
Educational Zone
↓
Second Main Area
↓
Championship
↓
Quiz
↓
Racing Experience
↓
Continued Exploration

The flow is nonlinear by design: visitors can move through the environment, discover landmarks, and interact with the objects and sections that are most relevant to them.

## AI Smart Guide

The project includes a Smart Guide / AI system specifically designed for Formula One context. The AI route validates formula-related prompts, handles location wayfinding, and can respond to current area and exhibition context where available.

Verified features in the current implementation include:

- Formula One-focused domain guard
- contextual location-aware responses
- section and exhibition awareness
- local knowledge fallback for Formula One content
- Gemini API-backed server-side AI processing
- location-based and exhibit-based grounding

The AI does not operate as an unrestricted general assistant; it is intentionally scoped to Formula One and to the current experience context.

## Exhibition Hall

The Exhibition Hall is a central museum-like area with Formula One vehicles, motion-influenced lighting, signage, QR-linked documentation, and an AI terminal. The project includes a car observation flow that is paired with prerecorded narration audio.

Verified exhibition narration tracks present in the project:

- 2017.mp3
- 2018.mp3
- 2019.mp3
- 2020.mp3
- 2021.mp3
- senna.mp3

These are mapped to the relevant displayed machines and are used in Observation Mode alongside the hall background music. The system actively ducks the music when a narration clip is playing so that spoken content remains intelligible.

## Educational Areas

The educational area is designed for technical explanation around core Formula One concepts. The current implementation maps the educational triggers to the following topics:

- Symmbol.004 → Tyres
- Symmbol.003 → Chassis
- Symmbol.002 → Tracks
- Symmbol.001 → Formula Franchise

The educational content supports the broader learning objectives of the experience by turning technical ideas into spatial, interactive learning moments.

## Championship / Quiz

The Championship section presents historical Formula One information and champion displays in a connected, immersive setting. The project also contains an exam / quiz system connected to the educational and historical content.

The current quiz source in the repository contains 40 questions. The implementation is built around:

- championship history
- champion displays and information panels
- educational boards and study material
- interactive exam / quiz station
- Formula One knowledge testing

## Racing Experience

The project includes a dedicated interactive racing component as one subsystem within the larger Web3D platform. This racing experience is integrated into the broader Formula One environment and should be treated as a supporting interactive feature rather than the primary identity of the entire experience.

## Technology Stack

| Category | Technology | Purpose |
| --- | --- | --- |
| Framework | Next.js 16.2.6 | Application architecture and app routing |
| UI | React 19 | Component-driven interface |
| Language | TypeScript 5.7.3 | Application development |
| 3D Renderer | Three.js 0.185.1 | WebGL-based 3D rendering |
| 3D React Layer | React Three Fiber 9.6.1 | React integration with Three.js |
| 3D Helpers | @react-three/drei 10.7.7 | Scene utilities and UI helpers |
| Styling | Tailwind CSS 4.3.3 | Interface styling |
| State | Zustand 5.0.14 | Application state management |
| Motion | Framer Motion 12.42.2 | UI animation |
| Animation | GSAP 3.15.0 | Timelines and transitions |
| AI | Google Gemini 1.5 Flash via API | Formula One Smart Guide and assistant |
| Audio | Web Audio API | Background audio, ducking, and sound processing |
| Speech | Web Speech API | TTS support where implemented |
| Assets | GLB / GLTF / Blender workflow | 3D environment and vehicle assets |

## How to Run

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Start the production server

```bash
npm start
```

### Lint the project

```bash
npm run lint
```

Then open the app in the browser, typically at:

```text
http://localhost:3000
```

## Environment Variables

The project uses the Gemini API key as a server-side environment variable. See the dedicated guide here:

- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)

Required variable example:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

Create a local `.env.local` file if needed, add the key, and restart the development server.

## Controls

The verified controls in the current implementation include:

- W / A / S / D — movement
- Arrow keys — movement alternative
- Shift — sprint
- E — interact with nearby objects and triggers
- P — open / close the Smart Guide
- Escape — close overlays and modals
- Mouse — look around / camera control

See the full guide here:

- [How to Explore The Inside Formula One](./docs/HOW_TO_PLAY.md)

## Screenshots

For the complete visual gallery:

- [View all Carnival Screenshots](./docs/CARNIVAL_SCREENSHOTS.md)

A few representative images from the project are shown below:

![Representative Carnival View](./public/images/Welcome_images/coverPhoto.png)

![Exhibition Hall View](./public/images/Welcome_images/brave_yjD2FifLHN.png)

![Championship Area](./public/images/Welcome_images/KMPlayer_buldULZ6WD.png)

## Project Structure

```text
formula-one-experience/
├── app/
│   ├── api/
│   ├── carnival/
│   ├── simulation/
│   └── page.tsx
├── components/
│   ├── carnival/
│   ├── f1/
│   ├── f1_viewer/
│   ├── simulation/
│   └── ui/
├── data/
├── docs/
├── hooks/
├── lib/
├── public/
├── .env.example
├── README.md
├── package.json
├── next.config.mjs
├── tsconfig.json
├── vercel.json
└── BLENDER.md
```

The project is organized around main experience routes, 3D scene components, simulation and exhibition logic, static F1 data, and public assets for the environment and narration.

## Performance / Graphics

The project includes a graphics quality system with automatic and manual profiles:

- Auto
- Low
- Medium
- High

The implementation uses hardware-aware quality detection and adaptive rendering behavior to manage device capability, shadow quality, anisotropy, fog, and pixel density. The system also includes optimized scene and render-profile logic for lower-end hardware.

## Development Tools

The project is built with standard browser and frontend tooling. Content production tools referenced in the project context include:

- Blender
- Photoshop
- Adobe After Effects
- Adobe Premiere Pro

These tools are relevant as content and asset production tools rather than as runtime dependencies for the app itself.

## Author

**Osanda Hirushaka**

Creator and developer of The Inside Formula One.

## License / Content Notice

License information is not currently specified in the repository.

The project includes Formula One content, historical references, and third-party media assets. Usage should respect the repository’s current licensing state and any external asset rights associated with the exhibition materials.

## Documentation Index

- [How to Explore The Inside Formula One](./docs/HOW_TO_PLAY.md)
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)
- [Carnival Screenshots](./docs/CARNIVAL_SCREENSHOTS.md)


