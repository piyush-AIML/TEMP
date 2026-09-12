---
name: verify
description: Use when about to claim any change works, before committing, or when asked to verify/check/build/test the Educraft repo. Runs the mechanical gate and states what CANNOT be verified here, so success claims stay honest.
---

# Verifying a change in Educraft

Run the gate, then be explicit about the part of the change you have **not** verified. The second
half is the point: in this repo the gate passing is a much weaker signal than it looks.

## The gate

```bash
npx tsc --noEmit && npm run lint && npm run test && npm run build
```

All four must pass. `npm run build` runs `prisma generate && next build` and takes a minute or more;
it currently emits ~47 routes and must not print warnings.

For a single focused test, `npm run test <path>` is much faster than the whole suite.

## After renaming or deleting files

Wipe `.next` first — stale `.next/types` references deleted files and produces phantom type errors:

```bash
rm -rf .next && npx tsc --noEmit && npm run build
```

**Only with no dev server running.** A dev server whose `.next` is deleted loses route registrations
and serves 404s for existing dynamic routes until restarted. If a dev server may be live, ask the
owner to stop it first.

## What the gate does NOT cover

Be explicit about which of these apply to your change, and say so when reporting. Claiming a change
"works" because the gate passed is the single most common dishonest report in this repo.

| Not covered | Why | What to do instead |
|---|---|---|
| **Anything visual** | There is no `.env.local`; the dashboard cannot run locally, and the assistant never launches a browser | State plainly that visual QA is the owner's. For colour, assert contrast in a test. |
| **Anything requiring the database or Clerk** | No local DB, no Clerk keys | Say the path is unverified end-to-end. Drive the pure layer in a test where you can. |
| **Token-against-token colour pairs** | The palette test measures tokens against *canvases* only | Add an explicit pairing assertion. 34 green assertions once coexisted with a 2.64:1 button. |
| **Values that exist in only one of `colors.ts` / `globals.css`** | One is the test source, the other paints | Grep both. This has shipped broken once. |
| **Scroll and pinning behaviour** | No browser | Encode the geometry as pure functions and unit-test them. |
| **Route table changes** | `build` shows routes but does not compare them | Compare the emitted route list before and after. |

## Reporting

State, in order:

1. The exact command(s) run and their exit status.
2. What passed, quoting the real output rather than paraphrasing it.
3. **What was not verified, and why** — name the specific gap, not a generic caveat.
4. Any warning or noise in the output. Test output should be pristine; noise is a finding.

## Useful diagnostics

- `npx tsc --noEmit --listFilesOnly | grep <file>` — confirm a file is actually in the program. This
  caught a config file silently dropping out of typechecking after a rename.
- `npm run db:storage-smoke` — the read-only storage round-trip check.
- `/context` (in-session) — what actually loaded into context.
