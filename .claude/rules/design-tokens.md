---
paths:
  - "src/app/globals.css"
  - "src/design/**"
  - "src/lib/pillarStyles.ts"
  - "src/design/colors.test.ts"
---

# Design token conventions

The colour, typography and motion system. Full detail in
[`docs/design/palette.md`](../../docs/design/palette.md) and
[`docs/design/system.md`](../../docs/design/system.md).

## The invariant that matters most

**`src/design/colors.ts` and `src/app/globals.css` must carry identical hex values.**
`colors.ts` is the documentation-and-test source; the CSS custom properties are what actually
paint. A value present in only one of the two **passes the whole test suite and renders nothing**.

This is not hypothetical — it has already happened once. Keep it in mind whenever you correct a
hex: change both files in the same edit.

The mirror is **enforced by test**, in both directions, with exact equality both ways. Every
`colors.ts` hex field must have a CSS pair, and every `--ec-*` in `:root`/`.dark` must be mapped or
named on an explicit one-directional whitelist. Exactness matters: a whitelisted name that later
gains a pair **fails**, so the list cannot rot.

Seven names are one-directional by design — all ramp steps or aliases, none a `brand` field:
`--ec-indigo-light` (both themes), `.dark --ec-indigo`, `--ec-teal-dark` (both), and
`--ec-teal-light` (both — the graphic tier in the light block and the text tier in the dark block,
an alias holding values two other vars also hold). **The whitelist lives in
`src/design/colors.test.ts` as `ONE_DIRECTIONAL`** — change it there, not in prose. *(This paragraph
previously named three names and called the mirror one-directional; both were stale, and the
omission of `--ec-teal-light` would have made a docs-driven sweep report a false positive.)*

## Tailwind 4 will not generate what it cannot see

Every class must appear **literally** in source. `bg-ec-${x}` produces nothing. That is why
pillar→class mappings are written out in `src/lib/pillarStyles.ts` — never interpolate them.

Tokens are declared twice by design: once as a runtime CSS var in `:root` / `.dark`, and once as a
`@theme inline` alias (`--color-ec-learn: var(--ec-p-learn)`) which is what makes the Tailwind class
`text-ec-learn` exist. **Adding a token means adding it in three places:** `:root`, `.dark`, and
`@theme inline`.

## Roles are explicit, and two are not what they look like

- **Gold is a FILL family, not a text family.** `--ec-gold` is the primary CTA's background, paired
  with `text-ec-indigo-dark`. Darkening it for text contrast drops that pairing from 8.83:1 to
  2.64:1. It has happened. Leave it bright.
- **Teal genuinely needs two tiers.** `#00b3b8` is a correct stroke and a 2.58:1 text; `--ec-teal` is
  the text-safe tier and `--ec-teal-graphic` is for strokes.
- **A pillar accent is never the only signal.** Cyan `learn` and rose `excel` are equi-luminant, so
  they can converge for red-green colour-blind readers. Always pair an accent with its text label.

## The test is the gate — run it

`src/design/colors.test.ts` asserts every pillar and brand tier against the AA floors on **every
canvas it can sit on**, in both themes. Floors: text ≥ 4.5:1, graphic (non-text) ≥ 3:1, dark washes
≥ 1.15 against `#0b0f1e` and ≥ 1.02 against `#141b38` with **no upper bound** (a wash always scores
1.1292× higher on the darker canvas, so exceeding 1.25 on the lighter one is correct, not a bug).

**If an assertion fails, the value is wrong — never the test.** And note the test measures tokens
against *canvases*: it is **structurally blind to a broken token-against-token pair**, which is how
34 green assertions once coexisted with a 2.64:1 button. Pairings that ship together (a fill and its
foreground) need their own explicit assertion.

## Pillar identity is registry-driven

`PillarId` is derived from the `pillars` array in `src/data/pillars.ts`, so adding a sixth pillar
makes `Record<PillarId, …>` maps fail to compile. When you add one, run `tsc` and let it enumerate
the sites — see the runbook in
[`docs/projects/landing-redesign/spec.md`](../../docs/projects/landing-redesign/spec.md).
