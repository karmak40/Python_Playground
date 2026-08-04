import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

type Page = 'app' | 'debugger' | 'help' | 'privacy' | 'terms' | 'contact'

export function Footer({ page }: { page: Page }) {
  const { t } = useI18n()
  return (
    <div className="site-footer">
      <span className="brand-word">Margin</span>
      {page !== 'privacy' && <Link to="/privacy">{t.common.footPrivacy}</Link>}
      {page !== 'terms' && <Link to="/terms">{t.common.footTerms}</Link>}
      {page !== 'help' && <Link to="/help">{t.common.footHelp}</Link>}
      {page !== 'debugger' && <Link to="/debugger">{t.common.footDbg}</Link>}
      {page !== 'contact' && <Link to="/contact">{t.common.footContact}</Link>}
      <span className="spacer" />
      <span>{t.common.footNote}</span>
    </div>
  )
}
