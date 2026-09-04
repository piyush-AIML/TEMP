import 'server-only';
import { db } from '@/lib/db';

/**
 * Material reads (Dashboard Stage 1).
 *
 * Access note: the only caller is the per-course page, which has already
 * verified an ACTIVE enrollment via `getStudentCourseWithAccess` (courses.ts)
 * — that check is the access boundary; this query is scoped by courseId.
 */

export type MaterialDTO = {
  id: string;
  type: 'NOTE' | 'REMARK' | 'FILE' | 'LINK';
  title: string;
  body: string | null;
  fileUrl: string | null;
  uploadedByName: string;
  /** ISO-8601 string. */
  createdAt: string;
};

/** Materials for one course, newest first, with the uploader's name. */
export async function getCourseMaterials(courseId: string): Promise<MaterialDTO[]> {
  const rows = await db().material.findMany({
    where: { courseId },
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: { select: { name: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    fileUrl: row.fileUrl,
    uploadedByName: row.uploadedBy.name,
    createdAt: row.createdAt.toISOString(),
  }));
}
