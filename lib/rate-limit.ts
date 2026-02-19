const timestampsByBucket = new Map<string, number[]>();
const MAX_REQUESTS = 100;
const WINDOW_MS = 60_000; // 1 minute

export function checkRateLimit(bucket: string): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const timestamps = timestampsByBucket.get(bucket) ?? [];
  const recent = timestamps.filter((t) => t > cutoff);

  if (recent.length >= MAX_REQUESTS) {
    return false;
  }

  recent.push(now);
  timestampsByBucket.set(bucket, recent);
  return true;
}
