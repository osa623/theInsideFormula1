"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCarStore } from "@/hooks/useCarStore";
import { useLanguage } from "@/lib/language-context";

export default function InfoPanel() {
  const selectedPart = useCarStore((state) => state.selectedPart);
  const resetView = useCarStore((state) => state.resetView);
  const { lang } = useLanguage();

  return (
    <AnimatePresence>
      {selectedPart ? (
        <motion.div
          key={selectedPart.id}
          initial={{ opacity: 0, x: 60, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 40, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="absolute right-6 top-24 z-30 w-full max-w-sm overflow-hidden border border-border/80 bg-black/85 p-6 backdrop-blur-xl md:right-10 md:top-28 md:max-w-md md:p-8"
        >
          {/* Header HUD Tag */}
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.4em]">
            <span className="text-speed">SYS // COMPONENT_SPEC</span>
            <span className="text-neon">{selectedPart.category}</span>
          </div>

          {/* Part Title */}
          <h2 className="mt-3 text-3xl font-black leading-none tracking-tight text-foreground md:text-4xl">
            {selectedPart.title}
          </h2>

          {/* Material Spec */}
          <div className="mt-4 border-l-2 border-primary pl-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {lang === "si" ? "ද්‍රව්‍ය නිර්මාණ විස්තරය" : "Material Construction"}
            </p>
            <p className="font-mono text-xs text-primary font-bold">
              {selectedPart.material}
            </p>
          </div>

          {/* Purpose & Description */}
          <p className="mt-4 text-pretty font-extralight leading-relaxed text-muted-foreground text-xs md:text-sm">
            {selectedPart.purpose}
          </p>

          <p className="mt-2 text-pretty font-extralight leading-relaxed text-foreground/80 text-xs">
            {selectedPart.description}
          </p>

          {/* Technical Details HUD Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-4 font-mono text-xs">
            {selectedPart.technicalDetails.downforce && (
              <div>
                <span className="block text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  Downforce / Output
                </span>
                <span className="font-black text-foreground">
                  {selectedPart.technicalDetails.downforce}
                </span>
              </div>
            )}

            {selectedPart.technicalDetails.weight && (
              <div>
                <span className="block text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  Component Weight
                </span>
                <span className="font-black text-foreground">
                  {selectedPart.technicalDetails.weight}
                </span>
              </div>
            )}

            {selectedPart.technicalDetails.materialSpec && (
              <div>
                <span className="block text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  Specification
                </span>
                <span className="font-black text-foreground">
                  {selectedPart.technicalDetails.materialSpec}
                </span>
              </div>
            )}

            {(selectedPart.technicalDetails.dragCoeff ||
              selectedPart.technicalDetails.efficiency) && (
              <div>
                <span className="block text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  Efficiency
                </span>
                <span className="font-black text-neon">
                  {selectedPart.technicalDetails.dragCoeff ||
                    selectedPart.technicalDetails.efficiency}
                </span>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={resetView}
            className="mt-6 flex w-full items-center justify-center border border-border/80 bg-card py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            {lang === "si" ? "මුල් පෙනුමට යන්න ✕" : "Close Inspection ✕"}
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}