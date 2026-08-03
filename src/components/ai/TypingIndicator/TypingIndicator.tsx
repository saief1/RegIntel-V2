import styles from './TypingIndicator.module.css'

export function TypingIndicator({ label = 'Assistant is typing' }: { label?: string }) {
  return (
    <div className={styles.root} role="status" aria-label={label}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  )
}
