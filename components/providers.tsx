'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader } from '@/components/f1/loader'
import { LanguageProvider } from '@/lib/language-context'
import { sceneLoadingManager } from '@/lib/loading/sceneLoadingManager'

function GlobalLoaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [loaded, setLoaded] = useState(false)
  const [activePath, setActivePath] = useState(pathname)

  useEffect(() => {
    setLoaded(false)
    setActivePath(pathname)
    const is3D = pathname === '/simulation' || pathname === '/carnival'
    sceneLoadingManager.startRoute(is3D)
  }, [pathname])

  useEffect(() => {
    if (!loaded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [loaded])

  return (
    <>
      <Loader key={activePath} onComplete={() => setLoaded(true)} />
      {children}
    </>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <GlobalLoaderShell>{children}</GlobalLoaderShell>
    </LanguageProvider>
  )
}
