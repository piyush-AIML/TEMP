# Layering & engineering constraints

Which directory owns which responsibility, the thin-actions/testable-domain contract, and the hard-won rules that must not regress.

## The layer map

| Path | Owns |
|---|---|
| `src/app/dashboard/` | A **real folder**, never a route group — groups do not add URL segments (rule 8). `layout.tsx` carries `ClerkProvider` + noindex robots; there is no page at `/dashboard` itself, role dispatch happens in `proxy.ts`. |
| `src/app/**/page.tsx`, `layout.tsx` | Server components. Reads go through `src/lib/dashboard/*` or the content data layer. |
| `src/proxy.ts` | The auth boundary. Next 16 name — `middleware.ts` is deprecated. |
| `src/lib/auth.ts` | `getCurrentUser` (`cache()`-wrapped) and `requireRole()`. |
| `src/lib/actions/` | `'use server'` entry points — **orchestrators only**. `sessions.ts` · `materials.ts` · `notifications.ts` · `invitations.ts` · `courses.ts`; the shared `ActionResult` type lives in `actions/types.ts`. |
| `src/lib/domain/` | Plain async functions holding the actual business rules. `ownership.ts` · `courses.ts` · `meetings.ts` · `tasks.ts` · `materials.ts`. No Clerk, no `'use server'`. |
| `src/lib/dashboard/` | The read/query layer — `'server-only'`. `courses.ts` · `sessions.ts` · `materials.ts` · `profile.ts` · `format.ts` · `notifications.ts` · `admin.ts`. |
| `src/lib/validators/` | zod v4 schemas and policy constants: `auth.ts` · `datetime.ts` · `courses.ts` · `preferences.ts`. |
| `src/lib/notifications/` | `builder.ts` (pure) + `notify.ts` (server-only fan-out). |
| `src/lib/storage/` | Provider-agnostic file storage: `types.ts` (interface) · `s3.ts` (adapter) · `index.ts` (factory). |
| `src/lib/ist.ts` | Timezone helpers shared by client **and** server — deliberately not `'server-only'`. |
| `src/lib/prisma-client.ts` · `src/lib/db.ts` | Prisma factory (driver adapter + `ws`) and the client accessor. |
| `src/components/dashboard/` | Hand-rolled dashboard UI. `coursePillar.ts` holds the literal pillar→class maps. |
| `src/components/ui/` | Unstyled shadcn **behaviour** primitives. `src/components/educraft/ui/` keeps the branded hand-rolled components. |
| `prisma/` | `schema.prisma` · `seed.ts` (email-keyed, idempotent). |
| `src/generated/prisma/` | Generated Prisma client — gitignored build output, excluded from ESLint. |

## Thin actions + testable domain

The central contract. `src/lib/actions/` are **orchestrators only**, and follow this exact order:

1. `requireRole('professor')` — the gate.
2. zod v4 validation of the input.
3. Call into `src/lib/domain/` — plain async functions taking an **explicit actor id** (e.g.
   `professorId`), with ownership resolved through `CourseProfessors` via `domain/ownership.ts`.
4. `revalidatePath` for the affected role layouts (enrolment revalidates **both** role layouts;
   admin course creation revalidates admin).

Rules that make the split real:

- The domain layer returns `DomainError` codes, not thrown provider errors.
- **No existence oracle:** a missing course and a not-owned course both produce `"Course not found."`
  — the caller must not be able to distinguish them.
- Because the domain layer takes an explicit actor id and never touches Clerk, **integration tests
  drive the domain layer directly** — no auth mocking. That testability is what the split buys.
- The action's return shape is `ActionResult`, declared in `src/lib/actions/types.ts`:
  `{ok:true,message?} | {ok:false,fieldErrors?|formError?}`.
- Validation lives at the edge (zod v4 in the action/route); the domain layer trusts its typed
  inputs but still enforces ownership and invariants.

### Domain error codes in use

`USER_NOT_FOUND` · `USER_NOT_STUDENT` · `USER_NOT_PROFESSOR` · `ALREADY_ENROLLED` ·
`COURSE_CODE_TAKEN` · `COURSE_NOT_FOUND` · `NOT_ENROLLED` · `PROFESSOR_NOT_ASSIGNED` ·
`PROFESSOR_RESOLUTION_FAILED` · `STUDENT_NOT_IN_ROSTER`

### Domain-layer rules worth not re-learning

- `enroll`'s read-then-write runs inside a `$transaction`.
- **P2002** (unique constraint: course code, composite keys) is mapped to a domain error
  everywhere — no raw 500s on races or duplicate emails.
- Professor emails are deduped and capped (8).
- Course creation is **all-or-nothing**, with per-email reasons enumerated
  (`"Could not assign: x@y.com (no Educraft account yet…); …"`). Adding a professor to an *existing*
  course is **partial success** with honest copy (added / already-assigned / failed).
- `deleteCourseForAdmin` collects FILE keys → best-effort storage deletes → row delete (FK cascades).
  Accounts are never touched.
- `unenrollStudentForProfessor` is a **soft** `DROPPED`, reactivatable.
- Emails are normalized (trim + lowercase) by the validators, so DB lookups are case-insensitive by
  construction.
- `domain/meetings.ts` verifies the linked student is on the professor's roster
  (`STUDENT_NOT_IN_ROSTER`) before writing.
- The completion monitor counts **live `Task.status`**, never `CompletionLog`. The log is a
  write-through ledger (`domain/tasks.ts` upserts `percentComplete` 0/50/100 on status change) and
  reading it back is the drift trap.

## The read layer

`src/lib/dashboard/*` is `'server-only'` and uses **role-explicit names** —
`getStudentEnrolledCourses`, `getStudentUpcomingSessions`, `getStudentCourseWithAccess`,
`getStudentStats`, `getProfileRecord`, `getCourseMaterials` — so professor reads and the mutation
actions under `lib/actions/` slot alongside without collisions.

- Every query scopes by **ACTIVE enrollment** server-side via relation filters; the course-detail
  page calls `notFound()` for anything else. A read never trusts the caller.
- `generateMetadata` and the page share one access-checked lookup through a module-level `cache()`;
  Next 16 async `params` are awaited in both.
- `getCurrentUser` is wrapped in React `cache()`, so a layout's `requireRole()` and its page share
  one Clerk fetch and one mirror-upsert per request — which also closes a first-visit P2002 race
  between concurrent upserts.

## Validation, policy and shared law

- **zod v4 syntax** is mandatory (rule 3): `{ message }` not `{ errorMap }`, `path` is
  `PropertyKey[]`, and `flattenZodErrors` takes a structural type rather than
  `SafeParseReturnType`.
- **Single source of policy:** `INVITE_ROLES_BY_INVITER` in `src/lib/validators/auth.ts` —
  `admin` → professor + student; `professor` → student only. `inviteInputSchema` validates email +
  role, and **no role strings live anywhere else**. `createInvitation`
  (`src/lib/actions/invitations.ts`) re-checks the requested role against the inviter's allowed list
  after validation, so a tampered request cannot escalate.
- **The datetime contract (all forms):** `<input type="datetime-local">` values are **IST wall
  times** — regex-validated, range-checked lexicographically, and converted through
  `istWallTimeToUtc` (`src/lib/validators/datetime.ts`). Prefills convert UTC → IST wall time
  client-side via `src/lib/ist.ts`. The DB stores **UTC**; display is Asia/Kolkata with an explicit
  IST label from module-cached `Intl.DateTimeFormat` instances in `format.ts`. Day-grouping and
  Today/Tomorrow labels derive the IST calendar date through `Intl.formatToParts` — **never UTC
  `Date` getters** (a 23:30 UTC session is 05:00 the next day in IST). Because react-big-calendar is
  timezone-naive, the client maps every UTC ISO event through `utcIsoToIstLocalDate` to a local
  `Date` whose wall components are the IST ones; **server-side conversion of RBC events would be
  wrong**, because Node runs in UTC.
- Shared-by-both-sides code (`src/lib/ist.ts`) must **not** be marked `'server-only'`; conversely,
  any module a client component must not import gets that guard, and the build fails if one does.

## Storage: provider-agnostic by construction

- `src/lib/storage/types.ts` — the `StorageProvider` interface:
  `createUpload` / `verifyUpload` / `getDownloadUrl` / `delete`, plus `StorageNotConfiguredError`.
- `src/lib/storage/s3.ts` — `S3Provider`, **the only `@aws-sdk/*` import in the codebase**.
- `src/lib/storage/index.ts` — `getStorage()` factory keyed on `STORAGE_PROVIDER`. Unset or unknown
  yields `DisabledStorage` with honest UI copy rather than an error.
- DB rows store `fileProvider` + an opaque `fileKey` + `fileMeta Json {name,size,mime}` —
  **never URLs**.
- A future provider swap is a new adapter plus `scripts/storage-migrate.ts` updating provider/key
  rows only. Nothing in the domain, DB or UI layer changes.
- Client uploads never touch our server (Vercel's 4.5 MB body cap): `FileDropzone` mints a token via
  `createUploadToken` (**ownership checked before signing**) → the browser PUTs raw bytes to the
  presigned URL → `completeFileUpload` verifies, persists and notifies.

Provider credentials, bucket setup and environment variables are operational, not architectural —
see `platform/deployment-env.md`.

## Notifications: pure builder, server-only fan-out

- `src/lib/notifications/builder.ts` is **pure**: `buildNotificationRows(recipients, event)` decides
  who gets what, honouring per-type preferences via `NOTIFICATION_PREF_MAP`; `parseNotifPrefs` is
  shape-drift-safe (absent key = ON).
- `src/lib/notifications/notify.ts` is **server-only**: `createCourseNotifications` (one
  ACTIVE-enrollment query including prefs → `createMany`) and `createStudentNotification`.
- Keeping the *decision* pure and only the *write* server-side is the same testability trade as the
  action/domain split.
- The HTTP surface is `GET/POST /api/dashboard/notifications` (nodejs runtime) with
  ownership-scoped mark-read. The proxy matcher covers `/api/dashboard/:path*` with a **401-JSON
  branch — never `auth.protect()` for fetch routes**.
- Delivery is **polling by design** — no websockets until the lag is actually felt. The bell polls
  immediately and then every 30 s, pauses on `document.hidden`, and lives in both shells' headers.
- Events carry honest IST bodies via `formatSessionRange`.

## Auth and route protection

- `src/proxy.ts`: Clerk, matcher `'/dashboard/:path*'`, `signInUrl: '/sign-in'`. It redirects
  signed-out users and dispatches `/dashboard` to the caller's role root (`ROLE_HOME` /
  `ROLE_LANDING`).
- Every dashboard page and layout additionally calls `requireRole()` (`src/lib/auth.ts`)
  server-side — a non-`student` hitting `/dashboard/student/*` is redirected to their own role root.
  **UI hiding is never the boundary.**
- Role lives in Clerk `publicMetadata` and is read server-side via `clerkClient()` — **never session
  token claims** (claims go stale until re-sign-in). DB `User` rows mirror it via lazy upsert +
  adopt-by-email.
- `auth()` **throws** on any route the matcher did not cover (Clerk v7) — keep the matcher aligned
  with real routes.
- **Access-control invariants** (verified by audit, and the standard to keep): every Server Action
  gated by the correct `requireRole`; role layouts gate every subtree; both `[courseId]` pages
  additionally `notFound()` via `cache()`'d access-checked lookups in `generateMetadata` *and* the
  page; **zero client components import server-only modules**. Recorded caveats: an
  admin/course-listing page must gate *before* calling `getCourseMaterials`; `professor/invite` and
  `admin/invite` trust the layout only, which is acceptable because they read no role-sensitive
  data.

## Worked example — professor posts a remark

Form on `professor/courses/[id]/materials` → Server Action `createMaterial()` → `requireRole` →
zod → `domain/materials.ts` writes `Material` **and** inserts `Notification` rows for every enrolled
student → the student's bell polls and shows it, and the course page lists it under
Materials & Remarks. One action, one domain call, two persistence effects, zero client-side
trust.

## Engineering constraints

Hard-won, do-not-regress rules (source of the fixed-bug ledger in §19).

*Section numbers inside the rules below are the original master-document numbering: §26 is the
Landing Redesign project (`projects/landing-redesign/`), §19 the fixed-bug ledger
(`platform/history.md`), §6 the design system (`design/system.md`).*

1. **`overflow-hidden` on a pinned-section ancestor breaks `position: sticky`** — it becomes the
   sticky element's scroll box. `StudentJourney` and `ProgrammeExplorer` must keep section-level
   overflow visible; overflow handling belongs only on the sticky inner element.
2. **Hydration:** anything derived from next-themes' `theme` (or any other post-mount state) inside
   SSR'd markup must be gated on a `mounted` flag.
3. **zod v4 API:** use `{ message }`, not `{ errorMap }`; `path` is `PropertyKey[]`; don't import
   `SafeParseReturnType` — `flattenZodErrors` takes a structural type.
4. ~~**R3F:** imperative scene-graph mutation inside `useFrame` needs
   `// eslint-disable-next-line react-hooks/immutability` — this is the canonical pattern here, not
   React state.~~ **SUPERSEDED 2026-09-12 — R3F is retired (§26).** The equivalent rule for the
   redesign: **GSAP writes styles to the DOM directly and must never be mixed with Motion on the
   same property of the same element** (§26 §3.2).
5. **Tailwind 4:** only literal class names in source — no dynamically constructed class strings
   (§6).
6. **tw-animate-css:** `animate-in` keyframes only fire on key-remount (used for stage/tab
   crossfades).
7. ~~`THREE.Clock` deprecation warning is emitted by R3F 9.7.0 internals (latest stable) —
   harmless, disappears with R3F's next patch. Do not upgrade to a 10.0 canary just to silence
   it.~~ **OBSOLETE 2026-09-12 — R3F is retired, so the warning disappears with it (§26).**
8. **Route groups never contribute URL segments** — `(dashboard)/professor/page.tsx` is served at
   `/professor`, and a page.tsx at a group root resolves at the group's URL root
   (`(dashboard)/page.tsx` collides with `(site)/page.tsx` at `/`). To own a URL prefix, use a
   **real folder** (`dashboard/`). Also: Clerk v7 `auth()` **throws** on any route its
   middleware/proxy matcher didn't cover — keep the auth matcher aligned with real routes.

**Where the UI layer enforces rule 5:** `src/components/dashboard/coursePillar.ts` maps programme
verticals to names and pillar accents with literal class maps only (unknown vertical → neutral
sky/indigo fallback), and `src/lib/pillarStyles.ts` is the site-wide equivalent. A constructed class
string such as `` `bg-ec-${x}` `` generates no CSS at build time.

## Boundaries that protect the static site

The marketing pages drive enquiries; a dashboard failure must never reach them.

- The dashboard is a **fully isolated** segment — separate layout and separate data fetching. A
  dashboard bug cannot take down the marketing pages.
- **Keep the root layout and the `(site)` group static.** Auth libraries, DB clients and providers
  belong at the dashboard layout level (or behind middleware whose matcher excludes public routes)
  — **never in root `layout.tsx`**. One dynamic dependency in the root would silently turn every
  page dynamic.
- **Middleware scope:** the auth matcher must exclude `/`, the `(site)` routes and `/api/enquiry`
  from checks. Session/role checks belong on `/dashboard/*` and `/api/dashboard/*`.
- `lib/actions/*` + `lib/validators/*` is the agreed home for new server-side code; it fits the
  existing `src/lib/` shape rather than inventing a parallel tree.

## Directory ownership & organisation conventions

- **Providers have two homes today:** `EnquiryModalProvider` in `src/context/` and `ThemeProvider`
  in `src/components/theme/`. The architecture review recommended consolidating both into a
  top-level `src/providers/`; that consolidation has **not** been done. Pick one home deliberately
  before adding another provider.
- **Hook locality:** `three/hooks/useSceneActive` sat under its feature while the other six hooks
  live in `src/hooks/`. The review's rule stands — either "hooks live next to their feature" or one
  top-level `hooks/`; choose once. (The `three/` instance disappears with the redesign; the question
  does not.)
- **No barrel/index files** anywhere. Acceptable at the current component count; revisit as the
  dashboard's component inventory grows.
- **Naming trap:** root `data/` (the runtime lead log, `enquiries.jsonl`) and `src/data/` (the
  content source) share a word but not a meaning. Harmless while one is gitignored; rename the
  runtime directory (e.g. `runtime/`) if it survives.
- **Cards are a CSS class, not a component:** the site styles cards with `card-surface`.
  `components/educraft/ui/Card.tsx` is not the mechanism — the review found it had no importers.
  Adopt it where the component adds value, or delete it; don't leave both.
- **Verify before relying on `useSectionProgress`:** it is documented among the shipped hooks, but
  the review found it had no consumers.
- **tsconfig is loose in spots:** `strict: true` but `noImplicitAny: false`, `allowJs: true` in a
  100% TypeScript codebase, `no-unused-vars` off in ESLint. Each was pragmatic once; tightening them
  is a cheap safety net, deliberately deferred.
- **UI component homes:** `components/ui/` holds unstyled shadcn behaviour primitives (Dialog,
  Accordion, Tabs, Popover/Tooltip — adopted for correct focus traps, `aria-expanded`, roving focus
  and portals); `components/educraft/ui/` keeps the branded hand-rolled components. **shadcn
  supplies behaviour, never look**, and it inherits the Educraft palette for free because
  `globals.css` already defines the full shadcn variable contract (`--background`, `--card`,
  `--primary`, `--ring`, …) and `components.json` is configured. `react-hook-form` is deliberately
  **not** adopted — `useActionState` + `ActionResult` + zod-at-the-edge is the settled contract.
  (This supersedes the review's open "install shadcn or delete `components.json`" question.)

## Architectural invariants to protect

- Homepage and all marketing routes live under the single `(site)` group wrapping one shell; the
  root `layout.tsx` holds only fonts, theme, metadata and JSON-LD. No stray routes outside groups
  except the needed `api/enquiry`.
- `components/educraft/*` is a set of feature folders with consistent PascalCase components and
  default exports; landing sections map 1:1 to homepage sections.
- `design/` holds JS sources of truth (`colors`, `typography`, `motion`, `tokens`); `globals.css`
  maps them to runtime CSS variables. A textbook Tailwind 4 layering — keep the mapping in one
  direction.
- Content flows `src/types/index.ts` → `src/data/*` → content components. Adding content is a data
  edit, never a component edit.
- The `@/* → ./src/*` alias is used consistently; no deep relative-import tangles.
- Decorative backgrounds live once, in `graphics/DecorativeSystems.tsx`, not copied per section.
- Reduced motion is enforced globally at the CSS level — the correct systemic choice, not a
  per-component JS branch.

**Now superseded:** the review's praise for the single coordinated WebGL canvas system is moot — the
`three/` tree, `@react-three/fiber`, `@react-three/drei`, `@types/three`, `useSceneActive` and the
React `~19.2.8` pin are all removed by the landing redesign. Everything else in the list above
stands.

## Unresolved conflicts on record

Carried forward rather than silently resolved, because the code and the documentation currently
disagree:

1. **`data/enquiries.jsonl` cannot be a production delivery channel.** The route handler `mkdir`s
   and appends at the repo root; on a serverless host the filesystem is ephemeral and read-only.
   Enquiries are only genuinely delivered when `ENQUIRY_WEBHOOK_URL` is set, yet the pipeline is
   documented as *webhook **plus** JSONL*. The review's recommendation: treat the JSONL as a
   dev-only fallback and make the webhook (or a hosted store) the sole production channel. The
   decision is still open.
2. **`tsconfig.json` includes `.next/dev/types/**/*.ts`**, which is why file deletions poison
   `tsc`/build and the `rm -rf .next` ritual exists. The review recommends dropping that glob so the
   ritual stops being needed; the verification workflow still mandates the wipe. Unresolved.
3. **The audience count** is inconsistent between the structural-facts line (4) and the site's three
   entry doors — recorded in [`data-model.md`](data-model.md).

## See also

- [`routes.md`](routes.md) — what each URL serves.
- [`source-layout.md`](source-layout.md) — the physical tree these layers map onto.
- [`data-model.md`](data-model.md) — the content model.
- `projects/landing-redesign/` — the redesign that supersedes rules 4 and 7 and retires the
  `three/` tree.
- `platform/history.md` — the fixed-bug ledger these rules came from.
