import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

type Page = 'app' | 'debugger' | 'help'

export function Footer({ page }: { page: Page }) {
  const { t } = useI18n()
  return (
    <div className="site-footer">
      <span className="brand-word">Margin</span>
      <span>{t.common.footPrivacy}</span>
      <span>{t.common.footTerms}</span>
      {page !== 'help' && <Link to="/help">{t.common.footHelp}</Link>}
      {page !== 'debugger' && <Link to="/debugger">{t.common.footDbg}</Link>}
      <span>{t.common.footContact}</span>
      <span className="spacer" />
      <span>{t.common.footNote}</span>
    </div>
  )
}
