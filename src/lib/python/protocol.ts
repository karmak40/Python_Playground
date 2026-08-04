export type PyFile = { name: string; size: number }

export type WorkerRequest =
  | { t: 'boot'; id: number }
  | { t: 'run'; id: number; runId: number; code: string; otherFiles: Record<string, string> }
  | { t: 'trace'; id: number; code: string }
  | {
      t: 'startLiveDebug'
      id: number
      code: string
      breakpoints: number[]
      otherFiles: Record<string, string>
      sab: SharedArrayBuffer
    }
  | { t: 'installPackage'; id: number; name: string }
  | { t: 'putFile'; id: number; name: string; bytes: Uint8Array }
  | { t: 'rmFile'; id: number; name: string }
  | { t: 'listFiles'; id: number }

export type StackFrame = { name: string; line: number }

/** One real pause during a recorded debug run. */
export type TraceStep = {
  line: number
  reason: 'line' | 'return' | 'exception'
  func: string
  scope: [string, string][]
  stack: StackFrame[]
}

export type TraceResult = {
  trace: TraceStep[]
  truncated: boolean
  error: { etype: string; message: string; line: number | null } | null
  python: string
}

/** A real pause during a *live* debug run — same shape as one recorded step. */
export type LivePause = TraceStep

/** Sent over the SharedArrayBuffer control channel (Atomics), never over
 * postMessage: the worker is synchronously blocked while paused, so a
 * postMessage sent then would only be delivered after the whole run ends. */
export type LiveDebugCommand = {
  cmd: 'continue' | 'step' | 'next' | 'out' | 'stop'
  breakpoints?: number[]
}

export type LiveDebugError = { etype: string; message: string; line: number | null } | null

export type RunStatus = 'ok' | 'error' | 'interrupted'

export type PyVariable = { name: string; type: string; val: string }

/** Streamed while a run is in flight; every event carries its runId. */
export type RunEvent =
  | { t: 'out'; runId: number; stream: 'stdout' | 'stderr'; line: number | null; text: string }
  | { t: 'value'; runId: number; line: number; repr: string; html: string | null }
  | { t: 'figure'; runId: number; line: number | null; mime: string; bytes: Uint8Array; title: string }
  | { t: 'vars'; runId: number; vars: PyVariable[] }
  | {
      t: 'error'
      runId: number
      etype: string
      message: string
      line: number | null
      traceback: string
      /** DataFrame column names in scope — powers the error panel's fix hint. */
      columns: string[]
    }

export type BootInfo = { python: string; pyodide: string; packages: string[] }

export type WorkerResponse =
  | RunEvent
  | { t: 'progress'; phase: 'runtime' | 'packages' | 'executing'; detail: string }
  | { t: 'booted'; id: number; info: BootInfo }
  | {
      t: 'done'
      id: number
      runId: number
      status: RunStatus
      elapsedMs: number
      packages: string[]
      python: string
    }
  | { t: 'files'; id: number; files: PyFile[] }
  | { t: 'traced'; id: number; result: TraceResult }
  | { t: 'installed'; id: number; ok: boolean; message: string; packages: string[] }
  /** Posted asynchronously mid-session, not id-correlated to the
   * startLiveDebug request — the worker is about to block when this arrives. */
  | { t: 'debugPaused'; state: LivePause }
  | { t: 'debugDone'; id: number; error: LiveDebugError }
  | { t: 'ok'; id: number }
  | { t: 'failed'; id: number; message: string }
