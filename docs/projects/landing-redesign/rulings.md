# Landing redesign — Stage 1 rulings ledger

Decisions taken on the owner's behalf during Stage 1, each with **what it cost if wrong**. These
were made while executing, not while designing, so they are recorded here rather than as individual
ADRs — but they are durable, because several cost a rework round and were originally recorded only
in gitignored scratch.

Format: **what was decided** — why — cost if wrong.

## Pre-flight

**Work stayed in the existing checkout on branch `landing-redesign` rather than a new git worktree** — the branch is not `main`, so the isolation requirement was met, and a worktree would have needed a full `npm install` for no benefit — cost if wrong: concurrent edits could interleave; recoverable via git.

**Task 2 updates both live `programmeColors` consumers rather than carrying a deprecated back-compat field** — a wrong-named field carried into a brand-new palette never gets cleaned up, and the fix was two files — cost if wrong: two accent colours pick the wrong tier on a social card; visible in QA, one-line reversion.

**`pillarAccentVar`'s semantic shift was accepted without migrating its ~7 graphic-role call sites** — two of those components are retired in Stage 2 and the rest rewritten in Stage 3, so migrating them early would touch ~10 files the later stages replace anyway — cost if wrong: SVG strokes render in the darker text tier for one stage — legible, merely less vivid.

## Task 1 (harness)

**The palette-enforcement test moved from Task 1 to Task 2** — a test cannot reference a type shape that does not exist yet without breaking `tsc`; the original split left the branch **unbuildable** between the two tasks, contradicting the plan's own gate — cost if wrong: the AA gate lands one task later; every task boundary stays buildable either way.

**`vitest.config.ts` renamed to `.mts`** — `package.json` has no `"type": "module"`, so a `.ts` config loads as CJS-with-ESM-syntax and Vite printed a compatibility warning on every run, violating the brief's own pristine-output requirement. Probed empirically before ruling — cost if wrong: none, the probe was conclusive.

**Guard `relativeLuminance`'s input** — it is exported and later tasks call it directly, so an unguarded `parseInt` returned a silent `NaN` instead of failing loudly — cost if wrong: one extra throw path on a module that already throws by design.

**Raise `engines.node` to `>=20.19.0`** — `vite@8` requires `^20.19.0 || >=22.12.0`, so the declared floor could not run the declared toolchain — cost if wrong: a slightly narrower supported range than documented.

**Task 1 lands as multiple commits with an intermediate red commit** — accepted rather than squashing, because the plan was corrected mid-task and squashing would have rewritten commits stacked above — cost if wrong: `git bisect` landing on that commit sees a non-buildable tree.

**Add `"**/*.mts"` to `tsconfig.json` include** — the `.mts` rename silently dropped the config out of the type-checked program, trading a cosmetic warning for real coverage loss. Confirmed with `--listFilesOnly` — cost if wrong: the config is type-checked again, as every other config file in the repo already was.

## Task 2 (palette)

**Two invisible washes: the values were wrong, not the test** — `thrive.softDark` measured **1.0036** against the lighter dark canvas, as invisible as the wash it replaced. Adopted the implementer's hue-preserving lift — cost if wrong: two wash hexes slightly brighter than intended; one-line reversions.

**Replace the impossible contrast band with an achievable floor pair** — a wash always scores `1.1292×` higher on the darker canvas, so "1.15–1.25 on both" is unsatisfiable. The test floor was **tightened** (1.10 → 1.15), not loosened — this was not bending the gate to fit the values — cost if wrong: washes read slightly stronger on the lighter canvas, which is correct for a tint.

**Gold keeps its FILL tier** — darkening `--ec-gold` as a text token broke the primary CTA pairing from 8.83:1 to 2.64:1 — cost if wrong: gold is unavailable as text on light surfaces; that is a **pre-existing** problem now tracked for Stage 3, which redesigns those components anyway.

**Add a token-against-token assertion for the CTA pairing** — the existing assertions measured tokens against canvases and were structurally blind to a broken foreground/background pair, which is how 34 green assertions coexisted with a 2.64:1 button — cost if wrong: one assertion to maintain if the button's variant colours change; that is the point.

**Drop the unpainted `brand.indigoDark` token rather than emit it** — it had no CSS counterpart, so the test blessed a hex the browser never painted. Emitting a token nothing consumes relocates the problem — cost if wrong: the spec's promised dark-mode indigo text partner does not exist; the real exposure (decorative SVG at 1.90:1) is deferred to Stage 3.

**Leave the graphic tier's floor at ≥3:1 against `#ffffff` only** — `learn` and `achieve` fall below 3:1 against `#eaf6ff`, which the hero's sky gradient uses, but the values are spec-mandated and the exposure is decorative WebGL nodes retired in Stage 2 — cost if wrong: sub-3:1 decorative graphics on sky backgrounds until the hero is replaced.

**The implementer's `globals.css` mirror was correct and was a gap in the ruling** — the ruling named only `colors.ts` and the test, but `colors.ts` is the test source while the CSS is what paints; without the mirror the corrected washes would have passed all 34 assertions and stayed invisible — cost if wrong: none; the mirror is required for the fix to have any effect.

## Task 3 (registry)

**Accept `import type` + `export type` over the brief's bare re-export** — the brief's single line does not bind the name locally while `Programme.pillarId` in the same file uses it (TS2304) — cost if wrong: none; still fully type-only and erased.

**Accept dropping the mandated `eslint-disable` directive** — that rule is `off` in this repo, so under ESLint 9's `reportUnusedDisableDirectives` the directive *became* the repo's only lint warning — cost if wrong: none.

**The six back-compat re-exports are not six things to update on a new pillar** — they are `Object.fromEntries` derivations of `pillarAccent`, so a new key flows through automatically. Only `pillarAccent` is a checked literal. The spec's runbook was reworded to "let the compiler enumerate" because the file list went stale within one task — cost if wrong: a future author edits nothing they did not need to; the compiler still catches every real gap.

**Constrain `programmeColors` to `Record<PillarId, PillarAccent>`** — it had three unguarded copies of the pillar identity, so a sixth pillar produced no compile error and no test failure: its palette was never measured and the suite stayed green. This also closed a second hole — with `noImplicitAny: false`, indexing an unconstrained object by an absent key silently yields `any`, so the OG image would have fallen back silently and the WebGL scene would have thrown at runtime — cost if wrong: `as const` is dropped, so hex-literal types are lost; verified nothing consumed them, and `as const satisfies Record<PillarId, PillarAccent>` restores them if ever wanted.

## Not fixed, deliberately

- `EcosystemScene.tsx` hard-codes the pillar count as `(Math.PI * 2 * i) / 5` — a sixth pillar lands silently on top of the first.
- `ProgrammeGraphic`'s per-id chain has no fallback — a sixth renders an empty SVG silently.
- `coursePillar.ts` declares a second type named `PillarAccent`, shadowing the design one.
- The added palette/registry set-equality assertion is **redundant** — with the new annotation it is provable by the type system and cannot fail for the divergence it names.

All four are visual or naming-only, and the first two sit in components slated for retirement.
