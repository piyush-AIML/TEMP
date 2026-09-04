import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus } from '@/generated/prisma/enums';
import {
  getStudentUpcomingSessions,
  type SessionDTO,
} from '@/lib/dashboard/sessions';

/**
 * Student course reads (Dashboard Stage 1). All queries scope to ACTIVE
 * enrollments server-side; `getStudentCourseWithAccess` is the single source
 * of truth for the per-course 404.
 */

export type EnrolledCourseDTO = {
  id: string;
  code: string;
  title: string;
  /** Course vertical slug (one of the five programme slugs). */
  vertical: string;
  description: string | null;
  professorNames: string[];
  materialCount: number;
  /** Earliest upcoming session for this course, or null when none. */
  nextSession: SessionDTO | null;
};

/** Course + professor join, shared by the enrollment queries below. */
const courseInclude = {
  course: {
    include: {
      professors: { include: { professor: { select: { name: true } } } },
      _count: { select: { materials: true } },
    },
  },
} as const;

type EnrollmentWithCourse = {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  course: {
    id: string;
    code: string;
    title: string;
    vertical: string;
    description: string | null;
    _count: { materials: number };
    professors: Array<{ professor: { name: string } }>;
  };
};

function toEnrolledCourseDTO(row: EnrollmentWithCourse): EnrolledCourseDTO {
  return {
    id: row.course.id,
    code: row.course.code,
    title: row.course.title,
    vertical: row.course.vertical,
    description: row.course.description,
    professorNames: row.course.professors.map((link) => link.professor.name),
    materialCount: row.course._count.materials,
    nextSession: null, // filled in below
  };
}

/** Attaches each course's earliest upcoming session from one shared query. */
async function attachNextSessions(courses: EnrolledCourseDTO[], userId: string): Promise<EnrolledCourseDTO[]> {
  if (courses.length === 0) return courses;
  const upcoming = await getStudentUpcomingSessions(userId);
  for (const course of courses) {
    course.nextSession = upcoming.find((session) => session.courseId === course.id) ?? null;
  }
  return courses;
}

/** The student's ACTIVE-enrolled courses, earliest enrollment first. */
export async function getStudentEnrolledCourses(userId: string): Promise<EnrolledCourseDTO[]> {
  const rows = await db().enrollment.findMany({
    where: { studentId: userId, status: EnrollmentStatus.ACTIVE },
    orderBy: { enrolledAt: 'asc' },
    include: courseInclude,
  });
  return attachNextSessions(rows.map(toEnrolledCourseDTO), userId);
}

/**
 * Access-checked lookup for a single course page: returns the course only
 * when the student holds an ACTIVE enrollment, else null. Callers map null to
 * notFound() — no existence oracle for unenrolled students.
 */
export async function getStudentCourseWithAccess(
  userId: string,
  courseId: string
): Promise<{ course: EnrolledCourseDTO } | null> {
  const row = await db().enrollment.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId } },
    include: courseInclude,
  });
  if (!row || row.status !== EnrollmentStatus.ACTIVE) return null;
  const [course] = await attachNextSessions([toEnrolledCourseDTO(row)], userId);
  return { course };
}

/** DB-derived headline counts for the student overview stat row. */
export async function getStudentStats(userId: string): Promise<{
  activeCourses: number;
  upcomingSessions: number;
  materials: number;
}> {
  const [activeCourses, upcomingSessions, materials] = await Promise.all([
    db().enrollment.count({
      where: { studentId: userId, status: EnrollmentStatus.ACTIVE },
    }),
    db().classSession.count({
      where: {
        course: { enrollments: { some: { studentId: userId, status: EnrollmentStatus.ACTIVE } } },
        status: 'SCHEDULED',
        startsAt: { gte: new Date() },
      },
    }),
    db().material.count({
      where: {
        course: { enrollments: { some: { studentId: userId, status: EnrollmentStatus.ACTIVE } } },
      },
    }),
  ]);
  return { activeCourses, upcomingSessions, materials };
}
