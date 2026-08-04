import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PythonClient, type LivePause } from '../../lib/python/client'
import { CODE_SOURCE, INITIAL_BREAKPOINTS } from './content'

type Status = 'loading' | 'paused' | 'done' | 'failed'

/** Drives the Debugger page over a *genuinely paused* live interpreter: the
 * script actually blocks mid-line (via Atomics.wait in the worker — see
 * src/lib/python/debugger.py's LiveDebugger and python.worker.ts's
 * pauseSync), and Step/Continue send real resume commands rather than
 * scrubbing a pre-recorded array. Only usable where SharedArrayBuffer exists
 * (see liveDebugAvailable() — callers should check that and fall back to
 * useDebuggerDemo's recording driver otherwise). */
export function useLiveDebugger() {
  const [current, setCurrent] = useState<LivePause | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [breakpoints] = useState<number[]>(INITIAL_BREAKPOINTS)
  const client = useMemo(
    () =>
      new PythonClient({
        onEvent: () => {},
        onProgress: () => {},
        onPause: (state) => {
          setCurrent(state)
          setStatus('paused')
        },
      }),
    [],
  )
  const paused = useRef(false)
  paused.current = status === 'paused'
  const cancelledRef = useRef(false)

  const beginSession = useCallback(() => {
    setStatus('loading')
    setCurrent(null)
    client
      .startLiveDebug(CODE_SOURCE, breakpoints)
      .then(() => {
        // A session that ran to completion without ever pausing again lands
        // here still "loading" (its last pause already flipped us to
        // "paused" otherwise) — either way the run is over now.
        if (!cancelledRef.current) setStatus('done')
      })
      .catch(() => {
        if (!cancelledRef.current) setStatus('failed')
      })
  }, [client, breakpoints])

  useEffect(() => {
    // In React Strict Mode this effect mounts, cleans up, then mounts again;
    // the cleanup's terminate() would otherwise surface as a spurious
    // "failed" for the very session the second mount is about to restart —
    // `cancelledRef` (checked inside beginSession, not just here) is what
    // tells that rejection apart from a real failure.
    cancelledRef.current = false
    beginSession()
    return () => {
      cancelledRef.current = true
      client.terminate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

  const stepForward = useCallback(() => {
    if (paused.current) client.resumeLiveDebug({ cmd: 'step' })
  }, [client])

  const continueRun = useCallback(() => {
    if (paused.current) client.resumeLiveDebug({ cmd: 'continue' })
  }, [client])

  // Live execution can't step backward — there is no recording to rewind.
  const back = useCallback(() => {}, [])

  const stop = useCallback(() => {
    if (paused.current) {
      client.resumeLiveDebug({ cmd: 'stop' })
    } else {
      // Nothing to resume (mid-execution with no pause pending, e.g. a
      // runaway loop) — the worker itself is the only thing that can stop it.
      client.terminate()
    }
    beginSession()
  }, [client, beginSession])

  return { current, status, breakpoints, back, stepForward, continueRun, stop, canStepBack: false }
}
