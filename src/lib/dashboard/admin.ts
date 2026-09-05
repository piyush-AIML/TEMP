import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus } from '@/generated/prisma/enums';

/**
 * Admin reads (course slice, reworked 2026-09-05). The admin area gained a
 * real course surface: the list (create + manage entry points) and the
 * per-course detail used by the manage page. Dates map to ISO strings; the
 * DTO is plain serializable — consumed by server pages only.
 */

export type AdminCourseDTO = {
  id: string;
  code: string;
  title: string;
  vertical: string;
  description: string | null;
  professorNames: string[];
  activeStudents: number;
  createdAt: string;
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
    description: row.description,
    professorNames: row.professors.map((link) => link.professor.name),
    activeStudents: row._count.enrollments,
    createdAt: row.createdAt.toISOString(),
  }));
}

export type AdminCourseProfessorDTO = {
  id: string;
  name: string;
  email: string;
};

export type AdminCourseDetailDTO = {
  id: string;
  code: string;
  title: string;
  vertical: string;
  description: string | null;
  createdAt: string;
  professors: AdminCourseProfessorDTO[];
  activeStudents: number;
  sessions: number;
  materials: number;
  tasks: number;
};

/** One course with its professors and live counts — null → notFound() at the page. */
export async function getAdminCourseDetail(courseId: string): Promise<AdminCourseDetailDTO | null> {
  const row = await db().course.findUnique({
    where: { id: courseId },
    include: {
      professors: {
        include: { professor: { select: { id: true, name: true, email: true } } },
        orderBy: { professor: { name: 'asc' } },
      },
      _count: {
        select: {
          enrollments: { where: { status: EnrollmentStatus.ACTIVE } },
          sessions: true,
          materials: true,
          tasks: true,
        },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    vertical: row.vertical,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    professors: row.professors.map((link) => ({
      id: link.professor.id,
      name: link.professor.name,
      email: link.professor.email,
    })),
    activeStudents: row._count.enrollments,
    sessions: row._count.sessions,
    materials: row._count.materials,
    tasks: row._count.tasks,
  };
}
