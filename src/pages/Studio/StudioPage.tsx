import { useEffect } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useScrollToStateTarget } from '../../components/PricingLink'
import { StudioHeader } from './StudioHeader'
import { Sidebar } from './Sidebar'
import { Editor } from './Editor'
import { RightPanel } from './RightPanel'
import { WelcomeModal } from './WelcomeModal'
import { ShareModal } from './ShareModal'
import { Landing } from './Landing'
import { useStudio } from './useStudio'
import './Studio.css'

export function StudioPage() {
  const { t } = useI18n()
  const {
    state,
    run,
    fix,
    restart,
    dismissWelcome,
    openShare,
    closeShare,
    toggleShareOpt,
    showToast,
    later,
  } = useStudio()

  useScrollToStateTarget()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        run()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [run])

  const pickStart = (index: number) => {
    dismissWelcome()
    if (index === 0) later(run, 500)
  }

  return (
    <div className="page">
      <StudioHeader running={state.running} onShare={openShare} onRun={run} />

      <div className="studio-body">
        <Sidebar onRecipePick={() => showToast(t.studio.recipeInserted)} />
        <Editor
          state={state}
          onSaveFigure={() => showToast(t.studio.figSaved)}
          onCopyFigureCode={() => showToast(t.studio.figCopied)}
        />
        <RightPanel state={state} onFix={fix} />
      </div>

      <Landing onRestart={restart} />

      {state.toast && (
        <div className="toast">
          <span className="toast-dot" />
          <span>{state.toast}</span>
        </div>
      )}

      {state.welcome && <WelcomeModal onPick={pickStart} />}

      {state.share && (
        <ShareModal
          shareOn={state.shareOn}
          onToggle={toggleShareOpt}
          onCopy={() => showToast(t.studio.linkCopied)}
          onClose={closeShare}
        />
      )}
    </div>
  )
}
