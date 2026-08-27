import type { Testimonial } from '@/types';

/**
 * SEED CONTENT — replace with real, verified testimonials before launch.
 * Plan §19/§20: proof must be real. These entries exist so the section
 * renders correctly during development; collect and verify real quotes
 * (with consent) and swap them in. Do not publish invented testimonials.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      'For the first time, we could actually see what our daughter was learning — the reports showed her progress in plain language, and the plan changed when she did. That partnership is what made the difference for us.',
    name: 'Parent of a Grade 9 student',
    role: 'Family perspective',
    context: 'Linguistics programme',
    programmeSlug: 'linguistics',
  },
  {
    quote:
      'The weekly tests felt hard at first. But after a few months I stopped being scared of mock papers — I knew my weak chapters, I knew what to practise, and the exam stopped feeling like a gamble.',
    name: 'NEET aspirant',
    role: 'Student perspective',
    context: 'NEET & JEE Preparation programme',
    programmeSlug: 'neet-jee',
  },
  {
    quote:
      'What convinced us was the individualised plan. It named specific goals, it had review dates, and every check-in showed evidence of progress. Our son started asking for his sessions — that never happened before.',
    name: 'Parent of a Grade 6 student',
    role: 'Family perspective',
    context: 'Inclusive Education programme',
    programmeSlug: 'inclusive-education',
  },
];
