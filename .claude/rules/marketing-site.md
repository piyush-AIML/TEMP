---
paths:
  - "src/app/(site)/**"
  - "src/components/educraft/**"
  - "src/app/layout.tsx"
  # The marketing site's own surfaces, which sit outside the (site) group:
  - "src/app/api/enquiry/**"
  - "src/app/opengraph-image.tsx"
  - "src/app/sitemap.ts"
  - "src/app/robots.ts"
  # Shared client infrastructure the marketing pages depend on:
  - "src/hooks/**"
  - "src/context/**"
  - "src/components/theme/**"
---

# Marketing site conventions

The public site: the `(site)` route group, its components, and the root layout. Detail lives in
[`docs/surfaces/`](../../docs/surfaces/) and [`docs/design/`](../../docs/design/).

## This surface must stay free of Clerk and the database

The marketing site and `POST /api/enquiry` **never touch Clerk and never query the database.** It
must stay fully public and fast. The dashboard is deliberately isolated in its own route tree so a
dashboard bug cannot take down the pages that drive enquiries. If you find yourself importing Clerk
or `db()` into `(site)`, you have taken a wrong turn.

## Non-obvious traps, in the order they have bitten

1. **Never put `overflow-hidden` on an ancestor of a sticky/pinned section.** An ancestor with
   `overflow: hidden` becomes the sticky element's scroll box and silently breaks the pinning.
   Put overflow handling on the sticky *inner* element only. `StudentJourney` and
   `ProgrammeExplorer` depend on this.
2. **Route groups never contribute URL segments.** `(site)/about/page.tsx` serves `/about`. To own
   a URL prefix you need a *real* folder — that is why the dashboard is `src/app/dashboard/`, not
   `(dashboard)/`. A `page.tsx` at a group root collides with `(site)/page.tsx` at `/`.
3. **Gate anything derived from post-mount state behind a `mounted` flag.** `next-themes`'
   `theme` resolves after mount, so reading it during render causes a hydration mismatch. The
   `ThemeToggle` is the canonical example.
4. **Tailwind 4 only generates classes it can see literally in source.** `bg-ec-${x}` produces
   nothing. Every pillar→class mapping is written out in `src/lib/pillarStyles.ts` for this reason.
5. **`tw-animate-css`'s `animate-in` keyframes only fire on a key remount.** If a crossfade stops
   animating, check the `key` prop before suspecting the CSS.

## Every page carries its own metadata

Each marketing page exports `metadata` with a `title`, a `description` and
`alternates: { canonical: '/path' }`. Programme and insight detail pages also generate OG images.
See [`docs/surfaces/seo.md`](../../docs/surfaces/seo.md).

## Assets and copy

- Brand lockup is `public/logo.png` / `public/logo-dark.png` via `next-themes`, not a live SVG.
- Sourced illustrations are inline SVG systems under `src/components/educraft/graphics/`.
- **Testimonials in `src/data/testimonials.ts` are marked SEED content** and are a launch blocker
  until replaced with real, consented quotes. Do not build anything that makes them look
  authoritative.

## Current state

The homepage is mid-redesign: the approved "One Line" design replaces its 12 sections with 5 acts.
Before changing homepage structure, read
[`docs/projects/landing-redesign/state.md`](../../docs/projects/landing-redesign/state.md). Several
sections are slated for retirement — check before investing in them.
