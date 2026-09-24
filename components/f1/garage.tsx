"use client";

import CanvasScene from "@/components/f1_viewer/CanvasScene";
import { useLanguage } from "@/lib/language-context";

export function Garage() {
  const { lang } = useLanguage();

  return (
    <section id="garage" className="relative h-screen w-full border-t border-border overflow-hidden">


      <CanvasScene />
    </section>
  );
}