import 'server-only';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getStorage } from '@/lib/storage';
import { StorageNotConfiguredError } from '@/lib/storage/types';
import type { FileMeta } from '@/lib/storage/types';

/**
 * Material reads (Dashboard Stage 1 + Stage 2 files).
 *
 * Access note: callers are course pages that have already verified access
 * (student: ACTIVE enrollment via getStudentCourseWithAccess; professor:
 * CourseProfessors via getProfessorCourseWithAccess) — that check is the
 * boundary; this query is scoped by courseId.
 */

/** File metadata is Json in the DB — zod-guard shape drift from old rows. */
const fileMetaSchema = z.object({
  name: z.string().max(300),
  size: z.number().int().nonnegative(),
  mime: z.string().max(120),
});

export type MaterialDTO = {
  id: string;
  type: 'NOTE' | 'REMARK' | 'FILE' | 'LINK';
  title: string;
  body: string | null;
  /** LINK rows: the target URL. FILE rows: null. */
  fileUrl: string | null;
  /** FILE rows: display metadata (zod-validated). */
  fileMeta: FileMeta | null;
  /** FILE rows: short-lived signed download URL, or null when unresolved. */
  downloadUrl: string | null;
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

  const dto: MaterialDTO[] = [];
  for (const row of rows) {
    let fileMeta: FileMeta | null = null;
    let downloadUrl: string | null = null;

    if (row.type === 'FILE' && row.fileKey) {
      const parsed = fileMetaSchema.safeParse(row.fileMeta);
      fileMeta = parsed.success ? parsed.data : null;
      try {
        downloadUrl = await getStorage().getDownloadUrl(row.fileKey);
      } catch (error) {
        // Storage not configured / provider trouble — row stays visible with
        // honest muted copy instead of a broken link.
        if (!(error instanceof StorageNotConfiguredError)) console.error('downloadUrl resolution failed:', error);
      }
    }

    dto.push({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      fileUrl: row.fileUrl,
      fileMeta,
      downloadUrl,
      uploadedByName: row.uploadedBy.name,
      createdAt: row.createdAt.toISOString(),
    });
  }
  return dto;
}
