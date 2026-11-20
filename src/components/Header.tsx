"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { scrollBehavior } from "@/lib/motion";
import { openReservation } from "@/lib/reservation";
import type { MouseEvent } from "react";

const SECTIONS = [
  { id: "hero", index: "01", label: "OVERVIEW" },
  { id: "morph", index: "02", label: "ARCHITECTURE" },
  { id: "features", index: "03", label: "CAPABILITIES" },
  { id: "specs", index: "04", label: "SPECIFICATIONS" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function Header() {
  const [active, setActive] = useState<SectionId>("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          // The footer belongs to the specifications chapter.
          setActive(id === "footer" ? "specs" : (id as SectionId));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    ["hero", "morph", "features", "specs", "footer"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const toTop = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    window.history.replaceState(null, "", "/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-grid-major bg-mat">
      <div className="flex h-14 items-center justify-between px-4 sm:px-10">
        <Link
          href="/"
          onClick={toTop}
          className="font-display text-sm font-extrabold tracking-[0.08em] text-ink sm:text-base"
        >
          K-01 <span className="text-ink-muted">{"//"}</span> REV.04
        </Link>

        <nav aria-label="Sections" className="hidden md:block">
          <ol className="flex items-center gap-6 font-mono text-[11px] tracking-[0.18em]">
            {SECTIONS.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`${s.index} ${s.label}`}
                    className={`group flex items-center gap-2 transition-colors ${
                      isActive ? "text-ink" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 border transition-colors ${
                        isActive ? "border-cta bg-cta" : "border-ink-muted bg-transparent"
                      }`}
                    />
                    <span>{s.index}</span>
                    <span className="hidden xl:inline">{s.label}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <button
          type="button"
          onClick={openReservation}
          className="group relative flex items-center gap-3 border border-cta bg-cta px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.18em] text-mat transition-colors duration-200 hover:bg-transparent hover:text-cta focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-cta"
        >
          <span>RESERVE UNIT</span>
          <svg
            className="h-2.5 w-3 transition-transform duration-200 group-hover:translate-x-1"
            viewBox="0 0 12 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            aria-hidden="true"
          >
            <path d="M0 5h11M7 1l4 4-4 4" />
          </svg>
        </button>
      </div>
    </header>
  );
}
