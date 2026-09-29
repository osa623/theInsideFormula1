export interface SearchResult {
  title: string
  url: string
  domain: string
  snippet: string
  publishedDate?: string
}

export interface WebSearchProvider {
  name: string
  isAvailable(): boolean
  search(query: string, maxResults?: number): Promise<SearchResult[]>
}

export interface SearchCacheEntry {
  results: SearchResult[]
  timestamp: number
}
