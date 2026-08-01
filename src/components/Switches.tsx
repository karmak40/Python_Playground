import { useI18n } from '../i18n/I18nProvider'
import { useTheme } from '../theme/ThemeProvider'

export function LangSwitch() {
  const { lang, setLang, t } = useI18n()
  return (
    <div className="seg" role="group" aria-label={t.common.langSwitch}>
      <button
        type="button"
        className="seg-btn"
        aria-pressed={lang === 'en'}
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <button
        type="button"
        className="seg-btn"
        aria-pressed={lang === 'de'}
        onClick={() => setLang('de')}
      >
        DE
      </button>
    </div>
  )
}

export function ThemeSwitch() {
  const { theme, toggle } = useTheme()
  const { t } = useI18n()
  const target = theme === 'ink' ? t.common.themePaper : t.common.themeInk
  return (
    <button
      type="button"
      className="btn btn-ghost theme-switch"
      onClick={toggle}
      title={t.common.themeSwitchTo.replace('{theme}', target)}
    >
      <span className="theme-dot" aria-hidden="true" />
      <span>{target}</span>
    </button>
  )
}
