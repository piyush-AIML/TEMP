# Landing Redesign — state

Last updated: 2026-09-12 · branch `landing-redesign` · spec [`spec.md`](spec.md) · stage plan [`stages/stage-1.md`](stages/stage-1.md)

## 1. Where we are

**Stage 1 (Foundation): tasks 1–5 of 7 done, reviewed, committed. Tasks 6–7 not started.** Work was
paused after Task 3 to build the knowledge base (done); Tasks 4 and 5 followed on 2026-09-12.
Stages 2–4 are *designed* (`spec.md` §2–§12) but **not planned** — no stage plan exists yet.

> **Planning a future stage? Read [`stages/README.md`](stages/README.md) first.** It is the stage
> index and holds each unplanned stage's **planning inputs**: what is already decided (with spec
> pointers), what is deliberately still open, the interfaces the previous stage leaves behind, and
> what must be true before the stage can be planned at all. It exists so planning a stage is
> *planning*, not re-deriving.

| # | Task | State | Commits |
|---|---|---|---|
| 1 | Vitest harness + WCAG contrast maths | done | `ef4944d` `64ba6ee`, fixes `571a5ac` `00273f7` |
| 2 | Palette v2 token migration | done | `45bbcd7`, fixes `421f164` `244aa50` |
| 3 | Pillar registry + derived `PillarId` | done | `ef9f14f`; ride-along fix `9d3027d` |
| 4 | GSAP + Motion installed, `src/design/scroll.ts` | done | `12b1525` `d1be7db` `550f074` `a7cc303` `569bfa3` |
| 5 | Station geometry (`anchors.ts`, `station.ts`) | done | `4b3ca87`, fix `e54ae97` (one merged round) |
| 6 | Path builders + `assertContinuity` | **next** | — |
| 7 | `src/lib/gsap.ts` + `LineStage` | not started | — |

Stage 2 = the five acts (Origin, Five Pillars, Way, Proof, Doors) · Stage 3 = components + shadcn +
the four handoff routes · Stage 4 = R3F removal + React pin relaxation. Stage 1 changes **no page
structure** — the homepage still renders its 12 sections, with new colours.

## 2. Immediate next action

Task 6 (`## Task 6` in [`stages/stage-1.md`](stages/stage-1.md)), brief at
`.superpowers/sdd/Landing-Redesign-Stage-1-Implementation-Plan/task-6-brief.md` — creates
`src/components/educraft/line/pathBuilders.ts` (`pathFor(from, to, shape)`,
`assertContinuity(acts)`) plus its test. **Verify the brief is not stale before dispatching** — the
same diff against the plan section that was run for Task 5 (it was byte-identical there).

Interfaces Task 5 leaves for it, all now pinned by tests: `Anchor`, `ACT_ANCHORS`, `ACT_ORDER`,
`ActName` from `anchors.ts`; `stationPositions(n)`, `drawAt(progress, index, n)` from `station.ts`.
Task 6's Consumes line names `Anchor` and `ACT_ANCHORS` (`stage-1.md:1794`).

## 3. Blocked

Nothing blocks Task 6 — Stage 1 needs no owner decision. Owner-side and open, but not blocking: all
browser/visual QA (the assistant never launches a browser, which is why the dev-only `?calibrate=1`
overlay reports numbers); seed testimonials remain a launch blocker this design leans on harder
([`platform/blockers.md`](../../platform/blockers.md)); `Course.vertical` cannot express a course outside
the five pillars (`spec.md` §7.1 — deferred product decision).

## 4. Do not get wrong

- **The loop is four commands now:** `npx tsc --noEmit && npm run lint && npm run test && npm run build`. Task 1 added the Vitest leg; three of four is not green.
- **Palette hexes are measured — copy them verbatim, never re-derive or "improve" them.** `src/design/colors.test.ts` enforces AA, and its token-against-token pair assertions (not only token-vs-canvas) are what caught a 2.64:1 button.
- **Tailwind 4 needs literal class names** — `bg-ec-${x}` emits no CSS; every pillar→class mapping is written out.
- **GSAP ownership:** once GSAP drives, CSS can no longer guarantee reduced motion, so every setup pairs with `gsap.matchMedia()` rendering the final state; and never let GSAP and Motion own the same property of the same element.
- `rm -rf .next` after a file delete or rename — **never while a dev server is running** (a recorded incident, not a precaution).
- **`spec.md` §7.2 is the pre-Task-3 diagnosis, not a to-do list.** Tasks 1–3 already did the fix — derived `PillarId`, `pillarAccent` collapsed with back-compat re-exports, derived `COURSE_VERTICALS`, `programmeColors` constrained to `Record<PillarId, PillarAccent>`. Adding a pillar now follows §7.4's runbook, which carries the dry-run's actual output.
- `src/app/(site)/about/page.tsx` carries formatting-only churn in the working tree (quote style, JSX re-wrapping). It is out of scope here — do not sweep it into a Stage 1 commit.
- **`src/design/scroll.ts` is fully pinned to spec literals.** If a later task changes a `motion.ts` token or a breakpoint constant and the suite goes red, the spec needs updating too — that coupling is deliberate, not a test to relax.
- **The walk's draw is `clamp01(pillarCount * progress - index)`, with `index` clamped to `[0, pillarCount − 1]`.** The `(pillarCount − 1)` spacing was considered and is impossible — the last station's window falls outside the walk, so its segment never draws at any progress. `Math.floor(progress * n)` is safe to use as the active-station index as a result. Do not "correct" the spacing back toward the spec's tween: the tween describes track translation, not station activation.
- **The anchors' coordinate frame supersedes the plan's.** `anchors.ts` states x/y as **act-local**; the plan's Task 5 code block (`stage-1.md` ~1690) still carries the superseded sentence ("x in track-widths (0 = left edge of act 0 …)") and it also carries the values themselves — `origin.enter` is `{ x: 0.72, y: 0 }` there. `anchors.test.ts` asserted those values "appear in no spec, plan or design doc", which was **false**; it now records the truth — the values are invented for the design and that block carries them, but no design document *fixes* them. `pathFor` does **not** own a transform between the act-local anchors and the track-local station x: it is frame-agnostic (both points arrive already in one frame), and the vertical strand segments and the horizontal rail are different geometry rather than one frame needing conversion. How they compose on screen is a Stage 2 layout decision, and whether the strand reads as one line at real viewports is still the owner's visual QA.
- **The anchor values are invented, not specified.** No design document fixes `0.72` / the `0.5` baseline — they came from the Task 5 brief. Pinning them makes a *change* visible; it does not make them *correct*. They need the owner's eye.
- **`vitest.config.mts`'s `include: ['src/**/*.test.ts']` silently drops `.test.tsx`** — reconfirmed with a deliberately failing probe that left the suite green. Task 7's brief creates no component test file, so nothing pending is skipped today, but any `.test.tsx` added later would never run. Needs a `jsdom` decision.
- **`stationPositions(Infinity)` throws `RangeError`** (loud, unreachable from `pillars.length`), and the `pillarCount <= 0` guard there was removed as unobservable — `Array.from` already coerces the length.
