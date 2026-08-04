import { Component, type ErrorInfo, type ReactNode } from 'react'
import { CONTACT_EMAIL } from '../siteConfig'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * The last line of defense: without this, one uncaught render error
 * anywhere in the tree white-screens the whole app with no way back.
 *
 * Deliberately framework-independent — no i18n, no theme context, no other
 * app code — since the crash it's catching could itself have originated
 * inside one of those providers. It only relies on the CSS custom
 * properties from src/styles/tokens.css, which are plain global CSS set on
 * <html> before React ever mounts, so they're safe to use even here.
 *
 * No error-reporting service is wired up on purpose (see the Privacy
 * Policy: nothing leaves the browser without a deliberate, disclosed
 * decision to add one) — this only logs to the console and offers a real
 * way to recover.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Margin crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onReload={() => window.location.reload()} />
    }
    return this.props.children
  }
}

function ErrorFallback({ error, onReload }: { error: Error; onReload: () => void }) {
  return (
    <div className="crash-screen">
      <div className="crash-card">
        <div className="crash-dot" />
        <h1>Something broke</h1>
        <p>
          Margin hit an error it couldn't recover from on its own. Your code hasn't been sent
          anywhere — reloading is safe, but anything unsaved in the editor since your last run will
          be lost.
        </p>
        {import.meta.env.DEV && <pre className="crash-detail">{error.message}</pre>}
        <div className="crash-actions">
          <button type="button" className="crash-btn-primary" onClick={onReload}>
            Reload Margin
          </button>
          <a
            className="crash-btn-ghost"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Margin crash report')}`}
          >
            Report this
          </a>
        </div>
      </div>
    </div>
  )
}
