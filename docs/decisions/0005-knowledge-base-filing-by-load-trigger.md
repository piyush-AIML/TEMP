# 0005 — File documentation by load-trigger, not by topic

**Date:** 2026-09-12
**Status:** Accepted

## Context

Orienting a fresh session meant loading roughly **60,000 tokens** before any work: a 90 KB master
document, an 800-line design spec, and a 2,150-line stage plan. And even then a new session
re-derived the architecture from scratch.

The observed failure, in a single session: the master document went stale **three separate times** —
a version line naming the wrong commit, a section calling shipped work "awaiting the owner's
commit", and a route count the build contradicted. The cause was not carelessness. Its sections
interleaved **stable** facts (the layering contract, the engineering rules) with **volatile** ones
(current version, next project, deploy status), so every edit to the volatile half risked leaving
the stable half unread.

## Decision

**File content by load-trigger, not by topic** — and note the correction this contains. Claude Code
supports `@path` imports, so the intuitive structure is "one index that imports a dozen topic files".
**That does not reduce context**: the documented behaviour is that imported files load at launch,
exactly like inline text. An index that imports everything is 100% of the cost with better filing.

Every document therefore belongs to exactly one of five classes, each with a mechanism and a budget:
ALWAYS (`CLAUDE.md`, <200 lines) · PATH (`.claude/rules/*.md` with `paths:`) · INVOKE (skills) ·
SESSION (a `SessionStart` hook) · ONDEMAND (`docs/`, reached via `docs/INDEX.md`).

The primary cut *within* `docs/` is **stable vs volatile**, because that is the axis along which the
old documents failed. A paragraph with a date, a version, a commit SHA, a count, or the word "next"
belongs in a `state.md` or an ADR — never in `platform/`, `architecture/`, `design/` or `surfaces/`.

## Consequences

- Path-scoped rules are the single largest saving: subtree conventions cost **nothing** until a
  matching file is read, which is most of the time.
- `CLAUDE.md` is 89 lines and holds only invariants true for *every* task. The docs name the failure
  mode it avoids: *"if your CLAUDE.md is too long, Claude ignores half of it because important rules
  get lost in the noise."*
- **Plans gained a lifecycle.** Plan files are re-injected from disk after every compaction, so a
  *live* plan is load-bearing while a *finished* plan is history. A stage's plan moves from the plans
  directory to `docs/projects/<p>/stages/` the moment the stage closes — the most commonly forgotten
  step, and how an old plan sits in the root costing tokens forever.
- The full rationale and maintenance rules live in `docs/KNOWLEDGE-BASE.md`, which is deliberately
  the only place that explains the structure. `docs/INDEX.md` is the map.

## What it cost if wrong

The structure is more complex than one big document, and complexity is a real cost — it has to be
maintained, and a contributor who does not read `docs/KNOWLEDGE-BASE.md` will misfile things. The
mitigation is rule 6 of that file: when the structure stops feeling obvious, re-read it and update
the rules together. If it proves to be overhead rather than leverage, the content collapses back
into few files trivially, because nothing depends on the paths except the index.
