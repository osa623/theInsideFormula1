import { type Language } from './translations'

const API_URL = 'https://baosbackend-9f8439698e78.herokuapp.com/api/formulaArticles'

export interface F1Post {
  id: string
  slug: string
  category: string
  coverImage: string
  publishedDate: string
  readingTime: number
  featured?: boolean
  author: {
    name: string
    role: string
    avatar: string
  }
  tags: string[]
  relatedSlugs: string[]
  title: {
    en: string
    si: string
  }
  excerpt: {
    en: string
    si: string
  }
  content: {
    en: {
      intro: string
      sections: {
        id: string
        title: string
        body: string
        quote?: string
        hudData?: { label: string; value: string }
      }[]
    }
    si: {
      intro: string
      sections: {
        id: string
        title: string
        body: string
        quote?: string
        hudData?: { label: string; value: string }
      }[]
    }
  }
}

// Cache for fetched posts to avoid redundant API calls
let cachedPosts: F1Post[] | null = null
let fetchPromise: Promise<F1Post[]> | null = null

export async function fetchPosts(): Promise<F1Post[]> {
  if (cachedPosts) return cachedPosts

  if (fetchPromise) return fetchPromise

  fetchPromise = fetch(API_URL)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch posts')
      return res.json()
    })
    .then((json) => {
      const posts: F1Post[] = (json.data || []).map((item: any) => ({
        id: item._id || item.id || '',
        slug: item.slug || '',
        category: item.category || '',
        coverImage: item.coverImage || '',
        publishedDate: item.publishedDate || '',
        readingTime: item.readingTime || 0,
        featured: item.featured || false,
        author: {
          name: item.author?.name || '',
          role: item.author?.role || '',
          avatar: item.author?.avatar || '/placeholder-user.jpg',
        },
        tags: item.tags || [],
        relatedSlugs: item.relatedSlugs || [],
        title: {
          en: item.title?.en || '',
          si: item.title?.si || '',
        },
        excerpt: {
          en: item.excerpt?.en || '',
          si: item.excerpt?.si || '',
        },
        content: {
          en: item.content?.en || { intro: '', sections: [] },
          si: item.content?.si || { intro: '', sections: [] },
        },
      }))
      cachedPosts = posts
      fetchPromise = null
      return posts
    })
    .catch((err) => {
      console.error('Error fetching posts:', err)
      fetchPromise = null
      return []
    })

  return fetchPromise
}

function mapPost(post: F1Post, lang: Language = 'en') {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    coverImage: post.coverImage,
    publishedDate: post.publishedDate,
    readingTime: post.readingTime,
    featured: post.featured,
    author: post.author,
    tags: post.tags,
    relatedSlugs: post.relatedSlugs,
    title: post.title[lang] || post.title.en,
    excerpt: post.excerpt[lang] || post.excerpt.en,
    content: post.content[lang] || post.content.en,
  }
}

export async function getAllPosts(lang: Language = 'en') {
  const posts = await fetchPosts()
  return posts.map((post) => mapPost(post, lang))
}

export async function getPostBySlug(slug: string, lang: Language = 'en') {
  const posts = await fetchPosts()
  const post = posts.find((p) => p.slug === slug)
  if (!post) return null
  return mapPost(post, lang)
}

export async function getFeaturedPost(lang: Language = 'en') {
  const posts = await fetchPosts()
  const post = posts.find((p) => p.featured) || posts[0]
  if (!post) return null
  return mapPost(post, lang)
}

export async function getRelatedPosts(slug: string, lang: Language = 'en') {
  const posts = await fetchPosts()
  const current = posts.find((p) => p.slug === slug)
  if (!current) return []
  const related = posts
    .filter(
      (p) =>
        p.slug !== slug &&
        (current.relatedSlugs.includes(p.slug) || p.category === current.category)
    )
    .slice(0, 3)
  return related.map((post) => mapPost(post, lang))
}
