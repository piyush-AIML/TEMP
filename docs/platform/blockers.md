# Production blockers

Pre-launch stakeholder inputs — these take precedence over all roadmap work.

1. **Testimonials** (`data/testimonials.ts`) — current 3 entries are clearly-marked SEED content; must be replaced with real, verified, consented quotes before launch. The landing redesign leans on testimonials harder as proof, which makes replacement more urgent, not less — see [../projects/landing-redesign/spec.md](../projects/landing-redesign/spec.md).
2. **Env vars** — `NEXT_PUBLIC_SITE_URL` (real domain) and `ENQUIRY_WEBHOOK_URL` (CRM/email delivery) are unset in the documented baseline. Both are documented in [deployment-env.md](deployment-env.md).
3. **Business details** — `hello@educraft.com`, `+91 80 4567 8900`, Bangalore, India (footer, contact page, structured data) — `VERIFY`, not yet stakeholder-confirmed.
4. **Social handles** — intentionally absent from the footer (no dead `href="#"` links) until real handles exist.
5. **Rate limiter** — per-instance in-memory only; needs a shared store (Redis/Upstash) before any multi-instance deployment. Also tracked as roadmap Tier D item 18 in [../projects/roadmap.md](../projects/roadmap.md); the mechanism itself is in [security.md](security.md) and [../surfaces/enquiry.md](../surfaces/enquiry.md).

## Carried from the architecture review (2026-09-04) — not in the numbered list above

**A1 — `data/enquiries.jsonl` append breaks on serverless. 🟡→🔴 at launch.**
The route handler `mkdir`s and appends to `data/` at repo root. Locally that works; on Vercel the filesystem is **ephemeral and read-only** (writes fail or vanish per invocation). Today enquiries are only *really* delivered when `ENQUIRY_WEBHOOK_URL` is set — but the JSONL is described as a delivery channel, which it cannot be in production.

→ Before/at launch: treat JSONL as a **dev-only** fallback (or write to `/tmp` in serverless and accept loss), and make the webhook (or a hosted store) the sole production channel.

The review's closing judgement: the two things to *not* defer past launch are A1 and the numbered blockers above (env vars, real webhook). The rest of that review is recorded in [history.md](history.md).

## Open `VERIFY` items

Only the business contact details (item 3, and the same footer/contact/structured-data copy) remain — a stakeholder input, not a code matter. The repository slug `piyush-AIML/TEMP`, the file tree, and the route inventory are confirmed from the live repository and carry no outstanding `VERIFY`.
