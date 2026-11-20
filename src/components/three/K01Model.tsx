"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/motion";
import { scrollState } from "@/lib/scrollState";

const { lerp, clamp, smoothstep } = THREE.MathUtils;

/* Morph breakpoints */
const SOLID_AT = 0.35;

/* Root orientation: isometric blueprint -> 3/4 showcase */
const ROT_BLUEPRINT = new THREE.Euler(0.65, -0.55, 0.12);
const ROT_SHOWCASE = new THREE.Euler(0.42, 0.35, 0);

/* Opacity ranges */
const SOLID_GHOST = 0.12;
const EDGE_FULL = 0.85;
const EDGE_HAIRLINE = 0.12;

/* Sub-assembly rest heights (local Y) */
const CHASSIS_H = 0.42;
const DECK_TOP = CHASSIS_H / 2 + 0.01; // top of the inset deck plate
const BASE_Y = {
  chassis: 0,
  pcb: 0.08, // sits inside the chassis body when assembled
  dial: DECK_TOP + 0.26,
  keys: DECK_TOP,
} as const;

/* Layout */
const DIAL_X = -0.65;
const KEY_POSITIONS: [number, number][] = [
  [0.65, -0.35],
  [1.25, -0.35],
  [0.65, 0.35],
  [1.25, 0.35],
];
const RIB_COUNT = 36;

const ACCENT = "#FF4D00";
const INK = "#F2F4F3";

function useSolidMaterials() {
  return useMemo(() => {
    const make = (params: THREE.MeshStandardMaterialParameters) =>
      new THREE.MeshStandardMaterial({ transparent: true, opacity: SOLID_GHOST, ...params });

    const m = {
      chassis: make({ color: "#181E22", metalness: 0.85, roughness: 0.28 }),
      deck: make({ color: "#0E1316", metalness: 0.6, roughness: 0.45 }),
      screw: make({ color: "#3A444B", metalness: 0.95, roughness: 0.22 }),
      pcb: make({ color: "#0E221D", metalness: 0.2, roughness: 0.6 }),
      trace: make({ color: "#B8873A", metalness: 0.9, roughness: 0.32 }),
      encoder: make({ color: "#22292E", metalness: 0.7, roughness: 0.35 }),
      dial: make({ color: "#2A333A", metalness: 0.92, roughness: 0.18 }),
      dialCap: make({ color: "#323C44", metalness: 0.94, roughness: 0.14 }),
      rib: make({ color: "#252D33", metalness: 0.9, roughness: 0.24 }),
      indicator: make({
        color: ACCENT,
        emissive: ACCENT,
        emissiveIntensity: 0.35,
        metalness: 0.2,
        roughness: 0.4,
      }),
      keycap: make({ color: "#121619", metalness: 0.15, roughness: 0.55 }),
      housing: make({ color: "#0A0D0F", metalness: 0.3, roughness: 0.6 }),
      stem: make({
        color: ACCENT,
        emissive: ACCENT,
        emissiveIntensity: 0.2,
        metalness: 0.1,
        roughness: 0.5,
      }),
    };
    return { map: m, list: Object.values(m) };
  }, []);
}

export default function K01Model() {
  const viewport = useThree((s) => s.viewport);
  const reducedMotion = useReducedMotion();

  const tiltRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);
  const chassisRef = useRef<THREE.Group>(null);
  const pcbRef = useRef<THREE.Group>(null);
  const dialRef = useRef<THREE.Group>(null);
  const keysRef = useRef<THREE.Group>(null);
  const keycapRefs = useRef<(THREE.Group | null)[]>([]);

  // Collected from the scene graph on the first frame (solid surfaces vs. Edges hairlines).
  const animated = useRef<{ solids: THREE.Material[]; lines: THREE.Material[] } | null>(null);

  const progress = useRef(scrollState.morphProgress);
  const { map: mat, list: solidMaterials } = useSolidMaterials();

  const ribGeometry = useMemo(() => new THREE.BoxGeometry(0.028, 0.4, 0.05), []);
  // Rounded bevels never exceed the 15deg Edges threshold, so outline rounded parts
  // with a sharp proxy box of identical size.
  const chassisOutline = useMemo(() => new THREE.BoxGeometry(3.4, CHASSIS_H, 2.2), []);
  const keycapOutline = useMemo(() => new THREE.BoxGeometry(0.48, 0.16, 0.48), []);

  useEffect(
    () => () => {
      solidMaterials.forEach((m) => m.dispose());
      ribGeometry.dispose();
      chassisOutline.dispose();
      keycapOutline.dispose();
    },
    [solidMaterials, ribGeometry, chassisOutline, keycapOutline],
  );

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-6 * delta);
    progress.current = lerp(progress.current, scrollState.morphProgress, k);
    const p = progress.current;

    // Phase A: blueprint -> solid
    const solidT = smoothstep(p, 0, SOLID_AT);
    const solidOpacity = lerp(SOLID_GHOST, 1, solidT);
    const opaque = solidOpacity > 0.6;
    const edgeOpacity = lerp(EDGE_FULL, EDGE_HAIRLINE, solidT);
    if (!animated.current && rootRef.current) animated.current = collectMaterials(rootRef.current);
    if (animated.current) {
      for (const m of animated.current.solids) {
        m.opacity = solidOpacity;
        m.depthWrite = opaque;
      }
      for (const m of animated.current.lines) m.opacity = edgeOpacity;
    }

    // Phase B: solid -> exploded
    const explodeT = clamp((p - SOLID_AT) / (1 - SOLID_AT), 0, 1);

    const root = rootRef.current;
    if (root) {
      root.rotation.set(
        lerp(ROT_BLUEPRINT.x, ROT_SHOWCASE.x, solidT),
        lerp(ROT_BLUEPRINT.y, ROT_SHOWCASE.y, solidT),
        lerp(ROT_BLUEPRINT.z, ROT_SHOWCASE.z, solidT),
      );
      const wide = viewport.width > 6;
      const narrow = viewport.width < 4;
      root.position.x = wide ? 0.85 * explodeT : 0;
      // Re-centre the taller exploded stack; on phones lift it clear of the bottom card.
      root.position.y = -0.25 * explodeT + (narrow ? 0.55 * solidT : 0);
      root.scale.setScalar(Math.min(1, viewport.width / 5.2));
    }

    if (chassisRef.current) chassisRef.current.position.y = BASE_Y.chassis - 0.28 * explodeT;
    if (pcbRef.current) pcbRef.current.position.y = BASE_Y.pcb + 0.22 * explodeT;
    if (keysRef.current) keysRef.current.position.y = BASE_Y.keys + 0.62 * explodeT;
    if (dialRef.current) {
      dialRef.current.position.y = BASE_Y.dial + 0.95 * explodeT;
      dialRef.current.rotation.y = 1.8 * explodeT;
    }
    // Keycaps lift off their switches to expose the cross-stems.
    for (const cap of keycapRefs.current) if (cap) cap.position.y = 0.18 * explodeT;

    // Pointer parallax on the outer wrapper
    const tilt = tiltRef.current;
    if (tilt) {
      const px = reducedMotion ? 0 : state.pointer.x;
      const py = reducedMotion ? 0 : state.pointer.y;
      tilt.rotation.x = lerp(tilt.rotation.x, -py * 0.08, k * 0.5);
      tilt.rotation.y = lerp(tilt.rotation.y, px * 0.08, k * 0.5);
    }
  });

  const edgeProps = {
    threshold: 15,
    color: INK,
    transparent: true,
    opacity: EDGE_FULL,
    depthWrite: false,
  } as const;

  return (
    <group ref={tiltRef}>
      <group ref={rootRef}>
        {/* 1. Chassis: milled 6061-T6 base */}
        <group ref={chassisRef}>
          <RoundedBox
            args={[3.4, CHASSIS_H, 2.2]}
            radius={0.08}
            smoothness={4}
            material={mat.chassis}
          >
            <Edges {...edgeProps} geometry={chassisOutline} />
          </RoundedBox>
          <mesh position={[0, CHASSIS_H / 2 - 0.01, 0]} material={mat.deck}>
            <boxGeometry args={[3.15, 0.04, 1.95]} />
          </mesh>
          {[
            [-1.48, -0.88],
            [1.48, -0.88],
            [-1.48, 0.88],
            [1.48, 0.88],
          ].map(([x, z]) => (
            <mesh key={`${x}${z}`} position={[x, DECK_TOP + 0.008, z]} material={mat.screw}>
              <cylinderGeometry args={[0.04, 0.04, 0.016, 6]} />
            </mesh>
          ))}
        </group>

        {/* 2. PCB: internal electronics layer */}
        <group ref={pcbRef} position-y={BASE_Y.pcb}>
          <mesh material={mat.pcb}>
            <boxGeometry args={[3.0, 0.05, 1.8]} />
            <Edges {...edgeProps} />
          </mesh>
          {/* Contact traces */}
          {(
            [
              [0.35, 0.0, 0.9, 0.012],
              [0.35, -0.55, 0.012, 0.42],
              [0.35, 0.55, 0.012, 0.42],
              [0.95, -0.7, 1.2, 0.012],
              [0.95, 0.7, 1.2, 0.012],
              [-1.2, 0.0, 0.012, 1.3],
              [-0.95, -0.62, 0.5, 0.012],
              [-0.95, 0.62, 0.5, 0.012],
            ] as const
          ).map(([x, z, w, d], i) => (
            <mesh key={i} position={[x, 0.027, z]} material={mat.trace}>
              <boxGeometry args={[w, 0.004, d]} />
            </mesh>
          ))}
          {KEY_POSITIONS.map(([x, z]) => (
            <mesh key={`pad${x}${z}`} position={[x, 0.027, z]} material={mat.trace}>
              <cylinderGeometry args={[0.07, 0.07, 0.004, 24]} />
            </mesh>
          ))}
          {/* Hall-effect encoder housing beneath the dial */}
          <mesh position={[DIAL_X, 0.085, 0]} material={mat.encoder}>
            <cylinderGeometry args={[0.32, 0.34, 0.12, 48]} />
          </mesh>
          <mesh position={[DIAL_X, 0.148, 0]} material={mat.trace}>
            <cylinderGeometry args={[0.12, 0.12, 0.006, 32]} />
          </mesh>
        </group>

        {/* 3. Dial: machined rotary encoder knob */}
        <group ref={dialRef} position={[DIAL_X, BASE_Y.dial, 0]}>
          <mesh material={mat.dial}>
            <cylinderGeometry args={[0.68, 0.72, 0.52, 64]} />
            <Edges {...edgeProps} />
          </mesh>
          {/* Chamfered top cap ring */}
          <mesh position-y={0.28} material={mat.dialCap}>
            <cylinderGeometry args={[0.6, 0.68, 0.04, 64]} />
          </mesh>
          {/* Knurling ribs */}
          {Array.from({ length: RIB_COUNT }, (_, i) => {
            const a = (i / RIB_COUNT) * Math.PI * 2;
            const r = 0.712;
            return (
              <mesh
                key={i}
                geometry={ribGeometry}
                material={mat.rib}
                position={[Math.cos(a) * r, -0.02, Math.sin(a) * r]}
                rotation-y={-a}
              />
            );
          })}
          {/* Recessed orange indicator notch */}
          <mesh position={[0, 0.296, -0.42]} material={mat.indicator}>
            <boxGeometry args={[0.045, 0.012, 0.22]} />
          </mesh>
        </group>

        {/* 4. Keys: 2x2 mechanical macro matrix */}
        <group ref={keysRef} position-y={BASE_Y.keys}>
          {KEY_POSITIONS.map(([x, z], i) => (
            <Key
              key={`${x}${z}`}
              position={[x, 0, z]}
              housing={mat.housing}
              stem={mat.stem}
              capRef={(el) => {
                keycapRefs.current[i] = el;
              }}
            >
              <RoundedBox
                args={[0.48, 0.16, 0.48]}
                radius={0.04}
                smoothness={4}
                material={mat.keycap}
              >
                <Edges {...edgeProps} geometry={keycapOutline} />
              </RoundedBox>
            </Key>
          ))}
        </group>
      </group>
    </group>
  );
}

function collectMaterials(root: THREE.Object3D) {
  const solids = new Set<THREE.Material>();
  const lines = new Set<THREE.Material>();
  root.traverse((obj) => {
    const material = (obj as THREE.Mesh).material;
    if (!material) return;
    for (const m of Array.isArray(material) ? material : [material]) {
      if (m instanceof THREE.MeshStandardMaterial) solids.add(m);
      else lines.add(m); // drei <Edges> LineMaterial
    }
  });
  return { solids: [...solids], lines: [...lines] };
}

function Key({
  position,
  housing,
  stem,
  capRef,
  children,
}: {
  position: [number, number, number];
  housing: THREE.Material;
  stem: THREE.Material;
  capRef: (el: THREE.Group | null) => void;
  children: ReactNode;
}) {
  return (
    <group position={position}>
      {/* Switch housing */}
      <mesh position-y={0.05} material={housing}>
        <boxGeometry args={[0.34, 0.1, 0.34]} />
      </mesh>
      {/* Cross stem */}
      <mesh position-y={0.13} material={stem}>
        <cylinderGeometry args={[0.035, 0.035, 0.06, 16]} />
      </mesh>
      {/* Keycap (lifts independently when exploded) */}
      <group ref={capRef}>
        <group position-y={0.2}>{children}</group>
      </group>
    </group>
  );
}
