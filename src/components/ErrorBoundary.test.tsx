import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never {
  throw new Error('deliberate render crash')
}

describe('ErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders real children when nothing has crashed', () => {
    render(
      <ErrorBoundary>
        <p>hello</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('catches a render crash and shows a real recovery screen instead of a blank page', () => {
    // React logs the boundary-caught error to the console too; that's
    // expected noise for this test, not something worth failing on.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something broke')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload Margin' })).toBeInTheDocument()
    const report = screen.getByRole('link', { name: 'Report this' })
    expect(report.getAttribute('href')).toMatch(/^mailto:.+subject=Margin%20crash%20report/)
  })

  it('logs the real crash for anyone reading devtools console', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(errorSpy).toHaveBeenCalledWith(
      'Margin crashed:',
      expect.objectContaining({ message: 'deliberate render crash' }),
      expect.any(String),
    )
  })
})
