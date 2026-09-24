'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

export interface PostCardProps {
  slug: string
  title: string
  category: string
  coverImage: string
  excerpt: string
  publishedDate: string
  readingTime: number
  authorName: string
  featured?: boolean
}

export function PostCard({
  slug,
  title,
  category,
  coverImage,
  excerpt,
  publishedDate,
  readingTime,
  authorName,
  featured = false,
}: PostCardProps) {
  const { t } = useLanguage()

  if (featured) {
    return (
      <article className="group relative col-span-12 overflow-hidden border border-border bg-card">
        <Link href={`/posts/${slug}`} className="grid grid-cols-12 items-center" data-cursor="hover">
          <div className="light-sweep relative col-span-12 aspect-[16/9] overflow-hidden md:col-span-7">
            <img
              src={coverImage || '/placeholder.svg'}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/90" />
            <span
              aria-hidden="true"
              className="absolute left-6 top-6 bg-primary/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-primary-foreground backdrop-blur-md"
            >
              {t.posts.featuredBadge}
            </span>
          </div>

          <div className="col-span-12 p-6 md:col-span-5 md:p-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-speed">
              {category}
            </span>
            <h3 className="mt-3 text-3xl font-black leading-[0.95] tracking-tight text-foreground group-hover:text-primary transition-colors md:text-5xl">
              {title}
            </h3>
            <p className="mt-4 text-pretty font-extralight leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <span>{authorName}</span>
              <span>•</span>
              <span>{publishedDate}</span>
              <span>•</span>
              <span className="text-neon">
                {readingTime} {t.posts.readingTimeSuffix}
              </span>
            </div>
            <div className="mt-8">
              <span className="light-sweep inline-block bg-primary px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] text-primary-foreground transition-colors group-hover:bg-primary/90">
                {t.posts.readArticle} →
              </span>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <article className="group relative flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-border/80">
      <Link href={`/posts/${slug}`} className="flex flex-col h-full" data-cursor="hover">
        <div className="light-sweep relative aspect-[16/10] overflow-hidden">
          <img
            src={coverImage || '/placeholder.svg'}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          <span className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.4em] text-speed">
            {category}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            <h3 className="text-xl font-black leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary md:text-2xl">
              {title}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm font-extralight leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            <span>{authorName}</span>
            <span>
              {readingTime} {t.posts.readingTimeSuffix}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
