/**
 * Provider-agnostic file-storage contract (Dashboard Stage 2).
 *
 * The domain layer and Prisma schema only ever deal with this interface:
 * rows store `fileProvider` + an opaque `fileKey` + `fileMeta` — never a
 * provider URL and never a provider-specific field. Swapping providers (e.g.
 * UploadThing → S3) is a new adapter + a data-migration script that updates
 * provider/key rows; nothing in domain or UI code changes.
 *
 * Client uploads never touch our server: createUpload() returns a signed
 * ingest URL and the generic FileDropzone PUTs the file straight to storage.
 */

export type StorageAcl = 'private';

export type StorageUploadGrant = {
  /** Signed ingest URL — plain PUT of the raw file bytes; the declared
   *  Content-Type must be sent as the request's Content-Type header. */
  uploadUrl: string;
  /** Opaque provider key — persisted in Material.fileKey. */
  fileKey: string;
  method: 'PUT';
  /** ISO-8601 expiry of the grant (signed URLs are time-boxed). */
  expiresAt: string;
};

export type UploadFileInfo = {
  fileName: string;
  fileSize: number;
  fileMime: string;
  acl: StorageAcl;
};

export interface StorageProvider {
  readonly id: 'uploadthing' | 's3' | 'disabled';
  createUpload(info: UploadFileInfo): Promise<StorageUploadGrant>;
  /** Confirms the object exists after a client upload; null when missing. */
  verifyUpload(fileKey: string): Promise<{ size: number } | null>;
  /** Short-lived signed download URL for private objects, else null. */
  getDownloadUrl(fileKey: string): Promise<string | null>;
  delete(fileKey: string): Promise<void>;
}

/** Thrown when storage is not configured (or misconfigured) on this deployment. */
export class StorageNotConfiguredError extends Error {
  readonly code = 'STORAGE_NOT_CONFIGURED' as const;
  constructor(message = 'File storage is not configured on this deployment.') {
    super(message);
    this.name = 'StorageNotConfiguredError';
  }
}

/** Provider-agnostic file metadata persisted in Material.fileMeta (Json). */
export type FileMeta = {
  name: string;
  size: number;
  mime: string;
};
