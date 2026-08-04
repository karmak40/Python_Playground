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
    stop,
    fix,
    upload,
    installPackage,
    restart,
    setCode,
    selectFile,
    newFile,
    removePyFile,
    removeDataFile,
    toggleBreakpoint,
    startDebug,
    debugStepInto,
    debugContinue,
    debugStop,
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
        void run()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [run])

  const pickStart = (index: number) => {
    dismissWelcome()
    if (index === 0) later(() => void run(), 300)
  }

  const saveFigure = (url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = 'figure.png'
    link.click()
    showToast(t.studio.figSaved)
  }

  return (
    <div className="page">
      <StudioHeader
        activeFile={state.activeFile}
        running={state.running}
        status={state.status}
        debugStatus={state.debugStatus}
        onShare={openShare}
        onRun={() => void run()}
        onStop={stop}
        onDebug={() => void startDebug()}
        onDebugStep={debugStepInto}
        onDebugContinue={debugContinue}
        onDebugStop={debugStop}
      />

      <div className="studio-body">
        <Sidebar
          pyFiles={state.pyFiles}
          activeFile={state.activeFile}
          files={state.files}
          packages={state.packages}
          onSelectFile={selectFile}
          onNewFile={newFile}
          onRemovePyFile={removePyFile}
          onRemoveDataFile={removeDataFile}
          onUpload={upload}
          onInstallPackage={installPackage}
          onRecipePick={() => showToast(t.studio.recipeInserted)}
        />
        <Editor
          state={state}
          pythonVersion={state.pythonVersion}
          onChangeCode={setCode}
          onToggleBreakpoint={toggleBreakpoint}
          onSaveFigure={saveFigure}
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
