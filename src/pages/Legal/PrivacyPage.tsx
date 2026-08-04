import { Link } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import './Legal.css'

export function PrivacyPage() {
  return (
    <div className="page">
      <Header active="privacy" />

      <section className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-crumb">Legal</div>
          <h1 className="legal-h1">Privacy Policy</h1>
          <p className="legal-updated">Last updated August 2, 2026</p>
          <p className="legal-note">
            The short version: nothing about your code, your data, or what you run ever leaves your
            browser. This page explains exactly what that means and where the few real exceptions are.
          </p>
        </div>
      </section>

      <section className="legal-body">
        <h2 id="what-margin-is">What Margin is</h2>
        <p>
          Margin is a Python programming environment that runs inside your own browser tab, using a
          real Python interpreter compiled to WebAssembly (Pyodide). There is currently no account
          system and no server that your code is sent to — the Python you write, the files you upload,
          and everything your code prints or plots is computed on your own device and stays there.
        </p>

        <h2 id="what-we-dont-collect">What we don't collect</h2>
        <p>We do not collect, receive, or have access to:</p>
        <ul>
          <li>The code you write, or any file you open, edit, or delete inside a project</li>
          <li>Any file you upload (CSVs or otherwise) — it's written into your browser's own in-memory
            filesystem, not transmitted anywhere</li>
          <li>The output, values, or charts your code produces</li>
          <li>Your name, email, or any account information — because there is no account system yet</li>
        </ul>
        <p>
          There is no analytics, no tracking pixel, and no error-reporting service wired into this app.
          We have no way to know you visited unless you tell us.
        </p>

        <h2 id="local-storage">What's stored, and where</h2>
        <p>
          Margin remembers a small number of preferences — your chosen language, light/dark appearance,
          and whether you've already seen the welcome screen — using your browser's built-in{' '}
          <code>localStorage</code>. This data is written to your device only. It is never transmitted
          to us or to anyone else, and you can clear it at any time by clearing your browser's site data
          for this page. Your actual project code is <strong>not yet</strong> saved between visits at
          all — closing the tab or reloading the page currently loses unsaved work, the same as it would
          in any offline editor with no save button pressed yet.
        </p>

        <h2 id="third-parties">The few requests that do leave your browser</h2>
        <p>
          A handful of things are fetched from third-party services so the app can function at all.
          None of them receive your code or the contents of anything you run:
        </p>
        <ul>
          <li>
            <strong>Google Fonts</strong> — loads the typefaces used across the site. Google's servers
            see a standard font request (your IP address, browser, and which fonts), the same as any
            site using Google Fonts.
          </li>
          <li>
            <strong>jsDelivr</strong> — serves the Python runtime and the package files (pandas, numpy,
            matplotlib, and anything else your code imports). jsDelivr sees which packages were
            requested, not your code or what you did with them.
          </li>
          <li>
            <strong>PyPI</strong>, only if you use "install from PyPI" — installing a real package by
            name sends that package name to the Python Package Index to resolve and download it, the
            same as running <code>pip install</code> anywhere else.
          </li>
        </ul>

        <h2 id="share-button">About the "Share" button</h2>
        <p>
          The Playground currently has a Share button in its interface. It is not yet functional —
          clicking it does not upload, publish, or transmit your project anywhere. Real project sharing
          is planned but not built yet, and when it ships, this policy will be updated first to explain
          exactly what that feature sends and to whom.
        </p>

        <h2 id="gdpr">If you're in the EU, UK, or elsewhere with data-protection law</h2>
        <p>
          Because nothing about your code, files, or activity is transmitted to us, we are not currently
          collecting or processing any personal data as a data controller under GDPR or similar law.
          There is nothing for us to access, correct, export, or delete on your behalf today, because we
          never had it in the first place.
        </p>

        <h2 id="future">What changes when accounts and billing exist</h2>
        <p>
          Margin plans to add optional accounts, cloud sync, and paid plans in the future. Once that
          exists, some information (an email address, subscription status, and whatever project data you
          explicitly choose to sync) will need to leave your browser to make those features work. We'll
          rewrite this policy to explain exactly what changes before any of that ships — not after.
        </p>

        <h2 id="children">Children's privacy</h2>
        <p>
          Margin does not knowingly collect personal information from anyone, including children, because
          it does not collect personal information from anyone at all today.
        </p>

        <h2 id="changes">Changes to this policy</h2>
        <p>
          If this policy changes, we'll update the date at the top. Material changes — especially
          anything that starts sending data off your device — will be called out clearly, not buried in
          a version bump.
        </p>

        <h2 id="contact">Questions</h2>
        <p>
          Reach out via the <Link to="/contact">Contact page</Link> if anything here is unclear.
        </p>

        <nav className="legal-toc" aria-label="Sections on this page">
          <a href="#what-margin-is">What Margin is</a>
          <a href="#what-we-dont-collect">What we don't collect</a>
          <a href="#local-storage">Local storage</a>
          <a href="#third-parties">Third parties</a>
          <a href="#share-button">Share button</a>
          <a href="#gdpr">GDPR</a>
          <a href="#future">Future changes</a>
          <a href="#children">Children</a>
          <a href="#changes">Changes</a>
          <a href="#contact">Contact</a>
        </nav>

        <Footer page="privacy" />
      </section>
    </div>
  )
}
