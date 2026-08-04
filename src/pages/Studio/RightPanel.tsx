import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import type { StudioState } from './useStudio'

/** The design's "Fix line 8 for me" affordance, kept honest: only offer the
 * button when the failure really is a column name that differs from a real
 * column by case alone — which is exactly the demo script's bug. */
function caseFix(state: StudioState): { wanted: string; actual: string } | null {
  const error = state.error
  if (!error || error.etype !== 'KeyError') return null
  const wanted = error.message.replace(/^['"]|['"]$/g, '')
  const match = error.columns.find((c) => c.toLowerCase() === wanted.toLowerCase() && c !== wanted)
  return match ? { wanted, actual: match } : null
}

export function RightPanel({
  state,
  onFix,
  onChangeNotes,
}: {
  state: StudioState
  onFix: () => void
  onChangeNotes: (notes: string) => void
}) {
  const { t } = useI18n()
  const [showTraceback, setShowTraceback] = useState(false)
  const error = state.error
  const hasVars = state.vars.length > 0
  const fix = caseFix(state)

  const debugging = state.debugStatus !== 'idle'

  return (
    <aside className="studio-right">
      {debugging && (
        <div className="panel-block">
          <div className="panel-title-row">
            <span className="panel-title">{t.debugger.scope}</span>
            <span className="panel-count">
              {state.debugStatus === 'paused' ? t.debugger.pausedAt + ' ' + state.activeLine : t.studio.debugging}
            </span>
          </div>
          {state.debugScope.length > 0 ? (
            <div className="vars-list">
              {state.debugScope.map(([name, val]) => (
                <div className="var-row" key={name}>
                  <div className="var-row-head">
                    <span className="var-name">{name}</span>
                  </div>
                  <div className="var-val">{val}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="state-empty">{t.studio.stateEmpty}</p>
          )}
          {state.debugStack.length > 0 && (
            <div className="debug-stack">
              <span className="debug-side-label">{t.debugger.callstack}</span>
              {state.debugStack.map((frame, i) => (
                <span className={`debug-stack-frame${i > 0 ? ' is-outer' : ''}`} key={`${frame.name}:${i}`}>
                  {frame.name === '<module>' ? frame.name : `${frame.name}()`} · {state.activeFile}:{frame.line}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="panel-block error-block">
          <div className="error-title-row">
            <span className="error-dot" />
            <span className="panel-title">{t.studio.errTitle}</span>
          </div>
          <p className="error-body">
            {error.line != null && <strong>Line {error.line}</strong>}
            {error.line != null && ' — '}
            <code className="tick">{error.etype}</code>: {error.message}
          </p>

          {error.columns.length > 0 && (
            <div className="error-cols">
              <div>{t.studio.errCols}</div>
              <div className="error-cols-vals">{error.columns.join(' · ')}</div>
            </div>
          )}

          {showTraceback && error.traceback && <pre className="error-traceback">{error.traceback}</pre>}

          <div className="error-actions">
            {fix && (
              <button type="button" className="btn btn-primary" onClick={onFix}>
                {t.studio.fixBtn}
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowTraceback((v) => !v)}
            >
              {t.studio.traceBtn}
            </button>
          </div>
        </div>
      )}

      <div className="panel-block">
        <div className="panel-title-row">
          <span className="panel-title">{t.studio.state}</span>
          <span className="panel-count">
            {hasVars ? `${state.vars.length} ${t.studio.variables}` : '—'}
          </span>
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
        <textarea
          className="notes-input"
          value={state.notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder={t.studio.notesPlaceholder}
        />
      </div>
    </aside>
  )
}
