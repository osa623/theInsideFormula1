'use client'

import { useState, useEffect } from 'react'
import { type Language } from './translations'
import { getAllPosts, getPostBySlug, getFeaturedPost, getRelatedPosts } from './posts'

type MappedPost = {
  id: string
  slug: string
  category: string
  coverImage: string
  publishedDate: string
  readingTime: number
  featured?: boolean
  author: { name: string; role: string; avatar: string }
  tags: string[]
  relatedSlugs: string[]
  title: string
  excerpt: string
  content: { intro: string; sections: { id: string; title: string; body: string; quote?: string; hudData?: { label: string; value: string } }[] }
}

export function useAllPosts(lang: Language) {
  const [posts, setPosts] = useState<MappedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAllPosts(lang).then((data) => {
      if (!cancelled) {
        setPosts(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [lang])

  return { posts, loading }
}

export function useFeaturedPost(lang: Language) {
  const [post, setPost] = useState<MappedPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getFeaturedPost(lang).then((data) => {
      if (!cancelled) {
        setPost(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [lang])

  return { post, loading }
}

export function usePostBySlug(slug: string, lang: Language) {
  const [post, setPost] = useState<MappedPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPostBySlug(slug, lang).then((data) => {
      if (!cancelled) {
        setPost(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [slug, lang])

  return { post, loading }
}

export function useRelatedPosts(slug: string, lang: Language) {
  const [posts, setPosts] = useState<MappedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getRelatedPosts(slug, lang).then((data) => {
      if (!cancelled) {
        setPosts(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [slug, lang])

  return { posts, loading }
}
