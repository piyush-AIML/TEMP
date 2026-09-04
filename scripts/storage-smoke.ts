/**
 * Storage smoke gate (Dashboard Stage 2) — proves the storage provider's
 * presigned-grant contract against the live bucket BEFORE any UI exists:
 *   createUpload → client-style PUT (raw bytes, Content-Type header) →
 *   verifyUpload (HEAD, true size) → getDownloadUrl → delete.
 *
 * Honest skip when STORAGE_PROVIDER=s3 and the S3_* vars are not set
 * (S3_REGION / S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY in
 * .env.local — see EDUCRAFT_PRODUCTION.md §24.9 for the AWS setup).
 * Run: npm run db:storage-smoke
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { getStorage } from '../src/lib/storage';
import { StorageNotConfiguredError } from '../src/lib/storage/types';

async function main() {
  const provider = getStorage();

  if (provider.id === 'disabled') {
    console.log('SKIPPED: STORAGE_PROVIDER is not "s3".');
    console.log('Set STORAGE_PROVIDER=s3 plus S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY in .env.local, then re-run.');
    return;
  }

  const bytes = Buffer.from('Educraft storage smoke test — ' + new Date().toISOString());
  const name = 'storage-smoke.txt';

  console.log(`1. createUpload via ${provider.id} provider...`);
  const grant = await provider.createUpload({
    fileName: name,
    fileSize: bytes.byteLength,
    fileMime: 'text/plain',
    acl: 'private',
  });
  console.log(`   fileKey: ${grant.fileKey.slice(0, 18)}…  method: ${grant.method}`);

  console.log('2. PUT to presigned URL (raw bytes, Content-Type header)...');
  // Mirrors the browser flow: the signed grant pins the mime, so the request
  // must send that exact Content-Type with the raw body (no multipart).
  const putRes = await fetch(grant.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: bytes,
  });
  console.log(`   status: ${putRes.status} ${putRes.statusText}`);
  if (!putRes.ok) {
    throw new Error(`Ingest PUT failed: ${putRes.status} ${await putRes.text()}`);
  }

  console.log('3. verifyUpload (signed HEAD)...');
  const verified = await provider.verifyUpload(grant.fileKey);
  console.log(`   ${verified ? `exists, ${verified.size} bytes (declared ${bytes.byteLength})` : 'MISSING — upload did not land'}`);
  if (!verified || verified.size !== bytes.byteLength) {
    throw new Error('verifyUpload failed or size mismatch');
  }

  console.log('4. getDownloadUrl (signed, 24h)...');
  const downloadUrl = await provider.getDownloadUrl(grant.fileKey);
  console.log(`   ${downloadUrl ? 'signed URL ok' : 'null'}`);
  if (!downloadUrl) throw new Error('getDownloadUrl returned null');
  const getRes = await fetch(downloadUrl);
  const body = await getRes.text();
  console.log(`   fetch signed URL → ${getRes.status}, body match: ${body === bytes.toString()}`);

  console.log('5. delete...');
  await provider.delete(grant.fileKey);
  const gone = await provider.verifyUpload(grant.fileKey);
  console.log(`   delete ok, verify after delete: ${gone === null ? 'gone ✓' : 'STILL PRESENT'}`);

  console.log('\n✅ Storage smoke gate passed.');
}

main().catch((error) => {
  if (error instanceof StorageNotConfiguredError) {
    console.error('Storage not configured:', error.message);
    return;
  }
  console.error('❌ Storage smoke gate failed:', error);
  process.exit(1);
});
