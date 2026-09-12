# Deployment & environment

Where the app runs, every environment variable it reads, and how course-material file storage is wired.

## Hosting

The site is static except `/api/enquiry` — deployable to any Next.js host.

**On Vercel:** import the repo, set the env vars below, deploy. No other env vars are required to run the site. The dashboard runs from the same repo and the same Vercel project (a new authenticated section, not a separate app).

Environments: the Vercel staging/preview deployment is `temp-tau-opal.vercel.app`; the production domain is unset in the documented baseline — see [blockers.md](blockers.md) item 2.

Build note: `npm run build` is `prisma generate && next build`, so the Prisma client is regenerated on every build. On Vercel the Prisma config's `.env.local` dotenv load no-ops and `DATABASE_URL` comes from Vercel's injected env — `generate` never touches the DB anyway. Full build/verification detail: [verification.md](verification.md).

## Environment variables

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical production domain (metadata, sitemap, OG images). Falls back to `https://educraft.com` — set the env var for the real domain |
| `ENQUIRY_WEBHOOK_URL` | Where enquiries are delivered (CRM/email). Without it, enquiries are only appended to `data/enquiries.jsonl` + logged |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` · `CLERK_SECRET_KEY` | Clerk dashboard auth (Clerk dashboard → your app → API keys; env mode: Email + password enabled in User & Authentication) |
| `DATABASE_URL` | Postgres (Neon) — use the **direct, non-pooled** connection string; it works for migrations and the app runtime alike at this scale |
| `STORAGE_PROVIDER` | Storage backend for FILE materials. Leave unset/unknown for "uploads disabled" (honest UI copy, everything else works); set to `s3` once the S3 vars below are real |
| `S3_REGION` · `S3_BUCKET` · `S3_ACCESS_KEY_ID` · `S3_SECRET_ACCESS_KEY` | AWS S3 course-material storage (bucket, IAM user keys) |

**The template is the root `.env.example`** — copy it to `.env.local` and fill in real values. `.env.local` is gitignored; `.gitignore` deliberately carves out `!.env.example` (`.env*` + `!.env.example`) so the template stays tracked. Never commit real keys.

**How env is loaded:** Next.js loads `.env.local` natively; `prisma7.config.ts` loads it for the Prisma CLI (migrations, seed). **Gotcha:** the dev server only reads `.env.local` at boot — restart `npm run dev` after env changes or the UI keeps showing stale copy (e.g. the "STORAGE_PROVIDER is not set" disabled state).

## File storage — UploadThing → AWS S3

### 24.9 Blocker — UploadThing free tier rejected private files → RESOLVED with AWS S3 (2026-09-05)

- **Original symptom (2026-09-05):** `npm run db:storage-smoke` failed at the ingest PUT with `400 {"error":"Private files are not allowed for free apps. Upgrade your app to a paid tier to enable private files."}` — UploadThing's free tier does not allow `x-ut-acl=private`.
- **Resolution — RESOLVED 2026-09-05: switched the storage provider to AWS S3.** `src/lib/storage/uploadthing.ts` (the only `uploadthing/*` import) and the `uploadthing` + `sqids` deps are **deleted**; a new `src/lib/storage/s3.ts` (`S3Provider`) serves the same `StorageProvider` interface with AWS SDK presigned URLs. The provider-agnostic architecture absorbed the swap with **zero domain/DB/UI changes** (rows already stored `fileProvider` + opaque `fileKey`; the Prisma `StorageProvider` enum already had `S3`; `domain/materials.ts` already casts `'UPLOADTHING' | 'S3'`). The only non-provider code change: `FileDropzone` + the smoke script now PUT **raw bytes with the signed Content-Type header** (S3 presigned PUTs sign headers; UploadThing had accepted multipart FormData).
- **Code state:** shipped + verified 2026-09-05 — lint ✓ · tsc ✓ · build ✓ (29 routes). *The gate result for that date stands; the "29 routes" was a hand-count and the route table has since grown with the dashboard — the build reports 50 entries by the tree's own counting. See `verification.md`, which names build output as the authority precisely because hand-written counts have repeatedly disagreed with it.* **Storage smoke gate PASSED 2026-09-05** against the owner's live bucket `educraftbucket07` (`ap-southeast-2`): presigned PUT 200 → verifyUpload size match → signed GET body match → delete → verify-gone. **Browser visual E2E — executed 2026-09-05 by the owner** (evidence in the live DB: the demo student's notification feed received `New file: EDUCRAFT_PRODUCTION` ×2 and `New note: S3` rows from professor-side uploads).
- **What works already:** the provider-agnostic layer, the direct PUT flow, the generic FileDropzone, and the FILE-row domain/query/UI paths. Env: `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (mirrored in `.env.example`); unset/unknown `STORAGE_PROVIDER` still means the honest "uploads disabled" path. Live values: `S3_REGION=ap-southeast-2`, `S3_BUCKET=educraftbucket07` (in `.env.local`, gitignored).

### 24.9.1 AWS setup (owner action — one-time; **completed 2026-09-05**, bucket `educraftbucket07` in `ap-southeast-2`)

1. **Bucket** — create in `S3_REGION`, name = `S3_BUCKET`. **Block all public access ON** (objects stay private; access is only via presigned URLs).
2. **IAM user** — create (or reuse) a user with **programmatic access only**; attach this inline policy (scoped to `materials/*` — the only key prefix the app writes; `HeadObject` is covered by `s3:GetObject`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       { "Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
         "Resource": "arn:aws:s3:::<S3_BUCKET>/materials/*" }
     ]
   }
   ```
   Save the access key + secret into `.env.local` (`S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`).
3. **CORS** on the bucket — browsers PUT directly to the presigned URL, so the origin must be allowed (`AllowedHeaders: *` is required so the browser may send the pinned `Content-Type`):
   ```json
   [{ "AllowedOrigins": ["http://localhost:3000", "https://temp-tau-opal.vercel.app", "https://educraft.com"],
      "AllowedMethods": ["PUT", "GET", "HEAD"], "AllowedHeaders": ["*"], "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000 }]
   ```
4. Set `STORAGE_PROVIDER=s3` in `.env.local`; run `npm run db:storage-smoke` — **PASSED 2026-09-05**; then do the browser check (professor → course → Materials → File tab → upload → student sees signed download link). **Gotcha:** the dev server only reads `.env.local` at boot — restart `npm run dev` after env changes or the UI shows the stale "STORAGE_PROVIDER is not set" disabled copy.
5. **Vercel:** set the same five env vars in the project settings. Files already uploaded (none — the old gate never landed an object) would need a provider/key-row migration script; not needed now.

### Storage provider architecture (S3)

- `src/lib/storage/types.ts` defines the `StorageProvider` interface — `createUpload` / `verifyUpload` / `getDownloadUrl` / `delete` — plus `StorageNotConfiguredError`. `src/lib/storage/s3.ts` holds **the only `@aws-sdk/*` imports** in the codebase; `index.ts` is the `getStorage()` factory keyed on `STORAGE_PROVIDER` (unset/unknown → `DisabledStorage`).
- Presigned `PutObjectCommand` with the **Content-Type signed in** — the client must send that exact header with raw bytes, no multipart. Key = `materials/<24 random base64url bytes>` (plain opaque object key, no provider keygen recipe needed). `verifyUpload` HEADs a short presigned URL to learn the real size; downloads are presigned `GetObjectCommand` (24h); deletes are `DeleteObjectCommand` (idempotent 204).
- **Client uploads never touch our server** (Vercel's 4.5 MB body cap): `FileDropzone` mints an upload token (ownership checked BEFORE signing) → PUTs raw bytes straight to the presigned URL → completes the upload (verify + persist + notify).
- DB rows store `fileProvider` + opaque `fileKey` + `fileMeta Json {name,size,mime}` — **never URLs**. Migrations: `add_material_file_storage` (StorageProvider enum + 3 Material columns; `fileUrl` documented LINK-only) and `add_user_notification_prefs`. Environment variables: `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (mirrored in `.env.example`).
- **Future provider swap** = a new adapter + `scripts/storage-migrate.ts` updating provider/key rows only. The dashboard-side narrative for materials, uploads and notifications lives in [../projects/dashboard/](../projects/dashboard/).
