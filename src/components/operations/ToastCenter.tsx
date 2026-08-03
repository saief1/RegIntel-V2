import { useOperations } from '../../hooks/useOperations'
import { Button } from '../ui/Button/Button'
import styles from '../../pages/operations/operations.module.css'

export function ToastCenter() {
  const { toasts, dismissToast } = useOperations()
  if (toasts.length === 0) return null

  return (
    <div className={styles.toastRegion} aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast} data-tone={toast.tone} role="status">
          <header>
            <strong>{toast.title}</strong>
            <Button size="sm" variant="ghost" onClick={() => dismissToast(toast.id)} aria-label={`Dismiss ${toast.title}`}>
              Dismiss
            </Button>
          </header>
          {toast.body && <p>{toast.body}</p>}
        </div>
      ))}
    </div>
  )
}
