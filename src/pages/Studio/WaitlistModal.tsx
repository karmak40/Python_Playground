import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useModalA11y } from '../../components/useModalA11y'
import { CONTACT_EMAIL } from '../../siteConfig'

export type WaitlistPlan = 'pro' | 'classroom' | 'share'

/**
 * Stands in for real billing/lead capture until Supabase + Stripe exist:
 * there's nowhere server-side to store an email yet, so this collects it and
 * hands off to a real mailto — the same mechanism the Contact page already
 * uses, not a fake "you're on the list!" toast with nothing behind it.
 */
export function WaitlistModal({ plan, onClose }: { plan: WaitlistPlan; onClose: () => void }) {
  const { t } = useI18n()
  const s = t.studio
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const dialogRef = useModalA11y(onClose)

  const title =
    plan === 'pro' ? s.waitlistTitlePro : plan === 'classroom' ? s.waitlistTitleClassroom : s.waitlistTitleShare
  const body =
    plan === 'pro' ? s.waitlistBodyPro : plan === 'classroom' ? s.waitlistBodyClassroom : s.waitlistBodyShare
  const submitLabel =
    plan === 'pro' ? s.waitlistSubmitPro : plan === 'classroom' ? s.waitlistSubmitClassroom : s.waitlistSubmitShare

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject =
      plan === 'pro'
        ? 'Margin Pro — waitlist'
        : plan === 'classroom'
          ? 'Margin Classroom — interested'
          : 'Margin — notify me about sharing'
    const bodyText =
      plan === 'pro'
        ? `Please notify me when Pro launches.\n\nMy email: ${email}`
        : plan === 'classroom'
          ? `We're interested in Margin Classroom.\n\nContact email: ${email}\n\nClass size / timeline (optional):\n`
          : `Please notify me when sharing a playground is really live.\n\nMy email: ${email}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`
    setSent(true)
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal modal-sm"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <>
            <div className="modal-title" id="waitlist-modal-title">
              {s.waitlistThanksTitle}
            </div>
            <p className="modal-body">
              {s.waitlistThanksBody} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <button type="button" className="modal-done-btn" onClick={onClose}>
              {s.done}
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="modal-title" id="waitlist-modal-title">
              {title}
            </div>
            <p className="modal-body">{body}</p>
            <div className="aside-inline-row" style={{ marginBottom: 16 }}>
              <input
                autoFocus
                type="email"
                required
                className="aside-inline-input"
                placeholder={s.waitlistEmailPh}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="modal-done-btn">
              {submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
