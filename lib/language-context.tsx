'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { TRANSLATIONS, type Language } from './translations'

type LanguageContextType = {
  lang: Language
  setLang: (lang: Language) => void
  t: typeof TRANSLATIONS['en']
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem('f1-lang') as Language | null
    if (stored === 'en' || stored === 'si') {
      setLangState(stored)
    }
  }, [])

  const setLang = (l: Language) => {
    setLangState(l)
    localStorage.setItem('f1-lang', l)
  }

  const t = TRANSLATIONS[lang]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
