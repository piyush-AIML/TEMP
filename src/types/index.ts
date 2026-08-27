/**
 * Educraft V2 — content models (plan §16, Stage 2).
 * The UI is content-driven: pages render from these structures, so adding
 * or editing a programme never touches component code.
 */

export type PillarId = 'learn' | 'include' | 'thrive' | 'achieve' | 'excel';

export interface Pillar {
  id: PillarId;
  /** Learn / Include / Thrive / Achieve / Excel */
  name: string;
  /** The vertical it represents, e.g. "Linguistics" */
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
