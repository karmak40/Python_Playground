import { useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import type { PyFile } from '../../lib/python/client'
import { recipesFor } from './content'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function Sidebar({
  pyFiles,
  activeFile,
  files,
  packages,
  onSelectFile,
  onNewFile,
  onRemovePyFile,
  onRemoveDataFile,
  onUpload,
  onInstallPackage,
  onRecipePick,
}: {
  pyFiles: Record<string, string>
  activeFile: string
  files: PyFile[]
  packages: string[]
  onSelectFile: (name: string) => void
  onNewFile: (name: string) => void
  onRemovePyFile: (name: string) => void
  onRemoveDataFile: (name: string) => void
  onUpload: (file: File) => void
  onInstallPackage: (name: string) => Promise<{ ok: boolean; message: string }>
  onRecipePick: (code: string) => void
}) {
  const { t, lang } = useI18n()
  const recipes = recipesFor(lang)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const [creatingFile, setCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const [installing, setInstalling] = useState(false)
  const [pkgName, setPkgName] = useState('')
  const [installStatus, setInstallStatus] = useState<'idle' | 'busy' | 'error'>('idle')
  const [installError, setInstallError] = useState('')

  const canRemovePy = Object.keys(pyFiles).length > 1

  const acceptFiles = (list: FileList | null) => {
    if (!list) return
    for (const file of Array.from(list)) onUpload(file)
  }

  const confirmRemovePy = (name: string) => {
    if (window.confirm(t.studio.confirmRemoveFile.replace('{name}', name))) onRemovePyFile(name)
  }

  const submitNewFile = () => {
    const name = newFileName.trim()
    if (name) onNewFile(name)
    setNewFileName('')
    setCreatingFile(false)
  }

  const submitInstall = async () => {
    const name = pkgName.trim()
    if (!name) return
    setInstallStatus('busy')
    setInstallError('')
    const result = await onInstallPackage(name)
    if (result.ok) {
      setInstallStatus('idle')
      setPkgName('')
      setInstalling(false)
    } else {
      setInstallStatus('error')
      setInstallError(result.message)
    }
  }

  return (
    <aside
      className={`studio-aside${dragging ? ' is-dropping' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        acceptFiles(e.dataTransfer.files)
      }}
    >
      <div className="aside-group">
        <div className="aside-label">{t.studio.files}</div>
        {Object.keys(pyFiles).map((name) => (
          <div
            key={name}
            className={name === activeFile ? 'aside-file-active' : 'aside-file aside-file-btn'}
            role="button"
            tabIndex={0}
            onClick={() => onSelectFile(name)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectFile(name)}
          >
            <span className="file-badge-name">{name}</span>
            {canRemovePy && (
              <button
                type="button"
                className="aside-file-remove"
                aria-label={t.studio.removeFile}
                onClick={(e) => {
                  e.stopPropagation()
                  confirmRemovePy(name)
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        {files.map((f) => (
          <div className="aside-file" key={f.name}>
            <span className="file-badge-name">{f.name}</span>
            <span className="aside-file-meta">{formatSize(f.size)}</span>
            <button
              type="button"
              className="aside-file-remove"
              aria-label={t.studio.removeFile}
              onClick={() => onRemoveDataFile(f.name)}
            >
              ×
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          onChange={(e) => {
            acceptFiles(e.target.files)
            e.target.value = ''
          }}
        />
        {creatingFile ? (
          <form
            className="aside-inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              submitNewFile()
            }}
          >
            <div className="aside-inline-row">
              <input
                autoFocus
                className="aside-inline-input"
                placeholder="helpers.py"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setCreatingFile(false)}
              />
              <button type="submit" className="aside-inline-confirm" aria-label={t.studio.newFile}>
                ✓
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="aside-row-btn" onClick={() => setCreatingFile(true)}>
            {t.studio.newFile}
          </button>
        )}
        <button type="button" className="aside-row-btn" onClick={() => inputRef.current?.click()}>
          {t.studio.uploadFile}
        </button>
      </div>

      <div className="aside-group">
        <div className="aside-label">{t.studio.packages}</div>
        {packages.length === 0 && <div className="pkg-row pkg-empty">{t.studio.noPackages}</div>}
        {packages.map((name) => (
          <div className="pkg-row" key={name}>
            <span className="pkg-name">{name}</span>
          </div>
        ))}
        {installing ? (
          <form
            className="aside-inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              void submitInstall()
            }}
          >
            <div className="aside-inline-row">
              <input
                autoFocus
                className="aside-inline-input"
                placeholder="requests"
                value={pkgName}
                disabled={installStatus === 'busy'}
                onChange={(e) => setPkgName(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setInstalling(false)}
              />
              <button
                type="submit"
                className="aside-inline-confirm"
                aria-label={t.studio.install}
                disabled={installStatus === 'busy'}
              >
                ✓
              </button>
            </div>
            {installStatus === 'busy' && <div className="pkg-install-status">{t.studio.installing}</div>}
            {installStatus === 'error' && <div className="pkg-install-status is-error">{installError}</div>}
          </form>
        ) : (
          <button type="button" className="aside-row-btn" onClick={() => setInstalling(true)}>
            {t.studio.install}
          </button>
        )}
      </div>

      <div className="aside-group">
        <div className="aside-label">{t.studio.recipes}</div>
        {recipes.map((r) => (
          <button type="button" className="recipe-btn" key={r.title} onClick={() => onRecipePick(r.code)}>
            <span className="recipe-title">{r.title}</span>
            <span className="recipe-note">{r.note}</span>
          </button>
        ))}
      </div>

      <div className="aside-privacy">{t.studio.privacy}</div>
    </aside>
  )
}
