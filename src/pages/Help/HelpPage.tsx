import { Link } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { PricingLink } from '../../components/PricingLink'
import { useI18n, countLabel } from '../../i18n/I18nProvider'
import { CHIPS, catLabel } from './content'
import { useHelpFilters } from './useHelpFilters'
import './Help.css'

const TS_KEYS = ['ts1', 'ts2', 'ts3', 'ts4'] as const

export function HelpPage() {
  const { t, lang } = useI18n()
  const h = t.help
  const { q, setQ, cat, setCat, filtered, categories, clearFilters } = useHelpFilters(lang)
  const chips = CHIPS[lang]
  const hasFilters = q.length > 0 || cat !== ''

  return (
    <div className="page">
      <Header active="help" />

      <section className="help-hero">
        <div className="help-hero-inner">
          <div className="help-crumb">{h.crumb}</div>
          <h1 className="help-h1">{h.h1}</h1>
          <p className="help-sub">{h.sub}</p>

          <div className="help-search">
            <span className="help-search-icon" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={h.searchPh}
              aria-label={h.searchLabel}
            />
            {q.length > 0 && (
              <button type="button" className="help-search-clear" onClick={() => setQ('')} aria-label={h.clearSearch}>
                ✕
              </button>
            )}
          </div>

          <div className="help-chips">
            <span className="help-chips-label">{h.popular}</span>
            {chips.map((label) => (
              <button
                type="button"
                className="help-chip"
                key={label}
                onClick={() => {
                  setQ(label)
                  setCat('')
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-narrow">
        <div className="help-cats-head">
          <h2>{h.catsH}</h2>
          {hasFilters && (
            <button type="button" className="clear-cat-btn" onClick={clearFilters}>
              {h.clearFilters}
            </button>
          )}
        </div>
        <div className="cat-grid">
          {categories.map((c) => {
            const active = cat === c.id
            return (
              <button
                type="button"
                className={`cat-tile${active ? ' is-active' : ''}`}
                key={c.id}
                onClick={() => setCat((prev) => (prev === c.id ? '' : c.id))}
              >
                <span className="cat-tile-head">
                  <span className={`cat-dot${active ? ' is-active' : ''}`} />
                  <span className="cat-tile-label">{c.label}</span>
                </span>
                <span className="cat-tile-note">{c.note}</span>
                <span className="cat-tile-count">{countLabel(c.count, t)}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="section section-narrow">
        <div className="list-head">
          <h2>{cat ? catLabel(cat, lang) : h.allArticles}</h2>
          <span className="list-count">{countLabel(filtered.length, t)}</span>
        </div>
        <div className="article-list">
          {filtered.map((a) => (
            <Link className="article-row" key={a.slug} to={`/help/${a.slug}`}>
              <span className="article-cat">{a.cat}</span>
              <span className="article-copy">
                <span className="article-title">{a.title}</span>
                <span className="article-desc">{a.desc}</span>
              </span>
              <span className="article-time">{a.time}</span>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-title">{h.emptyT}</span>
            <span className="empty-body">{h.emptyB}</span>
          </div>
        )}
      </section>

      <section className="section section-narrow">
        <h2 className="h2" style={{ fontSize: 26, marginBottom: 20 }}>
          {h.tsH}
        </h2>
        <div className="ts-grid">
          {TS_KEYS.map((k) => (
            <div className="ts-item" key={k}>
              <h3>{h[`${k}q` as keyof typeof h]}</h3>
              <p>{h[`${k}a` as keyof typeof h]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-narrow" style={{ paddingBottom: 80 }}>
        <div className="contact-grid">
          <div className="contact-card">
            <h3>{h.c1t}</h3>
            <p>{h.c1b}</p>
          </div>
          <div className="contact-card">
            <h3>{h.c2t}</h3>
            <p>
              {h.c2b} <PricingLink>{h.c2link}</PricingLink>.
            </p>
          </div>
        </div>
        <Footer page="help" />
      </section>
    </div>
  )
}
