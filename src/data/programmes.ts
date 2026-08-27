import type { Programme, PillarId } from '@/types';

/**
 * Educraft V2 — programme content model (plan §16, §71).
 * Every programme answers: what exactly happens, who does it, how often,
 * for whom, how progress is measured, what the student experiences,
 * and what changes afterwards. No invented statistics — proof is qualitative
 * until real, verified data is supplied.
 */

export const programmes: Programme[] = [
  // ---------------------------------------------------------------------------
  // LEARN — Linguistics
  // ---------------------------------------------------------------------------
  {
    slug: 'linguistics',
    pillarId: 'learn',
    name: 'Linguistics',
    tagline: 'Language that works in the real world.',
    promise:
      'Students leave able to hold real conversations, write with clarity, and read confidently in their target language — not just pass a grammar test.',
    description:
      "Educraft's linguistics track moves beyond textbook grammar drills toward confidence-first language learning. Every learner starts with a level-mapped assessment that places them on a structured pathway from beginner to advanced fluency. Sessions are conversation-first: students speak from the first class, building the four skills — speaking, listening, reading, and writing — through real media, role-play, and guided discussion rather than rote memorisation. Academic support runs alongside: structured writing workshops and comprehension practice prepare students for school work and international study. Progress is tracked against internationally recognised level descriptors, so parents and students always know exactly where they stand and what comes next.",
    whyItMatters:
      'Language is the gateway skill: it unlocks global higher education, international careers, and the confidence to communicate beyond the classroom. Fluency compounds — the earlier a student builds it, the more doors stay open later.',
    audience: [
      {
        title: 'Foundational learners',
        description:
          'School-age students building strong first-language English or beginning a second language, starting with confidence and clear basics.',
      },
      {
        title: 'Advanced communicators',
        description:
          'Students preparing for international study, competitive opportunities, or leadership roles who need polished writing and speaking.',
      },
      {
        title: 'Heritage speakers',
        description:
          'Learners who understand a language at home but want structured support to read, write, and speak it with real fluency.',
      },
    ],
    outcomes: [
      {
        title: 'Conversational confidence',
        description:
          'Students initiate and sustain real conversations without freezing or translating in their head first.',
      },
      {
        title: 'Academic writing clarity',
        description:
          'Essays, summaries, and arguments that are structured, precise, and appropriate for school or university.',
      },
      {
        title: 'Strong comprehension',
        description:
          'Reading and listening stamina for textbooks, lectures, news, and everyday speech — not just graded materials.',
      },
      {
        title: 'Public communication',
        description:
          'Presentations and discussions delivered with composure, structure, and a personal voice.',
      },
    ],
    highlights: [
      {
        title: 'Level-mapped pathways',
        detail:
          'Placement against internationally recognised level descriptors, with a clear progression map from day one.',
      },
      {
        title: 'Conversation-first sessions',
        detail:
          'Students speak from the first class. Grammar is learned in service of communication, not ahead of it.',
      },
      {
        title: 'Four-skills balance',
        detail:
          'Speaking, listening, reading, and writing each get deliberate practice — no skill left to chance.',
      },
      {
        title: 'Specialist instructors',
        detail:
          'Small groups led by language specialists trained in second-language teaching methods.',
      },
    ],
    methodology: [
      {
        title: 'Understand',
        description:
          'A level-mapped assessment identifies where the student really is — not where their age or grade suggests.',
      },
      {
        title: 'Map',
        description:
          'We set a personal pathway with milestone targets for each of the four skills.',
      },
      {
        title: 'Learn',
        description:
          'Weekly conversation-first sessions build fluency through real materials, role-play, and guided discussion.',
      },
      {
        title: 'Measure',
        description:
          'Regular checkpoint tasks track progress against level descriptors, with feedback the student can act on.',
      },
      {
        title: 'Grow',
        description:
          'The pathway adjusts: targets raise as confidence grows, and new challenge areas are introduced deliberately.',
      },
    ],
    curriculum: [
      {
        title: 'Foundations',
        description:
          'Core vocabulary, pronunciation, and sentence patterns — the load-bearing structure every conversation rests on.',
        items: [
          'High-frequency vocabulary in real contexts',
          'Pronunciation and intonation practice',
          'Core grammar learned through use',
        ],
      },
      {
        title: 'Fluency building',
        description:
          'Speaking and listening at speed: the gap between "knowing" a language and "using" it closes here.',
        items: [
          'Guided conversation and debate',
          'Listening to authentic media: film, podcasts, news',
          'Role-play for school, travel, and interviews',
        ],
      },
      {
        title: 'Academic literacy',
        description:
          'Reading and writing for study: the skills that carry students through exams and into university.',
        items: [
          'Structured paragraph and essay writing',
          'Reading comprehension across text types',
          'Summarising, note-taking, and research basics',
        ],
      },
      {
        title: 'Global communication',
        description:
          'Presenting ideas with confidence and understanding cultural context.',
        items: [
          'Presentation skills and public speaking',
          'Discussion etiquette across cultures',
          'Mock interviews and formal communication',
        ],
      },
    ],
    journey: [
      {
        stage: 'Curious',
        title: 'Curious',
        description:
          'The student brings whatever they have — a few words, school English, or a language spoken at home.',
      },
      {
        stage: 'Supported',
        title: 'Supported',
        description:
          'A level-mapped pathway and a specialist instructor make the next step clear and safe to take.',
      },
      {
        stage: 'Practising',
        title: 'Practising',
        description:
          'Weekly conversation-first sessions turn effort into habit: speaking, listening, reading, writing — all four skills, every week.',
      },
      {
        stage: 'Confident',
        title: 'Confident',
        description:
          'Checkpoint feedback shows visible progress. The student starts volunteering to speak.',
      },
      {
        stage: 'Capable',
        title: 'Capable',
        description:
          'Real materials no longer intimidate. Essays, presentations, and discussions become ordinary.',
      },
      {
        stage: 'Ready',
        title: 'Ready',
        description:
          'The student walks into exams, interviews, and new environments communicating on their own terms.',
      },
    ],
    activities: [
      'Role-play clinics: ordering, interviewing, negotiating',
      'Media discussion circles around films, podcasts, and articles',
      'Weekly writing workshops with line-by-line feedback',
      'Mock presentations and panel discussions',
      'Storytelling sessions that turn vocabulary into memory',
    ],
    support: [
      'Small-group sessions (never lecture halls)',
      'Monthly progress reports in plain language',
      'Parent updates with concrete next steps',
      'A practice library for independent work between sessions',
    ],
    proof: [
      {
        title: 'Specialist educators',
        description:
          'Every instructor is trained in second-language teaching methods, not just fluent in the language.',
      },
      {
        title: 'Recognised level mapping',
        description:
          'Progress is benchmarked against internationally recognised level descriptors, not our own private scale.',
      },
      {
        title: 'Transparent reporting',
        description:
          'Families receive structured progress reports with evidence of what the student can now do.',
      },
      {
        title: 'Visible portfolios',
        description:
          'Writing samples, recordings, and presentations accumulate into a portfolio families can review anytime.',
      },
    ],
    faqs: [
      {
        question: 'How is my child placed at the right level?',
        answer:
          'Placement starts with a level-mapped assessment across all four skills. We use the result — not age or grade — to set the starting point, and the pathway adjusts as progress is measured.',
      },
      {
        question: 'How often are the sessions held?',
        answer:
          'Weekly sessions are the standard cadence, supported by a practice library for independent work between classes. Intensive tracks can add sessions during exam or application seasons.',
      },
      {
        question: 'Will my child learn grammar?',
        answer:
          'Yes — but in service of communication. Grammar is introduced where it makes real conversations and writing better, then practised in use rather than as isolated drills.',
      },
      {
        question: 'Can this support international study applications?',
        answer:
          'The academic literacy strand builds the writing, comprehension, and presentation skills international study expects. For specific exam benchmarks, the pathway can be adjusted to include targeted preparation.',
      },
      {
        question: 'How do we see progress?',
        answer:
          'Every milestone produces checkpoint evidence — writing samples, recorded speaking tasks, comprehension results — collected in a portfolio and summarised in monthly reports to families.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // INCLUDE — Inclusive Education
  // ---------------------------------------------------------------------------
  {
    slug: 'inclusive-education',
    pillarId: 'include',
    name: 'Inclusive Education',
    tagline: 'Every learner, on a path that fits.',
    promise:
      'Learning designed around the learner — pace, sensory needs, and communication style included — so no student is left outside the circle of opportunity.',
    description:
      "Every learner processes, paces, and engages differently — Educraft's inclusive education programme is built around that reality rather than around it. Certified special educators begin with a structured assessment of strengths, needs, and learning preferences, then design an individualised learning plan with the family. Sessions are deliberately multisensory and adaptive: content, pace, and presentation adjust to what works for each student, week by week. Families are partners, not spectators — regular check-ins keep progress visible and goals honest. Where a student attends school, we coordinate with teachers so classroom and programme reinforce each other instead of pulling in different directions. The goal is simple and ambitious at once: every learner moves forward measurably, on a path that fits them.",
    whyItMatters:
      'Students with learning differences do not lack ability — they need a learning environment designed for how they actually learn. Individualised support turns frustration into progress, and progress into self-belief that carries into every part of school life.',
    audience: [
      {
        title: 'Students with learning differences',
        description:
          'Learners with dyslexia, ADHD, autism, or other specific needs who deserve teaching that adapts to them.',
      },
      {
        title: 'Families seeking partnership',
        description:
          'Parents who want to understand their child’s learning profile and be part of the plan, not outside it.',
      },
      {
        title: 'Schools needing specialist support',
        description:
          'Institutions that want certified special educators working alongside their classroom teachers.',
      },
    ],
    outcomes: [
      {
        title: 'Learning confidence',
        description:
          'A student who has experienced steady, visible progress learns to trust their own ability to learn.',
      },
      {
        title: 'Foundational skills at pace',
        description:
          'Literacy, numeracy, and study skills built at the pace that actually works — fast enough to grow, slow enough to stick.',
      },
      {
        title: 'Self-advocacy',
        description:
          'Students learn to name what helps them learn and to ask for it — a skill that outlasts any single lesson.',
      },
      {
        title: 'Classroom participation',
        description:
          'Skills and confidence transfer back to school, where the student participates more fully in the life of the class.',
      },
    ],
    highlights: [
      {
        title: 'Individualised learning plans',
        detail:
          'Every student has a written plan with goals, methods, and review dates — co-owned by educators and family.',
      },
      {
        title: 'Certified special educators',
        detail:
          'Professionals trained in special education and learning differences, not generalists improvising.',
      },
      {
        title: 'Multisensory methods',
        detail:
          'Content is delivered through sight, sound, and touch in combination — the approach research says works.',
      },
      {
        title: 'Family partnership cadence',
        detail:
          'Structured check-ins keep families informed and involved at every stage of the plan.',
      },
    ],
    methodology: [
      {
        title: 'Understand',
        description:
          'A structured assessment profiles the student’s strengths, needs, and learning preferences — with family input from day one.',
      },
      {
        title: 'Map',
        description:
          'Educator and family co-write the individualised learning plan: goals, methods, and review dates.',
      },
      {
        title: 'Learn',
        description:
          'Adaptive, multisensory sessions deliver the plan — adjusting pace and presentation to what works each week.',
      },
      {
        title: 'Measure',
        description:
          'Progress is tracked against the plan’s goals and reviewed with the family at every check-in.',
      },
      {
        title: 'Grow',
        description:
          'The plan evolves: goals raised, methods adjusted, and new independence introduced as it is earned.',
      },
    ],
    curriculum: [
      {
        title: 'Core academics, adapted',
        description:
          'Literacy, numeracy, and study skills rebuilt for the way this student learns.',
        items: [
          'Multisensory reading and writing instruction',
          'Concrete-to-abstract maths progression',
          'Study skills: organisation, time, and focus',
        ],
      },
      {
        title: 'Communication & social-emotional learning',
        description:
          'The skills that make school feel navigable and friendships possible.',
        items: [
          'Expressive and receptive communication practice',
          'Emotional regulation strategies',
          'Social skills in structured, low-pressure settings',
        ],
      },
      {
        title: 'Life & independence skills',
        description:
          'What school rarely teaches explicitly: the routines that make every other goal reachable.',
        items: [
          'Task routines and transitions',
          'Self-monitoring and asking for help',
          'Planning homework and long-term work',
        ],
      },
      {
        title: 'Sensory-friendly learning environments',
        description:
          'The environment is part of the method — sessions adapt to sensory needs.',
        items: [
          'Sensory profiles that shape session design',
          'Movement and focus breaks built into learning',
          'Materials matched to processing preferences',
        ],
      },
    ],
    journey: [
      {
        stage: 'Curious',
        title: 'Curious',
        description:
          'A family arrives with questions — and often with frustration from years of one-size-fits-all teaching.',
      },
      {
        stage: 'Supported',
        title: 'Supported',
        description:
          'The assessment names what is going on, and the individualised plan turns understanding into a concrete path.',
      },
      {
        stage: 'Practising',
        title: 'Practising',
        description:
          'Multisensory sessions make learning tangible. Small, repeated wins start compounding.',
      },
      {
        stage: 'Confident',
        title: 'Confident',
        description:
          'The student begins to ask for what helps them learn — and to believe progress is possible.',
      },
      {
        stage: 'Capable',
        title: 'Capable',
        description:
          'Skills transfer to the classroom. Homework, participation, and friendships shift.',
      },
      {
        stage: 'Ready',
        title: 'Ready',
        description:
          'The student learns on a path that fits — and knows how to keep it that way.',
      },
    ],
    activities: [
      'Multisensory literacy labs: letter tiles, sand trays, and guided reading',
      'Interest-led projects that harness what the student already loves',
      'Social skills circles in small, structured groups',
      'Organisation clinics: planners, routines, and backpack systems',
      'Progress celebrations that make growth visible to the student',
    ],
    support: [
      'Individualised learning plan reviews with families',
      'Coordination with classroom teachers where the student attends school',
      'Transition planning between grades and schools',
      'Parent strategy sessions for supporting learning at home',
    ],
    proof: [
      {
        title: 'Certified educators',
        description:
          'Every specialist holds recognised special-education training — this is not a general programme with a label.',
      },
      {
        title: 'Written plans, reviewed on cadence',
        description:
          'Each student’s individualised plan has dated goals and scheduled reviews, so progress is documented rather than remembered.',
      },
      {
        title: 'Family partnership',
        description:
          'Families participate in goal-setting and reviews — the plan belongs to the family, not just the centre.',
      },
      {
        title: 'School collaboration',
        description:
          'Where students attend school, we coordinate with teachers so support is consistent across both environments.',
      },
    ],
    faqs: [
      {
        question: 'How is the individualised plan created?',
        answer:
          'It starts with a structured assessment of strengths, needs, and learning preferences, followed by a goal-setting meeting with the family. The plan names specific goals, methods, and review dates — it is a living document, not a one-time form.',
      },
      {
        question: 'What kinds of needs do you support?',
        answer:
          'The programme supports a wide range of learning differences, including dyslexia, ADHD, autism spectrum conditions, and general learning delays. The assessment is what determines fit and approach for each student.',
      },
      {
        question: 'Does this replace school?',
        answer:
          'No. It complements school. Where a student attends school, we coordinate with classroom teachers so both environments reinforce the same goals.',
      },
      {
        question: 'How involved will I be as a parent?',
        answer:
          'Deeply, by design. You help set goals, attend structured check-ins, and receive practical strategies for supporting learning at home.',
      },
      {
        question: 'How is progress measured?',
        answer:
          'Against the goals in the individualised plan, reviewed at each check-in with concrete evidence — work samples, observed skills, and task completion — shared with the family.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // THRIVE — Wellbeing & Counselling
  // ---------------------------------------------------------------------------
  {
    slug: 'wellbeing-counseling',
    pillarId: 'thrive',
    name: 'Wellbeing & Counselling',
    tagline: 'Steady minds learn better.',
    promise:
      'Students gain the tools to understand their emotions, manage stress, and feel steady enough to focus on what matters — with families and teachers supported too.',
    description:
      "Academic pressure doesn't stay in the classroom — Educraft's wellbeing track gives students a confidential space to work through stress, exam anxiety, and the everyday weight of growing up. Licensed school counsellors offer one-on-one sessions alongside practical resilience toolkits: students learn to name what they feel, understand where it comes from, and practise strategies that actually work for them. Support extends outward, because a student's steadiness depends on the adults around them — parents receive guidance sessions, and teachers get workshops on building psychologically safe classrooms. The programme follows a safeguarding-first protocol throughout: confidentiality is respected, limits are explained clearly, and any serious concern is escalated with care. A student who feels steady learns better, and a student who learns better keeps feeling steady — that is the loop this programme builds.",
    whyItMatters:
      'Stress and anxiety are among the biggest silent barriers to learning. When a student learns to regulate their emotions, everything else — attention, memory, exams, friendships — gets easier. Wellbeing is not a break from education; it is part of its foundation.',
    audience: [
      {
        title: 'Students under pressure',
        description:
          'Learners facing exam anxiety, transitions, peer pressure, or the ordinary emotional weight of growing up.',
      },
      {
        title: 'Schools building wellbeing culture',
        description:
          'Institutions that want a structured counselling provision and psychologically safe classrooms.',
      },
      {
        title: 'Parents who want to help',
        description:
          'Families looking for guidance on supporting a stressed or struggling child at home.',
      },
    ],
    outcomes: [
      {
        title: 'Emotional vocabulary',
        description:
          'Students can name what they feel and explain it — the first step in managing anything.',
      },
      {
        title: 'Coping strategies that stick',
        description:
          'A personal toolkit of practised strategies for stress, anxiety, and low moments — not generic advice.',
      },
      {
        title: 'Focus and steadiness',
        description:
          'With emotional noise quieter, attention returns: students report being able to actually sit with their work.',
      },
      {
        title: 'Resilience for the long term',
        description:
          'Skills that outlast school — self-awareness, asking for help, and bouncing back from setbacks.',
      },
    ],
    highlights: [
      {
        title: 'Licensed, confidential counsellors',
        detail:
          'One-on-one sessions with licensed school counsellors, held under a clearly explained confidentiality framework.',
      },
      {
        title: 'Exam-anxiety toolkits',
        detail:
          'Structured programmes that turn exam season from a crisis into a managed, practised challenge.',
      },
      {
        title: 'Whole-ecosystem guidance',
        detail:
          'Sessions and workshops for parents and teachers, because a student’s steadiness depends on the adults around them.',
      },
      {
        title: 'Safeguarding-first protocol',
        detail:
          'Clear escalation pathways for serious concerns, with care and transparency at every step.',
      },
    ],
    methodology: [
      {
        title: 'Understand',
        description:
          'An initial session builds a picture of what the student is experiencing — at their pace, on their terms.',
      },
      {
        title: 'Map',
        description:
          'Counsellor and student agree on what to work on: a focus area, a cadence, and what support looks like.',
      },
      {
        title: 'Learn',
        description:
          'Sessions combine conversation with practical tools — breathing, reframing, planning — practised until they are automatic.',
      },
      {
        title: 'Measure',
        description:
          'Progress is reviewed together: what has shifted, what still feels hard, and what to adjust.',
      },
      {
        title: 'Grow',
        description:
          'As steadiness builds, sessions focus on independence — the student runs their own toolkit.',
      },
    ],
    curriculum: [
      {
        title: 'Understanding emotions',
        description:
          'Before managing feelings, students learn to recognise and name them.',
        items: [
          'Emotional vocabulary and awareness',
          'Noticing physical signs of stress early',
          'Understanding what triggers what',
        ],
      },
      {
        title: 'Stress management',
        description:
          'A toolkit of practised strategies, not a list of tips.',
        items: [
          'Breathing and grounding techniques',
          'Time, workload, and overwhelm planning',
          'Building recovery into the day',
        ],
      },
      {
        title: 'Exam readiness & anxiety',
        description:
          'Structured preparation for the highest-pressure weeks of the year.',
        items: [
          'Anxiety-mapping before exam season',
          'Study-rest balance plans',
          'In-exam regulation techniques',
        ],
      },
      {
        title: 'Social skills & healthy habits',
        description:
          'The everyday skills that keep a student steady between sessions.',
        items: [
          'Friendship, conflict, and communication',
          'Healthy digital and social media habits',
          'Sleep, movement, and routine foundations',
        ],
      },
    ],
    journey: [
      {
        stage: 'Curious',
        title: 'Curious',
        description:
          'A student arrives stressed, drained, or simply curious — and finds a space with no judgement.',
      },
      {
        stage: 'Supported',
        title: 'Supported',
        description:
          'The counsellor listens first. Together they name what is actually going on.',
      },
      {
        stage: 'Practising',
        title: 'Practising',
        description:
          'Tools are practised in session and between sessions, until using them feels ordinary.',
      },
      {
        stage: 'Confident',
        title: 'Confident',
        description:
          'The student notices the shift: calmer mornings, steadier study, better sleep.',
      },
      {
        stage: 'Capable',
        title: 'Capable',
        description:
          'Exam season arrives and is handled — not without stress, but with tools that work.',
      },
      {
        stage: 'Ready',
        title: 'Ready',
        description:
          'The student owns their toolkit and knows when and how to ask for support again.',
      },
    ],
    activities: [
      'Guided breathing and grounding practice',
      'Anxiety-mapping workshops before exam seasons',
      'Reflection journals with counsellor feedback',
      'Small-group peer support circles',
      'Parent guidance sessions on supporting stress at home',
    ],
    support: [
      'Confidential one-on-one sessions with licensed counsellors',
      'Parent guidance sessions with practical home strategies',
      'Teacher workshops on psychologically safe classrooms',
      'A clear safeguarding and escalation protocol',
    ],
    proof: [
      {
        title: 'Licensed professionals',
        description:
          'Counsellors hold recognised counselling qualifications — wellbeing is handled by trained specialists.',
      },
      {
        title: 'Safeguarding framework',
        description:
          'Confidentiality, its limits, and escalation pathways are documented and explained to every student and family.',
      },
      {
        title: 'Whole-ecosystem reach',
        description:
          'Support extends to parents and teachers, so the student’s environment reinforces the work, not undermines it.',
      },
      {
        title: 'Consistent cadence',
        description:
          'Sessions follow an agreed schedule with progress reviews, so support is a structure, not an event.',
      },
    ],
    faqs: [
      {
        question: 'Is this confidential?',
        answer:
          'Yes — within a clearly explained framework. Students are told at the outset what stays between them and the counsellor, and the specific circumstances (safety concerns) where the counsellor must involve others, always with care and transparency.',
      },
      {
        question: 'Who are the counsellors?',
        answer:
          'Licensed school counsellors with recognised qualifications and experience working with school-age students. Every counsellor follows the programme’s safeguarding protocol.',
      },
      {
        question: 'How many sessions will my child need?',
        answer:
          'It depends on what the student wants to work on. Some need a few focused sessions; others benefit from ongoing support through a difficult term. The counsellor reviews progress with the student and adjusts the cadence together.',
      },
      {
        question: 'Can parents be involved?',
        answer:
          'Yes — through separate guidance sessions. This keeps the student’s own sessions confidential while giving families practical strategies for supporting them at home.',
      },
      {
        question: 'Is this only for students in crisis?',
        answer:
          'No. The programme serves the full spectrum — from everyday stress and exam anxiety to deeper emotional challenges. Building steady habits before a crisis is exactly what this programme is for.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // ACHIEVE — AI & Digital Technologies
  // ---------------------------------------------------------------------------
  {
    slug: 'ai-digital-tech',
    pillarId: 'achieve',
    name: 'AI & Digital Technologies',
    tagline: 'Technology students can think with.',
    promise:
      'Students move from using technology to understanding it — building real projects, thinking computationally, and using AI with judgement, not just enthusiasm.',
    description:
      "Educraft's AI and Digital Technologies track moves past buzzwords into practical literacy — how these tools actually work, how to use them responsibly, and the computational thinking behind them. Students learn what a model is, what it can and cannot do, and where its outputs deserve trust — then apply that judgement hands-on. The programme is project-first: learners build working artefacts — a chatbot, a data visualisation, a small web app — guided by mentors who review their work seriously. Coding foundations come through building, not drilling syntax. Alongside capability runs a consistent ethical thread: privacy, bias, misinformation, and what responsible use looks like for a generation that will grow up with these tools. The result is a student who can talk about technology precisely, build with it confidently, and question it intelligently.",
    whyItMatters:
      'AI and digital systems are reshaping what "prepared" means for the next generation. The dividing line will not be between those who use AI and those who do not — it will be between those who understand it and those who only consume it. Understanding is a learnable skill, and the earlier it is built, the deeper it goes.',
    audience: [
      {
        title: 'Curious tinkerers',
        description:
          'Students who already play with technology and want to turn curiosity into structured capability.',
      },
      {
        title: 'Future engineers and builders',
        description:
          'Learners heading toward computer science, engineering, or data careers who need strong foundations.',
      },
      {
        title: 'Everyone else',
        description:
          'Students in every field who will work alongside AI and need judgement, not just familiarity.',
      },
    ],
    outcomes: [
      {
        title: 'Working projects',
        description:
          'Students ship real artefacts — apps, bots, visualisations — they can show, explain, and be proud of.',
      },
      {
        title: 'Real AI literacy',
        description:
          'A precise understanding of what AI models do, how they are built, what they are good at, and where they fail.',
      },
      {
        title: 'Computational thinking',
        description:
          'Decomposing problems, spotting patterns, and designing step-by-step solutions — the transferable core of all technology.',
      },
      {
        title: 'Judgement and responsibility',
        description:
          'Evaluating tools critically and using them ethically — privacy, bias, and misinformation included.',
      },
    ],
    highlights: [
      {
        title: 'Project-first learning',
        detail:
          'Every concept lands in a working artefact — learning by building, reviewed seriously by mentors.',
      },
      {
        title: 'AI literacy foundations',
        detail:
          'How models actually work, from data to training to output — taught accurately, not metaphorically.',
      },
      {
        title: 'Coding foundations',
        detail:
          'Real programming languages and tools, learned through projects rather than syntax drills.',
      },
      {
        title: 'Ethics and safety woven in',
        detail:
          'Privacy, bias, and responsible use are recurring themes, not a single lecture.',
      },
    ],
    methodology: [
      {
        title: 'Understand',
        description:
          'We find out what the student already builds, uses, and wonders about — the starting point is their world.',
      },
      {
        title: 'Map',
        description:
          'A project pathway is set: progressively ambitious builds, each teaching specific skills.',
      },
      {
        title: 'Learn',
        description:
          'Mentored sessions pair concepts with hands-on work — build, break, explain, rebuild.',
      },
      {
        title: 'Measure',
        description:
          'Projects are reviewed against rubrics for function, code quality, and the student’s own explanation of their work.',
      },
      {
        title: 'Grow',
        description:
          'Portfolio reviews pick the next challenge: a harder project, a new domain, or deeper theory.',
      },
    ],
    curriculum: [
      {
        title: 'How computers think',
        description:
          'The mental models that make everything else make sense.',
        items: [
          'Data, logic, and instructions',
          'Decomposition and algorithmic thinking',
          'Debugging as a mindset, not a chore',
        ],
      },
      {
        title: 'AI literacy',
        description:
          'What AI actually is — and is not.',
        items: [
          'What a model is: data, training, prediction',
          'Strengths, limits, and failure modes',
          'Prompting with intent and evaluating outputs',
        ],
      },
      {
        title: 'Coding foundations',
        description:
          'Real languages, real tools, learned by building.',
        items: [
          'Programming fundamentals in Python or JavaScript',
          'Building small apps and automations',
          'Working with data: collect, clean, visualise',
        ],
      },
      {
        title: 'Responsible technology',
        description:
          'The judgement layer that separates literacy from familiarity.',
        items: [
          'Privacy and personal data',
          'Bias, fairness, and misinformation',
          'Digital citizenship and healthy habits',
        ],
      },
    ],
    journey: [
      {
        stage: 'Curious',
        title: 'Curious',
        description:
          'The student arrives with questions about AI, games, apps — or just "how does this work?"',
      },
      {
        stage: 'Supported',
        title: 'Supported',
        description:
          'A project pathway turns curiosity into a plan, with a mentor who takes their questions seriously.',
      },
      {
        stage: 'Practising',
        title: 'Practising',
        description:
          'Weekly building sessions: code, break things, fix them, explain them.',
      },
      {
        stage: 'Confident',
        title: 'Confident',
        description:
          'The first working project ships. The student can demo it and defend how it works.',
      },
      {
        stage: 'Capable',
        title: 'Capable',
        description:
          'Projects grow in ambition — and the student starts teaching classmates what they learned.',
      },
      {
        stage: 'Ready',
        title: 'Ready',
        description:
          'A portfolio of real work, precise language about technology, and judgement that will outlast any single tool.',
      },
    ],
    activities: [
      'Build-a-bot: designing and shipping a working chatbot',
      'Data projects: collecting, cleaning, and visualising real data',
      'Prompt-crafting challenges with output evaluation',
      'Digital citizenship debates: privacy, bias, and ethics',
      'Show-and-tell demos with mentor critique',
    ],
    support: [
      'Project mentorship with serious code review',
      'Portfolio reviews that set the next challenge',
      'Parent orientations on safe technology use at home',
      'School technology integration guidance',
    ],
    proof: [
      {
        title: 'Project-based evidence',
        description:
          'Every student accumulates a portfolio of working projects — capability is demonstrated, not asserted.',
      },
      {
        title: 'Mentor-reviewed work',
        description:
          'Projects are reviewed against explicit rubrics for function and code quality, with feedback the student acts on.',
      },
      {
        title: 'Industry-informed curriculum',
        description:
          'The pathway is designed around how technology is actually built and used, updated as tools evolve.',
      },
      {
        title: 'Safety-first environment',
        description:
          'Tool access, privacy, and conduct follow a written safety policy shared with every family.',
      },
    ],
    faqs: [
      {
        question: 'Does my child need coding experience to start?',
        answer:
          'No. The pathway starts wherever the student is — many begin with zero coding experience. Foundations are built through guided projects, not assumed.',
      },
      {
        question: 'How is AI taught responsibly?',
        answer:
          'By teaching what these systems actually are: how models are built, what they can and cannot do, and how to evaluate their outputs. Responsible use is a recurring theme across every module, with privacy and bias discussed concretely.',
      },
      {
        question: 'What do students actually build?',
        answer:
          'Working artefacts: chatbots, data visualisations, small web apps, automations. Each project is reviewed by a mentor and becomes part of the student’s portfolio.',
      },
      {
        question: 'What tools do students use?',
        answer:
          'Mainstream, real-world tools: Python or JavaScript, standard development environments, and widely used AI services — always under the programme’s safety policy, with family consent where required.',
      },
      {
        question: 'Is this preparation for a technology career?',
        answer:
          'It is the foundation for one — but it serves every path. Computational thinking and AI literacy matter in medicine, law, business, and design as much as in engineering.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // EXCEL — NEET & JEE Preparation
  // ---------------------------------------------------------------------------
  {
    slug: 'neet-jee',
    pillarId: 'excel',
    name: 'NEET & JEE Preparation',
    tagline: 'Prepared steadily, not last-minute.',
    promise:
      'Concept-first preparation with weekly testing, mentor guidance, and transparent progress tracking — so exam season is a measured step, not a leap of faith.',
    description:
      "Educraft's NEET & JEE programme is built on fundamentals first. A concept-first curriculum, mapped closely to the NCERT and JEE syllabus, ensures understanding before speed — students learn why a method works before they drill it. Every week, a mock test under exam conditions produces a detailed performance report: which concepts are strong, where marks are leaking, and what to practise next. Regular doubt-clearing sessions with subject mentors prevent small confusions from compounding into large gaps. A personal analytics dashboard keeps preparation visible — to the student, to mentors, and to parents — so effort and progress stay honest. Steadiness is designed in: study-rest cycles, realistic targets, and wellbeing support woven through the programme, because the best-prepared student is also the steadiest one. The result is preparation that compounds week over week instead of cramming in the final months.",
    whyItMatters:
      'NEET and JEE are marathon exams disguised as sprints. Students who prepare conceptually, test weekly, and adjust from evidence outperform students who cram — and they arrive at the exam with far less of themselves spent.',
    audience: [
      {
        title: 'Foundation builders (Classes 9–10)',
        description:
          'Younger students building the conceptual fundamentals that make advanced preparation possible later.',
      },
      {
        title: 'Core aspirants (Classes 11–12)',
        description:
          'Students preparing for NEET or JEE alongside board exams, needing structure that fits both.',
      },
      {
        title: 'Repeaters and improvers',
        description:
          'Students restarting preparation who need a clear diagnosis of what went wrong and a steadier plan.',
      },
    ],
    outcomes: [
      {
        title: 'Strong fundamentals',
        description:
          'Concepts understood before they are drilled — the difference between solving familiar and unfamiliar problems.',
      },
      {
        title: 'Test-taking skill',
        description:
          'Weekly exam-condition practice builds speed, accuracy, and the judgement of which questions to attempt.',
      },
      {
        title: 'Measured progress',
        description:
          'A personal dashboard shows exactly where marks are gained and lost — preparation becomes evidence-based.',
      },
      {
        title: 'A steadier exam year',
        description:
          'Structured cycles, realistic targets, and wellbeing support keep the student effective without burning out.',
      },
    ],
    highlights: [
      {
        title: 'Concept-first curriculum',
        detail:
          'Mapped closely to the NCERT and JEE syllabus, with understanding sequenced ahead of speed and drills.',
      },
      {
        title: 'Weekly mock tests',
        detail:
          'Exam-condition testing every week, with detailed performance reports and benchmarked feedback.',
      },
      {
        title: 'Mentor doubt-clearing',
        detail:
          'Regular sessions with subject mentors so small confusions never grow into large gaps.',
      },
      {
        title: 'Personal analytics dashboard',
        detail:
          'Concept-wise strength mapping, error patterns, and trend lines — visible to student, mentors, and parents.',
      },
    ],
    methodology: [
      {
        title: 'Understand',
        description:
          'A diagnostic test maps current understanding across the syllabus — strengths, gaps, and misconceptions.',
      },
      {
        title: 'Map',
        description:
          'A preparation plan is set: syllabus coverage, weekly testing, and realistic targets across the available time.',
      },
      {
        title: 'Learn',
        description:
          'Concept-first instruction builds understanding before drills; doubt sessions keep gaps from compounding.',
      },
      {
        title: 'Measure',
        description:
          'Weekly mocks produce performance reports that drive the next week’s practice — preparation follows evidence.',
      },
      {
        title: 'Grow',
        description:
          'Targets and focus areas adjust as the dashboard shows progress, keeping the plan honest and adaptive.',
      },
    ],
    curriculum: [
      {
        title: 'Foundation (Classes 9–10)',
        description:
          'The conceptual base that makes advanced preparation possible later.',
        items: [
          'Core science and mathematics fundamentals',
          'Problem-solving habits and study discipline',
          'Early exposure to exam-style thinking',
        ],
      },
      {
        title: 'Core syllabus (Classes 11–12)',
        description:
          'Full syllabus coverage mapped to NCERT and exam requirements.',
        items: [
          'Physics, Chemistry, and Biology or Mathematics',
          'Concept-first instruction with worked examples',
          'Chapter-wise practice aligned to weightage',
        ],
      },
      {
        title: 'Application & problem-solving',
        description:
          'Where understanding becomes marks.',
        items: [
          'Structured problem sets by difficulty',
          'Common error and misconception clinics',
          'Time-management and paper strategy',
        ],
      },
      {
        title: 'Exam readiness',
        description:
          'The final discipline: performing under exam conditions, repeatedly.',
        items: [
          'Weekly full-length mocks with analysis',
          'Revision cycles scheduled from data',
          'Stress management integrated with preparation',
        ],
      },
    ],
    journey: [
      {
        stage: 'Curious',
        title: 'Curious',
        description:
          'A student — and usually a family — arrives with a big goal and a lot of uncertainty about the path.',
      },
      {
        stage: 'Supported',
        title: 'Supported',
        description:
          'The diagnostic test and preparation plan turn the goal into a mapped route with visible milestones.',
      },
      {
        stage: 'Practising',
        title: 'Practising',
        description:
          'Concept-first learning and weekly mocks build the rhythm: learn, test, analyse, adjust.',
      },
      {
        stage: 'Confident',
        title: 'Confident',
        description:
          'Dashboard trends move steadily. The student can see their own improvement in black and white.',
      },
      {
        stage: 'Capable',
        title: 'Capable',
        description:
          'Unfamiliar problems get solved — the hallmark of real understanding, not memorised patterns.',
      },
      {
        stage: 'Ready',
        title: 'Ready',
        description:
          'The exam is a measured step in a long preparation — approached steadily, on evidence, not adrenaline.',
      },
    ],
    activities: [
      'Weekly mock tests under exam conditions',
      'Mentor doubt clinics in small groups',
      'Error-analysis sessions: mining each mock for lessons',
      'Peer study circles with structured practice',
      'Pre-exam strategy and stress-management sessions',
    ],
    support: [
      'Personal analytics dashboard for students and families',
      'Subject mentors for regular doubt-clearing',
      'Parent progress briefings with concrete next steps',
      'Wellbeing support integrated with preparation cycles',
    ],
    proof: [
      {
        title: 'Transparent score tracking',
        description:
          'Every mock is scored and analysed in a dashboard families can see — progress is documented, not claimed.',
      },
      {
        title: 'Syllabus mapping',
        description:
          'The curriculum is mapped to the NCERT and exam syllabus, so coverage is verifiable at any point.',
      },
      {
        title: 'Structured mentorship',
        description:
          'Doubt-clearing follows a regular cadence with subject specialists, not ad-hoc help.',
      },
      {
        title: 'Testing discipline',
        description:
          'Weekly exam-condition testing is the programme’s backbone — the same cadence that builds exam readiness.',
      },
    ],
    faqs: [
      {
        question: 'When should preparation start?',
        answer:
          'Ideally in Classes 9–10 with foundation building, but the programme admits students at any stage. The diagnostic test maps current understanding and the plan is built around the time actually available — honesty about timelines is part of the design.',
      },
      {
        question: 'How is this different from other coaching?',
        answer:
          'Concept-first sequencing, weekly exam-condition testing with detailed analysis, and a transparent dashboard that families can see. Preparation runs on evidence — each week’s practice is driven by the previous week’s results.',
      },
      {
        question: 'Can students prepare for both board exams and NEET/JEE together?',
        answer:
          'Yes. The curriculum is mapped to the NCERT syllabus, so board preparation and exam preparation reinforce each other. The plan sequences revision to respect both calendars.',
      },
      {
        question: 'How do parents see progress?',
        answer:
          'Through the analytics dashboard and regular progress briefings. Families see scores, concept-wise strengths and gaps, and the plan’s next steps — not just a final result.',
      },
      {
        question: 'What about stress and burnout?',
        answer:
          'Steadiness is designed in: realistic targets, study-rest cycles, and integrated wellbeing support. The programme treats sustainable preparation as a performance advantage, not a soft option.',
      },
    ],
  },
];

export const getProgrammeBySlug = (slug: string): Programme | undefined =>
  programmes.find((p) => p.slug === slug);

export const getProgrammesByPillar = (pillarId: PillarId): Programme[] =>
  programmes.filter((p) => p.pillarId === pillarId);
