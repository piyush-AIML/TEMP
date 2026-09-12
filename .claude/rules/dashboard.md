---
paths:
  - "src/app/dashboard/**"
  - "src/components/dashboard/**"
  - "src/lib/auth.ts"
  - "src/proxy.ts"
---

# Dashboard conventions

The authenticated, role-based `/dashboard` module for students, professors and admins. Detail lives
in [`docs/projects/dashboard/`](../../docs/projects/dashboard/) and
[`docs/architecture/layering.md`](../../docs/architecture/layering.md).

## Layering — the contract every mutation follows

```
validators/  zod schemas (dependency-free literal enums)
  → actions/   'use server' — ORCHESTRATORS ONLY: requireRole → zod → domain → revalidatePath
    → domain/  plain async fns taking an explicit actor id; ownership via domain/ownership.ts
      → db()   lazy Prisma singleton
```

Business logic belongs in `src/lib/domain/`, never in an action. Actions are thin. Integration
tests (when they exist) drive the domain layer directly, with no Clerk involvement.

Reads live in `src/lib/dashboard/` and are named for their actor — `getStudentEnrolledCourses`,
`getProfessorCourses`, `getAdminCourseList`. Keep that convention; it is what lets mutation actions
slot alongside without collisions.

## Rules that prevent real bugs

1. **No existence oracle.** Ownership failures return `"Course not found."` for *both* missing and
   not-owned resources. Never let the UI distinguish them.
2. **Never read `CompletionLog` for display.** It is a write-through ledger; the per-course monitor
   counts live `Task.status`. Reading the log is the drift trap.
3. **`auth()` throws on any route its proxy matcher does not cover** (Clerk v7). Keep
   `src/proxy.ts`'s `matcher` aligned with real routes. For fetchable API routes use the 401-JSON
   branch, **never** `auth.protect()` — that redirects, which is wrong for `fetch`.
4. **Role authority is Clerk `publicMetadata`, read fresh via `clerkClient()`** — never session-token
   claims, which go stale until re-sign-in. `getCurrentUser` is wrapped in React `cache()` so a
   layout's `requireRole()` and the page below it share one Clerk fetch and one mirror-upsert.
5. **All wall-clock time in the UI is IST** (`Asia/Kolkata`). Forms are labelled IST. Use
   `src/lib/ist.ts` client-side (it is deliberately not `server-only`) and
   `src/lib/validators/datetime.ts` for zod plus conversion. Server-side IST conversion is wrong —
   Node runs UTC.
6. **Guard server modules with `'server-only'`.** Zero client components may import them.
   `src/lib/ist.ts` and `src/lib/prisma-client.ts` are the deliberate exceptions.
7. **Course ownership is a join lookup, never a column.** Co-teaching is supported, so every check
   goes through `CourseProfessors` via `domain/ownership.ts`.
8. **Emails are trimmed and lowercased in the validator**, so DB lookups match
   case-insensitively by construction rather than by guessing stored casing.

## Data and UI conventions

- `User.id` **is** the Clerk user id; the row is a lazy mirror created on first dashboard hit.
  The seed script never creates users.
- Dashboard components are hand-rolled; shadcn supplies behaviour primitives only (see
  [`docs/design/system.md`](../../docs/design/system.md)).
- Result shape for every action is `ActionResult` in `src/lib/actions/types.ts`. Authorization
  failures throw (they redirect); ownership and validation failures return.
- Client uploads never pass through the server (Vercel's 4.5 MB body cap): mint a presigned grant,
  PUT straight to storage, then confirm. `src/lib/storage/` is provider-agnostic.
