"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import K01Model from "./K01Model";
import { scrollState } from "@/lib/scrollState";

export default function SceneCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const setFrameloop = useRef<RootState["setFrameloop"] | null>(null);

  // Mirror scrollState.canvasOpacity onto the DOM each frame; pause rendering when hidden.
  useEffect(() => {
    let raf = 0;
    let lastOpacity = -1;
    let running = true;
    const tick = () => {
      const o = scrollState.canvasOpacity;
      const el = containerRef.current;
      if (el && o !== lastOpacity) {
        el.style.opacity = String(o);
        el.style.visibility = o <= 0.001 ? "hidden" : "visible";
        lastOpacity = o;
      }
      const shouldRun = o > 0.001;
      if (shouldRun !== running && setFrameloop.current) {
        setFrameloop.current(shouldRun ? "always" : "never");
        running = shouldRun;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 h-[100dvh] w-full transition-opacity duration-200"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.2], fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        // The container ignores pointer events, so listen on the document for parallax.
        eventSource={document.body}
        eventPrefix="client"
        onCreated={(state) => {
          setFrameloop.current = state.setFrameloop;
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} color="#F2F4F3" />
        <directionalLight position={[-6, -3, -4]} intensity={0.6} color="#7A8B94" />

        <Environment resolution={256}>
          {/* Overhead cool softbox */}
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#E6EEF2"
            position={[0, 5, 0]}
            rotation-x={Math.PI / 2}
            scale={[8, 4, 1]}
          />
          {/* Right rim strip */}
          <Lightformer
            form="rect"
            intensity={3}
            color="#F2F4F3"
            position={[5, 1, -1]}
            rotation-y={-Math.PI / 2}
            scale={[0.6, 6, 1]}
          />
          {/* Low warm bounce */}
          <Lightformer
            form="rect"
            intensity={0.4}
            color="#FF4D00"
            position={[-2, -4, 2]}
            rotation-x={-Math.PI / 2}
            scale={[6, 3, 1]}
          />
        </Environment>

        <K01Model />
      </Canvas>
    </div>
  );
}
