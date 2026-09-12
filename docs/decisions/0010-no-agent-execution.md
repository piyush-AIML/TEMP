# 0010 — No-agent execution: the operator does every step

**Status:** accepted 2026-09-13 · **Supersedes:** [ADR 0009](0009-tiered-verification-per-task-and-stage-end.md)
**Owner instruction:** archive the agent-driven workflows and run a plain procedure, with everything
revertible and no data lost.

## Context

Two agent-driven regimes were measured on this project:

| Regime | Per-task cost | Shape |
|---|---|---|
| Three concurrent lens reviewers (Tasks 1–2) | **949k**, **929k** | one implementer, three lenses, one fix round, one verification pass |
| One verifier held across the task (Task 3) | **516k** | implementer, one verifier in three phases, fix, resumed re-check |

Both worked: they found a vacuous default that satisfied the only test of a shipped guard, a curve
whose shape was unpinned because the assertion only checked for a `C` command, a false measurement
written into a decision record, an export with no reader, and a 1-ULP multiplication order. ADR 0009
already established that the mutation work is **mechanical** — a script's output — and that the saving
comes from not paying an agent to run it.

Where the regimes also cost something: an agent writing to a shared tree concurrently with another put
one task's staged files inside another's commit (`048af65`), a class of failure that exists only
because there is more than one writer.

The question this decision answers is narrower than "are agents good". It is: **for this repo, what is
each agent role actually buying, and can the operator do it directly?**

## Decision

**The operator — the assistant session — performs every step. No subagents. No skill drives the loop.**
The procedure is `docs/platform/execution.md`.

- Implementation, fixes and re-checks are ordinary work: the operator writes them.
- Verification becomes **three phases the operator runs in order** — contract, claims, mutation. The
  order is load-bearing: claims before mutation, because a claims pass run after the operator has
  decided the code is right reads each comment through that decision.
- The mutation phase keeps its checklist and its harness rules, unchanged; only the hands change.
- **Rule 1 replaces the independent reviewer:** a claim is verified by a command or marked unverified,
  never by the operator's reading. **Rule 2:** "unverified" is a first-class verdict, so an under-run
  pass is visible. **Rule 3:** the plan's own claims are verified at brief-extraction time.
  **Rule 4:** the owner receives the unverified list at stage end — the only genuinely independent
  check this procedure has left.
- Both retired regimes are archived verbatim, with the data they produced preserved.

## Consequences

**Kept or improved:** mutation coverage (scripted, so more complete than ad-hoc probing); the gate;
the ledger; cross-task sequencing; and the disappearance of every multi-writer hazard — the `048af65`
class cannot recur with one writer.

**Given up: the independent claims check.** This is the measured cost, not a hypothetical one. Across
Stage 2's first three tasks, essentially **every false claim in the shipped artefacts was authored by
the operator or passed through it**: "up to 0.5/N, 40vh" (the mean mistaken for the maximum, in four
places), "the ten invented values" (nine), "Task 10's page" (twice), a sentence attributed to ADR 0006
that lives in `station.ts` and `pathBuilders.ts`, `ACT_VIEW_BOX` with no reader — missed twice, found
by an agent checking consumers — and a false robustness bound. Each was found by a reader who had not
written it. Rules 1–2 mitigate this only if enforced literally.

**Cost if wrong:** the design's own instructions say quality is not to be traded, so if the claims
class gets worse, the revert is cheap and total (below). The measured baseline to compare against:
**949k / 929k / 516k** per task for the three regimes respectively.

## Reverting — both prior regimes are restorable

The three-lens text was **never committed**: it existed only as an uncommitted working-tree edit until
it was captured. Both files are verbatim, so restoration is a copy, not a reconstruction.

```bash
# back to the three-lens regime (Tasks 1-2, 949k/929k per task)
cp docs/platform/archive/run-a-stage-three-lens.md .claude/skills/run-a-stage/SKILL.md

# back to the tiered-verification regime (Task 3, 516k per task)
cp docs/platform/archive/run-a-stage-tiered-verification.md .claude/skills/run-a-stage/SKILL.md

# and, for either, point the documents back at the skill
#   CLAUDE.md · docs/INDEX.md · docs/KNOWLEDGE-BASE.md · state.md · stages/README.md
# each carries a one-line pointer that a revert must change back to "use the `run-a-stage` skill".
```

`ADR 0009` stays in the record and is superseded, not deleted — decisions here are append-only. If the
tiered regime is ever restored, it should be re-adopted by a new ADR rather than by editing this one.
