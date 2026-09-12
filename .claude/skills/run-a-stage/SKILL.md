---
name: run-a-stage
description: Use when executing a stage from a project plan in Educraft — a multi-task implementation with review checkpoints. Sets up the brief/review/fix loop and the durable ledger, and records the failure modes this process exists to catch.
---

# Running a stage

A **stage** is an ordered set of tasks from `docs/projects/<project>/stages/`. This skill is the
execution loop: one fresh subagent per task, a review after each, a bounded fix loop, and a ledger
that survives context loss.

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
- On report: review the diff via a generated diff file, with the brief + report + the global
  constraints as the reviewer's attention lens. Never pre-judge findings for a reviewer — no
  "do not flag", no "at most Minor".
- Fix loop: **max 5 rounds.** Rounds 1–3 resume the same implementer; 4–5 dispatch fresh on a more
  capable model. Every round ends with a scoped re-review of the fix diff only.
- Minor findings go to the ledger and are triaged by the final review. They never extend the loop.
- A finding that conflicts with the plan's own text is **yours to rule on**, not to dismiss and not
  to obey blindly. Record the ruling.

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

The lesson: **breadth of verification is what finds defects, not depth of any one pass.** Expect
the plan to contain defects, and treat each gate as load-bearing rather than ceremonial.

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
