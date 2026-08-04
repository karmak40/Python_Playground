import type {
  BootInfo,
  LiveDebugCommand,
  LiveDebugError,
  LivePause,
  PyFile,
  RunEvent,
  RunStatus,
  TraceResult,
  WorkerRequest,
  WorkerResponse,
} from './protocol'

export type {
  BootInfo,
  LiveDebugCommand,
  LiveDebugError,
  LivePause,
  PyFile,
  PyVariable,
  RunEvent,
  RunStatus,
  TraceResult,
  TraceStep,
} from './protocol'

/** True where a live pausable debug session is possible at all: it needs
 * SharedArrayBuffer, which only exists under cross-origin isolation. Where
 * false (Safari with credentialless COEP, an iframe embed, an unconfigured
 * host), fall back to PythonClient.trace()'s recording driver instead. */
export function liveDebugAvailable(): boolean {
  return typeof SharedArrayBuffer !== 'undefined'
}

export type RunResult = {
  status: RunStatus
  elapsedMs: number
  packages: string[]
  python: string
}

export type ProgressEvent = { phase: 'runtime' | 'packages' | 'executing'; detail: string }

/** Anything a caller can subscribe to that isn't tied to a single request. */
type Listeners = {
  onEvent: (event: RunEvent) => void
  onProgress: (event: ProgressEvent) => void
  /** Fired on every real pause during a live debug session. */
  onPause?: (state: LivePause) => void
}

const LIVE_CTL_BODY_BYTES = 8192

type Pending = { resolve: (value: never) => void; reject: (error: Error) => void }

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

/**
 * Owns the Python worker and the request/response correlation over it.
 *
 * The worker is spawned lazily on first use — nothing Python-related is
 * fetched while the visitor is only reading the landing page.
 */
export class PythonClient {
  private worker: Worker | null = null
  private pending = new Map<number, Pending>()
  private nextId = 1
  private nextRunId = 1
  private listeners: Listeners
  /** Main-thread half of the live-debug control channel: same buffer the
   * worker's `pauseSync` blocks on, so a resume command actually reaches a
   * worker that is synchronously frozen inside Atomics.wait. */
  private liveCtl: { view: Int32Array; body: Uint8Array } | null = null

  constructor(listeners: Listeners) {
    this.listeners = listeners
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker
    const worker = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => this.handle(event.data)
    worker.onerror = (event) => this.failAll(new Error(event.message || 'Python worker crashed'))
    this.worker = worker
    return worker
  }

  private handle(msg: WorkerResponse) {
    switch (msg.t) {
      case 'progress':
        this.listeners.onProgress({ phase: msg.phase, detail: msg.detail })
        return
      case 'out':
      case 'value':
      case 'figure':
      case 'vars':
      case 'error':
        this.listeners.onEvent(msg)
        return
      case 'debugPaused':
        this.listeners.onPause?.(msg.state)
        return
      case 'failed': {
        this.pending.get(msg.id)?.reject(new Error(msg.message))
        this.pending.delete(msg.id)
        return
      }
      default: {
        const entry = this.pending.get(msg.id)
        if (!entry) return
        this.pending.delete(msg.id)
        entry.resolve(msg as never)
      }
    }
  }

  private failAll(error: Error) {
    for (const entry of this.pending.values()) entry.reject(error)
    this.pending.clear()
  }

  private request<T extends WorkerResponse>(
    build: (id: number) => WorkerRequest,
    transfer: Transferable[] = [],
  ): Promise<T> {
    const worker = this.ensureWorker()
    const id = this.nextId++
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: never) => void, reject })
      worker.postMessage(build(id), transfer)
    })
  }

  boot(): Promise<BootInfo> {
    return this.request<Extract<WorkerResponse, { t: 'booted' }>>((id) => ({ t: 'boot', id })).then(
      (r) => r.info,
    )
  }

  run(code: string, otherFiles: Record<string, string> = {}): Promise<RunResult> {
    const runId = this.nextRunId++
    return this.request<Extract<WorkerResponse, { t: 'done' }>>((id) => ({
      t: 'run',
      id,
      runId,
      code,
      otherFiles,
    })).then((r) => ({
      status: r.status,
      elapsedMs: r.elapsedMs,
      packages: r.packages,
      python: r.python,
    }))
  }

  /** Runs `code` under the recording debugger and returns its full trace. */
  trace(code: string): Promise<TraceResult> {
    return this.request<Extract<WorkerResponse, { t: 'traced' }>>((id) => ({
      t: 'trace',
      id,
      code,
    })).then((r) => r.result)
  }

  /**
   * Starts a real, pausable debug run: the interpreter genuinely halts at
   * each breakpoint/step (see debugger.py's LiveDebugger), streaming pauses
   * to `onPause` until the script finishes, is stopped, or errors. Requires
   * `liveDebugAvailable()` — check that before calling, or this throws.
   */
  startLiveDebug(
    code: string,
    breakpoints: number[],
    otherFiles: Record<string, string> = {},
  ): Promise<{ error: LiveDebugError }> {
    if (!liveDebugAvailable()) {
      throw new Error('Live debugging needs cross-origin isolation (SharedArrayBuffer unavailable)')
    }
    const sab = new SharedArrayBuffer(8 + LIVE_CTL_BODY_BYTES)
    this.liveCtl = { view: new Int32Array(sab, 0, 2), body: new Uint8Array(sab, 8, LIVE_CTL_BODY_BYTES) }
    return this.request<Extract<WorkerResponse, { t: 'debugDone' }>>((id) => ({
      t: 'startLiveDebug',
      id,
      code,
      breakpoints,
      otherFiles,
      sab,
    })).then((r) => {
      this.liveCtl = null
      return { error: r.error }
    })
  }

  /** Resumes a paused live-debug session. Must go through the shared control
   * buffer (Atomics), never postMessage: the worker is blocked inside
   * Atomics.wait and won't service its message queue until this resolves it. */
  resumeLiveDebug(command: LiveDebugCommand) {
    const ctl = this.liveCtl
    if (!ctl) return
    const bytes = new TextEncoder().encode(JSON.stringify(command))
    if (bytes.length > LIVE_CTL_BODY_BYTES) {
      throw new Error('Live debug command too large')
    }
    ctl.body.set(bytes)
    Atomics.store(ctl.view, 1, bytes.length)
    Atomics.add(ctl.view, 0, 1)
    Atomics.notify(ctl.view, 0)
  }

  /** Installs a real pure-Python package from PyPI at runtime via micropip.
   * Rejects with the real error for anything with compiled C extensions not
   * built for Emscripten — that failure is genuine, not a stub. */
  installPackage(name: string): Promise<{ ok: boolean; message: string; packages: string[] }> {
    return this.request<Extract<WorkerResponse, { t: 'installed' }>>((id) => ({
      t: 'installPackage',
      id,
      name,
    })).then((r) => ({ ok: r.ok, message: r.message, packages: r.packages }))
  }

  async upload(file: File): Promise<void> {
    if (file.size > MAX_UPLOAD_BYTES) {
      // The virtual filesystem is plain wasm heap memory, so an oversized
      // file takes the whole tab down rather than failing gracefully.
      throw new Error(
        `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
      )
    }
    // Raw bytes, never a decoded string: CSVs exported from Excel are often
    // cp1252, and decoding here would corrupt them before pandas sees them.
    const bytes = new Uint8Array(await file.arrayBuffer())
    await this.request<Extract<WorkerResponse, { t: 'ok' }>>(
      (id) => ({ t: 'putFile', id, name: file.name, bytes }),
      [bytes.buffer],
    )
  }

  removeFile(name: string): Promise<void> {
    return this.request<Extract<WorkerResponse, { t: 'ok' }>>((id) => ({
      t: 'rmFile',
      id,
      name,
    })).then(() => undefined)
  }

  listFiles(): Promise<PyFile[]> {
    return this.request<Extract<WorkerResponse, { t: 'files' }>>((id) => ({
      t: 'listFiles',
      id,
    })).then((r) => r.files)
  }

  /**
   * Hard-stop a runaway script. Terminating is the only reliable way out of a
   * tight loop or a stuck C extension, so the worker is dropped and the next
   * call transparently boots a fresh one.
   */
  terminate() {
    this.worker?.terminate()
    this.worker = null
    this.liveCtl = null
    this.failAll(new Error('Python runtime stopped'))
  }
}
