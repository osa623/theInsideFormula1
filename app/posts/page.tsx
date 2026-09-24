'use client'

import { useMemo, useState } from 'react'
import { Cursor } from '@/components/f1/cursor'
import { Finale } from '@/components/f1/finale'
import { Nav } from '@/components/f1/nav'
import { PostCard } from '@/components/f1/post-card'
import { BlurReveal, LetterReveal } from '@/components/f1/reveal'
import { useLanguage } from '@/lib/language-context'
import { useAllPosts, useFeaturedPost } from '@/lib/use-posts'

export default function PostsPage() {
  const { lang, t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const { posts } = useAllPosts(lang)
  const { post: featuredPost } = useFeaturedPost(lang)

  const categoryKeys = [
    { key: 'All', label: t.posts.categories.all },
    { key: 'News', label: t.posts.categories.news },
    { key: 'Race Reports', label: t.posts.categories.raceReports },
    { key: 'Drivers', label: t.posts.categories.drivers },
    { key: 'Teams', label: t.posts.categories.teams },
    { key: 'Technology', label: t.posts.categories.tech },
    { key: 'Analysis', label: t.posts.categories.analysis },
  ]

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesCategory

      const matchesSearch =
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        post.author.name.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [posts, selectedCategory, searchQuery])

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      <Cursor />
      <div className="noise-overlay" aria-hidden="true" />
      <Nav />

      {/* Hero Header Section */}
      <section className="relative px-5 pt-32 pb-16 md:px-10 md:pt-44 md:pb-24">
        {/* Ambient background light */}
        <div
          aria-hidden="true"
          className="drift pointer-events-none absolute -left-40 top-10 h-[500px] w-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, oklch(0.58 0.235 28 / 20%), transparent 70%)' }}
        />

        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.6em] text-speed md:text-xs">
            {t.posts.heroTag}
          </p>

          <h1 className="font-black leading-[0.85] tracking-tighter">
            <LetterReveal text={t.posts.heroTitle1} className="block text-white text-[12vw] md:text-[7vw]" />
            <LetterReveal
              text={t.posts.heroTitle2}
              className="block text-[12vw] text-primary glow-red md:text-[7vw]"
              delay={0.2}
            />
          </h1>

          <BlurReveal className="mt-6 max-w-2xl" delay={0.4}>
            <p className="font-extralight leading-relaxed text-muted-foreground md:text-xl">
              {t.posts.heroSubtitle}
            </p>
          </BlurReveal>

          {/* Search & Category Filter Control Bar */}
          <div className="mt-12 flex flex-col gap-6 md:mt-16 md:flex-row md:items-center md:justify-between border-t border-border/60 pt-8">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryKeys.map((cat) => {
                const isActive = selectedCategory === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`font-mono text-xs uppercase tracking-[0.2em] px-4 py-2 transition-all duration-300 border ${
                      isActive
                        ? 'border-primary bg-primary/10 text-foreground shadow-[0_0_15px_rgba(235,0,40,0.25)]'
                        : 'border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.posts.searchPlaceholder}
                className="w-full border border-border bg-card px-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative px-5 pb-32 md:px-10 md:pb-44">
        <div className="mx-auto max-w-7xl">
          {/* Show Featured Post when on "All" and no search query */}
          {selectedCategory === 'All' && !searchQuery && featuredPost && (
            <div className="mb-16">
              <PostCard
                slug={featuredPost.slug}
                title={featuredPost.title}
                category={featuredPost.category}
                coverImage={featuredPost.coverImage}
                excerpt={featuredPost.excerpt}
                publishedDate={featuredPost.publishedDate}
                readingTime={featuredPost.readingTime}
                authorName={featuredPost.author.name}
                featured
              />
            </div>
          )}

          {/* Grid of Articles */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  category={post.category}
                  coverImage={post.coverImage}
                  excerpt={post.excerpt}
                  publishedDate={post.publishedDate}
                  readingTime={post.readingTime}
                  authorName={post.author.name}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-border p-8">
              <p className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
                {t.posts.noResults}
              </p>
            </div>
          )}
        </div>
      </section>

      <Finale />
    </main>
  )
}
