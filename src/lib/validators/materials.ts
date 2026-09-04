import { z } from 'zod';

/**
 * Material input validation (Dashboard Stage 2). zod v4 API (§18 rule 3).
 * Schemas are shared by nothing client-side except constants (the accept
 * string); the server re-validates every submission.
 */

export const textMaterialTypes = ['NOTE', 'REMARK'] as const;

/** NOTE / REMARK — title + optional body. */
export const textMaterialInputSchema = z.object({
  type: z.enum(textMaterialTypes, { message: 'Choose a material type.' }),
  courseId: z.string().min(1, { message: 'Choose a course.' }),
  title: z.string().trim().min(1, 'Give the material a title.').max(200, 'Keep the title under 200 characters.'),
  body: z
    .string()
    .trim()
    .max(10_000, 'Keep the content under 10,000 characters.')
    .optional()
    .or(z.literal('')),
});

/** LINK — title + http(s) URL or internal site path. */
export const linkMaterialInputSchema = z.object({
  courseId: z.string().min(1, { message: 'Choose a course.' }),
  title: z.string().trim().min(1, 'Give the link a title.').max(200, 'Keep the title under 200 characters.'),
  url: z.string().trim().min(1, 'Paste the link.').max(2048, 'That link is too long.'),
}).superRefine((value, ctx) => {
  const isInternal = value.url.startsWith('/');
  if (!isInternal) {
    try {
      const url = new URL(value.url);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('protocol');
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a full http(s):// link or an internal site path starting with /.',
        path: ['url'],
      });
    }
  }
});

// ---------------------------------------------------------------------------
// File uploads — provider-agnostic caps + whitelist, enforced server-side and
// mirrored in the FileDropzone accept attribute.
// ---------------------------------------------------------------------------

export const MAX_FILE_SIZE_BYTES = 16 * 1024 * 1024; // 16 MB

export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.txt': ['text/plain'],
  '.md': ['text/markdown', 'text/plain'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.webp': ['image/webp'],
  '.zip': ['application/zip'],
};

/** `accept` attribute string for the file input (extension-based). */
export const FILE_ACCEPT_STRING = Object.keys(ALLOWED_FILE_TYPES).join(',');

const ALLOWED_MIMES = new Set(Object.values(ALLOWED_FILE_TYPES).flat());

const fileNameSchema = z
  .string()
  .trim()
  .min(1, 'The file needs a name.')
  .max(200, 'Keep the file name under 200 characters.');

const fileSizeSchema = z
  .number({ message: 'File size is required.' })
  .int()
  .positive('The file appears to be empty.')
  .max(MAX_FILE_SIZE_BYTES, `Files must be 16 MB or smaller.`);

const fileMimeSchema = z
  .string()
  .trim()
  .min(1, 'File type is required.')
  .max(100)
  .refine((mime) => ALLOWED_MIMES.has(mime), 'That file type is not allowed.');

/** Client declares the file it is about to upload; server mints a grant. */
export const fileUploadRequestSchema = z.object({
  courseId: z.string().min(1, { message: 'Choose a course.' }),
  fileName: fileNameSchema,
  fileSize: fileSizeSchema,
  fileMime: fileMimeSchema,
});

/** After the direct PUT, the professor confirms + titles the material. */
export const fileCompleteSchema = z.object({
  courseId: z.string().min(1, { message: 'Choose a course.' }),
  fileKey: z.string().min(8, 'The upload key looks wrong — please try again.').max(300),
  title: z.string().trim().min(1, 'Give the file a title.').max(200, 'Keep the title under 200 characters.'),
  fileName: fileNameSchema,
  fileSize: fileSizeSchema,
  fileMime: fileMimeSchema,
});

export type TextMaterialInput = z.infer<typeof textMaterialInputSchema>;
export type LinkMaterialInput = z.infer<typeof linkMaterialInputSchema>;
export type FileUploadRequest = z.infer<typeof fileUploadRequestSchema>;
export type FileComplete = z.infer<typeof fileCompleteSchema>;
