Deferred V2 work for the marketing site, tiered by priority — background backlog, not current state.

# Background Roadmap — V3 Marketing-Site Enhancements

Absorbed from the deleted `Educraft_V3_Next_Version_Planner.md`. These are the deferred V2 items for
the **marketing site**, tiered by priority. Open production blockers
([`platform/blockers.md`](../platform/blockers.md)) take precedence over everything here.

**Item numbering is preserved from the original list** — a retired item keeps its number and is shown
as retired, so citations elsewhere never shift. Not carried, because the landing redesign now owns them ([`landing-redesign/spec.md`](landing-redesign/spec.md)):

- cursor labels on more targets — the custom `CursorProvider` is retired, so there is nothing to label
- programme-page 3D accents reusing `three/` primitives — the whole `three/**` tree is retired
- "GSAP/ScrollTrigger only if choreography outgrows the hooks" — GSAP + ScrollTrigger are now the
  marketing motion engine by decision
- smooth-scroll evaluation (Lenis) — scrubbing is GSAP-owned and the a11y contract forbids
  scroll-jacking
- the R3F/`THREE.Clock` dependency patch — R3F is retired, so the warning goes with it
- the `achieve`-gold-on-light contrast check — now enforced by the palette contrast test

## Tier A — Conversion & trust (before public launch)

1. Wire `ENQUIRY_WEBHOOK_URL` → CRM/transactional email (Resend, HubSpot, or similar) + internal notification channel.
2. Real testimonials + case studies; add verified outcome metrics to `/impact` only when real data exists.
3. Privacy-conscious analytics (Plausible/PostHog) implementing the plan's event map: `page_view, programme_view, programme_cta, enquiry_started, enquiry_completed, enquiry_error, nav_open, theme_changed, scroll_depth, insight_open`. Milestone-based scroll events only — never per-frame.
4. Error monitoring (Sentry) once public traffic exists.
5. `NEXT_PUBLIC_SITE_URL` to production domain; re-verify sitemap/canonicals/OG.

## Tier B — Experience upgrades

6. **Insights OG images** (`insights/[slug]/opengraph-image.tsx`) — the only content type missing social previews.
7. *(retired — see above)*
8. **Section transition washes** where light→dark boundaries feel abrupt: `PathLines`/gradient washes on dark-zone entries (FinalCTA covered; ProgrammePage indigo close could get one). The redesign's five routes own their own boundaries.
9. **Testimonial movement:** subtle drag/scroll nudge on the primary quote — keep autoplay banned.
10. *(retired — see above)*
11. *(retired — see above)*
12. *(retired — see above)*

## Tier C — Content & growth

13. Insights: more articles, `/insights/[category]` pages, simple search; pagination when volume demands.
14. Headless-CMS migration path when non-technical editors need to publish — data files are already CMS-shaped.
15. i18n evaluation (multi-language) — large; only when international expansion is real.

## Tier D — Platform & QA

16. Tests — the layers still missing: component (accordion, staged form, mega menu, theme toggle) + Playwright E2E (enquiry flow, navigation, mobile menu, reduced-motion behavior) + visual regression (homepage, programme pages, dark mode, breakpoints). The Vitest **unit** layer already exists (redesign Stage 1 harness; dashboard Stage 5 extends it) — extend it, do not rebuild it.
17. Lighthouse baseline + Core Web Vitals field data; bundle inspection; confirm LCP < 2.5s / CLS < 0.1 / INP < 200ms on real devices.
18. Shared rate-limit store for multi-instance deploys.
19. A11y audit pass — what remains: screen-reader pass, and a keyboard-only walk of the staged enquiry form. (The mega menu's keyboard/focus path and the programme-accent contrast check belong to the landing redesign.)
20. *(retired — see above)*

## Design principles to protect (non-negotiable)

- Visuals must explain learning/progress/connection — never decoration for its own sake.
- One great scene beats three mediocre ones; motion needs a narrative purpose.
- Avoid: endless rounded cards, all-centered sections, autoplay carousels, glassmorphism, stock-looking art, invented numbers.
- Reduced-motion users get static compositions + functional transitions only (already systemic via CSS).

## Maintenance

When a Tier item ships, replace it with a short "done" note naming the commit hash. The verification
loop is in [`platform/verification.md`](../platform/verification.md); the user performs all website
viewing and visual QA — the assistant never launches a browser.
