import { Link } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Ticked } from '../../components/Ticked'
import { useI18n } from '../../i18n/I18nProvider'
import { liveDebugAvailable } from '../../lib/python/client'
import { LiveDemoCard } from './LiveDemoCard'
import { RecordedDemoCard } from './RecordedDemoCard'
import './Debugger.css'

const CAP_KEYS = ['cap1', 'cap2', 'cap3', 'cap4'] as const
const STEP_KEYS = ['s1', 's2', 's3'] as const
const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4'] as const

// SharedArrayBuffer availability depends on this page's cross-origin
// isolation headers, which don't change mid-session — safe to read once.
// Mounting only the matching card avoids spinning up two Pyodide workers.
const LIVE_AVAILABLE = liveDebugAvailable()

export function DebuggerPage() {
  const { t } = useI18n()
  const d = t.debugger

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

      <section className="section">{LIVE_AVAILABLE ? <LiveDemoCard /> : <RecordedDemoCard />}</section>

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
