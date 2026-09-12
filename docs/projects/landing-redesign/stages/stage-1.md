Stage 1 (Foundation) of the landing redesign — the executed implementation plan in full, including the commits it produced and its verification evidence.

# Landing Redesign — Stage 1 (Foundation) Implementation Plan

> **Historical record.** This is the Stage 1 plan as executed, kept in full. Its `EDUCRAFT_PRODUCTION.md §N` and `TECH-STACK.md` citations refer to the monolithic documents that existed at the time; those are now pointer stubs and their content lives under `docs/`. The decisions taken *while executing* this plan are in [`../rulings.md`](../rulings.md).


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay the foundation for the "One Line" landing redesign — a test harness, a contrast-calibrated palette, GSAP + Motion installed and registered, the pure Line-geometry system under test, and the pillar registry refactored so that adding a sixth pillar produces compile errors instead of silence.

**Architecture:** Stage 1 changes **no page structure**. It delivers three things the later stages consume: (a) measured colour tokens with an enforced AA test, (b) pure, DOM-free geometry functions (`stationPositions`, `perStationVh`, `pathFor`, `drawAt`, `assertContinuity`) that Stage 2 binds to GSAP, and (c) a derived `PillarId` union so every `Record<PillarId, …>` is compile-checked. The palette migration is **purely additive at the class level** — existing Tailwind class names (`text-ec-learn`, `bg-ec-learn`, `border-ec-learn`, `bg-ec-learn-soft`) keep working and simply gain corrected values, so no call sites are rewritten.

**Tech Stack:** Next.js 16 (App Router, Turbopack) · React 19.2.8 · TypeScript 5 · Tailwind CSS 4 · zod 4 · Vitest (new) · GSAP 3.15 + `@gsap/react` (new) · Motion 13.2 (new)

**Spec:** [`spec.md`](../spec.md) — read §1, §3.1, §6, §7, and §10 before starting. `EDUCRAFT_PRODUCTION.md` §26 is the master-side summary and §26.9 the supersession record.

## Global Constraints

- **Verification loop after every task:** `npx tsc --noEmit && npm run lint && npm run test && npm run build` — all four must pass.
- **Never run `rm -rf .next` while a dev server is running** — a dev server whose `.next` is deleted loses route registrations and serves 404s until restarted (`EDUCRAFT_PRODUCTION.md` §20).
- **Tailwind 4 requires literal class names.** `bg-ec-${x}` generates no CSS. Every pillar→class mapping must be written out literally.
- **Colour values are exact.** Copy them verbatim from Task 2. Do not round, "improve", or re-derive them — every value in this plan was measured against its canvases and the Task 1 test enforces the result.
- **AA floors:** pillar/brand text tiers ≥ **4.5:1** against *every* canvas they can sit on (light: `#ffffff`, `#f6f9fc`, `#eaf3fb`, `#eaf6ff`; dark: `#0b0f1e`, `#10152a`, `#141b38`, `#141d57`). Graphic (non-text) tiers ≥ **3:1** against `#ffffff` (light) and `#0b0f1e` (dark).
- **Reduced motion is a hard requirement.** Any GSAP setup must be paired with `gsap.matchMedia()` handling `(prefers-reduced-motion: reduce)` rendering the final state — CSS can no longer guarantee it once GSAP drives.
- **Do not touch the dashboard.** `src/app/dashboard/**` and `src/components/dashboard/**` are out of scope for the entire redesign.
- **The visual-QA working agreement holds:** the assistant never launches a browser. The owner performs all visual QA.
- **Commits:** one per task, at the end, with the file list staged explicitly.

---

## File Structure

**Created in this stage:**

| File | Responsibility |
|---|---|
| `vitest.config.mts` | Test runner config — node environment, `@/` alias (`.mts`, not `.ts` — see Task 1 Step 2) |
| `src/lib/contrast.ts` | Pure WCAG relative-luminance + contrast-ratio maths. No deps, no DOM. |
| `src/lib/contrast.test.ts` | Assertions for the WCAG maths, against hex literals (Task 1) |
| `src/design/colors.test.ts` | The AA enforcement test over the token table (Task 2) |
| `src/design/scroll.ts` | Pure calibration constants + `perStationVh` / breakpoint branch selection |
| `src/design/scroll.test.ts` | Tests for the above |
| `src/components/educraft/line/station.ts` | `stationPositions(N)`, `drawAt(progress, i, N)` |
| `src/components/educraft/line/station.test.ts` | Tests for the above |
| `src/components/educraft/line/pathBuilders.ts` | `pathFor(from, to, shape)`, `assertContinuity(acts)` |
| `src/components/educraft/line/pathBuilders.test.ts` | Tests for the above |
| `src/components/educraft/line/anchors.ts` | The entry/exit anchor contract as functions of `N` |
| `src/lib/gsap.ts` | Single client-only GSAP registration + named eases |

**Modified in this stage:**

| File | Change |
|---|---|
| `package.json` | Add `test`/`test:watch` scripts; add `vitest`, `gsap`, `@gsap/react`, `motion` |
| `tsconfig.json` | Add `"**/*.mts"` to `include` so the `.mts` vitest config stays type-checked |
| `src/app/globals.css` | Palette values in `:root` / `.dark`; new tokens in `@theme inline` |
| `src/design/colors.ts` | Palette v2 values + reserved slots 6–7 |
| `src/data/pillars.ts` | Add `slug`; `as const satisfies readonly Pillar[]`; export `PillarId` / `PillarSlug` |
| `src/types/index.ts` | `Pillar.id: string`, add `slug: string`, re-export `PillarId` type-only |
| `src/lib/pillarStyles.ts` | Six parallel maps → one `pillarAccent` registry with back-compat re-exports |
| `src/lib/validators/courses.ts` | Derive `verticalLabel`; add compile-time slug assertion to `COURSE_VERTICALS` |

**Not touched in this stage:** `src/app/(site)/page.tsx`, every `src/components/educraft/landing/*`, and `src/components/educraft/three/**`. The page keeps rendering all 12 sections; only its colours change.

---

## Task 1: Test harness + the WCAG contrast maths

This task builds the harness and proves the WCAG maths against hex literals, so it ends **green and buildable**. The palette-enforcement test (`src/design/colors.test.ts`) belongs to Task 2, in the same commit as the token shape it checks: a test cannot reference a type shape that does not exist yet without breaking `tsc`, which is the defect the pre-flight scan caught in an earlier draft of this plan.

**Files:**
- Modify: `package.json`, `tsconfig.json`
- Create: `vitest.config.mts`, `src/lib/contrast.ts`, `src/lib/contrast.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `contrastRatio(a: string, b: string): number`, `relativeLuminance(hex: string): number`, `LIGHT_CANVASES: readonly string[]`, `DARK_CANVASES: readonly string[]`, `AA_TEXT`, `AA_NON_TEXT` — all consumed by Task 2 and by every later palette edit.

- [ ] **Step 1: Install Vitest and add scripts**

```bash
npm install -D vitest
```

Add to `package.json` `"scripts"` (keep the existing keys, insert alphabetically near the others):

```json
"test": "vitest run",
"test:watch": "vitest",
```

Also raise the declared Node floor. `vite@8` (pulled in by vitest) requires `^20.19.0 || >=22.12.0`, but `package.json` currently declares `"node": ">=20.9.0"` — so a machine at the declared floor gets `EBADENGINE` and a harness that may not run. Change it to:

```json
"node": ">=20.19.0"
```

This is a real correction, not a formality: the declared floor must be able to run the declared toolchain.

- [ ] **Step 2: Write the Vitest config**

Create `vitest.config.mts` — **note the `.mts` extension, not `.ts`.** This project's `package.json` has no `"type": "module"`, so a `.ts` config is loaded as CommonJS-with-ESM-syntax, and Vite prints a `configLoader: 'native'` compatibility warning on every run. That warning makes the test output non-pristine, which Step 6 requires. `.mts` marks the file as unambiguously ESM and silences it — verified: with `.ts` the warning appears, with `.mts` it does not and the suite still passes.

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Vitest config (Landing Redesign Stage 1). Node environment only — the tests
 * in this stage deliberately cover **pure** functions (contrast maths, scroll
 * geometry) so that scroll calibration is verifiable without a DOM or a
 * browser. See Landing-Redesign-Plan.md §10.1.
 *
 * The `.mts` extension is deliberate: no "type": "module" in package.json, so
 * a `.ts` config triggers Vite's configLoader compatibility warning.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

**Also add `"**/*.mts"` to `tsconfig.json`'s `include` array.** That array is currently `["next-env.d.ts", "**/*.ts", …]`, and the glob `**/*.ts` does **not** match a file ending `.mts` — so renaming the config would silently drop it out of the type-checked program. Without this line the `.mts` fix trades a cosmetic warning for a real coverage loss.

Verify with:

```bash
npx tsc --noEmit --listFilesOnly | grep vitest.config
```

It must print `vitest.config.mts`. If it prints nothing, the `include` change did not take.

- [ ] **Step 3: Write the failing test**

Create `src/lib/contrast.ts` with only the constants and function signatures needed to compile the test — the real bodies come in Step 5:

```ts
/** Canvases a token can sit on. Values copied from globals.css. */
export const LIGHT_CANVASES = ['#ffffff', '#f6f9fc', '#eaf3fb', '#eaf6ff'] as const;
export const DARK_CANVASES = ['#0b0f1e', '#10152a', '#141b38', '#141d57'] as const;

export const AA_TEXT = 4.5;
export const AA_NON_TEXT = 3;

export function relativeLuminance(hex: string): number {
  throw new Error('not implemented');
}

export function contrastRatio(a: string, b: string): number {
  throw new Error('not implemented');
}
```

Create `src/lib/contrast.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from './contrast';

/**
 * Tests for the WCAG maths itself.
 *
 * These assert against **hex literals, not the palette**, so this file
 * compiles and passes no matter what `src/design/colors.ts` currently
 * exports. The palette-enforcement test is `src/design/colors.test.ts`,
 * which Task 2 adds in the same commit as the token shape it checks — a test
 * cannot reference a type shape that does not exist yet without breaking
 * `tsc`.
 */

describe('relativeLuminance', () => {
  it('is 1 for white and 0 for black', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 6);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 6);
  });

  it('increases monotonically with lightness', () => {
    const greys = ['#000000', '#333333', '#767676', '#bbbbbb', '#ffffff'];
    const lums = greys.map(relativeLuminance);
    for (let i = 1; i < lums.length; i += 1) {
      expect(lums[i]).toBeGreaterThan(lums[i - 1]);
    }
  });

  it('expands 3-digit hex', () => {
    expect(relativeLuminance('#fff')).toBeCloseTo(relativeLuminance('#ffffff'), 9);
    expect(relativeLuminance('#000')).toBeCloseTo(relativeLuminance('#000000'), 9);
  });

  it('throws on a non-hex input rather than returning NaN', () => {
    // `relativeLuminance` is part of the module's public interface and Task 2+
    // callers can reach it directly, so it must guard its own input rather
    // than relying on contrastRatio's guard.
    expect(() => relativeLuminance('rebeccapurple')).toThrow(/hex/i);
    expect(() => relativeLuminance(undefined as unknown as string)).toThrow(/hex/i);
  });
});

describe('contrastRatio', () => {
  it('gives the maximum 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2);
  });

  it('gives 1:1 for a colour against itself', () => {
    expect(contrastRatio('#00b3b8', '#00b3b8')).toBeCloseTo(1, 6);
  });

  it('is order-independent', () => {
    expect(contrastRatio('#0c7078', '#ffffff')).toBeCloseTo(
      contrastRatio('#ffffff', '#0c7078'),
      9
    );
  });

  it('places the AA boundary where WCAG does', () => {
    // #767676 on white is the canonical just-passes grey (4.54:1); #777777 is
    // the canonical just-fails one.
    expect(contrastRatio('#767676', '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#777777', '#ffffff')).toBeLessThan(4.5);
  });

  it('reproduces the shipped brand-teal failure measured in the spec', () => {
    // Landing-Redesign-Plan.md §1.4 — #00b3b8 as text on white is 2.58:1.
    expect(contrastRatio('#00b3b8', '#ffffff')).toBeCloseTo(2.58, 2);
  });

  it('throws on a non-hex input instead of silently returning NaN', () => {
    expect(() => contrastRatio('rebeccapurple', '#ffffff')).toThrow(/hex/i);
    expect(() => contrastRatio(undefined as unknown as string, '#ffffff')).toThrow(/hex/i);
    expect(() => contrastRatio('', '#ffffff')).toThrow(/hex/i);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — every assertion fails with `Error: not implemented` thrown from `relativeLuminance`. The resolver must find and run `src/lib/contrast.test.ts`, which also proves the `@/` alias and the `include` glob are wired correctly.

- [ ] **Step 5: Write the minimal implementation**

Replace the stub bodies in `src/lib/contrast.ts`:

```ts
/** Canvases a token can sit on. Values copied from globals.css. */
export const LIGHT_CANVASES = ['#ffffff', '#f6f9fc', '#eaf3fb', '#eaf6ff'] as const;
export const DARK_CANVASES = ['#0b0f1e', '#10152a', '#141b38', '#141d57'] as const;

export const AA_TEXT = 4.5;
export const AA_NON_TEXT = 3;

/** `#rgb` or `#rrggbb` → [r, g, b] in 0-255. */
function toRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** WCAG 2.1 sRGB linearisation. */
function linearise(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Guards against a silently `undefined` token producing a NaN ratio. */
function isHex(value: unknown): value is string {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

/**
 * WCAG relative luminance, 0 (black) to 1 (white).
 *
 * Guards its own input: this is exported and later tasks call it directly, so
 * an unguarded `parseInt` here would hand back a silent `NaN` — the exact
 * failure the guard exists to prevent.
 */
export function relativeLuminance(hex: string): number {
  if (!isHex(hex)) {
    throw new Error(`relativeLuminance expects a hex colour, received ${String(hex)}`);
  }
  const [r, g, b] = toRgb(hex);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** WCAG contrast ratio, 1:1 to 21:1. Order-independent. */
export function contrastRatio(a: string, b: string): number {
  // Names both operands, which is more useful than relativeLuminance's
  // single-value message when a palette token is missing.
  if (!isHex(a) || !isHex(b)) {
    throw new Error(`contrastRatio expects hex colours, received ${String(a)} and ${String(b)}`);
  }
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test`
Expected: **PASS, 10/10**, with pristine output — no warnings, no stray console noise. Note that `contrastRatio('#00b3b8', '#ffffff')` is asserted to be within 0.01 of **2.58**, which is the exact figure the design spec quotes for the shipped brand-teal failure (`Landing-Redesign-Plan.md` §1.4). That assertion is what ties the utility to the real measurement rather than to itself.

If the Vite `configLoader: 'native'` warning appears, Step 2's filename is wrong — it must be `vitest.config.mts`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.mts src/lib/contrast.ts src/lib/contrast.test.ts
git commit -m "test: add vitest harness and the WCAG contrast maths

First test suite in the repo. vitest is node-environment and covers pure
functions only, because the assistant never launches a browser
(EDUCRAFT_PRODUCTION.md §20) — so the redesign's safety net is maths that
can be verified without a DOM.

The suite asserts the WCAG implementation against known-good hex literals,
including the AA boundary (#767676 passes, #777777 fails) and the exact
shipped brand-teal failure the design spec quotes: #00b3b8 on white is
2.58:1 (Landing-Redesign-Plan.md §1.4).

Two review findings folded in:

- The config is vitest.config.mts, not .ts. package.json has no
  \"type\": \"module\", so a .ts config loads as CJS-with-ESM-syntax and Vite
  prints a configLoader compatibility warning on every run, making the test
  output non-pristine. Verified: .ts warns, .mts does not.

- relativeLuminance guards its own input. It is exported and later tasks call
  it directly, so an unguarded parseInt would return a silent NaN rather than
  failing loudly on a partially-migrated palette.

engines.node is also raised from >=20.9.0 to >=20.19.0: vite@8 requires
^20.19.0 || >=22.12.0, so the previously declared floor could not run the
toolchain this commit adds.

The palette-enforcement test arrives in the next commit with the token shape
it checks — a test cannot reference types that do not exist yet without
breaking tsc, which an earlier draft of this plan did."
```

---

## Task 2: Palette v2 token migration

Adds the palette-enforcement test and the calibrated values that satisfy it. **Purely additive at the class level** — no component *class names* change, though two live `programmeColors` consumers must be updated (Step 10).

This task carries its own RED/GREEN: Step 1 restructures `colors.ts` to the new shape while keeping the **shipped** hex values, Step 3 runs the new test against them and captures the real failing ratios, and Step 4 installs the measured values.

**Files:**
- Modify: `src/design/colors.ts`, `src/app/globals.css`
- Modify (required by the pre-flight scan — the new `programmeColors` shape removes `main`/`strong`/`darkMain`, which two live files read):
  `src/app/(site)/programmes/[slug]/opengraph-image.tsx`, `src/components/educraft/three/scenes/EcosystemScene.tsx`
- Create: `src/design/colors.test.ts` (Step 2 — this task owns it)

**Interfaces:**
- Consumes: `contrastRatio`, `LIGHT_CANVASES`, `DARK_CANVASES`, `AA_TEXT`, `AA_NON_TEXT` from Task 1
- Produces: `programmeColors: Record<PillarColorKey, PillarAccent>` where `PillarAccent = { textLight, textDark, graphicLight, graphicDark, softLight, softDark }`; `reservedPillarAccents: readonly PillarAccent[]`; `brand` — all consumed by Task 3's registry and Task 7's `LineStage`.

- [ ] **Step 1: Restructure `colors.ts` to the new shape, carrying the OLD values**

This is the **RED phase**. Rewrite `src/design/colors.ts` to the exact structure shown in Step 4, but populate it with the **currently shipped hex values**, mapped mechanically:

| new field | old field |
|---|---|
| `textLight` | `strong` |
| `graphicLight` | `main` |
| `softLight` | `soft` |
| `textDark` | `darkMain` |
| `graphicDark` | `darkMain` |
| `softDark` | **the shipped dark wash from `globals.css`'s `.dark` block** — see below |

`softDark` is the one field that does **not** come from `colors.ts`: that file only holds the *light* `soft` value, and the shipped dark washes live in `globals.css`. Copy them from there verbatim — `#122a34`, `#16233d`, `#1d1934`, `#2b2312`, `#161c3a` for learn/include/thrive/achieve/excel. If you map `soft` → `softDark` instead, you are putting a near-white wash on a dark canvas, the wash assertions pass trivially, and the RED phase loses exactly the evidence this task exists to capture.

Also add the `PillarAccent` type and the new `brand` / `canvas` / `borderColor` / `semantic` objects, populated with the **shipped** values.

Declare `reservedPillarAccents` as an **empty** array for now:

```ts
/** Slots 6-7. Populated with measured values in Step 4. */
export const reservedPillarAccents: readonly PillarAccent[] = [];
```

The reserved-slot test then iterates zero entries and passes vacuously at Step 3 — which is fine, because it is a placeholder state one step away from being replaced. Do not invent placeholder hexes for it.

Do **not** use the v2 values yet. The point of this step is to get a compiling shape so the test below can run and print real numbers.

- [ ] **Step 2: Write the palette enforcement test**

Create `src/design/colors.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  AA_NON_TEXT,
  AA_TEXT,
  DARK_CANVASES,
  LIGHT_CANVASES,
  contrastRatio,
} from '@/lib/contrast';
import { brand, programmeColors, reservedPillarAccents } from './colors';

/**
 * Enforces Landing-Redesign-Plan.md §6: every pillar text tier clears AA on
 * every canvas it can sit on, in both themes, and every graphic tier clears
 * the non-text threshold. This test is the reason a future palette edit cannot
 * silently regress accessibility.
 */

const PILLAR_IDS = ['learn', 'include', 'thrive', 'achieve', 'excel'] as const;

/** Worst-case ratio across a set of canvases — the number that must clear the floor. */
function worst(hex: string, canvases: readonly string[]): number {
  return Math.min(...canvases.map((canvas) => contrastRatio(hex, canvas)));
}

describe('pillar accents', () => {
  for (const id of PILLAR_IDS) {
    const accent = programmeColors[id];

    it(`${id}: exposes all six tiers`, () => {
      expect(accent).toBeDefined();
      expect(Object.keys(accent).sort()).toEqual([
        'graphicDark',
        'graphicLight',
        'softDark',
        'softLight',
        'textDark',
        'textLight',
      ]);
    });

    it(`${id}: light text tier clears AA on every light canvas`, () => {
      expect(worst(accent.textLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${id}: dark text tier clears AA on every dark canvas`, () => {
      expect(worst(accent.textDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${id}: light graphic tier clears the non-text threshold on white`, () => {
      expect(contrastRatio(accent.graphicLight, '#ffffff')).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });

    it(`${id}: dark graphic tier clears the non-text threshold on the dark canvas`, () => {
      expect(contrastRatio(accent.graphicDark, '#0b0f1e')).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });

    it(`${id}: dark soft wash reads as a tint on both dark canvases`, () => {
      // Spec §6.3. Floors: >=1.15 against the darkest canvas, >=1.02 against
      // the lighter one. The second floor is the derived equivalent of the
      // first — a wash always scores 1.1292x higher against #0b0f1e than
      // against #141b38, because #0b0f1e is darker.
      //
      // There is deliberately NO upper bound. A wash that clears 1.15 on the
      // darker canvas necessarily exceeds 1.25 on the lighter one, and that is
      // correct: it is a tint against a lighter surface. An earlier draft of
      // the spec demanded 1.15-1.25 on *both*, which is unsatisfiable.
      expect(contrastRatio(accent.softDark, '#0b0f1e')).toBeGreaterThanOrEqual(1.15);
      expect(contrastRatio(accent.softDark, '#141b38')).toBeGreaterThanOrEqual(1.02);
    });
  }

  it('reserved slots 6 and 7 are also AA-verified', () => {
    for (const accent of reservedPillarAccents) {
      expect(worst(accent.textLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(worst(accent.textDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });
});

describe('brand chrome', () => {
  it('teal text tier clears AA on every light canvas', () => {
    expect(worst(brand.tealTextLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('the primary CTA pairing clears AA: gold fill against indigo-deep text', () => {
    // Button.tsx's `primary` variant is `bg-ec-gold text-ec-indigo-dark
    // hover:bg-ec-gold-dark`. Measuring tokens only against canvases cannot
    // see a broken token-against-token pair — and this one silently regressed
    // to 2.64:1 (hover 1.86:1) when `--ec-gold` was darkened as if it were a
    // text token. Assert the hover state too, not just the resting one.
    expect(contrastRatio(brand.goldFillLight, brand.indigoDeep)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(brand.goldHoverLight, brand.indigoDeep)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(brand.goldFillDark, brand.indigoDeep)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('slate clears AA in both themes', () => {
    expect(worst(brand.slateLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(worst(brand.slateDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm run test src/design/colors.test.ts`
Expected: **FAIL**, with the output quoting **real ratios** — not `undefined`, not `NaN`. The characteristic failures to look for:

- the **brand** teal assertion near **2.58** (`#00b3b8`, the shipped `--ec-teal`, used as text)
- `achieve` near **2.87** (`#c58f1b`)
- `learn` near **4.23** and `include` near **4.11** (`#00898d`, `#3b7dd8` — both just under the 4.5 floor)
- the **dark-wash** assertions near **1.0** (`thrive` `#1d1934` at ≈1.00, `excel` `#161c3a` at ≈1.02)

Expect roughly a quarter of the 34 assertions to fail; the exact count depends on which tiers happen to clear their floor. This output is the **encoded evidence for spec §1.4 and §6.3** — copy the failing ratios into the commit message. A run in which the wash assertions all pass means Step 1's `softDark` mapping is wrong (see Step 1's note).

If the output instead reports `contrastRatio expects hex colours, received undefined`, the Step 1 restructure is incomplete — every one of the six tiers must be a populated hex string.

- [ ] **Step 4: Replace the placeholder values with the measured v2 set**

Now rewrite `src/design/colors.ts` with the **exact** values below. These are the measured, AA-verified palette. Do not adjust, round, or "improve" any value.

**`colors.ts` and `globals.css` must carry identical hex values.** `colors.ts` is the documentation-and-test source; the CSS custom properties in `globals.css` are what actually paint. A value that exists only in `colors.ts` passes the test suite and renders nothing — every token here has a mirrored pair in Step 6/7/8. When you correct a hex in one file, correct it in the other in the same step. (This invariant was learned the hard way: a mid-task correction once named only `colors.ts`, and without the mirror both washes would have stayed invisible in the browser while all 34 tests passed.)

Replace the whole file:

```ts
/**
 * Educraft — colour system source of truth (Landing Redesign Stage 1).
 * Hex values are mirrored into CSS custom properties in globals.css, where
 * light/dark art direction is applied.
 *
 * Every value here is **measured**: src/design/colors.test.ts asserts each
 * text tier clears WCAG AA (4.5:1) on every canvas it can sit on and each
 * graphic tier clears 3:1. Do not edit a value without re-running that test.
 *
 * Contrast rationale — Landing-Redesign-Plan.md §6.
 */

/** A pillar identity in three roles × two themes. */
export type PillarAccent = {
  /** Text-safe accent (≥4.5:1 on every canvas). Drives `text-ec-<id>`. */
  textLight: string;
  textDark: string;
  /** Non-text accent for strokes, nodes, the strand (≥3:1). Drives `ec-<id>-graphic`. */
  graphicLight: string;
  graphicDark: string;
  /** Wash behind a station. Drives `bg-ec-<id>-soft`. */
  softLight: string;
  softDark: string;
};

/**
 * Programme accent identities. `learn`/`include`/`thrive`/`achieve`/`excel` are
 * five *distinct* hues — note that `learn` and `excel` deliberately no longer
 * alias the brand teal and brand indigo, which was the old collision.
 *
 * Equi-luminant by design: the five text tiers' relative luminance spans 0.030,
 * so no pillar shouts louder than another. Hue spread 39/184/222/260/336deg.
 */
export const programmeColors = {
  learn: {
    textLight: '#0C7078',
    textDark: '#4FD4DC',
    graphicLight: '#12A0AC',
    graphicDark: '#2FBAC4',
    softLight: '#E0F5F7',
    softDark: '#0C2B30',
  },
  include: {
    textLight: '#2B5FD9',
    textDark: '#8FB4F5',
    graphicLight: '#4C82E8',
    graphicDark: '#6E9BEE',
    softLight: '#E5EDFD',
    softDark: '#131F3D',
  },
  thrive: {
    textLight: '#6B3FC4',
    textDark: '#B49BEE',
    graphicLight: '#8B62D9',
    graphicDark: '#9E7FE4',
    softLight: '#EDE6FB',
    softDark: '#221B3C',
  },
  achieve: {
    textLight: '#8A5A00',
    textDark: '#F5C95E',
    graphicLight: '#B8860B',
    graphicDark: '#E8B94A',
    softLight: '#FAEED6',
    softDark: '#2A2110',
  },
  excel: {
    textLight: '#C2185B',
    textDark: '#F285A8',
    graphicLight: '#E0437C',
    graphicDark: '#EC6A99',
    softLight: '#FCE4EC',
    softDark: '#391627',
  },
} as const satisfies Record<string, PillarAccent>;

export type PillarColorKey = keyof typeof programmeColors;

/**
 * Reserved accents for pillars 6 and 7 (Landing-Redesign-Plan.md §7.3).
 * The largest free hue gap in the current wheel is 39deg -> 184deg (145deg),
 * so slot 6 is green (~112deg) and slot 7 is a deeper lime (~70deg).
 *
 * These ship **measured but unemitted** — no CSS custom properties exist for
 * them until a real pillar claims one. The point is that a future pillar never
 * means inventing a hue under deadline. To claim one: move the object into
 * `programmeColors` under its new id, then extend globals.css.
 */
export const reservedPillarAccents: readonly PillarAccent[] = [
  {
    textLight: '#1B6B3A',
    textDark: '#6FCF8F',
    graphicLight: '#2E8B57',
    graphicDark: '#5CBE80',
    softLight: '#E3F3E8',
    softDark: '#0F2A1B',
  },
  {
    textLight: '#6B5A00',
    textDark: '#D6CD6B',
    graphicLight: '#8A7600',
    graphicDark: '#C4BA55',
    softLight: '#F4F0D9',
    softDark: '#26220C',
  },
] as const;

/**
 * Brand chrome. `teal` splits into a text tier and a graphic tier because one
 * vivid teal cannot serve both: `#00b3b8` reads correctly as a stroke but
 * measured only 2.58:1 as text, and it was used for eyebrows site-wide.
 */
export const brand = {
  indigoLight: '#1E2A78',
  indigoDeep: '#141D57',
  tealTextLight: '#0C7078',
  tealTextDark: '#4FD4DC',
  tealGraphicLight: '#12A0AC',
  tealGraphicDark: '#2FBAC4',
  /**
   * Gold is a FILL family, not a text family — it is the primary CTA's
   * background. `goldFillLight` pairs with `indigoDeep` as the CTA's
   * foreground; that pairing is asserted in the test, because measuring
   * tokens only against canvases cannot catch a broken token-against-token
   * pair.
   */
  goldFillLight: '#F4B942',
  goldFillDark: '#F5C95E',
  goldHoverLight: '#C58F1B',
  goldHoverDark: '#E8B94A',
  goldSoftLight: '#F8CD73',
  goldSoftDark: '#F8CD73',
  goldGraphicLight: '#B8860B',
  goldGraphicDark: '#E8B94A',
  slateLight: '#4A5468',
  slateDark: '#9AA3C0',
  inkLight: '#12172E',
  inkDark: '#E8ECFB',
} as const;

/** Neutral canvas layers. */
export const canvas = {
  DEFAULT: '#FFFFFF',
  soft: '#F6F9FC',
  deep: '#EAF3FB',
  sky: '#EAF6FF',
  DEFAULT_DARK: '#0B0F1E',
  softDark: '#10152A',
  deepDark: '#141B38',
  skyDark: '#151B36',
} as const;

export const borderColor = {
  light: '#E4E9F2',
  dark: '#232B4D',
} as const;

export const semantic = {
  success: '#16A34A',
  warning: '#B45309',
  error: '#DC2626',
  info: '#2563EB',
  successDark: '#4ADE80',
  warningDark: '#FBBF24',
  errorDark: '#F87171',
  infoDark: '#60A5FA',
  focusLight: '#1E2A78',
  focusDark: '#7C86C9',
} as const;
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test src/design/colors.test.ts`
Expected: **PASS, 34/34**, output pristine. Every pillar and brand tier now clears its floor, and all five dark washes clear **≥1.15** on `#0b0f1e` and **≥1.02** on `#141b38` (no upper bound — see spec §6.3).

Note: the reserved-slot test passes too — both reserved accents were measured to the same floors. If a reserved accent fails, that is a real signal: fix its value, do not weaken the test.

- [ ] **Step 6: Update `globals.css` — the `@theme inline` block**

In `src/app/globals.css`, replace the Programme accents block inside `@theme inline` with:

```css
  /* Programme accents (Landing-Redesign-Plan.md §6) — three roles per pillar.
     `ec-<id>` is the TEXT-safe tier (AA on every canvas); `ec-<id>-graphic`
     is for strokes and nodes; `ec-<id>-soft` is the station wash. */
  --color-ec-learn: var(--ec-p-learn);
  --color-ec-learn-graphic: var(--ec-p-learn-graphic);
  --color-ec-learn-soft: var(--ec-p-learn-soft);
  --color-ec-include: var(--ec-p-include);
  --color-ec-include-graphic: var(--ec-p-include-graphic);
  --color-ec-include-soft: var(--ec-p-include-soft);
  --color-ec-thrive: var(--ec-p-thrive);
  --color-ec-thrive-graphic: var(--ec-p-thrive-graphic);
  --color-ec-thrive-soft: var(--ec-p-thrive-soft);
  --color-ec-achieve: var(--ec-p-achieve);
  --color-ec-achieve-graphic: var(--ec-p-achieve-graphic);
  --color-ec-achieve-soft: var(--ec-p-achieve-soft);
  --color-ec-excel: var(--ec-p-excel);
  --color-ec-excel-graphic: var(--ec-p-excel-graphic);
  --color-ec-excel-soft: var(--ec-p-excel-soft);

  /* Brand chrome — `--color-ec-teal` already maps to `--ec-teal`, which is now
     the TEXT-safe tier, so `text-ec-teal` is fixed with no rename. This adds
     only the graphic-role tokens. */
  --color-ec-teal-graphic: var(--ec-teal-graphic);
  --color-ec-gold-graphic: var(--ec-gold-graphic);
```

Leave the existing `--color-ec-indigo*`, `--color-ec-teal`, `--color-ec-gold`, `--color-ec-sky`, and neutral mappings in place — they are unchanged in name, and `text-ec-teal` / `text-ec-gold` now resolve to the corrected text-safe values without any component being touched.

- [ ] **Step 7: Update `globals.css` — the `:root` (light) block**

Replace the brand, programme, and semantic token values:

```css
  --ec-indigo: #1e2a78;
  --ec-indigo-dark: #141d57;
  --ec-indigo-light: #3b4896;
  /* Text-safe teal. Replaces #00b3b8, which measured 2.58:1 as text.
     The ramp stays meaningful: --ec-teal-dark is a step darker (strictly
     higher contrast on white, same hue family), --ec-teal-light is the
     graphic tier used as `dark:text-ec-teal-light` on dark surfaces. */
  --ec-teal: #0c7078;
  --ec-teal-dark: #095056;
  --ec-teal-light: #12a0ac;
  /* Non-text teal, for strokes and the strand. */
  --ec-teal-graphic: #12a0ac;
  /* Gold keeps the FILL tier here, and must not be confused with a text token.
     `--ec-gold` is the primary CTA's background, paired with
     `text-ec-indigo-dark`: Button.tsx's `primary` variant is
     `bg-ec-gold text-ec-indigo-dark hover:bg-ec-gold-dark`, used by Hero,
     Navbar, Footer, FinalCTA, the enquiry form and the floating button.
     Darkening it to a text-safe amber drops that pairing to 2.64:1 (hover
     1.86:1) — which is exactly what an earlier draft of this task did. The
     fill must stay bright; gold used as *text* on a light surface is a
     separate, pre-existing problem tracked for Stage 3. */
  --ec-gold: #f4b942;
  --ec-gold-dark: #c58f1b;
  --ec-gold-light: #f8cd73;
  --ec-gold-graphic: #b8860b;

  --ec-canvas: #ffffff;
  --ec-canvas-soft: #f6f9fc;
  --ec-canvas-deep: #eaf3fb;
  --ec-sky: #eaf6ff;
  --ec-ink: #12172e;
  --ec-slate: #4a5468;
  --ec-border: #e4e9f2;
  --ec-focus: #1e2a78;

  --ec-p-learn: #0c7078;
  --ec-p-learn-graphic: #12a0ac;
  --ec-p-learn-soft: #e0f5f7;
  --ec-p-include: #2b5fd9;
  --ec-p-include-graphic: #4c82e8;
  --ec-p-include-soft: #e5edfd;
  --ec-p-thrive: #6b3fc4;
  --ec-p-thrive-graphic: #8b62d9;
  --ec-p-thrive-soft: #ede6fb;
  --ec-p-achieve: #8a5a00;
  --ec-p-achieve-graphic: #b8860b;
  --ec-p-achieve-soft: #faeed6;
  --ec-p-excel: #c2185b;
  --ec-p-excel-graphic: #e0437c;
  --ec-p-excel-soft: #fce4ec;

  --ec-success: #16a34a;
  --ec-warning: #b45309;
  --ec-error: #dc2626;
  --ec-info: #2563eb;
```

- [ ] **Step 8: Update `globals.css` — the `.dark` block**

```css
  --ec-indigo: #3b4896;
  --ec-indigo-dark: #141d57;
  --ec-indigo-light: #7c86c9;
  --ec-teal: #4fd4dc;
  --ec-teal-dark: #2fbac4;
  --ec-teal-light: #4fd4dc;
  --ec-teal-graphic: #2fbac4;
  --ec-gold: #f5c95e;
  --ec-gold-dark: #e8b94a;
  --ec-gold-light: #f8cd73;
  --ec-gold-graphic: #e8b94a;

  --ec-canvas: #0b0f1e;
  --ec-canvas-soft: #10152a;
  --ec-canvas-deep: #141b38;
  --ec-sky: #151b36;
  --ec-ink: #e8ecfb;
  --ec-slate: #9aa3c0;
  --ec-border: #232b4d;
  --ec-focus: #7c86c9;

  --ec-p-learn: #4fd4dc;
  --ec-p-learn-graphic: #2fbac4;
  --ec-p-learn-soft: #0c2b30;
  --ec-p-include: #8fb4f5;
  --ec-p-include-graphic: #6e9bee;
  --ec-p-include-soft: #131f3d;
  --ec-p-thrive: #b49bee;
  --ec-p-thrive-graphic: #9e7fe4;
  --ec-p-thrive-soft: #221b3c;
  --ec-p-achieve: #f5c95e;
  --ec-p-achieve-graphic: #e8b94a;
  --ec-p-achieve-soft: #2a2110;
  --ec-p-excel: #f285a8;
  --ec-p-excel-graphic: #ec6a99;
  --ec-p-excel-soft: #391627;

  --ec-success: #4ade80;
  --ec-warning: #fbbf24;
  --ec-error: #f87171;
  --ec-info: #60a5fa;
```

- [ ] **Step 9: Fix the one non-token teal consumer**

In the same file, the `::selection` rule uses teal as a **fill**, so it must use the graphic tier now that `--ec-teal` is text-darkened:

```css
  ::selection {
    background: color-mix(in srgb, var(--ec-teal-graphic) 25%, transparent);
  }
```

- [ ] **Step 10: Update the two live `programmeColors` consumers**

The old shape (`main` / `strong` / `soft` / `darkMain`) no longer exists, so these two files will fail `tsc` until updated. Both use the accent in a **graphic** role on a **dark** surface.

In `src/app/(site)/programmes/[slug]/opengraph-image.tsx`, replace the single `accent` with two role-specific values. Its background is a dark gradient (`#0B0F1E` → `#141D57`), so the **dark** tiers are correct:

```ts
const accent = programme ? programmeColors[programme.pillarId] : undefined;
/** Text role on the dark OG gradient — must clear AA there. */
const accentText = accent?.textDark ?? brand.tealTextDark;
/** Non-text role for the status dot. */
const accentDot = accent?.graphicDark ?? brand.tealGraphicDark;
```

Then use `accentText` where the current code uses `color: accent` (line 42) and `accentDot` where it uses `backgroundColor: accent` (line 46). Add `brand` to the existing `@/design/colors` import.

In `src/components/educraft/three/scenes/EcosystemScene.tsx`, the node colours are a theme-aware graphic role:

```ts
      return dark ? c.graphicDark : c.graphicLight;
```

(replacing `return dark ? c.darkMain : c.strong;` at line 47.)

- [ ] **Step 11: Run the full loop**

Run: `npx tsc --noEmit && npm run lint && npm run test && npm run build`
Expected: all four pass. `npm run build` must emit the same 29 routes as before — this task changes no routing.

If `tsc` reports any *other* consumer of `programmeColors`, stop and add it to the ruling list rather than inventing a mapping — the scan found exactly two.

- [ ] **Step 12: Commit**

```bash
git add src/design/colors.ts src/app/globals.css "src/app/(site)/programmes/[slug]/opengraph-image.tsx" src/components/educraft/three/scenes/EcosystemScene.tsx
git commit -m "feat(design): calibrated palette v2 — every accent now clears AA

Turns the Task 1 contrast test green. Ten measured failures are fixed:
--ec-teal as text 2.58 -> 5.83, achieve 2.87 -> 5.28, learn 4.23 -> 5.19,
include 4.11 -> 5.00, and the three invisible dark-mode washes
(thrive 1.00, excel 1.02, include 1.04) lifted into the 1.15-1.25 band.

learn and excel no longer alias the brand teal and brand indigo — five
distinct hues now, equi-luminant (luminance spread 0.030).

Purely additive at the class level: text-ec-learn, bg-ec-learn,
border-ec-learn and bg-ec-learn-soft keep working with corrected values,
so no component's classNames change. New -graphic tokens cover strokes and
nodes.

This commit also adds the palette-enforcement test the previous commit
deliberately omitted: a test cannot reference a type shape that does not
exist yet without breaking tsc. The RED phase is preserved honestly — Step 1
carried the shipped values into the new shape so Step 3 could capture the
real failing ratios (learn 2.58, achieve 2.87, the dark washes ~1.0) rather
than an uninformative crash.

The one breaking change is the programmeColors *shape* (main/strong/darkMain
-> six role themes). Two live readers — the programme OG image, which used a
single accent for both text and a dot on a dark gradient, and the retired-
pending WebGL scene — are updated here rather than given a deprecated
back-compat field. The OG image now uses the role-correct tier for each,
which it previously did not.

Slots 6-7 ship measured in colors.ts but emit no CSS until a pillar
claims one.

Two dark washes were corrected during implementation: thrive #1E1836 scored
1.0036 against the lighter dark canvas — as invisible as the wash it
replaced — and excel #331423 scored 1.0173. Both lifted along their own hue
to #221B3C (1.1714/1.0373) and #391627 (1.1968/1.0598).

The spec originally asked for all five washes in a 1.15-1.25 band on BOTH
dark canvases, which is unsatisfiable: a wash always scores 1.1292x higher
against #0b0f1e than against #141b38, so <=1.25 on the darker canvas
(L <= 0.0188) cannot coexist with >=1.15 on the lighter one (L >= 0.0215).
The enforced floors are now >=1.15 on #0b0f1e and >=1.02 on #141b38, with
no upper bound. Spec 6.3 corrected to match."
```

---

## Task 3: Pillar registry + derived `PillarId`

Makes "add a sixth pillar" a compile error instead of silence (spec §7.3). Collapses six parallel maps into one registry.

**Files:**
- Modify: `src/types/index.ts`, `src/data/pillars.ts`, `src/lib/pillarStyles.ts`, `src/lib/validators/courses.ts`
- Test: `src/data/pillars.test.ts` (create)

**Interfaces:**
- Consumes: `programmeColors` (Task 2)
- Produces: `PillarId` (derived union), `PillarSlug` (derived union), `pillarAccent: Record<PillarId, PillarAccentClasses>`, and the back-compat re-exports `pillarTextClass`, `pillarBgClass`, `pillarSoftBgClass`, `pillarBorderClass`, `pillarAccentVar`, `pillarSoftVar` — all consumed by Task 7 and by Stage 2's acts.

- [ ] **Step 1: Write the failing test**

Create `src/data/pillars.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { pillars } from './pillars';
import { programmes } from './programmes';
import { pillarAccent } from '@/lib/pillarStyles';

/**
 * Registry integrity. Source: Landing-Redesign-Plan.md §7.3 — the pillar
 * registry is the single source of truth, and everything else derives from it.
 */

describe('pillar registry', () => {
  it('has unique ids', () => {
    const ids = pillars.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique slugs', () => {
    const slugs = pillars.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every pillar has an accent registry entry', () => {
    for (const pillar of pillars) {
      expect(pillarAccent[pillar.id], `missing accent for ${pillar.id}`).toBeDefined();
    }
  });

  it('every pillar has exactly one programme (the landing page assumes 1:1)', () => {
    for (const pillar of pillars) {
      const matches = programmes.filter((p) => p.pillarId === pillar.id);
      expect(matches, `pillar ${pillar.id}`).toHaveLength(1);
    }
  });

  it('every pillar has a distinct hue family — no accent is reused', () => {
    const textTiers = pillars.map((p) => pillarAccent[p.id].accentVar);
    expect(new Set(textTiers).size).toBe(textTiers.length);
  });

  it('the programme slug matches its pillar slug', () => {
    // COURSE_VERTICALS stores programme slugs; the DB's Course.vertical is one
    // of them. They must not drift apart.
    for (const pillar of pillars) {
      const programme = programmes.find((p) => p.pillarId === pillar.id);
      expect(programme?.slug).toBe(pillar.slug);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test src/data/pillars.test.ts`
Expected: FAIL — `pillar.slug` is `undefined` (the field does not exist), and `pillarAccent` is not exported from `pillarStyles`.

- [ ] **Step 3: Derive the union in `src/types/index.ts`**

Replace the `PillarId` line and the `Pillar` interface:

```ts
/**
 * Pillar identity is derived from the registry in `data/pillars.ts` — see
 * Landing-Redesign-Plan.md §7.3. The re-export is type-only (erased at
 * compile time), so there is no runtime import cycle between this module and
 * the data layer, and every existing `import type { PillarId } from '@/types'`
 * keeps working.
 *
 * Do NOT hand-write the union here. Adding a pillar means adding one object to
 * `pillars`, and every `Record<PillarId, …>` in the codebase then fails to
 * compile until it is updated — which is the point.
 */
export type { PillarId } from '@/data/pillars';

export interface Pillar {
  /** Short key, e.g. 'learn'. Narrowed to the literal union by the registry. */
  id: string;
  /** URL slug and DB vertical value, e.g. 'linguistics'. Same as the programme slug. */
  slug: string;
  /** Display name, e.g. 'Learn'. */
  name: string;
  /** The vertical it represents, e.g. 'Linguistics'. */
  vertical: string;
  /** One-line description used in nav, mega menu, and ecosystem map. */
  short: string;
  /** Longer description for pillar sections. */
  description: string;
}
```

- [ ] **Step 4: Add slugs and derive the types in `src/data/pillars.ts`**

Replace the `pillars` array declaration and append the derived exports. Each entry gains a `slug` matching its programme's slug exactly:

```ts
/**
 * The pillars — the narrative spine of the whole experience.
 *
 * **This array is the single source of truth for pillar identity.** `PillarId`
 * and `PillarSlug` are derived from it below, so adding an entry here widens
 * both unions and every `Record<PillarId, …>` map in the codebase becomes a
 * compile error until it is updated. See Landing-Redesign-Plan.md §7.3 and the
 * runbook in §7.4.
 */
export const pillars = [
  {
    id: 'learn',
    slug: 'linguistics',
    name: 'Learn',
    vertical: 'Linguistics',
    short: 'Real fluency and confident communication across languages.',
    description:
      'Building fluency, comprehension, and global communication skills through personalised language pathways.',
  },
  {
    id: 'include',
    slug: 'inclusive-education',
    name: 'Include',
    vertical: 'Inclusive Education',
    short: 'Adaptive, individualised support so every learner can access opportunity.',
    description:
      'Learning designed around every learner — pace, sensory needs, and communication style included.',
  },
  {
    id: 'thrive',
    slug: 'wellbeing-counseling',
    name: 'Thrive',
    vertical: 'Wellbeing & Counselling',
    short: 'Confidential, judgement-free support that keeps students steady.',
    description:
      'Confidential counselling and resilience toolkits that keep students steady and focused on what matters.',
  },
  {
    id: 'achieve',
    slug: 'ai-digital-tech',
    name: 'Achieve',
    vertical: 'AI & Digital Technologies',
    short: 'Practical AI literacy and digital readiness for what comes next.',
    description:
      'Hands-on AI literacy, computational thinking, and responsible technology use for the careers of tomorrow.',
  },
  {
    id: 'excel',
    slug: 'neet-jee',
    name: 'Excel',
    vertical: 'NEET & JEE Preparation',
    short: 'Concept-first, disciplined exam coaching with measurable progress.',
    description:
      'Fundamentals-first exam coaching with weekly testing, mentor guidance, and transparent progress tracking.',
  },
] as const satisfies readonly Pillar[];

/** The literal union of pillar keys, e.g. 'learn' | 'include' | …. */
export type PillarId = (typeof pillars)[number]['id'];

/** The literal union of pillar slugs, e.g. 'linguistics' | …. */
export type PillarSlug = (typeof pillars)[number]['slug'];
```

Update the existing `getPillar` helper's signature to stay honest:

```ts
export const getPillar = (id: string): Pillar | undefined => pillars.find((p) => p.id === id);
```

- [ ] **Step 5: Collapse `src/lib/pillarStyles.ts` to one registry**

Replace the whole file:

```ts
import type { PillarId } from '@/data/pillars';

/**
 * Pillar → Tailwind class maps (Landing Redesign Stage 1).
 *
 * Tailwind 4 scans source files for complete class names, so every class is
 * written out **literally** here — never built via string interpolation in
 * components. `bg-ec-${x}` generates no CSS.
 *
 * This is ONE registry rather than six parallel maps: six records keyed by
 * `PillarId` meant six chances to drift when a pillar was added. `Record<PillarId, …>`
 * makes `tsc` enforce completeness — adding a pillar fails the build until its
 * entry is added here.
 *
 * The re-exports below preserve the old call sites, so this refactor touches
 * no component.
 */

export type PillarAccentClasses = {
  /** The pillar's text-safe accent colour. */
  text: string;
  /** Non-text accent for strokes and nodes. */
  graphic: string;
  /** Short alias for `graphic` used as a background (dots, nodes). */
  bg: string;
  /** Wash background for a station band. */
  softBg: string;
  /** Border in the text-safe accent. */
  border: string;
  /** Raw CSS var for SVG `stroke` / `fill` — theme-aware. */
  accentVar: string;
  /** Raw CSS var for the graphic tier — theme-aware. */
  graphicVar: string;
  /** Raw CSS var for the wash — theme-aware. */
  softVar: string;
};

export const pillarAccent: Record<PillarId, PillarAccentClasses> = {
  learn: {
    text: 'text-ec-learn',
    graphic: 'text-ec-learn-graphic',
    bg: 'bg-ec-learn',
    softBg: 'bg-ec-learn-soft',
    border: 'border-ec-learn',
    accentVar: 'var(--ec-p-learn)',
    graphicVar: 'var(--ec-p-learn-graphic)',
    softVar: 'var(--ec-p-learn-soft)',
  },
  include: {
    text: 'text-ec-include',
    graphic: 'text-ec-include-graphic',
    bg: 'bg-ec-include',
    softBg: 'bg-ec-include-soft',
    border: 'border-ec-include',
    accentVar: 'var(--ec-p-include)',
    graphicVar: 'var(--ec-p-include-graphic)',
    softVar: 'var(--ec-p-include-soft)',
  },
  thrive: {
    text: 'text-ec-thrive',
    graphic: 'text-ec-thrive-graphic',
    bg: 'bg-ec-thrive',
    softBg: 'bg-ec-thrive-soft',
    border: 'border-ec-thrive',
    accentVar: 'var(--ec-p-thrive)',
    graphicVar: 'var(--ec-p-thrive-graphic)',
    softVar: 'var(--ec-p-thrive-soft)',
  },
  achieve: {
    text: 'text-ec-achieve',
    graphic: 'text-ec-achieve-graphic',
    bg: 'bg-ec-achieve',
    softBg: 'bg-ec-achieve-soft',
    border: 'border-ec-achieve',
    accentVar: 'var(--ec-p-achieve)',
    graphicVar: 'var(--ec-p-achieve-graphic)',
    softVar: 'var(--ec-p-achieve-soft)',
  },
  excel: {
    text: 'text-ec-excel',
    graphic: 'text-ec-excel-graphic',
    bg: 'bg-ec-excel',
    softBg: 'bg-ec-excel-soft',
    border: 'border-ec-excel',
    accentVar: 'var(--ec-p-excel)',
    graphicVar: 'var(--ec-p-excel-graphic)',
    softVar: 'var(--ec-p-excel-soft)',
  },
};

// ---------------------------------------------------------------------------
// Back-compat re-exports — the previous six-map shape, derived from the one
// registry above. No call site changes were required by this refactor.
// ---------------------------------------------------------------------------

/** @deprecated Prefer `pillarAccent[id].text`. Kept for existing call sites. */
export const pillarTextClass: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.text])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].bg`. */
export const pillarBgClass: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.bg])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].softBg`. */
export const pillarSoftBgClass: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.softBg])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].border`. */
export const pillarBorderClass: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.border])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].accentVar`. */
export const pillarAccentVar: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.accentVar])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].graphicVar` — the accentVar is now text-tier. */
export const pillarGraphicVar: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.graphicVar])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].softVar`. */
export const pillarSoftVar: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.softVar])
) as Record<PillarId, string>;
```

- [ ] **Step 6: Derive `verticalLabel` and assert `COURSE_VERTICALS` in the validator**

In `src/lib/validators/courses.ts`, replace the literal `COURSE_VERTICALS` + `verticalLabel` block. The tuple stays a literal because `z.enum()` needs a real tuple type for inference — but a compile-time assertion makes drift impossible:

```ts
import type { PillarSlug } from '@/data/pillars';

/**
 * Course verticals — the five programme slugs. `Course.vertical` stores one of
 * these (Prisma schema comment: validated-at-the-edge string, not an FK).
 *
 * Kept as a literal tuple rather than `pillars.map(p => p.slug)` because zod's
 * `z.enum()` needs a tuple for literal inference. The assertion below is what
 * keeps it honest: it is a **compile-time** proof that this list and the pillar
 * registry agree, in both directions. Adding or renaming a pillar slug breaks
 * the build here instead of drifting silently.
 */
export const COURSE_VERTICALS = [
  'linguistics',
  'inclusive-education',
  'wellbeing-counseling',
  'ai-digital-tech',
  'neet-jee',
] as const;

type _VerticalsMatchPillarSlugs = PillarSlug extends (typeof COURSE_VERTICALS)[number]
  ? (typeof COURSE_VERTICALS)[number] extends PillarSlug
    ? true
    : never
  : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _verticalsMatchPillarSlugs: _VerticalsMatchPillarSlugs = true;

export type CourseVertical = (typeof COURSE_VERTICALS)[number];

/**
 * Human label per vertical. Derived from the pillar registry so the display
 * name lives in exactly one place.
 */
export const verticalLabel: Record<CourseVertical, string> = {
  linguistics: 'Linguistics',
  'inclusive-education': 'Inclusive Education',
  'wellbeing-counseling': 'Wellbeing & Counseling',
  'ai-digital-tech': 'AI & Digital Tech',
  'neet-jee': 'NEET & JEE Prep',
};
```

- [ ] **Step 7: Run the tests and the full loop**

Run: `npm run test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all pass. `src/data/pillars.test.ts` should now be fully green.

- [ ] **Step 8: Verify the enforcement actually works (dry-run of the runbook)**

This is the spec §7.4 claim. Prove it, then revert:

```bash
# 1. Add a sixth pillar id to the registry (no other changes)
# 2. tsc MUST fail, pointing at every Record<PillarId, …> that is now incomplete
npx tsc --noEmit 2>&1 | head -20
# 3. Revert
git checkout src/data/pillars.ts
```

Expected: a compile error naming `pillarAccent` in `src/lib/pillarStyles.ts` (missing property for the new id). If `tsc` passes, the derivation is wrong — fix it before committing.

- [ ] **Step 9: Commit**

```bash
git add src/types/index.ts src/data/pillars.ts src/lib/pillarStyles.ts src/lib/validators/courses.ts src/data/pillars.test.ts
git commit -m "refactor(data): derive PillarId from the registry so adding a pillar fails the build

Adding a sixth pillar used to need 8+ edits across 8 files, enforced by a
comment that said 'keep in sync'. Nothing failed loudly if one was missed.

Now: pillars.ts is the single source, PillarId/PillarSlug are derived from
it, and every Record<PillarId, …> becomes a compile error until updated.
Six parallel pillarStyles maps collapse to one pillarAccent registry with
back-compat re-exports, so no component changed. COURSE_VERTICALS keeps its
literal tuple (zod needs a tuple) but gains a bidirectional compile-time
assertion against PillarSlug.

Verified by dry-run: adding a sixth id to the registry fails tsc naming the
incomplete registry, then reverted."
```

---

## Task 4: Install GSAP + Motion, add `design/scroll.ts`

> **Superseded by `d1be7db` — the code blocks below are the plan as written, not as shipped.** Three deliberate changes, all from the Task 4 review:
>
> - `BREAKPOINTS.md` → **`BREAKPOINTS.sm`**. 640 is the Tailwind `sm` edge, not `md` (which is 768, and is what `tokens.ts` encodes for *layout*); these are the spec §8 band edges. The key was mislabelled, not the value, and the band is deliberately not derived from `tokens.ts` so a future layout edit cannot move the tablet branch.
> - `stationEnterMs`, `ribbonDrawMs` and `uiFeedbackMaxMs` are now **derived via `durationMs`** from `motion.ts` rather than restated as literals, per spec §10.2: "`design/motion.ts` stays the single source". Values are unchanged (400 / 700 / 160); the members are now typed `number`.
> - The `headlineStaggerMs` note is corrected: 80ms is **below `instant`** (100ms), the shortest token that exists, so it maps to no token and stays a deliberate standalone literal. The listing's "between `fast` (160) and `instant` (100)" is arithmetically false.
>
> Also updated, in `d1be7db` itself and in the two follow-ups after it: **`d1be7db`** added literal pins for the floor and ceiling to the test (the plan's assertions compared `perStationVh` against the constants under test, so a wrong constant anywhere in `WALK_MIN_VH ∈ [400/7, 66.75)` or `WALK_MAX_VH ∈ [80, 400/3]` passed the whole suite); **`550f074`** moved `perStationVh`'s `NaN` guard from the argument to the quotient, so an input that divides to `NaN` is caught and not only a `NaN` input; and the follow-up carrying this note pinned the last unpinned constant, `WALK_BASE_VH ∈ [400, 400.5)`. All three `WALK_*` constants are now pinned; a later follow-up pinned the rest of the exported surface too — `BREAKPOINTS.sm`/`.lg`, `SCRUB` and all four `CEILINGS` — because a literal pin needs no consumer, only a specified value, and every one of those values is in spec §8 or §10.2. The plan's "PASS (9 assertions)" is 11 `it()` blocks at `a7cc303`, and 14 with those remaining pins in place.

**Files:**
- Modify: `package.json`
- Create: `src/design/scroll.ts`, `src/design/scroll.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `BREAKPOINTS`, `WALK_BASE_VH`, `WALK_MIN_VH`, `WALK_MAX_VH`, `perStationVh(n: number): number`, `branchFor(width: number): ScrollBranch`, `SCRUB`, `CEILINGS` — consumed by Tasks 5–7 and by Stage 2's acts.

- [ ] **Step 1: Install the animation dependencies**

```bash
npm install gsap @gsap/react motion
```

Expected: `gsap` 3.15.x, `@gsap/react` 2.x, `motion` 13.2.x. No peer warnings — `motion` declares `peer react: "^18.0.0 || ^19.0.0"`, satisfied by the current `~19.2.8` pin.

- [ ] **Step 2: Write the failing test**

Create `src/design/scroll.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  BREAKPOINTS,
  WALK_MAX_VH,
  WALK_MIN_VH,
  branchFor,
  perStationVh,
} from './scroll';

/**
 * Scroll calibration. Source: Landing-Redesign-Plan.md §7.3 and §8.
 *
 * `perStationVh` is the formula that keeps the five-pillar act a constant
 * ~4 screens tall no matter how many pillars exist — the spec's answer to
 * "what happens when a sixth pillar arrives".
 */

describe('perStationVh', () => {
  it('gives 80vh per station at 5 pillars (the designed value)', () => {
    expect(perStationVh(5)).toBe(80);
  });

  it('holds the act at ~400vh at 6 pillars', () => {
    expect(perStationVh(6) * 6).toBeCloseTo(400, 0);
  });

  it('clamps to the floor rather than shrinking stations into nothing', () => {
    expect(perStationVh(7)).toBe(WALK_MIN_VH);
    expect(perStationVh(8)).toBe(WALK_MIN_VH);
    expect(perStationVh(20)).toBe(WALK_MIN_VH);
  });

  it('never exceeds the ceiling for tiny pillar counts', () => {
    expect(perStationVh(1)).toBe(WALK_MAX_VH);
    expect(perStationVh(3)).toBe(WALK_MAX_VH);
  });

  it('is monotonic non-increasing as pillars are added', () => {
    for (let n = 2; n < 12; n += 1) {
      expect(perStationVh(n + 1)).toBeLessThanOrEqual(perStationVh(n));
    }
  });
});

describe('branchFor', () => {
  it('selects the desktop branch at and above 1024px', () => {
    expect(branchFor(1024)).toBe('desktop');
    expect(branchFor(1440)).toBe('desktop');
  });

  it('selects the tablet branch between 640 and 1023px', () => {
    expect(branchFor(640)).toBe('tablet');
    expect(branchFor(1023)).toBe('tablet');
  });

  it('selects the mobile branch below 640px', () => {
    expect(branchFor(639)).toBe('mobile');
    expect(branchFor(390)).toBe('mobile');
  });

  it('agrees with the breakpoint constants it is built from', () => {
    expect(branchFor(BREAKPOINTS.lg)).toBe('desktop');
    expect(branchFor(BREAKPOINTS.md)).toBe('tablet');
    expect(branchFor(BREAKPOINTS.md - 1)).toBe('mobile');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm run test src/design/scroll.test.ts`
Expected: FAIL — `Failed to resolve import "./scroll"`.

- [ ] **Step 4: Write the implementation**

Create `src/design/scroll.ts`:

```ts
/**
 * Scroll calibration — pure, DOM-free, testable (Landing-Redesign-Plan.md §10.1).
 * The single source of truth for how long each act is and which mechanic each
 * breakpoint gets. Nothing here touches the DOM, React, or GSAP, so it is safe
 * to import from anywhere including the Vitest node environment.
 */

/** Tailwind-aligned breakpoints. Keep in sync with globals.css if it gains a custom screen. */
export const BREAKPOINTS = {
  md: 640,
  lg: 1024,
} as const;

export type ScrollBranch = 'desktop' | 'tablet' | 'mobile';

/**
 * The five-pillar walk targets roughly `WALK_BASE_VH` of total scroll, so the
 * act stays a constant ~4 screens regardless of pillar count. Stations shrink
 * as pillars are added and stop shrinking at `WALK_MIN_VH` — below that a
 * station cannot hold a headline, a tagline and two highlights at readable
 * pace. `WALK_MAX_VH` stops one or two pillars producing molasses.
 */
export const WALK_BASE_VH = 400;
export const WALK_MIN_VH = 60;
export const WALK_MAX_VH = 80;

/** Vertical scroll distance granted to each pillar station, in viewport heights. */
export function perStationVh(pillarCount: number): number {
  if (pillarCount <= 0) return WALK_MAX_VH;
  const ideal = WALK_BASE_VH / pillarCount;
  return Math.min(WALK_MAX_VH, Math.max(WALK_MIN_VH, ideal));
}

/**
 * Which scroll mechanic a viewport gets (Landing-Redesign-Plan.md §8).
 * Desktop pins and scrubs horizontally; tablet deliberately does NOT (a pinned
 * horizontal track on a 768px viewport fights the browser's own gestures);
 * mobile uses native CSS overflow-snap, never a pinned track on touch.
 */
export function branchFor(widthPx: number): ScrollBranch {
  if (widthPx >= BREAKPOINTS.lg) return 'desktop';
  if (widthPx >= BREAKPOINTS.md) return 'tablet';
  return 'mobile';
}

/**
 * GSAP ScrollTrigger scrub smoothing, in seconds. 1 gives the walk a weighted
 * feel without lagging behind the user's scroll.
 */
export const SCRUB = 1;

/**
 * Motion ceilings, in milliseconds, expressed as multiples of the `motion.ts`
 * duration tokens so there is still one source of truth for timing.
 * See Landing-Redesign-Plan.md §10.2.
 */
export const CEILINGS = {
  /** Headline line stagger — between `fast` (160) and `instant` (100). */
  headlineStaggerMs: 80,
  /** Station content entering — `motion.duration.emphasis` * 1000. */
  stationEnterMs: 400,
  /** Journey ribbon draw — `motion.duration.reveal` * 1000. */
  ribbonDrawMs: 700,
  /** Any UI feedback must not exceed this — `motion.duration.fast` * 1000. */
  uiFeedbackMaxMs: 160,
} as const;
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test src/design/scroll.test.ts`
Expected: PASS (9 assertions).

- [ ] **Step 6: Run the full loop**

Run: `npx tsc --noEmit && npm run lint && npm run test && npm run build`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/design/scroll.ts src/design/scroll.test.ts
git commit -m "feat(design): add scroll calibration maths + install gsap/motion

perStationVh(n) keeps the five-pillar walk at a constant ~400vh as pillars
are added (80vh at 5, 67vh at 6, clamped to 60vh from 7 up), which is the
spec's answer to how a sixth pillar changes the page. branchFor() encodes
the responsive rule: desktop pins and scrubs, tablet deliberately does not,
mobile uses native snap.

Installs gsap 3.15, @gsap/react and motion 13.2 per Landing-Redesign-Plan.md
§11.2, overriding TECH-STACK's 'no GSAP' rule (recorded in
EDUCRAFT_PRODUCTION.md §26.9). No page consumes them yet."
```

---

## Task 5: Line station geometry

**Files:**
- Create: `src/components/educraft/line/anchors.ts`, `src/components/educraft/line/station.ts`, `src/components/educraft/line/station.test.ts`

**Interfaces:**
- Consumes: `perStationVh` (Task 4)
- Produces: `Anchor = { x: number; y: number }`, `ACT_ANCHORS`, `stationPositions(n: number): Anchor[]`, `drawAt(progress: number, index: number, n: number): number` — consumed by Task 6 and Task 7.

- [ ] **Step 1: Write the failing test**

Create `src/components/educraft/line/station.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { drawAt, stationPositions } from './station';

/**
 * Station geometry. Source: Landing-Redesign-Plan.md §3.1 and §10.1.
 *
 * These are pure functions of the pillar count — deliberately not constants —
 * because the walk must survive a sixth or seventh pillar without a rewrite.
 */

describe('stationPositions', () => {
  it('returns one anchor per pillar', () => {
    expect(stationPositions(5)).toHaveLength(5);
    expect(stationPositions(7)).toHaveLength(7);
  });

  it('spreads stations evenly across the track', () => {
    const positions = stationPositions(5);
    const gaps = positions.slice(1).map((p, i) => p.x - positions[i].x);
    for (const gap of gaps) {
      expect(gap).toBeCloseTo(gaps[0], 6);
    }
  });

  it('starts at x=0 and ends at x=n-1 track-widths (one station per viewport)', () => {
    const positions = stationPositions(5);
    expect(positions[0].x).toBe(0);
    expect(positions[4].x).toBe(4);
  });

  it('keeps every station on the same baseline y', () => {
    const ys = stationPositions(6).map((p) => p.y);
    expect(new Set(ys).size).toBe(1);
  });

  it('handles a single pillar without dividing by zero', () => {
    expect(stationPositions(1)).toEqual([{ x: 0, y: expect.any(Number) }]);
  });

  it('handles zero pillars', () => {
    expect(stationPositions(0)).toEqual([]);
  });
});

describe('drawAt', () => {
  it('is 0 at the very start of the walk', () => {
    expect(drawAt(0, 0, 5)).toBe(0);
  });

  it('fully lights a station once the walk has passed its slice', () => {
    // Station 2 of 5 owns the slice [0.4, 0.6), so it is complete at 0.6.
    expect(drawAt(3 / 5, 2, 5)).toBeCloseTo(1, 6);
  });

  it('is partially drawn mid-slice', () => {
    // Halfway through station 2's slice: 0.5 / 0.6.
    expect(drawAt(0.5, 2, 5)).toBeCloseTo(0.833, 3);
  });

  it('is fully lit for every station once the walk completes', () => {
    for (let i = 0; i < 5; i += 1) {
      expect(drawAt(1, i, 5)).toBe(1);
    }
  });

  it('never returns a value outside 0..1', () => {
    for (const p of [-1, -0.5, 0, 0.3, 0.7, 1, 1.5]) {
      for (let i = 0; i < 5; i += 1) {
        const value = drawAt(p, i, 5);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it('scales with pillar count instead of a hardcoded divisor', () => {
    // The shipped Methodology section hardcodes `/ 5.5`, which cannot scale.
    expect(drawAt(1, 3, 7)).toBe(1);
    expect(drawAt(1, 0, 1)).toBe(1);
    expect(drawAt(0.5, 0, 1)).toBeCloseTo(0.5, 6);
  });

  it('handles a zero or negative pillar count without dividing by zero', () => {
    expect(drawAt(0.5, 0, 0)).toBe(0);
    expect(drawAt(0.5, 2, -3)).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test src/components/educraft/line/station.test.ts`
Expected: FAIL — `Failed to resolve import "./station"`.

- [ ] **Step 3: Write `anchors.ts`**

Create `src/components/educraft/line/anchors.ts`:

```ts
/**
 * The anchor contract (Landing-Redesign-Plan.md §3.1).
 *
 * Every act's strand starts exactly where the previous act's ended, so the eye
 * reads one continuous line while the DOM stays as small, separately
 * understandable pieces. `assertContinuity` (pathBuilders.ts) proves the
 * contract holds; a seam mismatch is a test failure, not an eyeball judgement.
 *
 * Coordinates are normalised: x in track-widths (0 = left edge of act 0,
 * 1 = one viewport to the right), y in viewport heights from the top of the
 * strand's own band. Kept in one place because both ends of every seam read
 * from here.
 */

export type Anchor = { x: number; y: number };

/** Where each act's strand enters and leaves, in normalised coordinates. */
export const ACT_ANCHORS = {
  origin: {
    /** The strand enters the hero from the top-right. */
    enter: { x: 0.72, y: 0 },
    /** The fork resolves at the fold, where the five seeds sit. */
    exit: { x: 0.5, y: 1 },
  },
  pillars: {
    enter: { x: 0.5, y: 1 },
    exit: { x: 0.5, y: 1 },
  },
  way: {
    enter: { x: 0.5, y: 1 },
    exit: { x: 0.5, y: 1 },
  },
  proof: {
    enter: { x: 0.5, y: 1 },
    exit: { x: 0.5, y: 1 },
  },
  doors: {
    enter: { x: 0.5, y: 1 },
    /** The strand converges to a single point — the CTA. */
    exit: { x: 0.5, y: 0.5 },
  },
} as const satisfies Record<string, { enter: Anchor; exit: Anchor }>;

export type ActName = keyof typeof ACT_ANCHORS;
```

- [ ] **Step 4: Write `station.ts`**

Create `src/components/educraft/line/station.ts`:

```ts
import type { Anchor } from './anchors';

/**
 * Station geometry — pure functions of the pillar count
 * (Landing-Redesign-Plan.md §3.1, §7.3).
 *
 * Deliberately **functions of n, not constants**: the walk must survive a
 * sixth or seventh pillar with no rewrite. `drawAt` also replaces the shipped
 * Methodology section's hardcoded `/ 5.5` divisor, which cannot scale.
 */

/** Baseline y for the horizontal walk, in viewport heights. */
const WALK_BASELINE_Y = 0.5;

/**
 * One anchor per pillar, spread evenly across the horizontal track.
 * Station `i` sits at `x = i` (track-widths) so `x` maps directly to a
 * `-i * 100vw` translate.
 */
export function stationPositions(pillarCount: number): Anchor[] {
  if (pillarCount <= 0) return [];
  return Array.from({ length: pillarCount }, (_, i) => ({
    x: i,
    y: WALK_BASELINE_Y,
  }));
}

/**
 * How lit station `index` is at a given overall walk `progress` (0..1).
 *
 * Each station owns an equal slice of the walk and is fully lit by the time
 * the walk reaches it, so the strand's draw always keeps pace with the
 * station the user is reading.
 */
export function drawAt(progress: number, index: number, pillarCount: number): number {
  if (pillarCount <= 0) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  const stationEnd = (index + 1) / pillarCount;
  if (stationEnd <= 0) return 0;
  return Math.min(1, clamped / stationEnd);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test src/components/educraft/line/station.test.ts`
Expected: PASS (13 assertions).

- [ ] **Step 6: Run the full loop and commit**

Run: `npx tsc --noEmit && npm run lint && npm run test && npm run build`

```bash
git add src/components/educraft/line/anchors.ts src/components/educraft/line/station.ts src/components/educraft/line/station.test.ts
git commit -m "feat(line): pure station geometry as functions of pillar count

stationPositions(n) spreads one anchor per pillar across the horizontal
track; drawAt(progress, i, n) replaces the shipped Methodology section's
hardcoded / 5.5 divisor so the draw scales with pillar count. anchors.ts
declares the entry/exit contract that later acts must satisfy.

DOM-free and node-tested, per Landing-Redesign-Plan.md §10.1 — scroll
calibration is verifiable without a browser."
```

---

## Task 6: Path builders + the continuity assertion

**Files:**
- Create: `src/components/educraft/line/pathBuilders.ts`, `src/components/educraft/line/pathBuilders.test.ts`

**Interfaces:**
- Consumes: `Anchor`, `ACT_ANCHORS` (Task 5)
- Produces: `pathFor(from: Anchor, to: Anchor, shape?: PathShape): string`, `assertContinuity(): void`, `PathShape` — consumed by Task 7.

- [ ] **Step 1: Write the failing test**

Create `src/components/educraft/line/pathBuilders.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS } from './anchors';
import { assertContinuity, pathFor } from './pathBuilders';

/**
 * Path geometry + the seam contract. Source: Landing-Redesign-Plan.md §3.1.
 *
 * `assertContinuity` is the spec's answer to "the handoff feels broken": instead
 * of trusting that act boundaries line up, it proves each act's exit anchor
 * equals the next act's entry anchor.
 */

describe('pathFor', () => {
  it('produces a valid SVG path string', () => {
    const d = pathFor({ x: 0, y: 0 }, { x: 1, y: 1 });
    expect(d).toMatch(/^M\s?[\d.-]+[\s,][\d.-]+/);
    expect(d).toContain('C');
  });

  it('starts at the `from` anchor and ends at the `to` anchor', () => {
    const d = pathFor({ x: 0.25, y: 0.1 }, { x: 0.75, y: 0.9 });
    expect(d.startsWith('M 0.25 0.1')).toBe(true);
    expect(d.endsWith('0.75 0.9')).toBe(true);
  });

  it('is a straight line for the `line` shape', () => {
    expect(pathFor({ x: 0, y: 0 }, { x: 1, y: 0 }, 'line')).toBe('M 0 0 L 1 0');
  });

  it('is deterministic — the same inputs give the same string', () => {
    const a = { x: 0.1, y: 0.2 };
    const b = { x: 0.9, y: 0.8 };
    expect(pathFor(a, b, 'arc')).toBe(pathFor(a, b, 'arc'));
  });

  it('is independent of direction for the same curve family', () => {
    // A vertical drop and a vertical rise over the same span share control maths.
    const down = pathFor({ x: 0.5, y: 0 }, { x: 0.5, y: 1 });
    const up = pathFor({ x: 0.5, y: 1 }, { x: 0.5, y: 0 });
    expect(down).not.toBe(up);
    expect(down).toContain('C');
  });
});

describe('assertContinuity', () => {
  it('passes for the declared act chain', () => {
    expect(() => assertContinuity()).not.toThrow();
  });

  it('detects a broken seam', () => {
    // Prove the assertion has teeth: a deliberately mismatched chain must fail.
    const broken = {
      origin: { enter: { x: 0, y: 0 }, exit: { x: 1, y: 1 } },
      pillars: { enter: { x: 0, y: 0 }, exit: { x: 1, y: 1 } },
    };
    expect(() => assertContinuity(broken)).toThrow(/origin\.exit/);
  });

  it('reports the offending seam by name', () => {
    const broken = {
      origin: { enter: { x: 0, y: 0 }, exit: { x: 0.1, y: 0.1 } },
      pillars: { enter: { x: 0.2, y: 0.2 }, exit: { x: 1, y: 1 } },
    };
    let message = '';
    try {
      assertContinuity(broken);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('origin.exit');
    expect(message).toContain('pillars.enter');
  });

  it('accepts the real ACT_ANCHORS unchanged', () => {
    expect(() => assertContinuity(ACT_ANCHORS)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test src/components/educraft/line/pathBuilders.test.ts`
Expected: FAIL — `Failed to resolve import "./pathBuilders"`.

- [ ] **Step 3: Write the implementation**

Create `src/components/educraft/line/pathBuilders.ts`:

```ts
import { ACT_ANCHORS, type Anchor } from './anchors';

/**
 * Pure SVG path construction + the seam contract
 * (Landing-Redesign-Plan.md §3.1).
 *
 * Coordinates are normalised (x in track-widths, y in band-heights), so a path
 * string is resolution-independent: the caller scales via `viewBox`, which is
 * what makes the same geometry work at every breakpoint.
 *
 * Paths carry `pathLength="1"` at the render site, so draw is always
 * `stroke-dasharray: 1` with `stroke-dashoffset: 1 → 0` — identical for every
 * path regardless of real length. That is why nothing here measures length.
 */

export type PathShape = 'arc' | 'line' | 'fork';

/** Two decimal places is plenty at normalised scale and keeps strings diffable. */
const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * An SVG path from `from` to `to`.
 *
 * `arc`   — the default gentle S-curve used for vertical strand runs.
 * `line`  — a straight segment, used for the horizontal walk's rail.
 * `fork`  — leaves the origin vertically first, so five forks read as one
 *           line splitting rather than five lines crossing.
 */
export function pathFor(from: Anchor, to: Anchor, shape: PathShape = 'arc'): string {
  const x0 = round(from.x);
  const y0 = round(from.y);
  const x1 = round(to.x);
  const y1 = round(to.y);

  if (shape === 'line') {
    return `M ${x0} ${y0} L ${x1} ${y1}`;
  }

  const dy = y1 - y0;
  const dx = x1 - x0;

  // For `fork`, hold x for the first third so the branch leaves straight down
  // before it starts to diverge — this is what makes a fork read as a split.
  const c1 =
    shape === 'fork' ? { x: x0, y: round(y0 + dy * 0.55) } : { x: round(x0 + dx * 0.5), y: y0 };
  const c2 = { x: round(x1 - dx * 0.5), y: round(y1 - dy * 0.15) };

  return `M ${x0} ${y0} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${x1} ${y1}`;
}

type ActChain = Record<string, { enter: Anchor; exit: Anchor }>;

/**
 * Proves the seam contract: in the declared act order, each act's `exit` anchor
 * must equal the next act's `enter` anchor. Called from the test suite (and
 * safe to call at module scope in development).
 *
 * Throws naming both sides of the offending seam, because "the handoff looks
 * broken" is exactly the bug this exists to prevent.
 */
export function assertContinuity(chain: ActChain = ACT_ANCHORS): void {
  const names = Object.keys(chain);
  const EPSILON = 1e-6;
  for (let i = 0; i < names.length - 1; i += 1) {
    const from = names[i];
    const to = names[i + 1];
    const exit = chain[from].exit;
    const enter = chain[to].enter;
    const dx = Math.abs(exit.x - enter.x);
    const dy = Math.abs(exit.y - enter.y);
    if (dx > EPSILON || dy > EPSILON) {
      throw new Error(
        `Strand seam broken between ${from}.exit (${exit.x}, ${exit.y}) and ` +
          `${to}.enter (${enter.x}, ${enter.y}) — delta (${dx}, ${dy}). ` +
          'Each act must start exactly where the previous one ended.'
      );
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test src/components/educraft/line/pathBuilders.test.ts`
Expected: PASS (8 assertions).

If `assertContinuity` throws on the real `ACT_ANCHORS`, the anchors in Task 5 are inconsistent — fix `ACT_ANCHORS` rather than loosening the assertion.

- [ ] **Step 5: Run the full loop and commit**

Run: `npx tsc --noEmit && npm run lint && npm run test && npm run build`

```bash
git add src/components/educraft/line/pathBuilders.ts src/components/educraft/line/pathBuilders.test.ts
git commit -m "feat(line): pure path builders + the strand continuity assertion

pathFor() builds resolution-independent SVG paths from normalised anchors
(x in track-widths, y in band-heights) with line/arc/fork shapes. Paths carry
pathLength=1 at the render site, so nothing here ever measures length.

assertContinuity() is the fix for the reported 'hero -> pillars feels broken':
it proves each act's exit anchor equals the next act's entry anchor and names
both sides of a broken seam. A negative test confirms it has teeth."
```

---

## Task 7: `lib/gsap.ts` registration + the `LineStage` component

**Files:**
- Create: `src/lib/gsap.ts`, `src/components/educraft/line/LineStage.tsx`

**Interfaces:**
- Consumes: `pathFor` (Task 6), `ACT_ANCHORS`/`Anchor` (Task 5), `perStationVh`/`branchFor`/`SCRUB` (Task 4)
- Produces: `registerGsap()`, `gsap`, `ScrollTrigger`, `useGSAP`, `EASE`; `<LineStage>` — consumed by Stage 2's acts.

- [ ] **Step 1: Write `src/lib/gsap.ts`**

```ts
'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion as motionTokens } from '@/design/motion';

/**
 * The single GSAP registration point (Landing-Redesign-Plan.md §3.2).
 *
 * **Nothing else in the codebase may call `gsap.registerPlugin`.** Registering
 * in more than one place is the usual source of double-registration warnings
 * and of ScrollTrigger instances surviving a hot reload.
 *
 * Client-only by construction: importing gsap at module scope in a server
 * component would evaluate it during SSR. Always import from a `'use client'`
 * boundary.
 *
 * Reduced motion is NOT handled here — each consumer must branch with
 * `gsap.matchMedia()` on `(prefers-reduced-motion: reduce)` and render the
 * final state, because once GSAP drives the animation, the CSS
 * `prefers-reduced-motion` block in globals.css can no longer make that
 * guarantee (spec §9).
 */

let registered = false;

/** Idempotent — safe to call from every consumer's `useGSAP` setup. */
export function registerGsap(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}

/**
 * Named eases. `power3.out` ≈ cubic-bezier(0.215, 0.61, 0.355, 1), which is
 * within a hair of `motion.easing.out` (0.22, 1, 0.36, 1) — close enough to
 * use GSAP's built-in and avoid an easing-plugin dependency (spec §10.2).
 */
export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  soft: 'power2.out',
} as const;

/** The `(prefers-reduced-motion: reduce)` media query string, in one place. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Exposed for reference in docs/tests — the mapping is documented, not implied. */
export const EASE_EQUIVALENCE = {
  out: motionTokens.easing.out,
  inOut: motionTokens.easing.inOut,
  soft: motionTokens.easing.soft,
} as const;

export { gsap, ScrollTrigger, useGSAP };
```

- [ ] **Step 2: Write the `LineStage` component**

Create `src/components/educraft/line/LineStage.tsx`:

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  EASE,
  REDUCED_MOTION_QUERY,
  ScrollTrigger,
  gsap,
  registerGsap,
  useGSAP,
} from '@/lib/gsap';
import { SCRUB } from '@/design/scroll';

/**
 * Renders one act's strand and wires its scroll-linked draw
 * (Landing-Redesign-Plan.md §3.1).
 *
 * The draw is a single animated property — `stroke-dashoffset` on one path —
 * which is what keeps this cheap. Paths carry `pathLength="1"`, so the dash
 * maths is identical for every path regardless of its real length; nothing here
 * ever calls `getTotalLength()` or reads layout in the animation loop.
 *
 * GSAP owns `stroke-dashoffset` exclusively. Motion must never be pointed at
 * the same property of the same element (spec §3.2).
 */
export type LineStageProps = {
  /** Path `d` strings, one per strand. The first is the primary strand. */
  paths: string[];
  /** Aspect ratio for the render box. Anchor coordinates are normalised to it. */
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  /** Pin the stage while `draw` runs. Off for the tableau-style acts. */
  pin?: boolean;
  /** Scroll distance for the pinned run, in viewport heights. */
  pinDistanceVh?: number;
  /** Draw over `scrubDistance` of scroll once in view. Defaults to in-view draw. */
  scrub?: boolean;
  className?: string;
  /** Content anchored onto the strand. Positioned by the caller. */
  children?: ReactNode;
  /** Accessible description. The strand itself is always `aria-hidden`. */
  label?: string;
};

export function LineStage({
  paths,
  viewBoxWidth = 1200,
  viewBoxHeight = 800,
  pin = false,
  pinDistanceVh = 100,
  scrub = false,
  className,
  children,
  label,
}: LineStageProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      // Reduced motion: no pin, no scrub. Every strand renders fully drawn.
      mm.add(REDUCED_MOTION_QUERY, () => {
        gsap.set('[data-line-path]', { strokeDashoffset: 0 });
      });

      mm.add(`not all and ${REDUCED_MOTION_QUERY}`, () => {
        // Scoped to this instance's root: `gsap.utils.toArray` with a bare
        // selector would grab every LineStage on the page and cross-wire their
        // timelines.
        const scopeEl = root.current;
        if (!scopeEl) return;

        const tweens = gsap.utils.toArray<SVGPathElement>('[data-line-path]', scopeEl).map((el, index) =>
          gsap.fromTo(
            el,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: EASE.out,
              duration: scrub ? 1 : 1.2,
              delay: scrub ? 0 : index * 0.12,
              scrollTrigger: scrub
                ? { trigger: root.current, start: 'top 80%', end: 'bottom 60%', scrub: SCRUB }
                : undefined,
            }
          )
        );

        if (pin) {
          ScrollTrigger.create({
            trigger: root.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * (pinDistanceVh / 100)}`,
            pin: true,
            pinSpacing: true,
          });
        }

        return () => {
          tweens.forEach((tween) => tween.scrollTrigger?.kill());
          tweens.forEach((tween) => tween.kill());
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [paths.join('|'), pin, scrub, pinDistanceVh] }
  );

  return (
    <div ref={root} className={cn('relative w-full', className)}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio='none'
        className='h-full w-full'
        aria-hidden='true'
        focusable='false'
      >
        <title>{label ?? 'Connective strand'}</title>
        {paths.map((d, index) => (
          <path
            key={`${index}-${d}`}
            data-line-path
            d={d}
            pathLength={1}
            fill='none'
            strokeWidth={2}
            strokeLinecap='round'
            vectorEffect='non-scaling-stroke'
            className='stroke-ec-teal-graphic'
            style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
          />
        ))}
      </svg>
      {children}
    </div>
  );
}
```

Note the deliberate details: `pathLength={1}` plus `strokeDasharray: 1` matches every path's draw to a 0..1 range; `vectorEffect='non-scaling-stroke'` keeps the strand 2px at every viewport with `preserveAspectRatio='none'`; and the SVG is `aria-hidden` with all meaning carried by real DOM text, per spec §9.

- [ ] **Step 3: Verify the build and the full loop**

Run: `npx tsc --noEmit && npm run lint && npm run test && npm run build`
Expected: all pass. Nothing renders `LineStage` yet, so the route table and every visual must be unchanged from Task 6.

- [ ] **Step 4: Commit**

```bash
git add src/lib/gsap.ts src/components/educraft/line/LineStage.tsx
git commit -m "feat(line): gsap registration module + LineStage component

lib/gsap.ts is the single registration point for ScrollTrigger and
@gsap/react — nowhere else may call registerPlugin, which is the usual
source of double-registration and of instances surviving hot reload. Named
eases map to design/motion.ts values, documented rather than implied.

LineStage draws one act's strand with a single animated property
(stroke-dashoffset) over paths carrying pathLength=1, so draw maths is
identical regardless of real path length and nothing measures layout in the
animation loop. Reduced motion is branched via gsap.matchMedia into a fully
drawn static render — CSS can no longer guarantee it once GSAP drives.

Nothing consumes LineStage yet; the page is unchanged."
```

---

## Self-Review

**Spec coverage** — every Stage 1 obligation in `Landing-Redesign-Plan.md` maps to a task:

| Spec section | Task |
|---|---|
| §3.1 Line system (`anchors`, `pathBuilders`, `station`, `LineStage`) | 5, 6, 7 |
| §3.2 Engine split + single registration point | 7 (`lib/gsap.ts`) |
| §3.4 target file layout (`line/`, `design/scroll.ts`, `lib/gsap.ts`) | 4, 5, 6, 7 |
| §6 palette v2 (all tiers, brand chrome, dark washes) | 2 |
| §6.5 "accent is never the only signal" | Enforced by contract, not code — Stage 2's acts must comply |
| §7.3 derived `PillarId`, collapsed registry, derived `COURSE_VERTICALS` | 3 |
| §7.3 reserved accent slots 6–7 | 2 (`reservedPillarAccents`) + AA-tested in 2 |
| §7.4 runbook | 3 Step 8 dry-run |
| §8 responsive contract | 4 (`branchFor`) |
| §10.1 pure functions + Vitest | 1, 4, 5, 6 |
| §10.2 timing tokens | 4 (`CEILINGS`) |
| §11.2 dependency changes | 1 (vitest), 4 (gsap, @gsap/react, motion) |
| §14 definition of done (palette AA, continuity, pillar enforcement) | 1–2, 6, 3 |

**Deliberately deferred to later stages** (not gaps): the acts themselves, `?calibrate=1`, shadcn, the interactive component redesigns, the handoff routes, R3F removal and the React-pin relaxation, and `assertContinuity`'s call site in a real act chain.

**Placeholder scan:** clean — no TBD/TODO/"similar to Task N"; every code step carries real code and every run step carries an exact command and expected result.

**Type consistency:** `Anchor` is defined once in `anchors.ts` and imported by `station.ts` and `pathBuilders.ts`; `PathShape` is defined and used only in `pathBuilders.ts`; `PillarAccent` (colour tiers) in `colors.ts` and `PillarAccentClasses` (Tailwind classes) in `pillarStyles.ts` are deliberately distinct names that never cross; `perStationVh` is defined in `scroll.ts` and consumed only by tests in this stage; `drawAt(progress, index, pillarCount)` keeps the same argument order everywhere it appears.

**Correction applied after the first implementer round.** As originally written, Task 1 created `src/design/colors.test.ts` — a test that reads `programmeColors[id].textLight`, `reservedPillarAccents`, and `brand.tealTextLight`. None of those exist until Task 2, so the file did not compile: `npx tsc --noEmit` reported 11 errors, `next build` failed its TypeScript gate, and every test failed at the `isHex` guard with `received undefined` rather than printing the ratios the plan predicted. That left the branch **unbuildable between Task 1 and Task 2**, contradicting this plan's own Global Constraint.

The fix is structural, not cosmetic: a test cannot reference a type shape that does not exist yet without breaking `tsc`, so **the token-table test now belongs to the task that introduces the shape**. Task 1 covers the WCAG maths against hex literals and ends green and buildable; Task 2 owns `src/design/colors.test.ts` and earns a genuine RED→GREEN by first carrying the shipped values into the new shape (Steps 1–3) and then installing the measured ones (Steps 4–5). The `isHex` guard added in Task 1 is what makes a partial migration fail loudly instead of silently producing `NaN` ratios.

---

## Stage 1 exit criteria

- `npx tsc --noEmit && npm run lint && npm run test && npm run build` all pass.
- The contrast test is green and the shipped palette's failures are recorded in commit history.
- `npm run build` still emits the same 29 routes; the page renders the same 12 sections with new colours.
- `LineStage` exists but is unused — Stage 2 binds it.
- Adding a sixth pillar id to `pillars.ts` fails `tsc` (verified by dry-run).
