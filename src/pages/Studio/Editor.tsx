import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import type { MarginEntry, StudioState } from './useStudio'
import { Chart } from './Chart'
import { CodeEditor, type CodeEditorHandle } from './CodeEditor'

function marginClass(kind: MarginEntry['kind']) {
  switch (kind) {
    case 'block':
      return 'margin-out is-block'
    case 'chip':
      return 'margin-out is-chip'
    case 'error':
      return 'margin-out is-error'
    case 'html':
      return 'margin-out is-html'
    default:
      return 'margin-out is-value'
  }
}

export function Editor({
  state,
  pythonVersion,
  onChangeCode,
  onToggleBreakpoint,
  onSaveFigure,
  onCopyFigureCode,
}: {
  state: StudioState
  pythonVersion: string
  onChangeCode: (code: string) => void
  onToggleBreakpoint: (line: number) => void
  onSaveFigure: (url: string) => void
  onCopyFigureCode: () => void
}) {
  const { t } = useI18n()
  const [handle, setHandle] = useState<CodeEditorHandle | null>(null)
  const code = state.pyFiles[state.activeFile] ?? ''

  const lineCount = code.split('\n').length
  const marginRows = handle
    ? [...state.outputs.entries()]
        .filter(([line]) => line >= 1 && line <= lineCount)
        .sort((a, b) => a[0] - b[0])
        .map(([line, entries]) => ({ line, top: handle.lineTop(line), entries }))
    : []

  return (
    <main className="editor-main" data-screen-label="Editor">
      <div className="editor-toolbar">
        <span>{t.studio.editorHint}</span>
        <span className="spacer" />
        <span className="editor-toolbar-meta">{state.status || state.meta}</span>
      </div>

      <div className="editor-lines-wrap">
        <div className="editor-code-col">
          <CodeEditor
            key={state.activeFile}
            value={code}
            onChange={onChangeCode}
            activeLine={state.activeLine}
            errorLine={state.error?.line ?? 0}
            flashLine={state.flashLine}
            breakpoints={state.breakpoints}
            onToggleBreakpoint={onToggleBreakpoint}
            onReady={setHandle}
          />
        </div>
        <div className="editor-margin-col">
          {marginRows.map((row) => (
            <div key={row.line} className="margin-stack" style={{ top: row.top }}>
              {row.entries.map((entry, i) =>
                entry.kind === 'html' ? (
                  <div
                    key={i}
                    className={marginClass(entry.kind)}
                    dangerouslySetInnerHTML={{ __html: entry.text }}
                  />
                ) : (
                  <div key={i} className={marginClass(entry.kind)}>
                    {entry.text}
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {state.figures.map((figure, i) => (
        <Chart
          key={figure.url}
          index={i + 1}
          url={figure.url}
          onSave={() => onSaveFigure(figure.url)}
          onCopyCode={onCopyFigureCode}
        />
      ))}

      <div className="editor-status">
        <span>Python {pythonVersion} · WebAssembly</span>
        <span>{t.studio.statusLocal}</span>
        <span className="spacer" />
        <span>UTF-8</span>
        <span>
          {lineCount} {lineCount === 1 ? 'line' : 'lines'}
        </span>
      </div>
    </main>
  )
}
