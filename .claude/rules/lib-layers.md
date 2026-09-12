---
paths:
  - "src/lib/**"
  - "src/data/**"
---

# `src/lib` and `src/data` conventions

The server-side layers: validators, actions, domain, dashboard reads, notifications, storage — plus
the static content data. Full contract in
[`docs/architecture/layering.md`](../../docs/architecture/layering.md).

## Directory responsibilities

| Directory | Responsibility |
|---|---|
| `src/lib/validators/` | zod schemas. The edge where untrusted input is normalised. |
| `src/lib/actions/` | `'use server'`. **Orchestrators only.** No business logic. |
| `src/lib/domain/` | The business logic. Plain async functions, explicit actor ids, throws `DomainError`. |
| `src/lib/dashboard/` | Read/query layer, `'server-only'`, role-explicit names. |
| `src/lib/notifications/` | `builder.ts` is **pure**; `notify.ts` is `server-only` fan-out. |
| `src/lib/storage/` | Provider-agnostic `StorageProvider` interface + factory + S3 impl. |
| `src/data/` | Static content: pillars, programmes, navigation, insights, testimonials. |

## Rules

1. **Actions orchestrate; domain decides.** An action does `requireRole` → zod validate → call domain
   → `revalidatePath`. If you are writing an `if` about business state inside an action, it belongs
   in the domain.
2. **Domain functions take an explicit actor id** (`professorId`, `adminId`) rather than reading
   ambient auth. That is what makes them testable without Clerk.
3. **`DomainError` for anything the user should see.** Map it to `ActionResult.formError` in the
   action. Never let a raw Prisma error reach the UI — map `P2002` explicitly.
4. **zod v4 syntax.** Use `{ message }`, not `{ errorMap }`. `path` is `PropertyKey[]`. Do not import
   `SafeParseReturnType`; `flattenZodErrors` takes a structural type.
5. **`src/proxy.ts` must cover every `auth()` call site.** Clerk v7's `auth()` throws on routes the
   matcher does not cover.
6. **Static content stays in `src/data/`.** Adding a programme or pillar is a data edit plus whatever
   the compiler insists on — see the rules in
   [`design-tokens.md`](design-tokens.md#pillar-identity-is-registry-driven).

## Two traps specific to this repo

- **The `softDark`-style mismatch.** `src/design/` holds the light wash; the shipped dark wash lives
  in `globals.css`. A mapping that reads `soft → softDark` puts a near-white on a dark canvas and
  makes the corresponding assertion pass trivially. Check which file actually owns a value before
  wiring it.
- **`src/lib/prisma-client.ts` and `src/lib/ist.ts` are deliberately not `server-only`**, because the
  seed script and client-side calendar code need them. Everything else in `src/lib` that touches the
  database should be.
