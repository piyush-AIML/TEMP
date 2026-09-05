import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus, SessionStatus } from '@/generated/prisma/enums';

/**
 * Professor meeting reads (Dashboard Stage 3) — Stage 1/2 patterns: server-
 * only, role-explicit names, ownership scoped to the professor's own rows.
 * Meetings have no CourseProfessors join — the professorId column IS the
 * owner (a meeting is a 1:1, never co-hosted).
 */

export type MeetingDTO = {
  id: string;
  title: string;
  withWhom: 'STUDENT' | 'PARENT' | 'OTHER';
  /** Present only for STUDENT meetings. */
  studentId: string | null;
  studentName: string | null;
  startsAt: string;
  endsAt: string;
  link: string | null;
  status: 'SCHEDULED' | 'DONE' | 'CANCELLED';
};

/** Upcoming SCHEDULED meetings, soonest first (list + calendar feed). */
export async function getProfessorUpcomingMeetings(
  userId: string,
  options: { limit?: number } = {}
): Promise<MeetingDTO[]> {
  const rows = await db().meeting.findMany({
    where: {
      professorId: userId,
      status: SessionStatus.SCHEDULED,
      startsAt: { gte: new Date() },
    },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { startsAt: 'asc' },
    ...(options.limit ? { take: options.limit } : {}),
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    withWhom: row.withWhom,
    studentId: row.student?.id ?? null,
    studentName: row.student?.name ?? null,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    link: row.link,
    status: row.status,
  }));
}

/** Distinct ACTIVE-enrolled students across the professor's courses — the
 *  picker for STUDENT meetings (roster-scoped, so a stale pick can never
 *  outlive the enrollment). Sorted by name. */
export async function getProfessorStudents(
  userId: string
): Promise<Array<{ studentId: string; name: string; email: string }>> {
  const rows = await db().enrollment.findMany({
    where: {
      status: EnrollmentStatus.ACTIVE,
      course: { professors: { some: { professorId: userId } } },
    },
    include: { student: { select: { name: true, email: true } } },
    orderBy: { student: { name: 'asc' } },
  });
  const seen = new Set<string>();
  const students: Array<{ studentId: string; name: string; email: string }> = [];
  for (const row of rows) {
    if (seen.has(row.studentId)) continue; // co-taught courses → one entry
    seen.add(row.studentId);
    students.push({
      studentId: row.studentId,
      name: row.student.name,
      email: row.student.email,
    });
  }
  return students;
}
