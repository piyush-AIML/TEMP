import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus } from '@/generated/prisma/enums';

/**
 * Admin reads (course slice). The admin area is deliberately small; this is
 * its first data query — a full course list so a newly created course is
 * visible next to the creation form.
 */

export type AdminCourseDTO = {
  id: string;
  code: string;
  title: string;
  vertical: string;
  professorNames: string[];
  activeStudents: number;
};

/** All courses, code order — with professors and ACTIVE enrolment counts. */
export async function getAdminCourseList(): Promise<AdminCourseDTO[]> {
  const rows = await db().course.findMany({
    include: {
      professors: { include: { professor: { select: { name: true } } } },
      _count: { select: { enrollments: { where: { status: EnrollmentStatus.ACTIVE } } } },
    },
    orderBy: { code: 'asc' },
  });
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    title: row.title,
    vertical: row.vertical,
    professorNames: row.professors.map((link) => link.professor.name),
    activeStudents: row._count.enrollments,
  }));
}
