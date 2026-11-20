"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { scrollBehavior } from "@/lib/motion";
import { openReservation } from "@/lib/reservation";

const SECTIONS = [
  { href: "#hero", label: "01 OVERVIEW" },
  { href: "#morph", label: "02 ARCHITECTURE" },
  { href: "#features", label: "03 CAPABILITIES" },
  { href: "#specs", label: "04 SPECIFICATIONS" },
];

const DOCS = ["CAD STEP FILES", "QMK FIRMWARE", "API / OSC DOCS"];

const META: [string, string][] = [
  ["MODEL", "K-01 REV.04"],
  ["TOLERANCE", "±0.02MM"],
  ["BATCH", "01 // 500 UNITS"],
  ["INTENT", "DESIGNED FOR PRECISION"],
];

function ColumnTitle({ children }: { children: string }) {
  return <p className="font-mono text-[10px] tracking-[0.24em] text-ink-muted">{children}</p>;
}

export default function Footer() {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (doc: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(`${doc} // BATCH 01 DOCS UNLOCK AT LAUNCH`);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const toTop = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    window.history.replaceState(null, "", "/");
  };

  const linkClass =
    "group inline-flex items-center gap-3 font-mono text-xs tracking-[0.16em] text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink";

  return (
    <footer id="footer" className="relative z-20 border-t border-white/15 bg-[#080C0E] px-6 pb-10 pt-16 md:px-12">
      {/* Reservation bar */}
      <div className="flex flex-col gap-8 border-b border-white/15 pb-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold leading-[0.92] tracking-[-0.01em]">
            READY FOR BATCH 01
          </h2>
          <p className="mt-4 font-mono text-xs tracking-[0.16em] text-ink-muted">
            LIMITED RUN OF 500 SERIALIZED UNITS — SHIPS Q1
          </p>
        </div>
        <button
          type="button"
          onClick={openReservation}
          className="group inline-flex w-full shrink-0 items-center justify-between gap-6 whitespace-nowrap border border-cta bg-cta px-6 py-4 font-mono text-xs font-semibold tracking-[0.2em] text-mat transition-colors duration-200 hover:bg-transparent hover:text-cta focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cta sm:w-auto"
        >
          RESERVE K-01 UNIT
          <svg className="h-2.5 w-3 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
            <path d="M0 5h11M7 1l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* Navigation hub */}
      <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <nav aria-label="Footer sections">
          <ColumnTitle>INDEX</ColumnTitle>
          <ul className="mt-5 space-y-3">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <a href={s.href} className={linkClass}>
                  <span aria-hidden="true" className="h-px w-3 bg-current transition-[width] duration-200 group-hover:w-5" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <ColumnTitle>TECHNICAL DOCS</ColumnTitle>
          <ul className="mt-5 space-y-3">
            {DOCS.map((d) => (
              <li key={d}>
                <button type="button" onClick={() => showToast(d)} className={linkClass}>
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                    <path d="M2.5 5.5V3.5a3.5 3.5 0 0 1 7 0v2M1.5 5.5h9v6h-9z" />
                  </svg>
                  {d}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ColumnTitle>SERIAL // BLUEPRINT</ColumnTitle>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 font-mono text-xs tracking-[0.14em]">
            {META.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/15 pt-8">
        <Link
          href="/"
          onClick={toTop}
          aria-label="Back to top"
          className="group block font-display text-[clamp(2.25rem,5.4vw,6.5rem)] lg:whitespace-nowrap font-extrabold leading-[0.85] tracking-[-0.03em] text-white/[0.07] transition-colors duration-300 hover:text-white/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          K-01 {"//"} STUDIO DIAL
        </Link>
        <div className="mt-6 flex flex-col gap-2 font-mono text-[10px] tracking-[0.2em] text-ink-muted sm:flex-row sm:justify-between">
          <span>© 2026 K-01 HARDWARE</span>
          <span>SHEET 1 OF 1 // SCALE 1:1</span>
        </div>
      </div>

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 border border-white/20 bg-[#0F161A] px-4 py-3 font-mono text-[10px] tracking-[0.18em] text-ink transition-[opacity,transform] duration-300 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span className="flex items-center gap-3">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-cta" />
          {toast ?? ""}
        </span>
      </div>
    </footer>
  );
}
