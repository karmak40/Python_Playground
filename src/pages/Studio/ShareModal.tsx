import { useI18n } from '../../i18n/I18nProvider'
import { shareOptsFor } from './content'

export function ShareModal({
  shareOn,
  onToggle,
  onCopy,
  onClose,
}: {
  shareOn: boolean[]
  onToggle: (i: number) => void
  onCopy: () => void
  onClose: () => void
}) {
  const { t, lang } = useI18n()
  const opts = shareOptsFor(lang)

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{t.studio.sTitle}</div>
        <p className="modal-body">{t.studio.sBody}</p>

        <div className="share-link-row">
          <div className="share-link">margin.dev/p/8fq2-sales</div>
          <button type="button" className="share-copy-btn" onClick={onCopy}>
            {t.studio.copy}
          </button>
        </div>

        <div className="share-opts">
          {opts.map((o, i) => (
            <button type="button" className="share-opt-btn" key={o.title} onClick={() => onToggle(i)}>
              <span className={`share-checkbox${shareOn[i] ? ' is-on' : ''}`} />
              <span className="share-opt-copy">
                <span className="share-opt-title">{o.title}</span>
                <span className="share-opt-note">{o.note}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="share-upsell">
          <span className="pro-pill">Pro</span>
          <p>{t.studio.sUpsell}</p>
        </div>

        <button type="button" className="modal-done-btn" onClick={onClose}>
          {t.studio.done}
        </button>
      </div>
    </div>
  )
}
