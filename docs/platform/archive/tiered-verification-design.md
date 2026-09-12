# Tiered verification — the approved design (in force from Stage 2 Task 3)

**Status:** approved 2026-09-13 and in force — see `docs/decisions/0009-tiered-verification-per-task-and-stage-end.md` and `.claude/skills/run-a-stage/SKILL.md`. Kept as the design's reasoning; the ADR is the decision.
**Scope of the change: verification only.** Implementation, the briefs, the gate and the ledger are unchanged.
**Supersedes** the v2 draft and my first draft.

**What changed in this pass** (the polish, so the diff is visible):
1. **One verifier per task, held across the whole task lifecycle** — its three phases *and* the post-fix re-check — resumed by message rather than respawned. It keeps the property that matters (it is not the fixer) while never rebuilding context it already has.
2. The reader/mutator isolation problem (ruling R2) **disappears by construction**: one agent per task, phases sequential, so no reader ever shares a tree with a mutator.
3. The per-task artefacts become **the interface between task-level and stage-level verification**: fixed shape, greppable, so the stage-end lenses read results rather than re-deriving them.
4. **A controller duty learned this stage:** a finding that is a *plan* defect is fixed in the plan before the next brief is extracted. R7 and R8 were defects in the plan, not the code — dead exports and stale task numbers — and they were only catchable because the next task had not been dispatched yet.
5. **Escalation rule:** a Critical survivor or a failed contract check promotes that task to full three-lens treatment, so the cheap path can never be the reason something Critical went unexamined.
6. **Tiering gains a size trigger**, so an "unknown" task cannot hide in Tier B by being unclassified.
7. **Cost instrumentation:** the ledger records per-dispatch tokens, making the recomputation in §Cost mechanical instead of reconstructed after the fact.
8. A short **invariants** list, so the design is auditable against its own promises.

---

## The workflow

### Per task

| # | Who | Does | Artefact |
|---|---|---|---|
| 0 | controller | record `BASE=$(git rev-parse HEAD)`; refresh the brief from the plan; `git diff --quiet HEAD` | — |
| 1 | implementer (1 agent) | brief = requirements; interfaces from earlier tasks the brief cannot know; my ambiguity rulings; report path. Ends green + committed | `reports/task-N.md` |
| 2 | controller | generate `reviews/task-N.diff` (diff + commit message, never inlined); tree check | diff file |
| 3 | **verifier — 1 agent, spawned once, phases in this order** | contract → claims → mutation | `verification/task-N.md` |
| 4 | fixer (1 agent) | **one round, every finding** — Critical, Important *and* Minor; each fix evidenced by measurement | `reports/task-N-fix.md` |
| 5 | **the same verifier, resumed** | post-fix re-check against its own tables | appended to `verification/task-N.md` |
| 6 | controller | full gate; tree check; ledger; **plan defects fixed + briefs re-extracted**; close | ledger row |

Steps 4–5 run only if step 3 found something.

### The verifier's lifecycle — context is retained, not rebuilt

Spawned **once per task** and held until the task closes. Dispatched at step 3, it runs its three phases and reports the first time. On step 5 it is **resumed by message** — same agent, same context — with the fix report's path and one instruction: check whether every fix landed and whether any fix introduced a new defect.

Why this and not a fresh agent: a fresh post-fix checker must re-read the diff, the brief and the task's code to re-establish what the code was supposed to do. The held verifier already holds the contract table, the claim table and the survivor list — so "did the fix work" becomes a re-check against known expectations instead of a re-derivation. It also keeps the one property that must never be traded: **the verifier is not the fixer** (the failure it prevents is measured — Task 1's fixer justified leaving a deleted test unrestored by asserting it could not discriminate a mutant, and the independent verifier restored it and showed it could).

And it resolves a hazard this stage had to rule on: with one agent per task and sequential phases, **no reader ever shares a tree with a mutator**. R2's ordering rule was a workaround for three concurrent lenses, one of which mutated; here the concurrency that created the hazard no longer exists.

**Context at stage level is carried by artefacts, not agents** — twelve tasks of history cannot fit one context, and should not. Every task writes `verification/task-N.md` in a fixed shape (three fenced tables: contract, claims, survivors), so the stage-end lenses grep the accumulated results instead of re-deriving twelve tasks of judgement.

### Step 3's three phases, in that order and no other

1. **Contract** — for every export the task produced, the name, shape and semantics its downstream consumers depend on, checked against the **code**, not the brief. Tier A: every export. Tier B: the exports that have a consumer. Narrow on purpose: this is what protects the fan-out column, where late repair is dearest.
2. **Claims** — every added or changed line of prose, *including the implementer's own report*, → a table of verdicts (true / false / stale / imprecise / unverifiable). First because it is mechanical, and because a claims pass run *after* a correctness pass reads each comment through the eyes of an agent that has already decided the code is right. It is also the class that **replicates**: Task 1's false sentences were inherited into later tasks.
3. **Mutation** — a deterministic checklist per artefact type: every constant · every guard, deleted and inverted · every default, made vacuous · every loop bound, ±1 and truncated · every tolerance, widened 10×–10⁴× · every clamp, arguments swapped · every error label · every documented invariant, violated. ~30 probes Tier A, ~12–20 Tier B. **Output is the survivor list only** — proving the caught mutants costs most of the tokens and carries almost none of the signal.

A missing artefact means the phase did not run. The controller checks the *shape* of the deliverables: a claim table with fewer rows than the diff has prose blocks is a skipped phase, not a clean diff.

### At stage end

| # | Who | Does |
|---|---|---|
| 7 | **script** | the same deterministic checklist across every module the stage touched → survivor table; agents read only the table. Coverage up, cost down: the hand-run passes cost 114k and 128k per task and produced exactly this artefact |
| 8 | three lenses, concurrent, **defined by question** | **Composition** — does the stage compose? cross-task seams, interfaces used as designed. **Behaviour** — does the code do what the spec requires? internals, markup, cross-file consistency. **Claims & Scope** — is every claim true (replication sweep across the cumulative diff, docs sweep), accessibility *against criteria that already exist*, deferred-minor triage, definition-of-done audit |
| 9 | fixers | fixes **staged per subsystem**, each re-verified before the next — never one giant round |
| 10 | controller | full gate; whole-branch review where the diff is large; ledger rulings → ADRs; plan moves to `stages/`; `state.md` + hook updated |

Overlap between the three lenses is expected and accepted. Partitioning them by artifact ("survivors crossing a module boundary") was the v2 proposal and is a soft line; this stage's evidence says overlap is cheap and has already paid — on Task 2 the measuring lens refuted one of the reasoning lens's claims and extended another.

---

## Invariants

1. The fixer never grades its own fix; the verifier never writes product code.
2. Nothing mutates while anything reads — guaranteed by one agent per task, sequential phases.
3. The gate runs only on a tree that matches `HEAD`.
4. Every claim in a report is either measured or marked unverified.
5. A Critical finding is never closed by a Tier B path: it promotes the task.

## Harness rules — mandatory, each from an incident in this stage

1. **Classify every probe on the runner's control line** (`N passed (N)`), never an exit code. A pass using `--reporter=basic` (absent in vitest 4.1.11) had every run die at startup and read the non-zero exit as a catch: 20 false positives.
2. **Never pipe the runner through `head`** — it killed a run mid-mutant and left a mutant in the tree.
3. **Verify restores by hash against `HEAD`**, not against the harness's own snapshot: a fixer's snapshot was a pre-edit blob, so its `[restored: …]` lines referred to a file that never shipped.
4. **A mutating agent works alone**; readers use copies extracted from the commit if any doubt exists.
5. **`git diff --quiet HEAD` before every gate run** — a left-behind `= {}` default passes all four commands while disabling the seam check.

---

## Tiering rule

Tier A — full depth — if **any** of: fan-out ≥ 3 downstream consumers · repair radius ≥ Medium · criticality high (a pure/numeric module, where a wrong value compiles, runs, looks fine and is wrong, unlike a presentational task where a defect is visible on inspection) · **the diff exceeds ~400 changed lines or touches ≥ 3 files**.

**Tier A = {1, 2, 3, 5}. Tier B = {4, 6, 7, 8, 9, 10, 11, 12}**, verified against the plan's Interfaces blocks (fan-out 5 · 7 · 3 · 2 · 4 · 1×5 · 1). The size trigger exists so an unclassified task cannot sit in Tier B by default, and the composite rule exists for a future stage with a low-fan-out, high-criticality task that fan-out alone would miss.

---

## Cost, and what it is measured against

| | |
|---|---|
| Baseline | Task 1 **948k** measured over seven dispatches; Task 2 tracking ~850–900k → twelve tasks ≈ **11.4M ± 0.6M**, plus "the close", unmeasured |
| Target | ≈ 12 × (95 implement + 160 verify + 90 fix + 20 post-fix, reusing the verifier's context) ≈ 4.4M, plus 1.4M at stage end ≈ **5.8M → 45–60% reduction** |
| Confidence | implementation cost is measured; verification cost is estimated from measured single-lens costs (114–164k each), which is why it is 130–190k and not the earlier 110–130k; per-task fix cost under the new regime is **unmeasured** |
| Commitment | recompute after Tasks 3–5 from the ledger's per-dispatch figures; fold in the close when Stage 2 closes; tighten or revise. The ADR records the rule and the measurement plan, **not** a savings figure |

---

## What is preserved, and what is traded

**Preserved or improved:** contract integrity, checked every task where late repair is dearest; duplicate-claim prevention; **test-teeth coverage, which goes up** — a scripted exhaustive sweep at stage end beats twelve hand-run samples; cross-task composition, invisible to per-task review; docs accuracy at the point the stage completes.

**Traded away, honestly:** earlier discovery of *internal*, non-contract defects in Tier B tasks. A wrong internal in Act 3 now surfaces at stage end rather than at Task 8. Tolerable because Tier B tasks have fan-out 1 — late repair is cheap exactly where depth is thin, and expensive exactly where depth is kept.

**Residual risk, stated:** the design rests on the stage-end pass being genuinely deep. If it is thin, the stage ships defects the current system would have caught. Its outputs are countable — a survivor table, a DoD audit, a claim-replication sweep — so an under-run pass is visible rather than invisible.

---

## Transition

Task 2 finishes under the current rules (its fix round is running). The new design applies from **Task 3**, so no task straddles two regimes. On approval: `run-a-stage` is edited to this workflow, and an ADR records the tiering rule, the trade, and the measurement plan.
