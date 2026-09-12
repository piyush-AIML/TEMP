# The Knowledge Base — architecture and rationale

**Read this before adding, moving, or splitting any document in this repo.** It explains why the
documentation is shaped the way it is, so you can extend it consistently instead of guessing.

Last restructured: **2026-09-12**.

---

## 1. The problem this solves

Before this restructure, orienting a fresh session meant loading roughly **60,000 tokens** before
any work could start: `EDUCRAFT_PRODUCTION.md` (~90 KB), the live design spec (~800 lines) and the
active stage plan (~2,150 lines). And even then a new session re-derived the architecture from
scratch, because those documents mixed content of different *currency* in the same file.

Observed failure, in one session: `EDUCRAFT_PRODUCTION.md` went stale **three separate times**
— a version line naming the wrong commit, a section calling shipped work "awaiting the owner's
commit", and a route count that contradicted the build. The cause was not carelessness. §0–26
interleaved **stable** facts (the layering contract, the engineering rules) with **volatile** ones
(current version, next project, deploy status), so every edit to the volatile half risked leaving
the stable half unread.

## 2. The one principle

> **File content by load-trigger, not by topic.**

This is a correction to what seems like the obvious design. Claude Code supports `@path`
imports, so the intuitive structure is "one index file that imports a dozen topic files." **That
does not work.** The documented behaviour is that imported files load and enter the context window
at launch — exactly like inline text:

> *"Splitting into `@path` imports helps organization but doesn't reduce context, since imported
> files load at launch."*
> — [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory.md)

So an index that imports everything is **100% of the cost with better filing**. Imports are a
*reading* convenience, never a token strategy. The only thing that reduces what a session pays is
making content load **later** — or not at all.

**Corollary — the test for any new document:** *when does this need to be in context?* If you
cannot answer with one of the five classes below, you have not finished deciding where it goes.

## 3. The five load classes

Every document in this repo belongs to exactly one. The class determines the mechanism, and the
mechanism determines the budget.

| Class | Mechanism | Budget | Loads when | Holds |
|---|---|---|---|---|
| **ALWAYS** | `CLAUDE.md` at repo root | **< 200 lines** | every request | Invariants true for *every* task: the gate command, non-obvious gotchas, repo etiquette |
| **PATH** | `.claude/rules/*.md` with `paths:` frontmatter | ~100 lines each | Claude reads a matching file | Conventions for one subtree |
| **INVOKE** | `.claude/skills/<name>/SKILL.md` + sibling reference files | **< 500 lines** per `SKILL.md` | the skill is invoked | Procedures: verify, add-a-pillar. **Stage execution is deliberately *not* a skill** — it is `platform/execution.md`, an ONDEMAND document the assistant follows directly, with the agent-driven predecessors archived beside it |
| **SESSION** | `SessionStart` hook (`.claude/hooks/`) | **< 20 lines of output** | turn one, and again after compaction | *Dynamic* state: branch, active project, next task |
| **ONDEMAND** | `docs/**`, reached via `docs/INDEX.md` | unbounded | Claude reads it deliberately | Specifications, plans, ADRs, history |

### The budget is not arbitrary

- **CLAUDE.md < 200 lines** is the documented target. The docs also name the failure mode outright:
  *"if your CLAUDE.md is too long, Claude ignores half of it because important rules get lost in
  the noise."* A long CLAUDE.md is worse than a short one, not just more expensive.
- **Skill `description` ≤ 1,536 characters** — descriptions of *every* available skill are in
  context on every turn. The body loads only on invoke. This is why skills are the right home for
  procedures: the index cost is charged once per skill, not once per task.
- **`MEMORY.md` = first 200 lines or 25 KB**, whichever comes first. Topic files beside it are
  **never** loaded at startup.

## 4. Why the split is stable-vs-volatile, not topic

The primary cut inside `docs/` is **currency**, because that is the axis along which the old
documents failed:

```
docs/platform/      stack · verification · execution · deployment-env · security · blockers · history
                    archive/  ← retired procedures, kept verbatim and restorable
docs/architecture/  routes · source-layout · layering · data-model
docs/design/        system · palette · motion
docs/surfaces/      homepage · programme-pages · shell-and-nav · enquiry · seo
docs/projects/      <project>/state.md          ← VOLATILE: dates, SHAs, "next up"
                    <project>/spec.md           ← stable
                    <project>/stages/*.md       ← stable, one per stage
docs/decisions/     NNNN-*.md                   ← append-only
```

**A test that catches most violations:** if a paragraph contains a date, a version, a commit SHA,
a count, or the words "next" or "currently", it belongs in a `state.md` or an ADR — never in
`platform/`, `architecture/`, `design/` or `surfaces/`. Those four areas should be true in a year.

## 5. Where conventions live — and the pointer pattern

Per-subtree conventions are **rules**, not docs, because their trigger is "I am editing this
subtree". A rule holds the ~20% that applies to almost every edit there, plus a pointer to the
detail file. It never duplicates the detail.

| Rule | Fires on |
|---|---|
| `.claude/rules/marketing-site.md` | `src/app/(site)/**`, `src/components/educraft/**` |
| `.claude/rules/dashboard.md` | `src/app/dashboard/**`, `src/components/dashboard/**` |
| `.claude/rules/design-tokens.md` | `src/app/globals.css`, `src/design/**`, `src/lib/pillarStyles.ts` |
| `.claude/rules/lib-layers.md` | `src/lib/**`, `src/data/**` |
| `.claude/rules/platform.md` | `prisma/**`, `*.config.*`, `.env.example`, `src/proxy.ts` |

Two documented details worth knowing:

- Path-scoped rules cost **nothing** until a matching file is read. This is the single largest
  saving in the whole design — most conventions are only relevant while editing their subtree.
- The `paths:` expansion budget is **1,000 glob patterns and 4 MiB per rule**. Brace-free patterns
  do not count against it. Multiple brace groups multiply (`{a,b}/{c,d}/*.{ts,tsx}` = 8 patterns).

## 6. The `SessionStart` hook does the heavy lifting

Everything above decides what a session pays *once it starts working*. The hook is what kills
"understand everything from scratch", because it is the **only** documented way to inject dynamic
text at turn one. For `SessionStart` (and `UserPromptSubmit`, `UserPromptExpansion`,
`PostModelSwitch`) plain stdout enters context; for every other hook event it does not.

Two constraints that are easy to get wrong:

1. **It needs a second matcher for `compact`.** Context added by hooks earlier in the session is
   summarized away on compaction — which is precisely why `compact` exists as a re-injection point.
   A hook registered only for `startup` goes silent partway through a long session.
2. **`mcp_tool` hooks do not work on `SessionStart` at launch** — they fire before MCP servers are
   available and are silently skipped. Use `type: "command"`.

The hook prints a state of play, not documentation: branch, active project, next task, the gate
command, and the one constraint a new session gets wrong. If it grows past ~20 lines it has become
a document and belongs in `docs/`.

**The hook reads one heading in `state.md` by name, so that wording is a contract.** It matches the
phrase **"Immediate next action"** case-insensitively — deliberately *not* the section number, so
reordering does not silently break it — and prints the first few lines beneath. Both current
`state.md` files follow:

```
## 1. Where we are
## 2. Immediate next action
## 3. Blocked
## 4. Do not get wrong
```

Rename that section and the hook quietly prints nothing for it, which is precisely the kind of silent
failure this structure exists to prevent. Change `.claude/hooks/state-of-play.sh` in the same edit.

## 7. Plans have a lifecycle — respect it

Claude Code **re-injects the plan file from disk after every compaction**. That makes a *live* plan
a load-bearing artifact, not just a note: it is one of the few things guaranteed to survive a
context reset.

The consequence is that a plan has two states and should live in two places:

| State | Lives | Why |
|---|---|---|
| **Live** — currently being executed | `.claude/plans/` or the plans directory | Re-injected on compaction; cheap persistence |
| **Complete** | `docs/projects/<p>/stages/stage-N.md` | It is now history; loading it every session would be waste |

**Move a plan between those two states the moment its stage closes.** This is the single most
commonly forgotten step, and it is why an old stage plan can sit in the root costing tokens
forever.

## 8. Decisions must be durable

Every non-obvious choice made under uncertainty belongs in `docs/decisions/` as a numbered ADR,
with **what it cost if wrong**. During the landing-redesign Stage 1 alone, fourteen such decisions
were made and recorded only in a gitignored scratch ledger — decisions that cost a rework round and
then would have evaporated.

A ruling that dies with a scratch directory was a decision made in secret. If you make a call that
someone might need to reverse, write it down here.

## 9. Maintenance rules

1. **Adding a document:** pick its load class first (§3). If it fits two, put it in the cheaper one
   and point at it from the other.
2. **Before editing `platform/`, `architecture/`, `design/` or `surfaces/`:** apply the
   stable-vs-volatile test (§4). Volatile content goes to `state.md` or an ADR.
3. **When a stage closes:** move its plan out of the live plans directory into
   `docs/projects/<p>/stages/`, and update `state.md` and the hook.
4. **Never `@import` content into `CLAUDE.md`.** Mention paths as text instead — that keeps them
   load-on-demand, which is the entire point.
5. **When `CLAUDE.md` approaches 200 lines:** move a rule to `.claude/rules/` or a procedure to a
   skill. Do not let it grow.
6. **Re-read this file when the structure stops feeling obvious** — and if you change the structure,
   update §3, §5 and `docs/INDEX.md` together.

`/context` lists what actually loaded, which is the honest way to check that this design is working
rather than assuming it. `/doctor` proposes trims for an oversized `CLAUDE.md`.
