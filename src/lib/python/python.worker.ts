import { loadPyodide, type PyodideInterface } from 'pyodide'
import marginRuntimeSource from './margin_runtime.py?raw'
import debuggerSource from './debugger.py?raw'
import salesCsv from './sales.csv?raw'
import type {
  LiveDebugError,
  RunStatus,
  TraceResult,
  WorkerRequest,
  WorkerResponse,
} from './protocol'

// Referencing the "webworker" lib here would collide with the DOM lib the rest
// of the app compiles against, so the worker globals are narrowed by hand.
const ctx = self as unknown as {
  location: { origin: string }
  postMessage(message: WorkerResponse, transfer?: Transferable[]): void
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
}

const WORK_DIR = '/work'

// The core runtime (wasm + stdlib) is copied into the build by
// vite-plugin-static-copy so it is served same-origin and stays COEP-safe.
// Package wheels are not in the npm package at all, so the lockfile must be
// the CDN's: Pyodide resolves every wheel download relative to the lockfile's
// own URL. jsDelivr sends Cross-Origin-Resource-Policy: cross-origin, so those
// fetches survive cross-origin isolation.
const INDEX_URL = new URL('/assets/pyodide/', ctx.location.origin).href
const LOCK_FILE_URL = `https://cdn.jsdelivr.net/pyodide/v${__PYODIDE_VERSION__}/full/pyodide-lock.json`

let pyodide: PyodideInterface | null = null
let booting: Promise<PyodideInterface> | null = null
let currentRunId = 0
let pythonVersion = ''

/** The active live-debug session's control channel, set only while
 * start_live_debug() is running. Sized generously for a breakpoints list. */
let liveCtl: { view: Int32Array; body: Uint8Array } | null = null
const LIVE_CTL_BODY_BYTES = 8192

function post(message: WorkerResponse, transfer: Transferable[] = []) {
  ctx.postMessage(message, transfer)
}

/** Called from Python for every stdout line, bare-expression value, error and
 * variable snapshot. The payload arrives as JSON — see `_send` in
 * margin_runtime.py for why it is not passed as an object. */
function emit(kind: string, payloadJson: string) {
  const data = JSON.parse(payloadJson) as Record<string, unknown>
  post({ ...data, t: kind, runId: currentRunId } as unknown as WorkerResponse)
}

/** Figures come across as raw bytes so a PNG is never base64-inflated. `title`
 * is whatever the user's own plt.title()/suptitle() actually set — empty if
 * they didn't set one, never invented on their behalf. */
function emitFigure(line: number | null, mime: string, bytes: unknown, title: string) {
  // Python `bytes` may arrive either already converted or as a proxy; either
  // way copy it into a buffer we own, since the wasm heap behind it is reused.
  const proxy = bytes as { toJs?: () => Uint8Array; destroy?: () => void }
  let copy: Uint8Array
  if (typeof proxy.toJs === 'function') {
    copy = new Uint8Array(proxy.toJs())
    proxy.destroy?.()
  } else {
    copy = new Uint8Array(bytes as Uint8Array)
  }
  post({ t: 'figure', runId: currentRunId, line, mime, bytes: copy, title }, [copy.buffer])
}

/**
 * Called synchronously from Python (`_pause_sync` in debugger.py) at every
 * live-debug stop. Posts the paused state, then genuinely blocks this whole
 * worker thread — JS, wasm and the CPython interpreter riding on top of it —
 * via `Atomics.wait`, until the main thread writes a resume command into the
 * shared control buffer and calls `Atomics.notify`. Waiting in short slices
 * rather than forever means a stuck session can still be torn down by
 * terminating the worker outright (see PythonClient.terminate).
 */
function pauseSync(stateJson: string): string {
  post({ t: 'debugPaused', state: JSON.parse(stateJson) })
  const ctl = liveCtl
  if (!ctl) return JSON.stringify({ cmd: 'stop' })
  const seq = Atomics.load(ctl.view, 0)
  for (;;) {
    if (Atomics.wait(ctl.view, 0, seq, 50) !== 'timed-out') break
  }
  const len = Atomics.load(ctl.view, 1)
  // TextDecoder refuses to decode a view backed by a SharedArrayBuffer
  // ("must not be shared") — copy the bytes out into a plain buffer first.
  const bytes = new Uint8Array(len)
  bytes.set(ctl.body.subarray(0, len))
  return new TextDecoder().decode(bytes)
}

async function boot(): Promise<PyodideInterface> {
  if (pyodide) return pyodide
  if (booting) return booting

  booting = (async () => {
    post({ t: 'progress', phase: 'runtime', detail: 'Starting Python' })
    const instance = await loadPyodide({
      indexURL: INDEX_URL,
      lockFileURL: LOCK_FILE_URL,
      env: { MPLBACKEND: 'agg', MPLCONFIGDIR: '/tmp/mpl', HOME: WORK_DIR },
    })
    instance.globals.set('_emit', emit)
    instance.globals.set('_emit_figure', emitFigure)
    instance.globals.set('_pause_sync', pauseSync)
    instance.runPython(marginRuntimeSource)
    instance.runPython(debuggerSource)
    const info = JSON.parse(instance.runPython('bootstrap()') as string) as { python: string }
    // Seed the example dataset the starter script reads, so a first-time
    // visitor's very first Run works without uploading anything.
    instance.FS.writeFile(`${WORK_DIR}/sales.csv`, new TextEncoder().encode(salesCsv))
    pythonVersion = info.python
    pyodide = instance
    return instance
  })()

  return booting
}

function loadedPackages(instance: PyodideInterface): string[] {
  return Object.keys(instance.loadedPackages).sort()
}

/** Writes every non-entry project file as a real file in /work, so the entry
 * file's own `import helpers` finds real files on disk through Python's
 * normal import machinery — no special-casing needed beyond this. */
function writeProjectFiles(instance: PyodideInterface, otherFiles: Record<string, string>) {
  for (const [name, content] of Object.entries(otherFiles)) {
    instance.FS.writeFile(`${WORK_DIR}/${name}`, content)
  }
}

async function listFiles(instance: PyodideInterface) {
  const names: string[] = instance.FS.readdir(WORK_DIR).filter(
    (n: string) => n !== '.' && n !== '..',
  )
  return names
    .map((name) => {
      const stat = instance.FS.stat(`${WORK_DIR}/${name}`)
      return { name, size: stat.size as number }
    })
    .filter((f) => f.size >= 0)
}

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data
  try {
    switch (msg.t) {
      case 'boot': {
        const instance = await boot()
        post({
          t: 'booted',
          id: msg.id,
          info: { python: pythonVersion, pyodide: instance.version, packages: loadedPackages(instance) },
        })
        break
      }

      case 'run': {
        const instance = await boot()
        currentRunId = msg.runId
        writeProjectFiles(instance, msg.otherFiles)
        post({ t: 'progress', phase: 'packages', detail: 'Resolving imports' })
        // Scan every project file's imports, not just the entry file's — a
        // helper module's own `import numpy` should still trigger loading it.
        const combinedSource = [msg.code, ...Object.values(msg.otherFiles)].join('\n')
        await instance.loadPackagesFromImports(combinedSource)
        // Marks the point where every CDN-dependent fetch is done and only the
        // user's own code is left running — the client uses this to disarm its
        // stall watchdog, since from here on an open-ended wait is legitimate
        // (a slow script, not a stuck network request) and Stop is the only
        // correct way out.
        post({ t: 'progress', phase: 'executing', detail: '' })
        const raw = instance.runPython('run_user_code')(msg.code) as string
        const result = JSON.parse(raw) as { status: RunStatus; elapsedMs: number }
        post({
          t: 'done',
          id: msg.id,
          runId: msg.runId,
          status: result.status,
          elapsedMs: result.elapsedMs,
          packages: loadedPackages(instance),
          python: pythonVersion,
        })
        break
      }

      case 'trace': {
        const instance = await boot()
        await instance.loadPackagesFromImports(msg.code)
        const raw = instance.runPython('record_trace')(msg.code) as string
        post({ t: 'traced', id: msg.id, result: JSON.parse(raw) as TraceResult })
        break
      }

      case 'startLiveDebug': {
        const instance = await boot()
        writeProjectFiles(instance, msg.otherFiles)
        post({ t: 'progress', phase: 'packages', detail: 'Resolving imports' })
        const combinedSource = [msg.code, ...Object.values(msg.otherFiles)].join('\n')
        await instance.loadPackagesFromImports(combinedSource)
        // `view[0]` is a sequence counter the paused side waits on; `view[1]`
        // is the resume payload's length. The body starts right after both
        // Int32 slots (byte offset 8).
        liveCtl = { view: new Int32Array(msg.sab, 0, 2), body: new Uint8Array(msg.sab, 8, LIVE_CTL_BODY_BYTES) }
        post({ t: 'progress', phase: 'executing', detail: '' })
        try {
          const raw = instance.runPython('start_live_debug')(msg.code, msg.breakpoints) as string
          const result = JSON.parse(raw) as { error: LiveDebugError }
          post({ t: 'debugDone', id: msg.id, error: result.error })
        } finally {
          liveCtl = null
        }
        break
      }

      case 'installPackage': {
        const instance = await boot()
        try {
          // micropip itself is a small (~0.1 MB) pure-Python wheel, loaded
          // once and cached like any other package.
          await instance.loadPackage('micropip')
          await instance.runPython('install_from_pypi')(msg.name)
          post({ t: 'installed', id: msg.id, ok: true, message: '', packages: loadedPackages(instance) })
        } catch (error) {
          post({
            t: 'installed',
            id: msg.id,
            ok: false,
            message: error instanceof Error ? error.message : String(error),
            packages: loadedPackages(instance),
          })
        }
        break
      }

      case 'putFile': {
        const instance = await boot()
        instance.FS.writeFile(`${WORK_DIR}/${msg.name}`, msg.bytes)
        post({ t: 'ok', id: msg.id })
        break
      }

      case 'rmFile': {
        const instance = await boot()
        instance.FS.unlink(`${WORK_DIR}/${msg.name}`)
        post({ t: 'ok', id: msg.id })
        break
      }

      case 'listFiles': {
        const instance = await boot()
        post({ t: 'files', id: msg.id, files: await listFiles(instance) })
        break
      }
    }
  } catch (error) {
    post({ t: 'failed', id: msg.id, message: error instanceof Error ? error.message : String(error) })
  }
}
