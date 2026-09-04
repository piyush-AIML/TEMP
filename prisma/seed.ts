/**
 * Dashboard demo seed (Stage 0-E). Email-keyed + idempotent; safe to run
 * before or after the test users sign in. It NEVER creates User rows — those
 * are created by Clerk sign-in (getCurrentUser upsert/adoption in lib/auth).
 * Rows for emails that don't exist in the DB yet are simply skipped, so:
 *   1. sign in once as the demo users (creates their rows), then
 *   2. npm run db:seed — courses, professor links, enrollments, a few
 *      upcoming classes and demo materials appear for them.
 *
 * Idempotency notes (Stage 1):
 * - Material rows have no natural unique key, so the check is a per-course
 *   count: materials are only created for a course that currently has none.
 *   A partially-interrupted run that leaves one row means the remaining demo
 *   rows never appear on the next run — acceptable for a local demo seed.
 * - Re-running after ~7 days adds two fresh class sessions per course (the
 *   session check is `startsAt >= now`, which the old rows eventually fail) —
 *   by design, it keeps the demo schedule alive. Materials stay stable.
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import type { Course, User } from '../src/generated/prisma/client';
import { MaterialType, SessionMode } from '../src/generated/prisma/enums';
import { createPrismaClient } from '../src/lib/prisma-client';

const prisma = createPrismaClient();

/** Demo emails — the real Clerk accounts used for Stage 0/1 walkthroughs. */
const PROFESSORS = [{ email: 'piyush.ghosal.ai@gmail.com', roleLabel: 'professor' }] as const;
const STUDENTS = [{ email: 'pika38212@gmail.com', roleLabel: 'student' }] as const;

/** Five courses spanning the site's verticals (slugs match programme routes). */
const COURSES = [
  { code: 'LING-101', title: 'Linguistics & Communication Skills', vertical: 'linguistics' },
  { code: 'INCL-201', title: 'Inclusive Education Practices', vertical: 'inclusive-education' },
  { code: 'WBC-301', title: 'Student Wellbeing Foundations', vertical: 'wellbeing-counseling' },
  { code: 'AID-401', title: 'AI & Digital Technologies', vertical: 'ai-digital-tech' },
  { code: 'NEET-501', title: 'NEET & JEE Preparation', vertical: 'neet-jee' },
] as const;

/** Demo materials per course — one NOTE, one REMARK, one LINK each (Stage 1:
 *  read-only feed content; FILE uploads arrive with the Stage 2 composer).
 *  Links point at real, working marketing pages so they resolve in dev. */
const COURSE_MATERIALS: Record<
  string,
  Array<{ type: MaterialType; title: string; body: string; url?: string }>
> = {
  'LING-101': [
    {
      type: MaterialType.NOTE,
      title: 'Week 1 — conversation starters',
      body:
        'Quick notes from our first session:\n\n• Keep a daily 10-minute speaking warm-up in your target language\n• Record yourself once a week and listen back — fluency improves fastest when you hear your own gaps\n• Bring one news headline you can summarise out loud to the next class',
    },
    {
      type: MaterialType.REMARK,
      title: 'Well done on the placements',
      body:
        'Everyone has now been placed on the CEFR-aligned pathway. Your individual progression maps are shared below the note — check which band you are working in and aim for two skill checkpoints this month.',
    },
    {
      type: MaterialType.LINK,
      title: 'What the CEFR levels actually mean',
      body: 'A short explainer for parents and students on how reading, speaking and writing levels are judged.',
      url: '/programmes/linguistics',
    },
  ],
  'INCL-201': [
    {
      type: MaterialType.NOTE,
      title: 'Session notes — designing for every learner',
      body:
        'Key ideas from the session:\n\n• Universal design helps everyone, not just some learners\n• Choice of how to respond matters as much as choice of task\n• Accessibility is a practice to review weekly, not a one-time fix',
    },
    {
      type: MaterialType.REMARK,
      title: 'Observation task reminder',
      body:
        'Your observation journal for the inclusive-practice module is due next session. Two real classrooms or learning settings, five structured observations each — the template is on the course page.',
    },
    {
      type: MaterialType.LINK,
      title: 'Inclusive education at Educraft',
      body: 'How the programme structures support and differentiate learning across the five verticals.',
      url: '/programmes/inclusive-education',
    },
  ],
  'WBC-301': [
    {
      type: MaterialType.NOTE,
      title: 'Grounding techniques we practised',
      body:
        'Keep these close:\n\n• 4-4-6 breathing when a session feels heavy\n• The 5-4-3-2-1 senses check for anxious moments\n• A two-line daily feelings log — patterns beat guesses',
    },
    {
      type: MaterialType.REMARK,
      title: 'Confidentiality note',
      body:
        'A gentle reminder that everything shared in our sessions stays in the room. Your feelings log is yours alone — share it only when you want to.',
    },
    {
      type: MaterialType.LINK,
      title: 'Student wellbeing at Educraft',
      body: 'How the wellbeing and counselling vertical supports students — for families exploring the programme.',
      url: '/programmes/wellbeing-counseling',
    },
  ],
  'AID-401': [
    {
      type: MaterialType.NOTE,
      title: 'Setting up your AI sandbox',
      body:
        'Before the next class:\n\n1. Install the environment from the session walkthrough\n2. Run your first prompt-to-code task end to end\n3. Bring one question about how models are evaluated',
    },
    {
      type: MaterialType.REMARK,
      title: 'Prompt critique session moved',
      body:
        'This week’s critique round now runs inside our regular slot — bring one prompt you have written this month, good or bad. We learn fastest from the failures.',
    },
    {
      type: MaterialType.LINK,
      title: 'AI & digital technologies programme',
      body: 'The full curriculum for the AI and digital track — modules, methods and outcomes.',
      url: '/programmes/ai-digital-tech',
    },
  ],
  'NEET-501': [
    {
      type: MaterialType.NOTE,
      title: 'Revision grid — Physics paper sections',
      body:
        'Suggested order for this week:\n\n• Mechanics — 40 minutes daily, worked problems only\n• Optics — revisit the diagram bank first\n• Leave full mock papers for the weekend',
    },
    {
      type: MaterialType.REMARK,
      title: 'Mock test analysis',
      body:
        'Read the analysis of last weekend’s mock before this session. The biggest mark leak is careless reading of the question stem — underline the asked quantity before you solve.',
    },
    {
      type: MaterialType.LINK,
      title: 'NEET & JEE preparation programme',
      body: 'Structure, methods and outcomes of the exam-preparation track.',
      url: '/programmes/neet-jee',
    },
  ],
};

async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

async function main() {
  const foundProfessors = await Promise.all(PROFESSORS.map((p) => findUserByEmail(p.email)));
  const foundStudents = await Promise.all(STUDENTS.map((s) => findUserByEmail(s.email)));

  const summary = {
    usersFound: foundProfessors.filter(Boolean).length + foundStudents.filter(Boolean).length,
    coursesUpserted: 0,
    professorLinks: 0,
    enrollments: 0,
    classSessionsCreated: 0,
    materialsCreated: 0,
  };

  // Courses (idempotent by code) + professor links (M2M).
  const createdCourses: Course[] = [];
  for (const c of COURSES) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: { title: c.title, vertical: c.vertical },
      create: { code: c.code, title: c.title, vertical: c.vertical },
    });
    createdCourses.push(course);
    summary.coursesUpserted += 1;

    // Attach the demo professor to every course.
    for (const prof of foundProfessors) {
      if (!prof) continue;
      await prisma.courseProfessors.upsert({
        where: { courseId_professorId: { courseId: course.id, professorId: prof.id } },
        update: {},
        create: { courseId: course.id, professorId: prof.id },
      });
      summary.professorLinks += 1;
    }
  }

  // Enroll the demo student in every course.
  const student = foundStudents[0];
  const enrollmentPlan: Array<[User | null, Course, number]> = [];
  createdCourses.forEach((course, index) => {
    enrollmentPlan.push([student, course, index]);
  });
  for (const [student, course] of enrollmentPlan) {
    if (!student) continue;
    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
    });
    if (!existing) {
      await prisma.enrollment.create({ data: { studentId: student.id, courseId: course.id } });
      summary.enrollments += 1;
    }
  }

  // Upcoming classes (next 7 days) for enrolled courses that have none yet.
  for (const [student, course, index] of enrollmentPlan) {
    if (!student || !course) continue;
    const upcoming = await prisma.classSession.count({
      where: { courseId: course.id, status: 'SCHEDULED', startsAt: { gte: new Date() } },
    });
    if (upcoming > 0) continue;
    const slots =
      index % 2 === 0
        ? [
            { day: 2, hour: 11 },
            { day: 5, hour: 11 },
          ]
        : [
            { day: 3, hour: 17 },
            { day: 6, hour: 17 },
          ];
    for (const slot of slots) {
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + slot.day);
      startsAt.setHours(slot.hour, 0, 0, 0);
      const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000);
      await prisma.classSession.create({
        data: {
          courseId: course.id,
          startsAt,
          endsAt,
          mode: index % 2 === 0 ? SessionMode.ONLINE : SessionMode.IN_PERSON,
          link: index % 2 === 0 ? 'https://meet.educraft.test/live' : null,
          location: index % 2 === 0 ? null : 'Educraft Studio, Bangalore',
        },
      });
      summary.classSessionsCreated += 1;
    }
  }

  // Demo materials — only for courses that have none yet (Material has no
  // natural unique key; the per-course count is the idempotency check).
  const professor = foundProfessors[0];
  if (professor) {
    for (const [courseIndex, course] of createdCourses.entries()) {
      const existingMaterials = await prisma.material.count({ where: { courseId: course.id } });
      if (existingMaterials > 0) continue;
      const items = COURSE_MATERIALS[course.code] ?? [];
      for (const [itemIndex, item] of items.entries()) {
        const daysAgo = 1 + ((courseIndex + itemIndex) % 4); // 1–4 days back, staggered per course
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        await prisma.material.create({
          data: {
            courseId: course.id,
            uploadedById: professor.id,
            type: item.type,
            title: item.title,
            body: item.body,
            fileUrl: item.url ?? null,
            createdAt,
          },
        });
        summary.materialsCreated += 1;
      }
    }
  }

  console.log('Seed complete:', summary);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
