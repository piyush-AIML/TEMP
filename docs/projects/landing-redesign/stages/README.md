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
| [**1 — Foundation**](stage-1.md) | Test harness · palette v2 · pillar registry · scroll maths · line geometry · `LineStage` | **Tasks 1–3 done and reviewed.** Tasks 4–7 planned, not started. |
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

**Interfaces Stage 1 leaves for you** — all exist and are tested; use them, do not re-invent:

- `src/design/scroll.ts` — `perStationVh(n)`, `branchFor(width)`, `BREAKPOINTS`, `SCRUB`, `CEILINGS`
- `src/components/educraft/line/station.ts` — `stationPositions(n)`, `drawAt(progress, i, n)`
- `src/components/educraft/line/anchors.ts` — `ACT_ANCHORS`, `Anchor`
- `src/components/educraft/line/pathBuilders.ts` — `pathFor`, `assertContinuity`
- `src/components/educraft/line/LineStage.tsx` — the strand renderer (currently **unconsumed**; Stage 2 is its first caller)
- `src/lib/gsap.ts` — `registerGsap`, `EASE`, `REDUCED_MOTION_QUERY`, `gsap`, `ScrollTrigger`, `useGSAP`

**Open — decide while planning:**

- **Act composition.** One client shell for the whole page, or one per act? §3.3 mandates that static copy stays server-rendered, but the boundary between client shells is unspecified.
- **`assertContinuity`'s call site.** It is tested but never called by a real act chain. Stage 2 should wire it.
- **Act copy.** The acts reuse existing section copy where it survives (§5), but the new act *headings* and the hero's CTA relabelling (§4) are prose decisions, not established text.
- **`?calibrate=1` overlay.** §10.3 specifies it; the implementation is unscoped.
- **`CursorProvider`.** §13 item 1 records the ruling to retire it. Whether that happens here or in Stage 4 is open.

**Prerequisite:** Stage 1 Tasks 4–7 must land. Stage 2 cannot name its interfaces until they exist.

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
- **The graphic-role `pillarAccentVar` migration.** Seven files use it as a *stroke* while it now resolves to the text-safe tier. `pillarGraphicVar` exists for them. Two of those components retire in Stage 2, so the list shrinks — re-derive it rather than working from the original seven.
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
