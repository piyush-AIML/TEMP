import type { StorageProvider, StorageUploadGrant, UploadFileInfo } from './types';
import { StorageNotConfiguredError } from './types';
import { S3Provider } from './s3';

/**
 * Storage factory (Dashboard Stage 2). Selects the provider from
 * STORAGE_PROVIDER — `s3` when configured, anything else/unset means file
 * uploads are disabled with an honest typed error (UI shows "uploads not
 * configured on this deployment"; everything else keeps working).
 *
 * Deliberately free of 'server-only' (same pattern as prisma-client.ts): the
 * Next runtime reaches it via the domain/action layers (which are server-only),
 * and the storage smoke script needs it under plain Node. Never import this
 * module from a client component.
 */

let cachedProvider: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (cachedProvider) return cachedProvider;
  switch (process.env.STORAGE_PROVIDER) {
    case 's3':
      cachedProvider = new S3Provider(); // throws StorageNotConfiguredError on bad/missing env
      break;
    default:
      cachedProvider = new DisabledStorage();
  }
  return cachedProvider;
}

/** No-op provider used when STORAGE_PROVIDER is unset/unknown. */
class DisabledStorage implements StorageProvider {
  readonly id = 'disabled' as const;

  async createUpload(_info: UploadFileInfo): Promise<StorageUploadGrant> {
    throw new StorageNotConfiguredError(
      'File uploads are not configured on this deployment (STORAGE_PROVIDER is not set).'
    );
  }

  async verifyUpload(_fileKey: string): Promise<{ size: number } | null> {
    throw new StorageNotConfiguredError();
  }

  async getDownloadUrl(_fileKey: string): Promise<string | null> {
    throw new StorageNotConfiguredError();
  }

  async delete(_fileKey: string): Promise<void> {
    throw new StorageNotConfiguredError();
  }
}
