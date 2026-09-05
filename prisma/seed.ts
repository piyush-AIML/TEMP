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
import { MaterialType, MeetingParticipant, SessionMode, TaskStatus } from '../src/generated/prisma/enums';
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

const IST_MS = 5.5 * 3600 * 1000;

/** The instant whose IST wall clock reads (nowIST + daysAhead) at
 *  hour:minute IST — machine-timezone independent. Used by the Stage 3
 *  meetings/tasks demo rows (unlike the older session seeding above, which
 *  builds machine-local wall times; that smell is left untouched). */
function istTimeDaysFromNow(daysAhead: number, hour: number, minute = 0): Date {
  const wall = new Date(Date.now() + IST_MS); // UTC fields now carry IST wall time
  return new Date(
    Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate() + daysAhead, hour, minute) -
      IST_MS
  );
}

/** Demo coursework per course (Stage 3): one DONE, one overdue TODO, one
 *  upcoming TODO, one IN_PROGRESS — so the planner board has every column,
 *  the student sees an Overdue chip, and the completion monitor lands at 25%.
 *  dueInDays is relative to today; due times are IST midnight. */
const COURSE_TASKS: Record<
  string,
  Array<{ title: string; description: string; dueInDays: number; status: TaskStatus }>
> = {
  'LING-101': [
    {
      title: 'Speaking warm-up log — week 1',
      description: 'Daily 10-minute recordings; tick each day you completed one.',
      dueInDays: -3,
      status: TaskStatus.DONE,
    },
    {
      title: 'Summarise one news headline aloud',
      description: 'Pick a headline, give a 90-second spoken summary, and note two words you reached for.',
      dueInDays: -2,
      status: TaskStatus.TODO,
    },
    {
      title: 'CEFR self-assessment checkpoint',
      description: 'Re-rate yourself against the four skills using the pathway map, then bring it to class.',
      dueInDays: 4,
      status: TaskStatus.TODO,
    },
    {
      title: 'Record and review a 3-minute talk',
      description: 'Free topic. Listen back once and log three fluency gaps you noticed.',
      dueInDays: 6,
      status: TaskStatus.IN_PROGRESS,
    },
  ],
  'INCL-201': [
    {
      title: 'Universal-design reading notes',
      description: 'One page of notes on the UDL reading, in your own words.',
      dueInDays: -3,
      status: TaskStatus.DONE,
    },
    {
      title: 'Observation journal — entry 1',
      description: 'First real learning setting, five structured observations using the template.',
      dueInDays: -2,
      status: TaskStatus.TODO,
    },
    {
      title: 'Adapt one lesson for choice of response',
      description: 'Take any lesson you know well and offer learners three ways to respond.',
      dueInDays: 4,
      status: TaskStatus.TODO,
    },
    {
      title: 'Accessibility review of a learning space',
      description: 'Walk one classroom or meeting room with the weekly-review checklist.',
      dueInDays: 6,
      status: TaskStatus.IN_PROGRESS,
    },
  ],
  'WBC-301': [
    {
      title: '4-4-6 breathing practice log',
      description: 'Two sessions a day for the week, noted honestly — missed days count too.',
      dueInDays: -3,
      status: TaskStatus.DONE,
    },
    {
      title: 'Daily feelings log — week 2',
      description: 'Two lines each evening. Patterns beat guesses.',
      dueInDays: -2,
      status: TaskStatus.TODO,
    },
    {
      title: 'Peer check-in reflection',
      description: 'After your paired check-in, write what helped and what felt awkward.',
      dueInDays: 4,
      status: TaskStatus.TODO,
    },
    {
      title: 'Stress-cycle mapping exercise',
      description: 'Map one recent stressful week: triggers, body signals, and what completed the cycle.',
      dueInDays: 6,
      status: TaskStatus.IN_PROGRESS,
    },
  ],
  'AID-401': [
    {
      title: 'AI sandbox install + first run',
      description: 'Environment installed and one prompt-to-code task completed end to end.',
      dueInDays: -3,
      status: TaskStatus.DONE,
    },
    {
      title: 'Prompt critique — bring one failure',
      description: 'One prompt you wrote this month that failed. We learn fastest from the failures.',
      dueInDays: -2,
      status: TaskStatus.TODO,
    },
    {
      title: 'Model evaluation reading',
      description: 'Read the evaluation explainer and bring one question about how models are judged.',
      dueInDays: 4,
      status: TaskStatus.TODO,
    },
    {
      title: 'Prompt-to-code task end to end',
      description: 'From a plain-English brief to a working script — record where you got stuck.',
      dueInDays: 6,
      status: TaskStatus.IN_PROGRESS,
    },
  ],
  'NEET-501': [
    {
      title: 'Mechanics mock — section A',
      description: 'Timed section A from last weekend’s mock paper; mark it before the next session.',
      dueInDays: -3,
      status: TaskStatus.DONE,
    },
    {
      title: 'Physics revision grid — week 1',
      description: 'Mechanics: 40 minutes of worked problems daily; optics: revisit the diagram bank first.',
      dueInDays: -2,
      status: TaskStatus.TODO,
    },
    {
      title: 'Chemistry formula sheet pass',
      description: 'One clean pass over the formula sheet, annotating the three you misapply most.',
      dueInDays: 4,
      status: TaskStatus.TODO,
    },
    {
      title: 'Full mock paper — weekend slot',
      description: 'Leave the full paper for the weekend and analyse the mark leak afterwards.',
      dueInDays: 6,
      status: TaskStatus.IN_PROGRESS,
    },
  ],
};

/** Demo meetings for the demo professor (Stage 3) — one per withWhom kind:
 *  STUDENT (linked to the demo student), PARENT, OTHER. */
const DEMO_MEETINGS: Array<{
  title: string;
  withWhom: MeetingParticipant;
  daysAhead: number;
  startHour: number;
  startMinute: number;
  minutes: number;
  link: string | null;
}> = [
  {
    title: 'External tutor sync',
    withWhom: MeetingParticipant.OTHER,
    daysAhead: 2,
    startHour: 18,
    startMinute: 30,
    minutes: 30,
    link: 'https://meet.educraft.test/one-one',
  },
  {
    title: 'Mock test review',
    withWhom: MeetingParticipant.STUDENT,
    daysAhead: 3,
    startHour: 17,
    startMinute: 30,
    minutes: 45,
    link: 'https://meet.educraft.test/one-one',
  },
  {
    title: "Parent check-in — Aanya's progress",
    withWhom: MeetingParticipant.PARENT,
    daysAhead: 5,
    startHour: 9,
    startMinute: 0,
    minutes: 45,
    link: null,
  },
];

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
    meetingsCreated: 0,
    tasksCreated: 0,
    completionLogsCreated: 0,
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

  // Demo meetings (Stage 3) — created only when the professor row exists and
  // they have no upcoming SCHEDULED meetings yet (count guard, like
  // materials). The STUDENT meeting additionally needs the demo student.
  if (professor) {
    const upcomingMeetings = await prisma.meeting.count({
      where: { professorId: professor.id, status: 'SCHEDULED', startsAt: { gte: new Date() } },
    });
    if (upcomingMeetings === 0) {
      for (const meeting of DEMO_MEETINGS) {
        if (meeting.withWhom === MeetingParticipant.STUDENT && !student) continue;
        const startsAt = istTimeDaysFromNow(meeting.daysAhead, meeting.startHour, meeting.startMinute);
        await prisma.meeting.create({
          data: {
            professorId: professor.id,
            title: meeting.title,
            withWhom: meeting.withWhom,
            studentId: meeting.withWhom === MeetingParticipant.STUDENT ? student!.id : null,
            startsAt,
            endsAt: new Date(startsAt.getTime() + meeting.minutes * 60 * 1000),
            link: meeting.link,
          },
        });
        summary.meetingsCreated += 1;
      }
    }
  }

  // Demo coursework (Stage 3) — per-course count guard (Task has no natural
  // unique key; same convention as materials). Non-TODO tasks get their
  // CompletionLog write-through row (DONE 100 / IN_PROGRESS 50), mirroring
  // the exact domain semantics of updateTaskStatus.
  if (professor) {
    for (const course of createdCourses) {
      const existingTasks = await prisma.task.count({ where: { courseId: course.id } });
      if (existingTasks > 0) continue;
      const items = COURSE_TASKS[course.code] ?? [];
      for (const item of items) {
        const task = await prisma.task.create({
          data: {
            courseId: course.id,
            createdById: professor.id,
            title: item.title,
            description: item.description,
            dueDate: istTimeDaysFromNow(item.dueInDays, 0, 0),
            status: item.status,
          },
        });
        summary.tasksCreated += 1;
        if (item.status !== TaskStatus.TODO) {
          await prisma.completionLog.create({
            data: {
              courseId: course.id,
              taskId: task.id,
              percentComplete: item.status === TaskStatus.DONE ? 100 : 50,
            },
          });
          summary.completionLogsCreated += 1;
        }
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
