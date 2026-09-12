# Landing Redesign — state

Last updated: 2026-09-13 · branch `landing-redesign` · spec [`spec.md`](spec.md) · Stage 1 plan [`stages/stage-1.md`](stages/stage-1.md)

## 1. Where we are

**Stage 1 (Foundation) is COMPLETE — all 7 tasks done, reviewed and committed.** Work was paused after
Task 3 to build the knowledge base (done); Tasks 4–7 followed on 2026-09-12/13, and Stage 1 was closed
by a whole-branch review on 2026-09-13. **Stage 2 was planned on 2026-09-13 and is being executed** —
its plan is live at `.claude/plans/landing-redesign-stage-2.md`. Stages 3–4 are *designed*
(`spec.md` §2–§12) but **not planned**.

> **Planning a future stage? Read [`stages/README.md`](stages/README.md) first.** It is the stage
> index and holds each unplanned stage's **planning inputs**: what is already decided (with spec
> pointers), what is deliberately still open, the interfaces the previous stage leaves behind, and
> what must be true before the stage can be planned at all. It exists so planning a stage is
> *planning*, not re-deriving. **Read its ⚠ join warning before planning the strand** — Stage 1 left
> the Line layer's coordinate system undefined on purpose (R8), and assembling the three modules
> naively produces a 0.26px dot.

| # | Task | State | Commits |
|---|---|---|---|
| 1 | Vitest harness + WCAG contrast maths | done | `ef4944d` `64ba6ee`, fixes `571a5ac` `00273f7` |
| 2 | Palette v2 token migration | done | `45bbcd7`, fixes `421f164` `244aa50` |
| 3 | Pillar registry + derived `PillarId` | done | `ef9f14f`; ride-along fix `9d3027d` |
| 4 | GSAP + Motion installed, `src/design/scroll.ts` | done | `12b1525` `d1be7db` `550f074` `a7cc303` `569bfa3` |
| 5 | Station geometry (`anchors.ts`, `station.ts`) | done | `4b3ca87`, fix `e54ae97` |
| 6 | Path builders + `assertContinuity` | done | `b1282cb`, fixes `2acd873` `ad5142e` `1476b65` |
| 7 | `src/lib/gsap.ts` + `LineStage` | done | `7130610`, fixes `80ff7f0` `72a74ec` |

Stage 2 = the five acts (Origin, Five Pillars, Way, Proof, Doors) · Stage 3 = components + shadcn +
the four handoff routes · Stage 4 = R3F removal + React pin relaxation. **Stage 1 changed no page
structure** — the homepage still renders its 12 sections, with new colours.

## 2. Immediate next action

**Stage 2 is in progress — 3 of 12 tasks closed.** Task 1 (the anchor contract and the seam rule) →
`04b1702`; Task 2 (the join, `frames.ts`) → `048af65`; Task 3 (the two facts §8 leaves to JS) →
`f9e0919`. The live plan is `.claude/plans/landing-redesign-stage-2.md`; it moves into `stages/` when
the stage closes.

**Execution is a no-agent procedure as of 2026-09-13, on the owner's instruction.** No subagents run
and no skill drives the loop: the assistant implements, verifies in three phases (contract → claims →
mutation) and fixes, itself. See [`platform/execution.md`](../../platform/execution.md) and
[ADR 0010](../../decisions/0010-no-agent-execution.md). The two agent-driven predecessors are archived
verbatim at [`platform/archive/`](../../platform/archive/) and are one `cp` from being restored —
Tasks 1–2 ran under the three-lens regime and Task 3 under the tiered one, so all three regimes are
directly comparable on cost: **949k · 929k · 516k** per task.

Next action: **Task 4** — `LineStage`'s render-only mode and the frame override — per
`platform/execution.md`. **The stage is paused here at the owner's instruction.**


## 3. Blocked

Nothing blocks. Owner-side and open: all browser/visual QA (the assistant never launches a browser,
which is why the dev-only `?calibrate=1` overlay reports numbers); seed testimonials remain a launch
blocker this design leans on harder ([`platform/blockers.md`](../../platform/blockers.md));
`Course.vertical` cannot express a course outside the five pillars (`spec.md` §7.1 — deferred product
decision); and `--accent: #00b3b8` survives untouched in the shadcn contract, measuring **2.58:1**
against its own foreground — the hex this stage exists to retire, with no consumer today.

## 4. Do not get wrong

- **The loop is four commands:** `npx tsc --noEmit && npm run lint && npm run test && npm run build`. Task 1 added the Vitest leg; three of four is not green.
- **The Line layer has no defined join, and that is deliberate.** `LineStage` imports no geometry module. The frames are different *units*, not just different origins: `anchors.ts` is act-local 0..1, `stationPositions` x is track-widths (one per viewport, so `0..N−1`) and its y is viewport heights, and `pathFor` is frame-agnostic by R8 because the transform needs an act identity its signature never carries. Reconciling them into `LineStage`'s `viewBox` space is **Stage 2's job and nobody's current code**. Feeding `stationPositions(5)` straight through gives a rail at 0.33% of the default 1200-wide viewBox.
- **`assertContinuity` cannot be wired as it stands.** Driven with real geometry it throws a *false* alarm; called with no argument it re-validates a frozen literal against itself. It enforces `exit == enter` as values, but act-local those are each act's own edge, one act-band apart on screen.
- **`drawAt` and the spec's track tween disagree by (N−1)/N.** There is **no** mapping where a segment draws as the walk arrives at it — contradicting `station.ts`'s own docstring. 5 stations make 4 gaps; `drawAt` models 5 slices. The `(pillarCount − 1)` spacing was considered and is impossible; the shape `clamp01(pillarCount * progress − index)` is *forced*. Do not "correct" it back toward the tween: the tween describes track translation, not station activation.
- **`LineStage` cannot serve Act 1 as shipped.** It has no render-only mode, and it documents that `pin` and `scrub: true` "do not compose" — which is exactly Act 1's required mechanic. `paths[0]` "the primary strand" is documented and consumed by nothing.
- **Palette hexes are measured — copy them verbatim, never re-derive or "improve" them.** `src/design/colors.test.ts` enforces AA, and its token-against-token pair assertions (not only token-vs-canvas) are what caught a 2.64:1 button. **`colors.ts` and `globals.css` must carry identical hex values, and the suite now asserts that mirror** — an edit to either file alone fails.
- **Tailwind 4 needs literal class names** — `bg-ec-${x}` emits no CSS; every pillar→class mapping is written out. `stroke-ec-teal-graphic` is verified emitted, by hand.
- **`@theme inline` alias coverage is still unasserted.** A token declared in `:root`/`.dark` but missing from the `@theme inline` block emits **no Tailwind class** and passes the whole suite — the palette mirror test reads `:root`/`.dark` only. Adding a token means three places, and nothing checks the third.
- **`verticalLabel` in `src/lib/validators/courses.ts` can still drift from `pillar.vertical`.** The comment now states the truth; nothing enforces it.
- **GSAP ownership:** once GSAP drives, CSS can no longer guarantee reduced motion, so every setup pairs with `gsap.matchMedia()` rendering the final state; and never let GSAP and Motion own the same property of the same element.
- `rm -rf .next` after a file delete or rename — **never while a dev server is running** (a recorded incident, not a precaution).
- **`spec.md` §7.2 is the pre-Task-3 diagnosis, not a to-do list.** Adding a pillar follows §7.4's runbook — but note §7.4's "exactly three errors" is now **four** (the `programmeColors` literal at `colors.ts` was added a commit after the dry-run that produced the list).
- **`verticalLabel` in `src/lib/validators/courses.ts` is NOT derived from the registry**, and 3 of its 5 values differ from `pillar.vertical` (`Counseling`/`Counselling`, `AI & Digital Tech`/`Technologies`, `NEET & JEE Prep`/`Preparation`). **Both render** — dashboard forms vs marketing pages — so the same vertical shows two names. Pre-existing divergence; the *claim of derivation* was introduced by Task 3 and removed at close. Fixing the labels is a copy decision for the owner.
- **`vitest.config.mts`'s `include: ['src/**/*.test.ts']` silently drops `.test.tsx`.** Task 7's tests are `.test.ts` and run — but any `.test.tsx` added later will never run, silently. Needs a `jsdom` decision.
- **`stationPositions(Infinity)` throws `RangeError`** (loud, unreachable from `pillars.length`), and the `pillarCount <= 0` guard there was removed as unobservable — `Array.from` already coerces the length.
- **The anchors' coordinate frame supersedes the plan's.** `anchors.ts` states x/y as **act-local**; the plan's Task 5 code block still carries the superseded sentence and the values themselves. `pathFor` does **not** own a transform.
- `src/app/(site)/about/page.tsx` carries formatting-only churn in the working tree (quote style, JSX re-wrapping). It is out of scope here — do not sweep it into a Stage 1 commit.
- **`src/design/scroll.ts` is fully pinned to spec literals.** If a later task changes a `motion.ts` token or a breakpoint constant and the suite goes red, the spec needs updating too — that coupling is deliberate, not a test to relax.
