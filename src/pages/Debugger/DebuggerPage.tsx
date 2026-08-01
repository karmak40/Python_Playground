import { Link } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Ticked } from '../../components/Ticked'
import { useI18n } from '../../i18n/I18nProvider'
import { highlightPython, DEBUGGER_OPTS } from '../../lib/pyHighlight'
import { CODE, TRACE } from './content'
import { useDebuggerDemo } from './useDebuggerDemo'
import './Debugger.css'

const CAP_KEYS = ['cap1', 'cap2', 'cap3', 'cap4'] as const
const STEP_KEYS = ['s1', 's2', 's3'] as const
const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4'] as const

export function DebuggerPage() {
  const { t } = useI18n()
  const d = t.debugger
  const { step, breakpoints, back, stepForward, continueRun, stop } = useDebuggerDemo()
  const current = TRACE[step]

  const controls = [
    { label: d.back, act: back },
    { label: d.step, act: stepForward, primary: true },
    { label: d.contin, act: continueRun },
    { label: d.stop, act: stop },
  ]

  return (
    <div className="page">
      <Header active="debugger" />

      <section className="dbg-hero">
        <div className="dbg-hero-inner">
          <div className="dbg-crumb">{d.crumb}</div>
          <h1 className="dbg-h1">{d.h1}</h1>
          <p className="dbg-sub">{d.sub}</p>
          <div className="dbg-cta-row">
            <Link to="/" className="btn btn-primary lg">
              {d.cta1}
            </Link>
            <Link to="/help" className="btn btn-outline lg">
              {d.cta2}
            </Link>
            <span className="dbg-cta-note">{d.ctaNote}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="dbg-demo-card">
          <div className="dbg-demo-tab">
            <span>fizz.py</span>
            <span className="spacer" />
            <span className="dbg-paused">
              {d.pausedAt} {current.line}
            </span>
          </div>
          <div className="dbg-demo-body">
            <div className="dbg-code-pane">
              {CODE.map((src, i) => {
                const n = i + 1
                const active = current.line === n
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
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="dbg-scope">
                <span className="dbg-side-label">{d.scope}</span>
                {current.scope.map(([k, v]) => (
                  <div className="dbg-scope-row" key={k}>
                    <span className="dbg-scope-key">{k}</span>
                    <span className="dbg-scope-val">{v}</span>
                  </div>
                ))}
              </div>
              <div className="dbg-stack">
                <span className="dbg-side-label">{d.callstack}</span>
                <span className="dbg-stack-frame">classify() · fizz.py:5</span>
                <span className="dbg-stack-frame is-outer">&lt;module&gt; · fizz.py:9</span>
              </div>
            </div>
          </div>
        </div>
        <p className="dbg-demo-note">{d.demoNote}</p>
      </section>

      <section className="section">
        <h2 className="h2" style={{ marginBottom: 30 }}>
          {d.capsH}
        </h2>
        <div className="grid-2">
          {CAP_KEYS.map((k) => (
            <div className="tile" key={k}>
              <h3>{d[`${k}t` as keyof typeof d]}</h3>
              <p>
                <Ticked text={d[`${k}b` as keyof typeof d]} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="h2" style={{ marginBottom: 30 }}>
          {d.stepsH}
        </h2>
        <div className="steps-grid">
          {STEP_KEYS.map((k, i) => (
            <div className={`step-card${i === 0 ? ' is-first' : ''}`} key={k}>
              <span className="step-num">{`0${i + 1}`}</span>
              <h3>{d[`${k}t` as keyof typeof d]}</h3>
              <p>{d[`${k}b` as keyof typeof d]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="h2" style={{ marginBottom: 24 }}>
          {d.faqH}
        </h2>
        <div className="faq-grid dbg-faq-grid">
          {FAQ_KEYS.map((k) => (
            <div className="faq-item dbg-faq" key={k}>
              <h3>{d[k as keyof typeof d]}</h3>
              <p>{d[`a${k.slice(1)}` as keyof typeof d]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="footer-section">
        <div className="cta-band">
          <div className="cta-copy">
            <h2>{d.ctaH}</h2>
            <p>{d.ctaB}</p>
          </div>
          <Link to="/" className="btn btn-primary lg">
            {d.ctaBtn}
          </Link>
        </div>
        <Footer page="debugger" />
      </section>
    </div>
  )
}
