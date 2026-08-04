import { Link } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import './Legal.css'

export function TermsPage() {
  return (
    <div className="page">
      <Header active="terms" />

      <section className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-crumb">Legal</div>
          <h1 className="legal-h1">Terms of Service</h1>
          <p className="legal-updated">Last updated August 2, 2026</p>
          <p className="legal-note">
            Margin is early — these terms are written for that reality (a free, client-only tool today)
            and will get more formal as accounts and paid plans go live.
          </p>
        </div>
      </section>

      <section className="legal-body">
        <h2 id="acceptance">Agreement</h2>
        <p>
          By using Margin, you agree to these terms. If you don't agree, the only real obligation is
          simple: don't use it.
        </p>

        <h2 id="the-service">What Margin is (and isn't, yet)</h2>
        <p>
          Margin is a Python programming environment that runs entirely in your browser. There is no
          account system, no server-side execution, and — as of this writing — no paid plan that
          actually processes a payment. Any pricing shown in the app describes plans we intend to build,
          not ones you can currently purchase.
        </p>

        <h2 id="your-code">Your code and content</h2>
        <p>
          Anything you write, run, or upload in Margin is yours. Because it never leaves your browser
          (see the <Link to="/privacy">Privacy Policy</Link> for specifics), we have no copy of it, no
          license to it, and no ability to access, use, or share it.
        </p>

        <h2 id="acceptable-use">Acceptable use</h2>
        <p>You agree not to use Margin to:</p>
        <ul>
          <li>Attempt to disrupt, overload, or gain unauthorized access to the infrastructure serving
            the app (the hosting, CDN, or package sources it depends on)</li>
          <li>Use the "install from PyPI" feature to distribute or install packages for malicious
            purposes</li>
          <li>Violate any applicable law in how you use the tool</li>
        </ul>

        <h2 id="third-party">Third-party dependencies</h2>
        <p>
          Margin loads a real Python runtime, real packages, and fonts from third-party services
          (jsDelivr, PyPI, Google Fonts) to function. We don't control their uptime or availability, and
          an outage on their end can make some or all of Margin stop working temporarily.
        </p>

        <h2 id="no-warranty">No warranty</h2>
        <p>
          Margin is provided "as is," without warranty of any kind. It's a real Python interpreter
          running in an unusual environment (WebAssembly, in-browser); we make a good-faith effort to
          keep it correct and stable, but we don't guarantee it will be error-free, uninterrupted, or fit
          for any particular purpose — including production or safety-critical use.
        </p>

        <h2 id="liability">Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, we aren't liable for any indirect, incidental, or
          consequential damages arising from your use of Margin, including loss of code or data that
          wasn't otherwise saved by you before closing the tab.
        </p>

        <h2 id="changes-to-service">Changes to the service</h2>
        <p>
          We may change, add to, or remove features at any time, including features described as "Pro"
          or "Classroom" before they're fully built. We'll aim to communicate meaningful changes,
          especially anything that affects a plan you're actually paying for once billing exists.
        </p>

        <h2 id="termination">Termination</h2>
        <p>
          Since there's no account today, there's nothing to terminate beyond closing the tab. Once
          accounts exist, this section will describe how account termination and data deletion actually
          work.
        </p>

        <h2 id="governing-law">Governing law</h2>
        <p>
          These terms are governed by the laws of{' '}
          <span className="legal-placeholder">[jurisdiction — set by the founder before launch]</span>.
          This is a placeholder, not a decision — it needs to be filled in deliberately, since it
          affects which laws actually apply.
        </p>

        <h2 id="contact">Questions</h2>
        <p>
          Reach out via the <Link to="/contact">Contact page</Link> if anything here is unclear.
        </p>

        <nav className="legal-toc" aria-label="Sections on this page">
          <a href="#acceptance">Agreement</a>
          <a href="#the-service">The service</a>
          <a href="#your-code">Your code</a>
          <a href="#acceptable-use">Acceptable use</a>
          <a href="#third-party">Third parties</a>
          <a href="#no-warranty">No warranty</a>
          <a href="#liability">Liability</a>
          <a href="#changes-to-service">Changes</a>
          <a href="#termination">Termination</a>
          <a href="#governing-law">Governing law</a>
          <a href="#contact">Contact</a>
        </nav>

        <Footer page="terms" />
      </section>
    </div>
  )
}
