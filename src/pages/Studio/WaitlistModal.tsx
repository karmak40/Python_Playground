import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { CONTACT_EMAIL } from '../../siteConfig'

export type WaitlistPlan = 'pro' | 'classroom'

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

  const isPro = plan === 'pro'
  const title = isPro ? s.waitlistTitlePro : s.waitlistTitleClassroom
  const body = isPro ? s.waitlistBodyPro : s.waitlistBodyClassroom
  const submitLabel = isPro ? s.waitlistSubmitPro : s.waitlistSubmitClassroom

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = isPro ? 'Margin Pro — waitlist' : 'Margin Classroom — interested'
    const bodyText = isPro
      ? `Please notify me when Pro launches.\n\nMy email: ${email}`
      : `We're interested in Margin Classroom.\n\nContact email: ${email}\n\nClass size / timeline (optional):\n`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`
    setSent(true)
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <>
            <div className="modal-title">{s.waitlistThanksTitle}</div>
            <p className="modal-body">
              {s.waitlistThanksBody} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <button type="button" className="modal-done-btn" onClick={onClose}>
              {s.done}
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="modal-title">{title}</div>
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
