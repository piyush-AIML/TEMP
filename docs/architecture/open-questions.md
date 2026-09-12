# Open questions

Documentary conflicts found while migrating the monolithic docs on 2026-09-12. **None of these was
silently resolved** — where two sources disagree, they are recorded here rather than one being
quietly chosen. Each needs a decision from someone who knows the intent.

This file is the right place for contradictions. It is not a to-do list — actionable work belongs in
`docs/platform/blockers.md` or a project's `state.md`.

---

## 1. `hooks/useSectionProgress` — shipped or dead?

**`src/hooks/useSectionProgress.ts`** is documented in the motion/architecture section as a shipped
IntersectionObserver-based hook. `ARCHITECTURE_REVIEW.md` asserts it has **zero consumers**. No later
document rules on it either way.

If the review is right, it is dead code that the motion docs still advertise. One grep settles it.

## 2. Is the `rm -rf .next` ritual still necessary?

Stated as required after any file deletion or rename in
[`../platform/verification.md`](../platform/verification.md) and the engineering constraints —
stale `.next/types` referencing deleted files produces phantom type errors.

`ARCHITECTURE_REVIEW.md` argues the ritual could be retired, on the grounds that newer Next versions
handle `.next/dev/types` correctly. The ritual is still documented as mandatory.

**Relevant**: it has already bitten several times in practice, so retiring it without evidence would
be premature. The counter-argument is that a ritual everyone runs "just in case" costs real time.

## 3. `data/enquiries.jsonl` cannot be a production delivery channel

The enquiry pipeline appends to a local JSONL file when `ENQUIRY_WEBHOOK_URL` is unset. On a
serverless host that file is ephemeral and per-instance, so **enquiries would be silently lost** if
the webhook is not configured in production.

The pipeline docs describe the JSONL fallback as a legitimate mode. `ARCHITECTURE_REVIEW.md` flags
the contradiction. This is a **production correctness issue**, not just a doc conflict — the failure
is silent data loss.

## 4. Dashboard Stage 5's test-harness plan contradicts the harness that now exists

`docs/projects/dashboard/stages-2-5.md` specifies `vitest@^5`, a jsdom environment, a React plugin
and a `server-only` stub for Stage 5.

**Vitest 4.1.11 is already installed**, with `vitest.config.mts` configured for a **node**
environment, and three test files running. The harness arrived early — during landing-redesign
Stage 1 — with a different shape than Stage 5 assumed.

Stage 5 will need reconciling before it starts: the node environment is deliberate (it covers pure
functions, because there is no local runtime for anything else), so adopting jsdom is a real
decision, not a formality.

## 5. `src/design/tokens.ts` still hardcodes the retired teal

`tokens.ts`'s `shadows.teal` uses `rgba(0, 179, 184, …)` — `#00b3b8`, the exact hex the palette
retired as unsafe for text. It is a shadow, so it is a *fill* role and may be intentional, but it is
an orphaned literal outside the token system and no test covers it.

Either migrate it to a token or record why it is deliberately literal.

## 6. `coursePillar.ts` declares a second type named `PillarAccent`

`src/components/dashboard/coursePillar.ts` defines a differently-shaped type with the same name as
`src/design/colors.ts`'s exported `PillarAccent`. It shadows the design type within that module and
is a naming hazard for anyone working across both.

Dashboard-scoped, so it was left alone during redesign work.

## 7. `course-pillar`-style per-id chains with no fallback

Two components enumerate pillar ids with no default branch:

- `src/components/educraft/graphics/EcosystemGraphic.tsx` — a `Record<PillarId, {x,y}>` (guarded; a
  sixth pillar fails the build)
- `src/components/educraft/graphics/ProgrammeGraphic.tsx` — a `pillarId === '…' && <Art/>` chain with
  **no** fallback, so a sixth pillar silently renders an empty `<svg>`

Plus `src/components/educraft/three/scenes/EcosystemScene.tsx`, which hardcodes the pillar count as
`(Math.PI * 2 * i) / 5` — a sixth pillar lands on top of the first.

These are visually silent, not compile errors. Recorded so they are not mistaken for covered ground.
