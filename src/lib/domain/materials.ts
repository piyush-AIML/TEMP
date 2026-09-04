import 'server-only';
import { db } from '@/lib/db';
import { MaterialType } from '@/generated/prisma/enums';
import type { FileMeta } from '@/lib/storage/types';
import { getStorage } from '@/lib/storage';
import { createCourseNotifications } from '@/lib/notifications/notify';
import { DomainError } from './errors';
import { assertCourseOwned } from './ownership';

/**
 * Material domain operations (Dashboard Stage 2) — plain async functions
 * taking an explicit professorId; the action layer gates + validates.
 * Ownership: every write requires the professor on the course's
 * CourseProfessors join. FILE rows persist only the provider id + opaque
 * fileKey + fileMeta through the storage interface — never provider URLs.
 */

const TEXT_TYPE_META: Record<'NOTE' | 'REMARK', string> = {
  NOTE: 'New note',
  REMARK: 'New remark',
};

const MATERIAL_KIND_META: Record<MaterialType, string> = {
  NOTE: 'note',
  REMARK: 'remark',
  FILE: 'file',
  LINK: 'link',
};

async function assertMaterialOwnedByCourse(
  professorId: string,
  materialId: string
): Promise<{ material: { courseId: string; type: MaterialType; fileKey: string | null } }> {
  const material = await db().material.findUnique({
    where: { id: materialId },
    select: { courseId: true, type: true, fileKey: true },
  });
  if (!material) throw new DomainError('MATERIAL_NOT_FOUND', 'Material not found.');
  await assertCourseOwned(professorId, material.courseId);
  return { material };
}

async function notifyCourse(courseId: string, kind: MaterialType, title: string): Promise<void> {
  await createCourseNotifications(courseId, {
    type: 'NEW_MATERIAL',
    title: `${title}`,
    body: `A new ${MATERIAL_KIND_META[kind]} was posted for this course.`,
    relatedEntity: `course:${courseId}`,
  });
}

export async function createTextMaterialForProfessor(
  professorId: string,
  input: { type: 'NOTE' | 'REMARK'; courseId: string; title: string; body?: string }
): Promise<{ id: string }> {
  await assertCourseOwned(professorId, input.courseId);
  const material = await db().material.create({
    data: {
      courseId: input.courseId,
      uploadedById: professorId,
      type: input.type,
      title: input.title,
      body: input.body?.trim() ? input.body : null,
    },
  });
  await notifyCourse(input.courseId, input.type, `${TEXT_TYPE_META[input.type]}: ${input.title}`);
  return { id: material.id };
}

export async function createLinkMaterialForProfessor(
  professorId: string,
  input: { courseId: string; title: string; url: string }
): Promise<{ id: string }> {
  await assertCourseOwned(professorId, input.courseId);
  const material = await db().material.create({
    data: {
      courseId: input.courseId,
      uploadedById: professorId,
      type: MaterialType.LINK,
      title: input.title,
      fileUrl: input.url, // LINK rows only — the target URL, never a storage URL
    },
  });
  await notifyCourse(input.courseId, MaterialType.LINK, `New link: ${input.title}`);
  return { id: material.id };
}

/**
 * Persists a FILE material after the client's direct-to-storage upload has
 * been verified (the action layer calls getStorage().verifyUpload first).
 * fileProvider comes from the active provider id — provider-agnostic by
 * construction.
 */
export async function persistFileMaterialForProfessor(
  professorId: string,
  input: { courseId: string; fileKey: string; title: string; meta: FileMeta }
): Promise<{ id: string }> {
  await assertCourseOwned(professorId, input.courseId);
  const provider = getStorage();
  const material = await db().material.create({
    data: {
      courseId: input.courseId,
      uploadedById: professorId,
      type: MaterialType.FILE,
      title: input.title,
      fileUrl: null,
      fileProvider: provider.id === 'disabled' ? null : (provider.id.toUpperCase() as 'UPLOADTHING' | 'S3'),
      fileKey: input.fileKey,
      fileMeta: input.meta as object,
    },
  });
  await notifyCourse(input.courseId, MaterialType.FILE, `New file: ${input.title}`);
  return { id: material.id };
}

export async function deleteMaterialForProfessor(professorId: string, materialId: string): Promise<void> {
  const { material } = await assertMaterialOwnedByCourse(professorId, materialId);

  if (material.type === MaterialType.FILE && material.fileKey) {
    try {
      await getStorage().delete(material.fileKey);
    } catch (error) {
      // Orphaned object is worse than a failed delete — never block the row
      // removal on provider trouble; log and continue.
      console.error('storage delete failed (continuing with row delete):', error);
    }
  }

  await db().material.delete({ where: { id: materialId } });
  // No notification on delete — honest, no noise.
}
