type BucketState = {
  timestamps: number[];
  head: number;
};

const buckets = new Map<string, BucketState>();
const MAX_REQUESTS = 100;
const WINDOW_MS = 60_000; // 1 minute
const PRUNE_INTERVAL_MS = WINDOW_MS;
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

export function checkRateLimit(bucketKey: string): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const bucket = buckets.get(bucketKey) ?? { timestamps: [], head: 0 };
  const recentCount = trimExpired(bucket, cutoff);

  if (recentCount >= MAX_REQUESTS) {
    buckets.set(bucketKey, bucket);
    pruneInactiveBuckets(now, cutoff);
    return false;
  }

  bucket.timestamps.push(now);
  buckets.set(bucketKey, bucket);
  pruneInactiveBuckets(now, cutoff);
  return true;
}
