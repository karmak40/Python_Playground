import { useI18n } from '../../i18n/I18nProvider'

export function Chart({
  index,
  url,
  onSave,
  onCopyCode,
}: {
  index: number
  url: string
  onSave: () => void
  onCopyCode: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="chart-title">
          <span className="chart-title-fig">Figure {index}</span>
          <span className="chart-cap">{t.studio.figCap}</span>
        </div>
        <div className="chart-actions">
          <span onClick={onSave}>{t.studio.figSave}</span>
          <span onClick={onCopyCode}>{t.studio.figCode}</span>
        </div>
      </div>
      <img className="chart-image" src={url} alt={`Figure ${index}`} />
    </div>
  )
}
