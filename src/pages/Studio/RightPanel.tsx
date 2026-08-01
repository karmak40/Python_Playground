import { useI18n } from '../../i18n/I18nProvider'
import { Ticked } from '../../components/Ticked'
import type { StudioState } from './useStudio'

export function RightPanel({ state, onFix }: { state: StudioState; onFix: () => void }) {
  const { t } = useI18n()
  const hasError = state.errorLine > 0
  const hasVars = state.vars.length > 0

  return (
    <aside className="studio-right">
      {hasError && (
        <div className="panel-block error-block">
          <div className="error-title-row">
            <span className="error-dot" />
            <span className="panel-title">{t.studio.errTitle}</span>
          </div>
          <p className="error-body">
            <Ticked text={t.studio.errBody} />
          </p>
          <div className="error-cols">
            <div>{t.studio.errCols}</div>
            <div className="error-cols-vals">Month · Region · Units · Revenue</div>
          </div>
          <div className="error-actions">
            <button type="button" className="btn btn-primary" onClick={onFix}>
              {t.studio.fixBtn}
            </button>
            <button type="button" className="btn btn-ghost">
              {t.studio.traceBtn}
            </button>
          </div>
        </div>
      )}

      <div className="panel-block">
        <div className="panel-title-row">
          <span className="panel-title">{t.studio.state}</span>
          <span className="panel-count">{hasVars ? `${state.vars.length} ${t.studio.variables}` : '—'}</span>
        </div>
        {hasVars ? (
          <div className="vars-list">
            {state.vars.map((v) => (
              <div className="var-row" key={v.name}>
                <div className="var-row-head">
                  <span className="var-name">{v.name}</span>
                  <span className="var-type">{v.type}</span>
                </div>
                <div className="var-val">{v.val}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="state-empty">{t.studio.stateEmpty}</p>
        )}
      </div>

      <div className="panel-block" style={{ borderBottom: 0 }}>
        <div className="notes-title">{t.studio.notes}</div>
        <p className="notes-body">{t.studio.notesBody}</p>
      </div>
    </aside>
  )
}
