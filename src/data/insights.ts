import type { Insight } from '@/types';

/**
 * Insights content — qualitative articles, no invented statistics.
 * Adding a new article here automatically renders it on /insights
 * and /insights/[slug]; no component changes needed (plan §60).
 */
export const insights: Insight[] = [
  {
    slug: 'what-actually-makes-practice-stick',
    title: 'What Actually Makes Practice Stick',
    category: 'Learning science',
    excerpt:
      'Not all practice is equal. The difference between repetition that builds skill and repetition that wastes time comes down to a few learnable design choices.',
    readingTime: '6 min read',
    date: '2026-08-18',
    sections: [
      {
        paragraphs: [
          'Every parent has watched a child complete pages of exercises and still blank on the same concept a week later. The instinct is to prescribe more of the same. But the problem is rarely quantity — it is the design of the practice itself.',
          'Learning science draws a consistent line between two kinds of repetition. Mindless practice repeats what is already easy: it feels productive, fills the notebook, and moves nothing. Deliberate practice targets the edge of what the student can do — the zone where attempts sometimes fail, because that is exactly where improvement lives.',
        ],
      },
      {
        heading: 'The ingredients of practice that sticks',
        paragraphs: [
          'The first ingredient is a specific target. "Practise maths for an hour" is not a target; "factor quadratic expressions with negative coefficients, without notes" is. A specific target tells the student what success looks like and makes it possible to notice whether it happened.',
          'The second is immediate, usable feedback. Skill grows fastest when the gap between attempt and correction is short. Waiting a week for a marked paper means practising errors for a week. This is why small-group instruction, mentor check-ins, and structured self-checking outperform volume homework.',
          'The third is spacing. Crammed repetition decays quickly; the same effort spread across days and weeks builds durable memory. Well-designed programmes bake spacing into the schedule rather than hoping students invent it.',
          'The fourth is variation. Practising slightly different versions of a problem — different wording, different contexts — builds the ability to recognise the underlying idea, which is what real exams actually test.',
        ],
      },
      {
        heading: 'What this looks like at home',
        paragraphs: [
          'Parents do not need to become tutors to support deliberate practice. Ask for the target: "What are you trying to be able to do by the end of this session?" Check the feedback loop: "How will you know if it worked?" And protect spacing: short, frequent sessions beat heroic weekend marathons.',
          'The deeper point is that practice is a skill — and like any skill, it can be taught. Students who learn to design their own practice stop depending on someone else to push them, and that independence is one of the strongest predictors of long-term academic success.',
        ],
      },
    ],
  },
  {
    slug: 'ai-in-the-classroom-teaching-judgement',
    title: 'AI in the Classroom: Teaching Judgement, Not Just Usage',
    category: 'AI literacy',
    excerpt:
      'The question is no longer whether students will use AI — they already do. It is whether they will use it with understanding and judgement.',
    readingTime: '7 min read',
    date: '2026-08-05',
    sections: [
      {
        paragraphs: [
          'Walk through any senior classroom and the AI question is already settled: students are using these tools for homework, essays, and exam prep. The adults are still arguing about whether that is allowed. Meanwhile, the more important question goes unasked: do students understand what they are using?',
          'AI literacy is not the ability to prompt. It is the ability to know what a model actually is — a system that learns statistical patterns from data — and therefore to know when its output deserves trust, when it needs checking, and when it should not be used at all.',
        ],
      },
      {
        heading: 'What understanding changes in practice',
        paragraphs: [
          'A student who knows that a model predicts likely continuations rather than retrieving facts will automatically treat its confident errors differently. They check citations. They distrust precise-sounding numbers. They notice when an answer is too fluent to be evidence.',
          'A student who understands how training data shapes outputs will also see the bias problem clearly: models inherit the skews of the data they were trained on, and "the AI said so" is not a neutral authority. That realisation is the foundation of responsible use — far more durable than any list of rules.',
          'And a student who has built even a small model themselves — seen how predictions go wrong on edge cases — stops being impressed by fluency and starts asking engineering questions. Building is the fastest route to judgement.',
        ],
      },
      {
        heading: 'The role of schools and parents',
        paragraphs: [
          'Schools do not need to become AI companies to teach this. They need curricula that treat AI as a subject of study — what it is, what it can do, where it fails — alongside practical, supervised projects. Bans and blanket permissions both avoid the real work.',
          'Parents can help most by modelling the same judgement: try a tool together, ask "how do we know this is true?", and be honest about uncertainty. The generation growing up with these tools will not be separated into users and non-users. They will be separated into those who understand what they are holding and those who do not.',
        ],
      },
    ],
  },
  {
    slug: 'exam-season-without-burnout',
    title: 'Exam Season Without Burnout',
    category: 'Student wellbeing',
    excerpt:
      'Steadiness is a performance strategy. The students who handle exam season best are rarely the ones who push hardest — they are the ones who plan, recover, and adjust.',
    readingTime: '5 min read',
    date: '2026-07-22',
    sections: [
      {
        paragraphs: [
          'Exam season has a predictable failure pattern. A student starts late, panics, pushes study hours up, sleeps less, performs worse, and interprets the drop as proof they need to push harder. The spiral feeds itself until the student arrives at the exam exhausted and convinced they are broken.',
          'The alternative is not softer preparation — it is structured preparation. The students who perform best under pressure treat the exam period as an engineered problem: workload, recovery, and feedback all designed, not improvised.',
        ],
      },
      {
        heading: 'The three levers',
        paragraphs: [
          'The first lever is rhythm. Study-rest cycles scheduled in advance protect attention far better than heroic sessions followed by collapse. A student who plans when they will stop studying is a student who can actually sustain the study they do.',
          'The second lever is evidence. Weekly testing converts anxiety into information: which chapters are weak, which question types leak marks, where time runs out. Anxiety loves vagueness; evidence shrinks it. A student who knows their weak chapters has something to do besides worry.',
          'The third lever is language. Students under pressure often describe themselves in catastrophic terms — "I always mess this up", "everyone else is ahead". Practising more accurate self-talk ("I lose marks on organic chemistry, so I will revise it first") keeps setbacks small and fixable.',
        ],
      },
      {
        heading: 'What parents can do',
        paragraphs: [
          'Parents can protect the levers without becoming study supervisors. Ask about the plan rather than the score. Notice recovery as seriously as effort. And when stress shows — irritability, sleep changes, avoidance — treat it as a signal about the system, not a failing of the child.',
          'Burnout is not the price of ambition. It is a defect in preparation design — and like any defect, it can be engineered out.',
        ],
      },
    ],
  },
  {
    slug: 'when-lazy-is-something-else',
    title: 'When "Lazy" Is Something Else',
    category: 'Parent guidance',
    excerpt:
      'The child who refuses homework, loses focus in minutes, and forgets instructions is often not choosing to struggle. Recognising the difference changes everything.',
    readingTime: '6 min read',
    date: '2026-07-08',
    sections: [
      {
        paragraphs: [
          'Most struggling students do not look like they are struggling. They look like they are not trying. Homework is "forgotten". Focus evaporates in minutes. Simple instructions need repeating four times. The natural adult conclusion is an attitude problem.',
          'Sometimes it is. But for many students — including those with dyslexia, ADHD, or other learning differences — the behaviour is the symptom, not the choice. A child who cannot decode text quickly will avoid reading. A child whose working memory drops instructions will appear to ignore them. Calling that laziness punishes the child twice: once for the difficulty, and once for their perfectly rational response to it.',
        ],
      },
      {
        heading: 'Signs that deserve a closer look',
        paragraphs: [
          'The pattern worth investigating is inconsistency: strong in conversation but frozen at a worksheet; capable one day and "not trying" the next; able to talk about a topic but unable to write about it. Effort that cannot be summoned on demand — across settings, despite real consequences — is not a choice.',
          'Another signal is the mismatch between ability and output. When a child explains ideas clearly but produces almost nothing in writing, the bottleneck may be transcription, not comprehension. That is a very different problem from motivation, with a very different solution.',
        ],
      },
      {
        heading: 'From blame to plan',
        paragraphs: [
          'The shift that changes a child’s trajectory is moving from "why won’t you" to "what is actually blocking". A structured assessment by a specialist can name the difficulty, and a named difficulty can be planned for: adapted materials, multisensory methods, extra time, different pace.',
          'Parents often report that the first visible change is not academic — it is the child’s face when they realise the adults have stopped blaming them. Students who have been told they are lazy for years do not need more motivation. They need the adults around them to see the problem accurately, and a plan built for the learner they actually are.',
        ],
      },
    ],
  },
];

export const getInsightBySlug = (slug: string): Insight | undefined =>
  insights.find((i) => i.slug === slug);
