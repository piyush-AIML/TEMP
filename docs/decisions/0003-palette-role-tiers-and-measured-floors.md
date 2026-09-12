# 0003 — Palette v2: explicit role tiers, measured floors, and a test that is blind to half the problem

**Date:** 2026-09-12
**Status:** Accepted

## Context

Ten measured WCAG failures in the shipped palette, all light-mode text or dark-mode wash. The worst:
the *brand* teal `#00b3b8` used as text measured **2.58:1**. `achieve`'s gold measured **2.87:1**.
Three of five dark washes — `thrive` **1.00**, `excel` 1.02, `include` 1.04 — were indistinguishable
from the canvas. Two of the five "pillar identities" were not identities at all: `learn` *was* the
brand teal and `excel` *was* the brand indigo.

## Decision

Give each pillar three explicitly-rolled tiers (`text` / `graphic` / `soft`), verified against
**every canvas it can sit on** — four light, four dark — with the floors encoded as a test over the
token table rather than checked once by hand.

Two structural rules came out of the implementation, both learned by breaking them:

**1. Gold is a FILL family, not a text family.** `--ec-gold` is the primary CTA's background, paired
with `text-ec-indigo-dark`. Treating it as text and darkening it for AA dropped that pairing from
**8.83:1 to 2.64:1** (hover 5.45:1 → 1.86:1). Teal genuinely does need two tiers — `#00b3b8` is a
correct stroke and a 2.58:1 text. Gold does not; it needs to stay bright.

**2. An assertion set that measures tokens against *canvases* is structurally blind to a broken
*token-against-token* pair.** Thirty-four green assertions coexisted with a 2.64:1 button because
nothing asserted the pairing that actually ships. The CTA pairing now has its own explicit
assertion — resting and hover, both themes.

## Consequences

- Equi-luminance is deliberate: the five text tiers span only **0.030** in relative luminance, so no
  pillar shouts louder than another. **Cost:** cyan `learn` and rose `excel` can converge for
  red-green colour-blind readers, so **a pillar accent is never the only signal** — every accent
  ships alongside its text label. This is a hard rule, not a nicety.
- **No upper bound on dark washes.** A wash always scores `1.1292×` higher against `#0b0f1e` than
  `#141b38`. An earlier spec asked for a 1.15–1.25 band on *both*, which is unsatisfiable:
  `≤1.25` on the darker canvas needs luminance `L ≤ 0.0188` while `≥1.15` on the lighter needs
  `L ≥ 0.0215`. A spec requiring the impossible is worse than no spec — it cannot be satisfied, only
  silently abandoned.
- **`colors.ts` and `globals.css` must carry identical hexes.** The first is the test source, the
  second is what paints. A value in only one file passes the whole suite and renders nothing. This
  shipped broken once and was caught by review.
- Two values had to be corrected during implementation: `thrive.softDark` `#1E1836` measured
  **1.0036** — as invisible as the wash it replaced — and `excel` 1.0173. Both lifted to `#221B3C`
  and `#391627`.

## What it cost if wrong

Pillar identity is now more constrained than before — five measured hues rather than an open palette.
If a future pillar needs a hue outside the verified wheel, slots 6 and 7 ship pre-measured in
`reservedPillarAccents` precisely so nobody invents one under deadline. The floors themselves are
conservative: a wash at exactly 1.15 on the darkest canvas is subtle by construction.
