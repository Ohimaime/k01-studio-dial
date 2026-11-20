"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Unit = "mm" | "in";

const DIMS_MM = { w: 118.0, d: 76.0, h: 28.4 };

function fmt(mm: number, unit: Unit) {
  return unit === "mm" ? mm.toFixed(1) : (mm / 25.4).toFixed(2);
}

function envelope(unit: Unit) {
  return `${fmt(DIMS_MM.w, unit)} × ${fmt(DIMS_MM.d, unit)} × ${fmt(DIMS_MM.h, unit)} ${unit.toUpperCase()}`;
}

const MAX_TILT = 6;

/* ------------------------------------------------------------------ */
/* Schematics                                                          */
/* ------------------------------------------------------------------ */

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  vectorEffect: "non-scaling-stroke" as const,
};

function DimText({ x, y, children, rotate }: { x: number; y: number; children: string; rotate?: boolean }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize="11"
      letterSpacing="1.4"
      className="fill-ink font-mono"
      transform={rotate ? `rotate(-90 ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

/* Body: 118 x 76 mm drawn at 2.6 px/mm -> 307 x 198 */
const BX = 40;
const BY = 44;
const BW = 307;
const BD = 198;
const DIAL = { cx: BX + BW * 0.31, cy: BY + BD / 2, r: 63 };
const KEY = 43;
const KEYS = [0.69, 0.87].flatMap((fx) => [-31.5, 31.5].map((dz) => ({ x: BX + BW * fx, y: BY + BD / 2 + dz })));

function TopView({ unit }: { unit: Unit }) {
  return (
    <svg viewBox="0 0 400 270" className="h-auto w-full text-ink" role="img" aria-label={`Top view, ${fmt(DIMS_MM.w, unit)} by ${fmt(DIMS_MM.d, unit)} ${unit}`}>
      <text x="0" y="12" fontSize="9" letterSpacing="1.4" className="fill-ink-muted font-mono">VIEW A // PLAN</text>
      {/* Body */}
      <rect x={BX} y={BY} width={BW} height={BD} rx="8" {...line} />
      <rect x={BX + 8} y={BY + 8} width={BW - 16} height={BD - 16} rx="4" {...line} strokeOpacity="0.4" />
      {/* Centre lines */}
      <path d={`M${DIAL.cx} ${BY - 10}V${BY + BD + 10}M${BX - 10} ${DIAL.cy}H${BX + BW + 10}`} {...line} strokeOpacity="0.25" strokeDasharray="6 3 1 3" />
      {/* Dial */}
      <circle cx={DIAL.cx} cy={DIAL.cy} r={DIAL.r} {...line} />
      <circle cx={DIAL.cx} cy={DIAL.cy} r={DIAL.r - 7} {...line} strokeOpacity="0.5" />
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={DIAL.cx + Math.cos(a) * DIAL.r}
            y1={DIAL.cy + Math.sin(a) * DIAL.r}
            x2={DIAL.cx + Math.cos(a) * (DIAL.r + 3)}
            y2={DIAL.cy + Math.sin(a) * (DIAL.r + 3)}
            {...line}
            strokeOpacity="0.5"
          />
        );
      })}
      {/* Datum marker + indicator notch */}
      <g className="text-cta">
        <path d={`M${DIAL.cx} ${DIAL.cy - DIAL.r + 8}v18`} {...line} />
        <circle cx={DIAL.cx} cy={DIAL.cy} r="5" {...line} />
        <path d={`M${DIAL.cx - 9} ${DIAL.cy}h18M${DIAL.cx} ${DIAL.cy - 9}v18`} {...line} />
      </g>
      <text x={DIAL.cx + 10} y={DIAL.cy + 20} fontSize="9" letterSpacing="1.2" className="fill-cta font-mono">DATUM A</text>
      {/* Keys */}
      {KEYS.map((k) => (
        <g key={`${k.x}-${k.y}`}>
          <rect x={k.x - KEY / 2} y={k.y - KEY / 2} width={KEY} height={KEY} rx="4" {...line} />
          <path d={`M${k.x - 4} ${k.y}h8M${k.x} ${k.y - 4}v8`} {...line} strokeOpacity="0.5" />
        </g>
      ))}
      {/* Width dimension */}
      <path d={`M${BX} ${BY - 6}V${BY - 30}M${BX + BW} ${BY - 6}V${BY - 30}M${BX} ${BY - 22}H${BX + BW}`} {...line} strokeOpacity="0.6" />
      <path d={`M${BX + 6} ${BY - 26}l-6 4 6 4M${BX + BW - 6} ${BY - 26}l6 4 -6 4`} {...line} strokeOpacity="0.6" />
      <rect x={BX + BW / 2 - 40} y={BY - 30} width="80" height="16" className="fill-[#0F161A]" />
      <DimText x={BX + BW / 2} y={BY - 18}>{`${fmt(DIMS_MM.w, unit)} ${unit.toUpperCase()}`}</DimText>
      {/* Depth dimension */}
      <path d={`M${BX + BW + 6} ${BY}H${BX + BW + 34}M${BX + BW + 6} ${BY + BD}H${BX + BW + 34}M${BX + BW + 26} ${BY}V${BY + BD}`} {...line} strokeOpacity="0.6" />
      <path d={`M${BX + BW + 22} ${BY + 6}l4 -6 4 6M${BX + BW + 22} ${BY + BD - 6}l4 6 4 -6`} {...line} strokeOpacity="0.6" />
      <rect x={BX + BW + 18} y={BY + BD / 2 - 36} width="16" height="72" className="fill-[#0F161A]" />
      <DimText x={BX + BW + 30} y={BY + BD / 2} rotate>{`${fmt(DIMS_MM.d, unit)} ${unit.toUpperCase()}`}</DimText>
    </svg>
  );
}

function SideView({ unit }: { unit: Unit }) {
  const ground = 104;
  const chassisH = 36;
  const dialH = 38;
  const top = ground - chassisH - dialH;
  return (
    <svg viewBox="0 0 400 124" className="h-auto w-full text-ink" role="img" aria-label={`Side elevation, ${fmt(DIMS_MM.h, unit)} ${unit} high`}>
      <text x="0" y="12" fontSize="9" letterSpacing="1.4" className="fill-ink-muted font-mono">VIEW B // ELEVATION</text>
      <path d={`M${BX - 14} ${ground}H${BX + BW + 14}`} {...line} strokeOpacity="0.35" strokeDasharray="2 3" />
      {/* Chassis */}
      <path d={`M${BX + 6} ${ground}h${BW - 12}q6 0 6 -6v-${chassisH - 12}q0 -6 -6 -6h-${BW - 12}q-6 0 -6 6v${chassisH - 12}q0 6 6 6z`} {...line} />
      <path d={`M${BX + 8} ${ground - 8}H${BX + BW - 8}`} {...line} strokeOpacity="0.4" />
      {/* Dial */}
      <path d={`M${DIAL.cx - DIAL.r + 2} ${ground - chassisH}L${DIAL.cx - DIAL.r + 4} ${top + 4}L${DIAL.cx - DIAL.r + 10} ${top}H${DIAL.cx + DIAL.r - 10}L${DIAL.cx + DIAL.r - 4} ${top + 4}L${DIAL.cx + DIAL.r - 2} ${ground - chassisH}`} {...line} />
      {Array.from({ length: 11 }, (_, i) => (
        <path key={i} d={`M${DIAL.cx - DIAL.r + 12 + i * 10.4} ${top + 6}V${ground - chassisH - 2}`} {...line} strokeOpacity="0.3" />
      ))}
      <path d={`M${DIAL.cx} ${top - 6}v12`} {...line} className="text-cta" />
      {/* Keys */}
      {[0.69, 0.87].map((fx) => (
        <rect key={fx} x={BX + BW * fx - KEY / 2} y={ground - chassisH - 11} width={KEY} height="11" rx="2" {...line} />
      ))}
      {/* Height dimension */}
      <path d={`M${BX + BW + 6} ${ground}H${BX + BW + 34}M${DIAL.cx + DIAL.r + 4} ${top}H${BX + BW + 34}M${BX + BW + 26} ${top}V${ground}`} {...line} strokeOpacity="0.6" />
      <path d={`M${BX + BW + 22} ${top + 6}l4 -6 4 6M${BX + BW + 22} ${ground - 6}l4 6 4 -6`} {...line} strokeOpacity="0.6" />
      <rect x={BX + BW + 18} y={(top + ground) / 2 - 30} width="16" height="60" className="fill-[#0F161A]" />
      <DimText x={BX + BW + 30} y={(top + ground) / 2} rotate>{`${fmt(DIMS_MM.h, unit)} ${unit.toUpperCase()}`}</DimText>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

function UnitToggle({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  return (
    <div role="group" aria-label="Measurement units" className="flex w-fit border border-white/15 font-mono text-[11px] tracking-[0.2em]">
      {(["mm", "in"] as const).map((u) => {
        const active = unit === u;
        return (
          <button
            key={u}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(u)}
            className={`relative flex items-center gap-2 px-4 py-2.5 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-ink ${
              active ? "bg-white/[0.06] text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            <span aria-hidden="true" className={`h-1.5 w-1.5 border transition-colors ${active ? "border-cta bg-cta" : "border-ink-muted"}`} />
            {u.toUpperCase()}
            <span aria-hidden="true" className={`absolute inset-x-0 -bottom-px h-px bg-cta transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0"}`} />
          </button>
        );
      })}
    </div>
  );
}

function layer(depth: number, travel: number): CSSProperties {
  return {
    transform: `translate3d(calc(var(--px, 0) * ${travel}px), calc(var(--py, 0) * ${travel}px), ${depth}px)`,
    transformStyle: "preserve-3d",
  };
}

export default function SpecsSection() {
  const [unit, setUnit] = useState<Unit>("mm");
  const cardRef = useRef<HTMLDivElement>(null);

  // Pointer tilt: damped in rAF, written straight to the DOM. Disabled for touch / coarse pointers.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;

    const render = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      const k = 1 - Math.exp(-8 * dt);
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;
      card.style.transform = `perspective(1200px) rotateX(${(-current.y * MAX_TILT).toFixed(3)}deg) rotateY(${(current.x * MAX_TILT).toFixed(3)}deg)`;
      card.style.setProperty("--px", current.x.toFixed(4));
      card.style.setProperty("--py", current.y.toFixed(4));
      const settled = Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
      if (settled) {
        raf = 0;
        last = 0;
      } else {
        raf = requestAnimationFrame(render);
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      if (!fine.matches || reduce.matches || e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      kick();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const specs: [string, string][] = [
    ["DIMENSIONS", envelope(unit)],
    ["WEIGHT", "420 G (WITH BRASS BASE)"],
    ["CHASSIS", "CNC 6061-T6 ALUMINUM"],
    ["ENCODER", "CONTACTLESS 14-BIT HALL-EFFECT"],
    ["SWITCHES", "4× LOW-PROFILE HOT-SWAP TACTILE"],
    ["CONNECTIVITY", "USB-C (1000HZ) / 2.4GHZ / BLE 5.3"],
    ["BATTERY", "1,800 MAH (45 DAYS TYPICAL)"],
    ["FINISH", "ANODIZED SLATE // SAFETY ORANGE ACCENT"],
  ];

  const badges: [string, string, boolean][] = [
    ["DATUM A", `DIAL AXIS // Ø ${fmt(48.6, unit)}`, true],
    ["ENVELOPE", envelope(unit), false],
    ["MASS", "420 G", false],
    ["TOLERANCE", unit === "mm" ? "±0.02 MM" : "±0.0008 IN", false],
  ];

  return (
    <section id="specs" aria-labelledby="specs-heading" className="relative z-20 overflow-x-clip px-6 py-24 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.24em] text-ink-muted">04 // TECHNICAL SPECIFICATIONS</p>
            <h2
              id="specs-heading"
              className="mt-5 font-display text-[clamp(1.5rem,7.2vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.01em]"
            >
              BLUEPRINT & TOLERANCES
            </h2>
          </div>
          <UnitToggle unit={unit} onChange={setUnit} />
        </div>

        {/* Parallax product card */}
        <div
          ref={cardRef}
          className="relative mt-12 border border-white/15 bg-[#0F161A] will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Layer 1: base grid + registration marks */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              ...layer(0, -4),
              backgroundImage:
                "linear-gradient(to right, rgba(242,244,243,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,244,243,0.05) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "-1px -1px",
            }}
          >
            {["left-3 top-3", "right-3 top-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
              <svg key={pos} className={`absolute h-3 w-3 text-ink-muted ${pos}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 0v12M0 6h12" />
              </svg>
            ))}
          </div>

          <div className="relative grid gap-8 p-6 md:grid-cols-[1.5fr_1fr] md:gap-10 md:p-10" style={{ transformStyle: "preserve-3d" }}>
            {/* Layer 2: schematic */}
            <div className="flex flex-col gap-6" style={layer(30, 6)}>
              <TopView unit={unit} />
              <SideView unit={unit} />
            </div>

            {/* Layer 3: floating readouts */}
            <div className="grid grid-cols-2 content-center gap-3 md:grid-cols-1" style={layer(70, 14)}>
              {badges.map(([label, value, accent]) => (
                <div key={label} className="border border-white/25 bg-mat px-4 py-3">
                  <p className="flex items-center gap-2 font-mono text-[9px] tracking-[0.24em] text-ink-muted">
                    <span aria-hidden="true" className={`h-1.5 w-1.5 ${accent ? "bg-cta" : "border border-ink-muted"}`} />
                    {label}
                  </p>
                  <p className="mt-2 font-mono text-[11px] font-medium tracking-[0.12em] text-ink md:text-xs">{value}</p>
                </div>
              ))}
              <p className="col-span-2 font-mono text-[9px] tracking-[0.24em] text-ink-muted md:col-span-1">
                SHEET 03 // SCALE 1:2 // THIRD-ANGLE PROJ.
              </p>
            </div>
          </div>
        </div>

        {/* Spec matrix */}
        <dl className="mt-12 grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {specs.map(([label, value]) => (
            <div key={label} className="bg-mat px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.24em] text-ink-muted">{label}</dt>
              <dd className="mt-2 font-mono text-xs font-medium leading-relaxed tracking-[0.08em] text-ink" aria-live={label === "DIMENSIONS" ? "polite" : undefined}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
