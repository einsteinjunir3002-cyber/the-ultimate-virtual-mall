/**
 * Best-effort in-memory rate limiter.
 *
 * IMPORTANT: state lives in the memory of one server instance. On serverless
 * hosts (Vercel) each instance has its own counters, so this slows down abuse
 * but is NOT a hard guarantee. For production-grade limits back this with a
 * shared store (e.g. Upstash Redis / Vercel KV) behind the same function
 * signatures.
 */
interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    b.hits = b.hits.filter((t) => now - t < windowMs);
    if (b.hits.length === 0) buckets.delete(key);
  }
}

export interface LimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** Record one hit for `key` and report whether it is within `limit` per `windowMs`. */
export function hit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  sweep(now, windowMs);
  const b = buckets.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t) => now - t < windowMs);
  b.hits.push(now);
  buckets.set(key, b);
  const ok = b.hits.length <= limit;
  const oldest = b.hits[0] ?? now;
  return {
    ok,
    remaining: Math.max(0, limit - b.hits.length),
    retryAfterSeconds: ok ? 0 : Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
  };
}

/** Check without recording (used to block logins after N recorded failures). */
export function peek(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  const b = buckets.get(key);
  const hits = (b?.hits ?? []).filter((t) => now - t < windowMs);
  const ok = hits.length < limit;
  const oldest = hits[0] ?? now;
  return {
    ok,
    remaining: Math.max(0, limit - hits.length),
    retryAfterSeconds: ok ? 0 : Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
  };
}

export function reset(key: string) {
  buckets.delete(key);
}

/** Best available client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
