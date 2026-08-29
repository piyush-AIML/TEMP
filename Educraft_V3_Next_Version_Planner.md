# Educraft V3 — Next Version Planner

> **Role of this document:** The single working roadmap for all future work. Anything not yet built should be added here, tiered by priority. Before starting any implementation session, read this file **after** `prod.md`.
>
> **Related docs:**
> - **Current state:** [`prod.md`](prod.md) — architecture, conventions, fixed-bug ledger, pending stakeholder inputs (§9). The pre-launch blockers there take precedence over everything below.
> - **Previous state:** [`Educraft_V1_Previous_State.md`](Educraft_V1_Previous_State.md)
> - **V2 plan (archived, completed):** [`Educraft_V2_Experience_Web_Design_Implementation_Plan.md`](Educraft_V2_Experience_Web_Design_Implementation_Plan.md)
>
> **Created:** 2026-08-30 · V2 shipped as `Prod.ver-0.0.2`; this is the Experience System Architect's roadmap carried forward from the V2 plan's deferred items.

---

## Tier A — Conversion & trust (before public launch)

1. Wire `ENQUIRY_WEBHOOK_URL` → CRM/transactional email (Resend, HubSpot, or similar) + internal notification channel.
2. Real testimonials + case studies; add verified outcome metrics to `/impact` only when real data exists.
3. Privacy-conscious analytics (Plausible/PostHog) implementing plan §47's event map: `page_view, programme_view, programme_cta, enquiry_started, enquiry_completed, enquiry_error, nav_open, theme_changed, scroll_depth, insight_open`. Milestone-based scroll events only — never per-frame.
4. Error monitoring (Sentry) once public traffic exists.
5. `NEXT_PUBLIC_SITE_URL` to production domain; re-verify sitemap/canonicals/OG.

## Tier B — Experience upgrades

6. **Insights OG images** (`insights/[slug]/opengraph-image.tsx`) — the only content type missing social previews.
7. **Cursor labels** on more targets: explorer cards ("Explore"), insights cards ("Read"), deep-dive tabs.
8. **Section transition washes** where light→dark boundaries still feel abrupt (plan §43): add `PathLines`/gradient washes to the dark zone entries (FinalCTA is covered; ProgrammePage indigo close could get one).
9. **Testimonial movement:** subtle drag/scroll nudge on the primary quote (plan §20) — keep autoplay banned.
10. **Smooth scroll evaluation** (plan §28): test native first; only adopt Lenis if it demonstrably improves the pinned sequences, with reduced-motion + anchor + keyboard guarantees.
11. **Programme page 3D accents** (plan §15): at most one restrained `GeometryArtifact` per programme hero, reuse `three/` primitives — never a full canvas per page.
12. **GSAP/ScrollTrigger** only if choreography outgrows the current hooks — do not add for fades.

## Tier C — Content & growth

13. Insights: more articles, `/insights/[category]` pages, simple search; pagination when volume demands.
14. Headless-CMS migration path (plan §39) when non-technical editors need to publish — data files are already CMS-shaped.
15. i18n evaluation (multi-language) — large; only when international expansion is real.

## Tier D — Platform & QA (plan §48)

16. Tests: Vitest unit (validation, utils, rate-limit) + component (accordion, staged form, mega menu, theme toggle) + Playwright E2E (enquiry flow, navigation, mobile menu, reduced-motion behavior) + visual regression (homepage, programme pages, dark mode, breakpoints).
17. Lighthouse baseline + Core Web Vitals field data; bundle inspection; confirm LCP < 2.5s / CLS < 0.1 / INP < 200ms on real devices.
18. Shared rate-limit store for multi-instance deploys.
19. A11y audit pass: keyboard-only walk of mega menu + staged form, screen-reader pass, contrast check of programme accents (esp. `achieve` gold on light).
20. Dependency hygiene: adopt the R3F patch that clears the THREE.Clock warning when it ships.

---

## Design principles to protect (from plan §72–74, non-negotiable)

- Visuals must explain learning/progress/connection — never decoration for its own sake.
- One great scene beats three mediocre ones; motion needs a narrative purpose.
- Avoid: endless rounded cards, all-centered sections, autoplay carousels, glassmorphism, stock-looking art, invented numbers.
- Reduced-motion users get static compositions + functional transitions only (already systemic via CSS).

---

## Checklist for starting a work session

1. Read `prod.md` (current state) — especially §8 conventions/fixed-bug ledger and §9 pending inputs.
2. Read this file — pick the highest unblocked item.
3. Run `npm run lint` → `npx tsc --noEmit` → `npm run build` before and after changes (prod.md §8.3).
4. The user performs all website viewing/visual QA — never launch browsers or curl the site from the assistant side.
5. When a Tier item ships, move it to a "Done in V3.x" section in this file with the commit hash.
