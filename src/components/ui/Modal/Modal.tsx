import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { clsx as cx } from 'clsx'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../../hooks/useFocusTrap'
import { IconButton } from '../IconButton/IconButton'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Use when the dialog's visible content already provides an accessible name (e.g. a search input). */
  labelledBy?: string
  /** Accessible name for dialogs with no visible `title`, such as the command palette. */
  ariaLabel?: string
  hideCloseButton?: boolean
  className?: string
  bodyClassName?: string
}

/** Accessible modal shell: focus trap, Escape to close, backdrop dismiss, portalled to `document.body`. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  labelledBy,
  ariaLabel,
  hideCloseButton = false,
  className,
  bodyClassName,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useFocusTrap(dialogRef, open)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.removeProperty('overflow')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={!labelledBy && !title ? ariaLabel : undefined}
        aria-labelledby={labelledBy ?? (title ? titleId : undefined)}
        className={cx(styles.dialog, styles[size], className)}
      >
        {(title || !hideCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            )}
            {!hideCloseButton && (
              <IconButton label="Close" className={styles.close} onClick={onClose}>
                <X size={16} />
              </IconButton>
            )}
          </div>
        )}
        <div className={cx(styles.body, bodyClassName)}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
