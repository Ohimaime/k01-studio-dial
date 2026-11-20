"use client";

import type { MouseEvent } from "react";
import { scrollBehavior } from "@/lib/motion";

export default function HeroSection() {
  const toMorph = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("morph");
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    window.history.replaceState(null, "", "#morph");
  };

  return (
    <section
      id="hero"
      className="relative z-20 flex min-h-[100dvh] flex-col justify-between px-6 pb-10 pt-24 md:px-12"
    >
      {/* Metadata strip */}
      <div className="flex flex-col gap-1 font-mono text-[10px] tracking-[0.2em] text-[var(--ink-muted)] sm:flex-row sm:justify-between sm:text-xs">
        <span>SPEC // REV.04 — CNC-6061 ALUMINUM</span>
        <span>TOLERANCE: ±0.02MM // HALL-EFFECT</span>
      </div>

      {/* Monumental type, split top-left / bottom-right so the model owns the centre */}
      <h1 className="pointer-events-none flex flex-1 flex-col justify-between py-6 font-display leading-[0.82] tracking-[-0.03em] md:py-4">
        <span className="block text-[clamp(4.5rem,17vw,15rem)] font-extrabold">K-01</span>
        <span className="block self-end text-right text-[clamp(2rem,7.5vw,6.5rem)] font-bold tracking-[-0.01em]">
          STUDIO DIAL
        </span>
      </h1>

      {/* Action row */}
      <div className="relative grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_auto_1fr]">
        <p className="max-w-xs font-mono text-xs leading-relaxed tracking-[0.08em] text-[var(--ink-muted)]">
          Precision rotary control
          <br />
          for tactile creative workflows.
        </p>

        <div className="hidden flex-col items-center gap-2 md:flex" aria-hidden="true">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--ink-muted)]">
            SCROLL
          </span>
          <svg
            className="h-10 w-3 text-[var(--ink-muted)]"
            viewBox="0 0 12 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          >
            <path d="M6 0v39M1 34l5 5 5-5" />
          </svg>
        </div>

        <div className="md:justify-self-end">
          <a
            href="#morph"
            onClick={toMorph}
            className="group relative inline-flex items-center gap-4 border border-cta bg-cta px-5 py-3 font-mono text-[11px] font-semibold tracking-[0.2em] text-mat transition-colors duration-200 hover:bg-transparent hover:text-cta focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cta"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              INSPECT ARCHITECTURE
            </span>
            <svg
              className="h-3 w-2.5 transition-transform duration-200 group-hover:translate-y-0.5"
              viewBox="0 0 10 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden="true"
            >
              <path d="M5 0v11M1 7l4 4 4-4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
