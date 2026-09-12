---
name: run-a-stage
description: Use when executing a stage from a project plan in Educraft — a multi-task implementation with review checkpoints. Sets up the brief/review/fix loop and the durable ledger, and records the failure modes this process exists to catch.
---

# Running a stage

A **stage** is an ordered set of tasks from `docs/projects/<project>/stages/`. This skill is the
execution loop: one fresh implementer per task, **one verifier held for that task's whole lifecycle**,
one fix round, a scripted mutation sweep and three lenses at stage end, and a ledger that survives
context loss.

Announce the approach, then run it without pausing between tasks. The user has asked to be
interrupted for decisions, not for progress.

## Setup

1. **Read** `docs/projects/<project>/state.md`, the stage plan, and the project `spec.md`. The spec
   is the authority; the plan is its argument. Where they conflict, **the spec wins** — and record
   the conflict as a ruling.
2. **Confirm the branch is not `main`** before any implementation.
3. **Open a ledger** at `.superpowers/sdd/<stage-plan-name>/progress.md`, first line naming the plan
   file. This is the recovery map: after a context reset, trust the ledger and `git log` over your
   own recollection. A controller without a ledger has re-dispatched completed tasks. **Record every
   dispatch's token cost in it** — the process redesign's measurement plan depends on that column
   existing rather than being reconstructed later.
4. **Run the pre-flight conflict scan** — for every pair of tasks sharing a file or interface, and
   for each task against its own text. Write the result as a **table**, not a verdict. This catches
   breakage before any code exists and is the cheapest gate in the process.
5. **Create the task briefs**, one per task, extracted **verbatim by line range** from the plan so no
   subagent reads the whole plan and no brief paraphrases its requirements.

## Per task

- Record `BASE=$(git rev-parse HEAD)` **before** dispatching.
- Dispatch a fresh implementer with: one line on where the task fits, **the brief path as its
  requirements**, interfaces from earlier tasks the brief cannot know, your resolution of any
  ambiguity you noticed, and the report-file path. Never paste accumulated history.
- Choose the model by task shape. Complete code in the plan = transcription, cheapest tier.
  Integration across files = mid tier. Design judgement = most capable.
- Implementers **never dispatch subagents**, and never a reviewer.
- **One verifier per task — spawned once, held until the task closes.** It runs three phases in a
  fixed order (below) and reports. It is *never* the fixer.
- **One fix round, containing every finding.** Merge the verifier's findings — Critical, Important
  *and* Minor — into a single dispatch. Fixing a Minor costs near nothing while the implementer is
  already in the file, and deferring it is what buys the next round. Require each fix to be
  **verified by measurement**, with the evidence pasted: fixes are where new defects enter.
- **Resume that same verifier** for the post-fix re-check, scoped to the fix's diff: did every fix
  land, did any fix introduce a new defect, is anything still open. Resumed rather than respawned —
  it already holds the contract table, the claim table and the survivor list, so this becomes a
  re-check against known expectations instead of a re-derivation. It keeps the property that must
  never be traded: **the verifier is not the fixer.** (Measured: a fixer justified leaving a deleted
  test unrestored by asserting it could not discriminate a mutant; the independent verifier restored
  it and showed it could.)
- **Escalation.** A Critical survivor or a failed contract check promotes the task to the full
  three-lens treatment of the previous regime. The cheap path must never be the reason something
  Critical went unexamined.
- Then **stop**. Anything still open that is not Critical goes to the ledger — and on to
  `docs/platform/blockers.md` only when it leaves something genuinely unverified or blocked;
  comment wording and other cosmetics do not belong there. Only a Critical finding justifies a
  second fix round.
- A finding that conflicts with the plan's own text is **yours to rule on**, not to dismiss and not
  to obey blindly. Record the ruling.
- **A finding that is a defect in the plan itself is fixed in the plan before the next brief is
  extracted.** Lenses read documents as well as code, and this is where dead exports, stale task
  numbers and misattributions surface — all real, all caught only because the next task had not been
  dispatched. Re-extract the affected briefs and verify each one still matches its plan range.

### The verifier's three phases, in this order and no other

1. **Contract** — for every export the task produced, the name, shape and semantics its downstream
   consumers depend on, checked against the **code**, not the brief. Narrow on purpose: this is what
   protects the fan-out column, where late repair is dearest.
2. **Claims** — every added or changed line of prose, **including the implementer's own report**, →
   a table with verdicts (true / false / stale / imprecise / unverifiable). First because it is
   mechanical, and because a claims pass run *after* a correctness pass reads each comment through
   the eyes of an agent that has already decided the code is right. It is also the class that
   **replicates**: one task's false sentences are inherited by the tasks written from the same plan.
3. **Mutation** — a deterministic checklist per artefact type: every constant · every guard, deleted
   and inverted · every default, made vacuous · every loop bound, ±1 and truncated · every tolerance,
   widened 10×–10⁴× · every clamp, arguments swapped · every error label · every documented
   invariant, violated. ~30 probes for a Tier A task, ~12–20 for Tier B. **Output is the survivor
   list only** — proving the caught mutants costs most of the tokens and carries almost none of the
   signal.

Each task writes `verification/task-N.md` in a fixed shape — three fenced tables — because **at stage
level context is carried by artefacts, not agents**: twelve tasks of history cannot fit one context
and should not. A phase that produced no artefact did not run; check the *shape* of the deliverables
(a claim table with fewer rows than the diff has prose blocks is a skipped phase, not a clean diff).

## Harness rules — mandatory, each from a recorded incident

1. **Classify every probe on the runner's control line** (`N passed (N)`), never on an exit code. A
   pass using `--reporter=basic` (absent in this repo's vitest) had every run die at startup and read
   the non-zero exit as a catch: 20 false positives.
2. **Never pipe the runner through `head`** — it killed a run mid-mutant and left a mutant in the tree.
3. **Verify restores by hash against `HEAD`**, not against the harness's own snapshot: a snapshot
   taken mid-task referred to a file that never shipped, so its `[restored: …]` lines were worthless.
4. **A mutating agent works alone.** Readers use copies extracted from the commit when any doubt
   exists. A reader that sees a mid-probe tree must distrust what it sees, not report it.
5. **`git diff --quiet HEAD` before every gate run.** A left-behind mutant can pass all four commands
   while disabling the very check the task added.

## Invariants

1. The fixer never grades its own fix; the verifier never writes product code.
2. Nothing mutates while anything reads — guaranteed by one agent per task, sequential phases.
3. The gate runs only on a tree that matches `HEAD`.
4. Every claim in a report is either measured or marked unverified.
5. A Critical finding is never closed by a cheap path: it promotes the task.

## Tiering

A task is **Tier A** (full depth) if **any** of: fan-out ≥ 3 downstream consumers · repair radius ≥
Medium · criticality high (a pure or numeric module, where a wrong value compiles, runs, looks fine
and is wrong, unlike a presentational task where a defect is visible on inspection) · the diff
exceeds ~400 changed lines or touches ≥ 3 files. The size trigger exists so an unclassified task
cannot sit in Tier B by default.

Anything else is Tier B. Tiering changes the *depth of the mutation phase*, never whether a contract
and claims check happens.

## Token discipline

- **Pass paths, not contents.** Every agent gets a generated diff file plus the paths it needs. Never
  inline a diff or paste a file into a prompt.
- **The controller runs the full gate once**, after the fix round. Agents run only the specific
  command needed to test a specific claim.
- **Tier the model by task shape, not by task importance:** transcription to the cheapest tier,
  integration across files to the mid tier, design judgement to the most capable. A verifier's job is
  measured verification, which is a different skill from authorship.
- **Survivors only.** A mutation pass reports the mutants that were *not* caught. The caught ones are
  a number, not a finding.

## What this process is for — the observed failure modes

Recorded because they all happened, and **none was caught by the author's own review**:

| Defect | Caught by |
|---|---|
| A test referencing types that did not exist yet, leaving the branch unbuildable | the **implementer** refusing to force it green |
| A spec requiring a mathematically impossible contrast band | the **implementer**, reporting NEEDS_CONTEXT |
| Two palette values that were invisible in the browser | the **palette test** |
| A primary CTA silently dropping to 2.64:1 | the **task reviewer** |
| A fix that itself dropped a config file out of typechecking | the **re-reviewer** |
| A palette record that would have gone stale silently on a sixth pillar | the **task reviewer** |
| A test comparing the function against the very constant under test, so wrong calibrations passed | the **gate-integrity lens** |
| Constants the next stage consumes, with no assertion anywhere | the **gate-integrity lens** |
| A guard that caught NaN *inputs* but not NaN *results*, against its own stated goal | the **claims lens** |
| A fix that introduced a false claim of completeness in a comment | the **claims lens** |
| A wrong commit attribution introduced by a fix | the **claims lens** |
| A vacuous default that satisfied the only test of the shipped chain, while the guard it replaced was deleted | the **mutation pass** |
| A curve whose *shape* was unpinned because the assertion only checked for a `C` command | the **mutation pass** |

The lesson: **breadth of verification is what finds defects, not depth of any one pass.** Expect
the plan to contain defects, and treat each gate as load-bearing rather than ceremonial.

The lesson underneath it: **sequential rounds manufacture their own duration.** A task's four
sequential rounds found, in order, the assertion hole; then a defect the first fix introduced; then a
hole the first two fixes had not reached; then the last unasserted constants. All four were findable
in the first pass by the three lenses above. The sequence was not evidence of depth — it was an
artifact of scoping each review to the previous round's diff and never measuring a fix. Nothing here
was found by looking harder; everything was found by looking *differently*.

## Two rules that keep reports honest

1. **A subagent must never invent work to satisfy a stated expected result.** If the brief says
   "expect 11 passing" and the code contains 9 assertions, the correct action is to report the
   discrepancy, not to write two more tests. This has happened twice and both times the brief was
   wrong.
2. **When a gate cannot be met, report the real state.** A red test, a failing build, or an
   unsatisfiable requirement is information. Forcing it green destroys the only evidence the gate
   produces.

## Closing a stage

- **Scripted mutation sweep** across every module the stage touched — the deterministic checklist,
  executed by a script, output read as a survivor table. This is where coverage goes up *and* cost
  comes down: hand-run passes cost six figures per task and produce exactly this artefact.
- **Three lenses, run concurrently, defined by question** — not by artifact, which is a soft line and
  produces arbitrary overlap:
  | Lens | The question |
  |---|---|
  | Composition | Does the stage compose? Cross-task seams, interfaces used as designed. |
  | Behaviour | Does the code do what the spec requires? Internals, markup, cross-file consistency. |
  | Claims & Scope | Is every claim true (replication sweep over the cumulative diff, docs sweep), does accessibility hold *against the criteria that already exist*, do the deferred minors triage cleanly, does the stage meet its definition of done? |
- **Fix in stages, per subsystem**, each re-verified before the next. One giant fix round
  concentrates the risk that fixes introduce defects — which is measured, not theoretical.
- Run the whole-branch review over the full range, pointed at the ledger's deferred minors so it can
  triage which must be fixed before merge.
- Verdict clean → **move the plan out of the live plans directory into
  `docs/projects/<project>/stages/`**, and update `state.md` and the SessionStart hook. A finished
  plan left in the live location costs tokens forever (see `docs/KNOWLEDGE-BASE.md` §7).
- **Convert the ledger's rulings into `docs/decisions/` ADRs.** The ledger is gitignored scratch; a
  ruling that dies with it was a decision made in secret.
- Report every ruling made on the user's behalf, with **what it cost if wrong**. That list is the
  only place those decisions reach them.
- **Do not begin the next stage** unless asked. Report, and stop.
