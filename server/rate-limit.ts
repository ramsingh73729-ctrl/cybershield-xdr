type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

/**
 * Small process-local fallback for the demo deployment. Replace the map with
 * a Redis-backed atomic INCR/PEXPIRE implementation before running multiple
 * workers or accepting production traffic.
 */
export function checkRateLimit(request: Request, scope: string, limit = 30, windowMs = 60_000): RateLimitResult {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const clientKey = forwardedFor || request.headers.get('x-real-ip') || 'unknown-client';
  const key = scope + ':' + clientKey;
  const now = Date.now();
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;

  bucket.count += 1;
  buckets.set(key, bucket);

  // Bound memory if a development server receives many spoofed addresses.
  if (buckets.size > 10_000) {
    buckets.forEach((entry, entryKey) => {
      if (entry.resetAt <= now) buckets.delete(entryKey);
    });
  }

  return {
    allowed: bucket.count <= limit,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
