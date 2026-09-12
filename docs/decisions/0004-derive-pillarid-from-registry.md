# 0004 — Derive `PillarId` from the registry, so a sixth pillar fails the build

**Date:** 2026-09-12
**Status:** Accepted

## Context

Adding a sixth pillar required **8+ file edits across 8 files**, several of them pure mirroring, and
nothing failed loudly if one was missed. The sync was enforced by a comment reading *"keep in sync."*

Worse, there were **three independent hand-written copies of the pillar identity**, none tied to
each other:

- `PillarId`, a hand-typed union in `src/types/index.ts`
- `programmeColors`, an *unconstrained* object whose keys were never checked
- `PILLAR_IDS`, a literal array inside the palette test

Plus `PillarColorKey`, derived from the second, as a fourth.

The failure mode this produces is silence: a new pillar's palette is never measured against the AA
floors, the suite stays green, and the pillar renders with missing colours.

## Decision

`pillars` in `src/data/pillars.ts` is the **single source of truth**. `PillarId` and `PillarSlug`
are derived from it — `(typeof pillars)[number]['id']` — so adding an entry widens the union and
every `Record<PillarId, …>` in the codebase becomes a compile error until it is complete.

The six parallel `pillarStyles` maps collapse to one `pillarAccent` registry, with the old names
preserved as `Object.fromEntries` derivations so **no call site changed**. `COURSE_VERTICALS` keeps
its literal tuple (zod needs a tuple for inference) but gains a **bidirectional** compile-time
assertion against `PillarSlug`, so drift in either direction fails.

## Consequences

- **The compiler enumerates the work.** The runbook no longer lists files, because that list went
  stale within one task; the instruction is "run `tsc` and let it tell you". Last verified run
  produced exactly three error sites.
- **Two things `tsc` cannot catch** and which must be done deliberately: the `globals.css` tokens
  (all three blocks) and the programme entry in `src/data/programmes.ts`.
- The `graphic` field on the registry is text-tier, not graphic-tier, and is documented as such to
  stop Stage 3 reaching for the wrong one.
- **Residual gaps, deliberately accepted:** `EcosystemScene.tsx` hard-codes the count as
  `(Math.PI * 2 * i) / 5` so a sixth pillar would silently land on top of the first, and
  `ProgrammeGraphic`'s per-id chain has no fallback so a sixth renders an empty SVG. Both are visual,
  both are in components slated for retirement, and neither is a compile-time-expressible
  constraint.

## What it cost if wrong

The derivation makes `Pillar.id` a `string` on the interface while the union comes from the array —
slightly indirect, and the type-only re-export between `types/` and `data/` looks like a cycle to a
reader (it is erased at compile time; it is not one). If the indirection ever becomes a
maintenance problem, the fallback is to inline the union and accept the drift risk this decision
exists to remove.
