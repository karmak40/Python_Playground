import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  liveDebugAvailable,
  PythonClient,
  type LivePause,
  type PyFile,
  type PyVariable,
  type RunEvent,
} from '../../lib/python/client'
import { CODE_BAD, FIXED_LINE, replaceLine } from './content'

export type DebugStatus = 'idle' | 'starting' | 'paused'

export type MarginKind = 'val' | 'block' | 'chip' | 'error' | 'html'

export type MarginEntry = { kind: MarginKind; text: string }

export type StudioFigure = { url: string; line: number | null }

export type StudioError = {
  etype: string
  message: string
  line: number | null
  traceback: string
  columns: string[]
}

const ENTRY_FILE = 'main.py'
const WELCOME_SEEN_KEY = 'margin.welcomeSeen'

export type StudioState = {
  /** Every editable Python source file in the project, keyed by filename. */
  pyFiles: Record<string, string>
  /** Which one is open in the editor — also the one Run/Debug execute. */
  activeFile: string
  welcome: boolean
  share: boolean
  shareOn: boolean[]
  running: boolean
  breakpoints: number[]
  debugStatus: DebugStatus
  debugScope: [string, string][]
  debugStack: { name: string; line: number }[]
  /** 1-based source line -> everything that line produced this run. */
  outputs: Map<number, MarginEntry[]>
  error: StudioError | null
  activeLine: number
  flashLine: number
  vars: PyVariable[]
  figures: StudioFigure[]
  files: PyFile[]
  packages: string[]
  pythonVersion: string
  toast: string
  meta: string
  status: string
}

function initialState(): StudioState {
  return {
    pyFiles: { [ENTRY_FILE]: CODE_BAD },
    activeFile: ENTRY_FILE,
    // Shown once per browser, not once per visit — a returning visitor who
    // already picked a starting point shouldn't be asked again every time
    // they open the Playground.
    welcome: localStorage.getItem(WELCOME_SEEN_KEY) !== '1',
    share: false,
    shareOn: [true, true, false],
    running: false,
    breakpoints: [],
    debugStatus: 'idle',
    debugScope: [],
    debugStack: [],
    outputs: new Map(),
    error: null,
    activeLine: 0,
    flashLine: 0,
    vars: [],
    figures: [],
    files: [],
    packages: [],
    // Replaced with the interpreter's real version once the worker boots.
    pythonVersion: '3.14',
    toast: '',
    meta: '',
    status: '',
  }
}

/** Clears everything a *previous* run left behind — used whenever the active
 * file changes, since margin output/errors/figures only mean something next
 * to the run that produced them. */
function clearRunResults<T extends StudioState>(s: T): T {
  return {
    ...s,
    outputs: new Map(),
    error: null,
    vars: [],
    figures: [],
    activeLine: 0,
    meta: '',
    debugScope: [],
    debugStack: [],
  }
}

function appendOutput(outputs: Map<number, MarginEntry[]>, line: number, entry: MarginEntry) {
  const next = new Map(outputs)
  next.set(line, [...(next.get(line) ?? []), entry])
  return next
}

/** Runs the user's code for real, in a Pyodide worker, and folds the streamed
 * events (stdout, values, figures, variables, errors) back into UI state. */
export function useStudio() {
  const { t } = useI18n()
  const [state, setState] = useState<StudioState>(initialState)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const figureUrls = useRef<string[]>([])
  // run() is scheduled after state updates (e.g. from `fix`), so it must read
  // whatever's current at call time, not what a stale closure captured.
  const stateRef = useRef(state)
  stateRef.current = state

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])

  const showToast = useCallback(
    (msg: string) => {
      setState((s) => ({ ...s, toast: msg }))
      later(() => setState((s) => ({ ...s, toast: '' })), 2400)
    },
    [later],
  )

  const onEvent = useCallback((event: RunEvent) => {
    setState((s) => {
      switch (event.t) {
        case 'out': {
          if (event.line == null) return s
          const text = event.text.replace(/\n$/, '')
          if (!text) return s
          const kind: MarginKind = text.includes('\n')
            ? 'block'
            : event.stream === 'stderr'
              ? 'error'
              : 'val'
          return { ...s, outputs: appendOutput(s.outputs, event.line, { kind, text }) }
        }
        case 'value': {
          const entry: MarginEntry = event.html
            ? { kind: 'html', text: event.html }
            : { kind: event.repr.includes('\n') ? 'block' : 'val', text: event.repr }
          return { ...s, outputs: appendOutput(s.outputs, event.line, entry) }
        }
        case 'figure': {
          const url = URL.createObjectURL(new Blob([event.bytes as BlobPart], { type: event.mime }))
          figureUrls.current.push(url)
          const withChip =
            event.line == null
              ? s.outputs
              : appendOutput(s.outputs, event.line, {
                  kind: 'chip',
                  text: `→ Figure ${s.figures.length + 1}`,
                })
          return { ...s, outputs: withChip, figures: [...s.figures, { url, line: event.line }] }
        }
        case 'vars':
          return { ...s, vars: event.vars }
        case 'error': {
          const withMargin =
            event.line == null
              ? s.outputs
              : appendOutput(s.outputs, event.line, {
                  kind: 'error',
                  text: `${event.etype}: ${event.message}`,
                })
          return {
            ...s,
            outputs: withMargin,
            error: {
              etype: event.etype,
              message: event.message,
              line: event.line,
              traceback: event.traceback,
              columns: event.columns,
            },
            activeLine: event.line ?? 0,
          }
        }
      }
    })
  }, [])

  const onProgress = useCallback((event: { detail: string }) => {
    setState((s) => ({ ...s, status: event.detail }))
  }, [])

  const onPause = useCallback((pause: LivePause) => {
    setState((s) => ({
      ...s,
      debugStatus: 'paused',
      activeLine: pause.line,
      debugScope: pause.scope,
      debugStack: pause.stack,
    }))
  }, [])

  const client = useMemo(() => new PythonClient({ onEvent, onProgress, onPause }), [onEvent, onProgress, onPause])

  const refreshFiles = useCallback(async () => {
    const files = await client.listFiles()
    setState((s) => ({ ...s, files }))
  }, [client])

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout)
      figureUrls.current.forEach(URL.revokeObjectURL)
      client.terminate()
    }
  }, [client])

  const releaseFigures = useCallback(() => {
    figureUrls.current.forEach(URL.revokeObjectURL)
    figureUrls.current = []
  }, [])

  const run = useCallback(async () => {
    const { pyFiles, activeFile, running } = stateRef.current
    if (running) return
    releaseFigures()
    setState((s) => ({
      ...clearRunResults(s),
      running: true,
    }))
    // Every other project file gets written to the real filesystem so the
    // active file's own `import`s resolve; only the active file itself runs
    // through the margin-instrumented path (line-attributed output, the real
    // traceback formatting, bare-expression display).
    const otherFiles = Object.fromEntries(Object.entries(pyFiles).filter(([name]) => name !== activeFile))
    try {
      const result = await client.run(pyFiles[activeFile] ?? '', otherFiles)
      setState((s) => ({
        ...s,
        running: false,
        status: '',
        packages: result.packages,
        pythonVersion: result.python,
        meta: result.status === 'interrupted' ? t.studio.stoppedAfter : `${result.elapsedMs} ms`,
      }))
      if (result.status === 'ok') showToast(`${t.studio.finishedToast.split(' ')[0]} · ${result.elapsedMs} ms`)
      void refreshFiles()
    } catch (error) {
      setState((s) => ({
        ...s,
        running: false,
        status: '',
        error: {
          etype: 'RuntimeError',
          message: error instanceof Error ? error.message : String(error),
          line: null,
          traceback: '',
          columns: [],
        },
      }))
    }
  }, [client, releaseFigures, refreshFiles, showToast, t])

  /** Applies the suggested column-name fix and immediately re-runs. */
  const fix = useCallback(() => {
    setState((s) => ({
      ...s,
      pyFiles: { ...s.pyFiles, [s.activeFile]: replaceLine(s.pyFiles[s.activeFile] ?? '', 8, FIXED_LINE) },
      error: null,
      flashLine: 8,
    }))
    later(() => setState((s) => ({ ...s, flashLine: 0 })), 900)
    later(() => void run(), 420)
  }, [later, run])

  const stop = useCallback(() => {
    client.terminate()
    setState((s) => ({ ...s, running: false, status: '', meta: t.studio.stoppedAfter }))
  }, [client, t])

  const toggleBreakpoint = useCallback((line: number) => {
    setState((s) => ({
      ...s,
      breakpoints: s.breakpoints.includes(line)
        ? s.breakpoints.filter((n) => n !== line)
        : [...s.breakpoints, line].sort((a, b) => a - b),
    }))
  }, [])

  /** Starts a real, pausable debug session over the active file — enabled
   * for everyone right now to try; gating this behind a plan is a later,
   * separate decision, not implemented here. */
  const startDebug = useCallback(async () => {
    const { pyFiles, activeFile, running, debugStatus, breakpoints } = stateRef.current
    if (running || debugStatus !== 'idle') return
    if (!liveDebugAvailable()) {
      showToast(t.studio.debugUnavailable)
      return
    }
    releaseFigures()
    setState((s) => ({ ...clearRunResults(s), debugStatus: 'starting' }))
    const otherFiles = Object.fromEntries(Object.entries(pyFiles).filter(([name]) => name !== activeFile))
    try {
      const result = await client.startLiveDebug(pyFiles[activeFile] ?? '', breakpoints, otherFiles)
      setState((s) => ({
        ...s,
        debugStatus: 'idle',
        activeLine: 0,
        debugScope: [],
        debugStack: [],
        error: result.error
          ? { etype: result.error.etype, message: result.error.message, line: result.error.line, traceback: '', columns: [] }
          : s.error,
        meta: result.error ? '' : t.studio.debugFinished,
      }))
      void refreshFiles()
    } catch (error) {
      setState((s) => ({
        ...s,
        debugStatus: 'idle',
        error: {
          etype: 'RuntimeError',
          message: error instanceof Error ? error.message : String(error),
          line: null,
          traceback: '',
          columns: [],
        },
      }))
    }
  }, [client, releaseFigures, refreshFiles, showToast, t])

  const debugStepInto = useCallback(() => {
    if (stateRef.current.debugStatus === 'paused') client.resumeLiveDebug({ cmd: 'step' })
  }, [client])

  const debugContinue = useCallback(() => {
    if (stateRef.current.debugStatus === 'paused') client.resumeLiveDebug({ cmd: 'continue' })
  }, [client])

  const debugStop = useCallback(() => {
    if (stateRef.current.debugStatus === 'paused') {
      client.resumeLiveDebug({ cmd: 'stop' })
    } else {
      client.terminate()
      setState((s) => ({ ...s, debugStatus: 'idle', running: false }))
    }
  }, [client])

  const installPackage = useCallback(
    async (name: string) => {
      const result = await client.installPackage(name)
      if (result.ok) setState((s) => ({ ...s, packages: result.packages }))
      return { ok: result.ok, message: result.message }
    },
    [client],
  )

  const upload = useCallback(
    async (file: File) => {
      try {
        await client.upload(file)
        await refreshFiles()
        showToast(file.name)
      } catch (error) {
        showToast(error instanceof Error ? error.message : String(error))
      }
    },
    [client, refreshFiles, showToast],
  )

  const restart = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    releaseFigures()
    setState((s) => ({
      ...clearRunResults(s),
      pyFiles: { [ENTRY_FILE]: CODE_BAD },
      activeFile: ENTRY_FILE,
      welcome: true,
    }))
  }, [releaseFigures])

  const setCode = useCallback(
    (code: string) => setState((s) => ({ ...s, pyFiles: { ...s.pyFiles, [s.activeFile]: code } })),
    [],
  )

  const selectFile = useCallback((name: string) => {
    setState((s) => (s.pyFiles[name] === undefined || s.activeFile === name ? s : clearRunResults({ ...s, activeFile: name })))
  }, [])

  /** Creates a new, real, blank Python file — not a file-picker upload — and
   * switches the editor to it. `.py` is appended if the user didn't type it;
   * an existing name just switches to that file instead of clobbering it. */
  const newFile = useCallback(
    (rawName: string) => {
      const trimmed = rawName.trim()
      if (!trimmed) return
      const name = trimmed.endsWith('.py') ? trimmed : `${trimmed}.py`
      setState((s) => {
        if (s.pyFiles[name] !== undefined) return clearRunResults({ ...s, activeFile: name })
        return clearRunResults({
          ...s,
          pyFiles: { ...s.pyFiles, [name]: `# ${name}\n` },
          activeFile: name,
        })
      })
    },
    [],
  )

  /** Deletes a project source file. Always keeps at least one file — refusing
   * silently rather than leaving the Playground with nothing to edit or run.
   * Deleting the active file switches to main.py (or whatever's left). */
  const removePyFile = useCallback((name: string) => {
    setState((s) => {
      const remaining = Object.keys(s.pyFiles).filter((n) => n !== name)
      if (remaining.length === 0) return s
      const rest = { ...s.pyFiles }
      delete rest[name]
      const activeFile = s.activeFile === name ? (rest[ENTRY_FILE] !== undefined ? ENTRY_FILE : remaining[0]) : s.activeFile
      return clearRunResults({ ...s, pyFiles: rest, activeFile })
    })
  }, [])

  /** Deletes an uploaded data file for real — unlinks it from Pyodide's
   * filesystem, not just the file list shown in the sidebar. */
  const removeDataFile = useCallback(
    async (name: string) => {
      try {
        await client.removeFile(name)
        await refreshFiles()
      } catch (error) {
        showToast(error instanceof Error ? error.message : String(error))
      }
    },
    [client, refreshFiles, showToast],
  )

  const dismissWelcome = useCallback(() => {
    localStorage.setItem(WELCOME_SEEN_KEY, '1')
    setState((s) => ({ ...s, welcome: false }))
  }, [])
  const openShare = useCallback(() => setState((s) => ({ ...s, share: true })), [])
  const closeShare = useCallback(() => setState((s) => ({ ...s, share: false })), [])
  const toggleShareOpt = useCallback(
    (i: number) =>
      setState((s) => {
        const shareOn = s.shareOn.slice()
        shareOn[i] = !shareOn[i]
        return { ...s, shareOn }
      }),
    [],
  )

  return {
    state,
    client,
    run,
    stop,
    fix,
    upload,
    installPackage,
    restart,
    setCode,
    selectFile,
    newFile,
    removePyFile,
    removeDataFile,
    toggleBreakpoint,
    startDebug,
    debugStepInto,
    debugContinue,
    debugStop,
    dismissWelcome,
    openShare,
    closeShare,
    toggleShareOpt,
    showToast,
    later,
  }
}
