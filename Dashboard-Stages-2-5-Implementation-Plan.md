# Dashboard Stages 2–5 — Master Implementation Plan

> ⚠️ **Implementation status snapshot (2026-09-05):** Stages 0–2 shipped. **§24.9 blocker RESOLVED at code level 2026-09-05** — file storage switched UploadThing → **AWS S3** (`S3Provider` on `@aws-sdk/client-s3` presigned URLs; `uploadthing.ts` + `uploadthing`/`sqids` deps removed; lint/tsc/build ✓). Remaining: the owner's one-time AWS setup (bucket / IAM policy / CORS, master §24.9.1) → `npm run db:storage-smoke` → visual E2E. Everything else in Stage 2 (text/link materials, sessions, notifications, bells) is done. Next: Stage 3 — Meetings & Planner (unaffected).
>
> Single implementation guide for all remaining dashboard stages. Stage 1 shipped (superseded plan replaced). Each stage ends with: verification loop → docs sync (EDUCRAFT_PRODUCTION.md §24 + Dashboard-Implementation-Plan.md) → next stage. Library specifics below were verified against current docs (2026-09-05).

## Context

Stages 0–1 shipped: Clerk 7.9 auth (roles via publicMetadata), Neon/Prisma 7.10, student side fully real; professor routes all stubs. This plan: **Stage 2 Professor Core → Stage 3 Meetings & Planner → Stage 4 Polish → Stage 5 QA & Deploy** + Stage 6 backlog.

## User decisions (locked 2026-09-05)

1. **Storage**: UploadThing was chosen as the Stage 2 provider **strictly behind a provider-agnostic `StorageProvider` interface** (schema stores provider + opaque key + metadata, never provider URLs/fields) — and that isolation paid off: its free tier blocked private files, so the provider was swapped to **AWS S3 on 2026-09-05** with no domain/DB/UI change (§24.9; `S3Provider` adapter is the only place `@aws-sdk/*` is imported; migration mechanism still designed for future provider/key row updates).
2. **Calendar**: react-big-calendar (v1.20.0, React 19 compat confirmed) + date-fns v4 localizer.
3. **Testing (Stage 5)**: Vitest unit + Playwright E2E (auth flows, professor→student visibility loop, role-boundary attacks) + manual walkthrough.

## Cross-cutting architecture (all stages)

- **Thin actions + testable domain layer.** `src/lib/actions/*` (`'use server'`) are orchestrators only: `requireRole('professor')` → zod v4 validate → call plain async domain fn → `revalidatePath`. All DB/ownership/notification logic lives in **`src/lib/domain/`** (server-only, explicit `professorId`/`studentId` params) — the Stage 1 query-layer pattern extended to mutations, so Stage 5 integration tests drive role-boundary logic without Clerk.
- **ActionResult** (plain serializable, no Dates): `{ ok: true; message? } | { ok: false; fieldErrors?: Record<string,string>; formError?: string }`. Auth failures throw (requireRole); ownership failures → `{ ok:false, formError: 'Course not found' }` (no existence oracle); zod failures → `fieldErrors` via existing `flattenZodErrors` (`src/lib/validation.ts`).
- **IST wall-time input rule (critical):** forms use `<input type="datetime-local">` (value like `"2026-09-10T11:00"`, no offset) labelled **IST**; validate format with regex; compare ranges **lexicographically** (zero-padded strings compare correctly — no Date math); convert via `istWallTimeToUtc(s)` (append `+05:30` before `new Date`). DB stays UTC; display already IST via `format.ts`. Applied in every session/meeting/task form + unit-tested.
- **Revalidation:** after any professor mutation, `revalidatePath('/dashboard/professor', 'layout')` **and** `revalidatePath('/dashboard/student', 'layout')` (layout scope covers all child routes in one call each; pages are dynamic via auth()). The bell's poll hits a dynamic route handler — no revalidation needed.
- **Forms:** `useActionState` + `useFormStatus` + server-side zod — **no react-hook-form** (zero new deps; documented deviation from the plan doc's RHF suggestion). Bound actions (`action.bind(null, courseId)`) pass ids.
- **No framework import leaks:** client components never import query/domain/`format.ts` modules (they transitively pull `server-only`); bell talks to a route handler only; tabs/calendar receive serialized DTOs.
- Marketing site untouched. Honest copy everywhere; no seeded fake notifications.

---

## STAGE 2 — Professor Core (1–1.5 wk)

**Exit criteria:** professor schedules a class and posts a remark; the enrolled student sees both without a page reload (or on next poll); bell works on both dashboards.

### 2.1 Schema migration `add_material_file_storage`
```prisma
enum StorageProvider { UPLOADTHING S3 }
// Material +=
fileProvider StorageProvider?   // FILE rows only
fileKey      String?            // opaque key — never a URL
fileMeta     Json?              // { name, size, mime } — zod-validated on read
```
`fileUrl` documented as **LINK-target only**. All changes additive (safe prod migration). `npx prisma migrate dev --name add_material_file_storage` → `npm run db:generate`. If Neon shadow-DB fails: `--create-only` → review SQL → apply.

### 2.2 Env + deps
- `.env.example` + `.env.local` (**superseded 2026-09-05 — S3 is the provider**): `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `STORAGE_PROVIDER=s3` (AWS setup in master §24.9.1).
- `npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner` (uploadthing + sqids removed 2026-09-05).

### 2.3 Storage abstraction — `src/lib/storage/`
Verified UploadThing v7 reality: **no generateUploadToken/completeUpload API.** The documented "build your own SDK" contract gives exactly the provider-agnostic design (zero `@uploadthing/*` imports outside the provider):
- **Interface** (`types.ts`):
  ```ts
  interface StorageProvider {
    readonly id: 'uploadthing' | 's3';
    createUpload(i: { fileName; fileSize; fileMime; acl: 'private' }): Promise<{ uploadUrl; fileKey; method: 'PUT'; expiresAt }>;
    verifyUpload(fileKey: string): Promise<{ size: number } | null>;
    getDownloadUrl(fileKey: string): Promise<string | null>;
    delete(fileKey: string): Promise<void>;
  }
  ```
  Plus `StorageNotConfiguredError` (code `'STORAGE_NOT_CONFIGURED'`).
- **`s3.ts`** (`S3Provider` — the only file importing `@aws-sdk/*`; shipped 2026-09-05, replacing the deleted `uploadthing.ts`):
  1. Object key = `materials/{24 random base64url bytes}` — plain opaque key under one prefix (IAM policy + lifecycle rules target `materials/*`); no provider keygen recipe needed.
  2. Signed upload URL = presigned `PutObjectCommand` via `getSignedUrl` (15 min), **Content-Type signed in** — the client must send that exact header with the **raw bytes** as the body (no multipart FormData; the UploadThing-only quirk is gone).
  3. `verifyUpload` → HEAD a short presigned `HeadObjectCommand` URL (5 min) → `content-length` → `{size} | null`.
  4. `getDownloadUrl` → presigned `GetObjectCommand` (24 h).
  5. `delete` → `DeleteObjectCommand` (idempotent 204 — no error for absent keys).
- **`index.ts`** (deliberately NOT `'server-only'` — same pattern as prisma-client.ts): `getStorage()` factory on `STORAGE_PROVIDER`; `s3` → `S3Provider`; unset/unknown → `DisabledStorage` throwing `StorageNotConfiguredError` (composer shows honest "uploads not configured" copy).
- **`scripts/storage-smoke.ts`** (tsx; script `db:storage-smoke`): createUpload → fetch PUT with raw bytes + `Content-Type: text/plain` header → verifyUpload → getDownloadUrl → delete. **Gate runs before any UI work** — proves the presigning contract against the live bucket.
- **Future provider migration mechanism (designed, script when needed):** `scripts/storage-migrate.ts` iterates FILE rows, streams object from provider A → PUT to provider B, updates `fileProvider`/`fileKey` in a transaction. Domain reads only the interface — nothing else changes. (Unneeded for the UploadThing→S3 swap itself: no object ever landed under UploadThing.)
- **Why files never pass through our server:** Vercel Functions cap request bodies at 4.5 MB (Server Actions included) — the two-stage direct-to-storage flow is mandatory, and it is exactly what the provider-agnostic FileDropzone needs.

### 2.4 Validators — `src/lib/validators/{sessions,materials}.ts`
- `sessionInputSchema`: `courseId`, `startsAt`/`endsAt` (`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$`), `mode: z.enum(['ONLINE','IN_PERSON'], { message })`, `link` (url-or-empty, ONLINE-only via superRefine), `location` (≤200), lexical `endsAt > startsAt`. Export `istWallTimeToUtc`.
- `materialInputSchema` (NOTE/REMARK: title 1–200, body ≤10k; LINK: title + url http(s) or internal `/`), `fileUploadInputSchema` (name ≤200, **size ≤16 MB**, mime whitelist `pdf,doc,docx,ppt,pptx,xls,xlsx,txt,md,png,jpg,jpeg,webp,zip`), `fileCompleteSchema` (fileKey + meta). All zod v4 `{ message }`; the 16 MB cap lives in the validators + FileDropzone (S3 has no per-file dashboard limit to configure).

### 2.5 Notifications — `src/lib/notifications/`
- `builder.ts` (**pure**, unit-testable): `buildNotificationRows(users: {userId, prefs|null}[], event: {type,title,body?,relatedEntity?})` — pref map `NEW_MATERIAL→newMaterial`, `NEW_CLASS→newClass`, `MEETING→meeting`, `TASK_DUE→taskDue`; null prefs = all on.
- `notify.ts` (server-only): `createCourseNotifications(courseId, event)` — one query for ACTIVE enrollments + `user.notifPrefs` → builder → `createMany`; `createStudentNotification(studentId, event)` for meetings.

### 2.6 Domain — `src/lib/domain/{sessions,materials}.ts`
- `sessions.ts`: `create/update/cancelClassSessionForProfessor(professorId, input)` — `courseProfessors.findUnique({courseId_professorId})` ownership → `DomainError('COURSE_NOT_OWNED')` → write → `createCourseNotifications` with honest body built from `formatSessionRange` ("New class · Fri, 5 Sep · 11:00 am – 12:30 pm IST"; cancel = "cancelled", update = "rescheduled").
- `materials.ts`: `createTextMaterial`, `createLinkMaterial`, `persistFileMaterial` (FILE row: provider/key/meta, `fileUrl: null`), `deleteMaterial` (FILE → `getStorage().delete` first, log-and-continue on provider failure; no notification on delete).

### 2.7 Actions — `src/lib/actions/{sessions,materials,notifications,storage}.ts` (first `'use server'` files)
- `sessions.ts`: `createClassSession` · `updateClassSession` · `cancelClassSession` — requireRole → zod → domain → revalidate both role layouts → `{ok:true}`.
- `materials.ts`: `createTextMaterial` · `createLinkMaterial` · `createUploadToken({courseId,fileName,fileSize,fileMime})` → serialized grant (ownership-checked **before** minting) · `completeFileUpload({courseId,fileKey,title,...})` → `verifyUpload` (reject size mismatch/absent) → `persistFileMaterial` → NEW_MATERIAL notifications · `deleteMaterial`.
- `notifications.ts`: `markNotificationRead(id)` (ownership `where: {id, userId}`) · `markAllNotificationsRead`.
- `storage.ts`: `createUploadToken` + `completeFileUpload` (or fold into materials.ts — implementer's choice, one file cleaner).

### 2.8 Professor queries — `src/lib/dashboard/professor.ts` + `notifications.ts` (Stage 1 style, role-explicit)
- `getProfessorCourses(userId)` (CourseProfessors + `_count`s: activeStudents, upcomingSessions, materials) · `getProfessorCourseWithAccess(userId, courseId)` (ownership → null → `notFound()`; page + generateMetadata share via `cache()`) · `getCourseRoster(userId, courseId)` (ACTIVE students name/email) · `getProfessorUpcomingSessions(userId)` · `getProfessorStats(userId)` · `getProfessorCourseSessions(userId, courseId)` (SCHEDULED+DONE+CANCELLED window).
- `notifications.ts`: `getMyNotifications(userId, limit=50)` (ISO createdAt, type, read) · `getUnreadNotificationCount(userId)`.
- `materials.ts` update: FILE rows resolve `downloadUrl` via `getStorage().getDownloadUrl(fileKey)` + `fileMeta`; add `formatBytes` to `format.ts` (pure, unit-tested).

### 2.9 Proxy + route handler (ships FIRST — without it the bell 500s)
- `src/proxy.ts`: `config.matcher = ['/dashboard/:path*', '/api/dashboard/:path*']`; new branch for the API route: `auth()` → no userId → `NextResponse.json({error:'Unauthorized'},{status:401})`; **never** `auth.protect()` for the API (redirects, wrong for fetch).
- `src/app/api/dashboard/notifications/route.ts`: `export const runtime = 'nodejs'`; GET → `{unreadCount, notifications[latest 20]}`; POST → `{id}` or `{all:true}` mark-read (ownership-scoped); `auth()` 401 belt-and-suspenders → `getCurrentUser()`.

### 2.10 Components — `src/components/dashboard/`
- `NotificationBell.tsx` (client): props `{userId, role}`; poll immediately + 30 s, pause on `document.hidden` (self-contained, no deps); unread badge; dropdown 5 latest (literal type→icon map); "Mark read" → POST; "View all" → role notifications page.
- `FileDropzone.tsx` (client): file input with whitelist `accept`; client pre-check (size/mime) → `createUploadToken` → **XMLHttpRequest PUT** (progress events; fetch lacks them) with FormData(`file`) — must send the exact declared File (`x-ut-file-size` must match) → `completeFileUpload` → `router.refresh()`; map `STORAGE_NOT_CONFIGURED` to honest disabled copy.
- `MaterialComposer.tsx` (client): tabs Note/Remark | Link | File; text/link via `useActionState` + `useFormStatus` + fieldErrors; File tab = FileDropzone.
- `SessionForm.tsx` + `SessionsManager.tsx` (client): create (datetime-local labelled IST, mode select toggles link/location) · per-session inline edit · cancel with two-step confirm; only SCHEDULED editable.
- `RosterTable.tsx` (server) · `CourseTabs.tsx` (client tab shell: Overview/Roster/Sessions/Materials — data fetched once server-side; Stage 3 adds Planner) · `ProfessorCourseCard.tsx` · `NotificationList.tsx` (server) + `NotificationActions.tsx` (client: mark-read + `router.refresh()`; `relatedEntity` `course:<id>` → role-aware link).
- **Move** `student/ProfileSection.tsx` → `dashboard/ProfileSection.tsx` (both roles reuse; fix professor stub's "Stage 1" label). After move: `rm -rf .next` before tsc (§19 ledger).
- `MaterialFeed.tsx` update: FILE rows → `<a href={downloadUrl} download>` with name + `formatBytes(size)`; LINK path unchanged; remove "arrives in Stage 2" line.
- `DashboardShell.tsx`: add `userId` to the `user` prop (layouts pass `session.userId`); render `NotificationBell` beside `ThemeToggle`.
- `navItems.ts`: professor nav += `{ label: 'Notifications', href: '/dashboard/professor/notifications', icon: Bell }`.

### 2.11 Pages
- `professor/page.tsx` real (stats ×3 + next classes + course grid); `professor/courses/page.tsx` real grid; **new `professor/courses/[courseId]/page.tsx`** (access-check → notFound; pillar header; `CourseTabs`); `professor/schedule/page.tsx` real (IST day-grouped + `SessionForm`); **new `professor/notifications/page.tsx`** (list + mark-all); `professor/profile/page.tsx` real mirror + shared ProfileSection.
- `student/notifications/page.tsx` real (unread emphasized + NotificationActions); `student/layout.tsx` + `professor/layout.tsx` pass `userId`.
- Seed: **no** Notification rows (notifications announce real actions; the walkthrough generates them).

### 2.12 Stage 2 sequence
proxy.ts (matcher+401) → migration → env → storage abstraction + smoke script (gate) → validators → notifications builder/notify → domain → actions → queries → route handler → bell/shell/nav → professor pages → student updates → verification + docs.

**Gates (assistant):** migration on Neon; `db:storage-smoke` green; query smoke scripts (professor counts, roster, ownership null-check); lint/tsc/build.
**Gates (user):** professor creates class + note/link + real file upload → student sees class/material/download + bell badge increments + mark-read clears; notifications page IST-correct; cancel/reschedule → student sees change + honest notification; professor profile chip + Clerk portal.

---

## STAGE 3 — Meetings & Planner (1–1.5 wk)

**Exit criteria:** professor plans tasks and sees completion % update as tasks move to done; meetings schedule/view work; calendar renders correctly.

### 3.1 Deps + calendar
- `npm i react-big-calendar@^1.20.0 date-fns@^4.4.0` (RBC 1.20 peer-supports React 19; localizer: `dateFnsLocalizer` with v4 named imports `format, parse, startOfWeek, getDay` + `enUS` locale, **module scope**).
- `CalendarView.tsx` (client): imports `react-big-calendar/lib/css/react-big-calendar.css`; props `{events: CalendarEventDTO[]}` (`{id,title,start,end,kind:'class'|'meeting',courseCode?,href?}` ISO → `Date` client-side); views month/week/agenda; default week desktop / agenda < `lg` (matchMedia at mount); kind → literal accent classes; `onSelectEvent` → href.
- **CSS**: `globals.css` `@layer components` block scoped `.calendar-shell` overriding `.rbc-*` with `var(--ec-*)` tokens + `.dark .calendar-shell` variant (borders→`--ec-border`, header/`rbc-today`→`--ec-sky`, `.rbc-event`→`--ec-indigo`, off-range→transparent). Literal CSS only (§18 rule 5).
- RBC renders browser-local time (= IST for the audience; honest copy "Calendar shows your local time" noted in docs).

### 3.2 Meetings
- Queries `meetings.ts`: `getProfessorMeetings(userId, {upcomingOnly?})` · `getProfessorStudents(userId)` (distinct ACTIVE students across owned courses — for the withWhom select).
- Validators + domain + actions `meetings.ts`: `withWhom: z.enum(['STUDENT','PARENT','OTHER'])`, `studentId` required when STUDENT **and must be one of the professor's students**, IST datetime pair; fan out `createStudentNotification(studentId, MEETING)` when studentId set.
- `professor/meetings/page.tsx` real: `MeetingScheduler` (roster select) + upcoming `MeetingList` + combined calendar.
- **Scoping (confirmed):** meetings/tasks are professor-side tools; students learn of meetings only via MEETING notifications (body carries honest time/context). Tasks invisible to students; CompletionLog reserved for future student progress (documented in module docstrings).

### 3.3 Coursework planner
- Queries `tasks.ts`: `getCourseTasks(userId, courseId)` · `getCourseCompletion(userId, courseId)` → `{total, done, percent}` from **Task.status only**.
- Validators/domain/actions `tasks.ts`: title, description?, dueDate?, status moves (TODO→IN_PROGRESS→DONE). No notifications in v1 (TASK_DUE reserved — noted).
- Components: `TaskBoard.tsx` (3 columns, status select per task — no drag lib) · `TaskForm.tsx` · `CompletionBar.tsx` (`style={{width: `${percent}%`}}` — inline style, not dynamic Tailwind) · `ScheduleExplorer.tsx` (client toggle: server-rendered list as children + calendar as prop — keeps server-only modules out of client code).
- Pages: `professor/schedule/page.tsx` gains List/Calendar toggle; `professor/courses/[courseId]` gains Planner tab; overview stage chips removed, real stats.
- Seed (optional): 1 MEETING (demo student, future) + 3 TASKs/course (mixed statuses → honest non-zero %) via count-check idempotency.

### 3.4 Stage 3 sequence
deps → calendar CSS → CalendarView → meetings queries/validators/domain/actions → meetings page → tasks queries/validators/domain/actions → TaskBoard + CompletionBar + Planner tab → ScheduleExplorer toggle → seed → verification + docs.

**Gates:** query smoke (meetings/tasks); lint/tsc/build. **User:** meeting with demo student → student bell MEETING notification; calendar light/dark month/week/agenda; phone viewport defaults agenda; planner create/move tasks → completion bar updates honestly.

---

## STAGE 4 — Polish (1 wk)

1. **Migration `add_user_notification_prefs`**: `User.notifPrefs Json?` (`{newMaterial,newClass,meeting,taskDue}` all boolean default true; null = all on; zod `safeParse` + merge-with-defaults on read; writes cast `Prisma.InputJsonValue`). **`getCurrentUser` mirror upsert must NEVER touch `notifPrefs`** (no read-modify-write hazard).
2. Prefs UI: `updateNotificationPrefs` action (ownership-scoped) + `PrefsForm` client toggles on the student notifications page; `notify.ts` honors prefs (builder already accepts them — no call-site changes).
3. **Boundaries**: `dashboard/error.tsx` (`'use client'`, reset button, honest copy) + `dashboard/loading.tsx` (card-surface skeleton); EmptyState coverage audit.
4. **Mobile pass**: `DashboardShell` — replace horizontal-scroll top nav with **fixed bottom nav** (`lg:hidden`, 5 icon+label items, active states; `main` gets `pb-24 lg:pb-8`). Bottom bar over drawer: no overlay/scroll-lock, thumb-friendly. Top bar keeps logo+bell+theme+UserButton. RBC agenda under `lg` (Stage 3).
5. **Access-control audit checklist** (assistant-run, recorded in docs): requireRole in every action; ownership filter in every `getProfessor*` query; student → professor routes redirect; `createUploadToken` checks professor+ownership before minting; route handler 401 active; E2E covers the rest.
6. Docs sync with audit results.

**Gates:** migration + generate; audit checklist completed; lint/tsc/build. **User:** prefs off for new-class → professor creates class → no notification but class appears on schedule; mobile bottom nav all 5 destinations; error boundary + loading skeleton demo (assistant temporarily throws, user verifies, revert).

---

## STAGE 5 — QA & Deploy (0.5–1 wk)

### 5.1 DevDeps
`npm i -D vitest@^5 @vitejs/plugin-react@^6 jsdom @playwright/test@^1.62 @clerk/testing@^2.2`

### 5.2 Vitest unit — `vitest.config.mts`
`defineConfig` from `vitest/config`; `plugins: [react()]`; alias `@` → `./src`; alias **`'server-only'` → `tests/stubs/server-only.ts`** (empty module — the `server-only` package throws outside RSC, and `format.ts` imports it); jsdom default, `// @vitest-environment node` per-file for pure modules.
Specs: `format.test.ts` (IST boundaries — 23:30 UTC → next IST day, Today/Tomorrow, range format) · `validators.test.ts` (datetime-local regex, lexical refine, mime/size caps) · `notifications-builder.test.ts` (pref filtering, null=all-on) · `pillar.test.ts` (5 verticals + unknown) · `storage.test.ts` (mock provider drives persist/complete domain logic; DisabledStorage typed error). Script `"test": "vitest run"`.

### 5.3 Vitest integration (opt-in, NOT default CI) — `vitest.integration.config.ts`
Node env, `TEST_DATABASE_URL` from `.env.local`, same server-only stub. `tests/integration/course-loop.test.ts`: seed unique trio (`it-{ts}@test.local`) → professor domain creates session/material → student queries see them → **student userId calling professor domain → denied** (role-boundary at the domain layer) → notification rows only for enrolled student → `getCourseCompletion` math → cleanup (cascades). Script `"test:integration"`.

### 5.4 Playwright — `playwright.config.ts`
- webServer `npm run dev` (`reuseExistingServer: !process.env.CI`); projects: `setup` (`testMatch: auth.setup.ts`) → `student` / `professor` / `boundaries` (deps on setup, `storageState` under `playwright/.auth/`, **gitignored**).
- `auth.setup.ts`: **`clerkSetup()` in the project file (NOT globalSetup — env vars don't propagate otherwise, the #1 documented failure mode)**; `clerk.signIn({ page, signInParams: { strategy: 'password', identifier, password } })` per role (env creds `E2E_*_PASSWORD` in `.env.local`); save storageState. `setupClerkTestingToken({ page })` only for the one real-UI spec. Dev Clerk instance only — never production keys.
- Specs: `auth.spec.ts` (signed-out `/dashboard` → `/sign-in`; UI sign-in flow once; role dispatch) · `loop.spec.ts` (professor creates class + NOTE → student sees class on schedule, material on course page, bell badge increments ≤30 s, mark-read clears) · `boundaries.spec.ts` (student GET professor routes → redirected; signed-out GET `/api/dashboard/notifications` → 401 JSON) · `mobile.spec.ts` (390×844: bottom nav, navigation, agenda calendar).
- Script `"test:e2e": "playwright test"`; **runs are user-authorized per the working agreement.**

### 5.5 Deploy checklist
- Vercel env: `DATABASE_URL`, Clerk keys, `STORAGE_PROVIDER=s3`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (AWS bucket/IAM/CORS setup: master §24.9.1).
- DB: `npx prisma migrate deploy` against prod URL (additive-only — safe); preview deploy on staging domain first (same dev Neon acceptable at this scale); rollback = revert dashboard nav-link commit (no destructive schema to unwind).
- Docs: final §24 sync + runbook.

**Gates:** `npm run test` green · `npm run test:integration` green with cleanup verified · `npx playwright test` green (user-authorized) · lint/tsc/build · deploy checklist executed. **User:** full manual walkthrough both roles + loop + mobile, approve preview deploy.

---

## STAGE 6 — Backlog (listed only)

Realtime push · Parent view · attendance per ClassSession · gradebook · calendar sync (.ics/Google) · admin console · CompletionLog student-side progress · S3 migration script execution · orphaned-upload cleanup script.

---

## Risks & gotchas (carry into implementation)

1. **RESOLVED 2026-09-05:** the hand-rolled UploadThing signing contract (formerly the riskiest component — bespoke internal wire details, and the free-tier ACL that blocked the gate) is gone; the S3 provider uses the standard SDK's presigned URLs. Residual S3 risks: presigned PUTs sign the **Content-Type** — the dropzone must send the declared mime exactly (it does; grant pins it); bucket **CORS** must allow the app origins or browser PUTs fail with a confusing opaque error (§24.9.1 step 3); IAM keys are long-lived — rotate + scope to `materials/*` only.
2. Presigned signed download URLs expire (24 h) — long-open student page can 403 on click; v1-acceptable, documented.
3. Orphaned uploads (granted but never completed) — acceptable v1; cleanup script future.
4. `datetime-local` IST trap — applied in every session/meeting/task form + unit-tested.
5. Proxy matcher change shipped with Stage 2 FIRST — without it the bell 500s (`auth()` throws).
6. After ProfileSection move → `rm -rf .next` before tsc (§19 ledger).
7. Client components never import server-only modules (SessionItem can't be imported by client components — the ScheduleExplorer toggle design avoids this).
8. `getCurrentUser` never touches `notifPrefs`.
