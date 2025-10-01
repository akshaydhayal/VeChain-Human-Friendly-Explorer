import { LRUCache } from 'lru-cache'

const ttlMs = 1000 * 60 * 5

export const cache = new LRUCache<string, any>({
  max: 500,
  ttl: ttlMs,
})

export async function cached<T>(key: string, fetcher: () => Promise<T>, ttl: number = ttlMs): Promise<T> {
  const existing = cache.get(key) as T | undefined
  if (existing !== undefined) return existing
  const value = await fetcher()
  cache.set(key, value, { ttl })
  return value
}


