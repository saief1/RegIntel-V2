import { Sparkles } from 'lucide-react'
import styles from './ThinkingIndicator.module.css'

export function ThinkingIndicator() {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <Sparkles size={14} aria-hidden="true" />
      <span>Thinking…</span>
    </div>
  )
}
