# K-01 // Studio Dial

A single-page product showcase for the K-01 Studio Dial, a precision rotary controller with a machined Hall-effect dial and four hot-swap macro keys.

The page is drawn as an architectural blueprint. The dial is built procedurally in 3D and changes as you scroll: it starts as a hairline wireframe, turns into anodized metal, then separates into an exploded assembly next to technical callouts.

## Sections

| Index | Anchor      | Content                                                                   |
| ----- | ----------- | ------------------------------------------------------------------------- |
| 01    | `#hero`     | Overview, blueprint wireframe of the dial                                 |
| 02    | `#morph`    | Scroll-driven morph: wireframe to solid to exploded, with 3 callouts      |
| 03    | `#features` | Depth Stack: interactive 4-card capability deck                           |
| 04    | `#specs`    | Pointer-parallax blueprint card, MM / IN toggle, spec matrix              |
|       | footer      | Batch 01 reservation dialog, section index, docs links                    |

## Stack

- **Next.js** (App Router) + **TypeScript**
- **React Three Fiber** + **drei**: procedural model, no external meshes, textures or HDRIs
- **GSAP ScrollTrigger**: scroll scrub writes to a shared mutable state read inside `useFrame`, so scrolling never re-renders React
- **Tailwind CSS** v4: CSS-only blueprint grid, design tokens in `src/app/globals.css`
- Type: Syne (display) and JetBrains Mono (technical), via `next/font`

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Command         | Purpose                     |
| --------------- | --------------------------- |
| `npm run dev`   | Development server          |
| `npm run build` | Production build            |
| `npm run start` | Serve the production build  |
| `npm run lint`  | ESLint                      |

## Structure

```
src/
  app/            layout, page, global tokens
  components/     sections, header, footer, reservation dialog
    three/        canvas, lighting, procedural K-01 model
    diagrams/     1px line diagrams for the capability cards
  lib/            shared scroll state, reservation store, motion helpers
```

## Design rules

- `#FF4D00` is reserved for primary CTAs and active indicators.
- Full-viewport sections use `100dvh`.
- Icons are 1px inline SVGs. No icon libraries, no blur effects.
- `prefers-reduced-motion` turns off transitions, the pointer tilt and smooth scrolling.
