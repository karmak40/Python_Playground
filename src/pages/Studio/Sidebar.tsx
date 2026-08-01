import { useI18n } from '../../i18n/I18nProvider'
import { PACKAGES, recipesFor } from './content'

export function Sidebar({ onRecipePick }: { onRecipePick: () => void }) {
  const { t, lang } = useI18n()
  const recipes = recipesFor(lang)

  return (
    <aside className="studio-aside">
      <div className="aside-group">
        <div className="aside-label">{t.studio.files}</div>
        <div className="aside-file-active">
          <span className="file-badge-name">sales_analysis.py</span>
        </div>
        <div className="aside-file">
          <span className="file-badge-name">sales.csv</span>
          <span style={{ fontSize: 10.5, color: 'var(--faint)' }}>18 KB</span>
        </div>
        <button type="button" className="aside-row-btn">
          {t.studio.newFile}
        </button>
      </div>

      <div className="aside-group">
        <div className="aside-label">{t.studio.packages}</div>
        {PACKAGES.map((p) => (
          <div className="pkg-row" key={p.name}>
            <span className="pkg-name">{p.name}</span>
            <span className="pkg-ver">{p.ver}</span>
          </div>
        ))}
        <button type="button" className="aside-row-btn">
          {t.studio.install}
        </button>
      </div>

      <div className="aside-group">
        <div className="aside-label">{t.studio.recipes}</div>
        {recipes.map((r) => (
          <button type="button" className="recipe-btn" key={r.title} onClick={onRecipePick}>
            <span className="recipe-title">{r.title}</span>
            <span className="recipe-note">{r.note}</span>
          </button>
        ))}
      </div>

      <div className="aside-privacy">{t.studio.privacy}</div>
    </aside>
  )
}
