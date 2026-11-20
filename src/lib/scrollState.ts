/**
 * Shared mutable scroll state.
 *
 * GSAP ScrollTrigger writes to this object and the R3F render loop reads it
 * inside `useFrame`. It is deliberately not React state, so scrolling never
 * triggers a React re-render.
 */
export interface ScrollState {
  /** 0 = Hero (blueprint wireframe), 0.35 = Solid anodized metal, 1 = Full exploded assembly */
  morphProgress: number;
  /** 0, 1, or 2 corresponding to the 3 technical callout stages in #morph */
  activeStage: number;
  /** 1 while in #hero and #morph, smoothly fades to 0 as user enters #features */
  canvasOpacity: number;
}

export const scrollState: ScrollState = {
  morphProgress: 0,
  activeStage: 0,
  canvasOpacity: 1,
};
