type BucketState = {
  timestamps: number[];
  head: number;
};

interface RateLimitConfig {
  key: string;
  maxRequests: number;
  windowMs: number;
}

const buckets = new Map<string, BucketState>();
const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_MS = 60_000;
const PRUNE_INTERVAL_MS = 60_000;
let lastPruneAt = 0;

function trimExpired(bucket: BucketState, cutoff: number): number {
  while (bucket.head < bucket.timestamps.length && bucket.timestamps[bucket.head] <= cutoff) {
    bucket.head += 1;
  }

  if (bucket.head > 0 && bucket.head * 2 >= bucket.timestamps.length) {
    bucket.timestamps = bucket.timestamps.slice(bucket.head);
    bucket.head = 0;
  }

  return bucket.timestamps.length - bucket.head;
}

function pruneInactiveBuckets(now: number, cutoff: number) {
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) {
    return;
  }

  for (const [bucketKey, bucket] of buckets) {
    const recentCount = trimExpired(bucket, cutoff);
    if (recentCount === 0) {
      buckets.delete(bucketKey);
    }
  }

  lastPruneAt = now;
}

export function checkRateLimitWithConfig(config: RateLimitConfig): boolean {
  const now = Date.now();
  const cutoff = now - config.windowMs;

  const bucket = buckets.get(config.key) ?? { timestamps: [], head: 0 };
  const recentCount = trimExpired(bucket, cutoff);

  if (recentCount >= config.maxRequests) {
    buckets.set(config.key, bucket);
    pruneInactiveBuckets(now, cutoff);
    return false;
  }

  bucket.timestamps.push(now);
  buckets.set(config.key, bucket);
  pruneInactiveBuckets(now, cutoff);
  return true;
}

export function checkRateLimit(bucketKey: string): boolean {
  return checkRateLimitWithConfig({
    key: bucketKey,
    maxRequests: DEFAULT_MAX_REQUESTS,
    windowMs: DEFAULT_WINDOW_MS,
  });
}

export function checkPublicChatIpRateLimit(ip: string): boolean {
  return checkRateLimitWithConfig({
    key: `public-chat:ip:${ip}`,
    maxRequests: 30,
    windowMs: 60_000,
  });
}

export function checkPublicChatHandleRateLimit(handle: string): boolean {
  return checkRateLimitWithConfig({
    key: `public-chat:handle:${handle}`,
    maxRequests: 50,
    windowMs: 60_000,
  });
}
