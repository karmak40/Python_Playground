import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { strings, type Lang, type Strings } from './strings'

const STORAGE_KEY = 'margin.lang'

/** A piece of content that exists in both languages, e.g. an article title. */
export type Bilingual<T> = Record<Lang, T>

type I18nValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Strings
  pick: <T>(pair: Bilingual<T>) => T
}

const I18nContext = createContext<I18nValue | null>(null)

function initialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'de') return stored
  return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
  }, [])

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t: strings[lang], pick: (pair) => pair[lang] }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>')
  return value
}

/** "3 articles" / "3 Artikel" — the design's only pluralised string. */
export function countLabel(n: number, t: Strings): string {
  return `${n} ${n === 1 ? t.help.article : t.help.articles}`
}
