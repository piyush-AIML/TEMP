/**
 * Educraft V2 — content models (plan §16, Stage 2).
 * The UI is content-driven: pages render from these structures, so adding
 * or editing a programme never touches component code.
 */

/**
 * Pillar identity is derived from the registry in `data/pillars.ts` — see
 * Landing-Redesign-Plan.md §7.3. The re-export is type-only (erased at
 * compile time), so there is no runtime import cycle between this module and
 * the data layer, and every existing `import type { PillarId } from '@/types'`
 * keeps working.
 *
 * Do NOT hand-write the union here. Adding a pillar means adding one object to
 * `pillars`, and every `Record<PillarId, …>` in the codebase then fails to
 * compile until it is updated — which is the point.
 */
import type { PillarId } from '@/data/pillars';

export type { PillarId };

export interface Pillar {
  /** Short key, e.g. 'learn'. Narrowed to the literal union by the registry. */
  id: string;
  /** URL slug and DB vertical value, e.g. 'linguistics'. Same as the programme slug. */
  slug: string;
  /** Display name, e.g. 'Learn'. */
  name: string;
  /** The vertical it represents, e.g. 'Linguistics'. */
  vertical: string;
  /** One-line description used in nav, mega menu, and ecosystem map. */
  short: string;
  /** Longer description for pillar sections. */
  description: string;
}

export interface Highlight {
  title: string;
  detail: string;
}

export interface MethodStep {
  title: string;
  description: string;
}

export interface CurriculumSection {
  title: string;
  description: string;
  items: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ProofPoint {
  title: string;
  description: string;
}

export interface JourneyStage {
  stage: string;
  title: string;
  description: string;
}

export interface Outcome {
  title: string;
  description: string;
}

export interface Audience {
  title: string;
  description: string;
}

/** Full programme model (plan §16). */
export interface Programme {
  slug: string;
  pillarId: PillarId;
  name: string;
  /** One strong line that sells the programme. */
  tagline: string;
  /** The "programme promise" — what a learner walks away with. */
  promise: string;
  /** Editorial long description. */
  description: string;
  /** Why this programme matters right now. */
  whyItMatters: string;
  audience: Audience[];
  outcomes: Outcome[];
  highlights: Highlight[];
  methodology: MethodStep[];
  curriculum: CurriculumSection[];
  journey: JourneyStage[];
  activities: string[];
  support: string[];
  proof: ProofPoint[];
  faqs: FAQ[];
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  context: string;
  programmeSlug?: string;
}

export const insightCategories = [
  'Learning science',
  'AI literacy',
  'Inclusive education',
  'Student wellbeing',
  'Exam preparation',
  'School leadership',
  'Parent guidance',
] as const;

export type InsightCategory = (typeof insightCategories)[number];

export interface InsightSection {
  heading?: string;
  paragraphs: string[];
}

export interface Insight {
  slug: string;
  title: string;
  category: InsightCategory;
  excerpt: string;
  readingTime: string;
  /** ISO date, e.g. 2026-08-01 */
  date: string;
  sections: InsightSection[];
}

export interface NavigationItem {
  label: string;
  href: string;
  /** Marks the programmes mega-menu trigger. */
  mega?: boolean;
}

export interface AudienceEntry {
  slug: 'schools' | 'parents' | 'students';
  label: string;
  headline: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  ctaHref: string;
}
