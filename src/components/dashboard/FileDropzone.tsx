'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, LoaderCircle, X, FileText, AlertTriangle } from 'lucide-react';
import {
  MAX_FILE_SIZE_BYTES,
  FILE_ACCEPT_STRING,
  ALLOWED_FILE_TYPES,
} from '@/lib/validators/materials';
import { createUploadToken, completeFileUpload } from '@/lib/actions/materials';

/**
 * Generic direct-to-storage file uploader (Dashboard Stage 2) — provider
 * agnostic by construction: ask the server for a signed grant, PUT the file
 * straight to the ingest URL (never through our server — Vercel caps bodies
 * at 4.5 MB), then confirm. XMLHttpRequest for upload progress. Must send the
 * exact File it declared (the signed grant pins the size). Mime/size
 * pre-checks mirror the server whitelist; STORAGE_NOT_CONFIGURED surfaces the
 * honest disabled copy. The title field defaults to the file name and can be
 * edited before uploading.
 */

type Status =
  | { kind: 'idle' }
  | { kind: 'selected'; file: File }
  | { kind: 'uploading'; progress: number }
  | { kind: 'confirming' }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) return 'That file is over the 16 MB limit.';
  const mimeAllowed = Object.values(ALLOWED_FILE_TYPES).flat().includes(file.type);
  if (!mimeAllowed) return 'That file type is not allowed (PDF, Office, text, images or zip).';
  return null;
}

export function FileDropzone({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = useCallback((file: File | undefined) => {
    if (!file) return;
    const problem = validateFile(file);
    if (problem) {
      setStatus({ kind: 'error', message: problem });
      return;
    }
    setTitle(file.name.replace(/\.[^.]+$/, ''));
    setStatus({ kind: 'selected', file });
  }, []);

  const reset = useCallback(() => {
    setStatus({ kind: 'idle' });
    setTitle('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const upload = useCallback(async () => {
    if (status.kind !== 'selected') return;
    const file = status.file;
    const cleanTitle = title.trim() || file.name;

    const grantResult = await createUploadToken({
      courseId,
      fileName: file.name,
      fileSize: file.size,
      fileMime: file.type || 'application/octet-stream',
    });
    if (!grantResult.ok) {
      setStatus({ kind: 'error', message: grantResult.formError ?? 'Could not start the upload.' });
      return;
    }
    const grant = grantResult.grant;

    setStatus({ kind: 'uploading', progress: 2 });
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(grant.method, grant.uploadUrl, true);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setStatus({ kind: 'uploading', progress: Math.max(3, Math.round((event.loaded / event.total) * 90)) });
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed (${xhr.status}).`));
        };
        xhr.onerror = () => reject(new Error('Upload failed — check your connection and try again.'));
        const form = new FormData();
        form.append('file', file);
        xhr.send(form);
      });

      setStatus({ kind: 'confirming' });
      const result = await completeFileUpload({
        courseId,
        fileKey: grant.fileKey,
        title: cleanTitle,
        fileName: file.name,
        fileSize: file.size,
        fileMime: file.type || 'application/octet-stream',
      });
      if (!result.ok) {
        setStatus({ kind: 'error', message: result.formError ?? 'Upload could not be finalised.' });
        return;
      }
      setStatus({ kind: 'done' });
      router.refresh();
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Upload failed.' });
    }
  }, [courseId, router, status, title]);

  return (
    <div className='space-y-3'>
      <input
        ref={inputRef}
        type='file'
        accept={FILE_ACCEPT_STRING}
        className='sr-only'
        id='material-file-input'
        onChange={(event) => pick(event.target.files?.[0])}
      />

      {status.kind === 'idle' && (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className='flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ec-sky px-6 py-8 text-center transition-colors duration-150 hover:border-ec-indigo hover:bg-ec-sky/40 dark:border-ec-canvas-deep dark:hover:border-white/40 dark:hover:bg-ec-canvas-deep/40'
        >
          <UploadCloud className='size-6 text-foreground/50' aria-hidden='true' />
          <span className='text-sm font-semibold'>Choose a file to share</span>
          <span className='text-xs text-foreground/50'>PDF, Office documents, text, images or zip — up to 16 MB.</span>
        </button>
      )}

      {status.kind === 'selected' && (
        <div className='space-y-3 rounded-2xl border border-ec-sky bg-ec-sky/40 p-4 dark:border-ec-canvas-deep dark:bg-ec-canvas-deep/40'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex min-w-0 items-center gap-3'>
              <FileText className='size-5 shrink-0 text-ec-indigo dark:text-white' aria-hidden='true' />
              <span className='min-w-0 truncate text-sm font-medium'>{status.file.name}</span>
            </div>
            <button
              type='button'
              onClick={reset}
              aria-label='Discard selected file'
              className='rounded-lg p-1.5 text-foreground/50 transition-colors duration-150 hover:bg-ec-sky hover:text-foreground dark:hover:bg-ec-canvas-deep'
            >
              <X className='size-4' aria-hidden='true' />
            </button>
          </div>
          <label className='block'>
            <span className='mb-1 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
              Title
            </span>
            <input
              type='text'
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              className='w-full rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40'
              placeholder='A title your students will recognise'
            />
          </label>
          <button
            type='button'
            onClick={() => void upload()}
            className='rounded-xl bg-ec-indigo px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 dark:bg-white dark:text-ec-indigo'
          >
            Upload file
          </button>
        </div>
      )}

      {(status.kind === 'uploading' || status.kind === 'confirming') && (
        <div className='rounded-2xl border border-ec-sky bg-ec-sky/40 px-4 py-4 dark:border-ec-canvas-deep dark:bg-ec-canvas-deep/40'>
          <div className='flex items-center gap-3'>
            <LoaderCircle className='size-5 animate-spin text-ec-indigo dark:text-white' aria-hidden='true' />
            <p className='text-sm font-medium'>
              {status.kind === 'uploading' ? `Uploading… ${status.progress}%` : 'Finalising upload…'}
            </p>
          </div>
          <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-ec-sky dark:bg-ec-canvas-deep'>
            <div
              className='h-full rounded-full bg-ec-indigo transition-[width] duration-200 dark:bg-white'
              style={{ width: `${status.kind === 'uploading' ? status.progress : 100}%` }}
            />
          </div>
        </div>
      )}

      {status.kind === 'done' && (
        <p className='rounded-2xl bg-ec-sky/70 px-4 py-3 text-sm font-medium text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          File posted to the course.
        </p>
      )}

      {status.kind === 'error' && (
        <div className='flex items-start justify-between gap-3 rounded-2xl border border-ec-sky bg-ec-sky/40 px-4 py-3 dark:border-ec-canvas-deep dark:bg-ec-canvas-deep/40'>
          <p className='flex items-start gap-2 text-sm text-foreground'>
            <AlertTriangle className='mt-0.5 size-4 shrink-0 text-ec-indigo dark:text-white' aria-hidden='true' />
            <span>{status.message}</span>
          </p>
          <button
            type='button'
            onClick={reset}
            aria-label='Dismiss error'
            className='rounded-lg p-1 text-foreground/50 transition-colors duration-150 hover:text-foreground'
          >
            <X className='size-4' aria-hidden='true' />
          </button>
        </div>
      )}
    </div>
  );
}
