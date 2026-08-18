import { Link, Navigate, useParams } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { useI18n } from '../../i18n/I18nProvider'
import { articleBySlug } from './content'
import './Help.css'

export function HelpArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, lang } = useI18n()
  const article = slug ? articleBySlug(slug, lang) : null

  // An unknown slug (stale link, hand-edited URL) sends the reader somewhere
  // real instead of a dead end.
  if (!article) return <Navigate to="/help" replace />

  return (
    <div className="page">
      <Header active="help" />

      <section className="section section-narrow" style={{ paddingTop: 54 }}>
        <Link to="/help" className="article-back">
          {t.help.backToHelp}
        </Link>

        <div className="article-detail-head">
          <span className="article-cat">{article.catLabel}</span>
          <span className="article-time">{article.time}</span>
        </div>
        <h1 className="article-detail-title">{article.title}</h1>
        <p className="article-detail-desc">{article.desc}</p>

        <div className="article-detail-body">
          {article.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="section section-narrow" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Footer page="help" />
      </section>
    </div>
  )
}
