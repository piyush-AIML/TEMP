# Route & application architecture

Every URL the application serves, what holds it, and the layout shell that wraps the marketing surface.

## Route inventory

```
/                                Homepage
/about                           Story, pillars, principles
/programmes                      Index — 5 programme cards w/ graphics
/programmes/[slug]               Detail — one per vertical: linguistics, inclusive-education,
                                  wellbeing-counseling, ai-digital-tech, neet-jee
/for-schools · /for-parents · /for-students   Audience doors (shared AudiencePage)
/methodology                     5-step method, measurement principles
/impact                          Outcome chain, structural facts, evidence
/insights                        Index with category filter (client)
/insights/[slug]                 Article (SSG via generateStaticParams)
/careers · /partnerships · /contact · /privacy · /terms
/api/enquiry                     POST — real lead pipeline
sitemap.xml · robots.txt         Generated (app/sitemap.ts, app/robots.ts —
                                  the static public/robots.txt was deleted on purpose)
/opengraph-image                 Homepage social preview (next/og)
/programmes/[slug]/opengraph-image   Per-programme social previews
```

Notes that belong with the inventory:

- **Every marketing route is statically generated.** `POST /api/enquiry` is the only dynamic route
  on the marketing side; the dashboard routes (`/dashboard/**`) are dynamic by design and live in
  their own real folder — see [`layering.md`](layering.md) rule 8 for why a route group cannot
  provide that prefix.
- `/insights/[slug]` enumerates its articles at build time via `generateStaticParams`.
- The static `public/robots.txt` was **deleted on purpose** — `app/robots.ts` generates the file
  instead. Do not restore it.
- The three audience doors share one `AudiencePage` component; `/programmes/[slug]` serves the five
  verticals listed above and nothing else.

The homepage's section architecture is owned by the landing-redesign project (`projects/landing-redesign/`),
which supersedes the older section arc; the per-surface description of the homepage lives in
`surfaces/homepage.md`. The route list above is unaffected — no route is deleted by that redesign.

## Shell hierarchy

```
src/app/layout.tsx               fonts, theme, metadata, Organization JSON-LD
  └── src/app/(site)/layout.tsx  EnquiryModalProvider → CursorProvider → SkipLink → Navbar
                                 → main#main-content → Footer → EnquiryModal
                                 → FloatingEnquiryButton
```

- `src/app/layout.tsx` holds **only** fonts, theme, metadata and the Organization JSON-LD. It must
  stay static — see the static-site boundary in [`layering.md`](layering.md).
- All marketing pages live under the **`(site)` route group**, which wraps the entire site shell
  above. The homepage itself lives inside the group as `(site)/page.tsx`.
- The landing redesign retires `CursorProvider` and moves `FloatingEnquiryButton` to appear only
  after the hero act; the chain above is the pre-redesign shell.
