/**
 * In-memory sliding-window rate limiter (plan §31).
 * Per-IP, sized for a single server instance. Swap for a shared store
 * (e.g. Redis) when deploying across multiple instances.
 */

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

const hits = new Map<string, number[]>();

/** Periodic cleanup so the map does not grow unbounded. */
function prune(now: number, windowMs: number) {
  for (const [key, timestamps] of hits) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  }
}

export function rateLimit(
  key: string,
  { windowMs = 10 * 60 * 1000, maxRequests = 5 }: RateLimitOptions = { windowMs: 10 * 60 * 1000, maxRequests: 5 }
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  prune(now, windowMs);

  const timestamps = hits.get(key) ?? [];
  const fresh = timestamps.filter((t) => now - t < windowMs);

  if (fresh.length >= maxRequests) {
    const retryAfterMs = fresh[0] + windowMs - now;
    hits.set(key, fresh);
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  fresh.push(now);
  hits.set(key, fresh);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP extraction behind common proxies. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
