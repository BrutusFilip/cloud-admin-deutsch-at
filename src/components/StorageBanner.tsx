import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useMessages } from '../i18n'
import { useProgress } from '../state/progressContext'
import { ConfirmDialog } from './ConfirmDialog'
import { showStorageBanner, STORAGE_BANNER_ID } from './storageBannerFocus'

/** Explains storage problems and a read-only tab in plain words and offers the safe choices. */
export function StorageBanner() {
  const m = useMessages()
  const s = m.storage
  const {
    storageStatus: status,
    tab,
    downloadStoredData,
    recoverStoredData,
    resetProgress,
    continueWithoutSaving,
    retrySave,
    resumeSaving,
    exportProgress,
    reloadStored,
    takeOver,
  } = useProgress()
  const [collapsed, setCollapsed] = useState(false)
  const [failed, setFailed] = useState(false)
  // Destructive choices are confirmed in a modal dialog (never a browser dialog).
  const [confirming, setConfirming] = useState<'reset' | 'recover' | null>(null)
  // A change refused in a read-only or stale tab is named right where the learner looks for it.
  const refused = tab.refused > 0

  // Problems that arise while the learner works (not on loading): if the message at the top is
  // out of view, a short pointer stays visible until the learner opens the message or hides it.
  const urgent =
    status.kind === 'write-failed' ? 'write-failed' : status.kind === 'stale' ? 'stale' : tab.role === 'passive' && refused ? 'refused' : null
  const urgentKey = urgent ? `${urgent}:${status.kind === 'write-failed' ? status.error : ''}:${tab.refused}` : null
  const bannerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const [hidden, setHidden] = useState<string | null>(null)

  useEffect(() => {
    const banner = bannerRef.current
    if (!urgent || !banner || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? true))
    observer.observe(banner)
    return () => observer.disconnect()
  }, [urgent, status.kind, tab.role])

  const frame = (className: string, children: ReactNode, role?: 'alert') => (
    <div className={className} role={role} aria-live={role ? undefined : 'polite'} id={STORAGE_BANNER_ID} ref={bannerRef} tabIndex={-1}>
      {children}
    </div>
  )

  const pointer =
    urgent && urgentKey !== hidden && !inView ? (
      <div className="storage-pointer">
        <p>
          <span className="storage-pointer-mark" aria-hidden="true">
            !
          </span>{' '}
          {s.pointer[urgent]}
        </p>
        <div className="storage-pointer-actions">
          <button type="button" className="btn btn--small btn--primary" onClick={showStorageBanner}>
            {s.showOptions}
          </button>
          <button type="button" className="btn btn--small btn--quiet" onClick={() => setHidden(urgentKey)}>
            {s.hidePointer}
          </button>
        </div>
      </div>
    ) : null

  const exportButton = (
    <button type="button" className="btn btn--small" onClick={exportProgress}>
      {s.exportCurrent}
    </button>
  )

  if (tab.role === 'passive') {
    return (
      <>
        {frame(
          'banner banner--tab',
          <>
            <p className="banner-title">{s.passiveTitle}</p>
            <p>{s.passiveText}</p>
            {refused && (
              <p className="form-error" role="alert">
                {s.refused}
              </p>
            )}
            <div className="banner-actions">
              <button type="button" className="btn btn--small btn--primary" onClick={takeOver}>
                {s.takeOver}
              </button>
            </div>
          </>,
        )}
        {pointer}
      </>
    )
  }

  if (status.kind === 'stale') {
    return (
      <>
        {frame(
          'banner banner--warn',
          <>
            <p className="banner-title">{s.staleTitle[status.reason]}</p>
            <p>{s.staleText[status.reason]}</p>
            {refused && <p className="form-error">{s.refused}</p>}
            <div className="banner-actions">
              {status.reason === 'newer' ? (
                <button type="button" className="btn btn--small btn--primary" onClick={() => window.location.reload()}>
                  {s.reloadPage}
                </button>
              ) : (
                <button type="button" className="btn btn--small btn--primary" onClick={reloadStored}>
                  {s.reloadStored}
                </button>
              )}
              {exportButton}
            </div>
          </>,
          'alert',
        )}
        {pointer}
      </>
    )
  }

  if (status.kind === 'ok') return null

  if (status.kind === 'unavailable') {
    return frame(
      'banner',
      <>
        <p className="banner-title">{s.unavailableTitle}</p>
        <p>{s.unavailableText}</p>
        <div className="banner-actions">{exportButton}</div>
      </>,
    )
  }

  if (status.kind === 'memory') {
    return frame(
      'banner banner--compact',
      <>
        <p>
          <strong>{s.memoryTitle}.</strong> {s.memoryText}
        </p>
        <div className="banner-actions">
          <button type="button" className="btn btn--small" onClick={resumeSaving}>
            {s.resume}
          </button>
          {exportButton}
        </div>
      </>,
    )
  }

  if (status.kind === 'write-failed') {
    return (
      <>
        {frame(
          'banner banner--warn',
          <>
            <p className="banner-title">{s.writeFailedTitle}</p>
            <p>{s.writeFailedText(status.error)}</p>
            <div className="banner-actions">
              <button type="button" className="btn btn--small btn--primary" onClick={retrySave}>
                {s.retry}
              </button>
              {exportButton}
              <button type="button" className="btn btn--small" onClick={continueWithoutSaving}>
                {s.continueWithout}
              </button>
            </div>
          </>,
          'alert',
        )}
        {pointer}
      </>
    )
  }

  // corrupt or unsupported: stored data stays untouched until an explicit choice
  const title = status.kind === 'corrupt' ? s.corruptTitle : s.unsupportedTitle
  const text = status.kind === 'corrupt' ? s.corruptText : s.unsupportedText(status.version)
  const recoverable = status.kind === 'corrupt' ? status.recoverable : null

  const confirm = () => {
    const ok = confirming === 'reset' ? resetProgress() : recoverStoredData()
    setFailed(!ok)
    setConfirming(null)
  }

  const dialog =
    confirming === 'reset' ? (
      <ConfirmDialog
        title={s.confirmResetTitle}
        confirmLabel={s.confirmResetYes}
        cancelLabel={s.back}
        onConfirm={confirm}
        onCancel={() => setConfirming(null)}
        extra={
          <button type="button" className="btn btn--quiet" onClick={downloadStoredData}>
            {s.download}
          </button>
        }
      >
        <p>{s.confirmReset}</p>
      </ConfirmDialog>
    ) : confirming === 'recover' ? (
      <ConfirmDialog
        title={s.confirmRecoverTitle}
        tone="primary"
        confirmLabel={s.confirmRecoverYes}
        cancelLabel={s.back}
        onConfirm={confirm}
        onCancel={() => setConfirming(null)}
      >
        <p>{s.confirmRecover(recoverable?.cards ?? 0, recoverable?.dropped ?? 0)}</p>
      </ConfirmDialog>
    ) : null

  if (collapsed) {
    return (
      <>
        {frame(
          'banner banner--compact',
          <>
            <p>
              <strong>{s.memoryTitle}.</strong> {title}.
            </p>
            <button type="button" className="btn btn--small" onClick={() => setCollapsed(false)}>
              {s.options}
            </button>
          </>,
        )}
      </>
    )
  }

  return (
    <>
      {frame(
        'banner banner--warn',
        <>
          <p className="banner-title">{title}</p>
          <p>{text}</p>
          {failed && <p className="form-error">{s.actionFailed}</p>}
          <div className="banner-actions">
            <button type="button" className="btn btn--small btn--primary" onClick={() => setCollapsed(true)}>
              {s.continueWithout}
            </button>
            <button type="button" className="btn btn--small" onClick={downloadStoredData}>
              {s.download}
            </button>
            {recoverable && recoverable.cards > 0 && (
              <button type="button" className="btn btn--small" onClick={() => setConfirming('recover')}>
                {s.recover(recoverable.cards)}
              </button>
            )}
            <button type="button" className="btn btn--small btn--danger" onClick={() => setConfirming('reset')}>
              {s.reset}
            </button>
          </div>
        </>,
        'alert',
      )}
      {dialog}
    </>
  )
}
