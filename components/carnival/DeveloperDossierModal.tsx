'use client'

import { useEffect } from 'react'

interface DeveloperDossierModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeveloperDossierModal({ isOpen, onClose }: DeveloperDossierModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-sm shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#f6f1e3',
          backgroundImage: `
            radial-gradient(#c2b59b 0.75px, transparent 0.75px),
            linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(235,225,205,0.9)),
            repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(160,140,110,0.08) 28px)
          `,
          backgroundSize: '16px 16px, 100% 100%, 100% 28px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), inset 0 0 80px rgba(160,130,90,0.22)',
          border: '1px solid #c2b192',
        }}
      >
        {/* Vintage Paper Corner Accents */}
        <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l-4 border-t-4 border-[#8c2a2a]/60" />
        <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r-4 border-t-4 border-[#8c2a2a]/60" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-[#8c2a2a]/60" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-[#8c2a2a]/60" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-20 flex h-9 w-9 items-center justify-center rounded border border-[#6b583f]/40 bg-[#e8deca] font-mono text-sm font-bold text-[#4a3928] shadow-sm transition hover:bg-[#d8cbb1] hover:text-black cursor-pointer"
          title="Close Document"
        >
          ✕
        </button>

        <div className="p-8 md:p-12 text-[#2c2419] font-serif selection:bg-[#8c2a2a]/20">
          {/* Document Header */}
          <div className="border-b-2 border-[#4a3928] pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4 font-mono text-xs uppercase tracking-[0.22em] text-[#7a654c]">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 bg-[#8c2a2a]" />
                <span>CONFIDENTIAL // TECHNICAL DOSSIER</span>
              </div>
              <div className="border border-[#7a654c]/40 px-2 py-0.5">
                REF: F1-EXP-DEV-2026-0924
              </div>
            </div>

            <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-[#1c150c] font-sans md:text-4xl">
              Developer Dossier
            </h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.3em] text-[#8c2a2a]">
              The Inside Formula 1 — Architect & Engineering Profile
            </p>
          </div>

          {/* Document Body */}
          <div className="mt-8 space-y-8">
            {/* Section 1: Developer Overview */}
            <section className="relative">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8c2a2a]">
                Section 01 // Identification & Role
              </div>
              <h2 className="mt-1 text-xl font-bold font-sans text-[#1c150c]">
                3D Creative Engineer & Full-Stack Engineer
              </h2>

              <div className="mt-4 rounded border border-[#c2b192] bg-[#f0e8d5]/60 p-4 font-mono text-xs leading-relaxed text-[#3d3122]">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <span className="font-bold text-[#7a654c]">DEVELOPER:</span>{' '}
                    <span className="text-[#1c150c] font-semibold">Osanda Hirushaka</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#7a654c]">ROLE:</span>{' '}
                    <span className="text-[#1c150c]">3D WebGL & Software Enginner</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#7a654c]">LOCATION:</span>{' '}
                    <span className="text-[#1c150c]">SriLanka</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#7a654c]">PROJECT:</span>{' '}
                    <span className="text-[#1c150c]">The Inside Formula 1 Carnival 2026</span>
                  </div>
                </div>
              </div>

              {/* Editable Biography Placeholder */}
              <div className="mt-4 text-sm leading-relaxed text-[#3b3023]">
                <p>
                  Architect and developer behind <strong className="text-[#1c150c]">The Inside Formula 1</strong> interactive 3D WebGL carnival experience.
                  Specializing in real-time interactive 3D computing, browser-native simulation engines, advanced Three.js rendering pipelines, and high-performance immersive Web applications.
                </p>
                <p className="mt-3 text-xs italic text-[#6e5a42]">
                  &ldquo;Engineering Formula 1 telemetry, vehicle mechanics, and motorsport history into an interactive virtual world.&rdquo;
                </p>
              </div>
            </section>

            {/* Section 2: Technical Architecture Highlights */}
            <section className="border-t border-[#d6c7ac] pt-6">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8c2a2a]">
                Section 02 // Engineering Architecture
              </div>
              <h2 className="mt-1 text-lg font-bold font-sans text-[#1c150c]">
                Core Systems Implemented
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 font-mono text-xs">
                <div className="border border-[#c7b79a] bg-[#ebe1cc]/50 p-3">
                  <div className="font-bold text-[#8c2a2a]">01 // 3D WORLD PIPELINE</div>
                  <div className="mt-1 text-[#3d3122]">
                    Next.js 16 + React Three Fiber + Three.js with Draco compression, custom Box3 spatial collision grids, and first-person kinematic movement.
                  </div>
                </div>

                <div className="border border-[#c7b79a] bg-[#ebe1cc]/50 p-3">
                  <div className="font-bold text-[#8c2a2a]">02 // IN-WORLD SCREEN ENGINE</div>
                  <div className="mt-1 text-[#3d3122]">
                    CanvasTexture hardware rendering pipeline on physical Blender screen meshes with planar UV projection and real-time autoplay scheduling.
                  </div>
                </div>

                <div className="border border-[#c7b79a] bg-[#ebe1cc]/50 p-3">
                  <div className="font-bold text-[#8c2a2a]">03 // DRIVING ACADEMY EVALUATION</div>
                  <div className="mt-1 text-[#3d3122]">
                    Interactive computer kiosk terminal with canvas texturing, smooth camera docking, and regulatory certification exam.
                  </div>
                </div>

                <div className="border border-[#c7b79a] bg-[#ebe1cc]/50 p-3">
                  <div className="font-bold text-[#8c2a2a]">04 // TELEMETRY & DATA ADAPTERS</div>
                  <div className="mt-1 text-[#3d3122]">
                    Automated data adapters for Tyre Technology, Chassis Dynamics, Formula Ecosystems, and 2026 World Championship circuit data.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Technical Skills & Stack */}
            <section className="border-t border-[#d6c7ac] pt-6">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8c2a2a]">
                Section 03 // Technology Stack
              </div>

              <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
                {[
                  'Three.js',
                  'React Three Fiber',
                  'WebGL / GLSL',
                  'Next.js 16 (App Router)',
                  'TypeScript',
                  'React 19',
                  'Tailwind CSS',
                  'Blender 3D Modeling',
                  'GLTF Draco Compression',
                  'Canvas 2D API',
                ].map((tech) => (
                  <span
                    key={tech}
                    className="border border-[#ab997e] bg-[#e4dac4] px-2.5 py-1 text-[#2f251a]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            {/* Section 4: Connect / Verification Links */}
            <section className="border-t border-[#d6c7ac] pt-6">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8c2a2a]">
                Section 04 // Contact & Verification Links
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-3">
                <a
                  href="https://github.com/osa623"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border border-[#bfae92] bg-[#eae0cb] p-2.5 text-[#2c2217] transition hover:bg-[#d8cbb1]"
                >
                  <span className="font-bold">GITHUB</span>
                  <span className="text-[#8c2a2a]">↗</span>
                </a>

                <a
                  href="https://linkedin.com/in/osanda623"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border border-[#bfae92] bg-[#eae0cb] p-2.5 text-[#2c2217] transition hover:bg-[#d8cbb1]"
                >
                  <span className="font-bold">LINKEDIN</span>
                  <span className="text-[#8c2a2a]">↗</span>
                </a>

                <a
                  href="mailto:osandam23@gmail.com"
                  className="flex items-center justify-between border border-[#bfae92] bg-[#eae0cb] p-2.5 text-[#2c2217] transition hover:bg-[#d8cbb1]"
                >
                  <span className="font-bold">EMAIL</span>
                  <span className="text-[#8c2a2a]">✉</span>
                </a>
              </div>
            </section>

           {/* Section 5: Connect / Verification Links */}
            <section className="border-t border-[#d6c7ac] pt-6">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8c2a2a]">
                Section 04 // Contact & Verification Links
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-3">
                <a
                  href="https://f120172021.vercel.app/credits"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border border-[#bfae92] bg-[#eae0cb] p-2.5 text-[#2c2217] transition hover:bg-[#d8cbb1]"
                >
                  <span className="font-bold">CREDITS</span>
                  <span className="text-[#8c2a2a]">↗</span>
                </a>
              </div>
            </section>

            {/* Official Stamp Footer */}
            <div className="relative mt-8 flex flex-wrap items-center justify-between border-t-2 border-[#4a3928] pt-6 font-mono text-xs text-[#6e5a42]">
              <div>
                <div>DOC STATUS: <strong className="text-[#1c150c]">VERIFIED & ACTIVE</strong></div>
                <div className="text-[10px] uppercase">The Inside Formula 1 Exhibition Engine</div>
              </div>

              {/* Red Official Dossier Stamp */}
              <div className="mt-2 sm:mt-0 rotate-[-4deg] rounded border-2 border-[#8c2a2a] px-3 py-1.5 font-sans text-xs font-black uppercase tracking-wider text-[#8c2a2a] opacity-90 shadow-sm">
                ★ CERTIFIED EXHIBIT ★
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
