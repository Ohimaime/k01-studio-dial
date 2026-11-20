"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const MAJOR = 120;
const MINOR = 24;

function subscribeResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}
const getWidth = () => window.innerWidth;
const getHeight = () => window.innerHeight;
const getServerSize = () => 0;

function pad(n: number) {
  return String(Math.max(0, Math.round(n))).padStart(4, "0");
}

function Crosshair({ className }: { className: string }) {
  return (
    <svg
      className={`absolute h-4 w-4 text-ink-muted ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M8 0v16M0 8h16" />
      <circle cx="8" cy="8" r="3.5" />
    </svg>
  );
}

export default function BlueprintGrid() {
  const width = useSyncExternalStore(subscribeResize, getWidth, getServerSize);
  const height = useSyncExternalStore(subscribeResize, getHeight, getServerSize);

  const xMarker = useRef<HTMLDivElement>(null);
  const yMarker = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  // Pointer tracking writes straight to the DOM so the ruler never re-renders on move.
  useEffect(() => {
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (xMarker.current) xMarker.current.style.transform = `translateX(${e.clientX}px)`;
        if (yMarker.current) yMarker.current.style.transform = `translateY(${e.clientY}px)`;
        if (readout.current)
          readout.current.textContent = `X ${pad(e.clientX)}  Y ${pad(e.clientY + window.scrollY)}`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const xLabels = Array.from({ length: Math.floor(width / MAJOR) + 1 }, (_, i) => i * MAJOR);
  const yLabels = Array.from({ length: Math.floor(height / MAJOR) + 1 }, (_, i) => i * MAJOR);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 blueprint-mat">
      {/* Corner registration marks */}
      <Crosshair className="left-3 top-3" />
      <Crosshair className="right-3 top-3" />
      <Crosshair className="bottom-3 left-3" />
      <Crosshair className="bottom-3 right-3" />

      {/* Rulers: hidden on small mobile */}
      <div className="hidden sm:block">
        {/* Left ruler */}
        <div
          className="absolute bottom-6 left-0 top-0 w-6 border-r border-grid-major"
          style={{
            backgroundImage: `linear-gradient(to bottom, var(--grid-major) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-minor) 1px, transparent 1px)`,
            backgroundSize: `100% ${MAJOR}px, 40% ${MINOR}px`,
            backgroundRepeat: "repeat-y",
            backgroundPosition: "right top, right top",
          }}
        >
          {yLabels.map((y) => (
            <span
              key={y}
              className="absolute left-0.5 origin-top-left -rotate-90 text-[9px] leading-none tracking-wider text-ink-muted"
              style={{ top: y + 26 }}
            >
              {pad(y)}
            </span>
          ))}
          <div ref={yMarker} className="absolute left-0 top-0 h-px w-6 bg-cta" />
        </div>

        {/* Bottom ruler */}
        <div
          className="absolute bottom-0 left-6 right-0 h-6 border-t border-grid-major"
          style={{
            backgroundImage: `linear-gradient(to right, var(--grid-major) 1px, transparent 1px), linear-gradient(to right, var(--grid-minor) 1px, transparent 1px)`,
            backgroundSize: `${MAJOR}px 100%, ${MINOR}px 40%`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "-24px top, -24px top",
          }}
        >
          {xLabels.map((x) => (
            <span
              key={x}
              className="absolute bottom-1 text-[9px] leading-none tracking-wider text-ink-muted"
              style={{ left: x - 24 + 3 }}
            >
              {pad(x)}
            </span>
          ))}
          <div ref={xMarker} className="absolute -left-6 top-0 h-6 w-px bg-cta" />
        </div>

        {/* Live coordinate readout */}
        <span
          ref={readout}
          className="absolute bottom-8 right-10 whitespace-pre text-[10px] tracking-[0.2em] text-ink-muted"
        >
          X 0000  Y 0000
        </span>
      </div>
    </div>
  );
}
