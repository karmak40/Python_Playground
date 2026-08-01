import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { CODE_BAD, FIXED_LINE, VARS } from './content'

export type StudioState = {
  code: string[]
  welcome: boolean
  share: boolean
  shareOn: boolean[]
  running: boolean
  revealed: number[]
  errorLine: number
  activeLine: number
  flashLine: number
  vars: typeof VARS
  chartReady: boolean
  toast: string
  meta: string
}

const BROKEN_MARKER = '"month"'

function initialState(): StudioState {
  return {
    code: CODE_BAD.slice(),
    welcome: true,
    share: false,
    shareOn: [true, true, false],
    running: false,
    revealed: [],
    errorLine: 0,
    activeLine: 0,
    flashLine: 0,
    vars: [],
    chartReady: false,
    toast: '',
    meta: '',
  }
}

/** Ports the design prototype's scripted "run" — a fixed animation timeline
 * that either walks to a KeyError (line 8 still says "month") or reveals
 * outputs and the chart, rather than a real interpreter. */
export function useStudio() {
  const { t } = useI18n()
  const [state, setState] = useState<StudioState>(initialState)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  // run() is scheduled via setTimeout, so it must read the code that exists
  // when the timer fires, not the code captured by the closure when the
  // timer was scheduled (stale after `fix` rewrites line 8).
  const codeRef = useRef(state.code)
  codeRef.current = state.code

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout)
    }
  }, [])

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

  const run = useCallback(() => {
    setState((s) => {
      if (s.running) return s
      return { ...s, running: true, revealed: [], vars: [], chartReady: false, errorLine: 0, meta: '' }
    })

    const broken = codeRef.current[7].includes(BROKEN_MARKER)

    ;[1, 2, 5, 6].forEach((n, i) => later(() => setState((s) => ({ ...s, activeLine: n })), 90 * i + 120))

    if (broken) {
      later(() => setState((s) => ({ ...s, activeLine: 8 })), 480)
      later(
        () =>
          setState((s) => ({
            ...s,
            running: false,
            activeLine: 0,
            errorLine: 8,
            revealed: [6],
            meta: t.studio.stoppedAfter,
          })),
        780,
      )
    } else {
      const steps: [number, number][] = [
        [6, 300],
        [9, 620],
        [12, 950],
        [15, 1320],
      ]
      steps.forEach(([n, ms]) =>
        later(() => setState((s) => ({ ...s, revealed: s.revealed.concat(n), activeLine: n })), ms),
      )
      later(() => setState((s) => ({ ...s, vars: VARS })), 1000)
      later(
        () =>
          setState((s) => ({
            ...s,
            chartReady: true,
            running: false,
            activeLine: 0,
            meta: t.studio.finishedMeta,
          })),
        1420,
      )
      later(() => showToast(t.studio.finishedToast), 1460)
    }
  }, [later, showToast, t])

  const fix = useCallback(() => {
    setState((s) => {
      const code = s.code.slice()
      code[7] = FIXED_LINE
      return { ...s, code, errorLine: 0, flashLine: 8 }
    })
    later(() => setState((s) => ({ ...s, flashLine: 0 })), 900)
    later(run, 420)
  }, [later, run])

  const restart = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setState((s) => ({
      ...s,
      code: CODE_BAD.slice(),
      revealed: [],
      vars: [],
      chartReady: false,
      errorLine: 0,
      meta: '',
      welcome: true,
    }))
  }, [])

  const openWelcome = useCallback(() => setState((s) => ({ ...s, welcome: true })), [])
  const dismissWelcome = useCallback(() => setState((s) => ({ ...s, welcome: false })), [])
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
    run,
    fix,
    restart,
    openWelcome,
    dismissWelcome,
    openShare,
    closeShare,
    toggleShareOpt,
    showToast,
    later,
  }
}
