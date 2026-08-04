import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Standard keyboard behavior for a modal dialog: focuses it on mount, traps
 * Tab/Shift+Tab inside it so focus never escapes to the page behind the
 * scrim, restores focus to whatever had it before on unmount, and — where
 * the dialog actually has a close action — closes on Escape. Pass no
 * `onEscape` for a dialog that must be resolved by picking an option (no
 * natural "cancel"); the trap and initial focus still apply.
 */
export function useModalA11y(onEscape?: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    ;(focusable()[0] ?? dialog).focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    dialog.addEventListener('keydown', onKeyDown)
    return () => {
      dialog.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [onEscape])

  return ref
}
