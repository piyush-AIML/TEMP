# 0009 — Tiered verification: one verifier per task, depth at stage end

**Status:** accepted 2026-09-13 · **Supersedes:** the per-task three-lens regime in `run-a-stage`
**Note on numbering:** `0008` is already promised by shipped docstrings (`pathBuilders.ts`, and
`0006`'s append) to the seam-rule re-specification that Stage 2 will record at close. ADRs are
numbered by when they are written, so this one takes 0009 and that one keeps its promised number.

## Context

Task 1 of Stage 2 cost **948k tokens over seven dispatches** — one implementer, three concurrent
review lenses, a fix round, a scoped second round, and a verification pass. Task 2's *review alone*
was **438k** (146 + 164 + 128), more than Task 1's 396k, so review cost is not falling as the stage
proceeds. Twelve tasks at this rate is **≈11.4M ± 0.6M**, before the stage close, which has never
been measured.

What that spend bought is real and is recorded in the stage's ledger: a vacuous default that
satisfied the only test of a shipped guard, a curve whose shape was unpinned because the assertion
only checked for a `C` command, a docstring guarantee that fails for `n ≡ 1 (mod 32)`, and — in a
decision record — a measurement that was never made. None of these was found by the author of the
code, and the mutation pass found six classes the reading lenses could not.

But the cost is dominated by work whose marginal value is low: proving that 54 of 71 mutants were
caught, when the survivors are the entire signal; re-reading the same diff three times; and
re-deriving a task's intent in a fresh verification pass that a held agent already knows.

## Decision

**Per task: one verifier, spawned once, held for the task's whole lifecycle.**

It runs three phases in a fixed order — **contract** (every export's name, shape and semantics
against what downstream consumes, checked against the code, not the brief), **claims** (every
changed line of prose including the implementer's report, → true/false/stale/imprecise/unverifiable),
**mutation** (a deterministic checklist per artefact type; survivor list only; ~30 probes Tier A,
~12–20 Tier B). After the fix round the *same* agent is resumed for the post-fix re-check, so that
check is a re-check against tables it already holds rather than a re-derivation. It is never the
fixer.

**Tiering** decides mutation depth only, never whether a task is checked: Tier A if fan-out ≥ 3, or
repair radius ≥ Medium, or the task is a pure/numeric module where a wrong value compiles and looks
fine, or the diff exceeds ~400 lines / touches ≥ 3 files. Tier A = {1, 2, 3, 5}; Tier B = the rest.

**Escalation:** a Critical survivor or a failed contract check promotes that task to the previous
regime's full three-lens treatment.

**At stage end:** a scripted mutation sweep over every module the stage touched (coverage up, cost
down — the same artefact the hand-run passes produced at six figures each), then three lenses
defined by **question** rather than by artifact — Composition, Behaviour, Claims & Scope — then
fixes **staged per subsystem**, each re-verified before the next.

**Invariants:** the fixer never grades its own fix; nothing mutates while anything reads; the gate
runs only on a tree matching `HEAD`; every claim is measured or marked unverified; a Critical
finding is never closed by a cheap path.

## Consequences

**Preserved or improved.** Contract integrity is checked every task, where late repair is dearest.
Duplicate-claim prevention stays, and it is the class that replicates across tasks. Test-teeth
coverage *improves*: a scripted exhaustive sweep at stage end beats twelve hand-run samples.
Cross-task composition gets a dedicated lens, which per-task review structurally cannot provide.

**Traded, deliberately.** Internal, non-contract defects in Tier B tasks are found later — at stage
end rather than at their own task. This is tolerable because Tier B tasks have fan-out 1: late repair
is cheap exactly where depth is thin, and expensive exactly where depth is kept.

**Residual risk.** The design rests on the stage-end pass being genuinely deep. If it is thin, the
stage ships defects the previous regime would have caught. Its outputs are countable — a survivor
table, a definition-of-done audit, a claim-replication sweep — so an under-run pass is visible rather
than invisible.

**Cost if wrong:** the baseline measured 948k per task; the target is ~5.8M against 11.4M for the
whole stage (45–60% reduction), but the per-task fix cost under the new regime is **unmeasured**, so
that figure is a target with a measurement plan, not a fact. If Tasks 3–5 show the per-task cost
above ~190k for review or fixes not shrinking, the design is revised — the tiering rule and the
retained verifier are independent of each other, and either can be kept while the other is dropped.
The *effective* rollback is cheap: `run-a-stage` is a procedure file, and `git revert` restores the
previous regime mid-stage without touching any product code.

## Measurement plan

1. The ledger records every dispatch's token cost as the stage runs, rather than reconstructing them.
2. After Tasks 3–5 under the new regime, recompute the per-task table and compare with the 948k
   baseline. Tighten the band or revise the design.
3. Fold in the cost of the stage close, measured when Stage 2 closes, which the baseline has never
   included.
4. Report the recomputed figure to the owner with the same honesty required of every claim here:
   measured, or marked unverified.
