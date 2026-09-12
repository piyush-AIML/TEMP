# Verification & development workflow

The commands that gate a change, who verifies what, and the accessibility and performance state of the site.

## Setup and local dev

```bash
npm install
npm run dev         # local dev on :3000 (first compile ~14s is normal)

# verification loop — all three must pass before shipping
npm run lint         # eslint (react-hooks/immutability rule active)
npx tsc --noEmit
npm run build         # prisma generate && next build — Turbopack production build

npm start            # serve the production build
```

**`npm run build` = `prisma generate && next build`** (since 2026-09-04): the Prisma client at `src/generated/prisma/` is gitignored build output, so every build — local or Vercel — regenerates it first. `prisma generate` auto-loads `prisma7.config.ts` (Prisma 7 CLI discovers it by name; on Vercel the config's `.env.local` dotenv load no-ops and `DATABASE_URL` comes from Vercel's injected env — generate never touches the DB anyway). The generated client is also excluded from eslint (`src/generated/**` in `eslint.config.mjs` ignores — its own disable-directive headers trip ESLint 9's config-level `reportUnusedDisableDirectives`, which no rule setting can silence).

## The stale `.next` ritual

If stale `.next/types` causes deletion-related tsc errors: `rm -rf .next && npx tsc --noEmit && npm run build`.

**Operational lesson (2026-09-05): never wipe or rebuild `.next` while the owner's `npm run dev` is running** — a dev server whose `.next` is deleted under it loses route registrations and serves 404s for existing dynamic routes until restarted. Wipes belong in a turn where no dev server is live; when in doubt, ask the owner to restart dev (`Ctrl+C`, `npm run dev`) after any structural change.

Two independent causes feed that failure mode, and both are worth knowing: the cache staleness itself, and ESLint's flat-config `ignores` not being global in `eslint.config.mjs` (a stale/truncated `.next/dev/types/validator.ts` once made `npm run lint` fail with `TS1128`). The review findings behind this are recorded in [history.md](history.md).

## Gates beyond the loop

- **Seed idempotency:** `npm run db:seed` is written to be idempotent (per-table count guards) — running it twice must produce all-zero on the second run.
- **Storage smoke gate:** `npm run db:storage-smoke` exercises presigned PUT → verify → signed GET → delete against the real bucket. Passed 2026-09-05; see [deployment-env.md](deployment-env.md) for the bucket, env vars and the full procedure.
- **Route count:** `npm run build` output is the authority on how many routes exist — it has repeatedly contradicted hand-written counts.

## Verification aids (browser-free by design)

**Working agreement:** the user performs all website viewing/visual QA (browser access, screenshots) and reports back. **The assistant never launches a browser or curls the site itself.** (This is persisted in assistant memory. A stale `.claude/settings.local.json` browser-automation allow-list from an earlier session — CDP/curl/taskkill rules for a long-dead localhost:9222 debugging flow — was **deleted 2026-09-04**; no current workflow uses it.)

Because the assistant cannot look at the page, the Landing Redesign encodes its calibration as things a test can check:

- pure functions with Vitest coverage — `stationPositions(N)`, `perStationVh(N)`, `pathFor`, `drawAt`, `assertContinuity` (each act's exit anchor must equal the next act's entry anchor), plus an AA contrast test over the token table, so a future palette edit cannot silently regress accessibility;
- a dev-only **`?calibrate=1` overlay** printing scrub progress, active station, draw fraction and breakpoint branch, so the owner's visual QA produces reportable numbers rather than impressions.

Rationale and test-tooling status: [stack.md](stack.md). Full test plan: [../projects/landing-redesign/spec.md](../projects/landing-redesign/spec.md).

## Accessibility

**Shipped:** semantic landmarks, skip link, logical heading hierarchy, keyboard navigation including the mega menu (Escape/outside-click close, focus return), accessible dialogs (focus trap on `EnquiryModal`), `aria-live` panel on the Ecosystem section, `aria-current` for route-aware nav state, `aria-expanded`/`aria-controls` on menus, form errors associated with inputs, sr-only step announcements in the enquiry flow, `mounted`-gated theme toggle to avoid mismatch. Reduced motion is enforced globally at the CSS level (`prefers-reduced-motion` kills animation/transition durations and un-hides reveal content), not per-component JS branching.

**Not yet verified:** a formal WCAG 2.2 AA audit pass (keyboard-only walk of mega menu + staged form, screen-reader pass, contrast check of programme accents — especially `achieve` gold on light backgrounds) is still open (roadmap Tier D item 19). Treat current accessibility as *implemented-by-convention*, not *audited*.

The `achieve`-gold item is now quantified: the redesign's palette work measured ten AA failures in the shipped palette, worst among them `--ec-teal` `#00b3b8` as text at **2.58:1** and `achieve` `#c58f1b` at **2.87:1**. Numbers, canvases and the mitigation rule ("a pillar accent is never the only signal") live in [../design/palette.md](../design/palette.md).

**Method note:** once GSAP drives the page, CSS can no longer make the reduced-motion guarantee — reduced motion must be handled in the motion engine (`gsap.matchMedia()`), which is why it is called out in the redesign's definition of done.

## Performance

**Shipped optimizations:** single coordinated WebGL canvas (not one per section/page); frameloop pauses when a scene is off-screen (`useSceneActive`); `AdaptiveDpr` with a `[1, 1.5]` clamp; no per-node point lights (emissive + glow sprites instead); reduced-motion short-circuits animation entirely; the site is static except one API route.

**Goals, not yet field-verified:** LCP < 2.5s, CLS < 0.1, INP < 200ms — these are targets carried from the original plan. No Lighthouse baseline or real-device Core Web Vitals field data has been recorded yet (roadmap Tier D item 17). **Do not report these numbers as achieved without measuring.**

Known static-asset cost, recorded by the architecture review: the favicon is a 601 KB PNG (`layout.tsx` sets `icons.icon: "/logo.png"`, so every tab request downloads a navbar-sized brand image). See [history.md](history.md).

## Engineering constraints verification must respect

The full hard-won rule set lives in [../architecture/layering.md](../architecture/layering.md). Two entries are carried here because they are verification-visible and carry supersession markers:

**Rule 4 (superseded)** — ~~**R3F:** imperative scene-graph mutation inside `useFrame` needs `// eslint-disable-next-line react-hooks/immutability` — this is the canonical pattern here, not React state.~~ **SUPERSEDED 2026-09-12 — R3F is retired.** The equivalent rule for the redesign: **GSAP writes styles to the DOM directly and must never be mixed with Motion on the same property of the same element.**

**Rule 7 (obsolete)** — ~~`THREE.Clock` deprecation warning is emitted by R3F 9.7.0 internals (latest stable) — harmless, disappears with R3F's next patch. Do not upgrade to a 10.0 canary just to silence it.~~ **OBSOLETE 2026-09-12 — R3F is retired, so the warning disappears with it.**

**Not overridden (still in force):** the `overflow-hidden`/sticky rule, hydration gating, zod v4 syntax, literal-only Tailwind classes, `tw-animate-css` key-remount, and route-group/proxy coverage — plus the three-command loop above and the visual-QA working agreement.
