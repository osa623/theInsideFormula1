'use client'

import { motion, useScroll, useSpring } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'
import { Magnetic } from './magnetic'

import formula1Logo from '../../public/images/Short_Banner_Imges/formula_logo_1.png';

export function Nav() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const { lang, setLang, t } = useLanguage()

  const LINKS = [
    { label: t.nav.stories, href: '/posts' },
    { label: t.nav.drivers, href: '/#drivers' },
    { label: t.nav.teams, href: '/#teams' },
    { label: t.nav.machine, href: '/#machine' },
    { label: 'Carnival', href: '/carnival' },
    { label: t.nav.calendar, href: '/#calendar' },
  ]

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
    >
      {/* Scroll progress — like a lap progress bar */}
      <motion.div
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-primary"
        style={{ scaleX }}
        aria-hidden="true"
      />
      <nav
        className="flex items-center justify-between px-5 py-4 backdrop-blur-md md:px-10"
        aria-label="Main"
      >
        <Magnetic>
              <img
              src={formula1Logo.src}
              className="h-[8vh] w-full object-cover"
            />
        </Magnetic>
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Magnetic strength={0.25}>
                <Link
                  href={link.href}
                  className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </Magnetic>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <Magnetic>
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'si' : 'en')}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {lang === 'en' ? 'SI' : 'EN'}
            </button>
          </Magnetic>
          <Magnetic>
            <Link
              href="/#calendar"
              className="light-sweep border border-primary/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {t.nav.nextRace}
            </Link>
          </Magnetic>
        </div>
      </nav>
    </motion.header>
  )
}
