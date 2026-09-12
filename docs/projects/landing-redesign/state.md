# Landing Redesign — state

Last updated: 2026-09-12 · branch `landing-redesign` · spec [`spec.md`](spec.md) · stage plan [`stages/stage-1.md`](stages/stage-1.md)

## 1. Where we are

**Stage 1 (Foundation): tasks 1–3 of 7 done, reviewed, committed. Tasks 4–7 not started.** Work was
paused after Task 3 by choice, to build this knowledge base. Stages 2–4 are *designed* (`spec.md`
§2–§12) but **not planned** — no stage plan exists for them yet.

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
| 4 | GSAP + Motion installed, `src/design/scroll.ts` | **next** | — |
| 5 | Station geometry (`anchors.ts`, `station.ts`) | not started | — |
| 6 | Path builders + `assertContinuity` | not started | — |
| 7 | `src/lib/gsap.ts` + `LineStage` | not started | — |

Stage 2 = the five acts (Origin, Five Pillars, Way, Proof, Doors) · Stage 3 = components + shadcn +
the four handoff routes · Stage 4 = R3F removal + React pin relaxation. Stage 1 changes **no page
structure** — the homepage still renders its 12 sections, with new colours.

## 2. Immediate next action

Task 4 (`## Task 4` in [`stages/stage-1.md`](stages/stage-1.md)) — in order:

1. `npm install gsap @gsap/react motion` — expect gsap 3.15.x, `@gsap/react` 2.x, motion 13.2.x, no peer warnings.
2. TDD: write `src/design/scroll.test.ts` first; watch it fail on the unresolved `./scroll` import.
3. Implement `src/design/scroll.ts` — `BREAKPOINTS`, `WALK_BASE_VH` / `WALK_MIN_VH` / `WALK_MAX_VH`, `perStationVh(n)`, `branchFor(width)`, `SCRUB`, `CEILINGS`.
4. Run the four-command loop, then one commit with the plan's message.

## 3. Blocked

Nothing blocks Task 4 — Stage 1 needs no owner decision. Owner-side and open, but not blocking: all
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
