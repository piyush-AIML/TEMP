import { randomBytes } from 'node:crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { StorageProvider, StorageUploadGrant, UploadFileInfo } from './types';
import { StorageNotConfiguredError } from './types';

/**
 * AWS S3 provider adapter (replaces UploadThing, Dashboard Stage 2 — 2026-09-05).
 *
 * THE ONLY FILE that imports `@aws-sdk/*`. Everything else goes through the
 * StorageProvider interface (types.ts) — the schema stores only `fileProvider`
 * + opaque `fileKey`, and the client PUTs the raw file straight to the
 * presigned URL, never through our server (Vercel caps request bodies at
 * 4.5 MB).
 *
 * Client uploads must match the grant exactly: `createUpload` signs the
 * Content-Type into the PUT, so the browser MUST send the declared mime as the
 * `Content-Type` header with the raw bytes as the body (no multipart — S3
 * presigned PUTs take raw bodies; see FileDropzone).
 *
 * AWS setup (bucket + IAM + CORS) is documented in
 * docs/platform/deployment-env.md — the IAM user needs only
 * s3:PutObject/GetObject/DeleteObject scoped
 * to `arn:aws:s3:::<bucket>/materials/*` (HeadObject falls under GetObject),
 * and the bucket CORS must allow PUT/GET/HEAD from the app origins.
 */

const KEY_PREFIX = 'materials/';
const PUT_EXPIRES_SECONDS = 15 * 60; // grant valid 15 min (mirrors the old UploadThing grant)
const DOWNLOAD_EXPIRES_SECONDS = 24 * 60 * 60;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new StorageNotConfiguredError(
      `${name} is not set. Add S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY to .env.local (IAM user with s3:PutObject/GetObject/DeleteObject on ${KEY_PREFIX}*) and set STORAGE_PROVIDER=s3.`
    );
  }
  return value;
}

export class S3Provider implements StorageProvider {
  readonly id = 's3' as const;
  private readonly bucket: string;
  private readonly client: S3Client;

  constructor() {
    this.bucket = requiredEnv('S3_BUCKET');
    this.client = new S3Client({
      region: requiredEnv('S3_REGION'),
      credentials: {
        accessKeyId: requiredEnv('S3_ACCESS_KEY_ID'),
        secretAccessKey: requiredEnv('S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async createUpload(info: UploadFileInfo): Promise<StorageUploadGrant> {
    // Object key: opaque + unique + url-safe, under a single prefix so the IAM
    // policy and any lifecycle rules can target materials only. No provider-
    // specific keygen recipe is needed (S3 keys are just storage keys, unlike
    // UploadThing's verifiable sqids scheme).
    const fileKey = `${KEY_PREFIX}${randomBytes(24).toString('base64url')}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      // Signed into the URL: the client must send this exact header (and the
      // exact declared size was validated server-side by the action layer).
      ContentType: info.fileMime,
    });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: PUT_EXPIRES_SECONDS,
    });

    return {
      uploadUrl,
      fileKey,
      method: 'PUT',
      expiresAt: new Date(Date.now() + PUT_EXPIRES_SECONDS * 1000).toISOString(),
    };
  }

  async verifyUpload(fileKey: string): Promise<{ size: number } | null> {
    // HEAD the object through a short presigned URL: 200 + content-length
    // proves the object exists and gives its true size. A missing object
    // returns 404 → null.
    try {
      const command = new HeadObjectCommand({ Bucket: this.bucket, Key: fileKey });
      const url = await getSignedUrl(this.client, command, { expiresIn: 300 });
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) return null;
      const size = Number(res.headers.get('content-length'));
      return Number.isFinite(size) && size > 0 ? { size } : null;
    } catch {
      return null;
    }
  }

  async getDownloadUrl(fileKey: string): Promise<string | null> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: fileKey });
    return getSignedUrl(this.client, command, { expiresIn: DOWNLOAD_EXPIRES_SECONDS });
  }

  async delete(fileKey: string): Promise<void> {
    // DeleteObjectCommand is idempotent (204 even when the key is absent) —
    // no need to treat a missing object as an error.
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: fileKey }));
  }
}
