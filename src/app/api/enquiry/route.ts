import { NextResponse } from 'next/server';
import { appendFile } from 'fs/promises';
import path from 'path';
import { enquirySchema } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * POST /api/enquiry — real lead capture (plan §31).
 * Pipeline: honeypot → server validation → rate limit → persist/notify →
 * response. The client never decides success; the server re-validates
 * everything and returns a plain outcome.
 *
 * Persistence: appends JSONL to data/enquiries.jsonl (self-hosted),
 * and POSTs to ENQUIRY_WEBHOOK_URL when configured (CRM/email service).
 * On serverless platforms where the filesystem is read-only, the file
 * write is skipped gracefully and the webhook/env var is the path.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Validation failed.',
        fields: Object.fromEntries(
          parsed.error.issues.map((i) => [String(i.path[0] ?? 'form'), i.message])
        ),
      },
      { status: 400 }
    );
  }

  const { website, ...enquiry } = parsed.data;

  // Honeypot filled → silently accept without persisting.
  if (website && website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Rate limit per IP.
  const ip = clientIp(request.headers);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: `Too many requests. Please try again in ${limit.retryAfterSeconds}s.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const record = {
    ...enquiry,
    receivedAt: new Date().toISOString(),
    ip,
    source: request.headers.get('referer') ?? 'unknown',
  };

  // 1) Webhook notification (CRM / transactional email / internal channel).
  const webhookUrl = process.env.ENQUIRY_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      console.error('[enquiry] webhook delivery failed', err);
    }
  }

  // 2) Local JSONL persistence (best-effort; skipped on read-only FS).
  try {
    const file = path.join(process.cwd(), 'data', 'enquiries.jsonl');
    await appendFile(file, `${JSON.stringify(record)}\n`, 'utf8');
  } catch (err) {
    console.warn('[enquiry] local persistence skipped', err instanceof Error ? err.message : err);
  }

  // 3) Structured log for serverless observability.
  console.log('[enquiry] received', JSON.stringify(record));

  return NextResponse.json({ ok: true });
}
