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
> *planning*, not re-deriving. **Its ⚠ join warning is retired** — the join is `line/frames.ts`,
> resolved by Stage 2 Task 2, and the README now carries the outcome in place of the warning.

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

**Stage 2 is in progress — 9 of 12 tasks closed.** Task 1 (the anchor contract and the seam rule) →
`04b1702`; Task 2 (the join, `frames.ts`) → `048af65`; Task 3 (the two facts §8 leaves to JS) →
`f9e0919`; Task 4 (`LineStage`'s render-only mode and the frame override) → `10291cd`, fix `8baddad`,
corrections `620e35d` `6dd46c3`; Task 5 (Act 0 — Origin, `ActSection`, `MaskLine`) → `efab08b`, brief
fixes `e2bf9f9`, fix round `862593b`; Task 6 (Act 1 — the walk, `drawAt`'s first call site) →
`b32c33c`, fix round `7b59edd`; Task 7 (Act 1's ribbon) → `56fef24`, fix round `9368ef0`; Task 8
(Act 2 — The Way) → `1ef625c`, fix round `91dd5f0`; Task 9 (Act 3 — Proof) → `c23aa8f`, fix round
`b6f3acc`. The live plan is `.claude/plans/landing-redesign-stage-2.md`; it moves into `stages/` when
the stage closes.

**Execution is a no-agent procedure as of 2026-09-13, on the owner's instruction.** No subagents run
and no skill drives the loop: the assistant implements, verifies in three phases (contract → claims →
mutation) and fixes, itself. See [`platform/execution.md`](../../platform/execution.md) and
[ADR 0010](../../decisions/0010-no-agent-execution.md). The two agent-driven predecessors are archived
verbatim at [`platform/archive/`](../../platform/archive/) and are one `cp` from being restored —
Tasks 1–2 ran under the three-lens regime and Task 3 under the tiered one, so all three regimes are
directly comparable on cost: **949k · 929k · 516k** per task.

Next action: **Task 10** — Act 4, the doors, and the strand's end — per `platform/execution.md`. It
creates a **new** `acts/FinalCTA.tsx` and renders it from `Doors`; Task 11 then deletes
`landing/FinalCTA.tsx`. **Awaiting the owner: they sequence the work.**


## 3. Blocked

Nothing blocks. Owner-side and open: all browser/visual QA (the assistant never launches a browser,
which is why the dev-only `?calibrate=1` overlay reports numbers); seed testimonials remain a launch
blocker this design leans on harder ([`platform/blockers.md`](../../platform/blockers.md));
`Course.vertical` cannot express a course outside the five pillars (`spec.md` §7.1 — deferred product
decision); and `--accent: #00b3b8` survives untouched in the shadcn contract, measuring **2.58:1**
against its own foreground — the hex this stage exists to retire, with no consumer today.

## 4. Do not get wrong

- **The loop is four commands:** `npx tsc --noEmit && npm run lint && npm run test && npm run build`. Task 1 added the Vitest leg; three of four is not green.
- **The join is resolved — `line/frames.ts`, Task 2.** It reconciles the three modules by **viewBox selection, not arithmetic**: a vertical act renders `0 0 1 1`, the walk `0 0 N 1` over an `N × 100vw` element, so `stationPositions`' `x = i` becomes slot `i`'s centre with a half-slot offset. The 0.33%-of-viewBox / 0.26px failure is no longer reachable from any caller in this plan. **Every export of `frames.ts` has a named consumer**; keep it that way.
- **`assertContinuity` was re-specified, not wired as shipped (Task 1).** It demanded `exit == enter` as raw values, which no correct vertical chain can satisfy, because each anchor lives in its own act's box. It now checks the *shape* of a seam — exit on the act's bottom edge, entry on the next act's top edge, one shared horizontal fraction — and it **throws** on a chain with fewer than two acts, so a vacuous default cannot pass. Task 11 calls it at render from `page.tsx`, the only runtime call site.
- **The walk's axis is decided (R1); Task 6 implements it.** The track travels **N viewports, not N−1**, so station `i` centres at `i/N` — exactly where `drawAt` begins drawing its segment — and each dwell moves one viewport. The spec's `(N−1)` formula is superseded and Task 6 corrects `spec.md` in the same commit. `drawAt` itself is unchanged: `clamp01(pillarCount * progress − index)` is *forced*, and do not "correct" it back toward the old tween.
- **`LineStage`'s two gaps were Task 4's and are closed (`10291cd`).** `draw?: boolean` and `viewBox?: string` are additive with the default path byte-identical, and R7's three readerless constants now have six call sites across Tasks 5–10. **One residual, measured:** the `draw` default's *value* is unobservable to the suite — inverting it, or deleting it outright, leaves `15 passed (15)`, because markup never depends on `draw` and no test runs an effect. It is pinned by one literal and the comment beside it; it is the path Tasks 8–10 take, while `?calibrate=1` numbers only the two scrubbed acts (R16 — the owner's call if they want a number on it).
- **A verbatim quotation in the plan was not in the document it cited (Task 4).** "The Stage 1 rulings name this gap twice" is false as written — `rulings.md` has no `render-only`, no `Act 1`, no `compose`; the homes are `state.md` §4 and `rulings.md:218` (R36, the `pin ∧ scrub` half). Corrected in the plan, and `10291cd`'s message repeats the attribution — unamended (R4), corrected in `8baddad`. **Check a citation resolves before inheriting it**; this is the second time this stage has paid for that.
- **Any test that renders a component containing `EnquireButton` must wrap it in `EnquiryModalProvider`.** `useEnquiryModal` is called at render time and throws outside its provider, which lives in `app/(site)/layout.tsx`. Task 5's seven Origin cases died on this before the harness was fixed (`efab08b`), and every act carries a CTA, so Tasks 6–11's tests meet it again. Same family: `PROPS … as const` narrows a literal prop (`pillarCount: 5`), so test overrides are typed by the component's props — `Partial<OriginProps>` — not by `Partial<typeof PROPS>`.
- **Act 0's H1 ships `type-display-xl`**, not the brief snippet's `type-display-l`. The brief's own prose said to keep whatever `Hero.tsx` used, and the two differ by a measured step — `clamp(3rem, 6.5vw + 0.75rem, 5.25rem)` against `clamp(2.5rem, 5vw + 1rem, 4.25rem)`. **One class to revert** if the smaller H1 was the intent; the plan carries the conflict.
- **`ActSection` has no tests, and `MaskLine` is single-use.** Measured consumers: `Origin` → Task 11 alone; `ActSection` → Tasks 8, 9, 10; `MaskLine` → Task 5 only, though the plan's Interfaces line promised "Tasks 6–11" for all three. Spec §3.4's `Stagger.tsx` is created by no task. Routing later Motion reveals (station enter/exit, panel crossfade) through `MaskLine` is an open owner decision.
- **A CSS-containment test must slice the media block, not search the file.** `gsap.test.ts` has a `blockSpan` helper for exactly this, and Task 6's P12 measures why: hoisting `[data-walk-station]` out of the reduced-motion block to the end of the file leaves every string present, so a whole-file `toContain` passes while shipping an unconditional override. **A check that cannot fail is not a check** — the brief's Step 5 snippet also referenced a `reducedMotionBlock` that does not exist.
- **The walk's rail click is untested and `?calibrate=1` will not reach it** (it reports state, not interaction). Three branches, one of which moves the page; Task 6's largest untested surface, and the owner's in QA.
- **`pillarCount` vs `stations.length` is unenforced.** Task 6's comment says the geometry is a function of `pillarCount` "never of `stations`", and a mutant taking the `drawAt` axis from `stations.length` survives — as does dropping `draw={false}`, which would put `LineStage`'s in-view tween and the act's scrub on the same property, the one thing the engine split forbids. The ribbon's own arity is now pinned (Task 7); the walk's is not.
- **The ribbon's strand doubles back (Task 7's R17, owner's call).** Measured: `ribbonFrame(6, 2)` gives nodes `1.5 … 6.5` and `exit {x: 6, y: 1}`, so the strand runs right to the last node and then travels **0.5 units left** to the exit — `… L 6.5 0.5 L 6 1`. Three individually-correct decisions combine (unit spacing from 1.5 in, width `stageCount + 2`, exit pinned to the spine at `0.75 × width`) and above three stages the exit must precede the last node. The seam is unaffected; the visual is a backward hook on the line the eye is following into Act 2. Task 2's verification could not have caught it — it compared mutants for equivalence, not geometry for intent. **Do not "fix" it in a later task without the owner's ruling**; the options are to move the nodes, widen the frame, or accept it.
- **Re-extract the briefs after every plan edit, not just before a task.** Task 6's plan edits were not followed by `python3 .stage/sdd/extract-briefs.py`, so brief 7's recorded line range was stale by six lines (its content was current). Verify a brief by comparing its **section**, not only its range.
- **Two observations from Task 7's contract pass, both recorded not acted on.** `RibbonStage` is exported and nothing imports it — `FivePillars` renders it internally, so the plan's stated reason for the export is false. And Act 1's only heading is an `<h3>` with no `<h2>` in the act, so the page reads h1 → h3 → h2 (`ActSection`); `_copy.md` marks the string `[VERBATIM]` from `StudentJourney`, so it is deliberate, but the a11y pass should rule.
- **A server component is only server while a server parent renders it (Task 8's R18, open owner decision).** `ActSection` has no `'use client'`, but Tasks 8–10 import it from client act modules and `page.tsx` renders each act bare — so the frame and the act's copy travel in that route's client bundle. Its docstring now says so. **The alternative is Task 11's page wrapping each act in `<ActSection …>`**, which keeps the copy server-rendered; the bundle measurement is owed at Task 11, the first build with an act mounted. Do not "fix" this by adding `'use client'` — that would make the client cost explicit while losing the server-rendered option entirely.
- **Pin the *bodies*, not the titles.** Task 8's first mutation run left 8 of 12 mutants alive because the brief's test pinned titles (of copy, of nodes) and not their content or positions — including the copy that exists so Task 11's deletion is verifiable. **The pattern has now appeared in Tasks 5, 6, 7, 8 and 9**; the cheap rule is to ask, for every assertion, what would still pass if the thing it names were wrong.
- **When a brief's prose and its test disagree, follow the test and report it; when the prose promises a pin the test does not write, write the pin (R19).** Task 9 produced both cases in one document: Step 3 called each marginale a `<blockquote>` while the test asserted exactly one (followed the test — if three were intended, the assertion should be `toBe(3)`), and Step 3 said the tick positions should be pinned while the test pinned neither the ticks nor the axis (wrote the pin; three mutants had survived). **The prose and the test are written as one artefact and checked as two.**
- **The seed testimonials are now load-bearing and visibly labelled.** Act 3 leans on them harder and says so in reader-facing text, per §4 — the launch blocker is unchanged and more visible, not less ([`platform/blockers.md`](../../platform/blockers.md)).
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
- **The seam contract, in three facts.** `pillars`, `way`, `proof` and `doors` share the spine `x = 0.75`, so the vertical seam rule is `exit.x === enter.x` (not `exit == enter` as values); `origin.exit` is **the fork point** at `{0.5, 0.85}` — above the fold, where one strand becomes N — and `doors.exit` is **the CTA node** at mid-band `{0.75, 0.5}`, a free end. All three are pinned in `anchors.test.ts` and asserted at render by Task 11. `pathFor` does **not** own a transform.
- `src/app/(site)/about/page.tsx` carries formatting-only churn in the working tree (quote style, JSX re-wrapping). It is out of scope here — do not sweep it into any task's commit. **Check `git diff --cached --name-only` before committing**: one commit in this stage swallowed another agent's staged files that way.
- **`src/design/scroll.ts` is fully pinned to spec literals.** If a later task changes a `motion.ts` token or a breakpoint constant and the suite goes red, the spec needs updating too — that coupling is deliberate, not a test to relax.
