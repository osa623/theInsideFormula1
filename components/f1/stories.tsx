'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import { useLanguage } from '@/lib/language-context'
import { useAllPosts } from '@/lib/use-posts'
import { Magnetic } from './magnetic'
import { BlurReveal, LetterReveal } from './reveal'

interface StoryData {
  image: string
  slug: string
  title: string
  tag: string
  excerpt: string
  meta: string
}

function StoryPanel({
  story,
  index,
}: {
  story: StoryData
  index: number
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  const isFull = index === 0
  const isRight = index === 2

  return (
    <article
      ref={ref}
      className={
        isFull
          ? 'relative col-span-12'
          : isRight
            ? 'relative col-span-12 md:col-span-5 md:col-start-8 md:-mt-32'
            : 'relative col-span-12 md:col-span-6 md:mt-20'
      }
    >
      <Link href={`/posts/${story.slug}`} className="group block" data-cursor="hover">
        <div
          className={`light-sweep relative overflow-hidden ${
            isFull ? 'aspect-[21/9]' : 'aspect-[4/5] md:aspect-[3/4]'
          }`}
        >
          <motion.div className="absolute -inset-y-[10%] inset-x-0" style={{ y: imgY }}>
            <img
              src={story.image || '/placeholder.svg'}
              alt={story.title}
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 group-hover:rotate-[0.5deg]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Metadata slides upward on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-4 p-6 transition-transform duration-500 ease-out group-hover:translate-y-0 md:p-10">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.4em] text-speed">
              {story.tag}
            </p>
            <h3
              className={`text-balance font-black leading-[0.95] tracking-tight ${
                isFull ? 'text-3xl md:text-6xl' : 'text-2xl md:text-4xl'
              }`}
            >
              {story.title}
            </h3>
            <p className="mt-3 max-w-lg text-pretty font-extralight leading-relaxed text-muted-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              {story.excerpt}
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {story.meta}
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}

export function Stories() {
  const { lang, t } = useLanguage()
  const { posts, loading } = useAllPosts(lang)

  // Take the first 3 posts from the API to display as story panels
  const stories: StoryData[] = posts.slice(0, 3).map((post) => ({
    image: post.coverImage,
    slug: post.slug,
    title: post.title,
    tag: post.category,
    excerpt: post.excerpt,
    meta: `${post.publishedDate} · ${post.readingTime} min read`,
  }))

  // Fallback to translation-based items while loading
  const fallbackStories: StoryData[] = (t.stories.items || []).slice(0, 3).map((item: any, i: number) => ({
    image: `/images/story-${i + 1}.png`,
    slug: '',
    title: item.title || '',
    tag: item.tag || '',
    excerpt: item.excerpt || '',
    meta: item.meta || '',
  }))

  const displayStories = stories.length > 0 ? stories : fallbackStories

  return (
    <section id="stories" className="relative px-5 py-28 md:px-10 md:py-10" aria-label="Latest stories">
      {/* Ambient light */}
      <div
        aria-hidden="true"
        className="drift pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, oklch(0.72 0.19 45 / 12%), transparent 70%)' }}
      />

      <header className="absolute mb-16 flex  gap-4 md:mb-8  md:items-end md:justify-center">
        <h2 className="font-black relative  flex leading-[0.85]">
          <LetterReveal text={t.herocaption.title0} className="block text-[13vw] md:text-[11.8vw]" />
          
        
        </h2>
      </header>

      <div className="absolute mb-16 flex z-30 bg-transparent  gap-4 md:mb-8  md:items-end md:justify-center">
        <h2 className="font-black relative  flex leading-[0.85]">
          <LetterReveal text={t.herocaption.title0} className="block text-[13vw] md:text-[11.8vw]" />
          
        
        </h2>
      </div>

      <div className="absolute mb-16 flex z-40 bg-transparent  gap-4 md:mb-8  md:items-end md:justify-center">
        <h2 className="font-black relative items-center justify-center flex leading-[0.85]">
          <LetterReveal text={t.herocaption.title0} className="block text-[13vw] md:text-[11.8vw]" />
          <div className="absolute object-cover w-full  bg-black  h-[3.5vh]" />
        
        </h2>
      </div>
      

      <header className="mb-16 flex flex-col gap-4 md:mb-12 md:mt-40 md:flex-row md:items-end md:justify-between">
        <h2 className="font-black leading-[0.85] tracking-tighter">
          <div className="flex"><LetterReveal text={t.stories.title1} className="block bg-red-600 text-[13vw] md:text-[8vw]" />
          <LetterReveal text={t.stories.title1} className="block bg-red-600 text-[13vw] md:text-[8vw]" /></div>
          <LetterReveal
            text={t.stories.title2}
            className="block text-[13vw] text-primary md:text-[8vw]"
            delay={0.3}
          />
        </h2>
        <BlurReveal className="max-w-xs flex flex-col gap-4">
          <p className="font-extralight leading-relaxed text-muted-foreground">
            {t.stories.subtitle}
          </p>
          <Magnetic>
            <Link
              href="/posts"
              className="light-sweep inline-block border border-primary/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground w-fit"
            >
              All stories →
            </Link>
          </Magnetic>
        </BlurReveal>
      </header>

      <div className="grid grid-cols-12 gap-5 md:gap-8">
        {displayStories.map((story, i) => (
          <StoryPanel key={i} story={story} index={i} />
        ))}
      </div>
    </section>
  )
}
