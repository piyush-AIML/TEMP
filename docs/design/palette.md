The colour system: the measured pillar accents, brand chrome and dark-mode washes, and the role lessons that keep them honest.

**This file is the design rationale. Two files are the source of truth for what ships:**
[`src/design/colors.ts`](../../src/design/colors.ts) (documentation-and-test source) and
[`src/app/globals.css`](../../src/app/globals.css) (what actually paints). Floors are encoded in
`src/design/colors.test.ts` against `src/lib/contrast.ts`.

---

## 1. Art direction

Dark mode is **art-directed, not inverted** — deeper indigo canvas, brighter programme accents.

| Theme | Target |
|---|---|
| Light | airy, educational, optimistic, soft sky backgrounds |
| Dark | cinematic, atmospheric, deep indigo, subtle glow, restrained teal |

## 2. The architecture: three tiers, one role each

Every pillar identity ships as **three measured tiers**, not one accent plus a wash. The three roles are distinct because one hex cannot serve them:

| Tier | CSS var | `@theme inline` alias | Tailwind class | Role |
|---|---|---|---|---|
| text | `--ec-p-<id>` | `--color-ec-<id>` | `text-ec-<id>` | Text-safe accent (≥4.5:1 on every canvas) |
| graphic | `--ec-p-<id>-graphic` | `--color-ec-<id>-graphic` | `text-ec-<id>-graphic` | Strokes, nodes, the strand (≥3:1) |
| soft | `--ec-p-<id>-soft` | `--color-ec-<id>-soft` | `bg-ec-<id>-soft` | Wash behind a station |

Brand chrome adds two graphic-role tokens alongside the existing brand vars: `--ec-teal-graphic` (aliased `--color-ec-teal-graphic`) and `--ec-gold-graphic` (aliased `--color-ec-gold-graphic`).

**Tokens are declared twice by design:** once as a runtime CSS var in `:root` / `.dark` (where the theme flip happens), and once as a `@theme inline` alias, which is what makes the Tailwind class exist. **Adding a token means adding it in three places:** `:root`, `.dark`, and `@theme inline`.

**Literal classes only.** Tailwind 4 will not generate what it cannot see — `bg-ec-${x}` produces nothing. All pillar → class mappings are written out literally in `src/lib/pillarStyles.ts`. See [`system.md`](system.md) for the full constraint.

## 3. The AA floors this palette is measured against

Floors live in `src/lib/contrast.ts` and are asserted by `src/design/colors.test.ts`:

| Constant | Value | Meaning |
|---|---|---|
| `AA_TEXT` | **4.5** | text tiers |
| `AA_NON_TEXT` | **3** | graphic (non-text / UI) tiers |

The canvases a token can sit on:

- `LIGHT_CANVASES` = `#ffffff`, `#f6f9fc`, `#eaf3fb`, `#eaf6ff` (canvas, canvas-soft, canvas-deep, sky)
- `DARK_CANVASES` = `#0b0f1e`, `#10152a`, `#141b38`, `#141d57`

**No upper bound on washes.** A wash always scores **1.1292×** higher against `#0b0f1e` than against `#141b38`, because `#0b0f1e` is darker. Exceeding 1.25 on the lighter canvas is therefore correct behaviour, not a defect — see §6.

## 4. Pillar accents — three tiers each, measured

"worst light" = minimum across **all four** light canvases (`#ffffff`, `--ec-canvas-soft`, `--ec-canvas-deep`, `--ec-sky`). "worst dark" = minimum across `#0b0f1e`, `#10152a`, `#141b38`.

| Pillar | text (light) | worst light | text (dark) | worst dark | graphic (light) | graphic (dark) |
|---|---|---|---|---|---|---|
| `learn` · Linguistics | `#0C7078` | **5.19:1** | `#4FD4DC` | **9.47:1** | `#12A0AC` (3.16) | `#2FBAC4` (8.12) |
| `include` · Inclusive Ed | `#2B5FD9` | **5.00:1** | `#8FB4F5` | **8.05:1** | `#4C82E8` (3.71) | `#6E9BEE` (6.89) |
| `thrive` · Wellbeing | `#6B3FC4` | **5.97:1** | `#B49BEE` | **7.13:1** | `#8B62D9` (4.33) | `#9E7FE4` (6.00) |
| `achieve` · AI & Digital | `#8A5A00` | **5.28:1** | `#F5C95E` | **10.77:1** | `#B8860B` (3.25) | `#E8B94A` (10.41) |
| `excel` · NEET & JEE | `#C2185B` | **5.23:1** | `#F285A8` | **6.99:1** | `#E0437C` (3.99) | `#EC6A99` (6.44) |

Summary: all text tiers **≥5.00:1 light, ≥6.99:1 dark**; every graphic tier clears the **3:1** non-text threshold.

`achieve` is the reason a three-tier model is necessary: gold at full brightness is unusable as text (`#F4B942` = **1.77:1**), so text drops to a deep amber while bright gold survives for graphics only.

### The soft washes (light / dark)

| Pillar | soft light | soft dark |
|---|---|---|
| `learn` | `#E0F5F7` | `#0C2B30` |
| `include` | `#E5EDFD` | `#131F3D` |
| `thrive` | `#EDE6FB` | `#221B3C` |
| `achieve` | `#FAEED6` | `#2A2110` |
| `excel` | `#FCE4EC` | `#391627` |

### Reserved slots 6 and 7

Pillars 6 and 7 ship **measured but unemitted** — no CSS custom properties exist for them until a real pillar claims one. The largest free hue gap in the wheel is 39° → 184° (145°), so slot 6 is green (~112°) and slot 7 a deeper lime (~70°). They live in `reservedPillarAccents` in `src/design/colors.ts`, and `colors.test.ts` AA-verifies them too, so a future pillar never means inventing a hue under deadline. To claim one: move the object into `programmeColors` under its new id, then extend `globals.css`.

| Slot | text light | text dark | graphic light | graphic dark | soft light | soft dark |
|---|---|---|---|---|---|---|
| 6 (green) | `#1B6B3A` | `#6FCF8F` | `#2E8B57` | `#5CBE80` | `#E3F3E8` | `#0F2A1B` |
| 7 (lime) | `#6B5A00` | `#D6CD6B` | `#8A7600` | `#C4BA55` | `#F4F0D9` | `#26220C` |

## 5. Brand chrome

| Token | Light | Dark | Note |
|---|---|---|---|
| indigo (primary) | `#1E2A78` (12.67) | `#3B4896` fill | today's `#1E2A78` on dark is **1.51:1** — invisible. **Corrected during implementation:** an earlier draft specified a `#8E9AE0` dark text partner, but no consumer needed it, and the test was left asserting AA for a hex `globals.css` never painted — the "passes the suite and renders nothing" class. The token was dropped rather than emitted for nothing; see §9. |
| teal (text) | `#0C7078` (5.83) | `#4FD4DC` (10.70) | fixes the `text-ec-teal` failure |
| teal (graphic) | `#12A0AC` (3.16) | `#2FBAC4` (8.12) | for strokes, nodes, the strand |
| slate | `#4A5468` (7.61) | `#9AA3C0` (7.60) | |
| gold (highlight) | `#8A5A00` (5.93) | `#F5C95E` (12.17) | |

**Teal splits into text and graphic tiers.** One vivid teal cannot serve both — `#00b3b8` is **2.58:1** as text but visually correct as a stroke. This split is what makes `text-ec-teal` usable at all.

Other brand values, from `colors.ts`: `indigoDeep` `#141D57`; the gold fill family `goldFillLight` `#F4B942` / `goldFillDark` `#F5C95E`, `goldHoverLight` `#C58F1B` / `goldHoverDark` `#E8B94A`, `goldSoftLight`/`goldSoftDark` `#F8CD73`, `goldGraphicLight` `#B8860B` / `goldGraphicDark` `#E8B94A`. Neutrals: canvas `#FFFFFF` / `#0B0F1E`, canvas-soft `#F6F9FC` / `#10152A`, canvas-deep `#EAF3FB` / `#141B38`, sky `#EAF6FF` / `#151B36`, ink `#12172E` / `#E8ECFB`, border `#E4E9F2` / `#232B4D`. Semantic: success `#16A34A` / `#4ADE80`, warning `#B45309` / `#FBBF24`, error `#DC2626` / `#F87171`, info `#2563EB` / `#60A5FA`, focus `#1E2A78` / `#7C86C9`.

## 6. Soft washes — the dark-mode fix

Measured against `--ec-canvas-deep` `#141b38`: `thrive` **1.00**, `excel` **1.02**, `include` **1.04** — three of five were indistinguishable from the canvas.

**An earlier draft of this section asked for every wash to land in a 1.15–1.25 band on *both* dark canvases. That is mathematically impossible,** and an implementer caught it. Because `#0b0f1e` is darker than `#141b38`, any given wash scores *strictly higher* against it — the ratio between the two scores is a constant **1.1292**. So a single hex cannot simultaneously satisfy `≤1.25` on the darker canvas (which needs luminance `L ≤ 0.0188`) and `≥1.15` on the lighter one (which needs `L ≥ 0.0215`).

**The correct, achievable requirement**, now enforced by test:

| Floor | Canvas | Why this value |
|---|---|---|
| **≥ 1.15** | `#0b0f1e` (darkest) | the band's meaningful lower bound — below this a wash reads as canvas |
| **≥ 1.02** | `#141b38` (lighter) | the derived equivalent: `1.15 ÷ 1.1292 ≈ 1.017`, rounded up |

There is deliberately **no upper bound**: on the lighter canvas a wash that clears 1.15 on the darker one necessarily scores higher than 1.25, and that is correct behaviour, not a defect — it is a tint against a lighter surface.

Two values had to be corrected to meet these floors. `thrive` `#1E1836` scored **1.0036** on the lighter canvas — as invisible as the wash it replaced — and `excel` `#331423` scored **1.0173**; both were lifted along their own hue to **`#221B3C`** (1.1714 / 1.0373) and **`#391627`** (1.1968 / 1.0598). All five washes now clear both floors.

## 7. Two properties that make it a system

- **Equi-luminant.** The five text tiers' relative luminance spans only **0.030** — no pillar shouts louder than another.
- **Hue spread: 39° · 184° · 222° · 260° · 336°.** Well separated, *except* the cool cluster (cyan → blue → violet at ~40° apart).

## 8. Two honest caveats

**Equi-luminance has a cost.** Cyan `learn` and rose `excel` differ in hue but not in lightness, so they can converge for red-green colour-blind readers. **This is mitigated by a hard rule, not a hope: a pillar accent is never the only signal.** Every accent ships alongside its text label, and the strand never encodes meaning by colour alone.

**Where identity lives on the strand.** The strand stays **one brand colour** (`--ec-teal-graphic`); identity lives in each station's **node and label**. A five-hue gradient along the strand is the tempting choice and the wrong one — it reads as a chart legend, not a premium system, and is exactly the "decoration for its own sake" the design principles forbid.

## 9. Roles are explicit, and two of them are not what they look like

Three corrections the implementation forced, each worth carrying forward:

**Gold is a FILL family, not a text family.** `--ec-gold` is the primary CTA's background, paired with `text-ec-indigo-dark` (`Button.tsx`'s `primary` variant: `bg-ec-gold text-ec-indigo-dark hover:bg-ec-gold-dark`). Treating it as a text token and darkening it for AA dropped that pair from **8.83:1 to 2.64:1** (hover 5.45:1 → 1.86:1). It keeps its fill tier; **gold-as-text on a light surface is a separate, pre-existing problem** (`text-ec-gold` on white is **1.77:1**) deferred to a later stage that redesigns Footer, FinalCTA and ProgrammePage. Leave it bright.

**Teal splits into text and graphic tiers** — one vivid teal cannot serve both, since `#00b3b8` reads correctly as a stroke but measures **2.58:1** as text.

**The test must assert token-against-token pairs, not only tokens against canvases.** The original assertion set measured every token against its backgrounds, and so was structurally blind to a broken foreground/background pair — which is how **34 green assertions coexisted with a 2.64:1 button**. The CTA pairing is now asserted directly, in both themes.

**And the mirror invariant is one-directional.** Every value in `colors.ts` must exist in `globals.css` (that file is the test source; the CSS is what paints). The reverse does **not** hold: `--ec-indigo-light`, `--ec-teal-dark` and `.dark --ec-indigo` are ramp steps kept deliberately with no `colors.ts` counterpart. A sweep script must expect those or it will report false positives.

**A value present in only one of the two files passes the whole test suite and renders nothing.** When correcting a hex, change both files in the same edit.

## 10. What v2 replaced, and why

Ten measured AA failures in the shipped palette, all light-mode text or dark-mode wash. Worst:

| Failure | Value | Ratio |
|---|---|---|
| `--ec-teal` used as text (the *brand* colour, used for eyebrows site-wide) | `#00b3b8` | **2.58:1** |
| `achieve` gold as text | `#c58f1b` | **2.87:1** |
| `--ec-p-thrive-soft` on dark `--ec-canvas-deep` | — | **1.00:1** (invisible) |

v2 resolves two structural problems:

- **`excel` (NEET & JEE) moves off brand indigo to rose `#C2185B`,** resolving the old collision where two of the five "identities" were the brand's own colours (`learn` aliased brand teal, `excel` aliased brand indigo).
- **Brand chrome splits teal into text and graphic tiers** (§5) and keeps gold as a fill (§9, below).

## 11. Where these numbers are enforced

`src/design/colors.test.ts` asserts every pillar and brand tier against the floors on every canvas it can sit on, in both themes, plus the CTA token-against-token pairing and the reserved slots 6–7. It also asserts that the palette and the pillar registry cover the same set of ids, so a sixth pillar cannot be present in one and absent from the other.

**If an assertion fails, the value is wrong — never the test.**
