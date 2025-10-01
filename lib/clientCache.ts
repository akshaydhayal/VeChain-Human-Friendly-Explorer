// Client-side cache for API data to avoid repetitive calls on page refresh
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class ClientCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    // Also store in localStorage for persistence across page refreshes
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl
      }))
    } catch (error) {
      console.warn('Failed to store cache in localStorage:', error)
    }
  }

  get<T>(key: string): T | null {
    // First check in-memory cache
    const memoryEntry = this.cache.get(key)
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data
    }

    // Then check localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`)
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored)
        if (this.isValid(entry)) {
          // Restore to memory cache
          this.cache.set(key, entry)
          return entry.data
        } else {
          // Remove expired entry
          localStorage.removeItem(`cache_${key}`)
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
    }

    return null
  }

  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  clear(): void {
    this.cache.clear()
    // Clear localStorage cache entries
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error)
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }
}

// Global cache instance
export const clientCache = new ClientCache()

// Cache keys
export const CACHE_KEYS = {
  VECHAIN_NODES: 'vechain-nodes',
  VECHAIN_NETWORK: 'vechain-network', 
  AUTHORITY_NODES: 'authority-nodes',
  PRICE_DATA: 'price-data',
  PRICE_CHARTS: 'price-charts'
} as const

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  NODES: 24 * 60 * 60 * 1000, // 24 hours
  NETWORK: 60 * 60 * 1000, // 1 hour
  AUTHORITY: 24 * 60 * 60 * 1000, // 24 hours
  PRICE: 5 * 60 * 1000, // 5 minutes
  CHARTS: 30 * 60 * 1000 // 30 minutes
} as const
