---
name: add-a-pillar
description: Use when adding a sixth (or later) pillar/vertical to Educraft, or when asked how a new pillar or vertical would be introduced. Because adding one is now enforced by the compiler, this skill is mainly about doing the non-compile steps deliberately.
---

# Adding a pillar

A **pillar** is one of the five verticals (Learn · Include · Thrive · Achieve · Excel). Each owns a
`PillarId`, a vertical slug, a palette identity, and exactly one programme.

**Distinguish the three things first** — they are not the same work:

| | New **course** | New **programme** | New **pillar** |
|---|---|---|---|
| What it is | a DB row (`Course`) | TS data in `src/data/programmes.ts` | a whole vertical |
| Created by | admin, at runtime | developer | developer |
| Needs deploy | **no** | yes | yes |
| Touches the landing page | **never** | changes a station's detail page | **changes the walk itself** |

**A course never touches the landing page.** The marketing site is *pillar*-driven; courses are a
dashboard concept. Do not add a course to `pillars`.

## The runbook

1. **Add one object to `pillars`** in `src/data/pillars.ts` with `id`, `slug`, `name`, `vertical`,
   `short`, `description`. The slug must match the programme's slug exactly.

2. **Add its accent object to `pillarAccent`** in `src/lib/pillarStyles.ts` — all eight fields.

3. **Run `npx tsc --noEmit` and let the compiler enumerate the rest.** Every remaining gap is a
   compile error, not a silent break. The last verified run produced exactly three, and this list
   is what it actually reported — but **trust the compiler, not this list**, because the list has
   already gone stale once:

   | Error site | Why |
   |---|---|
   | `lib/pillarStyles.ts` — `pillarAccent` | `Record<PillarId, PillarAccentClasses>` is a checked literal; the new key is missing |
   | `graphics/EcosystemGraphic.tsx` — `POSITIONS` | a second `Record<PillarId, {x,y}>` literal *(disappears once that component is retired)* |
   | `lib/validators/courses.ts` — the slug assertion | surfaces as `Type 'true' is not assignable to type 'never'`, which is the check working |

   The six back-compat re-exports below `pillarAccent` need **no** edit — they are
   `Object.fromEntries` derivations, so a new key flows through automatically.

4. **Then do the two things the compiler does NOT catch** — these are silent if you skip them:
   - `globals.css`: add the pillar's `--ec-p-*`, `-graphic` and `-soft` vars to **all three** of
     `@theme inline`, `:root` and `.dark`.
   - `src/data/programmes.ts`: add the programme, or the station renders without a link target.

5. **Run the palette test and the gate.** `npm run test` must pass — it now derives its pillar list
   from the registry, so a new pillar is measured automatically. Then run the `verify` skill's gate.

6. **Update the two places that describe the count** if they state a number: the homepage headline
   copy and any "five verticals" prose.

## Why this is safe now

`PillarId` is derived from the `pillars` array, so adding an entry widens the union and every
`Record<PillarId, …>` fails to compile until it is complete. Before that change, a sixth pillar
needed eight-plus edits enforced only by a comment reading "keep in sync", and nothing failed
loudly when one was missed.

## Reference

See [reference.md](reference.md) for the measured palette values, the AA floors, and the reserved
accent slots for pillars 6 and 7.
