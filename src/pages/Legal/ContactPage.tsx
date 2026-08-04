import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { CONTACT_EMAIL } from '../../siteConfig'
import './Legal.css'

export function ContactPage() {
  return (
    <div className="page">
      <Header active="contact" />

      <section className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-crumb">Get in touch</div>
          <h1 className="legal-h1">Contact</h1>
          <p className="legal-note">
            No support ticket system yet — just a real inbox on the other end.
          </p>
        </div>
      </section>

      <section className="legal-body">
        <div className="contact-methods">
          <div className="contact-method">
            <h3>Bugs and problems</h3>
            <p>Something broke, or behaved differently than you expected — include what you ran if you can.</p>
            <a className="contact-value" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Margin — bug report')}`}>
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="contact-method">
            <h3>Everything else</h3>
            <p>Questions, feedback, Classroom/Pro interest, or anything not covered by the Help page.</p>
            <a className="contact-value" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <Footer page="contact" />
      </section>
    </div>
  )
}
