const counterByBucket = new Map<string, number>();
const MAX_REQUESTS = 100;

export function checkRateLimit(bucket: string): boolean {
  const current = counterByBucket.get(bucket) ?? 0;
  if (current >= MAX_REQUESTS) {
    return false;
  }

  counterByBucket.set(bucket, current + 1);
  return true;
}
