import type { Pillar, MethodStep, JourneyStage } from '@/types';

/** Site-level "How it works" journey (plan §17) — shared by every programme. */
export const methodologySteps: MethodStep[] = [
  {
    title: 'Understand',
    description:
      'We learn about the student — their level, needs, and context — before prescribing anything.',
  },
  {
    title: 'Map',
    description:
      'We identify the right pathway and set a plan with clear milestones, agreed with the family.',
  },
  {
    title: 'Learn',
    description:
      'We deliver the programme through structured sessions led by specialists in that vertical.',
  },
  {
    title: 'Measure',
    description:
      'We track progress with evidence — checkpoints, portfolios, dashboards — not impressions.',
  },
  {
    title: 'Grow',
    description:
      'We adjust and continue: targets raise, methods adapt, and the journey keeps compounding.',
  },
];

/** Site-level student journey story (plan §18). */
export const studentJourneyStages: JourneyStage[] = [
  {
    stage: '01',
    title: 'Curious',
    description:
      'Every journey starts with a question — a language to learn, an exam to face, a way of learning that finally fits.',
  },
  {
    stage: '02',
    title: 'Supported',
    description:
      'An assessment, a plan, and a specialist who knows their name. The path stops feeling abstract.',
  },
  {
    stage: '03',
    title: 'Practising',
    description:
      'Weekly sessions turn effort into habit — speaking, building, solving, or practising calm.',
  },
  {
    stage: '04',
    title: 'Confident',
    description:
      'Checkpoints make progress visible. The student starts raising their hand, shipping projects, taking tests in stride.',
  },
  {
    stage: '05',
    title: 'Capable',
    description:
      'Skills transfer to real settings — classrooms, exams, conversations, and the life beyond them.',
  },
  {
    stage: '06',
    title: 'Ready',
    description:
      'The student owns their toolkit and knows what comes next. The ecosystem stays with them.',
  },
];

/**
 * The five pillars — the narrative spine of the whole experience
 * ("Many learning paths. One connected ecosystem.").
 */
export const pillars: Pillar[] = [
  {
    id: 'learn',
    name: 'Learn',
    vertical: 'Linguistics',
    short: 'Real fluency and confident communication across languages.',
    description:
      'Building fluency, comprehension, and global communication skills through personalised language pathways.',
  },
  {
    id: 'include',
    name: 'Include',
    vertical: 'Inclusive Education',
    short: 'Adaptive, individualised support so every learner can access opportunity.',
    description:
      'Learning designed around every learner — pace, sensory needs, and communication style included.',
  },
  {
    id: 'thrive',
    name: 'Thrive',
    vertical: 'Wellbeing & Counselling',
    short: 'Confidential, judgement-free support that keeps students steady.',
    description:
      'Confidential counselling and resilience toolkits that keep students steady and focused on what matters.',
  },
  {
    id: 'achieve',
    name: 'Achieve',
    vertical: 'AI & Digital Technologies',
    short: 'Practical AI literacy and digital readiness for what comes next.',
    description:
      'Hands-on AI literacy, computational thinking, and responsible technology use for the careers of tomorrow.',
  },
  {
    id: 'excel',
    name: 'Excel',
    vertical: 'NEET & JEE Preparation',
    short: 'Concept-first, disciplined exam coaching with measurable progress.',
    description:
      'Fundamentals-first exam coaching with weekly testing, mentor guidance, and transparent progress tracking.',
  },
];

export const getPillar = (id: string): Pillar | undefined => pillars.find((p) => p.id === id);
