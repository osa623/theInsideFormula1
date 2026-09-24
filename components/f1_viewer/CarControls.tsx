"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Magnetic } from "@/components/f1/magnetic";
import { useCarStore } from "@/hooks/useCarStore";
import { useLanguage } from "@/lib/language-context";
import { useVehicle } from "./Vehicle/VehicleContext";

export default function CarControls() {
  const isExploded = useCarStore((state) => state.isExploded);
  const isShowcaseActive = useCarStore((state) => state.isShowcaseActive);
  const isLowPowerMode = useCarStore((state) => state.isLowPowerMode);

  const toggleExploded = useCarStore((state) => state.toggleExploded);
  const toggleShowcase = useCarStore((state) => state.toggleShowcase);
  const resetView = useCarStore((state) => state.resetView);
  const setLowPowerMode = useCarStore((state) => state.setLowPowerMode);

  const { mode, setMode, resetVehicle } = useVehicle();
  const { lang } = useLanguage();

  const isDriving = mode === "driving";

  const handleModeToggle = () => {
    if (isDriving) {
      setMode("inspect");
      resetView();
      resetVehicle();
    } else {
      setMode("driving");
      resetView();
      resetVehicle();
    }
  };

  return (
    <>
      {/* Main Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 border border-border/80 bg-black/85 px-4 py-3 backdrop-blur-xl md:gap-4 md:px-6"
      >
        {/* Drive / Inspect Mode Toggle */}
        <Magnetic strength={0.2}>
          <button
            type="button"
            onClick={handleModeToggle}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] transition-all border ${
              isDriving
                ? "border-green-500 bg-green-500/20 text-foreground shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {isDriving
              ? lang === "si"
                ? "පරීක්ෂා මාදිලිය"
                : "INSPECT MODE"
              : lang === "si"
                ? "ධාවන මාදිලිය"
                : "DRIVE MODE"}
          </button>
        </Magnetic>

        {/* Inspection-only controls */}
        {!isDriving && (
          <>
            {/* Exploded View Toggle */}
            <Magnetic strength={0.2}>
              <button
                type="button"
                onClick={toggleExploded}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] transition-all border ${
                  isExploded
                    ? "border-primary bg-primary/20 text-foreground shadow-[0_0_15px_rgba(235,0,40,0.3)]"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {isExploded
                  ? lang === "si"
                    ? "එක්රැස් කරන්න"
                    : "ASSEMBLE"
                  : lang === "si"
                    ? "කොටස් වෙන් කරන්න"
                    : "EXPLORE COMPONENTS"}
              </button>
            </Magnetic>

            {/* Auto Showcase Mode Toggle */}
            <Magnetic strength={0.2}>
              <button
                type="button"
                onClick={toggleShowcase}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] transition-all border ${
                  isShowcaseActive
                    ? "border-neon bg-neon/20 text-foreground shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {isShowcaseActive
                  ? lang === "si"
                    ? "ස්වයංක්‍රීය චාරිකාව නවතන්න"
                    : "STOP SHOWCASE"
                  : lang === "si"
                    ? "ස්වයංක්‍රීය චාරිකාව"
                    : "AUTO SHOWCASE"}
              </button>
            </Magnetic>

            {/* Reset View Button */}
            <Magnetic strength={0.2}>
              <button
                type="button"
                onClick={resetView}
                className="border border-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                {lang === "si" ? "පෙනුම යළි පිහිටුවන්න" : "RESET VIEW"}
              </button>
            </Magnetic>
          </>
        )}

        {/* Quality Mode Toggle */}
        <button
          type="button"
          onClick={() => setLowPowerMode(!isLowPowerMode)}
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          [{isLowPowerMode ? "SD MODE" : "HD MODE"}]
        </button>
      </motion.div>

      {/* Driving HUD Overlay */}
      <AnimatePresence>
        {isDriving && (
          <motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute left-6 top-24 z-30 border border-border/80 bg-black/85 px-5 py-4 backdrop-blur-xl md:left-10 md:top-48"
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.4em] text-speed">
                SYS // DRIVE_MODE
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted-foreground leading-relaxed">
                <span className="text-foreground font-bold">W</span> Accelerate
                <br />
                <span className="text-foreground font-bold">S</span> Brake / Reverse
                <br />
                <span className="text-foreground font-bold">A / D</span> Steer
                <br />
                <span className="text-foreground font-bold">SPACE</span> Emergency Brake
                <br />
                <span className="text-foreground font-bold">R</span> Reset Position
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute z-30 md:right-6 md:top-24"
            >
              <Magnetic strength={0.2}>
                <Link
                  href="/simulation"
                  className="flex items-center gap-2 border border-red-500/80 bg-red-600/20 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground transition-all hover:bg-red-600 hover:text-white shadow-[0_0_20px_rgba(235,0,40,0.4)] backdrop-blur-xl"
                >
                  🏛️ VISIT EXHIBITION HALL →
                </Link>
              </Magnetic>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
