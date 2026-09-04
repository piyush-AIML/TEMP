'use server';

import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  fileCompleteSchema,
  fileUploadRequestSchema,
  linkMaterialInputSchema,
  textMaterialInputSchema,
  type FileComplete,
  type FileUploadRequest,
} from '@/lib/validators/materials';
import { flattenZodErrors } from '@/lib/validation';
import {
  createLinkMaterialForProfessor,
  createTextMaterialForProfessor,
  deleteMaterialForProfessor,
  persistFileMaterialForProfessor,
} from '@/lib/domain/materials';
import { professorOwnsCourse } from '@/lib/domain/ownership';
import { DomainError } from '@/lib/domain/errors';
import { getStorage } from '@/lib/storage';
import type { StorageUploadGrant } from '@/lib/storage/types';
import { StorageNotConfiguredError } from '@/lib/storage/types';
import type { StepErrors } from '@/lib/validation';
import { type ActionResult, formError, success } from './types';

/**
 * Material Server Actions (Dashboard Stage 2). Text/link materials are
 * useActionState forms; file uploads are a two-stage flow that never routes
 * file bytes through our server (Vercel caps bodies at 4.5 MB):
 *   FileDropzone → createUploadToken (ownership checked BEFORE minting) →
 *   PUT straight to the signed ingest URL → completeFileUpload (verify +
 *   persist row + notify).
 */

function revalidateCourses() {
  revalidatePath('/dashboard/professor', 'layout');
  revalidatePath('/dashboard/student', 'layout');
}

function readTextMaterial(formData: FormData) {
  return {
    type: String(formData.get('type') ?? ''),
    courseId: String(formData.get('courseId') ?? ''),
    title: String(formData.get('title') ?? ''),
    body: String(formData.get('body') ?? ''),
  };
}

export async function createTextMaterial(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole('professor');
  const parsed = textMaterialInputSchema.safeParse(readTextMaterial(formData));
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };
  try {
    await createTextMaterialForProfessor(session.userId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
  revalidateCourses();
  return success(parsed.data.type === 'NOTE' ? 'Note posted to the course.' : 'Remark posted to the course.');
}

export async function createLinkMaterial(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole('professor');
  const parsed = linkMaterialInputSchema.safeParse({
    courseId: String(formData.get('courseId') ?? ''),
    title: String(formData.get('title') ?? ''),
    url: String(formData.get('url') ?? ''),
  });
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };
  try {
    await createLinkMaterialForProfessor(session.userId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
  revalidateCourses();
  return success('Link shared with the course.');
}

export async function deleteMaterial(materialId: string): Promise<ActionResult> {
  const session = await requireRole('professor');
  try {
    await deleteMaterialForProfessor(session.userId, materialId);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
  revalidateCourses();
  return success('Material deleted.');
}

/** Stage one of the file flow — mints a signed grant for a direct PUT. */
export async function createUploadToken(input: FileUploadRequest): Promise<
  | { ok: true; grant: StorageUploadGrant }
  | { ok: false; fieldErrors?: StepErrors; formError?: string }
> {
  const session = await requireRole('professor');
  const parsed = fileUploadRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };

  // Ownership is checked BEFORE any signed URL is minted.
  const owns = await professorOwnsCourse(session.userId, parsed.data.courseId);
  if (!owns) return { ok: false, formError: 'Course not found.' };

  try {
    const grant = await getStorage().createUpload({
      fileName: parsed.data.fileName,
      fileSize: parsed.data.fileSize,
      fileMime: parsed.data.fileMime,
      acl: 'private',
    });
    return { ok: true, grant };
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return { ok: false, formError: error.message };
    throw error;
  }
}

/** Stage two — after the client's direct PUT, verify and persist the FILE row. */
export async function completeFileUpload(input: FileComplete): Promise<ActionResult> {
  const session = await requireRole('professor');
  const parsed = fileCompleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };

  const owns = await professorOwnsCourse(session.userId, parsed.data.courseId);
  if (!owns) return formError('Course not found.');

  try {
    const verified = await getStorage().verifyUpload(parsed.data.fileKey);
    if (!verified) {
      return formError('Upload could not be verified — please try uploading the file again.');
    }
    if (verified.size !== parsed.data.fileSize) {
      return formError('The uploaded file size does not match — please try again.');
    }
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return formError(error.message);
    throw error;
  }

  try {
    await persistFileMaterialForProfessor(session.userId, {
      courseId: parsed.data.courseId,
      fileKey: parsed.data.fileKey,
      title: parsed.data.title,
      meta: { name: parsed.data.fileName, size: parsed.data.fileSize, mime: parsed.data.fileMime },
    });
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
  revalidateCourses();
  return success('File posted to the course.');
}
