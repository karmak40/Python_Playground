import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { LangSwitch, ThemeSwitch } from '../../components/Switches'
import { PricingLink } from '../../components/PricingLink'

export function StudioHeader({
  running,
  onShare,
  onRun,
}: {
  running: boolean
  onShare: () => void
  onRun: () => void
}) {
  const { t } = useI18n()

  return (
    <header className="site-header studio-header">
      <div className="brand">
        <span className="brand-word">Margin</span>
        <span className="brand-dot" />
        <span className="brand-tagline">{t.common.tagline}</span>
      </div>

      <div className="file-badge">
        <span className="file-badge-name">sales_analysis.py</span>
        <span className="saved-pill">
          <span className="saved-dot" />
          <span>{t.studio.savedLocal}</span>
        </span>
      </div>

      <span className="spacer" />

      <LangSwitch />
      <ThemeSwitch />

      <nav className="site-nav">
        <PricingLink className="nav-link">{t.common.navPricing}</PricingLink>
        <Link to="/debugger" className="nav-link">
          {t.common.navDbg}
        </Link>
        <Link to="/help" className="nav-link">
          {t.common.navHelp}
        </Link>
      </nav>

      <button type="button" className="btn btn-outline" onClick={onShare}>
        {t.studio.share}
      </button>

      <button type="button" className="btn btn-primary btn-run" onClick={onRun}>
        <span className={running ? 'run-spinner' : 'run-triangle'} />
        <span>{running ? t.studio.running : t.studio.run}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, opacity: 0.6 }}>⌘↵</span>
      </button>
    </header>
  )
}
