import type { NavigationItem, AudienceEntry } from '@/types';
import { pillars } from './pillars';
import { programmes } from './programmes';

export const mainNavigation: NavigationItem[] = [
  { label: 'Programmes', href: '/programmes', mega: true },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Impact', href: '/impact' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
];

export const audienceEntries: AudienceEntry[] = [
  {
    slug: 'schools',
    label: 'For Schools',
    headline: 'A partner your school can build on.',
    description:
      'Five specialist verticals delivered under one partnership: linguistics, inclusive education, wellbeing, AI & digital literacy, and NEET/JEE preparation — with shared reporting, safeguarding, and a single point of contact.',
    benefits: [
      'One partner across five specialist verticals',
      'Consistent reporting and progress visibility',
      'Safeguarding-first policies aligned to school standards',
      'Flexible delivery: in-school, after-school, or blended',
    ],
    ctaLabel: 'Talk to the Education Team',
    ctaHref: '/contact',
  },
  {
    slug: 'parents',
    label: 'For Parents',
    headline: 'Clear progress, real partnership.',
    description:
      'Understand exactly what your child is learning, how progress is measured, and where they are headed — with regular updates, honest feedback, and a support network that includes you.',
    benefits: [
      'Regular, plain-language progress updates',
      'Visible learning plans and goals',
      'Guidance resources for supporting learning at home',
      'Confidential wellbeing support when it is needed',
    ],
    ctaLabel: 'Find the Right Programme',
    ctaHref: '/programmes',
  },
  {
    slug: 'students',
    label: 'For Students',
    headline: 'A path that feels like yours.',
    description:
      'Start with what you are curious about and build from there — real projects, real conversations, real progress you can see. Learning that connects to the life you want next.',
    benefits: [
      'Programmes built around real skills, not just textbooks',
      'Small groups where your voice matters',
      'Portfolio projects that show what you can do',
      'Mentors who actually know your name',
    ],
    ctaLabel: 'Explore Your Path',
    ctaHref: '/programmes',
  },
];

export const footerProgrammes = programmes.map((p) => ({ label: p.name, href: `/programmes/${p.slug}` }));

/** Route for each audience landing page. */
export const audiencePageHrefs: Record<AudienceEntry['slug'], string> = {
  schools: '/for-schools',
  parents: '/for-parents',
  students: '/for-students',
};

export const footerAudiences = audienceEntries.map((a) => ({
  label: a.label,
  href: audiencePageHrefs[a.slug],
}));

export const footerCompany = [
  { label: 'About', href: '/about' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Impact', href: '/impact' },
  { label: 'Insights', href: '/insights' },
  { label: 'Careers', href: '/careers' },
  { label: 'Partnerships', href: '/partnerships' },
  { label: 'Contact', href: '/contact' },
];

export const footerLegal = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

/** All five pillars for the mega menu (with their programme links). */
export const megaProgrammes = programmes.map((p) => ({
  slug: p.slug,
  pillar: pillars.find((pl) => pl.id === p.pillarId)?.name ?? p.pillarId,
  name: p.name,
  short: p.tagline,
  href: `/programmes/${p.slug}`,
}));
