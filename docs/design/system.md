The design system's mechanics: the JS token sources, the CSS layer, the component classes, and the Tailwind 4 constraints that govern both.

Colour values, contrast ratios and the palette's role lessons live in [`palette.md`](palette.md).

---

## 1. JS sources of truth

| File | Holds |
|---|---|
| `src/design/colors.ts` | the colour system — see [`palette.md`](palette.md) |
| `src/design/typography.ts` | the type scale + the `typeStyle()` helper |
| `src/design/motion.ts` | durations **100ms–1.2s**; baseline easing `cubic-bezier(0.22, 1, 0.36, 1)` |
| `src/design/tokens.ts` | 4px spacing scale, radii, shadows, z-ladder `base`→`cursor`=**120**, layout gutters |

See [`motion.md`](motion.md) for the motion system and its supersession status.

### Typography

Two families: **Sora 700** for display/headings, **Manrope 400/500/600** for interface and body, both loaded via `next/font`.

The type scale is a named, responsive **clamp** set declared twice — once in `typography.ts` and once as the `.type-*` component classes in `globals.css`, which mirror it:

| Name | Size target (px) |
|---|---|
| `displayXL` | 84 |
| `displayL` | 68 |
| `displayM` | 52 |
| `headingXL` | 44 |
| `headingL` | 36 |
| `headingM` | 28 |
| `headingS` | 22 |
| `bodyL` | 20 |
| `bodyM` | 17 |
| `bodyS` | 14 |
| `caption` | 12 |

Display and heading styles are clamped; body and caption are fixed rem. Apply via `typeStyle(key)` (inline styles) or the `.type-*` class.

**Reading measure** (`typography.ts`): body copy should stay within ~55–75 characters — `measure.narrow` `36ch`, `measure.regular` `55ch`, `measure.wide` `75ch`.

### Layout tokens

`tokens.ts`: `maxWidth` 1440px, `contentWidth` 1200px, responsive gutters mobile 24 / tablet 32 / desktop 48 / wide 64. Spacing follows the 4px scale (`0, 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160, 192`). Radii `sm` 8 / `md` 12 / `lg` 16 / `xl` 24 / `2xl` 32 / `pill`. Elevation is restrained and indigo-tinted.

**Z-order ladder** — one canonical scale for the whole app: `base` 0 · `raised` 10 · `sticky` 30 · `nav` 50 · `overlay` 90 · `modal` 100 · `cursor` 120.

### Motion tokens

`motion.ts` exports durations in seconds — `instant` 0.1, `fast` 0.16, `standard` 0.24, `emphasis` 0.4, `reveal` 0.7, `hero` 1.2 — and three easings: `out` `cubic-bezier(0.22, 1, 0.36, 1)` (the baseline for UI motion), `inOut` `cubic-bezier(0.65, 0, 0.35, 1)`, `soft` `cubic-bezier(0.16, 1, 0.3, 1)`. `durationMs(key)` returns milliseconds for `setTimeout` / `transition-duration`.

The CSS layer mirrors these as `--ease-out-soft`, `--ease-inout-soft`, `--ease-soft`.

## 2. The CSS layer — `src/app/globals.css`

`@theme inline` maps everything to runtime CSS vars that flip under `.dark`. The aliases are what make the Tailwind classes exist; a token must be declared in `:root`, `.dark`, **and** `@theme inline`.

The shadcn variable contract (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`) is defined in full in the same file, which is why shadcn components inherit the Educraft palette with no theming fight.

**Programme accent system:** `--ec-p-{learn,include,thrive,achieve,excel}` with a `-graphic` and a `-soft` sibling each, aliased to `text-ec-learn`, `text-ec-learn-graphic`, `bg-ec-learn-soft`, etc. Full details and values in [`palette.md`](palette.md).

### Component classes

| Class | Definition |
|---|---|
| `container-site` | 1440 max, 64/48/32/24px gutters |
| `container-content` | 1200 max |
| `type-{display-xl…caption}` | the scale above, clamped |
| `eyebrow` (+ `eyebrow-rule`) | micro-label: all-caps, 12px, `letter-spacing: 0.1em`, Manrope 600; `eyebrow-rule` adds a 1.5rem × 1px leading rule at 0.7 opacity |
| `card-surface` | `background: var(--card)`, `1px solid var(--ec-border)`, `border-radius: var(--radius-xl)` |
| `reveal-on-scroll` | opacity 0 + `translateY(16px)` → `.revealed` clears both; 0.7s `--ease-out-soft` |
| `hero-enter` / `hero-enter-fade` | staged hero entrance, delay via `--hero-delay` |
| `ambient-drift` / `ambient-pulse` | ambient micro-motion |

Also in the utilities layer: `reveal-delay` (stagger offset via `--reveal-delay`), `no-scrollbar`, `canvas-container`, a 6px custom scrollbar, and a global `:focus-visible` outline of `2px solid var(--ec-focus)` at `2px` offset.

### Reduced motion is a CSS-level guarantee

A global `@media (prefers-reduced-motion: reduce)` block:

- sets `scroll-behavior: auto` on `html`,
- kills all animation and transition durations (`0.01ms !important`, single iteration),
- and **un-hides reveals** — `.reveal-on-scroll`, `.hero-enter`, `.hero-enter-fade` get `opacity: 1`, `transform: none`, `animation: none`, and `.ambient-drift` / `.ambient-pulse` stop.

This is deliberate: reduced motion is enforced at the CSS level, **not** as a per-component JS branch.

> **Caveat that follows from it:** once a JS animation engine drives a property, CSS can no longer make this guarantee — the engine has to provide its own reduced-motion path via `matchMedia`. See [`motion.md`](motion.md).

## 3. Critical Tailwind 4 constraint

**Dynamic class construction (`` `bg-ec-${x}` ``) does not generate CSS at build time.** Only literal class names in source produce a class.

All pillar → class mappings are therefore written literally in `src/lib/pillarStyles.ts`. That file is **one registry**, `pillarAccent: Record<PillarId, PillarAccentClasses>`, with three class + three raw-var fields per pillar:

| Field | Value for `learn` | Use |
|---|---|---|
| `text` | `text-ec-learn` | the text-safe accent |
| `graphic` | `text-ec-learn-graphic` | non-text accent for strokes and nodes |
| `bg` | `bg-ec-learn` | the **text-safe** tier used as a background (not `graphic`) |
| `softBg` | `bg-ec-learn-soft` | wash background |
| `border` | `border-ec-learn` | border in the text-safe accent |
| `accentVar` | `var(--ec-p-learn)` | raw CSS var for SVG `stroke` / `fill` — theme-aware |
| `graphicVar` | `var(--ec-p-learn-graphic)` | raw CSS var for the graphic tier |
| `softVar` | `var(--ec-p-learn-soft)` | raw CSS var for the wash |

**Superseded shape — the six parallel maps are gone.** The mappings were previously six separate `Record<PillarId, string>` exports (`pillarTextClass`, `pillarBgClass`, `pillarSoftBgClass`, `pillarBorderClass`, `pillarAccentVar`, `pillarSoftVar`) — six chances to drift when a pillar was added. They now exist only as `@deprecated` re-exports derived from `pillarAccent`, kept so no call site had to change. **New code should reach for `pillarAccent[id].<field>`**; note that `graphicVar` is the one to use for strokes, since `accentVar` is now the text tier.

Because `pillarAccent` is annotated `Record<PillarId, …>`, adding a pillar is a **compile error** until its entry exists — the "keep in sync" comment became a type error.

## 4. Decorative background systems

Reusable, not redrawn per section — each is a shared component in `components/educraft/graphics/DecorativeSystems.tsx`, not bespoke per instance:

| System | Used by |
|---|---|
| dotted-constellation (`Constellation`) | hero mobile fallback, ecosystem sections |
| topographic lines (`TopographicLines`) | curriculum background |
| path lines (`PathLines`) | footer, section transitions |

The same module also exports `GradientMesh` and `GridPattern`. All five take `className` and `colorClassName` (the latter defaults to `text-ec-teal` for the constellation/path layers and `text-ec-indigo` for the mesh/topographic/grid layers).
