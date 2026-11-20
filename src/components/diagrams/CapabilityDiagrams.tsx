/**
 * 1px architectural line diagrams for the Depth Stack cards.
 * All strokes use non-scaling-stroke so they stay hairline at any size.
 */

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  vectorEffect: "non-scaling-stroke" as const,
};

function Label({ x, y, children, anchor = "start" }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className="fill-ink-muted font-mono" fontSize="9" letterSpacing="1.2">
      {children}
    </text>
  );
}

/** 01: encoder ring with detent ticks + detent torque waveform. */
export function HapticDiagram() {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const r1 = 58;
    const r2 = i % 6 === 0 ? 70 : 65;
    return (
      <line key={i} x1={100 + Math.cos(a) * r1} y1={90 + Math.sin(a) * r1} x2={100 + Math.cos(a) * r2} y2={90 + Math.sin(a) * r2} {...base} />
    );
  });
  // Sawtooth-ish detent torque profile
  const wave = Array.from({ length: 13 }, (_, i) => `${i === 0 ? "M" : "L"}${190 + i * 12} ${i % 2 ? 62 : 118}`).join(" ");
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full text-ink" role="img" aria-label="Encoder ring with 24 detent ticks and torque waveform">
      <circle cx="100" cy="90" r="46" {...base} />
      <circle cx="100" cy="90" r="58" {...base} strokeOpacity="0.5" />
      <circle cx="100" cy="90" r="3" {...base} />
      <path d="M100 30v120M40 90h120" {...base} strokeOpacity="0.25" strokeDasharray="2 4" />
      {ticks}
      <path d="M182 90h160" {...base} strokeOpacity="0.25" />
      <path d="M182 40v100" {...base} strokeOpacity="0.25" />
      <path d={wave} {...base} />
      <Label x={182} y={34}>TORQUE</Label>
      <Label x={342} y={156} anchor="end">ANGLE / 15°</Label>
      <Label x={100} y={182} anchor="middle">24 DETENT RING</Label>
    </svg>
  );
}

/** 02: connectivity topology: device to hosts over USB-C and 2.4GHz. */
export function BridgeDiagram() {
  const hosts = [
    { y: 34, label: "MIDI" },
    { y: 90, label: "OSC" },
    { y: 146, label: "HID" },
  ];
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full text-ink" role="img" aria-label="Topology from the K-01 to MIDI, OSC and HID hosts">
      <rect x="20" y="66" width="86" height="48" {...base} />
      <circle cx="44" cy="90" r="12" {...base} />
      <rect x="64" y="80" width="10" height="10" {...base} />
      <rect x="80" y="80" width="10" height="10" {...base} />
      <rect x="64" y="94" width="10" height="10" {...base} />
      <rect x="80" y="94" width="10" height="10" {...base} />
      <Label x={20} y={58}>K-01</Label>
      {/* USB-C bus */}
      <path d="M106 90h70" {...base} />
      <rect x="150" y="85" width="16" height="10" rx="5" {...base} />
      {/* Wireless arcs */}
      <path d="M126 58a22 22 0 0 1 22 -22M126 50a30 30 0 0 1 30 -30" {...base} strokeOpacity="0.6" />
      <Label x={126} y={128}>USB-C / 2.4G</Label>
      {/* Fan out */}
      <path d="M176 90h28" {...base} />
      <path d="M204 34v112" {...base} />
      {hosts.map((h) => (
        <g key={h.label}>
          <path d={`M204 ${h.y}h44`} {...base} />
          <rect x="248" y={h.y - 14} width="92" height="28" {...base} />
          <Label x={294} y={h.y + 3} anchor="middle">{h.label}</Label>
        </g>
      ))}
      <Label x={20} y={186}>DRIVERLESS // MACOS + LINUX</Label>
    </svg>
  );
}

/** 03: low-profile switch cross-section. */
export function SwitchDiagram() {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full text-ink" role="img" aria-label="Cross-section of a low-profile hot-swap switch">
      {/* Keycap */}
      <path d="M70 40h140l-8 22H78z" {...base} />
      {/* Stem */}
      <path d="M132 62h16v34h-16z" {...base} />
      <path d="M126 76h28" {...base} />
      {/* Housing */}
      <path d="M92 84h96v38H92z" {...base} />
      {/* Spring */}
      <path d="M134 98l12 4-12 4 12 4-12 4 12 4" {...base} />
      {/* Hot-swap socket + PCB */}
      <path d="M118 122h44v10h-44z" {...base} strokeOpacity="0.7" />
      <path d="M40 132h200v8H40z" {...base} />
      {/* Gasket */}
      <path d="M40 148h200" {...base} strokeDasharray="3 3" />
      {/* Leaders */}
      <path d="M210 51h40M188 103h62M162 127h88M240 136h10M240 148h10" {...base} strokeOpacity="0.4" />
      <Label x={256} y={54}>KEYCAP</Label>
      <Label x={256} y={106}>TACTILE LEAF</Label>
      <Label x={256} y={130}>HOT-SWAP</Label>
      <Label x={256} y={140}>PCB</Label>
      <Label x={256} y={152}>GASKET</Label>
      <Label x={40} y={182}>TRAVEL 1.8MM // ACTUATION 0.8MM</Label>
    </svg>
  );
}

/** 04: chassis acoustic section with hatched brass weight. */
export function AcousticsDiagram() {
  const hatch = Array.from({ length: 29 }, (_, i) => (
    <path key={i} d={`M${46 + i * 8} 146l8 -12`} {...base} strokeOpacity="0.45" />
  ));
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full text-ink" role="img" aria-label="Section through the aluminum chassis, gasket and brass base weight">
      {/* Shell */}
      <path d="M30 60h270v96H30z" {...base} />
      <path d="M42 72h246v62H42z" {...base} strokeOpacity="0.6" />
      {/* Gasket ring */}
      <path d="M42 128h246" {...base} strokeDasharray="3 3" />
      {/* Brass weight */}
      <path d="M46 134h238v12H46z" {...base} />
      {hatch}
      {/* Dial + keys above */}
      <path d="M70 60v-20h80v20" {...base} />
      <path d="M190 60v-10h32v10M234 60v-10h32v10" {...base} />
      {/* Dimension */}
      <path d="M30 172h270M30 166v12M300 166v12" {...base} strokeOpacity="0.5" />
      <Label x={165} y={190} anchor="middle">118.0 // DAMPED SECTION A-A</Label>
      <Label x={308} y={144}>BRASS</Label>
      <Label x={308} y={131}>SIL.</Label>
      <Label x={308} y={68}>6061</Label>
    </svg>
  );
}
