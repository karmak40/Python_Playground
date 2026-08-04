import { useI18n } from '../../i18n/I18nProvider'
import { highlightPython, DEBUGGER_OPTS } from '../../lib/pyHighlight'
import type { LivePause, TraceStep } from '../../lib/python/client'
import { CODE } from './content'

type DriverState = {
  current: LivePause | TraceStep | null | undefined
  status: string
  breakpoints: number[]
  back: () => void
  stepForward: () => void
  continueRun: () => void
  stop: () => void
  canStepBack: boolean
}

/** The fizz.py demo card, driven by whichever debugger backs it (real live
 * pause/resume or a real recorded trace — see DebuggerPage for the choice).
 * Purely presentational: everything about *how* stepping works lives in the
 * driver hook, not here. */
export function DebuggerDemoCard({
  mode,
  current,
  status,
  breakpoints,
  back,
  stepForward,
  continueRun,
  stop,
  canStepBack,
}: DriverState & { mode: 'live' | 'recorded' }) {
  const { t } = useI18n()
  const d = t.debugger

  const controls = [
    { label: d.back, act: back, disabled: !canStepBack },
    { label: d.step, act: stepForward, primary: true },
    { label: d.contin, act: continueRun },
    { label: d.stop, act: stop },
  ]
  const ready = status !== 'loading' && status !== 'failed'

  return (
    <>
      <div className="dbg-demo-card">
        <div className="dbg-demo-tab">
          <span>fizz.py</span>
          <span className={`dbg-mode-badge is-${mode}`}>{mode === 'live' ? d.modeLive : d.modeRecorded}</span>
          <span className="spacer" />
          <span className="dbg-paused">
            {status === 'loading' ? d.tracing : status === 'failed' ? d.traceFailed : `${d.pausedAt} ${current?.line ?? '—'}`}
          </span>
        </div>
        <div className="dbg-demo-body">
          <div className="dbg-code-pane">
            {CODE.map((src, i) => {
              const n = i + 1
              const active = current?.line === n
              const hasBp = breakpoints.includes(n)
              return (
                <div className={`dbg-line${active ? ' is-active' : ''}`} key={n}>
                  <span className={`dbg-bp-dot${hasBp ? ' is-set' : ''}`} />
                  <span className="dbg-line-num">{n}</span>
                  <span className="dbg-line-src">{highlightPython(src, String(n), DEBUGGER_OPTS)}</span>
                </div>
              )
            })}
          </div>
          <div className="dbg-side">
            <div className="dbg-controls">
              {controls.map((c) => (
                <button
                  type="button"
                  className={`dbg-ctrl-btn${c.primary ? ' is-primary' : ''}`}
                  key={c.label}
                  onClick={c.act}
                  disabled={!ready || c.disabled}
                  title={c.disabled ? d.noStepBack : undefined}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="dbg-scope">
              <span className="dbg-side-label">{d.scope}</span>
              {(current?.scope ?? []).map(([k, v]) => (
                <div className="dbg-scope-row" key={k}>
                  <span className="dbg-scope-key">{k}</span>
                  <span className="dbg-scope-val">{v}</span>
                </div>
              ))}
            </div>
            <div className="dbg-stack">
              <span className="dbg-side-label">{d.callstack}</span>
              {(current?.stack ?? []).map((frame, i) => (
                <span className={`dbg-stack-frame${i > 0 ? ' is-outer' : ''}`} key={`${frame.name}:${i}`}>
                  {frame.name === '<module>' ? frame.name : `${frame.name}()`} · fizz.py:{frame.line}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="dbg-demo-note">{mode === 'live' ? d.demoNoteLive : d.demoNote}</p>
    </>
  )
}
