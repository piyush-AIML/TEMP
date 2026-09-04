import { createHmac, randomBytes } from 'node:crypto';
import { UTApi } from 'uploadthing/server';
import Sqids from 'sqids';
import type { StorageProvider, StorageUploadGrant, UploadFileInfo } from './types';
import { StorageNotConfiguredError } from './types';

/**
 * UploadThing v7 provider adapter (Dashboard Stage 2).
 *
 * THE ONLY FILE in the app that imports `uploadthing/*`. Everything else goes
 * through the StorageProvider interface (types.ts) — the schema stores only
 * `fileProvider` + opaque `fileKey`, and the generic FileDropzone PUTs files
 * straight to the signed ingest URL, never through our server (Vercel caps
 * request bodies at 4.5 MB).
 *
 * This is the documented "build your own SDK" server-side flow (no file route,
 * no slug, no registration, no callbacks): sign a direct ingest URL with
 * HMAC-SHA256 using the apiKey inside `UPLOADTHING_TOKEN` (base64 JSON
 * `{ apiKey, appId, regions: string[] }`), then verify/download/delete via the
 * UTApi server helpers. Re-verified against uploadthing@7.7.4 on 2026-09-05.
 */

const INGEST_HOST = 'ingest.uploadthing.com';
/** Default sqids alphabet, as published by the UploadThing keygen recipe. */
const SQIDS_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

type UploadThingToken = { apiKey: string; appId: string; regions: string[] };

function decodeToken(raw: string | undefined): UploadThingToken {
  if (!raw) {
    throw new StorageNotConfiguredError(
      'UPLOADTHING_TOKEN is not set. Add it to .env.local (UploadThing dashboard → API Keys → V7) and set STORAGE_PROVIDER=uploadthing.'
    );
  }
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as UploadThingToken;
    if (!parsed.apiKey || !parsed.appId || !Array.isArray(parsed.regions) || parsed.regions.length === 0) {
      throw new Error('shape mismatch');
    }
    return parsed;
  } catch {
    throw new StorageNotConfiguredError(
      'UPLOADTHING_TOKEN is invalid — expected a base64 JSON object matching { apiKey, appId, regions: string[] } (UploadThing dashboard → API Keys → V7).'
    );
  }
}

/** The documented djb2 string hash used by the keygen + alphabet shuffle. */
function djb2(input: string): number {
  let h = 5381;
  for (let i = input.length; i > 0; i -= 1) {
    h = (h * 33) ^ input.charCodeAt(i - 1);
  }
  return (h & 0xbfffffff) | ((h >>> 1) & 0x40000000);
}

/** Alphabet shuffle (deterministic on seed) from the published keygen recipe. */
function shuffleAlphabet(alphabet: string, seed: string): string {
  const seedNum = djb2(seed);
  const chars = alphabet.split('');
  for (let i = 0; i < chars.length - 1; i += 1) {
    const j = ((seedNum % (i + 1)) + i) % chars.length;
    const tmp = chars[i];
    chars[i] = chars[j];
    chars[j] = tmp;
  }
  return chars.join('');
}

/**
 * File key = sqids(appId, alphabet shuffled by appId, minLength 12) + a unique
 * url-safe seed. Must be reconstructible/verifiable by UploadThing — follow the
 * published recipe exactly; never hand-craft keys.
 */
function generateFileKey(appId: string): string {
  const alphabet = shuffleAlphabet(SQIDS_ALPHABET, appId);
  const appIdPart = new Sqids({ alphabet, minLength: 12 }).encode([Math.abs(djb2(appId))]);
  const seed = randomBytes(9).toString('base64url'); // url-safe, unique per file
  return `${appIdPart}${seed}`;
}

export class UploadThingProvider implements StorageProvider {
  readonly id = 'uploadthing' as const;
  private readonly token: UploadThingToken;
  private readonly region: string;
  private readonly api: UTApi;

  constructor() {
    this.token = decodeToken(process.env.UPLOADTHING_TOKEN);
    this.region = this.token.regions[0];
    this.api = new UTApi();
  }

  async createUpload(info: UploadFileInfo): Promise<StorageUploadGrant> {
    const fileKey = generateFileKey(this.token.appId);
    const url = new URL(`https://${this.region}.${INGEST_HOST}/${fileKey}`);
    url.searchParams.set('expires', String(Date.now() + 15 * 60 * 1000)); // +15 min, ms epoch
    url.searchParams.set('x-ut-identifier', this.token.appId);
    url.searchParams.set('x-ut-file-name', info.fileName);
    url.searchParams.set('x-ut-file-size', String(info.fileSize));
    url.searchParams.set('x-ut-file-type', info.fileMime);
    url.searchParams.set('x-ut-acl', info.acl);
    // Deliberately no x-ut-slug: server-side uploads skip the file-route
    // system (no registration, no callbacks).
    const signature = `hmac-sha256=${createHmac('sha256', this.token.apiKey).update(url.toString()).digest('hex')}`;
    url.searchParams.set('signature', signature);

    return {
      uploadUrl: url.toString(),
      fileKey,
      method: 'PUT',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  async verifyUpload(fileKey: string): Promise<{ size: number } | null> {
    // HEAD the signed object URL: 200 + content-length proves the object
    // exists and gives its true size (the declared x-ut-file-size is enforced
    // by UploadThing at ingest, but we re-check the real object here).
    // A missing object returns an error/non-200 → null.
    try {
      const { ufsUrl } = await this.api.generateSignedURL(fileKey, { expiresIn: '5 minutes' });
      const res = await fetch(ufsUrl, { method: 'HEAD' });
      if (!res.ok) return null;
      const size = Number(res.headers.get('content-length'));
      return Number.isFinite(size) && size > 0 ? { size } : null;
    } catch {
      return null;
    }
  }

  async getDownloadUrl(fileKey: string): Promise<string | null> {
    const { ufsUrl } = await this.api.generateSignedURL(fileKey, { expiresIn: '24h' });
    return ufsUrl;
  }

  async delete(fileKey: string): Promise<void> {
    await this.api.deleteFiles([fileKey]);
  }
}
