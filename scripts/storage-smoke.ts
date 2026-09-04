/**
 * Storage smoke gate (Dashboard Stage 2) — proves the hand-rolled UploadThing
 * signing contract against the live app BEFORE any UI exists:
 *   createUpload → client-style PUT (FormData, field `file`) → verifyUpload
 *   (HEAD, true size) → getDownloadUrl → delete.
 *
 * Honest skip when UPLOADTHING_TOKEN / STORAGE_PROVIDER=uploadthing are not
 * set (paste the V7 token into .env.local first). Run: npm run db:storage-smoke
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { getStorage } from '../src/lib/storage';
import { StorageNotConfiguredError } from '../src/lib/storage/types';

async function main() {
  const provider = getStorage();

  if (provider.id === 'disabled') {
    console.log('SKIPPED: STORAGE_PROVIDER is not "uploadthing".');
    console.log('Set UPLOADTHING_TOKEN (UploadThing dashboard → API Keys → V7) and STORAGE_PROVIDER=uploadthing in .env.local, then re-run.');
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

  console.log('2. PUT to ingest URL (multipart FormData, field `file`)...');
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: 'text/plain' }), name);
  const putRes = await fetch(grant.uploadUrl, { method: 'PUT', body: form });
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
