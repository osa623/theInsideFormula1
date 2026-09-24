export default function Loading() {
  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(235,0,40,0.18),transparent_35%),linear-gradient(180deg,#050505_0%,#0a0a0d_100%)] text-white">
      <div className="relative w-full max-w-md border border-white/10 bg-black/70 px-6 py-8 shadow-[0_0_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[24px_24px] opacity-40" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary shadow-[0_0_16px_rgba(235,0,40,0.9)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/70">
              Preparing exhibition hall
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-linear-to-r from-primary via-white to-primary" />
          </div>
          <p className="mt-4 max-w-sm font-mono text-[11px] leading-relaxed text-white/55">
            Loading the hall geometry and HDR reflections in parallel so the simulation stays
            visually exact once it appears.
          </p>
        </div>
      </div>
    </main>
  )
}