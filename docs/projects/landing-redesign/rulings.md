# Landing redesign — Stage 1 rulings ledger

Decisions taken on the owner's behalf during Stage 1, each with **what it cost if wrong**. These
were made while executing, not while designing, so they are recorded here rather than as individual
ADRs — but they are durable, because several cost a rework round and were originally recorded only
in gitignored scratch.

Format: **what was decided** — why — cost if wrong.

## Pre-flight

**Work stayed in the existing checkout on branch `landing-redesign` rather than a new git worktree** — the branch is not `main`, so the isolation requirement was met, and a worktree would have needed a full `npm install` for no benefit — cost if wrong: concurrent edits could interleave; recoverable via git.

**Task 2 updates both live `programmeColors` consumers rather than carrying a deprecated back-compat field** — a wrong-named field carried into a brand-new palette never gets cleaned up, and the fix was two files — cost if wrong: two accent colours pick the wrong tier on a social card; visible in QA, one-line reversion.

**`pillarAccentVar`'s semantic shift was accepted without migrating its graphic-role call sites** — two of those components are retired in Stage 2 and the rest rewritten in Stage 3, so migrating them early would touch files the later stages replace anyway — cost if wrong: SVG strokes render in the darker text tier for one stage — legible, merely less vivid. **Corrected at Stage 1 close:** the count was recorded as "~7 graphic-role call sites"; measured, it is **5 files** (`Navbar` and `coursePillar` no longer reference it), and **"graphic-role" is wrong for most of them** — `ProgrammeDeepDive` and `ProgrammeExplorer` use it as `color`, which is now the *correct* tier; only `EcosystemGraphic` and `ProgrammeGraphic` use it as `stroke`/`fill`. Re-derive per call site; both the old number and the old characterisation were wrong.

## Task 1 (harness)

**The palette-enforcement test moved from Task 1 to Task 2** — a test cannot reference a type shape that does not exist yet without breaking `tsc`; the original split left the branch **unbuildable** between the two tasks, contradicting the plan's own gate — cost if wrong: the AA gate lands one task later; every task boundary stays buildable either way.

**`vitest.config.ts` renamed to `.mts`** — `package.json` has no `"type": "module"`, so a `.ts` config loads as CJS-with-ESM-syntax and Vite printed a compatibility warning on every run, violating the brief's own pristine-output requirement. Probed empirically before ruling — cost if wrong: none, the probe was conclusive.

**Guard `relativeLuminance`'s input** — it is exported and later tasks call it directly, so an unguarded `parseInt` returned a silent `NaN` instead of failing loudly — cost if wrong: one extra throw path on a module that already throws by design.

**Raise `engines.node` to `>=20.19.0`** — `vite@8` requires `^20.19.0 || >=22.12.0`, so the declared floor could not run the declared toolchain — cost if wrong: a slightly narrower supported range than documented.

**Task 1 lands as multiple commits with an intermediate red commit** — accepted rather than squashing, because the plan was corrected mid-task and squashing would have rewritten commits stacked above — cost if wrong: `git bisect` landing on that commit sees a non-buildable tree.

**Add `"**/*.mts"` to `tsconfig.json` include** — the `.mts` rename silently dropped the config out of the type-checked program, trading a cosmetic warning for real coverage loss. Confirmed with `--listFilesOnly` — cost if wrong: the config is type-checked again, as every other config file in the repo already was.

## Task 2 (palette)

**Two invisible washes: the values were wrong, not the test** — `thrive.softDark` measured **1.0036** against the lighter dark canvas, as invisible as the wash it replaced. Adopted the implementer's hue-preserving lift — cost if wrong: two wash hexes slightly brighter than intended; one-line reversions.

**Replace the impossible contrast band with an achievable floor pair** — a wash always scores `1.1292×` higher on the darker canvas, so "1.15–1.25 on both" is unsatisfiable. The test floor was **tightened** (1.10 → 1.15), not loosened — this was not bending the gate to fit the values — cost if wrong: washes read slightly stronger on the lighter canvas, which is correct for a tint.

**Gold keeps its FILL tier** — darkening `--ec-gold` as a text token broke the primary CTA pairing from 8.83:1 to 2.64:1 — cost if wrong: gold is unavailable as text on light surfaces; that is a **pre-existing** problem now tracked for Stage 3, which redesigns those components anyway.

**Add a token-against-token assertion for the CTA pairing** — the existing assertions measured tokens against canvases and were structurally blind to a broken foreground/background pair, which is how 34 green assertions coexisted with a 2.64:1 button — cost if wrong: one assertion to maintain if the button's variant colours change; that is the point.

**Drop the unpainted `brand.indigoDark` token rather than emit it** — it had no CSS counterpart, so the test blessed a hex the browser never painted. Emitting a token nothing consumes relocates the problem — cost if wrong: the spec's promised dark-mode indigo text partner does not exist; the real exposure (decorative SVG at 1.90:1) is deferred to Stage 3.

**Leave the graphic tier's floor at ≥3:1 against `#ffffff` only** — `learn` and `achieve` fall below 3:1 against `#eaf6ff`, which the hero's sky gradient uses, but the values are spec-mandated and the exposure is decorative WebGL nodes retired in Stage 2 — cost if wrong: sub-3:1 decorative graphics on sky backgrounds until the hero is replaced.

**The implementer's `globals.css` mirror was correct and was a gap in the ruling** — the ruling named only `colors.ts` and the test, but `colors.ts` is the test source while the CSS is what paints; without the mirror the corrected washes would have passed all 34 assertions and stayed invisible — cost if wrong: none; the mirror is required for the fix to have any effect.

## Task 3 (registry)

**Accept `import type` + `export type` over the brief's bare re-export** — the brief's single line does not bind the name locally while `Programme.pillarId` in the same file uses it (TS2304) — cost if wrong: none; still fully type-only and erased.

**Accept dropping the mandated `eslint-disable` directive** — that rule is `off` in this repo, so under ESLint 9's `reportUnusedDisableDirectives` the directive *became* the repo's only lint warning — cost if wrong: none.

**The six back-compat re-exports are not six things to update on a new pillar** — they are `Object.fromEntries` derivations of `pillarAccent`, so a new key flows through automatically. Only `pillarAccent` is a checked literal. The spec's runbook was reworded to "let the compiler enumerate" because the file list went stale within one task — cost if wrong: a future author edits nothing they did not need to; the compiler still catches every real gap.

**Constrain `programmeColors` to `Record<PillarId, PillarAccent>`** — it had three unguarded copies of the pillar identity, so a sixth pillar produced no compile error and no test failure: its palette was never measured and the suite stayed green. This also closed a second hole — with `noImplicitAny: false`, indexing an unconstrained object by an absent key silently yields `any`, so the OG image would have fallen back silently and the WebGL scene would have thrown at runtime — cost if wrong: `as const` is dropped, so hex-literal types are lost; verified nothing consumed them, and `as const satisfies Record<PillarId, PillarAccent>` restores them if ever wanted.

## Task 4 (scroll calibration + animation dependencies)

**Corrected the `headlineStaggerMs` comment rather than the value** — the prescribed comment claimed 80ms sat "between `fast` (160) and `instant` (100)", which is false: 80 is below every `motion.ts` token. The value is a legitimate per-line stagger; the *justification* was wrong, so the comment was fixed and the value left untouched. Choosing a different stagger is a design decision, not a doc fix — cost if wrong: one comment reads differently from the plan; the measured value is unaffected either way.

**Renamed `BREAKPOINTS.md` to `.sm`** — `src/design/tokens.ts` already exports the canonical ladder, whose `md` is 768, so `BREAKPOINTS.md = 640` in the same directory contradicted its own "Tailwind-aligned" comment (640 is Tailwind's `sm`). `spec.md:419-423` fixes the *values* (≥1024 / 640–1023 / <640) and `branchFor`'s branch names are spec-grounded too, so only the key was wrong — cost if wrong: two files edited for a rename with zero call sites; the trap defused is a Stage 2 author reaching for `tokens.ts` and silently shifting the tablet branch 640→768 with no type error and no test failure.

**Deriving `BREAKPOINTS` from `tokens.ts` was considered and rejected** — it would couple spec-mandated scroll calibration to a general layout token, so a future layout edit could silently move the tablet branch, trading one latent silent failure for another — cost if wrong: two maps to keep in agreement, now that they no longer share a key that disagrees.

**The test pins the calibration band to literals** — the original floor and ceiling cases compared `perStationVh` against the very constant under test, so each assertion moved with the constant. Measured windows in which the whole suite stayed green: `WALK_MAX_VH` anywhere in `[80, 400/3]`, `WALK_MIN_VH` anywhere in `[400/7, 66.75)` — the spec's 60 sitting unremarkably inside a 9.53vh window. This stage's only verification is its pure-function tests, so a test that cannot fail for a wrong calibration constant is the same class as the palette bug this repo already shipped once — cost if wrong: the test now fails if the constants are retuned without a spec change, which is the intent.

**The three token-mapped `CEILINGS` are derived through `durationMs()`** — `spec.md:474` states "`design/motion.ts` stays the single source", and the four values were independent literals that merely happened to agree, so `motion.duration.emphasis` could move without `stationEnterMs`. `headlineStaggerMs` maps to no token (it is below `instant`) and stays a literal — cost if wrong: three members lose their literal types, and nothing consumes them; `scroll.ts` gains a dependency on the pure `motion.ts` module.

**`perStationVh`'s guard tests the quotient, not the argument** — guarding the argument caught `NaN` *inputs* but not `NaN` *results*, so `perStationVh(undefined)` still returned a `NaN` bound for a future ScrollTrigger `end`, the exact outcome the guard's own comment claimed to prevent. A blanket `!Number.isFinite` was explicitly rejected: it would also catch `Infinity` and return the ceiling, when an absurdly large count must take the ordinary path to the floor — cost if wrong: an input unreachable under `strict: true` returns the ceiling instead of `NaN`, which is the safer direction.

**The `NaN` fallback returns `WALK_MAX_VH`, mirroring the `<= 0` branch** — one outcome for an unusable count is the module's existing convention, this runs client-side in a repo with no logger and no local runtime for the owner to reproduce in, and a throw would take down the whole act. The ceiling is also the safe geometry — cost if wrong: an unusable count yields the longest station rather than a loud failure.

**Corrected two rows of `spec.md` itself** — §10.2's "between `fast` and `instant`" was false (80 < `instant`'s 100) once the code comment was fixed, and §7.4 said "~4.5 screens" where §7.4's own table fixes the walk at 400vh and its neighbouring line says "~4 screens". Fixing the code while leaving the authority false would hand the next stage's planner a contradiction — cost if wrong: two rows edited, both claims about values verified directly against `motion.ts` and the spec's own tables.

**The plan's Task 4 listing was marked superseded, not rewritten** — `stages/stage-1.md` still carries the pre-ruling `BREAKPOINTS.md`, literal `CEILINGS` and the false stagger comment, and it is the document Tasks 5–7 are executed from, whose code blocks are copied verbatim (which is how the stale names reached the first commit). The plan is a historical record, so the honest form is "planned X, shipped Y, because Z" — cost if wrong: one note in a historical plan; the alternative was rewriting executed history.

**`WALK_BASE_VH` was pinned last, closing the final blind window** — it passed all 11 tests anywhere in `[400, 400.5)` because `toBeCloseTo(400, 0)` carries ±0.5 slack, so a typo of `400.4` shipped silently; the comment had also begun claiming its list of windows was exhaustive while omitting this one — cost if wrong: one assertion, and the comment's claim is now true.

**Every fix round was re-reviewed by a fresh reviewer over the fix diff alone** — not a formality: the second round's reviewer proved Ruling H's equivalence claim with 200,025 inputs and zero divergences, proved the `@ts-expect-error` load-bearing (deleting it yields `TS2345`), and confirmed the plan's code blocks were byte-identical after the note was added — cost if wrong: three review rounds on one task for two files, which is the cheaper side of that trade in a repo whose only automated gate is the four-command loop.

## Task 5 (line station geometry)

**`drawAt` became `clamp01(pillarCount * progress - index)`, overriding an explicit owner choice** — the owner selected "tween-aligned" spacing on the stated benefit of matching the spec's `0 → -(100 × (N−1))vw` translation, but that shape is **impossible, not merely inferior**: with N stations at (N−1) spacing the last station's window is `[1, N/(N−1)]`, outside the walk, so `drawAt(p, N−1, N) === 0` for every `p ≤ 1` and the final segment never draws at any progress. The controller's own preview had displayed the symptom and read it as "trailing" rather than fatal — a defect in the option as presented, recorded rather than quietly corrected. The corrected shape is *forced*: station 0 starts at `p = 0`, station N−1 completes by `p = 1`, all slices equal width ⇒ slice width exactly `1/N`. The impossibility was **reproduced independently** before the override, because it overrode an owner decision — cost if wrong: a walk that completes every segment but whose drawn fraction equals walk progress rather than the tween's own axis; the owner was offered a redirect that would instead change Task 7's tween from (N−1) to N steps.

**Ruling O — the anchors/station x-frame ambiguity was documented with `pathFor` named as the reconciler.** Each file states its own frame (`anchors.ts` act-local, `station.ts` track-local) instead of one coordinate pair described in two frames — **superseded by Task 6's R8**, which proved no such reconciliation is possible from that signature. Kept here because the supersession is the point: the ambiguity was real, the named resolver was not — cost if wrong: one comment's precision.

**Ruling P — tablet geometry is deferred to Stage 2.** `spec.md:415-421` requires a vertical spine with stacked stations at 640–1023px, but `stationPositions(n)` has no branch parameter; `branchFor(width)` already exists for the purpose — cost if wrong: Stage 2 designs tablet geometry from scratch, which it was always going to do, but now it knows that.

**`NaN` is guarded on the quotient, not the argument** — `Infinity * 0` is `NaN` produced from two non-`NaN` arguments, so an argument guard would miss it. Raised by the implementer, and strictly stronger than the rationale Task 4's equivalent guard used — cost if wrong: an input unreachable under `strict: true` returns 0 rather than a frozen rail.

**The dead `stationPositions` guard was removed rather than commented** — `Array.from` already coerces the length, so no test could distinguish the guard from its absence — cost if wrong: none; the behaviour is pinned by test instead.

**Pinning the anchors makes a change visible; it does not make `0.72` correct.** The values are invented in the brief and appear in no design document, so `anchors.test.ts` converts a silent-drift risk into a visible-change risk and the values themselves still need the owner's eye. This is the right thing for a test to buy and the right way to say it — cost if wrong: a pinned-but-arbitrary number reads as reviewed.

## Task 6 (path builders + the continuity assertion)

**R8 — `pathFor` is frame-agnostic, and the transform is the caller's.** `anchors.ts` and `station.ts` had both claimed `pathFor` "owns the transform" between the act-local and track-local frames. It cannot: the transform needs an act identity, and `pathFor(from, to, shape)` receives two bare points. The replacement formula the controller first mandated — `trackX = actIndex + actLocalX` — was **itself falsified** by the correctness lens: it conflates the *act* index with the *station* index, maps one shared seam point to two different places depending on which side you draw from (manufacturing the very discontinuity `assertContinuity` forbids), and is silent on y, where the frames genuinely differ. The vertical segments (act-local anchors) and the horizontal rail (track-local stations) are **different geometry, not one frame needing conversion**. Cost if wrong: Stage 2 derives an offset from a formula three docstrings present as authoritative. **This is the ruling with the worst process story in Stage 1 — the repair replaced a false claim with an unverified one, which is the defect class the ruling existed to remove.**

**The brief's `"x in track-widths, y in band-heights"` docstring was not transcribed** — it is the superseded frame sentence the plan still carries at `stage-1.md`'s Task 5 block, and the plan is a historical record whose code blocks get copied verbatim, which is exactly how the stale names reached earlier commits. Cost if wrong: a second copy of a frame statement this repo had already corrected once, in the newest file.

**The brief's stated expected result was wrong (`8 assertions` where its own listing has 9) and was reported, not satisfied.** An implementer that "fixes" a count mismatch by adding or deleting a test destroys the only evidence the brief produces. This has now paid twice in Stage 1 — here, and when a fix that did not work was reported as not working rather than marked done. Cost if wrong: none; the count is confirmable by running the suite.

**`assertContinuity` iterates `Object.keys`, i.e. insertion order — not `ACT_ORDER`.** The docstring claimed "in the declared act order". The signature was deliberately **not** changed to `Record<ActName, …>`: `satisfies Record<ActName, AnchorPair>` already makes a deleted act a compile error at the source, and the two-act test fixtures must keep compiling. Cost if wrong: a reader believes the function reads `ACT_ORDER`.

**Five false claims were withdrawn rather than reworded** — the fork's "hold x for the first third" (the coefficient is 0.55; x has travelled 14.81% of `dx` by `t = 1/3`); "can never see a single anchor move" (false for 8 of 10 anchors — each interior value is written twice per seam); "the handoff feels broken" attributed to the spec (it is the plan's own wording, in no spec); "reported" in the commit body (no report exists); and the fork's purpose clause (five draws from a **shared origin** cannot cross, so the named failure is impossible). Cost if wrong: each is one sentence a Stage 2 author would act on.

**R14 + R22 — the non-finite guard tests inputs AND results.** The first version guarded inputs only, and `round` multiplies by 100, so any `|v| > Number.MAX_VALUE/100` overflows *inside the rounding* and manufactures `Infinity`/`NaN` from finite inputs: `pathFor({x: Number.MAX_VALUE, y: 0}, {x: 0, y: 0}, 'line')` emitted `"M Infinity 0 L 0 0"` with the guard reporting pass. That is **the same defect this file's neighbour already recorded** (`perStationVh`: *"a guard that caught NaN inputs but not NaN results, against its own stated goal"*). Fixed on the rounded values, then **independently fuzzed by the controller: 250,563 combinations, zero non-finite tokens leaked**, with `1e306` still producing a valid finite path so the bound is real rather than a blanket rejection. Cost if wrong: none measured; the class was a false claim, not a triggered bug — unreachable from normalised callers.

**`Ruling R22 — a second fix round, scoped only to defects the fix itself introduced.** The process says only a Critical finding justifies a second round. R22 departs from that deliberately: the "stop" bounds the loop for the *original* findings, while the verification pass's stated purpose is to catch a fix that breaks something *inside the same task* — which is pointless if the catch is then not acted on. The payload was five small corrections, one of them a single guard call. Cost if wrong: one extra round on a task that had already had two — the cheaper side of shipping a docstring claiming a guarantee the code does not provide, in a repo whose named recurring defect is false claims. **It was the fifth consecutive round in which the repair step introduced the next round's defect.**

**Deferred, with what is genuinely unverified:** only 16 of the reviewers' 21 surviving mutants have re-run evidence and M12/M33 have no reconstructed mutant at all — so "16 probed, 16 red" is 16 probes, **not** coverage of 33; the four control-point finiteness checks are unreachable today (they defend against a coefficient > 1) and that is verified by arithmetic, not by test; and the arc coefficients, fork geometry and anchor values remain **invented and unvalidated** — the `dy = 0` finding means the fork's real case is a horizontal bulge rather than a vertical leave, which is a design question for the owner, not a defect.

## Task 7 (`lib/gsap.ts` + `LineStage`)

**Three owner decisions were taken here, and all three were reachable only after the review corrected the information they were taken on.**

**D1 — the tests R27 had ruled out are now written (owner).** `lib/gsap.test.ts` pins registration idempotence (measured by spying on `registerPlugin`: 3 calls → 1 registration), the ease/token mapping, and a source scan asserting `registerPlugin` appears in exactly one file; `LineStage.test.ts` pins the markup contract via `renderToStaticMarkup`. **R27 was reversed because both its premise and its conclusion were tested and only the premise held**: a deliberately-failing `.test.tsx` is silently dropped (re-confirmed on this tree — same bytes as `.test.ts` gave 8 files/116 tests/1 failure, as `.tsx` gave 7/115 and nothing), but "the deliverable is therefore outside the suite" did not follow — `'use client'` is inert under Vitest and GSAP registers with no DOM. **The withheld assumption — that component tests need `.tsx` + jsdom — was simply false.** Cost if wrong: tests that do not run; mitigated by mutation-verifying each one against its intended target.

**D2 — the eases became the tokens themselves (owner).** `gsap.ts` parses each `cubic-bezier`, solves `y(x⁻¹(t))` by bisection, and registers with core `gsap.registerEase`. Divergence **2.8e-12** against 0.084 and 0.266 for the built-ins it replaced. **The decision was re-presented before it was asked**, because the file's claim that an exact bezier "needs `CustomEase`" was false — `registerEase` takes a plain function, is core GSAP, and `spec.md` §10.2 forbids an easing *plugin*, not this. The original option set was itself wrongly constrained. Cost if wrong: a function ease where a built-in would do, on a single `stroke-dashoffset` tween — negligible and reversible.

**D3 — the non-scrub draw was fixed in code, not in prose (owner).** `scrub` was documented "Defaults to in-view draw" while the branch attached no trigger at all, so the tween fired on mount and **every below-the-fold act was fully drawn before the user arrived** — the real case, since the walk is ~4 screens tall. Cost if wrong: a behaviour change to an animation visible in the owner's QA, and one prop object to revert.

**R39 — a second scoped round, on the R22 precedent.** `The verification pass's stated purpose is to catch a fix that broke something "inside the same task instead of the next one" — void if the catch is not acted on. Cost if wrong: one extra round on a task that had already had two.`

**The defect that justifies R39, and it is this project's own named one: the fix authored a test that cannot fail.** `gsap.test.ts` took `const token = EASE.out` and measured `max|EASE.out(p) − token(p)|` — identically zero, so its `toBeLessThan(1e-12)` could not fail for *any* `EASE.out`, including `x => 12345*x`. Falsified by mutation: halving the solver's bisection steps from 40 to 8 produces an ease **0.0109** from the token, 10¹⁰× the claimed tolerance, and the test stayed green. The suite's real guarantee was `1e-6` — six orders weaker than the commit body, the test docstring and the code docstring all claimed. **This is the shipped defect already recorded in this file's own history** ("a test comparing the function against the very constant under test, so wrong calibrations passed"), authored by the round whose subject was removing false claims. It was caught only because the verification pass ran the falsification instead of trusting the green. The fix replaced the reference with an independent Newton-Raphson solver over the *token's* control points, plus an anti-vacuity guard asserting the old built-in really is far off.

**A false claim was fixed in one column of a row while left standing in the next.** `spec.md:121`'s "Depends on: `both`" survived R32, which corrected the column beside it — the same falsehood, same row, one cell right, first introduced by R19 and killed in the brief and the plan by R22. Recorded because it is the cheapest possible illustration of the pattern: the fix was applied where the defect was named, not to the defect's whole population.

**Seven consecutive rounds in Stage 1's last two tasks introduced the next round's defect.** Every one was found by a lens looking *differently* — never by looking harder at the same thing. Three times a subagent caught a defect in the controller's own work (a formula, a grep count, a line number, and an entire ruling).

## Stage 1 close (2026-09-13)

**A whole-branch review was run over the full range `29c96a6..HEAD`** — 41 commits, 87 files,
+11,185/−2,069 — in two lenses: cross-task composition, and deferrals-plus-claims triage. It was the
only step that could see what seven per-task reviews structurally could not, and it found the stage's
central gap.

**The finding that matters: the Line layer has no defined join, and nothing in the shipped code ever
draws a strand.** `LineStage` imports `cn`, `motion`, `SCRUB` and GSAP — not `anchors`, `station` or
`pathBuilders`. Measured: feeding `stationPositions(5)` through `pathFor` into the default `1200×800`
viewBox gives a rail at **0.33%** of the SVG width, and Act 0's arc renders **0.26px × 1.13px** at
1440×900. **This is not a Stage 1 defect** — the exit criteria always said "`LineStage` exists but is
unused; Stage 2 binds it", and R8 placed frame reconciliation with the caller. **What was defective was
the record**: `stages/README.md` told Stage 2 "use them, do not re-invent", which is a destructive
instruction when the join is undefined. The README now carries a ⚠ join warning as the first thing a
Stage 2 planner reads, and ADR 0006 records the frames. — cost if wrong: Stage 2 assembles the three
modules, gets a dot, and debugs a scale problem that is actually a missing design decision.

**The repo's named shipped defect was live, and this stage had rewritten both files it concerns.**
`CLAUDE.md` says `src/design/colors.ts` and `src/app/globals.css` must carry identical hex values, and
that a value in only one file passes the entire suite and renders nothing. Measured at close:
**69 mapped pairs, all in agreement, zero visible to the suite.** Mutation probes settled it —
changing `--ec-p-learn` or `--ec-p-thrive-soft` in `globals.css` alone left the suite at 9 files / 136
tests **green**, while the matching `colors.ts` edit went red. Every one of the five documents that
stated the invariant (`CLAUDE.md`, `state.md`, `colors.ts`'s own header, `palette.md`,
`verification.md`) asserted it; none enforced it, and `scroll.test.ts` even cited it by name while
pinning its *own* values to literals. The suite now asserts the mirror in both directions.
— cost if wrong: an invisible palette change ships straight through `tsc && lint && test && build`,
which is the exact failure this repo has already suffered once.

**A false claim this stage authored in shipped code.** `src/lib/validators/courses.ts` said of
`verticalLabel`: *"Derived from the pillar registry so the display name lives in exactly one place."*
It is a hand-written literal, and **3 of its 5 values differ from the registry** — `Counseling` vs
`Counselling`, `AI & Digital Tech` vs `Technologies`, `NEET & JEE Prep` vs `Preparation`. Both render,
in different surfaces, so the same vertical already shows two names in the product. The divergence is
pre-existing; **the claim of derivation was introduced by Task 3 and is the defect.** The comment now
states the truth. The labels themselves are a copy decision left to the owner.

**False claims swept from the documents that carry the stage's authority:**

| Document | Claim | Reality |
|---|---|---|
| `state.md` §1–§3 | "tasks 1–6 of 7… Task 7 is next" | All seven committed; §3 also said Stage 1 needed no owner decision, while Task 7 took three |
| SessionStart hook | printed Task 7 as the next action | Reads `state.md` §2, so it routed every new session into completed work |
| `stages/README.md` | "Tasks 1–3 done… Tasks 4–7 planned, not started" + a prerequisite calling them unlanded | Self-refuting: the same page listed their exports as existing |
| `stage-1.md` exit criterion 3 | "the same 29 routes" | 50 by the tree's counting, 43 by the manifest's. The *invariance* it means holds |
| `motion.md` | "`src/lib/gsap.ts`… not yet created" | Shipped, with a test enforcing its single-site rule |
| `verification.md` | "all three must pass" / "the three-command loop" | Four since Task 1 — and this is the doc whose subject *is* the gate |
| `verification.md` | the AA test means "a palette edit cannot silently regress accessibility" | True for `colors.ts`, false for `globals.css` — see the mirror finding above |
| `stages/README.md`, `rulings.md` | "seven files" use `pillarAccentVar` as a stroke | 5 files, and most use it as `color` — the *correct* tier |
| `rulings.md` | `coursePillar.ts`'s `PillarAccent` "shadows the design one" | Nothing shadowed — different module, no shared importer |
| `deployment-env.md` | "build ✓ (29 routes)" | Historical and date-anchored; annotated rather than rewritten |

**Five deferrals had been dropped rather than carried** — they lived only in the gitignored scratch
ledger, or nowhere: the `engines.node` bound that admits a Node version `vite@8` rejects (ruled "fix
in Task 4", never actioned); the unasserted `goldHoverDark` pairing; two gold field names that diverge
from their CSS counterparts; the `@deprecated` re-exports with no scheduled removal; and
`--accent: #00b3b8` (2.58:1) still live in the shadcn contract. All five now have a durable home in
`stages/README.md`'s cross-cutting section.

**Two ADRs were written.** 0006 records the coordinate frames and why `pathFor` reconciles none of
them; 0007 records that component tests run in node as `.test.ts`, and that R27's premise was true
while its conclusion was not.

## Not fixed, deliberately

- `EcosystemScene.tsx` hard-codes the pillar count as `(Math.PI * 2 * i) / 5` — a sixth pillar lands silently on top of the first.
- `ProgrammeGraphic`'s per-id chain has no fallback — a sixth renders an empty SVG silently.
- `src/components/dashboard/coursePillar.ts` declares a second type named `PillarAccent`. **The earlier "shadowing the design one" was false** — verified at close: it imports only `@/data/programmes` and `@/lib/pillarStyles` (class strings, not colour tiers), it imports nothing from `design/colors`, and no file imports both. Different module, different shape (`name`/`text`/`softBg`/`border`), nothing shadowed. The name reuse is a readability wart, not a defect.
- The added palette/registry set-equality assertion is **redundant** — with the new annotation it is provable by the type system and cannot fail for the divergence it names.

**From Tasks 5–6:**

- **5 of the 21 mutants that survived Task 6's three-lens review have no re-run evidence**, and M12/M33 have no reconstructed mutant at all. Not closable — the reviewers' list exists only as M-numbers in gitignored scratch. The task's coverage claim is bounded accordingly: 16 probes, not coverage of 33.
- **The arc coefficients, fork geometry and all ten anchor values are invented and unvalidated.** Pinning them makes a *change* visible, not a *correct* one; nothing has rendered them. The `dy = 0` case makes the fork's real geometry a horizontal bulge rather than a vertical leave, which is a design call.
- **`vitest.config.mts:16` (`include: ['src/**/*.test.ts']`) silently drops `.test.tsx`** — reconfirmed twice with deliberately failing probes that left the suite green. Nothing pending is skipped today (Task 7 creates no component test), but it needs a `jsdom` decision before any component test is written.
- **`NonFiniteCoordinateError` has no `spec.md` §10.1 row.** Additive and disclosed; the spec's table is functions-only and also omits `Anchor`, `ACT_ORDER` and `PathShape`, so an unlisted error class is not out of kind.
- **The four control-point finiteness checks in `pathFor` are unreachable today** — with the current coefficients they are convex combinations of the endpoints, so no input distinguishes them. They defend against a coefficient > 1, which is what the comment says. Verified by arithmetic, not by test.
- **Tablet geometry** (Ruling P) is still unbuilt and belongs to Stage 2.

**From Task 7:**

- **`LineStage`'s effect is untested, and that includes D3's fix.** `renderToStaticMarkup` runs no effects, so nothing in the suite reaches `useGSAP`, either ScrollTrigger, the pin, the `matchMedia` branch, or cleanup. The tests pin the markup contract and the registration layer — real, and they do not touch the animation. Verified by mutation that the suite cannot distinguish D3's trigger from its absence.
- **`preserveAspectRatio='none'` × `pathLength={1}` × `non-scaling-stroke`** — each attribute is pinned, their *interaction* is not. Non-uniform stretch plus a dash pattern computed in the outer space is a three-way interaction needing a rendering engine. **One screenshot at a non-1.5:1 aspect ratio is what would falsify it**; no claim is made that it works.
- **Reduced motion end-to-end, the pin, cleanup, and everything visual** — the owner's QA, as always. The no-JS case now has a CSS fallback and a test for its containment, but the JS half is unverified.
- **`vitest.config.mts:16` still silently drops `.test.tsx`.** Mitigated, not fixed: Task 7's tests live in `.test.ts` and run. The trap remains live for anyone who writes a `.tsx` test, and needs a `jsdom` decision.
- **Stage 2 interface items, recorded not implemented:** an accent prop (R38 — `spec.md:594-595` wants `/programmes/[slug]` to carry the pillar accent; CSS specificity is the current route), the `pin ∧ scrub` non-composition (R36 — the two ScrollTriggers have unrelated ranges and the seam is invisible), caller-owned `viewBox` scaling (now documented, still a caller duty), a permanent Tailwind-emission test (measured by hand — `.stroke-ec-teal-graphic` **is** emitted — but not in the suite), and the `paths[0]` "primary strand" convention.

Everything above is either visual, naming-only, unreachable from real callers, or explicitly deferred to a named stage — none of it blocks, and the components named first are slated for retirement.
