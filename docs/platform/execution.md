# How a stage is executed — the no-agent procedure

**In force from 2026-09-13.** This document *is* the procedure; no skill and no subagent drives it.
The operator is the assistant session, and it does every step itself: implementation, verification,
fixes.

**What it supersedes — both archived, both restorable:**

| Regime | Archived procedure | Design/decision |
|---|---|---|
| Three concurrent lens reviewers per task | [`archive/run-a-stage-three-lens.md`](archive/run-a-stage-three-lens.md) | — (Tasks 1–2 ran under it) |
| One verifier per task, depth at stage end | [`archive/run-a-stage-tiered-verification.md`](archive/run-a-stage-tiered-verification.md) | [`archive/tiered-verification-design.md`](archive/tiered-verification-design.md) · [ADR 0009](../decisions/0009-tiered-verification-per-task-and-stage-end.md) |

The change itself is [ADR 0010](../decisions/0010-no-agent-execution.md), which records the trade and
the revert path.

## What replaces what

| Retired agent role | Now |
|---|---|
| implementer | the operator writes the code, from the brief |
| three lens reviewers | **three phases the operator runs in order** — contract, claims, mutation |
| fix round | the operator fixes, one round, every finding |
| verification pass / post-fix re-check | the operator re-checks against the same tables |

The mutation phase is unchanged in substance — it was always mechanical, and it is the one that found
the vacuous default, the unpinned curve shapes and the 1-ULP multiplication order.

## Per task

1. Record `BASE=$(git rev-parse HEAD)`. Tree check: `git status --short` must show only known files.
2. Read the brief's line range from the plan (`.claude/plans/<plan>.md`) — **ranges, not whole files**,
   because every read now lands in the operator's own context.
3. Implement. Run the gate: `npx tsc --noEmit && npm run lint && npm run test && npm run build`.
4. Generate the diff to a file and read *that*, not the files:
   `{ echo "## Commit message"; git log -1 --format=%B; echo "## Diff"; git diff $BASE..HEAD; } > .stage/sdd/<stage>/reviews/task-N.diff`
5. **Phase 1 — Contract.** For every export the task produced: what do downstream consumers depend on,
   and does the code deliver it? `grep -rn "<exportName>" src/ | grep -v <own test file>`. Record a table.
6. **Phase 2 — Claims.** Extract every added/changed prose line and put it in a table with a verdict —
   `git diff $BASE..HEAD | grep -E '^\+\s*(\*|//|#)'` — then verify each **with a command**.
7. **Phase 3 — Mutation.** Work the checklist below, one probe at a time, recording the survivor list.
8. Fix findings (one round, everything — Minor included), then re-check against the tables from 5–7.
9. Gate; tree check; rewrite the ledger entry with the measured cost; close the task.

## The three phases

**Contract** — checked against the code, never the brief. Tier A tasks (fan-out ≥ 3, or pure/numeric,
or a diff over ~400 lines) get every export; others get the exports that have a consumer.

**Claims** — every changed comment, docstring, commit-message sentence, and the operator's own report.
Verdicts: **true / false / stale / imprecise / unverifiable**. Run it *before* the mutation phase,
because a claims pass run after the operator has decided the code is right reads each comment through
that decision. It is also the class that replicates into later tasks.

**Mutation** — for each artefact type in the diff: every constant · every guard, deleted and inverted ·
every default, made vacuous · every loop bound, ±1 and truncated · every tolerance, widened 10×–10⁴× ·
every clamp, arguments swapped · every error label · every documented invariant, violated.
**Report the survivors only** — proving the caught ones costs most of the work and carries almost none
of the signal.

The recipe, per probe:

```bash
cp src/path/file.ts /tmp/probe.bak            # snapshot (never trust a snapshot over HEAD, though)
# ...edit the file to introduce exactly one mutation...
npx vitest run src/path/file.test.ts > /tmp/probe.out 2>&1; echo "exit=$?"
grep -E "Tests +[0-9]+ (passed|failed)|Test Files" /tmp/probe.out   # the CONTROL LINE is the verdict
git checkout HEAD -- src/path/file.ts          # restore
md5sum src/path/file.ts && git show HEAD:src/path/file.ts | md5sum   # and prove the restore
```

## Four rules that replace "independent eyes"

1. **A claim is verified by a command, or marked unverified — never by the operator's reading.** This
   is the mutation discipline applied to prose, and it is the load-bearing rule of this procedure.
2. **"Unverified" is a first-class verdict**, not a failure to finish. The list is countable, so an
   under-run pass stays visible instead of invisible.
3. **The plan's own claims are verified at brief-extraction time** — counts, paths, line references —
   because the plan is measurably where most false claims originate here.
4. **The owner gets the unverified list at stage end.** A human reader is the only genuinely
   independent check this procedure has left.

## Harness rules — mandatory, each from a recorded incident

1. Classify every probe on the runner's **control line** (`N passed (N)`), never an exit code. A run
   using an unsupported reporter died at startup and read the failure as a catch: 20 false positives.
2. **Never pipe the runner through `head`** — it killed a run mid-mutant and left a mutant in the tree.
3. **Hash-verify every restore against `HEAD`**, never against your own snapshot: a snapshot taken
   mid-task referred to a file that never shipped.
4. **`git diff --quiet HEAD` before every gate run.** A left-behind mutant can pass all four commands
   while disabling the very check the task added.
5. **One writer at a time.** With no subagents this is now automatic — but it is the rule whose
   absence put one agent's staged files inside another's commit.

## Data on disk

| Artefact | Location | Purpose |
|---|---|---|
| Ledger | `.stage/sdd/<stage>/progress.md` | the recovery map: rulings, per-task state, measured cost, the deferred list |
| Briefs | `.stage/sdd/<stage>/briefs/task-N.md` | generated by `.stage/sdd/extract-briefs.py`, verified byte-identical to the plan |
| Reports | `.stage/sdd/<stage>/reports/task-N.md` | what was done and what was measured |
| Diffs | `.stage/sdd/<stage>/reviews/task-N.diff` | the review subject, never inlined |
| Verification tables | `.stage/sdd/<stage>/verification/task-N.md` | contract · claims · survivors, the interface the stage-end pass reads |

`.stage/` is gitignored: it is the run's scratch, not the repo's content. **Write rulings to the
ledger as they happen** — with context growing in one window, a summary that loses them is the main risk.

## At stage end

1. The same mutation checklist, applied in bulk across every module the stage touched → a survivor table.
2. Three lenses, worked as checklists: **Composition** (does the stage compose? every cross-task
   reference resolves), **Behaviour** (does the code do what the spec requires?), **Claims & Scope**
   (replication sweep over the cumulative diff, the docs sweep, the definition-of-done audit,
   accessibility against the criteria that already exist, deferred-minor triage).
3. Fixes staged per subsystem, each re-checked before the next.
4. Whole-branch review over the full range; ledger rulings → ADRs; the plan moves to
   `docs/projects/<project>/stages/`; `state.md` and the SessionStart hook updated.

## What this costs, honestly

**Kept:** mutation coverage (scripted, so more complete than ad-hoc probing), the gate, the ledger
discipline, cross-task sequencing, and the disappearance of every concurrency hazard.

**Given up: the independent claims check** — and this is the measured part. Across Stage 2's first
three tasks, essentially every false claim in the shipped artefacts was authored by the operator or
passed through it: "up to 0.5/N, 40vh" (the mean mistaken for the maximum, in four places), "the ten
invented values" (nine), "Task 10's page" (twice), a sentence attributed to ADR 0006 that lives in two
source files, an export with no reader (missed twice), and a false robustness bound. Each was caught
by a reader who had not written it. Rules 1–2 above are the only mitigation, and they work only if
enforced literally.

**Baseline for comparison:** the three-lens regime measured **949k** and **929k** per task; the tiered
regime measured **516k** on its first task (Task 3), though per diff-line the review rate was
unchanged, so part of that is task size rather than regime.

## Skills and plugins

Skills remain installed — `verify` (the gate's explainer), `add-a-pillar` (the runbook) — but **no
skill drives execution**; this document does. `run-a-stage` was archived and removed from
`.claude/skills/` on 2026-09-13. The superpowers plugin itself is **not** controlled from this repo:
`.claude/settings.json` carries only `hooks` and `permissions`, so its enablement lives in the user's
Claude Code configuration and must be changed there.
