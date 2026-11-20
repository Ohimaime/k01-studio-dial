"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/scrollState";

const STAGES = [
  {
    index: "01",
    title: "MILLED 6061-T6 CHASSIS",
    body: "CNC-machined from a single billet of bead-blasted aluminum to ±0.02mm tolerances. Weighted for zero desk drift.",
  },
  {
    index: "02",
    title: "HALL-EFFECT ROTARY DIAL",
    body: "Zero-contact magnetic encoder with programmable haptic detents, high-mass knurled grip, and 360° optical tracking.",
  },
  {
    index: "03",
    title: "HOT-SWAP MACRO MATRIX",
    body: "Four low-profile tactile mechanical switches on an isolated gasket PCB with instant per-application layer switching.",
  },
] as const;

function stageFor(progress: number) {
  if (progress < 0.38) return 0;
  if (progress <= 0.7) return 1;
  return 2;
}

export default function MorphSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const hero = document.getElementById("hero");
    if (!section || !hero) return;

    const ctx = gsap.context(() => {
      const applyMorph = (progress: number) => {
        scrollState.morphProgress = progress;
        const next = stageFor(progress);
        if (next !== stageRef.current) {
          stageRef.current = next;
          scrollState.activeStage = next;
          setStage(next);
        }
      };

      // 1. Morph scrub: hero top -> morph bottom
      ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        endTrigger: section,
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => applyMorph(self.progress),
        onRefresh: (self) => applyMorph(self.progress),
      });

      // 2. Canvas exit fade as #features approaches
      ScrollTrigger.create({
        trigger: section,
        start: "bottom 85%",
        end: "bottom 25%",
        scrub: true,
        onUpdate: (self) => {
          scrollState.canvasOpacity = 1 - self.progress;
        },
        onRefresh: (self) => {
          scrollState.canvasOpacity = 1 - self.progress;
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="morph"
      ref={sectionRef}
      className="relative z-20 min-h-[260dvh] px-6 md:px-12"
    >
      <div className="pointer-events-none sticky top-0 flex h-[100dvh] items-end pb-12 md:items-center md:pb-0">
        <article
          aria-live="polite"
          className="pointer-events-auto w-full max-w-md border border-white/15 bg-[#0B1114]/85 p-6"
        >
          {/* Step indicator */}
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.24em] text-[var(--ink-muted)]">
            <span>ARCHITECTURE</span>
            <span>
              <span className="text-ink">{STAGES[stage].index}</span> / 03
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1" aria-hidden="true">
            {STAGES.map((s, i) => (
              <span key={s.index} className="relative h-px bg-white/15">
                <span
                  className="absolute inset-0 origin-left bg-cta transition-transform duration-500 ease-out"
                  style={{ transform: `scaleX(${i <= stage ? 1 : 0})` }}
                />
              </span>
            ))}
          </div>

          {/* Beats: stacked in one grid cell, only the active one is shown */}
          <div className="mt-6 grid">
            {STAGES.map((s, i) => {
              const active = i === stage;
              return (
                <div
                  key={s.index}
                  aria-hidden={!active}
                  className={`col-start-1 row-start-1 transition-[opacity,transform] duration-500 ease-out ${
                    active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
                  }`}
                >
                  <h3 className="font-display text-xl font-bold leading-tight tracking-[0.01em] md:text-2xl">
                    <span className="font-mono text-sm font-medium text-[var(--ink-muted)]">
                      {`${s.index} // `}
                    </span>
                    {s.title}
                  </h3>
                  <p className="mt-4 font-mono text-xs leading-relaxed text-[var(--ink-muted)]">
                    {s.body}
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
