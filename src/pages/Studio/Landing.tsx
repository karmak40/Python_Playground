import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { Ticked } from '../../components/Ticked'
import { Footer } from '../../components/Footer'
import { PricingLink } from '../../components/PricingLink'
import { WaitlistModal, type WaitlistPlan } from './WaitlistModal'

const WHY_KEYS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] as const
const HOW1_KEYS = ['h1a', 'h1b2', 'h1c', 'h1d'] as const
const HOW2_KEYS = ['h2a', 'h2b2', 'h2c', 'h2d'] as const
const WHO_KEYS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'] as const
const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const

export function Landing({ onRestart }: { onRestart: () => void }) {
  const { t } = useI18n()
  const s = t.studio
  const [waitlistPlan, setWaitlistPlan] = useState<WaitlistPlan | null>(null)

  const startWriting = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="landing" data-screen-label="Landing">
      <section className="section section-narrow">
        <div className="section-head">
          <span className="section-index">01</span>
          <h2 className="h2">{s.whyH}</h2>
        </div>
        <div className="grid-3">
          {WHY_KEYS.map((k) => (
            <div className="tile" key={k}>
              <h3>{s[`${k}t` as keyof typeof s]}</h3>
              <p>
                <Ticked text={s[`${k}b` as keyof typeof s]} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-narrow">
        <div className="section-head">
          <span className="section-index">02</span>
          <h2 className="h2">{s.howH}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="how-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, margin: 0 }}>{s.h1t}</h3>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--muted)' }}>{s.h1b}</p>
            <div className="rule-list">
              {HOW1_KEYS.map((k) => (
                <div key={k}>{s[k as keyof typeof s]}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, margin: 0 }}>{s.h2t}</h3>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--muted)' }}>{s.h2b}</p>
            <div className="rule-list">
              {HOW2_KEYS.map((k) => (
                <div key={k}>{s[k as keyof typeof s]}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-narrow">
        <div className="section-head">
          <span className="section-index">03</span>
          <h2 className="h2">{s.whoH}</h2>
        </div>
        <div className="who-grid">
          {WHO_KEYS.map((k, i) => (
            <div className={`who-card${i === 0 ? ' is-first' : ''}`} key={k}>
              <h3>{s[`${k}t` as keyof typeof s]}</h3>
              <p>{s[`${k}b` as keyof typeof s]}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="section section-narrow" style={{ scrollMarginTop: 70 }}>
        <div className="section-head" style={{ marginBottom: 10 }}>
          <span className="section-index">04</span>
          <h2 className="h2">{s.priH}</h2>
        </div>
        <p style={{ margin: '0 0 34px 39px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)', maxWidth: '56ch' }}>
          {s.priB}
        </p>

        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-head">
              <span className="price-name">{s.t1n}</span>
              <span className="price-sub">{s.t1s}</span>
            </div>
            <div className="price-amount">
              <span className="price-num">{s.t1price}</span>
            </div>
            <div className="price-features">
              <div>{s.t1a}</div>
              <div>{s.t1b}</div>
              <div>{s.t1c}</div>
              <div>{s.t1d}</div>
              <div>{s.t1e}</div>
              <div style={{ color: 'var(--faint)' }}>{s.t1f}</div>
            </div>
            <button type="button" className="price-cta outline" onClick={startWriting}>
              {s.t1cta}
            </button>
          </div>

          <div className="price-card is-featured">
            <span className="price-tag">{s.t2tag}</span>
            <div className="price-head">
              <span className="price-name">{s.t2n}</span>
              <span className="price-sub">{s.t2s}</span>
            </div>
            <div className="price-amount">
              <span className="price-num">{s.t2price}</span>
              <span className="price-per">{s.t2per}</span>
            </div>
            <div className="price-features">
              <div>{s.t2a}</div>
              <div>{s.t2b}</div>
              <div>{s.t2c}</div>
              <div>{s.t2d}</div>
              <div>{s.t2e}</div>
              <div>{s.t2f}</div>
              <div>{s.t2g}</div>
            </div>
            <button type="button" className="price-cta solid" onClick={() => setWaitlistPlan('pro')}>
              {s.t2cta}
            </button>
          </div>

          <div className="price-card">
            <div className="price-head">
              <span className="price-name">{s.t3n}</span>
              <span className="price-sub">{s.t3s}</span>
            </div>
            <div className="price-amount">
              <span className="price-num">{s.t3price}</span>
              <span className="price-per">{s.t3per}</span>
            </div>
            <div className="price-features">
              <div>{s.t3a}</div>
              <div>{s.t3b}</div>
              <div>{s.t3c}</div>
              <div>{s.t3d}</div>
              <div>{s.t3e}</div>
              <div>{s.t3f}</div>
            </div>
            <button type="button" className="price-cta outline" onClick={() => setWaitlistPlan('classroom')}>
              {s.t3cta}
            </button>
          </div>
        </div>

        <p className="price-foot">{s.priFoot}</p>
      </section>

      <section className="section section-narrow">
        <div className="section-head" style={{ marginBottom: 30 }}>
          <span className="section-index">05</span>
          <h2 className="h2">{s.faqH}</h2>
        </div>
        <div className="faq-grid">
          {FAQ_KEYS.map((k) => (
            <div className="faq-item" key={k}>
              <h3>{s[`${k}` as keyof typeof s]}</h3>
              <p>{s[`a${k.slice(1)}` as keyof typeof s]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="footer-section">
        <div className="cta-band">
          <div className="cta-copy">
            <h2>{s.ctaH}</h2>
            <p>{s.ctaB}</p>
          </div>
          <div className="cta-actions">
            <button type="button" className="btn btn-primary lg" onClick={onRestart}>
              {s.ctaBtn}
            </button>
            <PricingLink className="btn btn-outline lg">{s.ctaAlt}</PricingLink>
          </div>
        </div>
        <Footer page="app" />
      </section>

      {waitlistPlan && <WaitlistModal plan={waitlistPlan} onClose={() => setWaitlistPlan(null)} />}
    </div>
  )
}
