"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
  AcousticsDiagram,
  BridgeDiagram,
  HapticDiagram,
  SwitchDiagram,
} from "@/components/diagrams/CapabilityDiagrams";
import { prefersReducedMotion } from "@/lib/motion";

type Card = {
  index: string;
  title: string;
  body: string;
  badge: string;
  diagram: ReactNode;
};

const CARDS: Card[] = [
  {
    index: "01",
    title: "PROGRAMMABLE HAPTIC DETENTS",
    body: "Switch dynamically between 12, 24, 48 steps, or frictionless free-spin per application. Magnetic resistance updates in <2ms.",
    badge: "14-BIT HALL SENSOR",
    diagram: <HapticDiagram />,
  },
  {
    index: "02",
    title: "ZERO-LATENCY STUDIO BRIDGE",
    body: "Native MIDI, OSC, and HID profiles over braided USB-C or ultra-low-latency 2.4GHz wireless. Zero drivers required on macOS and Linux.",
    badge: "1000HZ POLLING",
    diagram: <BridgeDiagram />,
  },
  {
    index: "03",
    title: "OPEN-FIRMWARE MACRO LAYERS",
    body: "Four hot-swappable low-profile tactile switches with instant layer chording. Map timeline scrubbing, color grading wheels, or terminal macros.",
    badge: "QMK / VIA READY",
    diagram: <SwitchDiagram />,
  },
  {
    index: "04",
    title: "CNC BILLET ACOUSTICS",
    body: "Bead-blasted 6061-T6 aluminum chassis paired with an isolated silicone gasket mount and 420g brass base weight for dead-silent desk stability.",
    badge: "420G MASS",
    diagram: <AcousticsDiagram />,
  },
];

const N = CARDS.length;
const PEEL_MS = 280;
const DEPTH = [
  { scale: 1, y: 0, border: 0.14 },
  { scale: 0.96, y: -16, border: 0.1 },
  { scale: 0.92, y: -32, border: 0.07 },
  { scale: 0.88, y: -48, border: 0.05 },
];

/** Order starting from `front`, keeping the deck's cyclic sequence. */
const orderFrom = (front: number) => Array.from({ length: N }, (_, i) => (front + i) % N);


export default function FeaturesSection() {
  const [front, setFront] = useState(0);
  const [peeling, setPeeling] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const order = orderFrom(front);
  const busy = peeling !== null;

  /** Peel the front card off to the side, then tuck it behind the deck. */
  const next = useCallback(() => {
    if (busy) return;
    if (prefersReducedMotion()) {
      setFront((f) => (f + 1) % N);
      return;
    }
    setPeeling(front);
    timer.current = setTimeout(() => {
      setFront((f) => (f + 1) % N);
      setPeeling(null);
    }, PEEL_MS);
  }, [busy, front]);

  const prev = useCallback(() => {
    if (busy) return;
    setFront((f) => (f - 1 + N) % N);
  }, [busy]);

  const jump = useCallback(
    (i: number) => {
      if (busy || i === front) return;
      setFront(i);
    },
    [busy, front],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  const nextIndex = CARDS[(front + 1) % N].index;

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative z-20 min-h-[100dvh] overflow-x-clip px-6 py-24 md:px-12"
    >
      <p className="font-mono text-[11px] tracking-[0.24em] text-ink-muted">03 // SYSTEM CAPABILITIES</p>
      <h2
        id="features-heading"
        className="mt-5 max-w-4xl font-display text-[clamp(1.5rem,7.2vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.01em]"
      >
        ENGINEERED FOR TACTILE PRECISION
      </h2>

      <div className="mt-14 grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-12">
        {/* Index tabs */}
        <div role="tablist" aria-label="Capabilities" aria-orientation="vertical" className="flex gap-2 lg:flex-col lg:pt-12">
          {CARDS.map((c, i) => {
            const active = i === front;
            return (
              <button
                key={c.index}
                type="button"
                role="tab"
                id={`cap-tab-${c.index}`}
                aria-selected={active}
                aria-controls="cap-stack"
                onClick={() => jump(i)}
                className={`group flex flex-1 items-center gap-3 border px-3 py-2.5 font-mono text-[11px] tracking-[0.2em] transition-colors lg:flex-none lg:px-4 ${
                  active ? "border-white/30 text-ink" : "border-white/10 text-ink-muted hover:border-white/25 hover:text-ink"
                } focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 border transition-colors ${active ? "border-cta bg-cta" : "border-ink-muted"}`}
                />
                {c.index}
              </button>
            );
          })}
        </div>

        <div>
          {/* The stack. Top padding leaves room for the peeking cards. */}
          <div
            id="cap-stack"
            role="tabpanel"
            aria-labelledby={`cap-tab-${CARDS[front].index}`}
            aria-roledescription="card stack"
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="relative grid pt-12 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8 focus-visible:outline-white/40"
          >
            {CARDS.map((card, i) => {
              const depth = order.indexOf(i);
              const isFront = depth === 0;
              const isPeeling = peeling === i;
              const d = DEPTH[depth];
              const transform = isPeeling
                ? "translate3d(70%, 24px, 0) rotate(5deg) scale(0.98)"
                : `translate3d(0, ${d.y}px, 0) scale(${d.scale})`;

              return (
                <article
                  key={card.index}
                  aria-hidden={!isFront}
                  onClick={() => (isFront ? next() : jump(i))}
                  className="group relative col-start-1 row-start-1 cursor-pointer select-none border bg-[#0F161A] transition-[transform,opacity,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
                  style={{
                    transform,
                    transformOrigin: "50% 0%",
                    opacity: isPeeling ? 0 : 1,
                    zIndex: isPeeling ? 40 : 30 - depth,
                    borderColor: `rgba(242,244,243,${d.border})`,
                    transitionDuration: isPeeling ? `${PEEL_MS}ms` : undefined,
                    transitionTimingFunction: isPeeling ? "cubic-bezier(0.55,0,1,0.45)" : undefined,
                  }}
                >
                  <div
                    className={`grid gap-6 p-6 transition-opacity duration-300 md:grid-cols-[1fr_1.1fr] md:gap-10 md:p-10 ${
                      isFront ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div className="flex flex-col">
                      <p className="font-mono text-[11px] tracking-[0.24em] text-ink-muted">
                        {`${card.index} // 0${N}`}
                      </p>
                      <h3 className="mt-4 font-display text-[clamp(1.4rem,2.6vw,2.1rem)] font-bold leading-[1.02]">
                        {card.title}
                      </h3>
                      <p className="mt-4 max-w-md font-mono text-xs leading-relaxed text-ink-muted md:text-[13px]">
                        {card.body}
                      </p>
                      <span className="mt-6 inline-flex w-fit items-center gap-2 border border-white/20 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] md:mt-auto">
                        <span aria-hidden="true" className="h-1.5 w-1.5 bg-cta" />
                        {card.badge}
                      </span>
                    </div>
                    <div className="aspect-[9/5] w-full border border-white/10 p-3">{card.diagram}</div>
                  </div>
                  {/* Peek label on background strips; peel hint on the front card */}
                  <span
                    aria-hidden="true"
                    className={`absolute right-4 top-1 font-mono text-[9px] tracking-[0.24em] text-ink-muted transition-opacity duration-300 ${
                      isFront ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                    }`}
                  >
                    {isFront ? `CLICK // PEEL TO ${nextIndex}` : card.index}
                  </span>
                </article>
              );
            })}
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between gap-4 font-mono text-[11px] tracking-[0.2em]">
            <button
              type="button"
              onClick={prev}
              className="group flex items-center gap-3 border border-white/15 px-4 py-2.5 text-ink-muted transition-colors hover:border-white/40 hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <svg className="h-2.5 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                <path d="M12 5H1M5 1L1 5l4 4" />
              </svg>
              PREV
            </button>
            <span className="hidden text-ink-muted sm:inline" aria-live="polite">
              <span className="text-ink">{CARDS[front].index}</span>{` / 0${N} // ARROW KEYS`}
            </span>
            <button
              type="button"
              onClick={next}
              className="group flex items-center gap-3 border border-white/15 px-4 py-2.5 text-ink-muted transition-colors hover:border-white/40 hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {`NEXT // ${nextIndex}`}
              <svg className="h-2.5 w-3 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                <path d="M0 5h11M7 1l4 4-4 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
