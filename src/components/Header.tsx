import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import { LangSwitch, ThemeSwitch } from './Switches'
import { PricingLink } from './PricingLink'

type Page = 'app' | 'debugger' | 'help'

/** Matches the source design: the current page's own nav item renders as a
 * plain underlined span, not a link back to itself — except the Playground
 * page, which has no self-link at all (the brand mark covers it). */
function NavItem({
  page,
  active,
  to,
  label,
}: {
  page: Page
  active: Page
  to: string
  label: string
}) {
  if (page === active) {
    return <span className="nav-link is-active">{label}</span>
  }
  return (
    <Link to={to} className="nav-link">
      {label}
    </Link>
  )
}

export function Header({ active }: { active: Page }) {
  const { t } = useI18n()

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-word">Margin</span>
        <span className="brand-dot" />
      </Link>

      <nav className="site-nav">
        {active !== 'app' && <NavItem page="app" active={active} to="/" label={t.common.navApp} />}
        <NavItem page="debugger" active={active} to="/debugger" label={t.common.navDbg} />
        <PricingLink className="nav-link">{t.common.navPricing}</PricingLink>
        <NavItem page="help" active={active} to="/help" label={t.common.navHelp} />
      </nav>

      <span className="spacer" />

      <LangSwitch />
      <ThemeSwitch />

      <Link to="/" className="btn btn-primary">
        {t.common.openApp}
      </Link>
    </header>
  )
}
