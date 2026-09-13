How motion and graphics are built: the hand-rolled hook system, the motion components, the WebGL scene tree, and the redesign that retires most of it.

Both source sections are marked superseded — **carry these markers forward; they are the "before" state the redesign's diagnosis depends on.**

---

## Part 1 — WebGL / Graphics Architecture

> **⚠️ BEING RETIRED 2026-09-12 by §26 (Landing Redesign).** The entire `three/` tree described below is **reachable only from `landing/Hero.tsx`** — verified 2026-09-12: every `three` / `@react-three/fiber` / `@react-three/drei` import in the codebase is inside that one directory, and nothing else imports it. The redesign retires the orbit scene, and with it `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`, `useSceneActive`, and **the React `~19.2.8` pin** (which exists solely for R3F's `peer react: ">=19 <19.3"` range). Retained below as the accurate description of what is live until §26 ships.

One coordinated system in `three/` (V1's `HeroScene` / `CourseOrbit3D` / `FloatingParticles` — three separate canvases — were deleted; V2 consolidated to one):

- `core/CanvasShell` — frameloop pauses off-screen via `useSceneActive`; `AdaptiveDpr`; `dpr [1, 1.5]`.
- `core/CameraRig` — scroll + pointer, eased targets.
- `core/Lighting` — no per-node point lights; emissive materials + glow sprites instead.
- `primitives/`: `Node` (emissive sphere + halo ring), `Orbit` (torus), `Connector` (quadratic arc line), `ParticleField` (single buffer-geometry points), `GeometryArtifact` (wireframe), `GlowLayer` (canvas radial sprite, additive).
- `scenes/EcosystemScene` — core icosahedron + 3 orbit rings + 5 pillar nodes + connectors + artifacts + particles + Stars. **Theme-aware**: reads next-themes `resolvedTheme` and recolors accordingly.

**Not shipped as WebGL:** programme-page 3D accents (planned — at most one restrained `GeometryArtifact` per hero when built, reusing existing primitives, never a per-page canvas) and a dedicated `CTAAtmosphere` scene. `FinalCTA` uses SVG instead, deliberately, to avoid a second WebGL context.

### What replaces it

The redesign retires the orbit scene entirely. The removed packages are `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`; `useSceneActive` goes with them, and the React pin relaxes from `~19.2.8` to `^19` **only after** R3F is gone. Net effect is a JS win on the landing page even after adding GSAP + Motion, because the hero currently ships a `dynamic({ ssr: false })` WebGL bundle.

**Not overridden elsewhere:** the `THREE.Clock` deprecation warning emitted by R3F 9.7.0 internals is now **obsolete** rather than harmless — it disappears with R3F. The rule against upgrading to a 10.0 canary to silence it is therefore moot, and the "adopt the R3F patch when it ships" roadmap item is obsolete too.

---

## Part 2 — Motion / Interaction Architecture

> **⚠️ SUPERSEDED 2026-09-12 by §26 (Landing Redesign).** The hand-rolled hook system below is the **current shipped** state, but §26 replaces it on the landing surface with **GSAP ScrollTrigger + Motion** (the "no GSAP" rule is explicitly overridden — §26.9). Root cause the redesign fixes: `useScrollProgress` calls `setProgress` on every rAF tick, re-rendering the whole subtree each frame, which is why scroll-linked motion cannot reach 60fps. `useScrollProgress` and `useParallax` are retired once GSAP lands. `CursorProvider` is proposed for retirement (§26.9). The dashboard keeps using these hooks; the change is scoped to the marketing surface.

### Hooks (`src/hooks/`)

- `useScrollProgress(ref, offsetTop?, mode: 'full' | 'visible')` — rAF-throttled. `'full'` (default): 0 = enter, 1 = full exit — use for pinned sections. `'visible'`: 1 = bottom edge reaches viewport bottom — use for path-draw sequences. Exports `clamp01`, `lerp`.
- `useReducedMotion` — single consolidated source of truth (V1 had per-scene duplicates).
- `useScrollLock` — reference-counted; multiple lockers compose safely.
- `useReveal({threshold, rootMargin, once})` — reveals instantly under reduced motion.
- `useParallax`, `useSectionProgress` (IntersectionObserver steps).

### Motion components (`components/educraft/motion/`)

- `Reveal` — polymorphic via `createElement`; direction / delay / distance / duration.
- `MaskLine` — the H1's line-mask reveal: a line translating inside an `overflow-hidden` box, eased by `bezierControlPoints(motion.easing.out)` so the mask and the strand share a curve. **The repo's first `motion/react` consumer** (Stage 2 Task 5); Motion owns the inner span's `transform` and GSAP never touches it.
- `MagneticButton` — fine-pointer only, strength clamped.
- `CursorProvider` — fine-pointer + non-reduced-motion only; the ring scales over interactive elements; contextual label via `data-cursor-label`, currently used on ecosystem nodes.

### The engine split that replaces them

**A rule, not a preference:** GSAP + ScrollTrigger owns anything scrubbed or pinned; Motion owns anything discrete or state-driven; **never both on the same property of the same element.** Registration lives in a single `src/lib/gsap.ts` module — **shipped in Stage 1**. The single-site rule is not just stated: `src/lib/gsap.test.ts` scans the source tree and fails if `registerPlugin` appears in more than one file.

**Reduced motion changes owner.** Once GSAP drives, **CSS can no longer make the reduced-motion guarantee** — the redesign enforces it through `gsap.matchMedia()`, which removes all pinning and renders a plain vertical document in identical DOM order. The CSS-level guarantee in [`system.md`](system.md) covers only what CSS still animates.

**Responsive contract for the pinned/scrubbed acts:** the thread always runs parallel to the axis you scroll — desktop pins and scrubs horizontally; tablet is a vertical spine with **no pin** (pin-plus-horizontal at 768px fights the browser's own gestures); mobile uses **native `overflow-x` snap, never a pinned track on touch** (a pinned horizontal track is how you break vertical page scroll).

### Constraints that still apply to motion work

- **`overflow-hidden` on a pinned-section ancestor breaks `position: sticky`** — it becomes the sticky element's scroll box. Overflow handling belongs only on the sticky inner element. `StudentJourney` and `ProgrammeExplorer` must keep section-level overflow visible.
- **Hydration:** anything derived from next-themes' `theme` (or any other post-mount state) inside SSR'd markup must be gated on a `mounted` flag.
- **`tw-animate-css`:** `animate-in` keyframes only fire on key-remount (used for stage/tab crossfades).
- **Superseded R3F rule:** imperative scene-graph mutation inside `useFrame` needed `// eslint-disable-next-line react-hooks/immutability`. **SUPERSEDED 2026-09-12 — R3F is retired (§26).** The equivalent rule for the redesign: **GSAP writes styles to the DOM directly and must never be mixed with Motion on the same property of the same element.**

### Where scroll calibration is verified

Because the assistant never launches a browser, calibration is **encoded as pure functions with Vitest tests** — `stationPositions(N)`, `perStationVh(N)`, `pathFor`, `drawAt`, and `assertContinuity`. **The seam rule is a shape, not an equality:** each act's exit sits on its own bottom edge, the next act's entry on its top edge, and the two share one horizontal fraction. An earlier version of this line — and of `spec.md` §10.1, corrected in Stage 2 Task 1 — said the two anchors must be equal as values, which no correct vertical chain can satisfy, since each anchor lives in its own act's box. A chain of fewer than two acts **throws** rather than passing vacuously. A dev-only `?calibrate=1` overlay prints scrub progress, active station, draw fraction and breakpoint branch so visual QA produces reportable numbers rather than impressions.
