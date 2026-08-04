import { useCallback, useEffect, useMemo, useState } from 'react'
import { PythonClient, type TraceStep } from '../../lib/python/client'
import { CODE_SOURCE, INITIAL_BREAKPOINTS } from './content'

/** Drives the Debugger page over a *real recorded* run of fizz.py: the script
 * actually executes once, under Python's own `bdb` machinery (see
 * src/lib/python/debugger.py), and every line/return/exception pause — with
 * its real captured locals — becomes one entry in `trace`. Back/Step/
 * Continue/Stop then just scrub an index over that real recording. */
export function useDebuggerDemo() {
  const [step, setStep] = useState(0)
  const [breakpoints] = useState<number[]>(INITIAL_BREAKPOINTS)
  const [trace, setTrace] = useState<TraceStep[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const listeners = useMemo(() => ({ onEvent: () => {}, onProgress: () => {} }), [])
  const client = useMemo(() => new PythonClient(listeners), [listeners])

  useEffect(() => {
    // In React Strict Mode this effect mounts, cleans up, then mounts again;
    // the cleanup's terminate() rejects whatever trace() call is in flight,
    // so `cancelled` (not a "have we ever started" ref) is what distinguishes
    // "this run was superseded" from "this run should still update state" —
    // the second mount's own call always needs to run to completion.
    let cancelled = false
    client
      .trace(CODE_SOURCE)
      .then((result) => {
        if (cancelled) return
        setTrace(result.trace)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('failed')
      })
    return () => {
      cancelled = true
      client.terminate()
    }
  }, [client])

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), [])
  const stepForward = useCallback(
    () => setStep((s) => (trace.length ? (s + 1) % trace.length : 0)),
    [trace.length],
  )
  const continueRun = useCallback(() => setStep(Math.max(0, trace.length - 1)), [trace.length])
  const stop = useCallback(() => setStep(0), [])

  return {
    current: trace[step],
    status,
    breakpoints,
    back,
    stepForward,
    continueRun,
    stop,
    canStepBack: true,
  }
}
