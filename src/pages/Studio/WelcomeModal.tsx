import type { CSSProperties } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { startsFor } from './content'

export function WelcomeModal({ onPick }: { onPick: (index: number) => void }) {
  const { t, lang } = useI18n()
  const starts = startsFor(lang)

  const dotStyle = (i: number): CSSProperties => ({
    width: 9,
    height: 9,
    borderRadius: i === 0 ? '50%' : i === 1 ? 1 : '50% 50% 50% 1px',
    background: i === 0 ? 'var(--accent)' : 'var(--rule2)',
  })

  return (
    <div className="modal-scrim">
      <div className="modal">
        <div className="modal-title">{t.studio.wTitle}</div>
        <p className="modal-body">{t.studio.wBody}</p>
        <div className="start-list">
          {starts.map((s, i) => (
            <button type="button" className="start-btn" key={s.title} onClick={() => onPick(i)}>
              <span className="start-dot" style={dotStyle(i)} />
              <span className="start-copy">
                <span className="start-title">{s.title}</span>
                <span className="start-note">{s.note}</span>
              </span>
              {s.tag && <span className="start-tag">{s.tag}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
