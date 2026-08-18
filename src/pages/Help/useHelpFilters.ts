import { useMemo, useState } from 'react'
import type { Lang } from '../../i18n/strings'
import { ARTICLES, CATS, catLabel, type CatId } from './content'

export function useHelpFilters(lang: Lang) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<CatId | ''>('')

  const all = useMemo(
    () =>
      ARTICLES.map((a) => ({
        slug: a.slug,
        id: a.cat,
        time: a.time,
        title: lang === 'de' ? a.titleDe : a.titleEn,
        desc: lang === 'de' ? a.descDe : a.descEn,
        cat: catLabel(a.cat, lang),
      })),
    [lang],
  )

  const needle = q.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      all.filter(
        (a) =>
          (!cat || a.id === cat) &&
          (!needle || `${a.title} ${a.desc} ${a.cat}`.toLowerCase().includes(needle)),
      ),
    [all, cat, needle],
  )

  const categories = useMemo(
    () =>
      CATS.map((c) => ({
        id: c.id,
        label: lang === 'de' ? c.de[0] : c.en[0],
        note: lang === 'de' ? c.de[1] : c.en[1],
        count: all.filter((a) => a.id === c.id).length,
      })),
    [all, lang],
  )

  return {
    q,
    setQ,
    cat,
    setCat,
    filtered,
    categories,
    clearFilters: () => {
      setQ('')
      setCat('')
    },
  }
}
