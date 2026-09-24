'use client'

import { Calendar } from '@/components/f1/calendar'
import { Cursor } from '@/components/f1/cursor'
import { Drivers } from '@/components/f1/drivers'
import { Finale } from '@/components/f1/finale'
import { Hero } from '@/components/f1/hero'
import { Interlude, Marquee } from '@/components/f1/interlude'
import { Garage } from '@/components/f1/garage'
import { Machine } from '@/components/f1/machine'
import { Nav } from '@/components/f1/nav'
import { Stories } from '@/components/f1/stories'
import { Teams } from '@/components/f1/teams'
import { useLanguage } from '@/lib/language-context'
import { HeroSecond } from '@/components/f1/heroSecond'

export default function Page() {
  const { t } = useLanguage()

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      <Cursor />
      <div className="noise-overlay" aria-hidden="true" />
      <Nav />
      <HeroSecond />
      <Marquee items={[...t.marquee1]} />
      <Stories />
      <Drivers />
      <Teams />
      <Marquee
        items={[
          'MARANELLO',
          'BRACKLEY',
          'WOKING',
          'MILTON KEYNES',
          'MONACO',
          'SILVERSTONE',
        ]}
      />
      <Machine />
      <Garage />
      <Calendar />
      <Finale />
    </main>
  )
}
