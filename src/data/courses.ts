import { Languages, HeartHandshake, Sparkles, BrainCircuit, Atom, type LucideIcon } from 'lucide-react';

export interface Course {
  slug: string;
  pillar: string;
  name: string;
  icon: LucideIcon;
  shortIntro: string;
  longDescription: string;
  highlights: string[];
}

export const courses: Course[] = [
  {
    slug: 'linguistics',
    pillar: 'Learn',
    name: 'Linguistics',
    icon: Languages,
    shortIntro: 'Build real fluency and confident communication across languages, guided by methods rooted in how people actually learn to speak, read, and connect.',
    longDescription: "Educraft's linguistics track moves beyond textbook grammar drills toward practical, confidence-first language learning. Students build conversational fluency alongside academic writing and comprehension skills, with pathways tuned to their starting level and target language \u2014 preparing them to communicate, study, and thrive in genuinely global settings.",
    highlights: [
      'Personalized language pathways by level and goal',
      'Conversational and academic fluency tracks',
      'Global communication skill certification',
      'Small-group sessions led by language specialists',
    ],
  },
  {
    slug: 'inclusive-education',
    pillar: 'Include',
    name: 'Inclusive Education',
    icon: HeartHandshake,
    shortIntro: "Learning designed around every learner \u2014 adaptive support for diverse needs, so no student is left outside the circle of opportunity.",
    longDescription: "Every learner processes, paces, and engages differently \u2014 Educraft's inclusive education program is built around that reality rather than around it. Certified special-needs educators design individualized learning plans, adapt pace and sensory approach to each student, and keep families closely looped in, so progress is visible and support never feels like an afterthought.",
    highlights: [
      'Individualized learning plans per student',
      'Certified special-needs educators',
      'Pace- and sensory-adaptive content delivery',
      'Regular family partnership check-ins',
    ],
  },
  {
    slug: 'wellbeing-counseling',
    pillar: 'Thrive',
    name: 'Psychological Counseling & Wellbeing',
    icon: Sparkles,
    shortIntro: 'Confidential, judgment-free support that helps students manage stress, build resilience, and feel steady enough to focus on what matters.',
    longDescription: "Academic pressure doesn't stay in the classroom \u2014 Educraft's counseling and wellbeing track gives students a confidential space to work through stress, exam anxiety, and the everyday weight of growing up. Licensed school counselors offer one-on-one sessions alongside practical resilience toolkits, with guidance extended to parents and teachers so support is consistent everywhere the student shows up.",
    highlights: [
      'Licensed, confidential school counselors',
      'Exam-anxiety and stress-management toolkits',
      'One-on-one sessions, judgment-free',
      'Guidance resources for parents and teachers',
    ],
  },
  {
    slug: 'ai-digital-tech',
    pillar: 'Achieve',
    name: 'AI and Digital Technologies',
    icon: BrainCircuit,
    shortIntro: "Practical AI literacy and digital-world readiness \u2014 helping students think critically about technology and build the skills tomorrow's careers will actually need.",
    longDescription: "Educraft's AI and Digital Technologies track moves past buzzwords into practical literacy \u2014 how AI tools actually work, how to use them responsibly, and the computational thinking behind them. Students build real digital fluency alongside ethical awareness, preparing them not just to use tomorrow's technology, but to understand and shape it with confidence.",
    highlights: [
      'Hands-on AI and machine-learning literacy',
      'Ethical and responsible technology use',
      'Computational thinking and coding foundations',
      'Real-world portfolio projects for future careers',
    ],
  },
  {
    slug: 'neet-jee',
    pillar: 'Excel',
    name: 'NEET & JEE Preparation',
    icon: Atom,
    shortIntro: 'Rigorous, exam-focused coaching for NEET & JEE aspirants \u2014 built on strong fundamentals, disciplined practice, and steady mentorship.',
    longDescription: "Educraft's NEET & JEE program is built on fundamentals first \u2014 a concept-first curriculum mapped closely to the NCERT and JEE syllabus, reinforced through weekly mock tests with All-India ranking so students always know exactly where they stand. Regular doubt-clearing mentor sessions and a performance analytics dashboard keep preparation disciplined, measurable, and steady rather than last-minute and anxious.",
    highlights: [
      'Concept-first curriculum mapped to NCERT/JEE syllabus',
      'Weekly mock tests with All-India ranking',
      'Regular doubt-clearing mentor sessions',
      'Personal performance analytics dashboard',
    ],
  },
];

export const getCourseBySlug = (slug: string) => courses.find((c) => c.slug === slug);
