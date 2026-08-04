import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { LangSwitch, ThemeSwitch } from '../../components/Switches'
import { PricingLink } from '../../components/PricingLink'
import type { DebugStatus } from './useStudio'

export function StudioHeader({
  activeFile,
  running,
  status,
  slow,
  debugStatus,
  onShare,
  onRun,
  onStop,
  onDebug,
  onDebugStep,
  onDebugContinue,
  onDebugStop,
}: {
  activeFile: string
  running: boolean
  status: string
  /** A boot/package-load request has been pending unusually long — nudge the
   * user toward Stop instead of leaving them staring at a frozen status line. */
  slow: boolean
  debugStatus: DebugStatus
  onShare: () => void
  onRun: () => void
  onStop: () => void
  onDebug: () => void
  onDebugStep: () => void
  onDebugContinue: () => void
  onDebugStop: () => void
}) {
  const { t } = useI18n()
  const debugging = debugStatus !== 'idle'
  const busy = running || debugging

  return (
    <header className="site-header studio-header">
      <div className="brand">
        <span className="brand-word">Margin</span>
        <span className="brand-dot" />
        <span className="brand-tagline">{t.common.tagline}</span>
      </div>

      <div className="file-badge">
        <span className="file-badge-name">{activeFile}</span>
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

      {debugging ? (
        <>
          <button type="button" className="btn btn-outline" onClick={onDebugStep} disabled={debugStatus !== 'paused'}>
            {t.studio.debugStep}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onDebugContinue}
            disabled={debugStatus !== 'paused'}
          >
            {t.studio.debugContinue}
          </button>
          <button type="button" className="btn btn-outline" onClick={onDebugStop}>
            {t.studio.debugStop}
          </button>
        </>
      ) : (
        <>
          {running && (
            <button type="button" className="btn btn-outline" onClick={onStop}>
              {t.studio.stop}
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={onDebug} disabled={busy}>
            {t.studio.debug}
          </button>
        </>
      )}

      <button type="button" className="btn btn-primary btn-run" onClick={onRun} disabled={busy}>
        <span className={running || debugStatus === 'starting' ? 'run-spinner' : 'run-triangle'} />
        <span>
          {running
            ? (slow && t.studio.stillWorking) || status || t.studio.running
            : debugging
              ? (debugStatus === 'starting' && ((slow && t.studio.stillWorking) || status)) || t.studio.debugging
              : t.studio.run}
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, opacity: 0.6 }}>⌘↵</span>
      </button>
    </header>
  )
}
