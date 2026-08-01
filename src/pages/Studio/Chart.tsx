import { useI18n } from '../../i18n/I18nProvider'
import { BAR_VALUES, MONTHS } from './content'

export function Chart({ onSave, onCopyCode }: { onSave: () => void; onCopyCode: () => void }) {
  const { t } = useI18n()
  const max = Math.max(...BAR_VALUES)

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="chart-title">
          <span className="chart-title-fig">Figure 1</span>
          <span className="chart-cap">{t.studio.figCap}</span>
        </div>
        <div className="chart-actions">
          <span onClick={onSave}>{t.studio.figSave}</span>
          <span onClick={onCopyCode}>{t.studio.figCode}</span>
        </div>
      </div>

      <div className="chart-bars">
        {BAR_VALUES.map((v, i) => (
          <div className="chart-bar-col" key={MONTHS[i]}>
            <span className="chart-bar-val">{Math.round(v / 1000)}k</span>
            <div
              className="chart-bar"
              style={{
                height: `${(v / max) * 100}%`,
                background: i > 8 ? 'var(--accent)' : 'var(--gold)',
                opacity: i > 8 ? 1 : 0.55,
                animationDelay: `${i * 35}ms`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="chart-labels">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}
