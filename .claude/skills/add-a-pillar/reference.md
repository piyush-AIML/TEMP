# Pillar reference — measured values and floors

Loaded only when needed. See [SKILL.md](SKILL.md) for the runbook.

## Reserved accent slots for pillars 6 and 7

The five current hues occupy **39° · 184° · 222° · 260° · 336°**. The largest free gap is
39°→184° (145°, midpoint ≈ **112° green**) — that is slot 6; slot 7 is a deeper lime around 70°.

Both slots ship **measured but unemitted** in `src/design/colors.ts` as `reservedPillarAccents`:
no CSS custom properties exist for them until a real pillar claims one. To claim one, move the
object into `programmeColors` under its new id and extend `globals.css`.

The point of pre-measuring is that a future pillar never means inventing a hue under deadline —
which is how palettes rot.

## The floors every accent must clear

Enforced by `src/design/colors.test.ts`. **If an assertion fails, the value is wrong — never the
test.**

| Tier | Floor | Measured against |
|---|---|---|
| text (light) | ≥ 4.5:1 | `#ffffff`, `#f6f9fc`, `#eaf3fb`, `#eaf6ff` |
| text (dark) | ≥ 4.5:1 | `#0b0f1e`, `#10152a`, `#141b38`, `#141d57` |
| graphic (light) | ≥ 3:1 | `#ffffff` |
| graphic (dark) | ≥ 3:1 | `#0b0f1e` |
| soft wash (dark) | ≥ 1.15 | `#0b0f1e` |
| soft wash (dark) | ≥ 1.02 | `#141b38` |

`#141d57` is in the dark canvas set because it is the mid-stop of the programme OG image's gradient,
where an accent is used as **text** — a real surface that would otherwise go uncovered.

### Two properties of the current set worth preserving

- **Equi-luminant.** The five text tiers' relative luminance spans only **0.030**, so no pillar
  shouts louder than another. That is what makes it read as a system rather than five tags.
- **Hue spread 39° · 184° · 222° · 260° · 336°.** Well separated except the cool cluster
  (cyan → blue → violet at ~40° apart).

## The wash rule, and why it is not a band

There is **no upper bound** on the dark washes. A wash always scores strictly higher against the
darker canvas — by a constant factor of **1.1292**, being
`(#141b38 luminance + 0.05) / (#0b0f1e luminance + 0.05)`. So:

- `≤ 1.25` on `#0b0f1e` needs luminance `L ≤ 0.0188`
- `≥ 1.15` on `#141b38` needs `L ≥ 0.0215`

Those cannot both hold. An earlier spec asked for a 1.15–1.25 band on *both* canvases, which is
**unsatisfiable**; clearing 1.15 on the darker canvas necessarily exceeds 1.25 on the lighter one,
and that is correct behaviour for a tint on a lighter surface.

## Roles that are not what they look like

- **Gold is a FILL family.** `--ec-gold` is the primary CTA's background paired with
  `text-ec-indigo-dark`. Darkening it for text contrast drops that pair from 8.83:1 to 2.64:1 —
  which has happened. Gold used as *text* on a light surface is a separate, pre-existing problem.
- **Teal splits into two tiers.** `#00b3b8` is a correct stroke and a 2.58:1 text.
- **A pillar accent is never the only signal.** Cyan `learn` and rose `excel` are equi-luminant and
  can converge for red-green colour-blind readers, so every accent ships alongside its text label.

## The colours.ts ↔ globals.css invariant

Both files must carry identical hex values — `colors.ts` is the test source, `globals.css` is what
paints. A value in only one passes the whole suite and renders nothing. The mirror is
**one-directional**: `--ec-indigo-light`, `--ec-teal-dark` and `.dark --ec-indigo` are deliberate
ramp steps with no `colors.ts` counterpart.
