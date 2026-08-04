import { useI18n } from '../../i18n/I18nProvider'

export function Chart({
  index,
  url,
  title,
  onSave,
  onCopyCode,
}: {
  index: number
  url: string
  title: string
  onSave: () => void
  onCopyCode: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="chart-title">
          <span className="chart-title-fig">Figure {index}</span>
          {/* Whatever plt.title()/suptitle() the user's own code actually set
              — real, or absent, never invented. */}
          {title && <span className="chart-cap">{title}</span>}
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
