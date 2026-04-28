import Redis from 'ioredis';
import { env } from './env';

let client: Redis | null = null;
let connectionFailed = false;

export function getRedis(): Redis | null {
  if (connectionFailed || !env.REDIS_URL) return client;
  if (client) return client;

  const instance = new Redis(env.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: () => null,
  });

  instance.on('error', (err) => {
    if (!connectionFailed) {
      console.warn('[redis] indisponível, operando sem cache:', err.message);
      connectionFailed = true;
    }
  });

  client = instance;
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r || connectionFailed) return null;
  try {
    const raw = await r.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const r = getRedis();
  if (!r || connectionFailed) return;
  try {
    await r.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // silencioso: cache é best-effort
  }
}

export async function cacheDeleteByPrefix(prefix: string): Promise<void> {
  const r = getRedis();
  if (!r || connectionFailed) return;
  try {
    const stream = r.scanStream({ match: `${prefix}*`, count: 100 });
    const chaves: string[] = [];
    for await (const lote of stream) {
      chaves.push(...(lote as string[]));
    }
    if (chaves.length > 0) await r.del(...chaves);
  } catch {
    // silencioso
  }
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  const fresh = await loader();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}
