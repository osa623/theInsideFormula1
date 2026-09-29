# How to Explore The Inside Formula One

This guide explains the verified controls and visitor flow for the browser-based 3D Formula One experience. The project is not a conventional game; it is a navigable Formula One exhibition environment with educational content, interactive displays, AI guidance, and an embedded racing experience.

## Getting Started

1. Open the project in a browser after starting the development server.
2. Wait for the main experience to finish loading.
3. Enter the main Formula One Carnival environment.
4. Explore the environment by walking through the space and looking for interactive triggers, information displays, and entrances.
5. Use the Smart Guide when you need location, route, or Formula One context.

## Basic Movement

The primary movement controls are:

- W / A / S / D — move through the 3D environment
- Arrow keys — alternative movement input
- Shift — sprint
- Mouse — look around and control the camera

These controls are used in the carnival and exhibition hall flow, and the project also includes touch-friendly mobile controls for the carnival experience.

## Camera / Look Controls

- Mouse movement — rotate the camera and look around the environment
- Pointer lock / focused first-person view — used in the interactive scene once the experience is active

The camera is designed for first-person exploration rather than fixed cinematic camera movement throughout the experience.

## Interacting With Objects

- E — interact with nearby triggers, entrances, information screens, quiz stations, and exhibit interactions

When standing near an interactive object or boundary, press E to open the related panel, modal, or scene overlay.

Examples include:

- entering the Exhibition Hall
- opening information and champion displays
- activating quiz or exam areas
- opening the AI terminal
- launching the racing station

## Entering the Exhibition Hall

The Exhibition Hall is reached from the main carnival area through the designated exhibition entrance interaction. When you approach the entrance and press E, the experience transitions into the hall and focuses the visitor on the displayed Formula One vehicles and information panels.

Inside the hall, visitors can:

- walk and inspect the exhibition vehicles
- approach triggers near each vehicle
- open QR-linked technical dossiers
- access AI terminal information
- use Observation Mode to hear dedicated narration for the active car

## Exhibition Hall Observation Mode

Observation Mode is a separate exhibition interaction that focuses on a specific car.

The verified behavior is:

- approach a displayed vehicle
- press E to interact
- activate the observation flow for that exhibit
- listen to the prerecorded narration associated with the selected car
- continue exploring the hall after the narration ends

The project intentionally uses prerecorded vehicle narration files rather than treating all spoken content as live AI output. Background music is ducked while the narration is playing so that the voice can be heard clearly.

## Using the Smart Guide

The 3D Smart Guide can be opened manually with:

- P — open / close the Smart Guide

The Smart Guide is a Formula One-focused contextual assistant. It may provide:

- current location context
- section context
- navigation guidance
- Formula One assistance
- relevant info for the active area

The Smart Guide is spatially aware and uses the visitor's current area as context. This is an important part of the project’s educational and exploration flow.

## Educational Zone

The educational area is a major learning component that helps visitors understand the technical and historical foundations of Formula One.

Verified educational topic mappings include:

- Symmbol.004 → Tyres
- Symmbol.003 → Chassis
- Symmbol.002 → Tracks
- Symmbol.001 → Formula Franchise

These educational interactions are integrated into the carnival area and are explicitly used by the Smart Guide and the location system.

## Championship Section

The Championship section is a dedicated historical area in the main environment. It presents championship history and champion information in a spatial, exploratory setting rather than a standard webpage-only layout.

Visitors can:

- walk into the championship section
- inspect champion-related displays
- activate zone or board interactions
- continue to the next zone after reviewing the information

## Quiz Area

The project includes an exam / quiz station as part of the broader educational experience.

The current quiz data in the project includes a 40-question knowledge set, and the project is structured around:

- educational preparation
- study boards and repository content
- exam/quiz interaction
- knowledge testing around Formula One topics

The quiz should be understood as a learning/examination component of the experience, not as a conventional combat or progression mechanic.

## Racing Experience

The project also includes a dedicated racing component as one subsystem within the larger 3D platform.

This is not the entire project’s identity; it is a supporting interactive subsystem inside the bigger Formula One exhibition environment. Visitors can enter the racing section from the carnival and use the embedded experience as one part of the wider exploration flow.

## Graphics Quality

The project includes a hardware-aware graphics-quality system with the following modes:

- Auto
- Low
- Medium
- High

The graphics manager inspects hardware characteristics such as device capabilities, renderer information, CPU/GPU context, and texture limits, then resolves an appropriate rendering profile. This helps reduce performance issues on lower-end hardware while preserving richer visuals on higher-tier systems.

## Mobile Controls

The carnival experience includes mobile-friendly virtual controls for movement. These are implemented as touch input state for walking and sprinting, so the experience can be explored beyond keyboard-only input.

## Summary

The overall experience flow is:

1. Enter the Carnival
2. Explore the 3D environment
3. Use the Smart Guide when needed
4. Visit the Exhibition Hall
5. Observe cars and listen to narration
6. Ask technical or historical Formula One questions
7. Explore educational areas
8. Enter the championship or exam sections
9. Experience the embedded racing component
10. Continue free exploration

This is a spatial learning and exhibition experience, not a conventional game loop.
