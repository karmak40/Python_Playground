import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'paper' | 'ink'

const STORAGE_KEY = 'margin.theme'

type ThemeValue = { theme: Theme; toggle: () => void }

const ThemeContext = createContext<ThemeValue | null>(null)

function initialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'paper' || stored === 'ink') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'ink' : 'paper'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<ThemeValue>(
    () => ({ theme, toggle: () => setTheme((t) => (t === 'ink' ? 'paper' : 'ink')) }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
