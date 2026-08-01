import { useCallback, useState } from 'react'
import { INITIAL_BREAKPOINTS, TRACE } from './content'

export function useDebuggerDemo() {
  const [step, setStep] = useState(0)
  const [breakpoints] = useState<number[]>(INITIAL_BREAKPOINTS)

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), [])
  const stepForward = useCallback(() => setStep((s) => (s + 1) % TRACE.length), [])
  const continueRun = useCallback(() => setStep(TRACE.length - 1), [])
  const stop = useCallback(() => setStep(0), [])

  return { step, breakpoints, back, stepForward, continueRun, stop }
}
