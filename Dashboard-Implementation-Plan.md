# Student & Professor Dashboard — Implementation Plan

**Project:** Educraft — Dashboard module for existing Next.js website
**Live site:** temp-tau-opal.vercel.app
**Scope:** Add authenticated, role-based dashboards for Students and Professors on top of the existing marketing site, without disrupting the current public pages.

---

## 1. Goals & Non-Goals

### Goals
- One codebase, two role experiences: `Student` and `Professor` (with room for `Admin` later).
- Students see: their profile, enrolled courses, upcoming classes, notifications, and remarks/materials the professor has posted for their course(s).
- Professors see: their courses, upcoming classes, a notes/updates delivery system, upcoming meetings, and a coursework planner with completion tracking.
- Reuses the existing Next.js app, design system, and deployment (Vercel) — this is a new authenticated section (`/dashboard/...`), not a separate app.
- Data is real (persisted), not mocked — professors post something, students see it, with reasonable latency.

### Non-Goals (for v1)
- Video conferencing / live class hosting (link out to Zoom/Meet instead).
- Payments/billing.
- Native mobile app (responsive web is enough for v1).
- Complex grading/LMS features (quizzes, grade books) — flagged as a future phase.

---

## 2. Actors & Core Entities

**Actors:** Student, Professor, (future: Admin/Coordinator)

**Core entities (data model sketch):**

| Entity | Key fields |
|---|---|
| `User` | id, name, email, role (`student`/`professor`/`admin`), avatarUrl, createdAt |
| `Course` | id, title, code, vertical (Linguistics/AI-Tech/etc.), professorId, description |
| `Enrollment` | id, studentId, courseId, status, enrolledAt |
| `ClassSession` | id, courseId, startsAt, endsAt, mode (online/in-person), link/location, status |
| `Material` | id, courseId, uploadedBy, type (note/remark/file/link), title, body, fileUrl, visibility, createdAt |
| `Notification` | id, userId, type, title, body, relatedEntity, read (bool), createdAt |
| `Meeting` | id, professorId, title, withWhom (student/parent/other), startsAt, endsAt, link, status |
| `Task` (coursework planner) | id, courseId, title, description, dueDate, weight/priority, status (todo/in-progress/done), createdBy |
| `CompletionLog` | id, courseId, taskId, percentComplete, updatedAt — feeds the "completion monitor" |

This maps 1:1 onto normal relational tables (Postgres) — a good sign the domain is well-suited to a standard SQL schema rather than something exotic.

---

## 3. Tech Stack Decisions

You already have: **React + Next.js** (App Router, per the `_next/image` URLs on the live site) deployed on **Vercel**.

Recommended additions:

| Concern | Choice | Why |
|---|---|---|
| Auth | **NextAuth.js (Auth.js) v5** or **Clerk** | Both integrate cleanly with Next.js App Router and support role-based sessions. Clerk is faster to stand up with less boilerplate (roles via `publicMetadata`); NextAuth is free/self-hosted and gives you full DB control. Given this is a course project + freelance product, **Clerk** is the pragmatic pick unless you want to avoid a third-party auth vendor. |
| Database | **PostgreSQL** via **Neon** or **Supabase** (both have generous free tiers, work great with Vercel) | Relational data (users, courses, enrollments) fits SQL naturally; also unlocks Supabase's built-in realtime + storage if you want to lean on it instead of rolling your own. |
| ORM | **Prisma** | Type-safe queries, easy migrations, works well with Next.js Route Handlers/Server Actions. |
| File uploads (notes, materials) | **UploadThing** or **Supabase Storage** | Both integrate with Next.js easily; avoids hand-rolling S3 signing logic for a v1. |
| Realtime notifications | Start with **polling + DB-backed notifications table**; upgrade to **Supabase Realtime** or **Pusher** only if you need instant push. Don't over-engineer v1. |
| State/data fetching | **React Server Components + Server Actions** for most CRUD; **TanStack Query** on the client only where you need optimistic updates or polling (e.g., notification bell). |
| Styling/UI | Reuse your existing Tailwind setup + component library from the marketing site (keeps visual consistency) — add **shadcn/ui** for dashboard-specific widgets (tables, calendars, modals) if not already present. |
| Calendar/scheduling UI | **react-big-calendar** or **FullCalendar** for the "upcoming classes / meetings" views. |
| Forms | **React Hook Form + Zod** for professor-side forms (creating tasks, posting materials, scheduling classes). |

> Rule of thumb: don't introduce a new framework for the dashboard. Extend the existing Next.js app with a new route group (`app/(dashboard)/...`) so navigation, theming, and deployment stay unified.

---

## 4. High-Level Architecture

```
apps/web (existing Next.js app)
├── app/
│   ├── (marketing)/          ← existing public site, untouched
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── layout.tsx        ← role-aware shell (sidebar differs per role)
│   │   ├── student/
│   │   │   ├── page.tsx              (overview)
│   │   │   ├── courses/
│   │   │   ├── schedule/
│   │   │   ├── notifications/
│   │   │   └── profile/
│   │   └── professor/
│   │       ├── page.tsx              (overview)
│   │       ├── courses/
│   │       │   └── [courseId]/
│   │       │       ├── materials/
│   │       │       ├── planner/
│   │       │       └── students/
│   │       ├── schedule/
│   │       ├── meetings/
│   │       └── profile/
│   └── api/                  ← Route Handlers (webhooks, file callbacks)
├── lib/
│   ├── auth.ts
│   ├── db.ts (Prisma client)
│   ├── actions/              ← Server Actions per domain (courses.ts, tasks.ts, notifications.ts…)
│   └── validators/           ← Zod schemas
├── prisma/
│   └── schema.prisma
└── components/
    ├── dashboard/            ← shared dashboard widgets (StatCard, ScheduleList, NotificationBell…)
    ├── student/
    └── professor/
```

**Route protection:** middleware checks session + role; `/dashboard/student/*` redirects non-students, `/dashboard/professor/*` redirects non-professors.

**Data flow for a typical feature (e.g., professor posts a remark):**
1. Professor fills a form on `professor/courses/[id]/materials` → Server Action `createMaterial()`.
2. Server Action writes to `Material` table, then inserts `Notification` rows for every enrolled student.
3. Student dashboard's notification bell polls (or subscribes) and shows the new remark; the course page lists it under "Materials & Remarks."

---

## 5. Multi-Stage Roadmap

### Stage 0 — Foundations — ✅ **DONE 2026-09-04** (shipped; details absorbed into EDUCRAFT_PRODUCTION.md §24.3–24.8)
- ~~Add Prisma + connect to Postgres~~ → done: Prisma 7.10 + Neon, `prisma7.config.ts`, driver-adapter client in `src/generated/prisma`.
- ~~Schema~~ → migrated live (`npm run db:migrate`).
- ~~Clerk with two roles~~ → done: Clerk 7.9, roles via publicMetadata; DB users sync lazily (upsert + adopt-by-email). Demo accounts: professor `piyush.ghosal.ai@gmail.com`, student `pika38212@gmail.com`.
- ~~`(dashboard)` route group shell~~ → **corrected: real `src/app/dashboard/` folder** (route groups never add URL segments — §18 rule 8 in the master). `src/proxy.ts` is the auth boundary; `/dashboard` dispatches by role there. Seed (`prisma/seed.ts`, email-keyed/idempotent) attached 5 courses + enrollments + classes to the demo accounts.

**Exit criteria: MET** — both roles verified landing on correctly-scoped shells.

### Stage 1 — Student Core — ✅ **DONE 2026-09-04** (details absorbed into EDUCRAFT_PRODUCTION.md §24.8)
- ~~Student profile page~~ → view mirror (identity is Clerk-owned) + embedded Clerk account portal (`<UserProfile routing="hash">`); DB row's `createdAt` labelled "Dashboard member since".
- ~~"My Courses"~~ → `/dashboard/student/courses` — ACTIVE enrollments as pillar-accented cards (vertical → programme via `coursePillar.ts`).
- ~~Per-course pages~~ → new `/dashboard/student/courses/[courseId]` — access-gated (notFound for non-enrolled), upcoming classes + materials feed.
- ~~"Upcoming Classes"~~ → `/dashboard/student/schedule`, IST-day grouped via `Intl.formatToParts` (never UTC getters); overview shows real counts + "Up next".
- ~~"Materials & Remarks" feed~~ → read-only `MaterialFeed`; seed now adds 3 NOTE/REMARK/LINK rows per course (idempotent count check).
- Query layer: `src/lib/dashboard/{format,sessions,courses,materials,profile}.ts` — server-only reads, role-explicit `getStudent*` names (Stage 2 mutations go in `lib/actions/` without collisions). `getCurrentUser` React-`cache()`-wrapped (one Clerk fetch/upsert per request; closes first-visit P2002 race).

**Exit criteria: MET** — student sees real enrollments + upcoming-class schedule end-to-end from the DB; lint/tsc/build ✓, all query shapes smoke-checked against live Neon.

### Stage 2 — Professor Core — ✅ **DONE 2026-09-05** (details absorbed into EDUCRAFT_PRODUCTION.md §24.8)
- ~~Professor courses + roster~~ → per-course management tabs (Overview/Roster/Sessions/Materials).
- ~~Create/edit/cancel ClassSession~~ → first Server Actions (`src/lib/actions/`) over a testable domain layer (`src/lib/domain/`, ownership via `CourseProfessors`); IST datetime-local contract (`validators/datetime.ts` + client `lib/ist.ts`); revalidatePath both role layouts.
- ~~Materials upload (text + file)~~ → composer Note/Remark/Link/File; **files via UploadThing strictly behind the provider-agnostic `src/lib/storage/` interface** (schema stores provider + opaque key + `fileMeta Json`, never URLs; direct-to-storage PUT keeps file bytes off our server — Vercel 4.5 MB cap; S3 migration = row-level provider/key swap only).
- ~~Notification bell (polling)~~ → `Notification` fan-out (`lib/notifications/builder.ts` pure + `notify.ts`; prefs honored from day one via early `User.notifPrefs` migration), `/api/dashboard/notifications` route handler (+ proxy matcher extended with a 401 branch), `NotificationBell` (30 s poll, `document.hidden` pause) in both shells, real notifications pages.
- Storage smoke gate (`npm run db:storage-smoke`) implemented — **pending the real `UPLOADTHING_TOKEN`** before the file path is field-verified.

**Exit criteria: MET (code + DB gates); visual E2E + storage token pending the owner's checks.**

### Stage 3 — Meetings & Coursework Planner (1–1.5 weeks)
- Professor "Meetings" — schedule/view upcoming meetings (with students, parents, or colleagues); simple calendar view.
- Coursework Planner: professor creates `Task`s per course with due dates and status.
- Completion Monitor: a progress view (e.g., % of tasks done per course, simple bar/donut chart) aggregating `CompletionLog`/`Task.status`.

**Exit criteria:** a professor can plan a course's tasks and see completion % update as tasks move to "done."

### Stage 4 — Notifications, Polish & Cross-Cutting Concerns (1 week)
- Notification preferences (which events notify: new material, new class, task due soon).
- Empty states, loading skeletons, error boundaries across dashboard pages.
- Mobile responsiveness pass (sidebar → bottom nav or drawer on small screens).
- Access control audit: confirm students can never hit professor-only Server Actions/routes (test by hitting URLs directly).

**Exit criteria:** dashboard feels coherent, doesn't break on mobile, and role boundaries are enforced server-side (not just hidden in the UI).

### Stage 5 — QA, Deployment, Handover (0.5–1 week)
- Write a handful of integration tests for the critical paths (enroll → see class; post material → student notified; create task → completion % updates).
- Load seed/demo data for a walkthrough.
- Deploy to a preview branch on Vercel, connect to a staging DB, get feedback.
- Merge to production; run the same Prisma migration against the prod DB.

**Exit criteria:** feature is live on the real domain behind auth, with a rollback plan (feature-flag the dashboard nav link if needed).

### Stage 6 (Future / Post-v1) — Enhancements
- Real-time push via Supabase Realtime/Pusher instead of polling.
- Parent view (read-only window into a student's dashboard) — ties into Educraft's existing "For Parents" audience.
- Attendance tracking per `ClassSession`.
- Gradebook / assessment scores.
- Calendar sync (Google Calendar / .ics export) for classes and meetings.
- Admin console to manage users/courses/enrollments in bulk.

---

## 6. Suggested API Surface (Server Actions)

Grouped by domain — implement as Server Actions unless a Route Handler is specifically needed (webhooks, file upload callbacks):

- `courses.ts`: `getMyCourses()`, `getCourseById()`, `createCourse()` (professor), `enrollStudent()` (admin/professor)
- `sessions.ts`: `getUpcomingClasses()`, `createClassSession()`, `updateClassSession()`, `cancelClassSession()`
- `materials.ts`: `getCourseMaterials()`, `createMaterial()`, `deleteMaterial()`
- `notifications.ts`: `getMyNotifications()`, `markAsRead()`, `createNotification()` (internal, called by other actions)
- `meetings.ts`: `getUpcomingMeetings()`, `createMeeting()`, `updateMeeting()`
- `tasks.ts`: `getCourseTasks()`, `createTask()`, `updateTaskStatus()`, `getCourseCompletion()`
- `profile.ts`: `getProfile()`, `updateProfile()`

---

## 7. Suggested Component Inventory

**Shared:** `DashboardShell`, `Sidebar` (role-aware), `NotificationBell`, `StatCard`, `EmptyState`, `DataTable`, `ScheduleList`, `CalendarView`

**Student-specific:** `EnrolledCourseCard`, `MaterialFeed`, `ProfileForm`

**Professor-specific:** `CourseRosterTable`, `ClassSessionForm`, `MaterialComposer`, `MeetingScheduler`, `TaskBoard` (Kanban-style: todo/in-progress/done), `CompletionChart`

---

## 8. Risks & Things to Decide Early

1. ~~**Auth provider lock-in**~~ — **RESOLVED 2026-09-04: Clerk** (accepted: vendor lock-in + per-MAU cost past free tier). Role = Clerk `publicMetadata`, single source of truth; DB `User` rows sync lazily (upsert + adopt-by-email), webhooks deferred to Stage 5.
2. **Notification delivery** — polling is simple and "good enough" for a v1 with modest user counts; don't build websockets until you actually feel the lag. (unchanged)
3. **File storage limits** — if professors upload large files (slides, PDFs), pick a storage provider with clear size limits and CDN delivery from day one. (decision deferred to Stage 2)
4. ~~**Multi-course professors / multi-professor courses**~~ — **RESOLVED 2026-09-04: many-to-many** (`CourseProfessors` join table). Co-taught courses supported from day one.
5. **Existing marketing site coupling** — keep the dashboard route group isolated (separate layout, separate data fetching) so a bug in the dashboard can't take down the public marketing pages that already drive enquiries.

---

## 9. Suggested Timeline Summary

| Stage | Duration | Output |
|---|---|---|
| 0 — Foundations | 0.5–1 wk | Schema, auth, empty role-aware shells |
| 1 — Student Core | 1 wk | Profile, courses, upcoming classes, materials feed |
| 2 — Professor Core | 1–1.5 wk | Course roster, scheduling, materials upload, notifications |
| 3 — Meetings & Planner | 1–1.5 wk | Meetings calendar, task planner, completion monitor |
| 4 — Polish | 1 wk | Responsiveness, empty/error states, access-control audit |
| 5 — QA & Deploy | 0.5–1 wk | Tests, staging, production release |

**Total v1 estimate:** ~5.5–7 weeks at a steady, focused pace (compress if working full-time; stretch if building around coursework/freelance clients).

---

## 10. Next Action

**Stages 0–2 shipped 2026-09-04/05** (absorbed into EDUCRAFT_PRODUCTION.md §24.8; working files deleted per lifecycle). **Next: Stage 3 — Meetings & Planner** (1–1.5 wk), following the approved master plan (`.claude` plan file, Stages 2–5):
- Deps: `react-big-calendar@^1.20.0` (React 19 OK) + `date-fns@^4.4.0`; localizer at module scope; `.calendar-shell` token overrides in `globals.css` (light/dark); default agenda < `lg`.
- Meetings: queries/validators/domain/actions (`withWhom` enum, studentId must be one of the professor's students), `createStudentNotification(MEETING)`; `professor/meetings` real (scheduler + list + combined calendar).
- Planner: `tasks.ts` queries/validators/domain/actions; `TaskBoard` (3 status columns, no drag lib), `TaskForm`, `CompletionBar` — % from `Task.status` only, `CompletionLog` reserved (documented); Planner tab joins the professor course page.
- Student invisibility for meetings/tasks confirmed as v1 scope; students learn of meetings via MEETING notifications only.
- Storage smoke gate (`npm run db:storage-smoke`) remains pending the owner's real `UPLOADTHING_TOKEN` — run it once pasted (before field-testing file uploads).
