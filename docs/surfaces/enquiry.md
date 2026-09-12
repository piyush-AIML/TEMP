How an enquiry becomes a lead: the `POST /api/enquiry` pipeline, the staged client form, and the known limits of the delivery path.

## The server pipeline — `POST /api/enquiry`

In order:

1. JSON parse.
2. zod v4 `enquirySchema` — role enum, name / email / phone, `programmeSlug`, `contactTime`, `message`, `consent: z.literal(true)`, and a honeypot field `website` with max length 0.
3. Honeypot check → silent `200` without persisting.
4. Per-IP rate limit — in-memory sliding window, **5 requests / 10 minutes**, with a `Retry-After` header.
5. Delivery, all three simultaneously:
   - `ENQUIRY_WEBHOOK_URL` fetch with a **5s `AbortSignal` timeout**, if the var is set.
   - Append to `data/enquiries.jsonl` (directory auto-created; gitignored — contains personal data).
   - Structured console log.

**The client never determines success — the server re-validates everything.**

## The staged form — `enquiry/EnquiryForm.tsx`

3 steps (About you → What you're looking for → Contact preferences + review) + a success state.

Per-step zod validation, error association, autocomplete attributes (`name`/`email`/`tel`), sr-only step announcements + heading focus on step change, back / continue, loading + server-error + retry states, and a honeypot field marked `sr-only`.

Consumed in two places: the modal (locked / general variants) and the contact page (`inline`). `EnquireButton` is the client wrapper used from server-rendered pages.

## Known limitation

Rate limiting is **per-instance, in-memory only** — it needs a shared store (Redis / Upstash) before any multi-instance deployment. See `docs/platform/blockers.md`.
