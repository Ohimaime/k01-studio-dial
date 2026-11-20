"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only permitted inside Client Components, so the dynamic
// import lives here and page.tsx (a Server Component) renders this wrapper.
const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), {
  ssr: false,
});

export default function SceneCanvasLoader() {
  return <SceneCanvas />;
}
