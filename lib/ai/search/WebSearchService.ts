import { SearchResult, WebSearchProvider } from './types'

/**
 * Wikipedia Search Provider — Uses the MediaWiki API to search for F1-related articles.
 * Free, no API key required, reliable for factual/encyclopedic information.
 */
class WikipediaProvider implements WebSearchProvider {
  public readonly name = 'Wikipedia'

  public isAvailable(): boolean {
    return true // No API key needed
  }

  public async search(query: string, maxResults = 3): Promise<SearchResult[]> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)

    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query + ' Formula One'
      )}&format=json&utf8=1&srlimit=${maxResults}`

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'FormulaOneExhibition/1.0 (https://github.com/formula-one-experience)',
        },
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!res.ok) return []

      const data = await res.json()
      const items = data?.query?.search || []

      return items.map((item: { title: string; snippet: string; timestamp?: string }) => ({
        title: item.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
        domain: 'wikipedia.org',
        snippet: item.snippet
          .replace(/<[^>]+>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&')
          .trim(),
        publishedDate: item.timestamp,
      }))
    } catch {
      clearTimeout(timer)
      return []
    }
  }
}

/**
 * DuckDuckGo Instant Answer Provider — Free API for quick factual lookups.
 */
class DuckDuckGoProvider implements WebSearchProvider {
  public readonly name = 'DuckDuckGo'

  public isAvailable(): boolean {
    return true
  }

  public async search(query: string, maxResults = 2): Promise<SearchResult[]> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3500)

    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
        query + ' Formula 1'
      )}&format=json&no_html=1&skip_disambig=1`

      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      if (!res.ok) return []

      const data = await res.json()
      const results: SearchResult[] = []

      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL || '',
          domain: data.AbstractSource || 'duckduckgo.com',
          snippet: data.AbstractText,
        })
      }

      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text.slice(0, 80),
              url: topic.FirstURL,
              domain: new URL(topic.FirstURL).hostname,
              snippet: topic.Text,
            })
          }
        }
      }

      return results.slice(0, maxResults)
    } catch {
      clearTimeout(timer)
      return []
    }
  }
}

/**
 * Google Custom Search Provider — Requires SEARCH_API_KEY and SEARCH_ENGINE_ID env vars.
 * Delivers highest-quality, most current web search results.
 */
class GoogleCustomSearchProvider implements WebSearchProvider {
  public readonly name = 'Google'

  public isAvailable(): boolean {
    return Boolean(
      process.env.SEARCH_API_KEY &&
      process.env.SEARCH_API_KEY !== 'YOUR_SEARCH_API_KEY' &&
      process.env.SEARCH_ENGINE_ID &&
      process.env.SEARCH_ENGINE_ID !== 'YOUR_SEARCH_ENGINE_ID'
    )
  }

  public async search(query: string, maxResults = 3): Promise<SearchResult[]> {
    if (!this.isAvailable()) return []

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)

    try {
      const apiKey = process.env.SEARCH_API_KEY!
      const cx = process.env.SEARCH_ENGINE_ID!
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(
        query + ' Formula 1'
      )}&num=${maxResults}`

      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      if (!res.ok) return []

      const data = await res.json()
      return (data.items || []).slice(0, maxResults).map((item: {
        title: string
        link: string
        displayLink: string
        snippet: string
        pagemap?: { metatags?: Array<{ 'article:published_time'?: string }> }
      }) => ({
        title: item.title,
        url: item.link,
        domain: item.displayLink,
        snippet: item.snippet,
        publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'],
      }))
    } catch {
      clearTimeout(timer)
      return []
    }
  }
}

/**
 * WebSearchService — Aggregated search service combining multiple providers.
 * Prioritizes Google Custom Search (if configured), then Wikipedia + DuckDuckGo.
 * All calls are server-side only. Never exposes API keys to the client.
 */
export class WebSearchService {
  private static instance: WebSearchService | null = null
  private providers: WebSearchProvider[]

  private constructor() {
    this.providers = [
      new GoogleCustomSearchProvider(),
      new WikipediaProvider(),
      new DuckDuckGoProvider(),
    ]
  }

  public static getInstance(): WebSearchService {
    if (!WebSearchService.instance) {
      WebSearchService.instance = new WebSearchService()
    }
    return WebSearchService.instance
  }

  /**
   * Searches the internet for Formula 1 information using all available providers.
   * Returns normalized, deduplicated, structured results.
   */
  public async search(query: string, maxResults = 5): Promise<SearchResult[]> {
    const allResults: SearchResult[] = []
    const seenUrls = new Set<string>()

    // Run all available providers concurrently
    const providerPromises = this.providers
      .filter((p) => p.isAvailable())
      .map(async (provider) => {
        try {
          return await provider.search(query, maxResults)
        } catch {
          console.warn(`[WebSearchService] Provider ${provider.name} failed`)
          return []
        }
      })

    const providerResults = await Promise.allSettled(providerPromises)

    for (const result of providerResults) {
      if (result.status === 'fulfilled') {
        for (const item of result.value) {
          if (!seenUrls.has(item.url) && item.snippet) {
            seenUrls.add(item.url)
            allResults.push(item)
          }
        }
      }
    }

    return allResults.slice(0, maxResults)
  }

  /**
   * Formats search results into a structured context string for the AI model.
   */
  public formatForPrompt(results: SearchResult[]): string {
    if (!results.length) return ''

    const formatted = results
      .map((r, i) => {
        const date = r.publishedDate ? ` (${r.publishedDate})` : ''
        return `[Source ${i + 1}] ${r.title} — ${r.domain}${date}\n${r.snippet}`
      })
      .join('\n\n')

    return `[LIVE WEB SEARCH RESULTS]\n${formatted}`
  }
}

export const webSearchService = WebSearchService.getInstance()
