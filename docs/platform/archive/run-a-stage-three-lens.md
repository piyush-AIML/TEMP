---
name: run-a-stage
description: Use when executing a stage from a project plan in Educraft — a multi-task implementation with review checkpoints. Sets up the brief/review/fix loop and the durable ledger, and records the failure modes this process exists to catch.
---

> **ARCHIVED — the three-lens regime.** This is the execution procedure as it stood when Stage 2 opened
> (Tasks 1–2 ran under it). It was **never committed**: it existed only as an uncommitted working-tree
> edit of `.claude/skills/run-a-stage/SKILL.md` until it was captured here on 2026-09-13, immediately
> before the workflow moved to a no-agent procedure. The copy below is verbatim.
>
> **To restore it:** `cp docs/platform/archive/run-a-stage-three-lens.md .claude/skills/run-a-stage/SKILL.md`
> — and see `docs/decisions/0010` for what else a revert requires (the pointers in `CLAUDE.md`,
> `state.md`, `stages/README.md` and `docs/INDEX.md`).
>
> **What it is:** one implementer per task; **three lens reviewers dispatched concurrently** over the
> task diff — correctness, gate integrity (mutation-probing), claims-vs-reality; one merged fix round
> containing every finding; one verification pass over the cumulative diff; a ledger at
> `.superpowers/sdd/<stage>/progress.md`.
>
> **Measured cost, for the record:** Task 1 **949k** tokens over seven dispatches; Task 2 **929k** over
> six. Review alone was 396k and 438k respectively.

# Running a stage

A **stage** is an ordered set of tasks from `docs/projects/<project>/stages/`. This skill is the
execution loop: one fresh subagent per task, one breadth review, one fix round, one verification
pass, and a ledger that survives context loss.

Announce the approach, then run it without pausing between tasks. The user has asked to be
interrupted for decisions, not for progress.

## Setup

1. **Read** `docs/projects/<project>/state.md`, the stage plan, and the project `spec.md`. The spec
   is the authority; the plan is its argument. Where they conflict, **the spec wins** — and record
   the conflict as a ruling.
2. **Confirm the branch is not `main`** before any implementation.
3. **Open a ledger** at `.superpowers/sdd/<stage-plan-name>/progress.md`, first line naming the plan
   file. This is the recovery map: after a context reset, trust the ledger and `git log` over your
   own recollection. A controller without a ledger has re-dispatched completed tasks.
4. **Run the pre-flight conflict scan** — for every pair of tasks sharing a file or interface, and
   for each task against its own text. Write the result as a **table**, not a verdict. This catches
   breakage before any code exists and is the cheapest gate in the process.
5. **Create the task briefs**, one per task, extracted from the plan so no subagent reads the whole
   plan.

## Per task

- Record `BASE=$(git rev-parse HEAD)` **before** dispatching.
- Dispatch a fresh implementer with: one line on where the task fits, **the brief path as its
  requirements**, interfaces from earlier tasks the brief cannot know, your resolution of any
  ambiguity you noticed, and the report-file path. Never paste accumulated history.
- Choose the model by task shape. Complete code in the plan = transcription, cheapest tier.
  Integration across files = mid tier. Design judgement = most capable.
- Implementers **never dispatch subagents**, and never a reviewer.
- **One breadth review, run in parallel.** Dispatch the three lens reviewers *concurrently* over the
  same task diff (generated to a file, never inlined), with the brief + report + global constraints
  as each one's attention lens. Three lenses in one round, because sequential reviews find one layer
  at a time — that is exactly how a four-round loop happens. Never pre-judge findings for a
  reviewer: no "do not flag", no "at most Minor".
- **One fix round, containing every finding.** Merge all three lenses' findings — Critical,
  Important *and* Minor — into a single dispatch. Fixing a Minor costs near nothing while the
  implementer is already in the file, and deferring it is what buys the next round. Require each fix
  to be **verified by measurement**, with the evidence pasted: fixes are where new defects enter,
  and a fix whose claim nobody measured is the next round's finding.
- **One verification pass**, over the **cumulative** task diff — not the fix diff alone. Its only
  job: did every fix land, did any fix introduce a new defect, is anything still open. This is where
  a fix that breaks something gets caught inside the same task instead of the next one.
- Then **stop**. Anything still open that is not Critical goes to the ledger — and on to
  `docs/platform/blockers.md` only when it leaves something genuinely unverified or blocked;
  comment wording and other cosmetics do not belong there. Only a Critical finding justifies a
  second fix round.
- A finding that conflicts with the plan's own text is **yours to rule on**, not to dismiss and not
  to obey blindly. Record the ruling.

### The three lenses

One reviewer with one lens finds one class of defect. Three lenses over one diff find the classes at
the same time.

| Lens | Asks | Catches |
|---|---|---|
| **Correctness** | Is the behaviour right? Arithmetic, edge cases, interface shape, consumers, type safety | wrong values, name collisions, unguarded inputs |
| **Gate integrity** | **Would this test fail if the code were wrong?** Mutation-probe it — do not read it | assertions that pin nothing, constants with no coverage, tests that move with the value |
| **Claims vs reality** | Is every comment, doc line and report claim *true* — checked against the code and against measurement? | false justifications, stale figures, wrong attribution, claims of completeness |

Gate integrity is the highest-yield lens in this repo: there is no local runtime, so the suite is
the only automated gate and a hole in it is a hole in everything downstream. Claims-vs-reality is
the cheapest and the one most often skipped — it is what catches a fix that quietly made a comment
false.

## Token discipline

Collapsing the loop is the main saving — four rounds became one. Three more, none of which costs
quality:

- **Pass paths, not contents.** Every reviewer gets a generated diff file plus the paths it needs.
  Never inline a diff or paste a file into a prompt.
- **The controller runs the full gate once**, after the fix round. Reviewers run only the specific
  command needed to test a specific claim. Three parallel reviewers each re-running
  `tsc && lint && test && build` is the same answer bought four times.
- **Tier the model by task shape, not by task importance:** transcription to the cheapest tier,
  integration across files to the mid tier, design judgement to the most capable. A reviewer's job
  is measured verification, which is a different skill from authorship.

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

The lesson: **breadth of verification is what finds defects, not depth of any one pass.** Expect
the plan to contain defects, and treat each gate as load-bearing rather than ceremonial.

The lesson underneath it: **sequential rounds manufacture their own duration.** One task's four
rounds found, in order, the assertion hole; then a defect the first fix introduced; then a hole the
first two fixes had not reached; then the last unasserted constants. All four were findable in the
first pass by the three lenses above. The sequence was not evidence of depth — it was an artifact of
scoping each review to the previous round's diff and never measuring a fix. Nothing here was found
by looking harder; everything was found by looking *differently*.

## Two rules that keep reports honest

1. **A subagent must never invent work to satisfy a stated expected result.** If the brief says
   "expect 11 passing" and the code contains 9 assertions, the correct action is to report the
   discrepancy, not to write two more tests. This has happened twice and both times the brief was
   wrong.
2. **When a gate cannot be met, report the real state.** A red test, a failing build, or an
   unsatisfiable requirement is information. Forcing it green destroys the only evidence the gate
   produces.

## Closing a stage

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
