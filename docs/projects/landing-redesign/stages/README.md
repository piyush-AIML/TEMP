# Landing redesign — stage index and planning inputs

**Purpose:** everything a planner needs for a stage that is not yet planned, so the work is
*planning* rather than re-deriving. Each entry lists what is already decided, what is deliberately
still open, and what must be true before the stage can be planned at all.

**Only Stage 1 has an executed plan.** Stages 2–4 are designed but not decomposed — the entries below
are the inputs to that decomposition, not the decomposition.

## The planning contract

To plan a stage: read its entry below, then its "decided" spec sections, then run the
`writing-plans` flow. To execute it, use the `run-a-stage` skill. When a stage closes, its plan moves
into this directory and gains an entry in the table.

**Why these plans do not exist yet, deliberately:** each stage's task breakdown depends on what the
previous stage actually produced. Stage 2's tasks cannot be written before Stage 1's interfaces
exist, because the plan must name them. Writing them speculatively produces a plan that is wrong in
ways nobody notices until execution.

---

| Stage | Scope | Status |
|---|---|---|
| [**1 — Foundation**](stage-1.md) | Test harness · palette v2 · pillar registry · scroll maths · line geometry · `LineStage` | **Complete.** All 7 tasks done, reviewed and committed. |
| **2 — The Acts** | The five acts replacing the 12 homepage sections | Designed, **not planned** |
| **3 — Components & Handoff Routes** | shadcn primitives · interactive component redesigns · the four handoff routes | Designed, **not planned** |
| **4 — Cleanup** | Retire the WebGL tree · relax the React pin · finalise the docs | Designed, **not planned** |

---

## Stage 2 — The Acts

**Decided** — read these before planning:

| Spec | What it fixes |
|---|---|
| §3.1–§3.3 | The Line system's shape, the GSAP/Motion engine split, the RSC boundary |
| §4 | All five acts in detail: heights, layout, what leaves, responsive behaviour |
| §5 | What retires, and where each retired section's content goes |
| §8 | The responsive contract — desktop pins and scrubs, tablet does **not**, mobile uses native snap |
| §9 | Accessibility and the reduced-motion contract (`gsap.matchMedia()`, because CSS can no longer guarantee it) |
| §10.2 | The timing table, and that `design/motion.ts` stays the single source |

**Interfaces Stage 1 leaves for you** — all exist, are exported, and are individually tested. **Read
the join warning below before planning the strand.**

- `src/design/scroll.ts` — `perStationVh(n)`, `branchFor(width)`, `BREAKPOINTS`, `SCRUB`, `CEILINGS`
- `src/components/educraft/line/station.ts` — `stationPositions(n)`, `drawAt(progress, i, n)`
- `src/components/educraft/line/anchors.ts` — `ACT_ANCHORS`, `ACT_ORDER`, `Anchor`
- `src/components/educraft/line/pathBuilders.ts` — `pathFor`, `assertContinuity`
- `src/components/educraft/line/LineStage.tsx` — the strand renderer (currently **unconsumed**; Stage 2 is its first caller)
- `src/lib/gsap.ts` — `registerGsap`, `EASE`, `REDUCED_MOTION_QUERY`, `gsap`, `ScrollTrigger`, `useGSAP`

> ### ⚠ The Line layer has no defined join — Stage 2 owns the coordinate system
>
> Stage 1 shipped three correct pure modules and a correct renderer, and **nothing in the shipped
> code ever draws a strand.** `LineStage` imports `cn`, `motion`, `SCRUB` and GSAP — not `anchors`,
> `station` or `pathBuilders`. Wiring them naively does not work, and the failure is silent:
>
> - **The frames are not just a different origin — they are different units.** `anchors.ts` x/y are
>   **act-local 0..1**. `stationPositions` x is **track-widths, one per viewport** (so `x = 0..N−1`,
>   not 0..1) and its y is **viewport heights**. `pathFor` is deliberately frame-agnostic: R8 ruled it
>   cannot reconcile them, because the transform needs an act identity its signature never carries.
> - **Nothing maps those frames into the space `LineStage` renders in.** Its `viewBox` defaults to
>   `1200×800` — a unit space neither module speaks. Measured: feeding `stationPositions(5)` straight
>   through `pathFor` into the default viewBox gives a rail occupying **0.33%** of the SVG width, and
>   `origin`'s arc renders **0.26px × 1.13px** at 1440×900.
> - **Three of the five acts are currently a zero-length path.** `ACT_ANCHORS` gives `pillars`, `way`
>   and `proof` `{x:0.5,y:1} → {x:0.5,y:1}` — no travel. Whether that is intended is a **design
>   question for the owner**, not a bug: it was pinned by test, and pinning makes a change visible
>   without making the values correct.
> - **`pathFor`'s `'fork'` shape has no callers anywhere**, and no module generates Act 0's five seed
>   anchors. `ACT_ANCHORS` contains no seed node.
> - **`assertContinuity` cannot be wired as it stands.** Driven with real geometry it throws a *false*
>   alarm; called with no argument it re-validates a frozen literal against itself. Its premise also
>   needs examining: it enforces `exit == enter` as values, but act-local those are each act's own
>   edge, one act-band apart on screen.
>
> None of this is a Stage 1 defect — the exit criteria always said "`LineStage` exists but is unused;
> Stage 2 binds it", and R8 placed frame reconciliation with the caller. It is recorded here because
> the destructive reading of "use them, do not re-invent" is to assemble the three modules and expect
> a strand.

**Open — decide while planning:**

- **Act composition.** One client shell for the whole page, or one per act? §3.3 mandates that static copy stays server-rendered, but the boundary between client shells is unspecified.
- **`assertContinuity`'s call site.** It is tested but never called by a real act chain. Stage 2 should wire it.
- **Act copy.** The acts reuse existing section copy where it survives (§5), but the new act *headings* and the hero's CTA relabelling (§4) are prose decisions, not established text.
- **`?calibrate=1` overlay.** §10.3 specifies it; the implementation is unscoped.
- **`CursorProvider`.** §13 item 1 records the ruling to retire it. Whether that happens here or in Stage 4 is open.

**Prerequisite: met.** Stage 1 is complete — all seven tasks landed, and the six interfaces above
exist and are tested. The join warning above is the one thing Stage 1 does *not* hand you.

---

## Stage 3 — Components & Handoff Routes

**Decided:**

| Spec | What it fixes |
|---|---|
| §11.1 | shadcn supplies **behaviour, never look** — `Dialog`, `Accordion`, `Tabs`, `Popover`/`Tooltip` only. `react-hook-form` explicitly **not** adopted. |
| §11.3 | The interactive component redesigns, one by one: mega menu, enquiry modal, floating button, FAQ accordion, buttons, theme toggle |
| §12 | The four handoff routes, with the rule that **the strand takes the colour of the scope it is in** |
| §6.6 | The role lessons — gold is a fill, teal needs two tiers, assertions must cover token-against-token pairs |

**Open:**

- **shadcn install scope** — which primitives actually get used, and whether `components/ui/` needs a house wrapper convention.
- **The graphic-role `pillarAccentVar` migration.** Measured at Stage 1 close: **5 files** reference it (`ProgrammeDeepDive`, `ProgrammeExplorer`, `ProgrammePage`, `EcosystemGraphic`, `ProgrammeGraphic`), not the seven the older notes claim — `Navbar` and `coursePillar` no longer do. **And "graphic-role" is wrong for most of them**: `ProgrammeDeepDive` and `ProgrammeExplorer` use it as `color`, which is now the *correct* tier; only `EcosystemGraphic` and `ProgrammeGraphic` use it as `stroke`/`fill`. Re-derive per call site rather than trusting either list.
- **Gold as text on light surfaces** (`text-ec-gold` at 1.77:1, pre-existing) — Stage 3 redesigns Footer, FinalCTA and ProgrammePage, so it is the natural place to resolve it.

**Prerequisite:** Stage 2's acts must land — the nav and CTA redesign depend on the acts' structure.

---

## Stage 4 — Cleanup

**Decided:**

| Spec | What it fixes |
|---|---|
| §1.5 | The entire `src/components/educraft/three/` tree is reachable **only** from `landing/Hero.tsx` — verified. It retires with the hero. |
| §11.2 | Remove `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`; **relax the React `~19.2.8` pin to `^19`** — the pin exists solely for R3F's `peer react: ">=19 <19.3"` |
| §14 | Close out the definition of done |

**Open:**

- Nothing major, but note the **deferred minors** gathered across the redesign: `docs/architecture/open-questions.md` §7 lists the silent pillar-count sites, and `rulings.md`'s "Not fixed, deliberately" section lists the rest. Triage them here.
- `package-lock.json` must be **regenerated**, not hand-edited, when the R3F packages come out.
- `docs/platform/stack.md` and `docs/decisions/0001` both carry "scheduled for removal" notes that need updating.

**Prerequisite:** Stage 2 must land — until the hero is replaced, the WebGL tree is still live.

---

## Cross-cutting: the state of the deferred work

Three lists that a planner for any stage should check rather than rediscover:

- `docs/projects/landing-redesign/rulings.md` — **"Not fixed, deliberately"** at the end
- `docs/architecture/open-questions.md` — unresolved documentary conflicts, including one production data-loss risk
- `docs/projects/roadmap.md` — the background marketing roadmap, with anything the redesign now owns marked as such

### Found at Stage 1 close, with no durable home until now

These were *dropped* rather than carried — they lived only in the gitignored scratch ledger, or in no
document at all. Each is real and each was verified at close.

- **`engines.node` admits a Node version the toolchain rejects.** `package.json` declares `">=20.19.0"`,
  which admits 21.x, but `vite@8` (pulled in via Vitest) requires `^20.19.0 || >=22.12.0`. A developer
  on Node 21 is permitted by the manifest and refused by the tool. The scratch ledger ruled this
  "fix in Task 4"; it was never actioned and never written down. One-line fix, needs a decision on the
  upper bound.
- **The `goldHoverDark` CTA pairing is unasserted.** `colors.test.ts` pins 3 of the 4 CTA pairings;
  this one has no live exposure (8.54:1) but nothing holds it there.
- **Two gold field names diverge from their CSS counterparts.** `goldSoftLight` maps to
  `--ec-gold-light` and `goldHoverLight` to `--ec-gold-dark`. The *values* match; only the names
  disagree — which is exactly the shape that made the `colors.ts`/`globals.css` mirror hard to trust.
- **The `@deprecated` back-compat re-exports in `src/lib/pillarStyles.ts` have no scheduled removal.**
  `docs/architecture/system.md` documents them as current, and no durable document says Stage 3 should
  delete them once call sites move to `pillarAccent`.
- **`--accent: #00b3b8` survives untouched in the shadcn contract**, measuring **2.58:1** against its
  own `--accent-foreground: #ffffff`. It is the hex this whole stage exists to retire — inherited by
  the shadcn `accent` role, with no consumer today. `stack.md` and `spec.md` both say shadcn "inherits
  the Educraft palette automatically", which is true and also the problem.
