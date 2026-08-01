import { highlightPython, STUDIO_OPTS } from '../../lib/pyHighlight'
import { useI18n } from '../../i18n/I18nProvider'
import { OUTS } from './content'
import type { StudioState } from './useStudio'
import { Chart } from './Chart'

export function Editor({
  state,
  onSaveFigure,
  onCopyFigureCode,
}: {
  state: StudioState
  onSaveFigure: () => void
  onCopyFigureCode: () => void
}) {
  const { t } = useI18n()

  return (
    <main className="editor-main" data-screen-label="Editor">
      <div className="editor-toolbar">
        <span>{t.studio.editorHint}</span>
        <span className="spacer" />
        <span className="editor-toolbar-meta">{state.meta}</span>
      </div>

      <div className="editor-lines">
        {state.code.map((src, i) => {
          const n = i + 1
          const isErr = state.errorLine === n
          const revealed = state.revealed.includes(n)
          const out = OUTS[n]

          let rowClass = 'editor-row'
          if (state.activeLine === n) rowClass += ' is-active'
          if (isErr) rowClass += ' is-error'
          if (state.flashLine === n) rowClass += ' is-flash'

          let outNode: string | null = null
          let outClass = 'margin-out'
          if (isErr) {
            outNode = "KeyError: 'month'"
            outClass += ' is-error'
          } else if (revealed && out) {
            outNode = out.text
            outClass += out.kind === 'block' ? ' is-block' : out.kind === 'chip' ? ' is-chip' : ' is-value'
          }

          return (
            <div className={rowClass} key={n}>
              <div className="editor-ln">{n}</div>
              <div className="editor-src">{highlightPython(src, String(n), STUDIO_OPTS)}</div>
              <div className="editor-margin">{outNode !== null && <div className={outClass}>{outNode}</div>}</div>
            </div>
          )
        })}
      </div>

      {state.chartReady && <Chart onSave={onSaveFigure} onCopyCode={onCopyFigureCode} />}

      <div className="editor-status">
        <span>Python 3.12 · WebAssembly</span>
        <span>{t.studio.statusLocal}</span>
        <span className="spacer" />
        <span>UTF-8</span>
        <span>Ln 8, Col 1</span>
      </div>
    </main>
  )
}
