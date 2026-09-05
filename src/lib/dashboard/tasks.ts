import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus, TaskStatus } from '@/generated/prisma/enums';

/**
 * Coursework task reads (Dashboard Stage 3). Professor reads are
 * CourseProfessors-ownership-gated ([] when not owned — mirrors getCourseRoster);
 * the student read is ACTIVE-enrollment-gated. The completion monitor counts
 * LIVE Task.status (never CompletionLog — the log is a write-through ledger and
 * reading it would be the drift trap). Postgres orders NULL due dates last on
 * `ASC`, so "sorted by due date, nulls last" falls out of the query for free.
 */

export type TaskDTO = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
};

export type CourseCompletion = {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  percentDone: number;
};

function toTaskDTO(row: {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: TaskStatus;
}): TaskDTO {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
    status: row.status,
  };
}

/** Status-count → CourseCompletion (zero-total-safe). */
function toCompletion(counts: Array<{ status: TaskStatus; _count: number }>): CourseCompletion {
  const byStatus: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  for (const row of counts) byStatus[row.status] = row._count;
  const { DONE: done, IN_PROGRESS: inProgress, TODO: todo } = byStatus;
  const total = done + inProgress + todo;
  return { total, done, inProgress, todo, percentDone: total ? Math.round((done / total) * 100) : 0 };
}

/** Tasks of one owned course: due date asc (Postgres puts NULLs last on ASC
 *  automatically), then id for a stable order within a day. */
export async function getCourseTasks(userId: string, courseId: string): Promise<TaskDTO[]> {
  const owned = await db().courseProfessors.findUnique({
    where: { courseId_professorId: { courseId, professorId: userId } },
  });
  if (!owned) return [];
  const rows = await db().task.findMany({
    where: { courseId },
    orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
  });
  return rows.map(toTaskDTO);
}

/** Per-status counts for one owned course (Planner tab completion monitor). */
export async function getCourseCompletion(userId: string, courseId: string): Promise<CourseCompletion> {
  const owned = await db().courseProfessors.findUnique({
    where: { courseId_professorId: { courseId, professorId: userId } },
  });
  if (!owned) return { total: 0, done: 0, inProgress: 0, todo: 0, percentDone: 0 };
  const counts = await db().task.groupBy({
    by: ['status'],
    where: { courseId },
    _count: true,
  });
  return toCompletion(counts);
}

/** Per-course completion across ALL owned courses (professor overview meters).
 *  Zero-filled per course so the overview can show honest "No tasks yet"
 *  rows — course identity from getProfessorCourses, counts in one groupBy. */
export async function getProfessorCoursesCompletion(
  userId: string
): Promise<Array<{ courseId: string; code: string; title: string } & CourseCompletion>> {
  const courses = await db().courseProfessors.findMany({
    where: { professorId: userId },
    include: { course: { select: { id: true, code: true, title: true } } },
  });
  const courseIds = courses.map((row) => row.course.id);
  const counts = courseIds.length
    ? await db().task.groupBy({
        by: ['courseId', 'status'],
        where: { courseId: { in: courseIds } },
        _count: true,
      })
    : [];
  const byCourse = new Map<string, CourseCompletion>();
  for (const row of counts) {
    const current = byCourse.get(row.courseId) ?? { total: 0, done: 0, inProgress: 0, todo: 0, percentDone: 0 };
    const key = row.status;
    current[key] = row._count;
    byCourse.set(row.courseId, current);
  }
  return courses
    .map((row) => {
      const completion = byCourse.get(row.course.id) ?? {
        total: 0,
        done: 0,
        inProgress: 0,
        todo: 0,
        percentDone: 0,
      };
      const { done, inProgress, todo } = completion;
      const total = done + inProgress + todo;
      return {
        courseId: row.course.id,
        code: row.course.code,
        title: row.course.title,
        ...completion,
        total,
        percentDone: total ? Math.round((done / total) * 100) : 0,
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}

/** Tasks visible to one student: ACTIVE-enrollment-gated, course-wide by
 *  design (no per-student assignee — the whole class works the same plan). */
export async function getStudentCourseTasks(userId: string, courseId: string): Promise<TaskDTO[]> {
  const enrollment = await db().enrollment.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId } },
  });
  if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) return [];
  const rows = await db().task.findMany({
    where: { courseId },
    orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
  });
  return rows.map(toTaskDTO);
}
