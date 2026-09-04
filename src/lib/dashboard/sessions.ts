import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus, SessionStatus } from '@/generated/prisma/enums';

/**
 * Student class-session reads (Dashboard Stage 1). Every query scopes to the
 * caller's ACTIVE enrollments server-side — a student can only ever see
 * sessions for courses they are enrolled in.
 */

export type SessionDTO = {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  /** Course vertical slug (one of the five programme slugs). */
  vertical: string;
  /** ISO-8601 strings — formatting happens server-side (see format.ts). */
  startsAt: string;
  endsAt: string;
  mode: 'ONLINE' | 'IN_PERSON';
  link: string | null;
  location: string | null;
};

type SessionRow = {
  id: string;
  courseId: string;
  startsAt: Date;
  endsAt: Date;
  mode: 'ONLINE' | 'IN_PERSON';
  link: string | null;
  location: string | null;
  course: { code: string; title: string; vertical: string };
};

function toSessionDTO(row: SessionRow): SessionDTO {
  return {
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
  };
}

/**
 * Upcoming (SCHEDULED, startsAt >= now) class sessions across the student's
 * ACTIVE-enrolled courses, earliest first. Shared by the overview ("Up next"),
 * the full schedule and the per-course pages (filter by courseId client-side
 * of this module, or pass a courseId to narrow the query).
 */
export async function getStudentUpcomingSessions(
  userId: string,
  options: { courseId?: string; limit?: number } = {}
): Promise<SessionDTO[]> {
  const rows = await db().classSession.findMany({
    where: {
      course: {
        ...(options.courseId ? { id: options.courseId } : {}),
        enrollments: { some: { studentId: userId, status: EnrollmentStatus.ACTIVE } },
      },
      status: SessionStatus.SCHEDULED,
      startsAt: { gte: new Date() },
    },
    include: {
      course: { select: { code: true, title: true, vertical: true } },
    },
    orderBy: { startsAt: 'asc' },
    ...(options.limit ? { take: options.limit } : {}),
  });
  return rows.map(toSessionDTO);
}
