# Educraft — Documentation Index

This is the map. **Read this file, then read only what your task needs.**

Everything here is organised by **when it loads**, not by topic. See
[`KNOWLEDGE-BASE.md`](KNOWLEDGE-BASE.md) for the structure's rationale and the rules for
maintaining it — read that before adding or moving a document.

---

## Orientation — read first, in this order

| Need | Read |
|---|---|
| What this project is, and the rules that always apply | [`../CLAUDE.md`](../CLAUDE.md) — auto-loaded, no action needed |
| What is being worked on right now | [`projects/landing-redesign/state.md`](projects/landing-redesign/state.md) |
| What is blocked or unverified | [`platform/blockers.md`](platform/blockers.md) |
| How to verify a change | [`platform/verification.md`](platform/verification.md) |

The `SessionStart` hook prints the current branch, active project and next task automatically, so
you rarely need the first two by hand.

---

## Areas

| Area | Answers | Files |
|---|---|---|
| [`platform/`](platform/) | How do I build, test, deploy and debug this? How is a stage executed? What is blocked? | stack · verification · [execution](platform/execution.md) · deployment-env · security · blockers · history · [archive/](platform/archive/) (retired procedures, restorable) |
| [`architecture/`](architecture/) | How is the application put together? Where does code go? | routes · source-layout · layering · data-model |
| [`design/`](design/) | What are the visual rules? Why these colours? | system · palette · motion |
| [`surfaces/`](surfaces/) | How does each user-facing area work? | homepage · programme-pages · shell-and-nav · enquiry · seo |
| [`projects/`](projects/) | What is planned, in progress, or done? | landing-redesign · dashboard |
| [`projects/*/stages/README.md`](projects/landing-redesign/stages/README.md) | **Planning a stage that isn't planned yet?** Decided / open / prerequisites / leftover interfaces, per stage | landing-redesign |
| [`decisions/`](decisions/) | Why is it this way, and what did it cost? | numbered ADRs |

Per-subtree conventions do **not** live here — they are in `.claude/rules/`, which load
automatically when you open a matching file. See the table in
[`KNOWLEDGE-BASE.md`](KNOWLEDGE-BASE.md#the-five-load-classes).

---

## Migration map — where the old documents went

The old root-level documents were split on 2026-09-12. Each now exists as a short pointer stub.
This table is the authoritative old → new mapping.

### `EDUCRAFT_PRODUCTION.md` (780 lines) → `docs/`

| Old section | New home |
|---|---|
| §0 Document authority | [`KNOWLEDGE-BASE.md`](KNOWLEDGE-BASE.md) (replaced by the load-class model) |
| §1 Product identity & vision | [`platform/overview.md`](platform/overview.md) |
| §2 Current release / verification state | **Deleted** — volatile; superseded by `projects/*/state.md` and the hook |
| §3 Technology stack | [`platform/stack.md`](platform/stack.md) |
| §4 Route & application architecture | [`architecture/routes.md`](architecture/routes.md) |
| §5 Repository / source structure | [`architecture/source-layout.md`](architecture/source-layout.md) |
| §6 Design system | [`design/system.md`](design/system.md) + [`design/palette.md`](design/palette.md) |
| §7 Content & data architecture | [`architecture/data-model.md`](architecture/data-model.md) |
| §8 Homepage architecture | [`surfaces/homepage.md`](surfaces/homepage.md) |
| §9 Programme architecture | [`surfaces/programme-pages.md`](surfaces/programme-pages.md) |
| §10 WebGL / graphics architecture | [`design/motion.md`](design/motion.md) (graphics section) — *being retired, see the redesign* |
| §11 Motion / interaction architecture | [`design/motion.md`](design/motion.md) |
| §12 Navigation / shell / brand | [`surfaces/shell-and-nav.md`](surfaces/shell-and-nav.md) |
| §13 Enquiry / lead pipeline | [`surfaces/enquiry.md`](surfaces/enquiry.md) |
| §14 SEO / metadata | [`surfaces/seo.md`](surfaces/seo.md) |
| §15 Accessibility | [`platform/verification.md`](platform/verification.md) (a11y section) |
| §16 Performance | [`platform/verification.md`](platform/verification.md) (performance section) |
| §17 Security / data handling | [`platform/security.md`](platform/security.md) |
| §18 Engineering constraints | [`architecture/layering.md`](architecture/layering.md) + [`platform/verification.md`](platform/verification.md) |
| §19 Fixed bugs & lessons | [`platform/history.md`](platform/history.md) |
| §20 Verification / dev workflow | [`platform/verification.md`](platform/verification.md) |
| §21 Deployment / environment | [`platform/deployment-env.md`](platform/deployment-env.md) |
| §22 Current production blockers | [`platform/blockers.md`](platform/blockers.md) |
| §23 Historical context | [`platform/history.md`](platform/history.md) |
| §24 Dashboard project | [`projects/dashboard/`](projects/dashboard/) |
| §24.9 UploadThing → S3 | [`platform/deployment-env.md`](platform/deployment-env.md) (storage section) |
| §25 Background roadmap | [`projects/roadmap.md`](projects/roadmap.md) |
| §26 Landing redesign project | [`projects/landing-redesign/`](projects/landing-redesign/) |

### Other root documents

| Old | New home |
|---|---|
| `TECH-STACK.md` | [`platform/stack.md`](platform/stack.md) |
| `ARCHITECTURE_REVIEW.md` | [`architecture/layering.md`](architecture/layering.md) + [`platform/history.md`](platform/history.md) |
| `Landing-Redesign-Plan.md` | [`projects/landing-redesign/spec.md`](projects/landing-redesign/spec.md) |
| `Landing-Redesign-Stage-1-Implementation-Plan.md` | [`projects/landing-redesign/stages/stage-1.md`](projects/landing-redesign/stages/stage-1.md) |
| `Dashboard-Implementation-Plan.md` | [`projects/dashboard/plan.md`](projects/dashboard/plan.md) |
| `Dashboard-Stages-2-5-Implementation-Plan.md` | [`projects/dashboard/stages-2-5.md`](projects/dashboard/stages-2-5.md) |
| `README.md` | Kept — the GitHub entry point. Trimmed to point here. |

---

## Conventions for this documentation

- **One question per file.** If a file answers two unrelated questions, split it.
- **Stable and volatile never share a file.** Anything with a date, a version number, a
  commit SHA or a "next up" belongs in `projects/*/state.md` or a `decisions/` ADR — never in
  `platform/` or `architecture/`. This is the split that keeps the docs from going stale.
- **Cite rather than duplicate.** If two files need the same fact, one owns it and the other links.
- **Keep the load class honest.** Before adding a document, decide which of the five classes it
  belongs to ([`KNOWLEDGE-BASE.md`](KNOWLEDGE-BASE.md#the-five-load-classes)). A file that belongs
  in two classes belongs in the cheapest one, with a pointer from the other.
