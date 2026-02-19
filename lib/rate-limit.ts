const timestampsByBucket = new Map<string, number[]>();
const MAX_REQUESTS = 100;
const WINDOW_MS = 60_000; // 1 minute

function pruneStaleBuckets(cutoff: number): void {
  for (const [bucket, timestamps] of timestampsByBucket.entries()) {
    const hasRecent = timestamps.some((t) => t > cutoff);
    if (!hasRecent) {
      timestampsByBucket.delete(bucket);
    }
  }
}

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
  pruneStaleBuckets(cutoff);
  return true;
}
