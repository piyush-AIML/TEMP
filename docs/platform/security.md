# Security & data handling

What the app does — and deliberately does not do — to protect user data, written as a list of guarantees and known limits.

- Enquiry API re-validates everything server-side; the client cannot force a success state.
- Honeypot field returns a silent `200` without persisting spam submissions.
- Rate limiting is in-memory and **per-instance only** — not safe as-is for a multi-instance deployment ([blockers.md](blockers.md) item 5).
- `data/enquiries.jsonl` contains personal data and is gitignored.
- No analytics and no error monitoring (Sentry or otherwise) are currently wired in — both are Tier A roadmap items, not present today. **Do not assume telemetry exists** ([../projects/roadmap.md](../projects/roadmap.md)).
- No secrets, API keys, or credentials are stored in the documented content model; environment variables are limited to those listed in [deployment-env.md](deployment-env.md).

## Related boundaries

- **Enquiry pipeline mechanics** (zod schema, honeypot, per-IP sliding window 5 req / 10 min, webhook + JSONL delivery): [../surfaces/enquiry.md](../surfaces/enquiry.md).
- **Dashboard auth boundary:** Clerk roles in `publicMetadata`, server-side `requireRole()` on every dashboard layout and Server Action, `src/proxy.ts` matcher coverage. The access-control audit (all 15 Server Actions gated, role layouts, `notFound()` access checks, zero client components importing server-only modules) lives with the dashboard project — [../projects/dashboard/](../projects/dashboard/).
- **Stored files:** private S3 bucket with public access blocked, IAM scoped to `materials/*`, access only via short-lived presigned URLs, no file bytes through our server — [deployment-env.md](deployment-env.md).
- **Invite-only sign-ups:** the app hides the sign-up link and `getCurrentUser()` rejects role-less users, but invitations alone do not restrict self-signup — Clerk's instance-level "Invite-only access mode" is the recommended launch setting ([../surfaces/shell-and-nav.md](../surfaces/shell-and-nav.md) carries the invite flow).
