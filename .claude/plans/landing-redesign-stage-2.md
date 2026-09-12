# Landing Redesign — Stage 2 (The Acts) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's 12 sections with the five acts (Origin, Five Pillars, Way, Proof, Doors), and do the thing Stage 1 deliberately left undone — define the Line layer's coordinate system — so the strand is continuously drawn from the hero to the CTA.

**Architecture:** Three pure modules carry the geometry, and every act is a thin client shell that renders server-passed copy over them. (a) `line/anchors.ts` holds the **seam contract** — each act's entry and exit as fractions of its own box — and `pathBuilders.ts` asserts it. (b) `line/frames.ts` is the **join**: it turns those act-local anchors and the track-local station positions into viewBox strings and path strings, which is the reconciliation ruled to be the caller's job (R8, ADR 0006). (c) `acts/layout.ts` turns a breakpoint branch into layout facts. The acts consume all three; `LineStage` stays the renderer and gains one prop.

**The join, in one line:** `viewBox` selection *is* the transform. Vertical acts render `viewBox="0 0 1 1"`, so act-local coordinates are viewBox coordinates verbatim; the walk renders `viewBox="0 0 N 1"` over an element `N × 100vw` wide, so `stationPositions`' `x = i` becomes the centre of slot `i` with one half-slot offset added by the caller.

**Tech Stack:** Next.js 16 (App Router, Turbopack) · React 19.2.8 (still pinned; R3F removal is Stage 4) · TypeScript 5 · Tailwind 4 · GSAP 3.15 + `@gsap/react` · Motion 13.2 (installed in Stage 1, **zero import sites today** — this stage is its first consumer) · Vitest (node environment)

**Spec:** [`spec.md`](../../docs/projects/landing-redesign/spec.md) — read §3, §4, §5, §8, §9, §10.2, §10.3 before starting. The stage's planning inputs are [`stages/README.md`](../../docs/projects/landing-redesign/stages/README.md) §Stage 2. Stage 1's executed plan is [`stages/stage-1.md`](../../docs/projects/landing-redesign/stages/stage-1.md) — its rulings are [`../rulings.md`](../../docs/projects/landing-redesign/rulings.md).

**Owner decisions this plan implements** (taken 2026-09-13, before writing):

| # | Decision |
|---|---|
| D1 | **Rewrite the anchors and state the true seam rule.** Every vertical act's strand enters at its top and leaves at its bottom; the walk is named as a 1→N fork at one seam and an N→1 convergence at the other. `assertContinuity` is re-specified to check the seam, not raw equality. |
| D2 | **The fork is a downward leave** — the strand descends to a fork point above the fold and five branches fan down-and-out to seeds at `y = 1`. |
| D3 | **Copy: drafted in this file and approved by the owner 2026-09-13** — the Act 1 rail's sr-only label, the Act 3 seed-content line, and the per-door benefit cuts, all exactly as written below. |
| D4 | **In scope:** retire `CursorProvider`, retire `useScrollProgress` + `useParallax`, build `?calibrate=1`. **Out of scope:** the `/impact` copy defect (Stage 3 owns that route) — carried forward in §Documentation obligations. |

## Global Constraints

- **The loop is four commands, after every task:** `npx tsc --noEmit && npm run lint && npm run test && npm run build`. Three of four is not green.
- **Never `overflow-hidden` on an ancestor of a pinned or sticky section.** It becomes the sticky element's scroll box and silently breaks the pinning. Put the clip on a *descendant* of the pinned element.
- **Never run `rm -rf .next` while a dev server is running** (a recorded incident, not a precaution). Run it after any file delete or rename, before the gate — Task 10 deletes ~20 files in one commit.
- **Reduced motion is a hard requirement, and CSS can no longer provide it.** Every GSAP setup pairs with `gsap.matchMedia()` and renders the final state under `REDUCED_MOTION_QUERY`. The CSS backstop (`globals.css:508-538`, including `[data-line-path]{stroke-dashoffset:0 !important}`) stays as the no-JS fallback.
- **Engine split — never both on the same property of the same element.** GSAP owns anything scrubbed or pinned; Motion owns anything discrete or state-driven. If an element seems to need both, it is two nested elements.
- **`design/motion.ts` is the single source of timings; `design/scroll.ts` of calibration.** No new durations. The two spec-pinned literal sets (`scroll.ts`'s constants, `colors.ts`'s hexes) are not retuned here.
- **Tailwind 4 needs literal class names.** `bg-ec-${x}` emits no CSS. Any class depending on data is written out or passed as a complete literal string literal in a map.
- **The strand is `aria-hidden="true"`; every word is real DOM text in logical order.** The animation is decoration over a document that already works without it. A pillar accent is never the only signal.
- **The assistant never launches a browser or curls the site.** Visual QA is the owner's; `?calibrate=1` (Task 11) exists so their report can carry numbers.
- **No route is deleted, and `/programmes`, `/programmes/[slug]`, `/methodology`, `/impact` are Stage 3's** — not touched here except where a shared data module changes.
- **Do not touch the dashboard.** `src/app/dashboard/**` and `src/components/dashboard/**`.
- **Commits:** one per task, at the end, staging files explicitly — never `git add -A`. There is unrelated work in the tree (`.claude/skills/run-a-stage/SKILL.md` and `src/app/(site)/about/page.tsx` are modified in the working tree and belong to no task here).
- **Tests are `.test.ts`, never `.test.tsx`.** `vitest.config.mts:16` (`include: ['src/**/*.test.ts']`) silently drops `.tsx` tests — reconfirmed twice with deliberately-failing probes. Component contracts are pinned with `renderToStaticMarkup` + `createElement` in a `.test.ts` (ADR 0007). Effects are not reachable from the suite; say so rather than implying coverage.

---

## File Structure

**Created in this stage:**

| File | Responsibility |
|---|---|
| `src/components/educraft/line/frames.ts` | **The join.** ViewBox policy per act, the walk frame, seed anchors, fork paths, the ribbon frame, and the two cross-arity seam assertions. Pure; no DOM, no React. |
| `src/components/educraft/line/frames.test.ts` | Tests for the above, pinned to literals. |
| `src/components/educraft/acts/ActSection.tsx` | **Server** component: the common act frame (section element, id, eyebrow, heading, spacing). Renders server-side copy; ships no JS. |
| `src/components/educraft/acts/Origin.tsx` | Act 0's client shell: the strand draw, the headline mask reveal, the pinned fork. |
| `src/components/educraft/acts/FivePillars.tsx` | Act 1's client shell: the pinned horizontal walk, the rail buttons, the journey ribbon. |
| `src/components/educraft/acts/Way.tsx` | Act 2's client shell: differentiators + method steps on one vertical strand. |
| `src/components/educraft/acts/Proof.tsx` | Act 3's client shell: the evidence axis, the stat row, the pulls. |
| `src/components/educraft/acts/Doors.tsx` | Act 4's client shell: three doors, and the strand's termination in the CTA. |
| `src/components/educraft/acts/FinalCTA.tsx` | Moved from `landing/FinalCTA.tsx`, kept and restyled (§5: "kept, strand terminates in it"). |
| `src/components/educraft/motion/MaskLine.tsx` | The Motion line-mask reveal (§3.4 names this file). Client. |
| `src/components/educraft/acts/Calibrate.tsx` | The dev-only `?calibrate=1` overlay (§10.3). Client. |
| `src/lib/calibrate.ts` | Pure formatting for the overlay: progress → the reported lines. |
| `src/lib/calibrate.test.ts` | Tests for the above. |

**Modified in this stage:**

| File | Change |
|---|---|
| `src/components/educraft/line/anchors.ts` | The ten anchor values are rewritten for real travel (D1); `VERTICAL_CHAIN` added; the frames docstring corrected. |
| `src/components/educraft/line/anchors.test.ts` | Re-pinned to the new values; the seam test becomes the vertical-seam test. |
| `src/components/educraft/line/pathBuilders.ts` | `assertContinuity` re-specified to the true seam rule; `polylinePath` added for the ribbon. |
| `src/components/educraft/line/pathBuilders.test.ts` | Tests for both. |
| `src/components/educraft/line/LineStage.tsx` | `draw?: boolean` — the render-only mode. Defaults preserve today's markup exactly. |
| `src/components/educraft/line/LineStage.test.ts` | A pin for the new default and the render-only markup. |
| `src/app/(site)/page.tsx` | 12 sections → 5 acts, and the one runtime `assertContinuity` call site. |
| `src/app/(site)/layout.tsx` | `CursorProvider` removed (D4). |

**Deleted in this stage (all in Task 10, one commit):**

| Path | Why |
|---|---|
| `src/components/educraft/landing/{Hero,Ecosystem,ProgrammeExplorer,WhyDifferent,StudentJourney,Methodology,Impact,Testimonials,AudienceEntryPoints,ProgrammeDeepDive,InsightsTeaser}.tsx` | Retired or rebuilt by §5. 11 files; only `FinalCTA.tsx` survives, moved to `acts/`. |
| `src/components/educraft/landing/` (the directory) | Empty after the move. |
| `src/components/educraft/graphics/EcosystemGraphic.tsx` | Retired; its only consumer was `Ecosystem.tsx` (verified). |
| `src/components/educraft/three/**` | Reachable only from `Hero.tsx` (verified). **11 files, not the 13 §5 claims** — the count is corrected in the commit body. The *packages* stay until Stage 4. |
| `src/components/educraft/hooks/useSceneActive.ts` (verify path by grep) | Used only inside `three/`. |
| `src/hooks/useScrollProgress.ts`, `src/hooks/useParallax.ts` | All consumers retire or are rebuilt here (verified: `Hero`, `ProgrammeExplorer`, `StudentJourney`, `Methodology` for the first; `Testimonials` for the second). |
| `src/components/educraft/motion/CursorProvider.tsx` | §13 item 1, resolved for retirement; its only consumer is `(site)/layout.tsx`. |

**Not touched:** `line/station.ts` (the join needs no change to it — see Task 2), `line/anchors.ts`'s freezing helpers, `design/scroll.ts`, `design/motion.ts`, `design/colors.ts`, `globals.css`, `src/lib/gsap.ts`, everything under `src/components/dashboard/`, and the four handoff routes.

---

## Task 1: The anchor contract states the seam rule, not equality

The shipped contract says a seam holds when `exit == enter` as raw values. That can never hold for this geometry: a correct vertical stack has act *i*'s exit on its own bottom edge (`y = 1`) and act *i+1*'s entry on its own top edge (`y = 0`) — the same screen point, different numbers. Driven with real geometry, `assertContinuity` throws a false alarm; called with no argument it re-validates a frozen literal against itself. This task replaces the premise with the true one and rewrites the ten invented values so each act's strand actually travels.

**Files:**
- Modify: `src/components/educraft/line/anchors.ts`, `src/components/educraft/line/anchors.test.ts`
- Modify: `src/components/educraft/line/pathBuilders.ts`, `src/components/educraft/line/pathBuilders.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `ACT_ANCHORS` (rewritten values; same `AnchorPair` shape), `VERTICAL_CHAIN` (a frozen sub-record of the four post-fork acts), `assertContinuity(chain = VERTICAL_CHAIN)` (re-specified), `polylinePath(points: readonly Anchor[]): string` — consumed by Task 2's `frames.ts` and by Task 10's page.
- Unchanged and load-bearing: `ACT_ORDER`, `ActName`, `Anchor`, `endpoints()`, `pathFor`, `NonFiniteCoordinateError`.

**The values.** x is a fraction of the act's own box width; y runs down its own band, `0` = top edge, `1` = bottom edge.

| Act | enter | exit | Why |
|---|---|---|---|
| `origin` | `{x: 0.72, y: 0}` | `{x: 0.5, y: 0.85}` | Enters top-right (unchanged); exits at **the fork point**, above the fold, so the five branches have room to descend into it (D2). |
| `pillars` | `{x: 0.75, y: 0}` | `{x: 0.75, y: 1}` | The act's vertical **envelope**. The walk's rail is generated by `frames.ts` in its own frame and does not read these; the ribbon's exit is at `x = 0.75` (Task 2), which is what this value must agree with. |
| `way` | `{x: 0.75, y: 0}` | `{x: 0.75, y: 1}` | Real travel, top to bottom — the differentiators' `01`–`05` and the five method steps are nodes on it. |
| `proof` | `{x: 0.75, y: 0}` | `{x: 0.75, y: 1}` | Real travel. The evidence axis is the strand's interior, generated by the act. |
| `doors` | `{x: 0.75, y: 0}` | `{x: 0.75, y: 0.5}` | The strand **ends** inside `FinalCTA`, converging to the CTA node at mid-band. |

`x = 0.75` is the page's spine, and it deliberately echoes the hero's `0.72` entry: the strand comes in top-right and settles just inside it. `origin.exit.x = 0.5` is the only other x — the fork is centred because the seeds fan symmetrically about it (`0.1 … 0.9`).

- [ ] **Step 1: Rewrite the anchor values as a failing test**

Replace the body of `anchors.test.ts` between its docstring and the freezing tests. The `SEAMS` constant and the equality test are replaced by an explicit vertical-seam list plus a test that documents the fork's exception:

```ts
/**
 * The three edge-to-edge seams, in scroll order. Written out rather than
 * derived, so a deletion or reorder of an act fails rather than silently
 * reshaping the loop.
 */
const VERTICAL_SEAMS: [ActName, ActName][] = [
  ['pillars', 'way'],
  ['way', 'proof'],
  ['proof', 'doors'],
];

describe('ACT_ANCHORS', () => {
  it('carries exactly the five designed acts, in scroll order', () => {
    expect(Object.keys(ACT_ANCHORS)).toEqual(['origin', 'pillars', 'way', 'proof', 'doors']);
    expect(ACT_ORDER).toEqual(['origin', 'pillars', 'way', 'proof', 'doors']);
  });

  it('pins every anchor value', () => {
    expect(ACT_ANCHORS).toEqual({
      origin: { enter: { x: 0.72, y: 0 }, exit: { x: 0.5, y: 0.85 } },
      pillars: { enter: { x: 0.75, y: 0 }, exit: { x: 0.75, y: 1 } },
      way: { enter: { x: 0.75, y: 0 }, exit: { x: 0.75, y: 1 } },
      proof: { enter: { x: 0.75, y: 0 }, exit: { x: 0.75, y: 1 } },
      doors: { enter: { x: 0.75, y: 0 }, exit: { x: 0.75, y: 0.5 } },
    });
  });

  it('gives every vertical act a real edge-to-edge run', () => {
    for (const [from, to] of VERTICAL_SEAMS) {
      const exit = ACT_ANCHORS[from].exit;
      const enter = ACT_ANCHORS[to].enter;
      expect(exit.y, `${from}.exit sits on its own bottom edge`).toBe(1);
      expect(enter.y, `${to}.enter sits on its own top edge`).toBe(0);
      expect(exit.x, `${from}.exit and ${to}.enter share a horizontal fraction`).toBe(enter.x);
    }
    // Not vacuous: three of the five acts used to have enter === exit, which is
    // the shape this test exists to forbid.
    for (const act of ['pillars', 'way', 'proof', 'doors'] as const) {
      expect(ACT_ANCHORS[act].enter).not.toEqual(ACT_ANCHORS[act].exit);
    }
  });

  it('leaves the fork point above the fold, so the fan can descend into it', () => {
    // The one anchor that is deliberately not on an act edge: the single strand
    // forks here and the seeds sit below it at y = 1. `assertContinuity` is
    // called with VERTICAL_CHAIN, never with this record — see pathBuilders.
    expect(ACT_ANCHORS.origin.exit.y).toBeLessThan(1);
    expect(ACT_ANCHORS.origin.exit).toEqual({ x: 0.5, y: 0.85 });
  });

  it('ends the strand at the CTA node rather than at an edge', () => {
    expect(ACT_ANCHORS.doors.exit).toEqual({ x: 0.75, y: 0.5 });
  });

  it('enters the hero at the top-right', () => {
    expect(ACT_ANCHORS.origin.enter).toEqual({ x: 0.72, y: 0 });
  });

  it('keeps both coordinates plain numbers', () => {
    const x: number = ACT_ANCHORS.origin.enter.x;
    const y: number = ACT_ANCHORS.doors.exit.y;
    expect(typeof x).toBe('number');
    expect(typeof y).toBe('number');
  });

  it('holds the vertical chain as the four post-fork acts, in scroll order', () => {
    expect(Object.keys(VERTICAL_CHAIN)).toEqual(['pillars', 'way', 'proof', 'doors']);
    // Same objects, not copies: a seam cannot be moved in one place only.
    expect(VERTICAL_CHAIN.way).toBe(ACT_ANCHORS.way);
  });

  it('is frozen all the way down, so no helper can rewrite the contract in place', () => {
    // ... unchanged from the shipped test, over ACT_ORDER ...
  });

  it('rejects an in-place rewrite of a shared anchor', () => {
    // ... unchanged from the shipped test ...
  });
});
```

Update the import line to `import { ACT_ANCHORS, ACT_ORDER, VERTICAL_CHAIN, type ActName } from './anchors';` and rewrite the file's docstring: the values are no longer "invented and unvalidated" — they are the D1/D2 geometry, and the sentence about `assertContinuity` being "blind to the two free ends" is replaced by the seam rule.

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/components/educraft/line/anchors.test.ts
```
Expected: **FAIL** — `VERTICAL_CHAIN` is not exported (`SyntaxError: The requested module does not provide an export named 'VERTICAL_CHAIN'`), and if the import is trimmed to compile, the pinned-values test reports the old numbers.

- [ ] **Step 3: Rewrite `anchors.ts`**

Keep `ACT_ORDER`, `ActName`, `Anchor`, `AnchorPair`, `endpoints()` and the freezing exactly as they are. Replace the `ACT_ANCHORS` docstring and literal with:

```ts
/**
 * Where each act's strand enters and leaves, in **act-local** coordinates:
 * x is a fraction of one act's own width, y runs 0 (its top edge) to 1 (its
 * bottom edge). Not viewport coordinates, and not the track-local frame
 * `stationPositions` uses.
 *
 * **The contract is a shape, not an equality.** An act's `enter` sits on its
 * top edge and its `exit` on its bottom edge, and neighbouring acts agree on
 * their horizontal fraction — so the two sides of a seam are the same *screen*
 * point even though they are different *numbers*, because each is expressed in
 * its own act's box. `assertContinuity` (pathBuilders.ts) checks exactly that,
 * and reading it as `exit === enter` is what made the shipped version throw a
 * false alarm on correct geometry.
 *
 * Two acts leave the pattern on purpose:
 * - `origin.exit` is **the fork point**, above the fold at y = 0.85, where the
 *   single strand becomes N. The seeds it forks into sit at y = 1 and are
 *   generated by `seedAnchors` (frames.ts), which also asserts that seam.
 * - `doors.exit` is **the CTA node** at mid-band: the strand ends inside
 *   `FinalCTA` rather than leaving the page.
 *
 * `satisfies Record<ActName, …>` rather than `Record<string, …>`: it constrains
 * the *keys*, so a renamed or deleted act is a compile error.
 */
export const ACT_ANCHORS = Object.freeze({
  origin: endpoints(
    /** The strand enters the hero from the top-right. */
    { x: 0.72, y: 0 },
    /** The fork point: one strand becomes N, and the seeds hang below it. */
    { x: 0.5, y: 0.85 },
  ),
  pillars: endpoints(
    /** The act's envelope. The walk's rail is generated in its own frame by
     * `frames.ts`; this is the top edge the act's band starts from, and its
     * exit must agree with the ribbon's exit x (Task 2). */
    { x: 0.75, y: 0 },
    { x: 0.75, y: 1 },
  ),
  way: endpoints({ x: 0.75, y: 0 }, { x: 0.75, y: 1 }),
  proof: endpoints({ x: 0.75, y: 0 }, { x: 0.75, y: 1 }),
  doors: endpoints(
    { x: 0.75, y: 0 },
    /** The strand converges to a single point — the CTA node. */
    { x: 0.75, y: 0.5 },
  ),
} satisfies Record<ActName, AnchorPair>);

/**
 * The acts whose strand runs edge to edge through its own band, in scroll
 * order — the chain `assertContinuity` is defined over, and its default.
 *
 * `origin` is absent because it hands off through the fork rather than through
 * an edge: its exit is the fork point, so passing this whole record would throw
 * on a *correct* contract. The seams either side of it are the arity changes —
 * the fan (1→N, checked by `assertForkSeam`) and the ribbon's convergence
 * (N→1, checked by `assertRibbonSeam`), both in `frames.ts`.
 *
 * Built from `ACT_ANCHORS` by reference, not by copy: a seam that moves in one
 * place must move in both.
 */
export const VERTICAL_CHAIN = Object.freeze({
  pillars: ACT_ANCHORS.pillars,
  way: ACT_ANCHORS.way,
  proof: ACT_ANCHORS.proof,
  doors: ACT_ANCHORS.doors,
});
```

- [ ] **Step 4: Run the anchors test to verify it passes**

```bash
npx vitest run src/components/educraft/line/anchors.test.ts
```
Expected: **PASS**, all cases.

- [ ] **Step 5: Write the failing test for the new seam rule and `polylinePath`**

In `pathBuilders.test.ts`, replace the `assertContinuity` describe block and append:

```ts
describe('assertContinuity', () => {
  it('accepts the vertical chain as shipped', () => {
    expect(() => assertContinuity()).not.toThrow();
  });

  it('rejects an exit that is not on its act bottom edge', () => {
    const chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 0.9 } },
      b: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
    };
    expect(() => assertContinuity(chain)).toThrow(/bottom edge/);
  });

  it('rejects an enter that is not on its act top edge', () => {
    const chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
      b: { enter: { x: 0.5, y: 0.1 }, exit: { x: 0.5, y: 1 } },
    };
    expect(() => assertContinuity(chain)).toThrow(/top edge/);
  });

  it('rejects a seam whose two sides disagree horizontally, and names both', () => {
    const chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
      b: { enter: { x: 0.6, y: 0 }, exit: { x: 0.6, y: 1 } },
    };
    expect(() => assertContinuity(chain)).toThrow(/a\.exit → b\.enter/);
    expect(() => assertContinuity(chain)).toThrow(/0\.5/);
  });

  it('throws when handed the whole ACT_ANCHORS record, by design', () => {
    // origin.exit is the fork point at y = 0.85, not an act edge. This is the
    // arity change D1 named: the chain is VERTICAL_CHAIN, never the full record.
    expect(() => assertContinuity(ACT_ANCHORS)).toThrow(/bottom edge/);
  });

  it('still accepts a two-act fixture that satisfies the seam rule', () => {
    // The signature is unchanged, so the two-act fixtures keep compiling.
    expect(() =>
      assertContinuity({
        one: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
        two: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
      })
    ).not.toThrow();
  });
});

describe('polylinePath', () => {
  it('emits one M and one L per remaining point', () => {
    expect(
      polylinePath([
        { x: 1.5, y: 0.5 },
        { x: 2.5, y: 0.5 },
        { x: 3.5, y: 1 },
      ])
    ).toBe('M 1.5 0.5 L 2.5 0.5 L 3.5 1');
  });

  it('rounds to two decimals like pathFor', () => {
    expect(polylinePath([{ x: 0.123, y: 0.456 }, { x: 0.789, y: 1 }]))
      .toBe('M 0.12 0.46 L 0.79 1');
  });

  it('throws on a single point rather than emitting a path with no segment', () => {
    expect(() => polylinePath([{ x: 0.5, y: 0.5 }])).toThrow(/at least two/);
  });

  it('rejects a non-finite coordinate that only becomes non-finite when rounded', () => {
    expect(() => polylinePath([{ x: 0, y: 0 }, { x: Number.MAX_VALUE, y: 0 }]))
      .toThrow(NonFiniteCoordinateError);
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

```bash
npx vitest run src/components/educraft/line/pathBuilders.test.ts
```
Expected: **FAIL** — `polylinePath` is undefined; the seam cases report the old `Strand seam broken between …` message.

- [ ] **Step 7: Re-specify `assertContinuity` and add `polylinePath`**

In `pathBuilders.ts`, replace the `assertContinuity` implementation and docstring:

```ts
const SEAM_EPSILON = 1e-6;

/**
 * One side of a seam, as fractions of its own act's box — see `anchors.ts`.
 * The two sides of a seam are the same screen point while being different
 * numbers, which is why the check is a shape and not an equality.
 */
function assertSeamSide(label: string, side: Anchor, edge: 'top' | 'bottom'): void {
  const expected = edge === 'top' ? 0 : 1;
  if (Math.abs(side.y - expected) > SEAM_EPSILON) {
    throw new Error(
      `Strand seam broken at ${label}: an act's ${edge} edge is y = ${expected}, ` +
        `but the anchor is at y = ${side.y}. Each act's strand must enter at its own ` +
        'top edge and leave at its own bottom edge.'
    );
  }
}

/**
 * Proves the seam contract: each act's exit sits on its own bottom edge
 * (y = 1), the next act's enter sits on its own top edge (y = 0), and the two
 * agree on their horizontal fraction — so the strand reads as one continuous
 * line across the boundary while each act keeps its own coordinate box.
 *
 * **Re-specified in Stage 2.** The shipped version demanded `exit == enter` as
 * raw values, which no correct vertical chain can satisfy: act i's exit is in
 * act i's box and act i+1's enter is in act i+1's box, one band apart. Driven
 * with real geometry it threw a false alarm; called with no argument it
 * re-validated a frozen literal against itself. The premise was the defect.
 * `docs/projects/landing-redesign/rulings.md` records the original finding and
 * ADR 0008 the re-specification.
 *
 * The order checked is `Object.keys(chain)` — **insertion order, not
 * `ACT_ORDER`**. For the default `VERTICAL_CHAIN` the two coincide because the
 * literal is written in scroll order, and `anchors.test.ts` pins that key
 * order. The parameter stays a plain record rather than `Record<ActName, …>`
 * so the two-act test fixtures keep compiling.
 *
 * **The arity changes are not this function's business.** `origin.exit` is the
 * fork point and the ribbon's exit is the convergence, so passing `ACT_ANCHORS`
 * throws *by design*; `frames.ts` asserts those two seams with
 * `assertForkSeam` and `assertRibbonSeam`.
 */
export function assertContinuity(chain: ActChain = VERTICAL_CHAIN): void {
  const names = Object.keys(chain);
  for (let i = 0; i < names.length - 1; i += 1) {
    const from = names[i];
    const to = names[i + 1];
    const exit = chain[from].exit;
    const enter = chain[to].enter;
    assertSeamSide(`${from}.exit`, exit, 'bottom');
    assertSeamSide(`${to}.enter`, enter, 'top');
    const dx = Math.abs(exit.x - enter.x);
    if (dx > SEAM_EPSILON) {
      throw new Error(
        `Strand seam broken between ${from}.exit (x = ${exit.x}) and ` +
          `${to}.enter (x = ${enter.x}) — delta ${dx}. The two sides of a seam must ` +
          'share a horizontal fraction of their own act box.'
      );
    }
  }
}
```

Update the import at the top of the file to `import { ACT_ANCHORS, VERTICAL_CHAIN, type Anchor } from './anchors';` — **`ACT_ANCHORS` is still imported** because the two-act fixtures in the test import it from here is not the case; keep the import only if used. Check with `tsc`: if `ACT_ANCHORS` becomes unused in this module, drop it from the import.

Append `polylinePath`:

```ts
/**
 * A path through two or more points, as one `M` followed by `L` commands.
 *
 * Used for strands that pass *through* nodes rather than running between two
 * anchors — the journey ribbon's six stages sit on one continuing strand. A
 * single `d` with several `L` commands is deliberate: concatenating several
 * `pathFor` outputs would emit several `M`s, and `pathLength="1"` normalises the
 * dash against the total of the subpaths, which is behaviour worth not
 * depending on.
 *
 * Same rounding and same result-not-argument finiteness discipline as
 * `pathFor`, for the same reason: `round` multiplies by 100, so a finite
 * coordinate above `Number.MAX_VALUE / 100` overflows *inside the rounding*.
 */
export function polylinePath(points: readonly Anchor[]): string {
  if (points.length < 2) {
    throw new Error(
      `polylinePath: needs at least two points, received ${points.length}. ` +
        'A single point has no segment to draw.'
    );
  }
  const rounded = points.map((point) => ({ x: round(point.x), y: round(point.y) }));
  rounded.forEach((point, index) => {
    assertFinite(`point ${index} x`, point.x);
    assertFinite(`point ${index} y`, point.y);
  });
  const [head, ...tail] = rounded;
  return [`M ${head.x} ${head.y}`, ...tail.map((point) => `L ${point.x} ${point.y}`)].join(' ');
}
```

- [ ] **Step 8: Run the tests to verify they pass**

```bash
npx vitest run src/components/educraft/line/
```
Expected: **PASS**. `anchors.test.ts` and `pathBuilders.test.ts` green; `station.test.ts` and `LineStage.test.ts` untouched and green.

- [ ] **Step 9: Run the full gate**

```bash
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
Expected: all four pass. `npm run build` still emits the same route table — the page is untouched in this task and still renders 12 sections.

- [ ] **Step 10: Commit**

```bash
git add src/components/educraft/line/anchors.ts src/components/educraft/line/anchors.test.ts src/components/educraft/line/pathBuilders.ts src/components/educraft/line/pathBuilders.test.ts
git commit -m "refactor(line): state the seam rule, and give every act a real run

assertContinuity demanded exit == enter as raw values, which no correct
vertical chain can satisfy: act i's exit is in act i's box and act i+1's
enter is in act i+1's box, one band apart. It threw a false alarm on
correct geometry. It now checks the shape of a seam - exit on the bottom
edge, enter on the top edge, one shared horizontal fraction - and is
called with VERTICAL_CHAIN, since origin hands off through the fork.

The ten invented values are replaced by the D1/D2 geometry: the strand
enters top-right, forks above the fold, and runs a real edge-to-edge
strand through way, proof and doors on a spine at x = 0.75.

polylinePath is added for strands that pass through nodes (the ribbon)."
```

---

## Task 2: The join — `frames.ts` is the coordinate system

**This is the task Stage 1 could not write.** `LineStage` imports `cn`, `motion`, `SCRUB` and GSAP — not `anchors`, `station` or `pathBuilders`. Nothing in the shipped code ever draws a strand, and wiring the three modules naively gives a rail at **0.33%** of the default `1200×800` viewBox and an arc of **0.26px × 1.13px** at 1440×900. R8 ruled that `pathFor` is frame-agnostic and the transform is the caller's; ADR 0006 records the frames. This module *is* that caller.

**The reconciliation is viewBox selection.** `LineStage` already takes `viewBoxWidth`/`viewBoxHeight` and is documented as caller-scaled. So:

- A **vertical act** renders `viewBox="0 0 1 1"`. Act-local coordinates then *are* viewBox coordinates, verbatim, and `anchors.ts` needs no change.
- **The walk** renders `viewBox="0 0 N 1"` over an element `N × 100vw` wide and `100vh` tall, so one viewBox unit is exactly one viewport. `stationPositions`' `x = i` becomes the centre of slot `i` by adding **one half-slot offset** — the whole of the caller's transform, and the reason this module exists.

The walk's slices then line up with `drawAt` for free: the rail spans `0 … N` in units, so slice `i` is `[i, i+1]`, exactly one unit wide, with station `i` at its midpoint. `drawAt(progress, i, n) = clamp01(n·progress − i)` is the fraction of *that* slice, so "each segment draws as the walk arrives at it" holds by construction rather than by coincidence. Task 2's tests assert precisely that — station `i` is the midpoint of segment `i` — because it is the join's central claim.

**Files:**
- Create: `src/components/educraft/line/frames.ts`, `src/components/educraft/line/frames.test.ts`

**Interfaces:**
- Consumes: `ACT_ANCHORS`, `Anchor` (Task 1); `pathFor`, `polylinePath` (Task 1); `stationPositions` (`line/station.ts`, unchanged).
- Produces: `ACT_VIEW_BOX` (string), `seedAnchors(pillarCount): Anchor[]`, `forkPaths(pillarCount): string[]`, `assertForkSeam(pillarCount, fork?): void`, `walkFrame(pillarCount): WalkFrame`, `ribbonFrame(stageCount, pillarCount): RibbonFrame`, `assertRibbonSeam(pillarCount, stageCount, spineX?): void`, and the types `WalkFrame` / `RibbonFrame`. Consumed by Tasks 5–9 (the acts) and Task 10 (the page's call site).
- **Does not change `station.ts`.** The half-slot offset lives here, in the caller, which is what R8 requires.

- [ ] **Step 1: Write the failing test**

Create `src/components/educraft/line/frames.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS } from './anchors';
import {
  ACT_VIEW_BOX,
  assertForkSeam,
  assertRibbonSeam,
  forkPaths,
  ribbonFrame,
  seedAnchors,
  walkFrame,
} from './frames';

/**
 * The join. Source: Landing-Redesign-Plan.md §3.1, ADR 0006 (the frames), and
 * the Stage 2 join ruling (2026-09-13).
 *
 * These are the assertions that decide whether a strand is drawn at all. Stage 1
 * shipped three correct modules and a correct renderer with nothing joining
 * them; the measured symptom was a rail at 0.33% of the viewBox and an arc of
 * 0.26px × 1.13px. Every value below is therefore pinned to a literal, and the
 * join invariant is asserted directly rather than inferred from the numbers.
 */

describe('ACT_VIEW_BOX', () => {
  it('is the act-local unit box, so anchors need no arithmetic', () => {
    expect(ACT_VIEW_BOX).toBe('0 0 1 1');
  });
});

describe('seedAnchors', () => {
  it('spreads five seeds across the fold, symmetric about the fork', () => {
    expect(seedAnchors(5)).toEqual([
      { x: 0.1, y: 1 },
      { x: 0.3, y: 1 },
      { x: 0.5, y: 1 },
      { x: 0.7, y: 1 },
      { x: 0.9, y: 1 },
    ]);
  });

  it('pins exact values rather than float noise', () => {
    // 0.1 + 0.8 * (1/4) is 0.30000000000000004 in binary floating point. The
    // values are rounded in the module so a correct implementation passes a
    // strict equality assertion, and so two seeds that must mirror each other
    // cannot differ in their last bits.
    expect(seedAnchors(5)[1].x).toBe(0.3);
    expect(seedAnchors(7)[3].x).toBe(0.5);
  });

  it('stays symmetric about the fork for any count', () => {
    for (const n of [2, 3, 5, 7]) {
      const seeds = seedAnchors(n);
      expect(seeds).toHaveLength(n);
      seeds.forEach((seed, i) => {
        const mirror = seeds[n - 1 - i];
        expect(seed.x + mirror.x, `n=${n}, i=${i}`).toBeCloseTo(
          2 * ACT_ANCHORS.origin.exit.x,
          10
        );
      });
      expect(seeds.every((seed) => seed.y === 1)).toBe(true);
    }
  });

  it('puts a single seed on the fork point itself', () => {
    expect(seedAnchors(1)).toEqual([{ x: ACT_ANCHORS.origin.exit.x, y: 1 }]);
  });

  it('derives its spread from the fork, not from a hardcoded centre', () => {
    // The width is a margin in from each edge: for five seeds, 0.1 … 0.9.
    expect(seedAnchors(5)[0].x).toBe(0.1);
    expect(seedAnchors(5)[4].x).toBe(0.9);
  });
});

describe('forkPaths', () => {
  it('emits one curve per seed, each leaving the shared fork point', () => {
    const paths = forkPaths(5);
    expect(paths).toHaveLength(5);
    for (const d of paths) {
      expect(d.startsWith(`M ${ACT_ANCHORS.origin.exit.x} ${ACT_ANCHORS.origin.exit.y} `)).toBe(true);
      expect(d, 'the fork shape is a curve, not a line').toContain('C');
    }
    expect(new Set(paths).size, 'five distinct branches').toBe(5);
  });

  it('leaves downward, which needs dy > 0', () => {
    // pathFor's 'fork' shape holds the first control point's x at the origin,
    // which only reads as a downward leave while dy is non-zero. With the fork
    // point above the fold this is true; with the shipped y = 1 it was not.
    const tokens = forkPaths(5)[0].split(' ');
    expect(Number(tokens.at(-1)), 'lands on the fold').toBe(1);
    expect(Number(tokens.at(-2)), 'at the outermost seed').toBe(0.1);
    expect(ACT_ANCHORS.origin.exit.y).toBeLessThan(1);
  });
});

describe('walkFrame', () => {
  it('uses a frame of one unit per viewport, N units wide', () => {
    const frame = walkFrame(5);
    expect(frame.viewBox).toBe('0 0 5 1');
    expect(frame.widthVw).toBe(500);
  });

  it('places station i at the centre of slot i — the join, asserted directly', () => {
    const frame = walkFrame(5);
    expect(frame.stations).toEqual([
      { x: 0.5, y: 0.5 },
      { x: 1.5, y: 0.5 },
      { x: 2.5, y: 0.5 },
      { x: 3.5, y: 0.5 },
      { x: 4.5, y: 0.5 },
    ]);
    // The claim that matters: every station is the midpoint of its own segment.
    frame.stations.forEach((station, i) => {
      const [from, to] = segmentEnds(frame.railSegments[i]);
      expect((from + to) / 2, `station ${i} is the midpoint of its segment`).toBe(station.x);
      expect(to - from, `segment ${i} is one unit wide`).toBe(1);
    });
  });

  it('runs the rail edge to edge in N one-unit segments', () => {
    const frame = walkFrame(5);
    expect(frame.rail).toBe('M 0 0.5 L 5 0.5');
    expect(frame.railSegments).toEqual([
      'M 0 0.5 L 1 0.5',
      'M 1 0.5 L 2 0.5',
      'M 2 0.5 L 3 0.5',
      'M 3 0.5 L 4 0.5',
      'M 4 0.5 L 5 0.5',
    ]);
  });

  it('follows the station baseline rather than repeating it', () => {
    // The rail's y is read from stationPositions' own output, so a change to
    // WALK_BASELINE_Y in station.ts moves the rail with it.
    expect(walkFrame(5).rail).toContain('0.5');
    expect(walkFrame(3).rail).toBe('M 0 0.5 L 3 0.5');
  });

  it('scales to a sixth and seventh pillar with no rewrite', () => {
    expect(walkFrame(6).viewBox).toBe('0 0 6 1');
    expect(walkFrame(7).railSegments).toHaveLength(7);
    expect(walkFrame(7).stations[6].x).toBe(6.5);
  });

  it('refuses a walk with no pillars, loudly', () => {
    // Unlike perStationVh, this cannot degrade quietly: an empty walk is a page
    // with no content, and a hand-built SVG with no stations would render a
    // strand to nowhere rather than an error.
    expect(() => walkFrame(0)).toThrow(/at least one pillar/);
  });
});

describe('ribbonFrame', () => {
  it('puts six stages on one continuing strand, after a convergence slot', () => {
    const frame = ribbonFrame(6, 5);
    expect(frame.viewBox).toBe('0 0 8 1');
    expect(frame.nodes).toEqual([
      { x: 1.5, y: 0.5 },
      { x: 2.5, y: 0.5 },
      { x: 3.5, y: 0.5 },
      { x: 4.5, y: 0.5 },
      { x: 5.5, y: 0.5 },
      { x: 6.5, y: 0.5 },
    ]);
  });

  it('exits on the page spine, read from the contract', () => {
    // The ribbon is Act 1's tail; its exit is the seam into Act 2. The value is
    // read from ACT_ANCHORS so the two cannot disagree, and expressed as a
    // fraction of the ribbon's own box — which is what a seam compares.
    const frame = ribbonFrame(6, 5);
    expect(frame.exit.x / frame.width).toBe(ACT_ANCHORS.pillars.exit.x);
    expect(frame.exit.y).toBe(1);
    expect(ACT_ANCHORS.way.enter.x).toBe(ACT_ANCHORS.pillars.exit.x);
  });

  it('converges N strands into the first node', () => {
    const frame = ribbonFrame(6, 5);
    expect(frame.convergence).toHaveLength(5);
    for (const d of frame.convergence) {
      expect(d.startsWith('M 0 ')).toBe(true);
      expect(d.endsWith('1.5 0.5')).toBe(true);
    }
  });

  it('draws the strand through every node and out to the exit', () => {
    const frame = ribbonFrame(6, 5);
    expect(frame.strand).toBe('M 1.5 0.5 L 2.5 0.5 L 3.5 0.5 L 4.5 0.5 L 5.5 0.5 L 6.5 0.5 L 6 1');
  });

  it('scales the frame with the stage count, keeping the spine fixed', () => {
    const frame = ribbonFrame(8, 5);
    expect(frame.viewBox).toBe('0 0 10 1');
    expect(frame.exit.x / frame.width).toBe(0.75);
  });
});

describe('the two seam assertions', () => {
  it('accepts the shipped contract', () => {
    expect(() => assertForkSeam(5)).not.toThrow();
    expect(() => assertRibbonSeam(5, 6)).not.toThrow();
  });

  it('rejects a fork point that is not above the fold', () => {
    // With dy = 0 the fork's five branches are a flat horizontal smear: the
    // shape's first control point lands on the origin and the leave is gone.
    expect(() => assertForkSeam(5, { x: 0.5, y: 1 })).toThrow(/above the fold/);
  });

  it('rejects an asymmetric fan', () => {
    expect(() => assertForkSeam(5, { x: 0.4, y: 0.85 })).toThrow(/symmetric/);
  });

  it('rejects a ribbon that exits off the spine', () => {
    expect(() => assertRibbonSeam(5, 6, 0.5)).toThrow(/spine/);
  });
});

/** Pulls the two x values out of a `M x y L x y` string. */
function segmentEnds(d: string): [number, number] {
  const match = /^M ([\d.]+) [\d.]+ L ([\d.]+) [\d.]+$/.exec(d);
  if (!match) throw new Error(`not a two-point line: ${d}`);
  return [Number(match[1]), Number(match[2])];
}
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/components/educraft/line/frames.test.ts
```
Expected: **FAIL** — `Cannot find module './frames'`.

- [ ] **Step 3: Write `frames.ts`**

```ts
import { ACT_ANCHORS, type Anchor } from './anchors';
import { pathFor, polylinePath } from './pathBuilders';
import { stationPositions } from './station';

/**
 * THE JOIN — the coordinate reconciliation Stage 1 deliberately left undone
 * (Landing-Redesign-Plan.md §3.1; ADR 0006).
 *
 * Stage 1 shipped three correct pure modules and a correct renderer, and
 * **nothing in the shipped code ever draws a strand**: `LineStage` imports
 * `cn`, `motion`, `SCRUB` and GSAP, but not `anchors`, `station` or
 * `pathBuilders`. Measured, wiring them naively gives a rail at 0.33% of the
 * default 1200×800 viewBox and an arc of 0.26px × 1.13px at 1440×900. R8 ruled
 * that `pathFor` is frame-agnostic and that reconciling the frames is the
 * caller's job, and that is what this module is.
 *
 * **The reconciliation is viewBox selection, not arithmetic.** A path string is
 * resolution-independent, so a frame is a *choice of coordinate space*, and
 * `LineStage` is already documented as caller-scaled:
 *
 * - A **vertical act** renders `ACT_VIEW_BOX` — `viewBox="0 0 1 1"` over a box
 *   sized to the act's band. Act-local coordinates are then viewBox coordinates
 *   verbatim: `anchors.ts` needs no transform at all, which is why R8's
 *   "no per-point arithmetic maps one onto the other" is not an obstacle.
 * - **The walk** renders `viewBox="0 0 N 1"` over an element `N × 100vw` wide
 *   and `100vh` tall, so one unit is exactly one viewport. `stationPositions`'
 *   `x = i` is track-local in *track widths*; adding **half a slot** puts
 *   station `i` at the centre of slot `i`, and that offset is the whole of the
 *   caller's transform. The rail spans `0 … N`, so slice `i` is `[i, i+1]` —
 *   one unit wide, station `i` at its midpoint — which is exactly the slicing
 *   `drawAt(progress, i, n) = clamp01(n·progress − i)` assumes.
 *
 * Pure: no DOM, no React, no GSAP, safe in the Vitest node environment.
 * `station.ts` is **not** modified — the offset lives here, in the caller.
 */

/** A vertical act's frame: act-local 0..1 in both axes, verbatim (spec §3.1). */
export const ACT_VIEW_BOX = '0 0 1 1';

/**
 * How far in from each edge the outermost seed sits, as a fraction of the
 * act's width. Five seeds therefore land at 0.1 … 0.9.
 */
const SEED_MARGIN = 0.1;

/** How far in from each edge the outermost convergence strand enters. */
const CONVERGENCE_MARGIN = 0.2;

/**
 * Two decimal places, matching `pathFor`'s own rounding. Not cosmetic: the
 * seeds are laid out by interpolation, and `0.1 + 0.8 * (1/4)` is
 * `0.30000000000000004` in binary floating point. Rounding makes a strict
 * equality assertion pass for a correct implementation, and guarantees that two
 * seeds which must mirror each other cannot differ in their last bits.
 */
const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Where the strand forks — the one anchor that is not on an act edge. */
const FORK = ACT_ANCHORS.origin.exit;

export type WalkFrame = {
  /** `0 0 N 1` — one unit per viewport. */
  viewBox: string;
  /** The SVG's width in `vw`, so one unit is one viewport. */
  widthVw: number;
  /** One station per pillar, at the centre of its own slot. */
  stations: Anchor[];
  /** The whole rail, for the reduced-motion / no-JS case. */
  rail: string;
  /** One segment per station, for the scrubbed per-station draw. */
  railSegments: string[];
};

export type RibbonFrame = {
  /** `0 0 W 1`, where `W = stageCount + 2`. */
  viewBox: string;
  /** The frame's width in units, needed to express the exit as a fraction. */
  width: number;
  /** One node per journey stage, left to right. */
  nodes: Anchor[];
  /** The convergence point, in frame units. */
  exit: Anchor;
  /** The single strand through every node and out to the exit. */
  strand: string;
  /** N strands merging into the first node — the walk's N→1 seam. */
  convergence: string[];
};

/**
 * The N seed points the fork resolves into, spread across the fold and
 * **symmetric about the fork's own x** — derived from `ACT_ANCHORS.origin.exit`
 * rather than from a hardcoded centre, so moving the fork moves the fan with it.
 *
 * `y = 1` is the fold: the seeds sit on the first act's bottom edge, one act
 * band above the walk they open into.
 */
export function seedAnchors(pillarCount: number): Anchor[] {
  if (pillarCount <= 1) return [{ x: FORK.x, y: 1 }];
  const span = 1 - 2 * SEED_MARGIN;
  return Array.from({ length: pillarCount }, (_, i) => ({
    x: round2(FORK.x + (i / (pillarCount - 1) - 0.5) * span),
    y: 1,
  }));
}

/**
 * One `fork`-shaped branch per seed, all leaving the shared fork point. Five
 * separate draws from a shared origin, not a path morph: no `d` is ever
 * tweened, so nothing depends on MorphSVG, and reduced motion degrades to five
 * pre-drawn lines (spec §3.1).
 *
 * This is the one shape whose reading depends on `dy`: the first control point
 * holds x at the origin, so the branch leaves straight down before it diverges,
 * and with `dy = 0` the whole fan collapses into a horizontal smear. `FORK` is
 * above the fold, which is what makes it read as a leave; `assertForkSeam`
 * enforces that rather than assuming it.
 */
export function forkPaths(pillarCount: number): string[] {
  return seedAnchors(pillarCount).map((seed) => pathFor(FORK, seed, 'fork'));
}

/**
 * The walk's frame, its stations, and its rail — sliced so that `drawAt`'s
 * per-station windows land exactly on the rail.
 *
 * `stationPositions` gives `x = i` in track widths; the half-slot offset here
 * makes it the centre of slot `i`. Nothing else is transformed: the viewBox
 * does the scaling, and the element's width in `vw` is what makes one unit one
 * viewport.
 */
export function walkFrame(pillarCount: number): WalkFrame {
  if (pillarCount < 1) {
    // Deliberately loud. `perStationVh` returns its ceiling for an unusable
    // count because it feeds a ScrollTrigger `end`, but an empty walk is a page
    // with no content: quietly emitting a strand to nowhere would hide the bug.
    throw new Error(
      `walkFrame: a walk needs at least one pillar, received ${pillarCount}.`
    );
  }
  const stations = stationPositions(pillarCount).map((point) => ({
    x: point.x + 0.5,
    y: point.y,
  }));
  // The rail's y is read from the stations rather than repeating station.ts's
  // private baseline, so the two cannot drift.
  const y = stations[0].y;
  return {
    viewBox: `0 0 ${pillarCount} 1`,
    widthVw: pillarCount * 100,
    stations,
    rail: pathFor({ x: 0, y }, { x: pillarCount, y }, 'line'),
    railSegments: Array.from({ length: pillarCount }, (_, i) =>
      pathFor({ x: i, y }, { x: i + 1, y }, 'line')
    ),
  };
}

/**
 * The journey ribbon: the six stages on one continuing strand, entered through
 * a convergence slot that turns the walk's N strands back into one.
 *
 * The frame is `stageCount + 2` units wide — one slot for the convergence, one
 * trailing slot the exit descends through — which makes the exit land on
 * `0.75 × width`, the page spine, for the six stages that exist. The exit is
 * read from `ACT_ANCHORS.pillars.exit` so the ribbon and the contract cannot
 * disagree, and is published as a fraction of this frame's own width, because a
 * seam compares fractions and not units.
 *
 * **A deliberate simplification, recorded rather than hidden:** the N strands
 * converge from the act boundary, not from the walk's own station nodes. Those
 * nodes are never on screen together — the walk shows one viewport at a time —
 * so a literal re-convergence would need a scale-out tween on the whole track,
 * which is a mechanic this stage does not invent. From the reader's seat the
 * effect is the same five-into-one.
 */
export function ribbonFrame(stageCount: number, pillarCount: number): RibbonFrame {
  const width = stageCount + 2;
  const nodes = Array.from({ length: stageCount }, (_, j) => ({ x: j + 1.5, y: 0.5 }));
  const exit = { x: round2(ACT_ANCHORS.pillars.exit.x * width), y: 1 };
  const spread = 1 - 2 * CONVERGENCE_MARGIN;
  const enters = pillarCount <= 1
    ? [0.5]
    : Array.from({ length: pillarCount }, (_, i) =>
        round2(CONVERGENCE_MARGIN + (i / (pillarCount - 1)) * spread)
      );
  return {
    viewBox: `0 0 ${width} 1`,
    width,
    nodes,
    exit,
    strand: polylinePath([...nodes, exit]),
    convergence: enters.map((y) => pathFor({ x: 0, y }, nodes[0], 'arc')),
  };
}

/**
 * The 1→N seam: one strand becomes N. Checked structurally, because a
 * one-to-many handoff has no equality to assert — there is no "the same point"
 * between one anchor and five.
 *
 * What must hold: the fork is above the fold (so the branches leave downward),
 * there is exactly one seed per pillar, and the fan is symmetric about the fork.
 */
export function assertForkSeam(pillarCount: number, fork: Anchor = FORK): void {
  if (fork.y >= 1) {
    throw new Error(
      `Fork seam broken: the fork point must sit above the fold so its branches ` +
        `leave downward, but it is at y = ${fork.y}. With dy = 0 the 'fork' shape's ` +
        'first control point lands on the origin and the fan is a horizontal smear.'
    );
  }
  const seeds = seedAnchors(pillarCount);
  if (seeds.length !== pillarCount) {
    throw new Error(`Fork seam broken: ${pillarCount} pillars but ${seeds.length} seeds.`);
  }
  seeds.forEach((seed, i) => {
    const mirror = seeds[seeds.length - 1 - i];
    if (Math.abs(seed.x + mirror.x - 2 * fork.x) > 1e-6) {
      throw new Error(
        `Fork seam broken: the fan must be symmetric about the fork at x = ${fork.x}, ` +
          `but seeds ${i} and ${seeds.length - 1 - i} are at ${seed.x} and ${mirror.x}.`
      );
    }
  });
}

/**
 * The N→1 seam: the ribbon's convergence, and its exit onto the page spine.
 *
 * The exit is checked *as a fraction of the ribbon's own frame* against the
 * spine, which is the comparison a seam actually makes; comparing units would
 * compare a 8-unit frame against a 0..1 anchor and be wrong in a way that looks
 * like a pass once someone "fixes" it.
 */
export function assertRibbonSeam(
  pillarCount: number,
  stageCount: number,
  spineX: number = ACT_ANCHORS.pillars.exit.x
): void {
  const frame = ribbonFrame(stageCount, pillarCount);
  if (Math.abs(frame.exit.x / frame.width - spineX) > 1e-6) {
    throw new Error(
      `Ribbon seam broken: the strand must exit on the page spine at x = ${spineX} ` +
        `as a fraction of its own frame, but it exits at ${frame.exit.x} of ` +
        `${frame.width} (${frame.exit.x / frame.width}).`
    );
  }
  if (frame.convergence.length !== pillarCount) {
    throw new Error(
      `Ribbon seam broken: ${pillarCount} pillars but ${frame.convergence.length} strands converge.`
    );
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/components/educraft/line/
```
Expected: **PASS**. If `seedAnchors`' symmetry case fails at `toBeCloseTo(…, 10)`, the rounding is missing — do not widen the tolerance.

- [ ] **Step 5: Run the full gate**

```bash
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
Expected: all four pass. Nothing imports `frames.ts` yet, so the page is unchanged.

- [ ] **Step 6: Retire the two documents this makes false**

`stages/README.md` carries a **⚠ join warning** as the first thing a Stage 2 planner reads, and it asserts three things this task has just answered. Leaving it standing is the failure mode this repo has shipped before — a document describing code that no longer exists. Replace the warning with the outcome:

```markdown
> ### The join is `line/frames.ts` — resolved in Stage 2
>
> The three modules now have a caller. **The reconciliation is viewBox
> selection, not arithmetic:** a vertical act renders `0 0 1 1`, so act-local
> anchors *are* viewBox coordinates verbatim, and the walk renders `0 0 N 1`
> over an element `N × 100vw` wide, so `stationPositions`' `x = i` becomes the
> centre of slot `i` with a half-slot offset — which is the whole of the
> transform R8 placed with the caller. The rail's slices then match `drawAt`'s
> windows by construction: slice `i` is `[i, i+1]`, station `i` at its midpoint.
>
> `assertContinuity` was **re-specified**, not wired as shipped: it demanded
> `exit == enter` as raw values, which no correct vertical chain can satisfy,
> because each anchor is expressed in its own act's box. It now checks the
> shape of a seam.
```

Then **append** the outcome to `docs/decisions/0006-coordinate-frames-act-local-and-track-local.md` — the decision stands unchanged; its stated consequence ("how they compose on screen is a layout decision owned by the Stage 2 caller") now has an answer, and a reader who stops at that file would not know it. A dated paragraph, not a rewrite.

- [ ] **Step 7: Commit**

```bash
git add src/components/educraft/line/frames.ts src/components/educraft/line/frames.test.ts docs/projects/landing-redesign/stages/README.md docs/decisions/0006-coordinate-frames-act-local-and-track-local.md
git commit -m "feat(line): the join — viewBox selection is the transform

Stage 1 shipped three correct modules and a renderer, and nothing that
draws a strand. R8 ruled pathFor frame-agnostic and the transform the
caller's; this is the caller. A vertical act renders viewBox 0 0 1 1, so
act-local anchors are viewBox coordinates verbatim. The walk renders
0 0 N 1 over an element N x 100vw wide, so one unit is one viewport and
stationPositions' x = i becomes slot i's centre with a half-slot offset —
the entire transform. Rail slice i is then [i, i+1] with station i at its
midpoint, which is exactly what drawAt's windows assume."
```

---

## Task 3: What the acts need from §8, derived once

§8's table is a contract — desktop pins and scrubs, tablet deliberately does not, mobile uses native `overflow-x` snap — and the acts cannot each re-derive it. But **most of §8 is carried by CSS**: the three branches map exactly onto Tailwind's `sm:` (640) and `lg:` (1024) variants, which is the ladder `BREAKPOINTS` is already aligned to. (Stage 1 renamed that key `.md` → `.sm` for precisely this reason: `tokens.ts`'s `md` is 768, so a `BREAKPOINTS.md = 640` would have contradicted its own "Tailwind-aligned" comment.)

So this stage deliberately adds **no branch→behaviour module**. A pure table mapping a branch to `{pinned, horizontal, snap}` would have no consumer: the pin is decided by `gsap.matchMedia()`, the layout by media-variant classes, and the tablet branch by *nothing* — its behaviour is the absence of the desktop setup. Tests nothing reads are the same defect class as constants nothing asserts; `rulings.md` already records that class twice.

Two facts the acts genuinely need from JS:

1. **The desktop media query**, derived from `BREAKPOINTS` so the breakpoint exists in one place. Two acts hand-typing `'(min-width: 1024px)'` is two chances to drift from the constant `branchFor` uses. **A tablet query is deliberately *not* exported:** nothing branches on tablet in JS, because the tablet branch *is* the absence of the desktop setup — exporting one would create an assertion nothing reads, which is the defect the pre-flight scan removed from this very task. `branchFor` does get a real consumer here: Act 1's rail buttons behave differently per branch (desktop scrolls the page, tablet scrolls a stacked station into view, mobile scrolls the snap container).
2. **Where a rail button should scroll to.** The rail is N real `<button>`s (§9). On desktop the track is `transform`-translated rather than scrolled, so `scrollIntoView` cannot reach a station inside it — the button has to move the *page*. Station `i`'s dwell occupies `[i/n, (i+1)/n]` of the pin, which is the slicing `drawAt` already uses, so its centre is `(i + 0.5)/n`.

**Files:**
- Modify: `src/design/scroll.ts`, `src/design/scroll.test.ts`

**Interfaces:**
- Consumes: `BREAKPOINTS` (already there). Nothing else.
- Produces: `DESKTOP_QUERY: string`, `walkPinRangePx(viewportHeightPx, pillarCount): number`, `stationScrollTarget(index, pillarCount, pinStartY, pinRangeY): number`. Consumed by Tasks 5, 6 and 12; `drawAt` (from `line/station.ts`) is the cross-check for `stationScrollTarget`, and `perStationVh` is the source `walkPinRangePx` is built from.

- [ ] **Step 1: Write the failing tests**

Append to `src/design/scroll.test.ts`:

```ts
import { drawAt } from '@/components/educraft/line/station';
```

```ts
describe('the desktop media query', () => {
  it('pins the exact string the Tailwind variant is aligned to', () => {
    expect(DESKTOP_QUERY).toBe('(min-width: 1024px)');
  });

  it('agrees with branchFor at its own boundary', () => {
    // If the query and `branchFor` drift, the CSS layout and the GSAP branch
    // disagree at a breakpoint: the visible failure is a pinned track with no
    // animation, or a stacked spine that translates sideways. The tablet and
    // mobile boundary is `branchFor`'s own, pinned in the Stage 1 tests.
    const desktopMin = Number(/min-width: (\d+)px/.exec(DESKTOP_QUERY)![1]);
    expect(desktopMin).toBe(BREAKPOINTS.lg);
    expect(branchFor(desktopMin), 'the query includes its own boundary').toBe('desktop');
    expect(branchFor(desktopMin - 1)).toBe('tablet');
  });
});

describe('stationScrollTarget', () => {
  it('targets the progress at which each station is centred', () => {
    // Five stations over a 400vh pin starting at 0: the track travels one
    // viewport per dwell, so station 0 centres at the pin's start and station 4
    // at 80% of it.
    expect(stationScrollTarget(0, 5, 0, 400)).toBe(0);
    expect(stationScrollTarget(2, 5, 0, 400)).toBe(160);
    expect(stationScrollTarget(4, 5, 0, 400)).toBe(320);
  });

  it('offsets from the pin start rather than assuming the top of the page', () => {
    expect(stationScrollTarget(0, 5, 1200, 400)).toBe(1200);
    expect(stationScrollTarget(3, 5, 1200, 400)).toBe(1440);
  });

  it('is strictly increasing, so a button never scrolls backwards', () => {
    for (let i = 1; i < 7; i += 1) {
      expect(stationScrollTarget(i, 7, 0, 420)).toBeGreaterThan(
        stationScrollTarget(i - 1, 7, 0, 420)
      );
    }
  });

  it('clamps an out-of-range index to the ends', () => {
    expect(stationScrollTarget(-1, 5, 0, 400)).toBe(0);
    expect(stationScrollTarget(9, 5, 0, 400)).toBe(320);
  });

  it('returns the pin start for an unusable count rather than NaN', () => {
    // Same policy as perStationVh and drawAt: an unusable count must not produce
    // a NaN scroll position, which the browser silently ignores — the button
    // would do nothing, with no error.
    expect(stationScrollTarget(0, 0, 300, 400)).toBe(300);
  });

  it('targets the exact progress at which drawAt starts that station', () => {
    // The cross-check, and the reason the rail is trustworthy: a button takes
    // the page to the progress where the walk arrives at its station, which is
    // the same progress at which that station's segment begins to draw. If
    // either module changes its axis, a button would land somewhere the draw
    // does not agree with.
    for (const [i, n] of [[0, 5], [2, 5], [4, 5], [3, 7]] as const) {
      const progress = stationScrollTarget(i, n, 0, 1);
      expect(drawAt(progress, i, n), `station ${i} of ${n} has just begun`).toBe(0);
      if (i > 0) {
        // Station 0 has no predecessor; its own segment is the first thing drawn.
        expect(drawAt(progress, i - 1, n), `station ${i - 1} is complete`).toBe(1);
      }
    }
  });
});

describe('walkPinRangePx', () => {
  it('is one dwell per station, in pixels', () => {
    // An 800px viewport at five pillars: 80vh per station, five stations.
    expect(walkPinRangePx(800, 5)).toBe(3200);
  });

  it('keeps the act near four screens at six and seven pillars', () => {
    expect(walkPinRangePx(800, 6)).toBe(3200); // 400/6 vh × 6 = 400vh
    expect(walkPinRangePx(800, 7)).toBe(3360); // clamped at 60vh × 7 = 420vh
  });

  it('agrees with stationScrollTarget about where the last station is', () => {
    // The last station is centred at 80% of the walk at five pillars, and the
    // pin runs to 100%. Computed in one place, the two cannot drift.
    const range = walkPinRangePx(800, 5);
    expect(stationScrollTarget(4, 5, 0, range)).toBe(0.8 * range);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/design/scroll.test.ts
```
Expected: **FAIL** — `DESKTOP_QUERY`, `TABLET_QUERY` and `stationScrollTarget` are not exported.

- [ ] **Step 3: Add both to `scroll.ts`**

```ts
/**
 * The desktop branch, derived from `BREAKPOINTS` so the breakpoint exists once.
 * `branchFor` is the runtime decision; this is the same decision expressed as a
 * media query, for `gsap.matchMedia()`.
 *
 * **Only the desktop query exists, deliberately.** The pin and the scrubbed
 * track are the desktop branch; tablet and mobile are what happens when this
 * query does not match, so a tablet query would have no reader — and an export
 * with no consumer is the same defect as a test that pins nothing. The
 * boundaries themselves stay in `branchFor`, which the Stage 1 tests already
 * pin on all three sides.
 */
export const DESKTOP_QUERY = `(min-width: ${BREAKPOINTS.lg}px)`;

/**
 * The walk's pinned run, in pixels: one dwell per station, from
 * `perStationVh`, transcribed against the live viewport height.
 *
 * This is both the pin's `end` distance and the denominator
 * `stationScrollTarget` divides, which is why it is one function. Computed in
 * two places, a change to the dwell formula could move the pin without moving
 * the rail's targets, and every button would land a fixed fraction of the walk
 * away from the station it names.
 */
export function walkPinRangePx(viewportHeightPx: number, pillarCount: number): number {
  return (viewportHeightPx * perStationVh(pillarCount) * pillarCount) / 100;
}

/**
 * Where a rail button should put the page for station `index`.
 *
 * The progress rail is N real `<button>`s (spec §9), and on desktop the track is
 * `transform`-translated rather than scrolled — `scrollIntoView` cannot reach a
 * station inside it, so the button must move the page instead.
 *
 * **Station `i` is centred at `i/n` of the pin — not at the midpoint of its own
 * dwell.** The track travels N viewports across the pin, one per dwell, and
 * station `i` sits at the centre of slot `i` in the track's own frame, so it
 * reaches the middle of the viewport exactly when the walk has covered `i`
 * viewports: `i/n` of the way. That is also the instant its own segment begins
 * to draw, since `drawAt(progress, i, n)` is `0` at `i/n` and `1` by the end of
 * the dwell — so the strand's drawn tip arrives at each station as that station
 * centres.
 *
 * The planning pass first recorded `(i + 0.5)/n` here — the dwell's midpoint —
 * which disagreed with the tween by up to `0.5/n` of the pin, 40vh at five
 * pillars. Task 6 carries the ruling that removed the disagreement.
 *
 * `pinStartY` is the page offset of the pin's start and `pinRangeY` its length,
 * both in pixels. An unusable count returns `pinStartY`, matching `perStationVh`
 * and `drawAt`: a `NaN` here would be silently ignored by the browser and the
 * button would do nothing with no error.
 */
export function stationScrollTarget(
  index: number,
  pillarCount: number,
  pinStartY: number,
  pinRangeY: number
): number {
  if (pillarCount <= 0) return pinStartY;
  const station = Math.min(Math.max(index, 0), pillarCount - 1);
  return pinStartY + (station / pillarCount) * pinRangeY;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/design/scroll.test.ts
```
Expected: **PASS**, including every Stage 1 assertion in that file, unmodified. `scroll.test.ts` pins `BREAKPOINTS` with a whole-object `toEqual` deliberately — adding a *key* to `BREAKPOINTS` should fail that test; adding a new export must not.

- [ ] **Step 5: Run the full gate**

```bash
npx tsc --noEmit && npm run lint && npm run test && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/design/scroll.ts src/design/scroll.test.ts
git commit -m "feat(scroll): derive the branch queries, and map a station to a scroll position

§8's three branches are carried by CSS - they are Tailwind's sm:/lg:
variants, the ladder BREAKPOINTS is aligned to - so there is no branch
table in code and nothing reads one. What the acts do need is the query
string itself, derived so five acts cannot each type their own, and the
rail's scroll mapping: on desktop the track is transform-translated, so
scrollIntoView cannot reach a station and the button must move the page.
Station i's dwell centre is (i + 0.5)/n - the same slicing drawAt uses,
which the test cross-checks."
```

---

## Copy — the approved strings

Every string the acts render, with its source. **Almost nothing is new**: the retired sections' copy is good, and §4 says so — the staging was the problem. `[VERBATIM]` means the string is copied exactly from the named source, typography and punctuation included (all content apostrophes in these files are straight ASCII `'`; the em dash is U+2014 and the middle dot U+00B7). `[NEW]` items are marked for owner approval before execution, per D3.

| Act | Element | String | Source |
|---|---|---|---|
| 0 | eyebrow | `Global Digital Education Platform` | `Hero.tsx:68` `[VERBATIM]` |
| 0 | H1 | `Five paths.` / `One learning ecosystem.` (two lines; the second splits at `ecosystem`) | `Hero.tsx:76,78` `[VERBATIM]` |
| 0 | lede | `From language and inclusion to wellbeing, AI literacy, and competitive exam preparation — Educraft connects the pieces that help students move forward.` | `Hero.tsx:86` `[VERBATIM]` |
| 0 | primary CTA | `Talk to us` → opens the enquiry modal | §4 `[NEW — spec-fixed]` |
| 0 | secondary CTA | `Explore programmes` → `/programmes` | §4 `[NEW — spec-fixed]` |
| 0 | trust line | `Five verticals · One trust umbrella · Built for schools, families, and students` | `Hero.tsx:106` `[VERBATIM]` |
| 0 | sr-only scroll cue | `Scroll` | `Hero.tsx:120` `[VERBATIM]` |
| 1 | rail button label (×N) | `Go to {pillar.name}` | `[NEW — approved 2026-09-13]` — replaces decorative dots with real buttons (§9) |
| 1 | ribbon eyebrow | `The student journey` | `StudentJourney.tsx:48` `[VERBATIM]` |
| 1 | ribbon heading | `Six stages, one direction: forward.` | `StudentJourney.tsx:135` `[VERBATIM]` |
| 1 | ribbon stage label | `Stage {s.stage}` | `StudentJourney.tsx:146` `[VERBATIM]` |
| 1 | station link | `Read the full programme` | `ProgrammeExplorer.tsx:73` `[VERBATIM]` |
| 1 | strand `<title>` | `Connective strand` | `LineStage` default — no `label` prop passed |
| 2 | eyebrow | `Why Educraft` | `WhyDifferent.tsx:45` `[VERBATIM]` |
| 2 | heading | `A different kind of education company.` | `WhyDifferent.tsx:47` `[VERBATIM]` |
| 2 | lede | `Most education offerings are collections of courses. Educraft is a connected system — five specialist verticals sharing one philosophy, one standard of evidence, and one view of the learner.` | `WhyDifferent.tsx:50` `[VERBATIM]` |
| 2 | five differentiators (title + body) | all five, unedited | `WhyDifferent.tsx:8–30` `[VERBATIM]` |
| 2 | method eyebrow | `How it works` | `Methodology.tsx:37` `[VERBATIM]` |
| 2 | method heading | `Five steps, one method` | `Methodology.tsx:38` `[VERBATIM]` |
| 2 | method lede | `Every programme — whatever the vertical — runs on the same five-step method. It is why the ecosystem stays coherent as it grows.` | `Methodology.tsx:39` `[VERBATIM]` |
| 2 | five method steps | all five, unedited | `data/pillars.ts:4–30` `[VERBATIM]` |
| 2 | method link | `Read the full methodology` | `Methodology.tsx:105` `[VERBATIM]` |
| 3 | eyebrow | `Outcomes & evidence` | `Impact.tsx:22` `[VERBATIM]` |
| 3 | heading | `What "better learning" looks like here` | `Impact.tsx:23` `[VERBATIM]` — the inner quotes are straight `"` |
| 3 | lede | `We do not claim transformation with adjectives. We structure impact — and we can show, at every step, how it is built and how it is measured.` | `Impact.tsx:24` `[VERBATIM]` |
| 3 | axis label | `How we build evidence` | `Impact.tsx:63` `[VERBATIM]` |
| 3 | four chain stations | `Confidence` · `Engagement` · `Skill` · `Readiness` + bodies, unedited | `Impact.tsx:82–103` `[VERBATIM]` |
| 3 | stat row | `5 Vertical programmes` / `1 Connected ecosystem` / **`3 Audiences served` — `Schools · Parents · Students`** / `6 Journey stages` | `Impact.tsx:53–56`, **third stat corrected** per §1.3 and §4 |
| 3 | pull-quote | `testimonials[0].quote`, wrapped in `&ldquo;` … `&rdquo;` | `data/testimonials.ts:12` `[VERBATIM]` |
| 3 | marginalia ×2 | `testimonials[1]`, `testimonials[2]` + their `role · context` attribution lines | `data/testimonials.ts:19–32` `[VERBATIM]` |
| 3 | SEED warning | the in-file warning stays, visibly, on the pull-quote block | `data/testimonials.ts:3–8` — §4: leaning harder on seed quotes makes replacing them **more** urgent |
| 4 | eyebrow | `Who are you?` | `AudienceEntryPoints.tsx:27` `[VERBATIM]` |
| 4 | heading | `Every journey starts from somewhere different` | `AudienceEntryPoints.tsx:28` `[VERBATIM]` |
| 4 | lede | `Three doors into the same ecosystem — pick the one that describes you, and the conversation starts on your terms.` | `AudienceEntryPoints.tsx:29` `[VERBATIM]` |
| 4 | three door headings | `audienceEntries[n].headline` — **rendered for the first time**; the shipped component imported the field and never used it | `data/navigation.ts` `[VERBATIM]` |
| 4 | three door CTAs | `audienceEntries[n].ctaLabel` → `ctaHref` — also rendered for the first time | `data/navigation.ts` `[VERBATIM]` |
| 4 | door benefits | **2 of each door's 4**, cut per the table below | `data/navigation.ts` `[CUT]` |
| 4 | closer | `Begin here` / `The next step is a conversation.` / lede / `Start a Conversation` / `Browse Programmes` / `No commitment — just a conversation about where a learner could go.` | `FinalCTA.tsx:29–53` `[VERBATIM]` |

**The benefit cuts (§4: "Benefits trimmed 4 → 2").** The two kept are the two that name something concrete; the two cut are the ones that could appear on any education site. This is a copy decision, so it is written out rather than left to the implementer:

| Door | Kept | Cut |
|---|---|---|
| `For Schools` | `One partner across five specialist verticals` · `Consistent reporting and progress visibility` | `Safeguarding-first policies aligned to school standards` · `Flexible delivery: in-school, after-school, or blended` |
| `For Parents` | `Regular, plain-language progress updates` · `Visible learning plans and goals` | `Guidance resources for supporting learning at home` · `Confidential wellbeing support when it is needed` |
| `For Students` | `Portfolio projects that show what you can do` · `Mentors who actually know your name` | `Programmes built around real skills, not just textbooks` · `Small groups where your voice matters` |

**Copy removed entirely** (§4's de-duplication, and the last occurrence of the `Five X. One Y.` template on the landing page):

- `Portfolios, dashboards, and benchmarked checkpoints…` stays **once**, inside the differentiator `Progress you can actually see`; the `proofPillars` entry `Evidence` that repeats it is cut with the rest of `proofPillars` (People/Process/Outcomes have no new home either — §4 cuts all five, with Evidence and Partnerships folded into Act 3, which the axis and the stat row already carry).
- `Five pillars. One connected system.` (Ecosystem), `One journey, five paths` and `The five programmes` (ProgrammeExplorer), `Six stages, one direction: forward` keeps its ribbon home, and `Enquire` — duplicated across three sections — is dropped; each station keeps exactly one link.
- `Five paths. One learning ecosystem.` stays: it is the H1, and §4 keeps the hero copy verbatim.

> **Counts the spec gets wrong, verified against the tree:** the `Five X. One Y.` template appears in **8** live marketing files, not the 5 §1.2 claims (`Hero`, `Ecosystem`, `Methodology`, `/programmes`, `/about`, `/careers`, `AudiencePage`, `Footer`). `Portfolios, dashboards` survives in **3** live source files, not 4. Neither changes this stage's work — the landing page's instances all retire — but the numbers are recorded so Task 11's commit body does not repeat them.

---

## Task 4: `LineStage`'s render-only mode

The Stage 1 rulings name this gap twice: *"`LineStage` cannot serve Act 1 as shipped. It has no render-only mode, and it documents that `pin` and `scrub: true` 'do not compose' — which is exactly Act 1's required mechanic."* Act 1 owns a track tween and a pin whose ranges are the same trigger, and it draws each rail segment against `drawAt` rather than all of them against one range — so it needs the renderer without the renderer's animation. This task adds that, and does **not** make `pin` and `scrub` compose: Act 1 owns its own ScrollTriggers, which is the composition.

**Files:**
- Modify: `src/components/educraft/line/LineStage.tsx`, `src/components/educraft/line/LineStage.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `LineStageProps['draw']?: boolean` (default `true`) — consumed by Task 6 (the walk) and Task 7 (the ribbon).
- **The existing tests must stay green, unmodified.** If one fails, the change is wrong: the render-only mode adds a prop and a branch, and changes no output.

- [ ] **Step 1: Write the failing test**

Append to `LineStage.test.ts` — the existing `renderToStaticMarkup` helpers are already there, so reuse them:

```ts
describe('LineStage render-only mode', () => {
  it('produces byte-identical markup with draw disabled', () => {
    // Render-only must change *behaviour*, never markup. Act 1's own GSAP reads
    // `[data-line-path]` and the inline `strokeDashoffset: 1`; if either
    // disappeared, the act's tween would start from the wrong place.
    const drawn = render({ paths: ['M 0 0 L 1 1'] });
    const undrawn = render({ paths: ['M 0 0 L 1 1'], draw: false });
    expect(undrawn).toBe(drawn);
  });

  it('still emits the draw hook and the initial dash offset', () => {
    const markup = render({ paths: ['M 0 0 L 1 1'], draw: false });
    expect(markup).toContain('data-line-path');
    expect(markup).toContain('stroke-dashoffset:1');
  });

  it('defaults to drawing, so Stage 1 call sites are unaffected', () => {
    expect(render({ paths: ['M 0 0 L 1 1'] })).toBe(
      render({ paths: ['M 0 0 L 1 1'], draw: true })
    );
  });
});
```

**What these tests do not cover, stated rather than implied:** `renderToStaticMarkup` runs no effects, so nothing here reaches `useGSAP`, the tween branch, or the `matchMedia` branches — the same limitation Stage 1 recorded for D3's fix. The prop's *behaviour* is verified by the owner's QA and reported numerically by `?calibrate=1` (Task 12). Do not let the commit message claim more.

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/components/educraft/line/LineStage.test.ts
```
Expected: **FAIL** — `draw: false` is not a known prop, so depending on the helper's typing it is either a `tsc` error inside the test or the markup comparison passes trivially. Both are failures to fix in Step 3; run `npx tsc --noEmit` too and expect it to report the excess property.

- [ ] **Step 3: Add the prop**

Add to `LineStageProps`, after `scrub`:

```tsx
  /**
   * Draw the strand when it scrolls into view. Set `false` for **render-only**
   * mode: the markup is byte-identical (every path keeps its `data-line-path`
   * hook and its inline `strokeDashoffset: 1`) and no draw tween is created, so
   * the caller owns the animation.
   *
   * Act 1 needs this and cannot be served by `scrub`: its rail draws **one
   * segment per station**, against `drawAt(progress, i, n)`'s per-slice
   * fractions, rather than every path against one shared range. Its pin and its
   * track tween are a single ScrollTrigger the act owns, which is also the
   * answer to this component's `pin` ∧ `scrub` non-composition — the two are
   * never asked to compose here.
   *
   * **Reduced motion is still this component's job.** The
   * `REDUCED_MOTION_QUERY` branch sets every strand to `strokeDashoffset: 0`
   * whether or not `draw` is set, because that is not an animation — it is the
   * final state, and the contract is that the reduced-motion page renders every
   * strand fully drawn in identical DOM order (spec §9). A render-only caller
   * must therefore keep its own animation inside a `not all and …` branch, so
   * that under reduced motion this component is the only writer.
   */
  draw?: boolean;
```

Destructure it with the other defaults (`draw = true,`) and add it to the `useGSAP` dependency array.

- [ ] **Step 4: Guard the tween branch**

In the `not all and ${REDUCED_MOTION_QUERY}` branch, replace the `tweens` construction so no tween is created when `draw` is false:

```tsx
        // Render-only: the caller drives these paths. Nothing is created here,
        // so nothing needs killing — but the pin below still applies, because
        // pinning is a scroll mechanic and not a draw.
        const tweens = draw
          ? gsap.utils.toArray<SVGPathElement>('[data-line-path]', scopeEl).map((el, index) =>
              gsap.fromTo(
                el,
                { strokeDashoffset: 1 },
                {
                  strokeDashoffset: 0,
                  ease: EASE.out,
                  duration: scrub ? DRAW_SCRUB_S : DRAW_IN_VIEW_S,
                  delay: scrub ? 0 : index * DRAW_STAGGER_S,
                  scrollTrigger: scrub
                    ? { trigger: root.current, start: 'top 80%', end: 'bottom 60%', scrub: SCRUB }
                    : { trigger: root.current, start: IN_VIEW_START, once: true },
                }
              )
            )
          : [];
```

Leave the `REDUCED_MOTION_QUERY` branch exactly as it is — it must keep setting `strokeDashoffset: 0`. Update the component's top docstring with one sentence: `draw` controls only the animated branch; the reduced-motion final state is unconditional.

- [ ] **Step 5: Run the tests and the type check**

```bash
npx vitest run src/components/educraft/line/ && npx tsc --noEmit
```
Expected: **PASS**, including every Stage 1 test in that file, unmodified.

- [ ] **Step 6: Run the full gate**

```bash
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
Expected: all four pass; `LineStage` is still unreferenced, so the build output is unchanged.

- [ ] **Step 7: Commit**

```bash
git add src/components/educraft/line/LineStage.tsx src/components/educraft/line/LineStage.test.ts
git commit -m "feat(line): a render-only mode for LineStage

Act 1 draws one rail segment per station against drawAt's per-slice
fractions, and owns a single ScrollTrigger for its pin and its track
tween — neither of which this component's shared-range scrub can express,
and both of which the Stage 1 rulings named as the gap. draw={false}
creates no tween and changes no markup; the reduced-motion branch still
renders every strand fully drawn, because that is the final state rather
than an animation."
```

---

## Task 5: Act 0 — Origin, and the strand's first appearance

The hero stops being "a section that holds a visual" and becomes the first frame of a continuous sequence (§2). The copy is untouched — §4 says it is good and the staging was the problem — and the mechanical change is that the strand now enters top-right, descends, and forks into five at the fold, pinned for 70vh.

This task also lands the two pieces of scaffolding the other acts reuse: the shared server `ActSection`, and the Motion `MaskLine` the H1's lines reveal through.

**Files:**
- Create: `src/components/educraft/acts/ActSection.tsx`
- Create: `src/components/educraft/motion/MaskLine.tsx`, `src/components/educraft/motion/MaskLine.test.ts`
- Create: `src/components/educraft/acts/Origin.tsx`, `src/components/educraft/acts/Origin.test.ts`

**Interfaces:**
- Consumes: `ACT_ANCHORS` (Task 1); `ACT_VIEW_BOX`, `forkPaths`, `seedAnchors` (Task 2); `DESKTOP_QUERY` (Task 3); `LineStage`'s `draw={false}` (Task 4); `bezierControlPoints` and `EASE`/`REDUCED_MOTION_QUERY`/`useGSAP`/`gsap`/`registerGsap` (`lib/gsap.ts`); `motionTokens` (`design/motion.ts`); `CEILINGS.headlineStaggerMs` (`design/scroll.ts`); `EnquireButton`, `ButtonNextLink`, `Eyebrow` (existing UI). **`assertForkSeam` is *not* consumed here** — Task 11 is the single call site.
- Produces: `Origin` (default export, client), `OriginProps`; `ActSection` (default export, **server**), `ActSectionProps`; `MaskLine` (default export, client), `MaskLineProps`. Consumed by Tasks 6–11.

- [ ] **Step 1: Write the failing tests**

Create `src/components/educraft/motion/MaskLine.test.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MaskLine from './MaskLine';

/**
 * The mask reveal's markup contract. Effects do not run under
 * `renderToStaticMarkup` (ADR 0007), so what is pinned here is the structure the
 * animation needs: an `overflow-hidden` box with the line inside it. If the
 * wrapper ever loses `overflow-hidden`, the line translates in the open and the
 * reveal becomes a slide — with every test still green before this one exists.
 */
describe('MaskLine', () => {
  it('clips the line it reveals', () => {
    const markup = renderToStaticMarkup(createElement(MaskLine, null, 'Five paths.'));
    expect(markup).toContain('overflow-hidden');
    expect(markup).toContain('Five paths.');
  });

  it('renders the text as real DOM text, not an image or a clip path', () => {
    const markup = renderToStaticMarkup(createElement(MaskLine, null, 'One learning ecosystem.'));
    expect(markup).toContain('>One learning ecosystem.<');
  });
});
```

Create `src/components/educraft/acts/Origin.test.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS } from '@/components/educraft/line/anchors';
import { forkPaths } from '@/components/educraft/line/frames';
import { pathFor } from '@/components/educraft/line/pathBuilders';
import Origin from './Origin';

const PROPS = {
  eyebrow: 'Global Digital Education Platform',
  h1Lines: ['Five paths.', 'One learning ecosystem.'],
  lede: 'From language and inclusion to wellbeing, AI literacy, and competitive exam preparation — Educraft connects the pieces that help students move forward.',
  trustLine: 'Five verticals · One trust umbrella · Built for schools, families, and students',
  primaryLabel: 'Talk to us',
  secondaryLabel: 'Explore programmes',
  secondaryHref: '/programmes',
  pillarCount: 5,
} as const;

const render = (overrides: Partial<typeof PROPS> = {}) =>
  renderToStaticMarkup(createElement(Origin, { ...PROPS, ...overrides }));

describe('Act 0 — Origin', () => {
  it('renders the hero copy verbatim', () => {
    const markup = render();
    for (const line of PROPS.h1Lines) expect(markup).toContain(line);
    expect(markup).toContain(PROPS.eyebrow);
    expect(markup).toContain(PROPS.lede);
    expect(markup).toContain(PROPS.trustLine);
  });

  it('relabels the CTAs so the same words stop doing two jobs', () => {
    // §4 Act 0: `Explore Programmes` opened the modal while `View all
    // programmes` navigated — the same words, two jobs. Primary opens the
    // modal; secondary navigates.
    const markup = render();
    expect(markup).toContain('Talk to us');
    expect(markup).toContain('Explore programmes');
    expect(markup).toContain('href="/programmes"');
    expect(markup).not.toContain('Explore Programmes');
    expect(markup).not.toContain('View all programmes');
  });

  it('draws the arc and one fork branch per pillar, in one stage', () => {
    const markup = render();
    const expected = [pathFor(ACT_ANCHORS.origin.enter, ACT_ANCHORS.origin.exit, 'arc'), ...forkPaths(5)];
    for (const d of expected) expect(markup).toContain(d);
    expect((markup.match(/data-line-path/g) ?? []).length).toBe(1 + 5);
  });

  it('uses the unit frame, so the act-local anchors need no arithmetic', () => {
    expect(render()).toContain('viewBox="0 0 1 1"');
  });

  it('places a seed node exactly where each branch lands', () => {
    // The join's promise, asserted in the markup: node x and branch end x are
    // the same number, because both come from seedAnchors.
    const markup = render();
    for (const seed of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      expect(markup).toContain(`left:${seed * 100}%`);
    }
  });

  it('keeps the strand decorative', () => {
    const markup = render();
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain('role="img"');
  });

  it('scales to a sixth pillar with no rewrite', () => {
    const markup = render({ pillarCount: 6 });
    expect((markup.match(/data-line-path/g) ?? []).length).toBe(1 + 6);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

```bash
npx vitest run src/components/educraft/acts/Origin.test.ts src/components/educraft/motion/MaskLine.test.ts
```
Expected: **FAIL** — `Cannot find module './Origin'` (and `./MaskLine`).

- [ ] **Step 3: Write `ActSection.tsx` (server)**

```tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Eyebrow from '@/components/educraft/ui/Eyebrow';

export type ActSectionProps = {
  /** The act's anchor id, from `ACT_ORDER`. */
  id: string;
  eyebrow?: string;
  heading?: ReactNode;
  lede?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * The common frame for an act: the section element, the header, and the copy.
 *
 * **Server component, deliberately** (spec §3.3). The acts animate, so they are
 * client components — but their *copy* is static, and passing it in as props
 * from here keeps it server-rendered and out of the client bundle. This file
 * ships no JS.
 *
 * Not used by Act 0: the hero's H1 mask-reveals line by line and its layout has
 * no header, so it composes its own markup and uses `MaskLine` directly.
 */
export default function ActSection({ id, eyebrow, heading, lede, className, children }: ActSectionProps) {
  return (
    <section id={id} className={cn('relative', className)}>
      {(eyebrow || heading || lede) && (
        <header className='mx-auto max-w-3xl px-6 pt-24 md:pt-32'>
          {eyebrow && <Eyebrow className='eyebrow-rule text-ec-teal'>{eyebrow}</Eyebrow>}
          {heading && (
            <h2 className='type-heading-l mt-4 text-balance text-ec-ink dark:text-white'>{heading}</h2>
          )}
          {lede && <p className='type-body-m mt-4 max-w-2xl text-pretty text-ec-slate'>{lede}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
```

**Match the shipped type scale rather than inventing class names.** `Eyebrow`, `SectionHeading` and the retired sections already use the `type-*` ladder and the `ec-*` tokens; read `SectionHeading.tsx` and the retired `Hero.tsx` before choosing any class here, and keep whatever `Hero.tsx` used for the eyebrow/H1/lede sizes. The redesign changes structure, not the type scale.

- [ ] **Step 4: Write `MaskLine.tsx`**

```tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { bezierControlPoints } from '@/lib/gsap';
import { motion as motionTokens } from '@/design/motion';
import { cn } from '@/lib/utils';

export type MaskLineProps = {
  children: ReactNode;
  /** Seconds to hold before this line rises. Spec §4: 80ms per line. */
  delay?: number;
  className?: string;
};

/**
 * One line of a mask reveal: the line translates up inside an `overflow-hidden`
 * box, so it appears to be uncovered rather than to slide in.
 *
 * **Motion owns this property** (`transform` on the inner span) and GSAP never
 * touches it (spec §3.2). The copy block around it — whose `y` and `opacity`
 * GSAP does own, during the pin — is a different element, which is what keeps
 * the rule satisfiable.
 *
 * The easing is the token, not an approximation: `bezierControlPoints` parses
 * `motion.easing.out` into the four numbers Motion wants, so the mask and the
 * strand are eased by the same curve. That parser is GSAP-adjacent but pure,
 * and `gsap.test.ts` already pins it against the tokens.
 *
 * Under reduced motion the line renders in its final position with no
 * transition — the same words, in the same order, already arrived (§9).
 */
export default function MaskLine({ children, delay = 0, className }: MaskLineProps) {
  const reduced = useReducedMotion();
  return (
    <span className={cn('block overflow-hidden', className)}>
      <motion.span
        className='block'
        initial={reduced ? undefined : { y: '100%' }}
        animate={{ y: 0 }}
        transition={{
          duration: motionTokens.duration.reveal,
          ease: bezierControlPoints(motionTokens.easing.out),
          delay: reduced ? 0 : delay,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
```

Before running anything, confirm the import path: this is the **first** import of the `motion` package anywhere in the repo (Stage 1 installed it with zero consumers). Check `node_modules/motion/package.json`'s `exports` — if the React entry is not `motion/react` in the installed version, use what it declares and note it in the commit body. Do not add a second animation library.

- [ ] **Step 5: Write `Origin.tsx`**

```tsx
'use client';

import { useRef } from 'react';
import EnquireButton from '@/components/educraft/ui/EnquireButton';
import { ButtonNextLink } from '@/components/educraft/ui/Button';
import Eyebrow from '@/components/educraft/ui/Eyebrow';
import { ACT_ANCHORS } from '@/components/educraft/line/anchors';
import { forkPaths, seedAnchors } from '@/components/educraft/line/frames';
import { pathFor } from '@/components/educraft/line/pathBuilders';
import { LineStage } from '@/components/educraft/line/LineStage';
import MaskLine from '@/components/educraft/motion/MaskLine';
import { CEILINGS, DESKTOP_QUERY } from '@/design/scroll';
import { motion as motionTokens } from '@/design/motion';
import { EASE, REDUCED_MOTION_QUERY, gsap, registerGsap, useGSAP } from '@/lib/gsap';

/** Act 0's pinned run, in vh. Spec §4 Act 0: "pinned 70vh". */
const FORK_PIN_VH = 70;
/** The copy's lift and final opacity while the fork resolves. Spec §4 Act 0. */
const COPY_LIFT_Y = -40;
const COPY_FADE = 0.25;
/** Per-line headline stagger, from the token §10.2 names (80ms). */
const HEADLINE_STAGGER_S = CEILINGS.headlineStaggerMs / 1000;

export type OriginProps = {
  eyebrow: string;
  /** The H1 split into the lines that reveal independently, in order. */
  h1Lines: readonly string[];
  lede: string;
  trustLine: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  pillarCount: number;
};

export default function Origin({
  eyebrow,
  h1Lines,
  lede,
  trustLine,
  primaryLabel,
  secondaryLabel,
  secondaryHref,
  pillarCount,
}: OriginProps) {
  const root = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  const arc = pathFor(ACT_ANCHORS.origin.enter, ACT_ANCHORS.origin.exit, 'arc');
  const seeds = seedAnchors(pillarCount);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      // One branch, two conditions: the pin exists only on desktop, and under
      // reduced motion nothing animates at all — `LineStage` has already
      // rendered every strand fully drawn.
      mm.add({ isDesktop: DESKTOP_QUERY, isReduced: REDUCED_MOTION_QUERY }, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as {
          isDesktop: boolean;
          isReduced: boolean;
        };
        const scope = root.current;
        if (!scope || isReduced) return;
        const strands = gsap.utils.toArray<SVGPathElement>('[data-line-path]', scope);
        if (strands.length === 0) return; // gsap.set([]) trips nullTargetWarn
        const [arcPath, ...branches] = strands;

        // The line continues the type: it draws as the headline's last line
        // lands, on arrival rather than on scroll.
        gsap.fromTo(
          arcPath,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, ease: EASE.out, duration: motionTokens.duration.hero }
        );

        if (!isDesktop || !copy.current) return;

        // Desktop: pin, and scrub the fork open while the copy lifts away.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scope,
            start: 'top top',
            end: () => `+=${window.innerHeight * (FORK_PIN_VH / 100)}`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
          },
        });
        tl.fromTo(branches, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: EASE.out }, 0)
          .to(copy.current, { y: COPY_LIFT_Y, opacity: COPY_FADE, ease: EASE.soft }, 0);

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [pillarCount] }
  );

  return (
    <section id='origin' className='relative'>
      <div ref={root} className='relative flex h-screen items-center px-6'>
        <LineStage
          paths={[arc, ...forkPaths(pillarCount)]}
          viewBoxWidth={1}
          viewBoxHeight={1}
          draw={false}
          className='pointer-events-none absolute inset-0'
        >
          {/* The seed nodes, positioned from the same values the branches land
              on — the join's promise, and the reason they are not hand-placed. */}
          <div aria-hidden='true' className='absolute inset-0'>
            {seeds.map((seed) => (
              <span
                key={`${seed.x}`}
                style={{ left: `${seed.x * 100}%`, top: `${seed.y * 100}%` }}
                className='absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ec-teal-graphic'
              />
            ))}
          </div>
        </LineStage>

        <div ref={copy} className='relative mx-auto w-full max-w-3xl md:mx-0 md:max-w-2xl'>
          <Eyebrow className='text-ec-teal'>{eyebrow}</Eyebrow>
          <h1 className='type-display-l mt-5 text-ec-ink dark:text-white'>
            {h1Lines.map((line, index) => (
              <MaskLine key={line} delay={index * HEADLINE_STAGGER_S}>
                {line}
              </MaskLine>
            ))}
          </h1>
          <p className='type-body-l mt-6 text-pretty text-ec-slate'>{lede}</p>
          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <EnquireButton variant='primary' size='lg'>
              {primaryLabel}
            </EnquireButton>
            <ButtonNextLink href={secondaryHref} variant='secondary' size='lg'>
              {secondaryLabel}
            </ButtonNextLink>
          </div>
          <p className='type-body-s mt-6 text-ec-slate'>{trustLine}</p>
        </div>
      </div>
    </section>
  );
}
```

Three things the implementer must **not** "improve":

1. **No `overflow-hidden` on any ancestor of `div[ref=root]`.** That element is pinned; an ancestor with `overflow: hidden` becomes its scroll box and silently breaks the pin. This is the repo's first architectural rule and the reason the retired `StudentJourney` carries a comment about it.
2. **`viewBoxWidth={1} viewBoxHeight={1}`** is the join, not an oversight: it makes the act-local anchors viewBox coordinates. Passing `1200×800` (the default) is what produced the 0.26px arc at Stage 1's close.
3. **The seed `<span>`s are positioned by `seedAnchors` output, and `aria-hidden` on the wrapper.** They are the same values the branches end on; hand-placing them reintroduces the drift the join exists to remove.

- [ ] **Step 6: Run the tests to verify they pass**

```bash
npx vitest run src/components/educraft/acts/ src/components/educraft/motion/
```
Expected: **PASS**. If the markup test for `viewBox` fails, the `LineStage` default is being used — fix the props, not the test.

- [ ] **Step 7: Run the full gate**

```bash
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
Expected: all four pass. `Origin` is not yet referenced by the page, so nothing renders differently.

- [ ] **Step 8: Commit**

```bash
git add src/components/educraft/acts/ActSection.tsx src/components/educraft/acts/Origin.tsx src/components/educraft/acts/Origin.test.ts src/components/educraft/motion/MaskLine.tsx src/components/educraft/motion/MaskLine.test.ts
git commit -m "feat(acts): Act 0 — Origin, where the strand enters

The hero becomes the first frame of a continuous sequence rather than a
section holding a scene: the strand enters top-right, descends, and forks
into one branch per pillar at the fold, pinned for 70vh while the copy
lifts away. It renders in the unit frame, so the act-local anchors are
viewBox coordinates with no arithmetic — the join, used.

The CTAs stop doing two jobs: 'Talk to us' opens the modal, 'Explore
programmes' navigates. MaskLine is Motion's first consumer in this repo."
```

---

## Task 6: Act 1 — the walk, and `drawAt`'s first call site

The largest act and the product itself. A track of N stations translates `0 → −(N−1) × 100vw` under a pin, the rail draws **one segment per station** as the walk arrives at it, and the progress rail is N real buttons that move the page to their station.

**`drawAt` finally gets called here.** Stage 1 shipped it with the note that "nothing imports it yet, so the draw does not scale with pillar count today — this module is the replacement, not the replacement applied. Stage 2 wires it in." This task is that wiring, and the shape is forced: `walkFrame` slices the rail into N one-unit segments with station `i` at the midpoint of segment `i`, and `drawAt(progress, i, n)` is the fraction of *that* segment drawn.

**Files:**
- Create: `src/components/educraft/acts/FivePillars.tsx`, `src/components/educraft/acts/FivePillars.test.ts`
- Modify: `src/app/globals.css` (the reduced-motion block only)

**Interfaces:**
- Consumes: `walkFrame`, `assertRibbonSeam` (Task 2); `drawAt` (`line/station.ts`); `DESKTOP_QUERY`, `SCRUB`, `walkPinRangePx`, `stationScrollTarget`, `branchFor` (Task 3); `LineStage` `draw={false}` (Task 4); `pillarAccent` (`lib/pillarStyles.ts`) for the literal per-pillar class strings.
- Produces: `FivePillars` (default export, client), `FivePillarsProps`, `Station` (exported type). Consumed by Task 11's page, and the ribbon lands in Task 7 in the same file.

- [ ] **Step 1: Write the failing test**

Create `src/components/educraft/acts/FivePillars.test.ts`. The fixtures are literal so the test does not depend on `data/programmes.ts`'s current contents:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import FivePillars, { type Station } from './FivePillars';

const STATIONS: Station[] = [
  {
    pillarId: 'learn',
    pillarName: 'Learn',
    programmeName: 'Linguistics',
    tagline: 'Real fluency and confident communication across languages.',
    highlights: [
      { title: 'First highlight', detail: 'First detail.' },
      { title: 'Second highlight', detail: 'Second detail.' },
    ],
    href: '/programmes/linguistics',
  },
  {
    pillarId: 'include',
    pillarName: 'Include',
    programmeName: 'Inclusive Education',
    tagline: 'Adaptive, individualised support.',
    highlights: [
      { title: 'Third highlight', detail: 'Third detail.' },
      { title: 'Fourth highlight', detail: 'Fourth detail.' },
    ],
    href: '/programmes/inclusive-education',
  },
];

const render = (stations: Station[] = STATIONS, pillarCount = stations.length) =>
  renderToStaticMarkup(createElement(FivePillars, { stations, pillarCount }));

describe('Act 1 — the walk', () => {
  it('renders every station as real DOM, in order', () => {
    const markup = render();
    expect(markup.indexOf('Learn')).toBeLessThan(markup.indexOf('Include'));
    expect(markup).toContain('Linguistics');
    expect(markup).toContain('Inclusive Education');
  });

  it('carries no cards', () => {
    // §14's definition of done: no `card-surface` on the landing page. The
    // retired ProgrammeExplorer was 24 card-surfaces plus 9 nested.
    expect(render()).not.toContain('card-surface');
  });

  it('gives each station exactly one link', () => {
    // §4 Act 1: the current link + `Enquire` pair is dropped — `Enquire` was
    // duplicated across three sections.
    const markup = render();
    expect((markup.match(/href="\/programmes\//g) ?? []).length).toBe(2);
    expect(markup).not.toContain('Enquire');
    expect(markup).toContain('Read the full programme');
  });

  it('renders the progress rail as real buttons with sr-only labels', () => {
    // §9: "Real <button>s that scroll to their station. Keyboard users walk the
    // pillars with Tab and ←/→. Not decorative dots."
    const markup = render();
    expect((markup.match(/<button/g) ?? []).length).toBe(2);
    expect(markup).toContain('sr-only');
    for (const name of ['Learn', 'Include']) expect(markup).toContain(`Go to ${name}`);
  });

  it('uses the walk frame: one viewBox unit per viewport', () => {
    expect(render()).toContain('viewBox="0 0 2 1"');
  });

  it('segments the rail one per station, for the per-station draw', () => {
    const markup = render();
    expect((markup.match(/data-line-path/g) ?? []).length).toBe(2);
    expect(markup).toContain('M 0 0.5 L 1 0.5');
    expect(markup).toContain('M 1 0.5 L 2 0.5');
  });

  it('scales to six pillars with no markup change', () => {
    const six = [...STATIONS, { ...STATIONS[0], pillarId: 'thrive' as const, pillarName: 'Thrive' }];
    expect(render(six)).toContain('viewBox="0 0 3 1"');
    expect((render(six).match(/<button/g) ?? []).length).toBe(3);
  });

  it('states the act on one screen at a time for mobile, stacked for tablet', () => {
    // The three branches are Tailwind variants over ONE structure — so the DOM
    // order is identical in every branch, which is what §9 requires under
    // reduced motion. Both the track width and the column direction are here.
    const markup = render();
    expect(markup).toContain('data-walk-track');
    expect(markup).toContain('data-walk-station');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/components/educraft/acts/FivePillars.test.ts
```
Expected: **FAIL** — `Cannot find module './FivePillars'`.

- [ ] **Step 3: Write `FivePillars.tsx`**

The structure, in outline — the three branch decisions are **CSS**, and the animation is the only JS branch:

```tsx
'use client';

import { useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import Eyebrow from '@/components/educraft/ui/Eyebrow';
import { LineStage } from '@/components/educraft/line/LineStage';
import { walkFrame } from '@/components/educraft/line/frames';
import { drawAt } from '@/components/educraft/line/station';
import { pillarAccent } from '@/lib/pillarStyles';
import {
  branchFor,
  DESKTOP_QUERY,
  SCRUB,
  stationScrollTarget,
  walkPinRangePx,
} from '@/design/scroll';
import { REDUCED_MOTION_QUERY, gsap, registerGsap, useGSAP } from '@/lib/gsap';
import type { PillarId } from '@/data/pillars';
import type { Highlight } from '@/types';

export type Station = {
  pillarId: PillarId;
  pillarName: string;
  programmeName: string;
  tagline: string;
  /** The programme's own highlight shape, sliced to the two §4 keeps. */
  highlights: readonly Highlight[];
  href: string;
};

export type FivePillarsProps = {
  stations: readonly Station[];
  /** `pillars.length` — the geometry is a function of it, never of `stations`. */
  pillarCount: number;
};

export default function FivePillars({ stations, pillarCount }: FivePillarsProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  /** The pin's start in page pixels, published by the ScrollTrigger itself. */
  const pinStartRef = useRef(0);
  const frame = walkFrame(pillarCount);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      mm.add({ isDesktop: DESKTOP_QUERY, isReduced: REDUCED_MOTION_QUERY }, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as { isDesktop: boolean; isReduced: boolean };
        const scope = root.current;
        const trackEl = track.current;
        // Reduced motion is a CSS branch for this act (see globals.css): the
        // track is neutralised, so there is nothing to animate and nothing to
        // undo. LineStage has already drawn every segment.
        if (!scope || !trackEl || isReduced) return;
        if (!isDesktop) return; // tablet and mobile own their behaviour in CSS

        const segments = gsap.utils.toArray<SVGPathElement>('[data-line-path]', scope);
        if (segments.length === 0) return;

        const trigger = {
          trigger: scope,
          start: 'top top',
          // The pinned run is one dwell per station. `walkPinRangePx` is also
          // what `stationScrollTarget` divides, so the pin and the rail cannot
          // disagree about where a station is.
          end: () => `+=${walkPinRangePx(window.innerHeight, pillarCount)}`,
          pin: true,
          pinSpacing: true,
          scrub: SCRUB,
          // `invalidateOnRefresh` because the end is a function of the viewport
          // height: on resize the range must be recomputed, not scaled.
          invalidateOnRefresh: true,
          // The pin's own start, in page pixels — the rail needs it and cannot
          // derive it. `getBoundingClientRect().top` looks equivalent and is
          // not: *inside* the pinned range the pinned element is fixed to the
          // top of the viewport, so its rect reports 0 and a derived start
          // would be the current scroll position. Every rail click would then
          // overshoot by however far into the walk the reader already was.
          onRefresh: (self: { start: number }) => {
            pinStartRef.current = self.start;
          },
          onUpdate: (self: { progress: number }) => {
            segments.forEach((segment, i) => {
              gsap.set(segment, { strokeDashoffset: 1 - drawAt(self.progress, i, pillarCount) });
            });
          },
        };
        // The track travels **N viewports, not N − 1** — the one place this
        // stage supersedes the spec's §4 Act 1 tween, which reads
        // `0 → -(100 × (N−1))vw`.
        //
        // At (N−1) viewports of travel, station i reaches the middle of the
        // viewport at `i/(N−1)` of the pin, while `drawAt` — pinned by Stage 1
        // and decided by the owner after the alternative was put to them —
        // begins segment i at `i/N`. The two axes differ by up to `0.5/N` of the
        // pin: **10% at five pillars, 40vh of a 400vh walk**. The rail would
        // land 40vh from the station it names, and the strand would draw one
        // station's segment while a different station was centred.
        //
        // A full viewport of travel per dwell removes both disagreements and
        // makes the model self-consistent: station i centres at `i/N`, exactly
        // where `drawAt` starts its segment, so the strand's drawn tip arrives
        // at each station as that station centres. This is what Stage 1's own
        // ruling offered when it corrected `drawAt`'s shape — "the owner was
        // offered a redirect that would instead change Task 7's tween from
        // (N−1) to N steps" — so it restores a decision rather than reversing
        // one.
        const st = gsap.to(trackEl, {
          x: () => -(window.innerWidth * pillarCount),
          ease: 'none',
          scrollTrigger: trigger,
        });

        return () => {
          st.scrollTrigger?.kill();
          st.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [pillarCount] }
  );

  const onRailClick = (index: number) => {
    // §9's buttons must actually move the walk. The behaviour is branch-aware
    // and that is `branchFor`'s consumer: on desktop the track is transformed
    // rather than scrolled, so the page moves; on tablet the stations are
    // stacked, so the element scrolls into view; on mobile the track is a
    // native snap container, so the container scrolls horizontally.
    const branch = branchFor(window.innerWidth);
    if (branch === 'tablet') {
      document.getElementById(`station-${stations[index].pillarId}`)?.scrollIntoView({ block: 'start' });
      return;
    }
    if (branch === 'mobile') {
      track.current?.scrollTo({ left: index * window.innerWidth, behavior: 'smooth' });
      return;
    }
    window.scrollTo({
      top: stationScrollTarget(
        index,
        pillarCount,
        pinStartRef.current,
        walkPinRangePx(window.innerHeight, pillarCount)
      ),
      behavior: 'smooth',
    });
  };

  return (
    <section id='pillars' ref={root} className='relative'>
      {/* Desktop: pin + translate. Tablet: stack. Mobile: native snap.
          One structure, three CSS branches — identical DOM order in all of
          them, which is what §9 requires under reduced motion. */}
      <div
        className='snap-x snap-mandatory overflow-x-auto sm:snap-none sm:overflow-x-visible lg:overflow-hidden'
        data-walk-track
      >
        <div
          ref={track}
          className='relative flex w-[var(--track-w)] flex-row sm:w-full sm:flex-col lg:w-[var(--track-w)] lg:flex-row'
          style={{ '--track-w': `${frame.widthVw}vw` } as CSSProperties}
        >
          <LineStage
            paths={frame.railSegments}
            viewBoxWidth={pillarCount}
            viewBoxHeight={1}
            draw={false}
            className='pointer-events-none absolute inset-0'
          />
          <ol className='contents'>
            {stations.map((station) => (
              <li
                key={station.pillarId}
                id={`station-${station.pillarId}`}
                data-walk-station
                className='relative w-screen shrink-0 snap-center sm:w-full lg:h-screen'
              >
                {/* the pillar's soft tier as a full-bleed band, not a box (§4) */}
                <div className={`absolute inset-y-0 left-0 w-1 ${pillarAccent[station.pillarId].border}`} aria-hidden='true' />
                <div className='mx-auto flex h-full max-w-xl flex-col justify-center gap-6 px-6'>
                  <Eyebrow className={pillarAccent[station.pillarId].text}>{station.pillarName}</Eyebrow>
                  <p className='type-display-m text-ec-ink dark:text-white'>{station.programmeName}</p>
                  <p className='type-body-m text-ec-slate'>{station.tagline}</p>
                  <ul className='divide-y divide-ec-border border-y border-ec-border'>
                    {station.highlights.map((highlight) => (
                      <li key={highlight.title} className='py-3 type-body-m text-ec-ink dark:text-white'>
                        <span className='font-medium'>{highlight.title}.</span> {highlight.detail}
                      </li>
                    ))}
                  </ul>
                  <Link href={station.href} className='type-body-s underline underline-offset-4'>
                    Read the full programme
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* §9: real buttons, not decorative dots. */}
      <ol className='mt-8 flex justify-center gap-3'>
        {stations.map((station, index) => (
          <li key={station.pillarId}>
            <button
              type='button'
              onClick={() => onRailClick(index)}
              className='group flex h-6 w-6 items-center justify-center rounded-full'
            >
              <span className='sr-only'>Go to {station.pillarName}</span>
              <span
                aria-hidden='true'
                className={`h-2 w-2 rounded-full ${pillarAccent[station.pillarId].bg}`}
              />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

Notes the implementer must keep:

- **`pillarAccent[...]` is the literal class map — never interpolate a class name.** `bg-ec-${id}` emits no CSS (Tailwind 4 only sees literal strings). `pillarStyles.ts` already writes every mapping out; use its fields, do not build strings.
- **`--track-w` as an inline custom property** keeps the width off the class list, which is what lets one structure carry all three branches: `w-[var(--track-w)]` on mobile, `sm:w-full` on tablet, and the desktop row.
- **The stations are `<li>` inside a `contents` `<ol>`** so the rail's ordering and the track's layout do not fight; if `display: contents` causes trouble with the snap container, use a plain `<div>` for the track and keep the `<ol>` for the rail only — the a11y requirement is that every word is real DOM in logical order, and both orders here are the same order.
- **`drawAt` is applied per segment in `onUpdate`, with `gsap.set`** — one property, one owner, no tween-per-frame. `1 - drawAt(...)` is always a valid dashoffset because `drawAt` saturates to `0..1`.
- **The spec's tween formula is superseded, and `spec.md` must say so in this commit.** §4 Act 1 reads "`x` tweened `0 → -(100 × (N−1))vw`". That formula belongs to a model in which a station sits at the *left edge* of its slot, and it cannot be reconciled with `drawAt`'s slices: it puts station `i` at `i/(N−1)` of the walk while every derived quantity — the slice the segment draws over, the scroll target the rail uses — puts it at `i/N`. The code follows `drawAt` (pinned, tested, and the subject of an explicit Stage 1 owner decision); the spec's sentence is corrected to `0 → -(100 × N)vw` with the one-line reason. Leaving the authority false is the failure mode this repository has already paid for twice.

- [ ] **Step 4: Neutralise the walk under reduced motion in `globals.css`**

Add to the existing reduced-motion block (`globals.css:508-538` — the same block that carries `[data-line-path]{stroke-dashoffset:0 !important}`; do not create a second one):

```css
  /* The walk is a pinned horizontal track, and §9 requires the reduced-motion
     page to be a plain vertical document in identical DOM order. The track is
     neutralised in CSS rather than in JS because the JS branch would have to
     undo a transform that GSAP may have already written. */
  [data-walk-track] {
    overflow: visible !important;
    display: block !important;
  }
  [data-walk-track] > * {
    width: 100% !important;
    transform: none !important;
    flex-direction: column !important;
  }
  [data-walk-station] {
    width: 100% !important;
    height: auto !important;
  }
```

- [ ] **Step 5: Pin the reduced-motion neutralisation in the existing CSS test**

`gsap.test.ts` already asserts that the reduced-motion block carries the same query string as `REDUCED_MOTION_QUERY`. Extend that test (do not add a second file that reads `globals.css`):

```ts
  it('neutralises the walk track under reduced motion', () => {
    // §9: no pin, no scrub, no horizontal track — the same page, same words, in
    // the order a screen reader already needs. The CSS is the only place this
    // can be guaranteed, since GSAP may have written a transform by then.
    expect(reducedMotionBlock).toContain('[data-walk-track]');
    expect(reducedMotionBlock).toContain('transform: none !important');
    expect(reducedMotionBlock).toContain('[data-walk-station]');
  });
```

- [ ] **Step 6: Run the tests and the full gate**

```bash
npx vitest run src/components/educraft/acts/ src/lib/gsap.test.ts && npx tsc --noEmit && npm run lint && npm run test && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/educraft/acts/FivePillars.tsx src/components/educraft/acts/FivePillars.test.ts src/app/globals.css src/lib/gsap.test.ts docs/projects/landing-redesign/spec.md
git commit -m "feat(acts): Act 1 — the walk, and drawAt's first call site

A track of N stations translates under a pin and the rail draws one
segment per station, each against drawAt's own slice — the per-station
draw Stage 1 shipped the maths for and nothing called. The progress rail
is real buttons whose behaviour is branchFor's first consumer: desktop
moves the page (the track is transformed, so scrollIntoView cannot reach
a station), tablet scrolls the element, mobile scrolls the snap
container. Under reduced motion the track is neutralised in CSS, which is
the only place it can be guaranteed once GSAP has written a transform."
```

---

## Task 7: Act 1's tail — the ribbon

§4's second half of Act 1: the N strands converge back into one, and the six journey stages become six nodes **on that single continuing strand**, drawn left-to-right, in ~110vh. It replaces `StudentJourney`'s 552vh pinned SVG with 110vh, and it is where the page's horizontal walk becomes a vertical document again.

**Files:**
- Modify: `src/components/educraft/acts/FivePillars.tsx`, `src/components/educraft/acts/FivePillars.test.ts`

**Interfaces:**
- Consumes: `ribbonFrame` (Task 2); `ACT_ANCHORS.pillars.exit` via the frame; `motionTokens.duration.reveal` (the 700ms token §10.2 binds to the ribbon draw). **Not `assertRibbonSeam`** — Task 11 calls it from `page.tsx`.
- Produces: `RibbonStage` (a named export from the same file, so Task 11's page does not need a second import path), and `FivePillarsProps.stages`.

- [ ] **Step 1: Write the failing test**

Append to `FivePillars.test.ts`:

```ts
const STAGES = [
  { stage: '01', title: 'Curious' },
  { stage: '02', title: 'Supported' },
  { stage: '03', title: 'Practising' },
  { stage: '04', title: 'Confident' },
  { stage: '05', title: 'Capable' },
  { stage: '06', title: 'Ready' },
] as const;

describe('Act 1 — the journey ribbon', () => {
  const markup = renderToStaticMarkup(
    createElement(FivePillars, { stations: STATIONS, pillarCount: 2, stages: STAGES })
  );

  it('puts all six stages on one continuing strand, left to right', () => {
    let cursor = -1;
    for (const stage of STAGES) {
      const at = markup.indexOf(stage.title);
      expect(at, `${stage.title} is rendered`).toBeGreaterThan(-1);
      expect(at, `${stage.title} comes after the previous stage`).toBeGreaterThan(cursor);
      cursor = at;
    }
  });

  it('renders the ribbon in its own frame, not the walk frame', () => {
    // Six stages plus a convergence slot and a trailing exit slot.
    expect(markup).toContain('viewBox="0 0 8 1"');
  });

  it('converges one strand per pillar', () => {
    const convergences = markup.match(/M 0 0\.\d+ C/g) ?? [];
    expect(convergences.length).toBe(2);
  });

  it('exits on the page spine, as a fraction of its own frame', () => {
    // pixels.exit.x === 0.75 * 8 — the value ACT_ANCHORS.pillars.exit holds, so
    // the ribbon and the vertical acts cannot disagree about where the seam is.
    expect(markup).toContain('L 6 1');
  });

  it('labels each stage with its number and title as real text', () => {
    for (const stage of STAGES) expect(markup).toContain(`Stage ${stage.stage}`);
  });

  it('keeps the strand decorative', () => {
    expect(markup).toContain('aria-hidden="true"');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/components/educraft/acts/FivePillars.test.ts
```
Expected: **FAIL** — no ribbon in the markup, `stages` is not a prop.

- [ ] **Step 3: Add the ribbon to `FivePillars.tsx`**

```tsx
export type RibbonStage = { stage: string; title: string };

export type FivePillarsProps = {
  stations: readonly Station[];
  pillarCount: number;
  /** `studentJourneyStages` — six entries, from `data/pillars.ts`. */
  stages: readonly RibbonStage[];
};

/**
 * The ribbon: the walk's N strands converge into one, and the six journey
 * stages sit on that single strand, drawn left to right (spec §4 Act 1).
 *
 * A second `LineStage` with its own frame, because the ribbon is a different
 * coordinate space from the walk — a horizontal document rather than a track of
 * viewport-width slots. Its exit is read from `ACT_ANCHORS.pillars.exit` through
 * `ribbonFrame`, so the seam into Act 2 is one number in one place.
 */
export function RibbonStage({ stages, pillarCount }: { stages: readonly RibbonStage[]; pillarCount: number }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = ribbonFrame(stages.length, pillarCount);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add(`not all and ${REDUCED_MOTION_QUERY}`, () => {
        const scope = root.current;
        if (!scope) return;
        const strand = gsap.utils.toArray<SVGPathElement>('[data-line-path]', scope).at(-1);
        if (!strand) return;
        // 700ms, the `reveal` token §10.2 binds to the ribbon draw.
        gsap.fromTo(
          strand,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: EASE.out,
            duration: motionTokens.duration.reveal,
            scrollTrigger: { trigger: scope, start: 'top 80%', once: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [stages.length, pillarCount] }
  );

  return (
    <div ref={root} className='relative mx-auto max-w-5xl px-6 py-24'>
      <Eyebrow className='text-ec-teal'>The student journey</Eyebrow>
      <h3 className='type-heading-m mt-4 text-ec-ink dark:text-white'>
        Six stages, one direction: forward.
      </h3>
      <LineStage
        paths={[...frame.convergence, frame.strand]}
        viewBoxWidth={frame.width}
        viewBoxHeight={1}
        draw={false}
        className='relative mt-12 h-40 w-full'
      >
        <ol className='absolute inset-x-0 top-1/2 -translate-y-1/2'>
          {stages.map((stage, index) => (
            <li
              key={stage.stage}
              className='absolute -translate-x-1/2 text-center'
              style={{ left: `${(frame.nodes[index].x / frame.width) * 100}%` }}
            >
              <span className='sr-only'>Stage {stage.stage}</span>
              <span aria-hidden='true' className='type-body-s block text-ec-slate'>
                {stage.title}
              </span>
            </li>
          ))}
        </ol>
      </LineStage>
    </div>
  );
}
```

Wire it into `FivePillars`'s return, after the rail. **Do not add a call site for `assertRibbonSeam` here.** Task 11 makes `page.tsx` the single runtime call site for all three seam assertions; a second one in a `'use client'` module body would also run in the browser on every mount, for no benefit, and `assertForkSeam` is not this act's to call — it checks the fork's geometry, which belongs to `Origin`.

- [ ] **Step 4: Run the tests and the gate**

```bash
npx vitest run src/components/educraft/acts/ && npx tsc --noEmit && npm run lint && npm run test && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/educraft/acts/FivePillars.tsx src/components/educraft/acts/FivePillars.test.ts
git commit -m "feat(acts): Act 1's ribbon — six stages on the continuing strand

The N strands converge into one and the journey stages become nodes on
it, drawn left to right over 110vh where StudentJourney pinned 552vh. Its
own frame, so it is a document rather than a track of viewport-width
slots, and its exit is read from ACT_ANCHORS.pillars.exit through
ribbonFrame — one number, one place, so the seam into Act 2 cannot drift."
```

---

## Task 8: Act 2 — The Way

`WhyDifferent`'s ruled rows and `Methodology`'s five steps become **one argument** (§4): the differentiators are the *why*, the method steps are the *how*, and both sit on one vertical strand running the length of the act. The `01`–`05` numerals become nodes rather than list markers, and the strand is the spine the act's copy hangs off.

**Files:**
- Create: `src/components/educraft/acts/Way.tsx`, `src/components/educraft/acts/Way.test.ts`

**Interfaces:**
- Consumes: `ACT_VIEW_BOX` (Task 2); `ACT_ANCHORS.way` (Task 1); `ActSection` (Task 5); `LineStage`, `pathFor`, `polylinePath`.
- Produces: `Way` (default export, client), `WayProps`, and the **differentiator copy moved verbatim out of the file Task 11 deletes** (`WhyDifferent.tsx:6–35`). Between this task and Task 11 the strings exist in two places — deliberately, because the act's tests pin them, so Task 11's deletion is verified by those tests still passing rather than by inspection.

- [ ] **Step 1: Write the failing test**

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Way from './Way';

const markup = renderToStaticMarkup(createElement(Way));

describe('Act 2 — The Way', () => {
  it('argues the why and the how as one act', () => {
    expect(markup).toContain('A different kind of education company.');
    expect(markup).toContain('Five steps, one method');
  });

  it('de-duplicates "Portfolios, dashboards" to a single statement', () => {
    // §4: it appeared 4 times across the landing page; the spec counted 4, the
    // tree holds 3 live strings, and exactly one survives here — inside
    // "Progress you can actually see".
    const hits = markup.match(/Portfolios, dashboards/g) ?? [];
    expect(hits.length).toBe(1);
  });

  it('cuts the five proofPillars', () => {
    // §4: People/Process/Evidence/Partnerships/Outcomes overlap the
    // differentiators almost entirely; Evidence and Partnerships fold into Act 3.
    for (const name of ['People', 'Process', 'Partnerships', 'Outcomes']) {
      expect(markup).not.toContain(`>${name}<`);
    }
  });

  it('renders all five differentiators and all five method steps, in order', () => {
    for (const title of [
      'One ecosystem, not five silos',
      'Specialists in every room',
      'Families are partners, not spectators',
      'Progress you can actually see',
      'Wellbeing woven in, not bolted on',
    ]) {
      expect(markup, title).toContain(title);
    }
    for (const step of ['Understand', 'Map', 'Learn', 'Measure', 'Grow']) {
      expect(markup, step).toContain(step);
    }
    expect(markup.indexOf('Understand')).toBeLessThan(markup.indexOf('Grow'));
  });

  it('numbers the nodes rather than using list markers', () => {
    expect(markup).toContain('01');
    expect(markup).toContain('05');
  });

  it('carries no cards', () => {
    expect(markup).not.toContain('card-surface');
  });

  it('draws one strand in the unit frame', () => {
    expect(markup).toContain('viewBox="0 0 1 1"');
    expect((markup.match(/data-line-path/g) ?? []).length).toBeGreaterThan(0);
  });

  it('links to the full method treatment', () => {
    expect(markup).toContain('Read the full methodology');
    expect(markup).toContain('href="/methodology"');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/components/educraft/acts/Way.test.ts
```
Expected: **FAIL** — `Cannot find module './Way'`.

- [ ] **Step 3: Write `Way.tsx`**

Structure: `ActSection` (Task 5) supplying the eyebrow/heading/lede as **server-rendered props**, with the act itself as a client component that renders:

- one `LineStage` with `paths={[pathFor(ACT_ANCHORS.way.enter, ACT_ANCHORS.way.exit, 'arc')]}` and `viewBoxWidth={1} viewBoxHeight={1}`, drawing on scroll as the act enters;
- two ordered lists — the five differentiators with their `01`–`05` numerals as nodes, then the five method steps as nodes on **the same strand** — positioned so each node sits on the strand line (the strand runs at `x = 0.75`; nodes are placed with the same `left: ${x * 100}%` convention Act 0 uses, not hand-tuned);
- the lede and the `Read the full methodology` link.

The `differentiators` array is **moved verbatim** from `WhyDifferent.tsx:6–35` into this file, and the five method steps come from `data/pillars.ts`'s `methodologySteps` exactly as the retired section read them.

Two constraints:

- **The strand is one path with two movements**, not two strands: the differentiators and the steps are nodes on a single run from `ACT_ANCHORS.way.enter` to `ACT_ANCHORS.way.exit`. If the implementer finds the copy needs more room than the strand provides, adjust the *act's height* — not the anchors, which the seam assertions check.
- **Under reduced motion the strand is fully drawn and the nodes are a plain list**, which is what `LineStage`'s reduced-motion branch already does; the act adds no second path.

- [ ] **Step 4: Run the tests and the gate**

```bash
npx vitest run src/components/educraft/acts/ && npx tsc --noEmit && npm run lint && npm run test && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/educraft/acts/Way.tsx src/components/educraft/acts/Way.test.ts
git commit -m "feat(acts): Act 2 — the why and the how as one argument

WhyDifferent's ruled rows and Methodology's five steps become nodes on
one vertical strand instead of two sections and nine cards, with the
method's numerals acting as the nodes. The differentiator copy moves
verbatim; 'Portfolios, dashboards' survives exactly once, and the five
proofPillars are cut (Evidence and Partnerships fold into Act 3)."
```

---

## Task 9: Act 3 — Proof

§4: the strand becomes a **horizontal axis with tick marks** — an evidence scale. The impact chain's four stations sit on it, the stat row stays (already unboxed and already good) with the §1.3 defect fixed, and the testimonials become a pull-quote in open space with two marginalia under hairline rules, replacing three cards.

**Files:**
- Create: `src/components/educraft/acts/Proof.tsx`, `src/components/educraft/acts/Proof.test.ts`

**Interfaces:**
- Consumes: `ACT_VIEW_BOX` (Task 2), `ACT_ANCHORS.proof` (Task 1), `ActSection` (Task 5), `LineStage`, `pathFor`, `polylinePath`.
- Produces: `Proof` (default export, client), `ProofProps` — and the **corrected stat row**, which is the one string change §14 requires in two places: this act carries the landing-page half, and `app/(site)/impact/page.tsx:61` is Stage 3's (recorded in §Documentation obligations).

- [ ] **Step 1: Write the failing test**

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Proof from './Proof';

const markup = renderToStaticMarkup(createElement(Proof));

describe('Act 3 — Proof', () => {
  it('fixes the audience count, and says three', () => {
    // §1.3: the shipped section claimed "4 Audiences served — Schools ·
    // Parents · Students · Partners" while navigation.ts defines exactly three
    // audienceEntries. `Partners` has no entry point; the redesign resolves it
    // to 3.
    expect(markup).toContain('Audiences served');
    expect(markup).toContain('Schools · Parents · Students');
    expect(markup).not.toContain('Partners');
    expect(markup).not.toContain('4 Audiences');
  });

  it('keeps the stat row unboxed', () => {
    const markup2 = markup;
    expect(markup2).not.toContain('card-surface');
    expect(markup2).toContain('Vertical programmes');
    expect(markup2).toContain('Connected ecosystem');
    expect(markup2).toContain('Journey stages');
  });

  it('puts the four chain stations on the axis, in order', () => {
    for (const station of ['Confidence', 'Engagement', 'Skill', 'Readiness']) {
      expect(markup, station).toContain(station);
    }
    expect(markup.indexOf('Confidence')).toBeLessThan(markup.indexOf('Readiness'));
  });

  it('renders the axis in the unit frame', () => {
    expect(markup).toContain('viewBox="0 0 1 1"');
  });

  it('leads with one quote and two marginalia, not three cards', () => {
    expect((markup.match(/<blockquote/g) ?? []).length).toBe(1);
    // The entities compile to the character itself, so the assertion is on
    // U+201C — three of them: the pull quote and both marginalia.
    expect((markup.match(/“/g) ?? []).length).toBe(3);
  });

  it('keeps the seed-content warning visible', () => {
    // §4's carried caveat: leaning harder on seed testimonials makes replacing
    // them more urgent, not less. The warning is not allowed to become a
    // comment that nobody sees.
    expect(markup).toContain('placeholder');
  });
});
```

**The `placeholder` assertion expects a visible string in the pull-quote block** — draft, for owner approval: `These are placeholder quotes pending consented testimonials.` It sits under the quote block in `type-body-s`, not in a comment, because a launch blocker that is invisible to the reader is one nobody replaces. `[COPY — approved 2026-09-13]`.

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/components/educraft/acts/Proof.test.ts
```
Expected: **FAIL** — `Cannot find module './Proof'`.

- [ ] **Step 3: Write `Proof.tsx`**

The act composes one strand in the unit frame with **three movements** — the axis, and a tick per station — built from `polylinePath` and `pathFor`:

- the strand enters at `ACT_ANCHORS.proof.enter` `{0.75, 0}`, arcs to the axis's left end at `{0.15, 0.4}`, runs the axis to `{0.85, 0.4}`, then arcs down to `ACT_ANCHORS.proof.exit` `{0.75, 1}`;
- four tick marks at `x = 0.15, 0.38, 0.62, 0.85` hang from the axis, each a `pathFor(..., 'line')` between `y = 0.4` and `y = 0.44`, with the impact chain's four stations beside them;
- the stat row is the existing unboxed treatment (`border-y border-ec-border py-10`), with the third stat's label and sub corrected;
- the pull quote is `testimonials[0]`, large, in open space, wrapped in `&ldquo;`/`&rdquo;` exactly as the retired section wrapped it, with `{name}` and `{role} · {context}` beneath; the two remaining testimonials are marginalia under `border-t border-ec-border`, each a `<blockquote>` with its own attribution.

The axis's tick positions are **literals in the act**, not derived from the anchor contract: they are internal geometry the seam assertions do not cover, and pinning them in the test is what makes a change visible.

- [ ] **Step 4: Run the tests and the gate**

```bash
npx vitest run src/components/educraft/acts/ && npx tsc --noEmit && npm run lint && npm run test && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/educraft/acts/Proof.tsx src/components/educraft/acts/Proof.test.ts
git commit -m "feat(acts): Act 3 — proof as an evidence axis

The strand becomes a horizontal axis with a tick per impact station, so
the four-card chain is four stations on one line; the stat row keeps its
unboxed treatment and loses the defect §1.3 measured — 'Partners' had no
entry point in navigation.ts, and the row now says 3. The three
testimonial cards become one pull quote and two marginalia, with the
seed-content warning visible rather than buried in a comment."
```

---

## Task 10: Act 4 — the doors, and the strand's end

§4: the strand **converges to a single point, and that point is the CTA**. Three doors separated by vertical hairline rules rather than three cards, each finally using the `headline` and `ctaLabel` fields the shipped component imported and never rendered — and `FinalCTA`'s dark band, into which the strand terminates.

**Files:**
- Create: `src/components/educraft/acts/Doors.tsx`, `src/components/educraft/acts/Doors.test.ts`
- Create: `src/components/educraft/acts/FinalCTA.tsx` (new copy of the kept component; Task 11 deletes `landing/FinalCTA.tsx`)

**Interfaces:**
- Consumes: `ACT_VIEW_BOX` (Task 2), `ACT_ANCHORS.doors` (Task 1), `ActSection` (Task 5), `LineStage`, `pathFor`, `audienceEntries`/`audiencePageHrefs` (`data/navigation.ts`).
- Produces: `Doors` and `FinalCTA` (default exports, client). The page renders `Doors`, which renders `FinalCTA` — one act, one section.

- [ ] **Step 1: Write the failing test**

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Doors from './Doors';

const markup = renderToStaticMarkup(createElement(Doors));

describe('Act 4 — the doors', () => {
  it('renders the fields the shipped component imported and never used', () => {
    // §4 Act 4, verified at Stage 2 planning: `headline` and `ctaLabel` exist on
    // every audienceEntry and the retired component rendered neither.
    expect(markup).toContain('A partner your school can build on.');
    expect(markup).toContain('Clear progress, real partnership.');
    expect(markup).toContain('A path that feels like yours.');
    expect(markup).toContain('Talk to the Education Team');
    expect(markup).toContain('Find the Right Programme');
    expect(markup).toContain('Explore Your Path');
  });

  it('trims each door to two benefits', () => {
    for (const cut of [
      'Safeguarding-first policies',
      'Flexible delivery',
      'Guidance resources',
      'Confidential wellbeing support',
      'Programmes built around real skills',
      'Small groups where your voice matters',
    ]) {
      expect(markup, cut).not.toContain(cut);
    }
    for (const kept of [
      'One partner across five specialist verticals',
      'Mentors who actually know your name',
    ]) {
      expect(markup, kept).toContain(kept);
    }
  });

  it('separates the doors with rules, not cards', () => {
    expect(markup).not.toContain('card-surface');
    expect(markup).toContain('divide-x');
  });

  it('ends the strand on the CTA node', () => {
    // doors.exit is { x: 0.75, y: 0.5 } — mid-band, because the strand stops
    // here rather than leaving the page.
    expect(markup).toContain('viewBox="0 0 1 1"');
  });

  it('keeps the closer copy verbatim', () => {
    expect(markup).toContain('The next step is a conversation.');
    expect(markup).toContain('Start a Conversation');
    expect(markup).toContain('Browse Programmes');
    expect(markup).toContain('No commitment — just a conversation about where a learner could go.');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/components/educraft/acts/Doors.test.ts
```
Expected: **FAIL** — `Cannot find module './Doors'`.

- [ ] **Step 3: Write `Doors.tsx`**

One `LineStage` in the unit frame whose single path runs `ACT_ANCHORS.doors.enter` → `ACT_ANCHORS.doors.exit`, drawn on scroll as the act enters. The three doors are a `grid` with `divide-x divide-ec-border` (collapsing to stacked with `max-lg:divide-x-0 max-lg:divide-y`), each rendering `headline` as its `h3`, `ctaLabel` as its link text with `ctaHref`, and exactly the two benefits the copy table keeps.

`FinalCTA` is copied from `landing/FinalCTA.tsx` with two changes:

- it accepts the strand's terminal node as a child (a `position: relative` wrapper with an absolutely positioned node at the CTA button's edge), so the line visibly ends in the button rather than near it;
- its existing `py-24 md:py-36` and dark full-bleed band are **kept** — §4 calls it "the only card-free closer, and it works".

Everything else about it — copy, `MagneticButton`, the Enquire wiring — is unchanged. **Do not redesign it in this task**: §11.3's `MagneticButton` rework (Motion springs replacing the hand-rolled physics) is Stage 3's, and this stage only terminates the strand in it.

- [ ] **Step 4: Run the tests and the gate**

```bash
npx vitest run src/components/educraft/acts/ && npx tsc --noEmit && npm run lint && npm run test && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/educraft/acts/Doors.tsx src/components/educraft/acts/Doors.test.ts src/components/educraft/acts/FinalCTA.tsx
git commit -m "feat(acts): Act 4 — three doors, and the strand's end

Three columns separated by rules rather than three cards, each finally
rendering the headline and ctaLabel fields the retired component imported
and never used, with the benefits trimmed to the two that name something
concrete. FinalCTA is carried over with its dark band intact and the
strand terminating in the CTA node — doors.exit sits mid-band because the
line stops here."
```

---

## Task 11: The page, and the retirements

One commit that changes what renders: `page.tsx` goes from 12 sections to 5 acts, the seam contract gets its runtime call site, and ~20 files are deleted. It is the only task in the stage whose review can see the whole composition, and it is the one that needs `rm -rf .next`.

**Files:**
- Modify: `src/app/(site)/page.tsx`, `src/app/(site)/layout.tsx`
- Delete: the 11 `landing/*.tsx` files, `landing/FinalCTA.tsx`, `graphics/EcosystemGraphic.tsx`, `three/**`, `hooks/useSceneActive.ts`, `hooks/useScrollProgress.ts`, `hooks/useParallax.ts`, `motion/CursorProvider.tsx`

**Interfaces:**
- Consumes: everything the stage produced.
- Produces: the only runtime call site of `assertContinuity`, and the homepage's new section list.

- [ ] **Step 1: Rewrite `page.tsx`**

```tsx
import { pillars, studentJourneyStages } from '@/data/pillars';
import { programmes } from '@/data/programmes';
import { ACT_ANCHORS, VERTICAL_CHAIN } from '@/components/educraft/line/anchors';
import { assertForkSeam, assertRibbonSeam } from '@/components/educraft/line/frames';
import { assertContinuity } from '@/components/educraft/line/pathBuilders';
import Origin from '@/components/educraft/acts/Origin';
import FivePillars, { type Station } from '@/components/educraft/acts/FivePillars';
import Way from '@/components/educraft/acts/Way';
import Proof from '@/components/educraft/acts/Proof';
import Doors from '@/components/educraft/acts/Doors';

// The seam contract, checked where the acts are actually composed.
//
// Stage 1 shipped `assertContinuity` with the note that "no runtime module calls
// it, so it does not run at module load; Stage 2 is where the real call site is
// wired." This is that call site, and the three checks are the whole seam story:
// a vertical run between the acts whose strand leaves and enters at an edge, and
// the two arity changes either side of the walk — one strand becoming N, and N
// converging back into one. They throw on a broken seam, at build time.
assertContinuity(VERTICAL_CHAIN);
assertForkSeam(pillars.length);
assertRibbonSeam(pillars.length, studentJourneyStages.length);

/** One station per pillar, in pillar order — the walk's data, shaped for the act. */
const stations: Station[] = pillars.map((pillar) => {
  const programme = programmes.find((candidate) => candidate.pillarId === pillar.id);
  if (!programme) throw new Error(`No programme for pillar ${pillar.id} — the station would render without a link target.`);
  return {
    pillarId: pillar.id,
    pillarName: pillar.name,
    programmeName: programme.name,
    tagline: programme.tagline,
    highlights: programme.highlights.slice(0, 2),
    href: `/programmes/${programme.slug}`,
  };
});

export default function Home() {
  return (
    <>
      <Origin
        eyebrow='Global Digital Education Platform'
        h1Lines={['Five paths.', 'One learning ecosystem.']}
        lede='From language and inclusion to wellbeing, AI literacy, and competitive exam preparation — Educraft connects the pieces that help students move forward.'
        trustLine='Five verticals · One trust umbrella · Built for schools, families, and students'
        primaryLabel='Talk to us'
        secondaryLabel='Explore programmes'
        secondaryHref='/programmes'
        pillarCount={pillars.length}
      />
      <FivePillars stations={stations} pillarCount={pillars.length} stages={studentJourneyStages} />
      <Way />
      <Proof />
      <Doors />
    </>
  );
}
```

The `throw` on a missing programme is deliberate: a station without a link target renders a dead link silently, and `programmes.ts` is the file the runbook says to update when a pillar is added (§7.4). Fail loudly at render.

**Field names verified against `src/types/index.ts:80–98`** — `Programme` carries `slug`, `pillarId`, `name`, `tagline` and `highlights: Highlight[]`, and `Highlight` is `{ title: string; detail: string }` (`src/types/index.ts:37–40`). The mapping above needs no translation, and `Highlight` is imported rather than re-declared.

- [ ] **Step 2: Remove `CursorProvider` from the layout**

In `src/app/(site)/layout.tsx`, delete the import and the wrapper element. Both are on one line pair; the provider's only consumer in the repository is this file (§13 item 1, resolved for retirement). Every other site route loses it too — that is the ruling's intent, and it is the reason this is called out rather than folded in silently.

- [ ] **Step 3: Delete the retired files**

```bash
git rm src/components/educraft/landing/Hero.tsx \
       src/components/educraft/landing/Ecosystem.tsx \
       src/components/educraft/landing/ProgrammeExplorer.tsx \
       src/components/educraft/landing/WhyDifferent.tsx \
       src/components/educraft/landing/StudentJourney.tsx \
       src/components/educraft/landing/ProgrammeDeepDive.tsx \
       src/components/educraft/landing/Impact.tsx \
       src/components/educraft/landing/AudienceEntryPoints.tsx \
       src/components/educraft/landing/Methodology.tsx \
       src/components/educraft/landing/Testimonials.tsx \
       src/components/educraft/landing/InsightsTeaser.tsx \
       src/components/educraft/landing/FinalCTA.tsx \
       src/components/educraft/graphics/EcosystemGraphic.tsx \
       src/components/educraft/motion/CursorProvider.tsx \
       src/hooks/useScrollProgress.ts \
       src/hooks/useParallax.ts
git rm -r src/components/educraft/three
```

Then find and remove the two files whose paths this plan does not pin:

```bash
grep -rn "useSceneActive" src/ | head
```
Delete `useSceneActive`'s file (it lives under `hooks/` or `three/` — §5 says it is used only inside `three/`, so it may already be gone with the tree), and confirm nothing else imported the deleted modules:

```bash
grep -rn "landing/\|EcosystemGraphic\|CursorProvider\|useScrollProgress\|useParallax\|three/" src/ --include="*.ts*" | grep -v "^src/components/educraft/three/"
```
Expected: **no hits.** Any hit is a file that must be repointed before the gate, and a hit outside this list is a finding — report it rather than deleting the import.

- [ ] **Step 4: Clear the build cache, then run the gate**

```bash
rm -rf .next
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
**Check that no dev server is running first** — a dev server whose `.next` is deleted serves 404s until restarted, and that is a recorded incident in this repo, not a precaution. The build must produce the same route table as before (50 entries by the tree's own counting; the number §5 and Stage 1's exit criteria disagreed about — the *invariance* is what matters, and no route file changes here).

- [ ] **Step 5: Commit**

```bash
git add src/app/(site)/page.tsx src/app/(site)/layout.tsx
git commit -m "feat(site): the homepage is five acts

12 sections become Origin, Five Pillars, Way, Proof and Doors, and the
seam contract gets the runtime call site Stage 1 left for this stage:
assertContinuity over the vertical chain, plus the fan and the
convergence either side of the walk.

Retired: the 11 landing sections, FinalCTA's old home, EcosystemGraphic,
the three/ WebGL tree (11 files, not the 13 §5 claims), useSceneActive,
useScrollProgress, useParallax, and CursorProvider — the last of which
also leaves the shared layout, so every site route loses it.

No route is deleted."
```

---

## Task 12: `?calibrate=1`, and the stage's cross-cutting verification

§10.3: the overlay "turns visual QA from *'it felt off'* into *'at station 3 the strand reads 0.62'* — a report that can be acted on." It exists because the assistant cannot see the page, so the owner's pass is the only visual verification the project has, and a number travels where an impression does not.

This task also lands the two cross-cutting checks that only make sense once all five acts exist.

**Files:**
- Create: `src/lib/calibrate.ts`, `src/lib/calibrate.test.ts`
- Create: `src/components/educraft/acts/Calibrate.tsx`
- Modify: `src/app/(site)/page.tsx` (mount the overlay), the acts (report their state)

**Interfaces:**
- Consumes: `branchFor` (Task 3), `drawAt` (`line/station.ts`).
- Produces: `isCalibrateEnabled(search: string): boolean`, `formatCalibration(state: CalibrationState): string[]`, `reportCalibration(state: CalibrationState): void`, `subscribeCalibration(listener): () => void`, and the `CalibrationState` type.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  formatCalibration,
  isCalibrateEnabled,
  reportCalibration,
  subscribeCalibration,
  type CalibrationState,
} from './calibrate';

const STATE: CalibrationState = {
  branch: 'desktop',
  progress: 0.6212,
  station: 3,
  drawn: 0.5812,
};

describe('isCalibrateEnabled', () => {
  it('is off unless the parameter is exactly 1', () => {
    expect(isCalibrateEnabled('')).toBe(false);
    expect(isCalibrateEnabled('?foo=bar')).toBe(false);
    expect(isCalibrateEnabled('?calibrate=0')).toBe(false);
    expect(isCalibrateEnabled('?calibrate=1')).toBe(true);
    expect(isCalibrateEnabled('?theme=dark&calibrate=1')).toBe(true);
  });
});

describe('formatCalibration', () => {
  it('reports what a visual pass cannot say out loud', () => {
    // Labels are padded to a fixed 8-character column, so the values do not
    // jitter sideways as a live overlay's numbers change width.
    expect(formatCalibration(STATE)).toEqual([
      'branch  desktop',
      'walk    0.62',
      'station 3',
      'drawn   0.58',
    ]);
  });

  it('rounds to two decimals, the same precision pathFor uses', () => {
    // More precision is noise: a scrub position is read by eye against a
    // viewport, and 0.6212 vs 0.62 is not a distinction anyone can act on.
    expect(formatCalibration({ ...STATE, progress: 0.999 }).at(1)).toBe('walk    1.00');
    expect(formatCalibration({ ...STATE, drawn: 0 }).at(3)).toBe('drawn   0.00');
  });

  it('reports the station it is given, without re-deriving it', () => {
    // The bucketing belongs to the reporting act, which has `pillarCount` and
    // the live progress; `formatCalibration` has neither. What it must not do is
    // silently clamp or round the index — an overlay that disagreed with the
    // act about which station is active would be worse than no overlay.
    expect(formatCalibration({ ...STATE, station: 9 }).at(2)).toBe('station 9');
  });
});

describe('the calibration channel', () => {
  it('publishes to subscribers', () => {
    const seen: CalibrationState[] = [];
    const stop = subscribeCalibration((state) => seen.push(state));
    reportCalibration(STATE);
    stop();
    reportCalibration({ ...STATE, progress: 0.1 });
    expect(seen).toEqual([STATE]);
  });

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    subscribeCalibration(listener)();
    reportCalibration(STATE);
    expect(listener).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

```bash
npx vitest run src/lib/calibrate.test.ts
```
Expected: **FAIL** — `Cannot find module './calibrate'`.

- [ ] **Step 3: Write `calibrate.ts`**

A pure formatter plus a minimal publish/subscribe pair. **No DOM, no React, no `window` at module scope** so it stays testable in the node environment — the acts decide whether to report, and only after checking `isCalibrateEnabled(window.location.search)` inside an effect.

```ts
/**
 * The `?calibrate=1` channel (spec §10.3).
 *
 * Dev-only: the overlay is not rendered in production and the acts do not
 * report there, because the check is made once per act inside an effect. The
 * formatting is pure and pinned by test, because the overlay's output is the
 * only thing that carries a visual pass back from a machine the assistant
 * cannot see.
 */

export type CalibrationState = {
  branch: ScrollBranch;
  /** Walk scrub progress, 0..1. */
  progress: number;
  /** The station the walk is on — bucketed by the reporting act, not here. */
  station: number;
  /** Fraction of the active segment drawn, from `drawAt`. */
  drawn: number;
};
```
with the implementation as tested. Note in the module docstring that `formatCalibration`'s label column is fixed-width (8 characters) so the overlay's lines do not jitter as values change — that is a real readability property for a live overlay, and it is why the strings are padded rather than concatenated.

- [ ] **Step 4: Write `Calibrate.tsx` and mount it**

A client component that returns `null` unless `process.env.NODE_ENV !== 'production'` **and** `isCalibrateEnabled(window.location.search)`, subscribes on mount, and renders the formatted lines in a fixed-position `<pre>` with `pointer-events-none`. Mount it in `page.tsx` beside the acts.

**The two acts that own a scrub report; the others do not.** Only `Origin` (the fork's pin) and `FivePillars` (the walk) have a scrubbed `onUpdate` to report from — `Way`, `Proof` and `Doors` draw in view with no progress to publish, so they are not modified by this task. `FivePillars` reports `{ branch, progress: self.progress, station: Math.min(Math.floor(self.progress * pillarCount), pillarCount - 1), drawn: drawAt(self.progress, station, pillarCount) }`, and `Origin` reports its own progress with `station: 0`. **Report only when enabled**: both acts read the flag once in their `useGSAP` setup and skip the call entirely otherwise, so no work happens on a normal visit.

Note the `Math.floor(...)` clamp: at `progress === 1` the derived index is exactly `pillarCount`, which is out of range — `drawAt` clamps internally, but the *reported* station must be clamped too or the overlay names a station that does not exist.

- [ ] **Step 5: Add the cross-cutting checks**

Two assertions that only make sense now:

1. **Every act pairs its GSAP with the reduced-motion query.** A source scan beside the existing `registerPlugin` scan in `gsap.test.ts`:

```ts
  it('pairs every act’s GSAP setup with the reduced-motion query', () => {
    // §9: once GSAP drives, CSS can no longer guarantee reduced motion, so every
    // setup must render the final state under the query. This is a scan because
    // the effects themselves are unreachable from the node test environment
    // (ADR 0007) — it is a weaker guarantee than a test of behaviour, and it is
    // the strongest one available here.
    const acts = fs.readdirSync('src/components/educraft/acts').filter((f) => f.endsWith('.tsx'));
    expect(acts.length).toBeGreaterThan(0);
    for (const file of acts) {
      const source = fs.readFileSync(`src/components/educraft/acts/${file}`, 'utf8');
      if (!source.includes('useGSAP')) continue;
      expect(source, file).toContain('REDUCED_MOTION_QUERY');
    }
  });
```

2. **No act renders a card.** §14's definition of done is "no `card-surface` on the landing page", and the acts are the landing page:

```ts
  it('renders no card-surface anywhere on the landing page', () => {
    for (const file of acts) {
      const source = fs.readFileSync(`src/components/educraft/acts/${file}`, 'utf8');
      expect(source, file).not.toContain('card-surface');
    }
  });
```

- [ ] **Step 6: Run the tests and the gate**

```bash
npx vitest run src/lib/calibrate.test.ts src/lib/gsap.test.ts && npx tsc --noEmit && npm run lint && npm run test && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/calibrate.ts src/lib/calibrate.test.ts src/components/educraft/acts/Calibrate.tsx src/components/educraft/acts/*.tsx src/app/(site)/page.tsx src/lib/gsap.test.ts
git commit -m "feat(calibrate): ?calibrate=1, and the stage's cross-cutting checks

The overlay reports branch, walk progress, active station and drawn
fraction, so the owner's visual pass can carry numbers back from a page
the assistant never sees. Dev-only and off by default.

Two scans that only make sense with all five acts present: every act's
GSAP setup pairs with the reduced-motion query, and no act renders a
card-surface."
```

---

## The owner's QA checklist

§10.5 requires a numbered list, per breakpoint, per theme, and under reduced motion. This is the only verification the project has for anything visual, and the assistant cannot perform any of it.

**Desktop (≥1024px), light and dark**

1. The strand enters the hero top-right, descends, and forks into five branches that land **exactly** on the five seed nodes — no branch stops short or crosses another.
2. The fork happens while the hero is pinned; the copy lifts and fades but never disappears entirely, and scroll is never blocked.
3. Navigating away mid-pin (scroll up fast, then down) leaves no stuck transform and no gap where the hero should be.
4. The walk translates horizontally one station at a time, and the strand's **drawn tip arrives at each station exactly as that station reaches the middle of the viewport** — no station is met by a segment that has not begun, and none is passed by one that finished early.
5. The rail buttons move the page to their station; clicking station 5 from station 1 lands on station 5, not near it.
6. Tab reaches the rail; Enter moves the walk; the focus ring is visible on every station link and button.
7. The walk's transition into the ribbon reads as one line: five strands converge into one, and the six journey stages sit on it.
8. Act 2's strand is continuous top to bottom, with the ten nodes (five differentiators, five method steps) sitting on it.
9. Act 3's axis is horizontal, its four ticks are evenly placed, and the stat row shows **three** audiences with no `Partners`.
10. Act 4's strand converges to the CTA node and terminates *inside* the button, not beside it.
11. At no point does any section show a card, a boxed panel, or a `card-surface`.
12. The navbar's scroll state changes after Act 0 and stays solid for the rest of the page.
13. Total page height is about 11.5 screens — not the ~20 it was.

**Tablet (640–1023px), light and dark**

14. The fork happens, unpinned — no jump, no half-drawn strand left on screen.
15. The walk is a **stacked vertical spine**: no horizontal track, no pin, no sideways scroll. Stations read top to bottom.
16. Nothing scrolls horizontally by accident; the page's vertical scroll never sticks.

**Mobile (<640px), light and dark**

17. The walk is a horizontal swipe with snap; vertical page scroll always works, including mid-swipe.
18. The fork is the simplified vertical draw — one strand, not five.
19. Nothing overlaps: the enquiry button, the navbar, and the rail do not cover each other.
20. Tap targets for the rail dots and the doors are at least 44px.

**Reduced motion (any width), light and dark**

21. **No pin anywhere.** The page scrolls like a document, top to bottom.
22. Every strand is fully drawn on arrival — nothing animates in, and nothing is left invisible.
23. The walk is a vertical, stacked, **identical DOM order** to the normal page: same words, same sequence, no element duplicated or missing.
24. Toggling the OS setting mid-page and reloading shows the reduced state immediately, with no flash of the animated one.

**Both themes, every width**

25. The enquiry modal opens from the hero's `Talk to us`, from the navbar, from the floating button, and from `FinalCTA` — and `Explore programmes` navigates instead.
26. Nothing on the page is legible only by colour; every pillar accent is next to its label.

---

## Self-Review

**Spec coverage** — every Stage 2 obligation in `spec.md` maps to a task:

| Spec section | Task |
|---|---|
| §2 "One Line" — the strand as connective tissue | 2, 5, 6, 7, 8, 9, 10 |
| §3.1 Line system, one `LineStage` per act, entry/exit anchors | 1 (contract), 2 (frames) |
| §3.2 engine split (GSAP scrubbed/pinned, Motion discrete) | 5 (`MaskLine` + `Origin`), 6 (the walk) |
| §3.3 RSC boundary — client shells, server copy | 5 (`ActSection`), 8, 9, 10 |
| §3.4 target file layout | 5–10 (`acts/`, `motion/MaskLine.tsx`); `lib/calibrate.ts` in 12 |
| §4 Act 0 Origin (heights, fork, copy fix) | 5 |
| §4 Act 1 Five Pillars (walk 400vh, rail, ribbon 110vh) | 6, 7 |
| §4 Act 2 Way (why + how as one argument) | 8 |
| §4 Act 3 Proof (axis, stat fix, pull-quote) | 9 |
| §4 Act 4 Doors + close | 10 |
| §5 what retires and where the content goes | 11 (deletions); copy table (destinations) |
| §8 responsive contract | 3 (queries), 6 (the three branches), 11 |
| §9 accessibility and reduced motion | 6 (CSS neutralisation + the `draw` contract), 12 (the scan) |
| §10.2 timing from the tokens | 5 (stagger, hero duration), 7 (reveal), 6 (SCRUB) |
| §10.3 `?calibrate=1` | 12 |
| §10.5 the human pass | the QA checklist above |
| §14 definition of done — 5 acts, no cards, ~11.5 screens, continuity, strand to CTA | 1–11 |

**Deliberately deferred to later stages** (not gaps): shadcn and every interactive component redesign (§11.3), the four handoff routes (§12), R3F removal and the React-pin relaxation (§11.2), `/impact`'s half of the §1.3 fix and its stat de-duplication (§12), `MagneticButton`'s Motion springs (§11.3), and the `pillarAccentVar` graphic-role migration (Stage 3's, measured at 5 files).

**Type consistency:** `Station` is defined once in `FivePillars.tsx` and imported by `page.tsx`; `RibbonStage` is a named export from the same file; `CalibrationState` is defined in `lib/calibrate.ts` and consumed by the acts and the overlay; `ActSectionProps`/`MaskLineProps`/`OriginProps`/`WayProps`/`ProofProps` are each declared beside their component; `walkFrame`/`ribbonFrame` return types (`WalkFrame`/`RibbonFrame`) are consumed only through their fields, never re-declared; `stationScrollTarget(index, pillarCount, pinStartY, pinRangeY)` keeps its argument order everywhere.

**Corrections applied during this plan's own review.** Thirteen, in three groups. The first three were found while drafting the acts; the next five by reading the finished plan back against the code it cites; the last five when the owner's review of the walk's wiring exposed a disagreement between two denominators — that group is the one worth reading, because the largest of them would have shipped a walk whose rail buttons land 40vh from the station they name.

1. **A speculative module was removed, not annotated.** An earlier draft gave Task 3 an `acts/layout.ts` mapping each branch to `{ pinned, horizontal, snap, … }`. Writing the acts showed nothing would consume it: the pin is a `gsap.matchMedia()` branch and the three layouts are Tailwind's `sm:`/`lg:` variants — the ladder `BREAKPOINTS` is aligned to, and the reason Stage 1 renamed that key. It was replaced by the two facts the acts *do* consume, one of which (`branchFor`) finally gets its caller. Had it shipped, the gate-integrity lens would have been right to call it dead weight.
2. **`Station.highlights` keeps its structure.** The draft typed it `readonly [string, string]`, which would have forced `page.tsx` to flatten `Highlight`'s own `{ title, detail }` shape and lose the copy's structure. It is `readonly Highlight[]`, sliced to two, and `Highlight` is imported from `@/types` rather than re-declared.
3. **The `perStationVh(6) === 66.67` assertion was deleted, not rounded.** The function returns `400/6` — `66.66666666666667` — so the draft asserted a value nothing produces. The cross-check against `drawAt` is the assertion that carries meaning.
4. **The fork test extracted the wrong token.** `[, , , , , , endY]` picks a path's *second control point x*; a `fork` path's tokens are `M x y C c1x c1y c2x c2y x1 y1`. Now `.at(-1)` and `.at(-2)`, which also pin that the outermost branch lands on the outermost seed.
5. **`&ldquo;` cannot be asserted in rendered markup.** JSX entities compile to the character, so the HTML carries U+201C, not the entity. The assertion is on the character.
6. **The overlay's column padding was inconsistent.** The test expected a three-space gap where `padEnd(8)` produces two. Fixed, and the fixed-width column is now stated as the *reason* rather than left as an accident of the expected strings.
7. **The walk's track classes were in the wrong mobile-first order.** Base classes apply at *every* width, so a horizontal base has to be re-stated at `lg:`, not only undone at `sm:`. The list is now `w-[var(--track-w)] flex-row sm:w-full sm:flex-col lg:w-[var(--track-w)] lg:flex-row`, and the custom property is cast (`as CSSProperties`) because React's `CSSProperties` has no index signature.
8. **Task 6's import list was incomplete** — `Eyebrow`, `perStationVh`, `CSSProperties` and `Highlight` are all used by the code beneath it.

**Found in review of the walk's wiring, after the first draft was complete:**

9. **The tween and the draw/rail axes disagreed by `0.5/n` of the pin.** `drawAt`'s slices, `walkFrame`'s N equal segments and `stationScrollTarget` all place station `i` at `i/n` of the walk; the draft's tween, `0 → -(N−1)w`, placed it at `i/(N−1)`. At five pillars the ends differ by **10% of the pin — 40vh** — so the rail would land 40vh from the station it names, and the strand would draw one station's segment while a different station was centred. Fixed by the **N-viewport tween**, which is the resolution Stage 1's ruling had already offered when it corrected `drawAt` ("change Task 7's tween from (N−1) to N steps"). It also makes each dwell travel exactly one viewport, which the `(N−1)` model did not. **The alternative — slicing on `N−1` — is impossible**, ruled out by Stage 1's proof that the last station's window would fall outside the walk and its segment would never draw at any progress.
10. **`spec.md` §4 Act 1's tween formula is superseded by that fix**, so Task 6 corrects the spec rather than leaving the authority false — the same call Stage 1 made on two of the spec's own rows ("fixing the code while leaving the authority false would hand the next stage's planner a contradiction").
11. **The rail's pin-start derivation was wrong, and no report had flagged it.** It read `getBoundingClientRect().top + scrollY`. *Inside* the pinned range the pinned element is fixed to the top of the viewport, so that expression returns the current scroll position rather than the pin's start — every click would overshoot by however far into the walk the reader already was. It now reads the ScrollTrigger's own `start`, published in `onRefresh`.
12. **The pin range was computed in two places** — the pin's `end` and the rail's denominator. Now one tested function, `walkPinRangePx`, with an assertion that the rail's last target is 80% of it at five pillars.
13. **Task 7 instructed a second call site** for `assertRibbonSeam` in the act's module body, contradicting Task 11's single call site in `page.tsx` — and misplacing `assertForkSeam`, which checks the fork and belongs to `Origin`. Removed.

**One assumption this plan could not verify without running code**, stated so the implementer checks it rather than assuming: **`motion/react` is the installed package's React entry.** Stage 1 installed `motion` 13.2 with zero import sites, so nothing in the repository confirms the path. Task 5's Step 4 says to check `node_modules/motion/package.json`'s `exports` first.

**Placeholder scan:** clean — no TBD/TODO/"similar to Task N"; every code step carries real code, every run step an exact command and expected result. Two strings were owner gates rather than placeholders (D3) — the Act 1 rail's sr-only label and the visible seed-content line in Act 3 — and **both were approved on 2026-09-13 exactly as written**, so nothing in this plan is waiting on a decision.

---

## Stage 2 exit criteria

- `npx tsc --noEmit && npm run lint && npm run test && npm run build` all pass, with `.next` cleared after the deletions.
- The homepage renders **five acts** and no `card-surface`; the route table is unchanged and no route is deleted.
- `assertContinuity`, `assertForkSeam` and `assertRibbonSeam` are called at render from `page.tsx` — the call site Stage 1 left open.
- Every act's strand is drawn in a frame that makes its source coordinates verbatim: unit boxes for the vertical acts, one-unit-per-viewport for the walk. **The 0.33%/0.26px failure is not reproducible**, because no caller passes the default `1200×800` frame.
- `drawAt` and `stationScrollTarget` have real callers, and the rail's segments draw per station.
- Reduced motion renders a plain vertical document, every strand fully drawn, identical DOM order — with the walk's neutralisation pinned in CSS by test.
- `?calibrate=1` reports branch, progress, station and drawn fraction; it renders nothing in production.
- The retired files are gone, including the WebGL tree, and nothing imports them.
- The owner's QA checklist above is completed, and everything it cannot settle is recorded in `state.md`.

---

## Documentation obligations

This stage invalidates claims in six places. Each is a defect of the kind this repo has shipped before — a document asserting something the code no longer does — so they are listed with the task that must carry the edit, not left to the close.

| Document | Claim that becomes false | Fix in |
|---|---|---|
| `docs/projects/landing-redesign/stages/README.md` | The **⚠ join warning**: "The Line layer has no defined join — Stage 2 owns the coordinate system", and "`assertContinuity` cannot be wired as it stands" | **Task 2**, whose commit makes it false. Replace with what the join is (`frames.ts`, viewBox selection) and what the seam rule became |
| `docs/decisions/0006-coordinate-frames-act-local-and-track-local.md` | Records that "how they compose on screen is a layout decision owned by the Stage 2 caller" — true, but it now has an answer | **Task 2**: append the outcome, do not rewrite the decision |
| `docs/projects/landing-redesign/spec.md` | §4 Act 1's tween, "`x` tweened `0 → -(100 × (N−1))vw`" — superseded: that formula puts station `i` at `i/(N−1)` of the walk, while `drawAt`'s slices, `walkFrame`'s segments and `stationScrollTarget` all put it at `i/N` | **Task 6**, whose tween makes it false |
| `docs/design/motion.md` | "`src/lib/gsap.ts`… not yet created" was fixed at Stage 1 close; check for anything about the acts being absent | **Task 5** (first act) |
| `docs/surfaces/homepage.md` | Describes 12 sections | **Task 11** |
| `docs/projects/landing-redesign/state.md` | "Stage 2 is neither planned nor started"; the "do not get wrong" list's join entries | **At close** (per `run-a-stage`) |
| `docs/platform/blockers.md` | Seed testimonials are a launch blocker — Act 3 leans on them harder, and the visible warning is the mitigation, not a resolution | **Task 9**, one line |

**Carried forward, not forgotten** (out of scope by D4, and each needs a home in Stage 3's planning inputs):

- **`/impact`'s half of the §1.3 fix.** The literal `4 Audiences served — Schools · Parents · Students · Partners` also lives at `src/app/(site)/impact/page.tsx:61`, and §14 asks for the fix in both places. Stage 2 fixes the landing page; Stage 3 owns that route.
- **`/impact`'s stat de-duplication** (§12: "the landing page carries three headline stats, `/impact` carries the full ledger — the two must not restate each other"). This stage does not touch `/impact`, so the duplication the spec measured is still live.
- **The spec's own two stale counts** (`Five X. One Y.` ×5 vs the tree's 8; `Portfolios, dashboards` ×4 vs 3), recorded in the copy table so the next reader does not re-derive them.
- **`motion`'s first import** is Task 5's, and `motion/react` must be verified against the installed package's `exports` before it is assumed.

**ADRs this stage expects at close** (per `run-a-stage`, rulings become durable decisions): the seam rule re-specification (supersedes the premise `assertContinuity` shipped with), the join as viewBox selection (the outcome 0006 deferred), and the ribbon's convergence being symbolic rather than a scale-out of the walk's own nodes.
