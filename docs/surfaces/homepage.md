How the Educraft homepage (`/`, served by `src/app/(site)/page.tsx`) is built: its **five acts**, the one strand that threads them, and where each piece of the system lives.

**Where the code lives:** the acts are in `src/components/educraft/acts/` — `Origin` (Act 0) · `FivePillars` (Act 1) · `Way` (Act 2) · `Proof` (Act 3) · `Doors` (Act 4), with `ActSection` as their shared frame and `FinalCTA` as the closer Act 4 renders. The geometry they share is in `src/components/educraft/line/`: `anchors.ts` (the entry/exit contract), `frames.ts` (the viewBox policy and the walk/ribbon frames), `pathBuilders.ts` (`pathFor`, `polylinePath`, `assertContinuity`), `station.ts` (the walk's calibration) and `LineStage.tsx` (the renderer).

**The design of record** is `docs/projects/landing-redesign/spec.md` §4 (the five acts) — this page describes the implementation, not the design.

| Act | Component | What it is |
|---|---|---|
| 0 | `Origin` | The hero, copy verbatim, with the strand entering top-right. A **fork**: one strand becomes N, pinned 70vh on desktop, and the seed nodes land on the fold. Below `sm` the fan gives way to §8's single vertical fall. |
| 1 | `FivePillars` | The walk — N stations, pinned and scrubbed horizontally on desktop (one viewport of travel per station), native snap on mobile, stacked on tablet. Ends with the **ribbon**: the N strands converge into one, and the six journey stages sit on it. |
| 2 | `Way` | `WhyDifferent`'s ruled rows and `Methodology`'s five steps as one argument, with both as nodes on a single vertical strand. |
| 3 | `Proof` | The strand becomes a horizontal **evidence axis** with a tick per chain station; the stat row, one pull quote and two marginalia follow. Below `lg` the axis gives way to the plain vertical spine §8 asks for. |
| 4 | `Doors` | Three audience columns separated by hairline rules, then `FinalCTA`'s dark band, into which the strand terminates. |

## The rules that make it work

**The act's `<section>` is the strand's box.** Every vertical act's strand is positioned against its own section — `ActSection` takes a `line` prop and renders it as the section's first child, so an act cannot re-parent it into an inner container. This is not styling: `ACT_ANCHORS` is act-local, so `y = 0` must be the act's own top edge for a seam to be continuous on screen, and `assertContinuity` compares *fractions of each act's own box* — it cannot see a box. An act that renders its strand against a narrower container satisfies every assertion while the line stops short at the boundary. Three of the five acts shipped that way and it was the single largest defect of Stage 2.

**The seams run at module evaluation.** `page.tsx` calls `assertContinuity(VERTICAL_CHAIN)`, `assertForkSeam` and `assertRibbonSeam` at module scope, so a broken seam fails the *build* with the message naming both anchors.

**One writer per path.** The walk and the ribbon both animate `strokeDashoffset` on their own paths and on nothing else — the walk's `onUpdate` queries `[data-walk-rail]` and verifies it found exactly its own segment count. Two GSAP owners on one property is the failure mode `LineStage`'s docstring forbids, and it shipped once.

**The `overflow-hidden` rule is a general engineering constraint, not a per-act note:** an ancestor's `overflow-hidden` becomes the sticky element's scroll box, so a pinned section must keep section-level overflow visible and handle overflow only on the sticky inner element. `FivePillars` is the pinned act; its clip is on a *descendant* of the pinned section, which is what the rule prescribes.

**What is still open** (both are owner rulings, both recorded in `docs/projects/landing-redesign/state.md`): the ribbon's strand doubles back above five stages (R17), and Act 4's strand ends at the band's mid-band while the terminal node rides at the CTA — which is centred, so the two differ in **both** axes (R20).

**What was retired here:** the twelve sections in `src/components/educraft/landing/` — including the WebGL orbit hero and the whole `three/` tree, the SVG orbital `Ecosystem` map, and the 550vh `ProgrammeExplorer` — left in Stage 2 Task 11. The `/impact` stat block's `4 Audiences … Partners` defect is fixed in `Proof`; the `/impact` *page* still carried it as of that task, and it is Stage 3's.
