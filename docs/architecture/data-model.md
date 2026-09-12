# Content & data architecture

The typed content model behind the marketing site, where each shape lives, and the rule against invented numbers.

## The content model

Types live in `src/types/index.ts`; the data itself lives in `src/data/`.

**`Programme`** — `slug`, `pillarId`, `name`, `tagline`, `promise`, `description`, `whyItMatters`,
`audience[]`, `outcomes[]`, `highlights[]`, `methodology[5]`, `curriculum[]`, `journey[6]`,
`activities[]`, `support[]`, `proof[]`, `faqs[]`.

It is **fully content-driven** — adding a programme requires zero component changes.

**Also modelled:** `Pillar`, `Testimonial`, `Insight` (7 categories), `NavigationItem`,
`AudienceEntry`.

**Site-level content** (`methodologySteps`, `studentJourneyStages`) lives in `data/pillars.ts` —
not in a page component.

Two details worth knowing:

- `data/programmes.ts` carries each programme's own `faqs[]`; there is no standalone `faqs.ts`.
- `data/navigation.ts` defines the audience entries used by the site's doors.

The dashboard's relational model (`User`, `Course`, `Enrollment`, `ClassSession`, `Material`,
`Notification`, `Meeting`, `Task`, `CompletionLog` — Postgres tables) is a separate concern and is
specified in the dashboard project docs (`projects/dashboard/`).

## No invented statistics

**No invented statistics anywhere.** Proof is qualitative; the site states structural facts only:
**5 verticals, 1 ecosystem, 6 journey stages.**

> ⚠️ **Known inconsistency — the audience count.** The master document listed **4 audiences** in that
> structural-facts line, but the site renders **three** audience doors, and `data/navigation.ts`
> defines exactly three. `Partners` has no entry point, while the `Impact` stat block asserts
> "4 Audiences served". The landing redesign resolves this to **3**, in both places it appears
> (the homepage and `/impact`, which repeats the stat block verbatim). Recorded here rather than
> silently picked, because both counts are still live in the shipped build.
