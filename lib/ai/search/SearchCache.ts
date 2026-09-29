import { SearchCacheEntry, SearchResult } from './types'

export class SearchCache {
  private static instance: SearchCache | null = null
  private cache: Map<string, SearchCacheEntry> = new Map()
  private readonly defaultTtlMs: number = 60 * 60 * 1000 // 1 hour
  private readonly maxCapacity: number = 150

  public static getInstance(): SearchCache {
    if (!SearchCache.instance) {
      SearchCache.instance = new SearchCache()
    }
    return SearchCache.instance
  }

  private normalizeKey(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  public get(query: string): SearchResult[] | null {
    try {
      const key = this.normalizeKey(query)
      const entry = this.cache.get(key)
      if (!entry) return null

      // Check TTL expiration
      const now = Date.now()
      if (now - entry.timestamp > this.defaultTtlMs) {
        this.cache.delete(key)
        return null
      }

      return entry.results
    } catch {
      return null
    }
  }

  public set(query: string, results: SearchResult[]): void {
    try {
      if (!results || results.length === 0) return

      const key = this.normalizeKey(query)

      // Evict oldest entry if at capacity
      if (this.cache.size >= this.maxCapacity) {
        const oldestKey = this.cache.keys().next().value
        if (oldestKey) {
          this.cache.delete(oldestKey)
        }
      }

      this.cache.set(key, {
        results,
        timestamp: Date.now(),
      })
    } catch {
      // Never crash the AI subsystem on cache error
    }
  }

  public clear(): void {
    this.cache.clear()
  }
}

export const searchCache = SearchCache.getInstance()
