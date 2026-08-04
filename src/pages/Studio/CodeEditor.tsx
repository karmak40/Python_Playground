import { useEffect, useLayoutEffect, useRef } from 'react'
import { EditorState, RangeSetBuilder, StateEffect, StateField, type Extension } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  EditorView,
  GutterMarker,
  gutter,
  keymap,
  lineNumbers,
} from '@codemirror/view'
import type { Range } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { indentUnit, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { python } from '@codemirror/lang-python'
import { tags } from '@lezer/highlight'

export type MarginOutput = { kind: 'val' | 'block' | 'chip' | 'error'; text: string }

type LineHighlights = { active: number; error: number; flash: number }

const setLineHighlights = StateEffect.define<LineHighlights>()

const lineHighlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setLineHighlights)) {
        return buildLineDecorations(tr.state, effect.value)
      }
    }
    return tr.docChanged ? value.map(tr.changes) : value
  },
  provide: (field) => EditorView.decorations.from(field),
})

function buildLineDecorations(state: EditorState, hl: LineHighlights): DecorationSet {
  const marks: { line: number; cls: string }[] = []
  const add = (line: number, cls: string) => {
    if (line < 1 || line > state.doc.lines) return
    marks.push({ line, cls })
  }
  add(hl.active, 'cm-line-active')
  add(hl.error, 'cm-line-error')
  add(hl.flash, 'cm-line-flash')
  marks.sort((a, b) => a.line - b.line)
  const ranges: Range<Decoration>[] = marks.map((m) =>
    Decoration.line({ class: m.cls }).range(state.doc.line(m.line).from),
  )
  return Decoration.set(ranges)
}

// --- Breakpoint gutter --------------------------------------------------
// A real, clickable gutter: state lives in a StateField (so CM6 recomputes
// markers on every relevant update) and the click handler calls back into
// React through a ref, so the extension never needs reconstructing when the
// callback identity changes.

const setBreakpoints = StateEffect.define<number[]>()

const breakpointField = StateField.define<ReadonlySet<number>>({
  create: () => new Set(),
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setBreakpoints)) return new Set(effect.value)
    }
    return value
  },
})

class BreakpointMarker extends GutterMarker {
  toDOM() {
    const el = document.createElement('span')
    el.className = 'cm-breakpoint-dot'
    return el
  }
}
const breakpointMarker = new BreakpointMarker()

/** Built per CodeEditor instance (not shared module-level state) so the click
 * handler always calls back into the right component if more than one editor
 * is ever mounted at once. */
function makeBreakpointGutter(toggleRef: { current: (line: number) => void }) {
  return [
    breakpointField,
    gutter({
      class: 'cm-breakpoint-gutter',
      // Without this, CM6 skips creating a DOM element for lines that have
      // no marker at all — which is every line until the first breakpoint
      // is set, leaving nothing in the DOM to click in the first place.
      renderEmptyElements: true,
      markers(view) {
        const lines = view.state.field(breakpointField)
        const builder = new RangeSetBuilder<GutterMarker>()
        for (const line of [...lines].sort((a, b) => a - b)) {
          if (line < 1 || line > view.state.doc.lines) continue
          const pos = view.state.doc.line(line).from
          builder.add(pos, pos, breakpointMarker)
        }
        return builder.finish()
      },
      domEventHandlers: {
        mousedown(view, line) {
          toggleRef.current(view.state.doc.lineAt(line.from).number)
          return true
        },
      },
    }),
  ]
}

const marginHighlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword, tags.moduleKeyword], color: 'var(--kw)' },
  { tag: [tags.string, tags.special(tags.string)], color: 'var(--str)' },
  { tag: [tags.number, tags.integer, tags.float], color: 'var(--num)' },
  { tag: tags.comment, color: 'var(--com)', fontStyle: 'italic' },
  {
    tag: [
      tags.function(tags.variableName),
      tags.function(tags.propertyName),
      tags.definition(tags.function(tags.variableName)),
    ],
    color: 'var(--fn)',
  },
  { tag: [tags.bool, tags.null, tags.self], color: 'var(--bi)' },
  { tag: [tags.className, tags.definition(tags.className)], color: 'var(--gold)' },
  { tag: tags.propertyName, color: 'var(--ink)' },
  { tag: [tags.punctuation, tags.bracket, tags.operator, tags.separator], color: 'var(--muted)' },
])

const marginTheme = EditorView.theme({
  '&': {
    color: 'var(--ink)',
    backgroundColor: 'transparent',
    fontSize: '13.5px',
    height: 'auto',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'visible', fontFamily: 'var(--mono)', lineHeight: '26px' },
  '.cm-content': { padding: '0', caretColor: 'var(--ink)' },
  '.cm-line': { padding: '0 24px 0 0' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--faint)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 0',
    minWidth: '46px',
    fontSize: '11.5px',
  },
  '.cm-breakpoint-gutter': {
    width: '14px',
    cursor: 'pointer',
  },
  '.cm-breakpoint-gutter .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '.cm-breakpoint-dot': {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--red)',
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: 'var(--accent-soft) !important' },
  '.cm-cursor': { borderLeftColor: 'var(--ink)' },
  '.cm-line-active': { backgroundColor: 'var(--accent-soft)' },
  '.cm-line-error': { backgroundColor: 'var(--accent-soft)', boxShadow: 'inset 3px 0 0 var(--red)' },
  '.cm-line-flash': { animation: 'mg-flash 0.9s ease both' },
})

const staticExtensions: Extension[] = [
  lineNumbers(),
  history(),
  keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
  indentUnit.of('    '),
  python(),
  syntaxHighlighting(marginHighlightStyle),
  marginTheme,
  lineHighlightField,
  // Line wrapping is intentionally left off: the margin output column is
  // positioned by (line number → pixel offset), which only holds when
  // each source line renders as exactly one visual line.
]

export type CodeEditorHandle = {
  /** Screen-space top offset (px, relative to the editor's own content) of a 1-based line. */
  lineTop: (line: number) => number
  focus: () => void
}

export function CodeEditor({
  value,
  onChange,
  activeLine = 0,
  errorLine = 0,
  flashLine = 0,
  breakpoints,
  onToggleBreakpoint,
  readOnly = false,
  onReady,
}: {
  value: string
  onChange: (value: string) => void
  activeLine?: number
  errorLine?: number
  flashLine?: number
  breakpoints?: number[]
  onToggleBreakpoint?: (line: number) => void
  readOnly?: boolean
  onReady?: (handle: CodeEditorHandle) => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const onToggleBreakpointRef = useRef(onToggleBreakpoint ?? (() => {}))
  onToggleBreakpointRef.current = onToggleBreakpoint ?? (() => {})

  useLayoutEffect(() => {
    if (!hostRef.current) return
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          ...staticExtensions,
          makeBreakpointGutter(onToggleBreakpointRef),
          // F9 mirrors the standard IDE breakpoint shortcut (VS Code, Visual
          // Studio) — the gutter dots are otherwise mouse-only, with no way
          // to tab into individual gutter cells.
          keymap.of([
            {
              key: 'F9',
              run: (view) => {
                onToggleBreakpointRef.current(view.state.doc.lineAt(view.state.selection.main.head).number)
                return true
              },
            },
          ]),
          EditorView.editable.of(!readOnly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString())
          }),
        ],
      }),
      parent: hostRef.current,
    })
    viewRef.current = view

    // Lines never wrap (see the comment on `extensions`) and `.cm-content`
    // has no top padding, so a line's offset is just (line - 1) * lineHeight.
    // Read that height from computed CSS rather than CM6's `defaultLineHeight`
    // / `lineBlockAt().top`: both are backed by CM6's height oracle, which
    // holds a placeholder estimate until CM6's own rAF-scheduled measure pass
    // runs — and rAF never fires in a tab that isn't compositing (background
    // tab, hidden pane), which would leave margin output stuck at the wrong
    // offsets. Computed style is exact and available synchronously here.
    const lineHeight = () => {
      const css = parseFloat(getComputedStyle(view.contentDOM).lineHeight)
      return Number.isFinite(css) && css > 0 ? css : view.defaultLineHeight
    }
    onReady?.({
      lineTop: (line) => {
        const doc = view.state.doc
        if (line < 1 || line > doc.lines) return 0
        return (line - 1) * lineHeight()
      },
      focus: () => view.focus(),
    })
    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // External value changes (e.g. the "Fix" button rewriting a line, or a
  // restart) — only replace the doc when it actually differs from what CM6
  // already holds, so typing isn't clobbered by our own onChange echo.
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } })
    }
  }, [value])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({ effects: setLineHighlights.of({ active: activeLine, error: errorLine, flash: flashLine }) })
  }, [activeLine, errorLine, flashLine])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({ effects: setBreakpoints.of(breakpoints ?? []) })
  }, [breakpoints])

  return <div ref={hostRef} className="cm-host" />
}
