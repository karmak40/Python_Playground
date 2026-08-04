import { useEffect, useRef } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useScrollToStateTarget } from '../../components/PricingLink'
import { StudioHeader } from './StudioHeader'
import { Sidebar } from './Sidebar'
import { Editor } from './Editor'
import { RightPanel } from './RightPanel'
import { WelcomeModal } from './WelcomeModal'
import { WaitlistModal } from './WaitlistModal'
import { Landing } from './Landing'
import { useStudio } from './useStudio'
import { buildCsvStarter, sniffCsvColumns } from './content'
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
    setNotes,
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
    showToast,
    later,
  } = useStudio()

  useScrollToStateTarget()
  const csvInputRef = useRef<HTMLInputElement>(null)

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
    if (index === 0) {
      later(() => void run(), 300)
    } else if (index === 1) {
      setCode('')
    } else if (index === 2) {
      csvInputRef.current?.click()
    }
  }

  const pickWelcomeCsv = async (file: File) => {
    const [columns] = await Promise.all([sniffCsvColumns(file), upload(file)])
    setCode(buildCsvStarter(file.name, columns))
  }

  const saveFigure = (url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = 'figure.png'
    link.click()
    showToast(t.studio.figSaved)
  }

  const insertRecipe = (code: string) => {
    const current = state.pyFiles[state.activeFile] ?? ''
    setCode(current.trim().length > 0 ? `${current}\n\n${code}\n` : `${code}\n`)
    showToast(t.studio.recipeInserted)
  }

  const copyFigureCode = () => {
    const code = state.pyFiles[state.activeFile] ?? ''
    navigator.clipboard.writeText(code).then(() => showToast(t.studio.figCopied)).catch(() => {})
  }

  return (
    <div className="page">
      <StudioHeader
        activeFile={state.activeFile}
        running={state.running}
        status={state.status}
        slow={state.slow}
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
          onRecipePick={insertRecipe}
        />
        <Editor
          state={state}
          pythonVersion={state.pythonVersion}
          onChangeCode={setCode}
          onToggleBreakpoint={toggleBreakpoint}
          onSaveFigure={saveFigure}
          onCopyFigureCode={copyFigureCode}
        />
        <RightPanel state={state} onFix={fix} onChangeNotes={setNotes} />
      </div>

      <Landing onRestart={restart} />

      {state.toast && (
        <div className="toast">
          <span className="toast-dot" />
          <span>{state.toast}</span>
        </div>
      )}

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void pickWelcomeCsv(file)
        }}
      />

      {state.welcome && <WelcomeModal onPick={pickStart} />}

      {state.share && <WaitlistModal plan="share" onClose={closeShare} />}
    </div>
  )
}
