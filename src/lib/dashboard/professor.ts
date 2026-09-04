import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus, SessionStatus } from '@/generated/prisma/enums';
import type { SessionDTO } from '@/lib/dashboard/sessions';

/**
 * Professor course/session reads (Dashboard Stage 2) — Stage 1 patterns:
 * server-only, role-explicit names, ownership scoped via CourseProfessors,
 * Dates mapped to ISO strings. Names stay professor-specific so Stage 1's
 * student queries and any future admin queries never collide.
 */

const PROFESSOR_COURSE_COUNTS = {
  _count: {
    select: {
      materials: true,
      enrollments: { where: { status: EnrollmentStatus.ACTIVE } },
      sessions: { where: { status: SessionStatus.SCHEDULED, startsAt: { gte: new Date() } } },
    },
  },
} as const;

export type ProfessorCourseDTO = {
  id: string;
  code: string;
  title: string;
  /** Course vertical slug (one of the five programme slugs). */
  vertical: string;
  description: string | null;
  professorNames: string[];
  activeStudents: number;
  upcomingSessions: number;
  materials: number;
};

function toProfessorCourseDTO(row: {
  course: {
    id: string;
    code: string;
    title: string;
    vertical: string;
    description: string | null;
    professors: Array<{ professor: { name: string } }>;
    _count: { materials: number; enrollments: number; sessions: number };
  };
}): ProfessorCourseDTO {
  const course = row.course;
  return {
    id: course.id,
    code: course.code,
    title: course.title,
    vertical: course.vertical,
    description: course.description,
    professorNames: course.professors.map((link) => link.professor.name),
    activeStudents: course._count.enrollments,
    upcomingSessions: course._count.sessions,
    materials: course._count.materials,
  };
}

/** Courses the professor teaches (via CourseProfessors), with live counts. */
export async function getProfessorCourses(userId: string): Promise<ProfessorCourseDTO[]> {
  const rows = await db().courseProfessors.findMany({
    where: { professorId: userId },
    include: {
      course: {
        include: {
          professors: { include: { professor: { select: { name: true } } } },
          ...PROFESSOR_COURSE_COUNTS,
        },
      },
    },
  });
  return rows
    .map((row) => toProfessorCourseDTO(row))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/** Ownership-gated single-course lookup — null → notFound() at the page. */
export async function getProfessorCourseWithAccess(
  userId: string,
  courseId: string
): Promise<{ course: ProfessorCourseDTO } | null> {
  const row = await db().courseProfessors.findUnique({
    where: { courseId_professorId: { courseId, professorId: userId } },
    include: {
      course: {
        include: {
          professors: { include: { professor: { select: { name: true } } } },
          ...PROFESSOR_COURSE_COUNTS,
        },
      },
    },
  });
  return row ? { course: toProfessorCourseDTO(row) } : null;
}

export type RosterRowDTO = {
  studentId: string;
  name: string;
  email: string;
  enrolledAt: string;
};

/** ACTIVE students of one owned course, earliest enrolment first. */
export async function getCourseRoster(userId: string, courseId: string): Promise<RosterRowDTO[]> {
  const owned = await db().courseProfessors.findUnique({
    where: { courseId_professorId: { courseId, professorId: userId } },
  });
  if (!owned) return [];
  const rows = await db().enrollment.findMany({
    where: { courseId, status: EnrollmentStatus.ACTIVE },
    orderBy: { enrolledAt: 'asc' },
    include: { student: { select: { name: true, email: true } } },
  });
  return rows.map((row) => ({
    studentId: row.studentId,
    name: row.student.name,
    email: row.student.email,
    enrolledAt: row.enrolledAt.toISOString(),
  }));
}

/** Upcoming classes across all owned courses — shares SessionDTO's shape. */
export async function getProfessorUpcomingSessions(
  userId: string,
  options: { limit?: number } = {}
): Promise<SessionDTO[]> {
  const rows = await db().classSession.findMany({
    where: {
      course: { professors: { some: { professorId: userId } } },
      status: SessionStatus.SCHEDULED,
      startsAt: { gte: new Date() },
    },
    include: { course: { select: { code: true, title: true, vertical: true } } },
    orderBy: { startsAt: 'asc' },
    ...(options.limit ? { take: options.limit } : {}),
  });
  return rows.map((row) => ({
    id: row.id,
    courseId: row.courseId,
    courseCode: row.course.code,
    courseTitle: row.course.title,
    vertical: row.course.vertical,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    mode: row.mode,
    link: row.link,
    location: row.location,
  }));
}

/** DB-derived headline counts for the professor overview. */
export async function getProfessorStats(userId: string): Promise<{
  courses: number;
  upcomingSessions: number;
  activeStudents: number;
}> {
  const [courses, upcomingSessions, activeStudents] = await Promise.all([
    db().courseProfessors.count({ where: { professorId: userId } }),
    db().classSession.count({
      where: {
        course: { professors: { some: { professorId: userId } } },
        status: SessionStatus.SCHEDULED,
        startsAt: { gte: new Date() },
      },
    }),
    db().enrollment.count({
      where: {
        course: { professors: { some: { professorId: userId } } },
        status: EnrollmentStatus.ACTIVE,
      },
    }),
  ]);
  return { courses, upcomingSessions, activeStudents };
}

export type ProfessorSessionDTO = SessionDTO & {
  status: 'SCHEDULED' | 'DONE' | 'CANCELLED';
};

/** All sessions of one owned course — newest first (Sessions manager tab).
 *  Includes status so the manager can gate edit/cancel on SCHEDULED rows. */
export async function getProfessorCourseSessions(
  userId: string,
  courseId: string,
  options: { limit?: number } = {}
): Promise<ProfessorSessionDTO[]> {
  const owned = await db().courseProfessors.findUnique({
    where: { courseId_professorId: { courseId, professorId: userId } },
  });
  if (!owned) return [];
  const rows = await db().classSession.findMany({
    where: { courseId },
    include: { course: { select: { code: true, title: true, vertical: true } } },
    orderBy: { startsAt: 'desc' },
    ...(options.limit ? { take: options.limit } : {}),
  });
  return rows.map((row) => ({
    id: row.id,
    courseId: row.courseId,
    courseCode: row.course.code,
    courseTitle: row.course.title,
    vertical: row.course.vertical,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    mode: row.mode,
    link: row.link,
    location: row.location,
    status: row.status,
  }));
}
