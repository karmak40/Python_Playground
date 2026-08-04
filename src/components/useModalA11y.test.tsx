import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useModalA11y } from './useModalA11y'

/** A minimal stand-in for Margin's real modals (WelcomeModal/WaitlistModal) —
 * enough structure to exercise the hook's actual contract without pulling in
 * i18n or CONTACT_EMAIL. */
function TestDialog({ onEscape }: { onEscape?: () => void }) {
  const ref = useModalA11y(onEscape)
  return (
    <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1} data-testid="dialog">
      <button type="button">First</button>
      <button type="button">Middle</button>
      <button type="button">Last</button>
    </div>
  )
}

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open trigger
      </button>
      {open && <TestDialog onEscape={() => setOpen(false)} />}
    </div>
  )
}

describe('useModalA11y', () => {
  it('focuses the first real control on mount, not the dialog shell', () => {
    render(<TestDialog />)
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
  })

  it('wraps Shift+Tab from the first control to the last, trapping focus inside', async () => {
    const user = userEvent.setup()
    render(<TestDialog />)
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus()
  })

  it('wraps Tab from the last control back to the first', async () => {
    const user = userEvent.setup()
    render(<TestDialog />)
    screen.getByRole('button', { name: 'Last' }).focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
  })

  it('closes on Escape when the dialog has a real close action', async () => {
    const user = userEvent.setup()
    const onEscape = vi.fn()
    render(<TestDialog onEscape={onEscape} />)
    await user.keyboard('{Escape}')
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('does nothing on Escape when the dialog has no close action, rather than crashing', async () => {
    const user = userEvent.setup()
    render(<TestDialog />)
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('restores focus to whatever had it before the dialog opened', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open trigger' })
    // A real click both focuses the trigger and mounts the dialog, same as
    // clicking Share in the app — the hook captures that as "what to restore".
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })
})
