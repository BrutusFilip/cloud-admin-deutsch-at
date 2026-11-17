import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel: string
  /** 'danger' for choices that delete or replace data; red is used for nothing else. */
  tone?: 'danger' | 'primary'
  /**
   * Where focus starts. A short question starts on the safe choice; a long summary
   * starts on its title so the learner reads it from the top.
   */
  initialFocus?: 'cancel' | 'title'
  /** Read out with the title when the dialog opens; off for long summaries. */
  describe?: boolean
  /** A stable title id when other code refers to it. */
  titleId?: string
  /** Harmless further choices (e.g. "download a backup first"), placed after the two main ones. */
  extra?: ReactNode
  onConfirm: () => void
  onCancel: () => void
  /** Where focus returns after closing, when that is not simply the control that opened the dialog. */
  returnFocus?: () => HTMLElement | null
  /** Where focus goes if the control that opened the dialog is gone after closing. */
  fallbackFocus?: () => HTMLElement | null
  className?: string
}

/**
 * A modal confirmation built on the native `<dialog>` element. Mount it to open it
 * and unmount it to close it. While open, the rest of the page is inert (focus and
 * the screen reader stay inside); Esc means "cancel". On closing, focus returns to
 * `returnFocus` if given, otherwise to the control that opened it, or to
 * `fallbackFocus` when that control is gone.
 */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  initialFocus = 'cancel',
  describe = true,
  titleId,
  extra,
  onConfirm,
  onCancel,
  returnFocus,
  fallbackFocus,
  className,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const closing = useRef(false)
  const used = useRef(false)
  const autoId = useId()
  const headingId = titleId ?? `${autoId}-title`
  const bodyId = `${autoId}-body`
  // The control that had focus when the dialog was requested (read during the first render).
  const [opener] = useState<HTMLElement | null>(() => {
    const active = typeof document === 'undefined' ? null : document.activeElement
    return active instanceof HTMLElement && active !== document.body ? active : null
  })
  const fallback = useRef(fallbackFocus)
  fallback.current = fallbackFocus
  const preferred = useRef(returnFocus)
  preferred.current = returnFocus

  useLayoutEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    closing.current = false
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    }
    ;(initialFocus === 'title' ? titleRef.current : cancelRef.current)?.focus()
    return () => {
      closing.current = true
      if (dialog.open) {
        if (typeof dialog.close === 'function') dialog.close()
        else dialog.removeAttribute('open')
      }
      // Once the dialog has left the page: back to where the learner was.
      window.requestAnimationFrame(() => {
        if (document.querySelector('dialog[open]')) return
        const wanted = preferred.current?.()
        const target =
          wanted && wanted.isConnected ? wanted : opener && opener.isConnected ? opener : (fallback.current?.() ?? document.getElementById('main'))
        if (target && document.activeElement !== target) target.focus()
      })
    }
    // Runs once per opening: the dialog is mounted to open and unmounted to close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const once = (action: () => void) => () => {
    if (used.current) return
    used.current = true
    action()
  }

  return (
    <dialog
      ref={ref}
      className={className ? `dialog ${className}` : 'dialog'}
      aria-labelledby={headingId}
      aria-describedby={describe ? bodyId : undefined}
      onCancel={(event) => {
        // Esc: the same as the cancel button; the parent unmounts the dialog.
        event.preventDefault()
        once(onCancel)()
      }}
      onClose={() => {
        // Closed by the browser itself (not by unmounting, and not reopened since): treat it as cancel.
        if (!closing.current && !ref.current?.open) once(onCancel)()
      }}
    >
      <h2 className="dialog-title" id={headingId} ref={titleRef} tabIndex={-1}>
        {title}
      </h2>
      <div className="dialog-body" id={bodyId}>
        {children}
      </div>
      <div className="dialog-actions">
        <button type="button" className={tone === 'danger' ? 'btn btn--danger' : 'btn btn--primary'} onClick={once(onConfirm)}>
          {confirmLabel}
        </button>
        <button type="button" className="btn" ref={cancelRef} onClick={once(onCancel)}>
          {cancelLabel}
        </button>
        {extra}
      </div>
    </dialog>
  )
}
