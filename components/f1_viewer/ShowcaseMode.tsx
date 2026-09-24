"use client";

import { useEffect } from "react";
import { useCarStore } from "@/hooks/useCarStore";

export default function ShowcaseMode() {
  const isShowcaseActive = useCarStore((state) => state.isShowcaseActive);
  const nextShowcasePart = useCarStore((state) => state.nextShowcasePart);

  useEffect(() => {
    if (!isShowcaseActive) return;

    const interval = setInterval(() => {
      nextShowcasePart();
    }, 4800);

    return () => clearInterval(interval);
  }, [isShowcaseActive, nextShowcasePart]);

  return null;
}
