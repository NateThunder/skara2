type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

type InflightMap = Map<string, Promise<unknown>>;
type CacheMap = Map<string, CacheEntry>;

const DEFAULT_TTL_MS = 5 * 60 * 1000;

declare global {
  var __gaDashboardCache: CacheMap | undefined;
  var __gaDashboardInflight: InflightMap | undefined;
}

const cache: CacheMap = globalThis.__gaDashboardCache ?? new Map<string, CacheEntry>();
const inflight: InflightMap = globalThis.__gaDashboardInflight ?? new Map<string, Promise<unknown>>();

globalThis.__gaDashboardCache = cache;
globalThis.__gaDashboardInflight = inflight;

export async function withAnalyticsCache<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);

  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }

  const pending = inflight.get(key);
  if (pending) {
    return (await pending) as T;
  }

  const task = loader()
    .then((value) => {
      cache.set(key, {
        value,
        expiresAt: now + ttlMs,
      });
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, task as Promise<unknown>);
  return task;
}

export function clearAnalyticsCache(prefix?: string): void {
  if (!prefix) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
