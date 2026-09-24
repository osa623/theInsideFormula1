'use client'

import { motion, useScroll, useSpring } from 'framer-motion'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { useState } from 'react'
import { Cursor } from '@/components/f1/cursor'
import { Finale } from '@/components/f1/finale'
import { Magnetic } from '@/components/f1/magnetic'
import { Nav } from '@/components/f1/nav'
import { PostCard } from '@/components/f1/post-card'
import { WordReveal } from '@/components/f1/reveal'
import { useLanguage } from '@/lib/language-context'
import { usePostBySlug, useRelatedPosts } from '@/lib/use-posts'

export default function ArticlePage() {
  const params = useParams()
  const slug = params?.slug as string
  const { lang, t } = useLanguage()

  const [copied, setCopied] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  const { post, loading } = usePostBySlug(slug, lang)
  const { posts: relatedPosts } = useRelatedPosts(slug, lang)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
        <Cursor />
        <div className="noise-overlay" aria-hidden="true" />
        <Nav />
        <div className="flex items-center justify-center min-h-screen">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            Loading...
          </p>
        </div>
      </main>
    )
  }

  if (!post) {
    notFound()
    return null
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-0 inset-x-0 z-[60] h-1 origin-left bg-gradient-to-r from-primary via-speed to-neon"
        style={{ scaleX }}
      />

      <Cursor />
      <div className="noise-overlay" aria-hidden="true" />
      <Nav />

      {/* Back Navigation Bar */}
      <div className="pt-28 px-5 md:px-10 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {t.posts.backToStories}
          </Link>
        </div>
      </div>

      {/* Article Hero Section */}
      <header className="px-5 pt-8 pb-12 md:px-10 md:pt-10 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <span className="font-mono text-xs uppercase tracking-[0.5em] text-speed">
            {post.category}
          </span>

          <h1 className="mt-4 text-balance font-black leading-[0.9] tracking-tighter text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
            <WordReveal text={post.title} />
          </h1>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-y border-border py-6">
            <div className="flex items-center gap-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-12 w-12 rounded-full border border-border object-cover"
              />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">
                  {post.author.name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {post.author.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <div>
                <span className="block text-[9px] text-muted-foreground/60">{t.posts.published}</span>
                <span>{post.publishedDate}</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="block text-[9px] text-muted-foreground/60">Reading time</span>
                <span className="text-neon">{post.readingTime} {t.posts.readingTimeSuffix}</span>
              </div>
            </div>
          </div>

          {/* Large Cover Image */}
          <div className="light-sweep relative mt-10 aspect-[21/9] overflow-hidden border border-border">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>
        </div>
      </header>

      {/* Dual Column Layout: Content + Sticky Sidebar */}
      <section className="px-5 pb-28 md:px-10 md:pb-44">
        <div className="mx-auto max-w-6xl grid grid-cols-12 gap-8 lg:gap-16">
          {/* Main Article Content */}
          <div className="col-span-12 lg:col-span-8">
            {/* Intro paragraph */}
            <p className="text-xl font-extralight leading-relaxed text-foreground/90 md:text-2xl border-l-2 border-primary pl-6 py-2 mb-12">
              {post.content.intro}
            </p>

            {/* Sections */}
            <div className="space-y-16">
              {post.content.sections.map((section) => (
                <article id={section.id} key={section.id} className="scroll-mt-36">
                  <h2 className="text-2xl font-black tracking-tight text-foreground md:text-4xl">
                    {section.title}
                  </h2>

                  <p className="mt-6 font-extralight leading-relaxed text-muted-foreground md:text-lg">
                    {section.body}
                  </p>

                  {/* Pull Quote */}
                  {section.quote && (
                    <blockquote className="my-8 border-l-2 border-speed bg-card/60 p-6 font-mono text-sm leading-relaxed text-foreground italic">
                      “{section.quote}”
                    </blockquote>
                  )}

                  {/* HUD Data Card */}
                  {section.hudData && (
                    <div className="my-8 flex items-center justify-between border border-border bg-card p-6">
                      <span className="font-mono text-xs uppercase tracking-[0.4em] text-speed">
                        {section.hudData.label}
                      </span>
                      <span className="font-mono text-xl font-black tracking-widest text-foreground">
                        {section.hudData.value}
                      </span>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-16 border-t border-border pt-8">
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-border/80 bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="sticky top-28 space-y-10">
              {/* Table of Contents */}
              <div className="border border-border bg-card p-6">
                <p className="font-mono text-xs uppercase tracking-[0.4em] text-speed mb-4">
                  {t.posts.tableOfContents}
                </p>
                <ul className="space-y-3 font-mono text-xs uppercase tracking-[0.2em]">
                  {post.content.sections.map((sec) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        className="text-muted-foreground transition-colors hover:text-foreground block truncate"
                      >
                        {sec.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share Box */}
              <div className="border border-border bg-card p-6">
                <p className="font-mono text-xs uppercase tracking-[0.4em] text-neon mb-4">
                  {t.posts.share}
                </p>
                <div className="flex items-center gap-3">
                  <Magnetic strength={0.2}>
                    <button
                      onClick={handleCopyLink}
                      className="light-sweep border border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground"
                    >
                      {copied ? t.posts.copied : t.posts.copyLink}
                    </button>
                  </Magnetic>
                </div>
              </div>

              {/* Author Card */}
              <div className="border border-border bg-card p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4">
                  {t.posts.author}
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-12 w-12 rounded-full border border-border object-cover"
                  />
                  <div>
                    <p className="font-black text-sm text-foreground">{post.author.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      {post.author.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related Stories Section */}
      {relatedPosts.length > 0 && (
        <section className="carbon border-t border-border px-5 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-6xl">
            <header className="mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-speed">
                Keep reading
              </p>
              <h2 className="mt-2 font-black leading-[0.85] tracking-tighter">
                <span className="block text-4xl md:text-6xl">{t.posts.relatedTitle1}</span>
                <span className="block text-4xl text-primary md:text-6xl">{t.posts.relatedTitle2}</span>
              </h2>
            </header>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {relatedPosts.map((rPost) => (
                <PostCard
                  key={rPost.id}
                  slug={rPost.slug}
                  title={rPost.title}
                  category={rPost.category}
                  coverImage={rPost.coverImage}
                  excerpt={rPost.excerpt}
                  publishedDate={rPost.publishedDate}
                  readingTime={rPost.readingTime}
                  authorName={rPost.author.name}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Finale />
    </main>
  )
}
